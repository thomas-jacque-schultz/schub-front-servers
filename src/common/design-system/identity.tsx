import { createContext, useContext } from "react";
import { identity, type Identity } from "./tokens";

export const IdentityContext = createContext<Identity>(identity);

/** Les couleurs de l'application. */
export const useIdentity = (): Identity => useContext(IdentityContext);
