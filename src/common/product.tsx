import { createContext, type ReactNode, useContext } from "react";
import i18n from "./i18n";

export type ProductName = "Schub" | "PremadeLab";

const ProductContext = createContext<ProductName>("Schub");

/** Le nom du produit affiché là où un texte commun le cite : {{product}} dans les traductions. */
export function ProductProvider({
  name,
  children,
}: {
  name: ProductName;
  children: ReactNode;
}) {
  i18n.options.interpolation = {
    ...i18n.options.interpolation,
    defaultVariables: { product: name },
  };
  return (
    <ProductContext.Provider value={name}>{children}</ProductContext.Provider>
  );
}

export const useProductName = (): ProductName => useContext(ProductContext);
