import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRolesApi } from "../../api/rolesApi";
import { assignUserRoleApi, getUsersApi } from "../../api/usersApi";
import {
  Alert,
  Avatar,
  Button,
  Card,
  DataTable,
  type DataTableColumn,
  Dialog,
  PageHeader,
  ProgressBar,
  SelectField,
  Stack,
  Text,
  Toast,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { useAuthStore } from "../../stores/authStore";
import { OWNER_ROLE_NAME, RESERVED_PERMISSION } from "../../types/permission";
import { riotAccountOf, userLabelOf, type RoleDto, type UserDto } from "../../types/user";

function UsersPage() {
  const { t } = useTranslation("users");
  const { formatDateTime } = useLocaleFormat();
  const { profile, permissions, can } = useAuthStore();

  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [target, setTarget] = useState<UserDto | null>(null);
  const [chosenRoleId, setChosenRoleId] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");

  const canAssign = can("USER_ROLE_ASSIGN");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [loadedUsers, loadedRoles] = await Promise.all([getUsersApi(), getRolesApi()]);
      setUsers(loadedUsers);
      setRoles(loadedRoles);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const ownerRole = useMemo(
    () => roles.find((role) => role.name === OWNER_ROLE_NAME) ?? null,
    [roles],
  );

  const ownerCount = useMemo(
    () => (ownerRole ? users.filter((user) => user.roleId === ownerRole.id).length : 0),
    [ownerRole, users],
  );

  const assignableRoles = useMemo(
    () =>
      roles.filter(
        (role) =>
          role.name !== OWNER_ROLE_NAME &&
          !role.permissions.includes(RESERVED_PERMISSION) &&
          role.permissions.every((permission) => permissions.includes(permission)),
      ),
    [roles, permissions],
  );

  const blockedReason = useCallback(
    (user: UserDto): string | null => {
      if (profile && user.discordId === profile.actorId) {
        return t("guards.self");
      }
      if (ownerRole && user.roleId === ownerRole.id && ownerCount <= 1) {
        return t("guards.lastOwner", { role: OWNER_ROLE_NAME });
      }
      if (assignableRoles.length === 0) {
        return t("guards.noAssignableRole");
      }
      return null;
    },
    [assignableRoles.length, ownerCount, ownerRole, profile, t],
  );

  const onConfirm = async () => {
    if (!target || !chosenRoleId) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const updated = await assignUserRoleApi(target.id, chosenRoleId);
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      setToast(
        t("feedback.roleAssigned", {
          user: userLabelOf(target),
          role: updated.roleName ?? t("noRole"),
        }),
      );
      setTarget(null);
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : t("feedback.roleFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Array<DataTableColumn<UserDto>> = [
    {
      key: "account",
      header: t("table.account"),
      render: (user) => (
        <Stack direction="row" spacing={1.5} align="center">
          <Avatar src={user.avatarUrl} name={userLabelOf(user)} size="small" />
          <Text>
            {userLabelOf(user)}
            {profile && user.discordId === profile.actorId ? ` (${t("you")})` : ""}
          </Text>
        </Stack>
      ),
    },
    {
      key: "role",
      header: t("table.role"),
      render: (user) => <Text tone="secondary">{user.roleName ?? t("noRole")}</Text>,
    },
    {
      key: "riot",
      header: t("table.riot"),
      render: (user) => {
        const riot = riotAccountOf(user);
        return riot ? <Text>{riot}</Text> : <Text tone="disabled">{t("riotNone")}</Text>;
      },
    },
    {
      key: "lastLogin",
      header: t("table.lastLogin"),
      render: (user) =>
        user.lastLoginAt ? (
          <Text variant="caption" tone="secondary">
            {formatDateTime(new Date(user.lastLoginAt))}
          </Text>
        ) : (
          <Text variant="caption" tone="disabled">
            {t("never")}
          </Text>
        ),
    },
  ];

  if (canAssign) {
    columns.push({
      key: "actions",
      header: t("table.actions"),
      align: "right",
      width: 220,
      render: (user) => {
        const reason = blockedReason(user);
        if (reason) {
          return (
            <Text variant="caption" tone="disabled">
              {reason}
            </Text>
          );
        }
        return (
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setTarget(user);
              setChosenRoleId(user.roleId ?? "");
            }}
          >
            {t("changeRole")}
          </Button>
        );
      },
    });
  }

  return (
    <Stack spacing={3}>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      {error && <Alert severity="error">{error}</Alert>}
      {isLoading && <ProgressBar label={t("title")} />}

      {!isLoading && (
        <Card disablePadding>
          <DataTable
            columns={columns}
            rows={users}
            rowKey={(user) => user.id}
            caption={t("table.caption")}
            emptyTitle={t("emptyTitle")}
            emptyDescription={t("emptyDescription")}
          />
        </Card>
      )}

      <Dialog
        open={Boolean(target)}
        title={t("dialog.title", { user: target ? userLabelOf(target) : "" })}
        description={t("dialog.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("dialog.confirm")}
        confirmDisabled={!chosenRoleId || chosenRoleId === target?.roleId}
        confirmLoading={isSaving}
        onClose={() => setTarget(null)}
        onConfirm={onConfirm}
      >
        <SelectField
          label={t("dialog.field")}
          value={chosenRoleId}
          onChange={setChosenRoleId}
          options={assignableRoles.map((role) => ({ value: role.id, label: role.name }))}
          helperText={t("dialog.helper")}
        />
      </Dialog>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </Stack>
  );
}

export default UsersPage;
