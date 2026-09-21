import { Card, EmptyState } from "../../design-system";

export interface ComingSoonPanelProps {
  title: string;
  description: string;
}

/**
 * Un panneau annoncé, pas encore servi.
 *
 * <p><strong>Il n'affiche aucune donnée, et surtout aucune donnée simulée.</strong> Les panneaux
 * « joueurs » et « pool de champions » dépendent de l'ingestion Riot, en cours dans le cœur :
 * une statistique inventée en attendant serait lue comme vraie, et personne ne saurait plus,
 * une fois le branchement fait, laquelle des deux valeurs croire.</p>
 *
 * <p>L'onglet existe quand même — le masquer effacerait jusqu'à l'existence de la
 * fonctionnalité, là où le laisser vide dit ce qui vient et ce qui manque.</p>
 */
export function ComingSoonPanel({ title, description }: ComingSoonPanelProps) {
  return (
    <Card>
      <EmptyState title={title} description={description} />
    </Card>
  );
}
