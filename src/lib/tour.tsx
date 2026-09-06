import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "./store";
import { TOUR_STEPS, type TourStep } from "./tourSteps";

function tourKey(phone: string) {
  return `jobboard:tour-done:${phone}`;
}

interface TourApi {
  active: boolean;
  index: number;
  total: number;
  step: TourStep | null;
  next: () => void;
}

const Ctx = createContext<TourApi | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const { phone, state } = useStore();
  const nav = useNavigate();
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!phone) {
      setActive(false);
      return;
    }
    if (localStorage.getItem(tourKey(phone))) {
      setActive(false);
      return;
    }
    setIndex(0);
    setActive(true);
  }, [phone]);

  const step = active ? (TOUR_STEPS[index] ?? null) : null;
  const firstJobId = state?.jobs[0]?.id;

  useEffect(() => {
    if (!step) return;
    if (step.route === "home") nav("/");
    if (step.route === "job" && firstJobId) nav(`/jobs/${firstJobId}`);
    if (step.route === "mine") nav("/mine");
  }, [step, firstJobId, nav]);

  const next = useCallback(() => {
    if (!phone) return;
    if (index >= TOUR_STEPS.length - 1) {
      localStorage.setItem(tourKey(phone), "1");
      setActive(false);
      nav("/");
      return;
    }
    setIndex((i) => i + 1);
  }, [index, phone, nav]);

  const value = useMemo(
    () => ({
      active,
      index,
      total: TOUR_STEPS.length,
      step,
      next,
    }),
    [active, index, step, next],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTour() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTour 必须在 TourProvider 内");
  return v;
}

export function useOptionalTour() {
  return useContext(Ctx);
}
