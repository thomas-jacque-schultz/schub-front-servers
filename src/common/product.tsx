import { createContext, type ReactNode, useContext } from "react";

export type ProductName = "Schub" | "PremadeLab";

const ProductContext = createContext<ProductName>("Schub");

/** Le nom du produit affiché là où un texte commun le cite (la mention Riot, par exemple). */
export function ProductProvider({
  name,
  children,
}: {
  name: ProductName;
  children: ReactNode;
}) {
  return (
    <ProductContext.Provider value={name}>{children}</ProductContext.Provider>
  );
}

export const useProductName = (): ProductName => useContext(ProductContext);
