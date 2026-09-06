import type { ReactNode } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider, useStore } from "./lib/store";
import { TourProvider } from "./lib/tour";
import { AppLayout } from "./AppLayout";
import { LoginPage } from "./pages/Login";
import { HomePage } from "./pages/Home";
import { JobDetailPage } from "./pages/JobDetail";
import { MinePage } from "./pages/Mine";
import { SettingsPage } from "./pages/Settings";

function Gate({ children }: { children: ReactNode }) {
  const { phone } = useStore();
  if (phone) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <TourProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <Gate>
                <LoginPage />
              </Gate>
            }
          />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/mine" element={<MinePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </TourProvider>
      </HashRouter>
    </StoreProvider>
  );
}
