// Le client du relais (schub-together-games). Il rejoint, se reconnecte seul, et garde la connexion ouverte :
// le tunnel Cloudflare ferme un WebSocket muet au bout de 100 secondes.
export interface Joueur {
  id: string;
  name: string;
}

export type Evenement =
  | {
      type: "joined";
      room: string;
      you: string;
      leader: string | null;
      players: Joueur[];
      history: unknown[];
    }
  | { type: "presence"; leader: string | null; players: Joueur[] }
  | { type: "message"; from: string | null; data: unknown }
  | { type: "cleared"; from: string | null }
  | { type: "error"; code: string }
  | { type: "deconnecte" };

const PING_MS = 30_000;
const ATTENTE_MAX_MS = 10_000;
// Ces refus sont définitifs : on ne se reconnecte pas.
const DEFINITIFS = new Set([
  "ROOM_NOT_FOUND",
  "ROOM_FULL",
  "TOO_MANY_ROOMS",
  "RATE_LIMITED",
  "ROOM_EXPIRED",
  "REPLACED",
]);

export class Relais {
  private socket: WebSocket | null = null;
  private room: string | null;
  private arrete = false;
  private essais = 0;
  private ping: number | undefined;

  constructor(
    room: string | null,
    private readonly game: string,
    private readonly joueur: Joueur,
    private readonly ecoute: (evenement: Evenement) => void,
  ) {
    this.room = room;
    this.ouvre();
  }

  envoie(data: unknown, keep: boolean) {
    this.ecrit({ type: "send", data, keep });
  }

  efface() {
    this.ecrit({ type: "clear" });
  }

  ferme() {
    this.arrete = true;
    window.clearInterval(this.ping);
    this.socket?.close();
  }

  private ouvre() {
    const url = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`;
    const socket = new WebSocket(url);
    this.socket = socket;
    socket.onopen = () => {
      this.essais = 0;
      this.ecrit({
        type: "join",
        room: this.room,
        game: this.game,
        player: this.joueur,
      });
      this.ping = window.setInterval(
        () => this.ecrit({ type: "ping" }),
        PING_MS,
      );
    };
    socket.onmessage = (message) => {
      const evenement = JSON.parse(message.data as string) as
        Evenement | { type: "pong" };
      if (evenement.type === "pong") {
        return;
      }
      if (evenement.type === "joined") {
        this.room = evenement.room;
      }
      if (evenement.type === "error" && DEFINITIFS.has(evenement.code)) {
        this.arrete = true;
      }
      this.ecoute(evenement);
    };
    socket.onclose = () => {
      window.clearInterval(this.ping);
      if (this.arrete) {
        return;
      }
      this.ecoute({ type: "deconnecte" });
      const attente = Math.min(ATTENTE_MAX_MS, 1_000 * 2 ** this.essais++);
      window.setTimeout(() => this.ouvre(), attente);
    };
  }

  private ecrit(message: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}
