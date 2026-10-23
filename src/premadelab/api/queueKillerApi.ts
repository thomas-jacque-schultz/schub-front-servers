import { requestJson, type Schemas } from "../../common";

export type SalonDePremade = Schemas["PremadeRoomDto"];

export const signalePresenceApi = (game: string, room: string) =>
  requestJson<void>("/queue-killer/presence", {
    method: "PUT",
    body: JSON.stringify({ game, room }),
  });

// keepalive : la requête part encore quand l'onglet se ferme.
export const quitteSalonApi = (game: string, room: string) =>
  requestJson<void>(`/queue-killer/presence/${game}/${room}`, {
    method: "DELETE",
    keepalive: true,
  });

export const getSalonsDePremadeApi = () =>
  requestJson<SalonDePremade[]>("/queue-killer/premade-rooms", {
    method: "GET",
  });
