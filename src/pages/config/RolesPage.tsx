import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRolesApi, updateRoleApi } from "../../api/rolesApi";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DataTable,
  type DataTableColumn,
  PageHeader,
  ProgressBar,
  Stack,
  Text,
  Toast,
} from "../../design-system";
import {
  ASSIGNABLE_PERMISSIONS,
  OWNER_ROLE_NAME,
  type Permission,
} from "../../types/permission";
import type { RoleDto } from "../../types/user";

interface PermissionRow {
  permission: Permission;
}

const sameSet = (left: Permission[], right: Permission[]): boolean =>
  left.length === right.length && left.every((permission) => right.includes(permission));

/**
 * La matrice rôles × permissions — la fenêtre réservée.
 *
 * <p>Deux absences sont le sujet même de l'écran, et elles sont volontaires :</p>
 * <ul>
 *   <li><strong>la permission d'administration des rôles n'a pas de ligne.</strong> Le cœur la
 *       retire silencieusement de tout rôle qu'on lui envoie ; une case qui se décocherait
 *       d'elle-même à l'enregistrement serait pire qu'une case absente ;</li>
 *   <li><strong>la colonne {@code OWNER} ne se coche pas.</strong> Elle reste visible — la
 *       masquer laisserait croire que ce rôle n'a aucune permission — mais l'amputer fermerait
 *       l'administration à tout le monde, définitivement.</li>
 * </ul>
 *
 * <p>C'est ce qui rend « accessible seulement à moi-même » vrai par construction plutôt que par
 * convention (décision n°2 du 18-09).</p>
 */
function RolesPage() {
  const { t } = useTranslation("roles");

  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [draft, setDraft] = useState<Record<string, Permission[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<string>("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const loaded = await getRolesApi();
      setRoles(loaded);
      setDraft(Object.fromEntries(loaded.map((role) => [role.id, [...role.permissions]])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const editableRoles = useMemo(
    () => roles.filter((role) => role.name !== OWNER_ROLE_NAME),
    [roles],
  );

  const changedRoles = useMemo(
    () =>
      editableRoles.filter((role) => !sameSet(draft[role.id] ?? [], role.permissions)),
    [draft, editableRoles],
  );

  const toggle = (role: RoleDto, permission: Permission, checked: boolean) => {
    setDraft((current) => {
      const held = current[role.id] ?? [];
      return {
        ...current,
        [role.id]: checked
          ? [...held, permission]
          : held.filter((candidate) => candidate !== permission),
      };
    });
  };

  const onSave = async () => {
    if (changedRoles.length === 0) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      // Un appel par rôle modifié : le cœur n'expose pas d'écriture de lot, et en inventer une
      // pour trois rôles coûterait plus que les trois requêtes.
      const saved = await Promise.all(
        changedRoles.map((role) =>
          updateRoleApi(role.id, {
            name: role.name,
            permissions: draft[role.id] ?? [],
          }),
        ),
      );
      setRoles((current) =>
        current.map((role) => saved.find((updated) => updated.id === role.id) ?? role),
      );
      setDraft((current) => {
        const next = { ...current };
        saved.forEach((role) => {
          next[role.id] = [...role.permissions];
        });
        return next;
      });
      setToast(t("feedback.saved"));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("feedback.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const onReset = () => {
    setDraft(Object.fromEntries(roles.map((role) => [role.id, [...role.permissions]])));
  };

  const columns: Array<DataTableColumn<PermissionRow>> = [
    {
      key: "permission",
      header: t("table.permission"),
      render: (row) => <Text variant="caption">{t(`permissions.${row.permission}`)}</Text>,
    },
    ...roles.map((role) => ({
      key: role.id,
      header: role.name,
      align: "center" as const,
      width: 120,
      render: (row: PermissionRow) => {
        const readOnly = role.name === OWNER_ROLE_NAME;
        return (
          <Checkbox
            checked={(draft[role.id] ?? []).includes(row.permission)}
            onChange={(checked) => toggle(role, row.permission, checked)}
            disabled={readOnly || isSaving}
            aria-label={`${t(`permissions.${row.permission}`)} — ${role.name}`}
          />
        );
      },
    })),
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <Button
              variant="ghost"
              onClick={onReset}
              disabled={changedRoles.length === 0 || isSaving}
            >
              {t("actions.reset")}
            </Button>
            <Button onClick={onSave} disabled={changedRoles.length === 0} loading={isSaving}>
              {t("actions.save")}
            </Button>
          </>
        }
      />

      <Alert severity="info" title={t("reserved.title")}>
        {t("reserved.body", { role: OWNER_ROLE_NAME })}
      </Alert>

      {error && <Alert severity="error">{error}</Alert>}
      {isLoading && <ProgressBar label={t("title")} />}

      {changedRoles.length > 0 && (
        <Text variant="caption" tone="secondary">
          {t("dirty", { count: changedRoles.length })}
        </Text>
      )}

      {!isLoading && (
        <Card disablePadding>
          <DataTable
            columns={columns}
            rows={ASSIGNABLE_PERMISSIONS.map((permission) => ({ permission }))}
            rowKey={(row) => row.permission}
            caption={t("table.caption")}
            emptyTitle={t("emptyTitle")}
            emptyDescription={t("emptyDescription")}
            dense
          />
        </Card>
      )}

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </Stack>
  );
}

export default RolesPage;
