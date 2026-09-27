import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  LocalizedRoot,
  ProgressBar,
  Stack,
  useAuthStore,
  type AppLanguage,
} from "../common";
import { PremadeLabLayout } from "./components/PremadeLabLayout";
import { PremadeLabRoutes } from "./routes";

function Waiting({ label }: { label: string }) {
  return (
    <Stack spacing={2}>
      <Card>
        <ProgressBar label={label} />
      </Card>
    </Stack>
  );
}

function LocalizedApp() {
  const { t } = useTranslation();
  const { isCheckingSession } = useAuthStore();

  return (
    <PremadeLabLayout>
      {isCheckingSession ? (
        <Waiting label={t("session.checking", { ns: "auth" })} />
      ) : (
        <Suspense fallback={<Waiting label={t("loading")} />}>
          <PremadeLabRoutes />
        </Suspense>
      )}
    </PremadeLabLayout>
  );
}

function LanguageBranch({ language }: { language: AppLanguage }) {
  return (
    <LocalizedRoot language={language}>
      <LocalizedApp />
    </LocalizedRoot>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/en/*" element={<LanguageBranch language="en" />} />
      <Route path="/*" element={<LanguageBranch language="fr" />} />
    </Routes>
  );
}

export default App;
