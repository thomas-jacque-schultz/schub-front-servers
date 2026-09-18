import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button } from "../design-system";

interface AdminActionBarProps {
  onCreateServer: () => void;
}

function AdminActionBar({ onCreateServer }: AdminActionBarProps) {
  const { t } = useTranslation("servers");

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              {t("admin.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("admin.description")}
            </Typography>
          </Stack>
          <Button size="large" onClick={onCreateServer}>
            {t("admin.createServer")}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default AdminActionBar;
