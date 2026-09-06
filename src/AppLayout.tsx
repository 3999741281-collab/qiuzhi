import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useStore } from "./lib/store";
import { DemoNotice } from "./components/DemoNotice";
import { TourOverlay } from "./components/TourOverlay";
import { dailyLine } from "./lib/quotes";
import { useOptionalTour } from "./lib/tour";

export function AppLayout() {
  const { phone } = useStore();
  const tour = useOptionalTour();
  if (!phone) return <Navigate to="/login" replace />;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="vinyl" />
          <div className="brand-copy">
            <h1>求职看板</h1>
            <p className="daily-line" data-tour="quote">
              {dailyLine()}
            </p>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            首页
          </NavLink>
          <NavLink to="/mine">我的</NavLink>
          <NavLink to="/settings">设置</NavLink>
        </nav>
      </header>
      <Outlet />
      {!tour?.active && <DemoNotice />}
      <TourOverlay />
    </div>
  );
}
