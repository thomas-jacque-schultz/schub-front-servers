// Un flux d'événements sans état React : des morceaux arrivés dans le même rendu ne s'écrasent pas.
export class Flux<T> {
  private readonly abonnes = new Set<(valeur: T) => void>();

  abonne(rappel: (valeur: T) => void): () => void {
    this.abonnes.add(rappel);
    return () => this.abonnes.delete(rappel);
  }

  emet(valeur: T) {
    this.abonnes.forEach((rappel) => rappel(valeur));
  }
}
