"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { wishlistRepository } from "@/lib/wishlist/wishlist-repository";

type WishlistState = {
  slugs: string[];
  status: "loading" | "success" | "error";
  error?: string;
};

type WishlistAction =
  | { type: "LOAD_SUCCEEDED"; slugs: string[] }
  | { type: "OPERATION_STARTED" }
  | { type: "OPERATION_SUCCEEDED"; slugs: string[] }
  | { type: "OPERATION_FAILED"; message: string };

type WishlistContextValue = WishlistState & {
  toggle: (slug: string) => Promise<boolean>;
  remove: (slug: string) => Promise<boolean>;
  contains: (slug: string) => boolean;
};

const initialState: WishlistState = { slugs: [], status: "loading" };

function reducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "LOAD_SUCCEEDED":
      return { slugs: action.slugs, status: "success" };
    case "OPERATION_STARTED":
      return { ...state, status: "loading", error: undefined };
    case "OPERATION_SUCCEEDED":
      return { slugs: action.slugs, status: "success" };
    case "OPERATION_FAILED":
      return { ...state, status: "error", error: action.message };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const queueRef = useRef<Promise<boolean>>(Promise.resolve(true));

  useEffect(() => {
    let active = true;
    void wishlistRepository.load()
      .then((slugs) => { if (active) dispatch({ type: "LOAD_SUCCEEDED", slugs }); })
      .catch((error: unknown) => {
        if (active) dispatch({ type: "OPERATION_FAILED", message: error instanceof Error ? error.message : "Could not read the saved list." });
      });
    return () => { active = false; };
  }, []);

  const mutate = useCallback((operation: (slugs: string[]) => string[]) => {
    const task = queueRef.current.then(async () => {
      dispatch({ type: "OPERATION_STARTED" });
      try {
        const current = await wishlistRepository.load();
        const next = operation(current);
        await wishlistRepository.save(next);
        dispatch({ type: "OPERATION_SUCCEEDED", slugs: next });
        return true;
      } catch (error) {
        dispatch({ type: "OPERATION_FAILED", message: error instanceof Error ? error.message : "The saved list could not be updated." });
        return false;
      }
    });
    queueRef.current = task.catch(() => false);
    return task;
  }, []);

  const toggle = useCallback((slug: string) => mutate((slugs) =>
    slugs.includes(slug) ? slugs.filter((item) => item !== slug) : [...slugs, slug]), [mutate]);
  const remove = useCallback((slug: string) => mutate((slugs) => slugs.filter((item) => item !== slug)), [mutate]);
  const contains = useCallback((slug: string) => state.slugs.includes(slug), [state.slugs]);

  const value = useMemo(() => ({ ...state, toggle, remove, contains }), [state, toggle, remove, contains]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider.");
  return context;
}
