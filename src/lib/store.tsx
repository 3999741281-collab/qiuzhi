import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BoardState, Job, Resume, Settings, Todo } from "../types";
import { DEV_OTP } from "./supabase";
import { scanDeadlines, requestNotifyPermission } from "./notify";
import { seedBoard } from "./seed";

const SESSION_KEY = "jobboard:session-phone";

function storageKey(phone: string) {
  return `jobboard:data:${phone}`;
}

function profileKey(phone: string) {
  return `jobboard:profile:${phone}`;
}

function load(phone: string): BoardState {
  const board = seedBoard(phone);
  try {
    const raw = localStorage.getItem(profileKey(phone));
    if (!raw) return board;
    const p = JSON.parse(raw) as { name?: string; authorizedChannels?: BoardState["authorizedChannels"] };
    return {
      ...board,
      displayName: p.name || board.displayName,
      authorizedChannels: p.authorizedChannels ?? board.authorizedChannels,
    };
  } catch {
    return board;
  }
}

function save(state: BoardState) {
  localStorage.setItem(storageKey(state.phone), JSON.stringify(state));
  localStorage.setItem(
    profileKey(state.phone),
    JSON.stringify({ name: state.displayName, authorizedChannels: state.authorizedChannels }),
  );
}

interface StoreValue {
  phone: string | null;
  state: BoardState | null;
  login: (phone: string, otp: string, name: string) => Promise<void>;
  logout: () => void;
  patch: (fn: (prev: BoardState) => BoardState) => void;
  upsertJob: (job: Job) => void;
  removeJob: (id: string) => void;
  upsertResume: (resume: Resume) => void;
  removeResume: (id: string) => void;
  upsertTodo: (todo: Todo) => void;
  removeTodo: (id: string) => void;
  setSettings: (s: Partial<Settings>) => void;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [state, setState] = useState<BoardState | null>(() =>
    localStorage.getItem(SESSION_KEY) ? load(localStorage.getItem(SESSION_KEY) as string) : null,
  );

  useEffect(() => {
    if (state) save(state);
  }, [state]);

  useEffect(() => {
    if (!state?.settings.notifyEnabled) return;
    requestNotifyPermission();
    scanDeadlines(state.jobs);
  }, [state]);

  const login = useCallback(async (p: string, otp: string, name: string) => {
    const phone = p.replace(/\s/g, "");
    const displayName = name.trim();
    if (!displayName) {
      throw new Error("请填写称呼");
    }
    if (!/^1\d{10}$/.test(phone)) {
      throw new Error("请输入 11 位大陆手机号");
    }
    if (otp !== DEV_OTP) {
      throw new Error("验证码不正确");
    }
    localStorage.setItem(SESSION_KEY, phone);
    setPhone(phone);
    const board = load(phone);
    setState({ ...board, displayName, phone });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setPhone(null);
    setState(null);
  }, []);

  const patch = useCallback((fn: (prev: BoardState) => BoardState) => {
    setState((prev) => {
      if (!prev) return prev;
      return fn(prev);
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      phone,
      state,
      login,
      logout,
      patch,
      upsertJob: (job) =>
        patch((s) => {
          const i = s.jobs.findIndex((j) => j.id === job.id);
          const jobs = [...s.jobs];
          if (i >= 0) jobs[i] = job;
          else jobs.unshift(job);
          return { ...s, jobs };
        }),
      removeJob: (id) =>
        patch((s) => ({
          ...s,
          jobs: s.jobs.filter((j) => j.id !== id),
          todos: s.todos.filter((t) => t.jobId !== id),
        })),
      upsertResume: (resume) =>
        patch((s) => {
          const i = s.resumes.findIndex((r) => r.id === resume.id);
          const resumes = [...s.resumes];
          if (i >= 0) resumes[i] = resume;
          else resumes.unshift(resume);
          return { ...s, resumes };
        }),
      removeResume: (id) =>
        patch((s) => ({
          ...s,
          resumes: s.resumes.filter((r) => r.id !== id),
          jobs: s.jobs.map((j) => (j.resumeId === id ? { ...j, resumeId: null } : j)),
        })),
      upsertTodo: (todo) =>
        patch((s) => {
          const i = s.todos.findIndex((t) => t.id === todo.id);
          const todos = [...s.todos];
          if (i >= 0) todos[i] = todo;
          else todos.unshift(todo);
          return { ...s, todos };
        }),
      removeTodo: (id) => patch((s) => ({ ...s, todos: s.todos.filter((t) => t.id !== id) })),
      setSettings: (next) => patch((s) => ({ ...s, settings: { ...s.settings, ...next } })),
    }),
    [phone, state, login, logout, patch],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore 必须在 StoreProvider 内");
  return v;
}
