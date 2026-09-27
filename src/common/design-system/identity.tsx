import { createContext, useContext } from "react";
import { identities, type Identity } from "./tokens";

export const IdentityContext = createContext<Identity>(identities.schub);

/** Les couleurs de l'application en cours : Schub par défaut, PremadeLab sous son propre thème. */
export const useIdentity = (): Identity => useContext(IdentityContext);
