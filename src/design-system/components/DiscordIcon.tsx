import SvgIcon from "@mui/material/SvgIcon";

export interface DiscordIconProps {
  /** Suit la taille de texte de l'élément porteur — un bouton, le plus souvent. */
  fontSize?: "small" | "medium" | "large" | "inherit";
}

/**
 * La marque Discord, en icône.
 *
 * <p><strong>Pourquoi elle vit ici</strong> : `@mui/icons-material` ne fournit aucune icône de
 * marque, et le design system est la seule porte vers l'habillage (règle du dépôt). Un écran qui
 * poserait ce `path` lui-même remettrait du dessin dans un écran — exactement ce que la règle
 * ferme.</p>
 *
 * <p>Elle est <strong>décorative</strong> : `aria-hidden` par construction, via `SvgIcon`. Le
 * bouton qui la porte dit « Se connecter avec Discord » en toutes lettres, et c'est ce libellé
 * qu'un lecteur d'écran doit annoncer — pas un second « Discord » collé devant.</p>
 *
 * <p>Elle n'impose pas la couleur de marque : elle hérite de `currentColor`, donc de l'intention
 * du bouton. Peindre le blurple ici obligerait à le repeindre pour chaque variante de bouton, et
 * ferait entrer une couleur de marque tierce dans une palette qui n'est pas la sienne.</p>
 */
export function DiscordIcon({ fontSize = "medium" }: DiscordIconProps) {
  return (
    <SvgIcon fontSize={fontSize} viewBox="0 0 24 24">
      <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </SvgIcon>
  );
}
