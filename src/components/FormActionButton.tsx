import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Button } from "../design-system";
import type { GameServerFormMode } from "../types/server";

interface FormActionButtonProps {
  mode: GameServerFormMode;
  isSubmitting?: boolean;
  onBack?: () => void;
}

function FormActionButton({ mode, isSubmitting = false, onBack }: FormActionButtonProps) {
  const { t } = useTranslation();

  const label =
    mode === "creation" ? t("actions.create") : mode === "edition" ? t("actions.save") : t("actions.back");

  return (
    <Box sx={{ position: "fixed", right: 24, bottom: 24, zIndex: 1300 }}>
      <Button
        type={mode === "visualisation" ? "button" : "submit"}
        variant={mode === "visualisation" ? "secondary" : "primary"}
        size="large"
        loading={isSubmitting}
        onClick={mode === "visualisation" ? onBack : undefined}
      >
        {label}
      </Button>
    </Box>
  );
}

export default FormActionButton;
