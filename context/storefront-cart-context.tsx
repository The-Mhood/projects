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
import { previewCartRepository, type PreviewCartLine } from "@/lib/demo/preview-cart-repository";

type PreviewCartState = {
  items: PreviewCartLine[];
  status: "loading" | "success" | "error";
  error?: string;
  drawerOpen: boolean;
};

type PreviewCartAction =
  | { type: "LOAD_SUCCEEDED"; items: PreviewCartLine[] }
  | { type: "OPERATION_STARTED" }
  | { type: "OPERATION_SUCCEEDED"; items: PreviewCartLine[] }
  | { type: "OPERATION_FAILED"; message: string }
  | { type: "DRAWER_OPENED" }
  | { type: "DRAWER_CLOSED" };

type PreviewCartContextValue = PreviewCartState & {
  addLine: (variantId: string, quantity?: number) => Promise<boolean>;
  setQuantity: (variantId: string, quantity: number) => Promise<boolean>;
  removeLine: (variantId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  openCart: () => void;
  closeCart: () => void;
};

const initialState: PreviewCartState = { items: [], status: "loading", drawerOpen: false };

function reducer(state: PreviewCartState, action: PreviewCartAction): PreviewCartState {
  switch (action.type) {
    case "LOAD_SUCCEEDED":
      return { ...state, items: action.items, status: "success", error: undefined };
    case "OPERATION_STARTED":
      return { ...state, status: "loading", error: undefined };
    case "OPERATION_SUCCEEDED":
      return { ...state, items: action.items, status: "success", error: undefined };
    case "OPERATION_FAILED":
      return { ...state, status: "error", error: action.message };
    case "DRAWER_OPENED":
      return { ...state, drawerOpen: true };
    case "DRAWER_CLOSED":
      return { ...state, drawerOpen: false };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

const StorefrontCartContext = createContext<PreviewCartContextValue | null>(null);

export function StorefrontCartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const queueRef = useRef<Promise<boolean>>(Promise.resolve(true));

  useEffect(() => {
    let active = true;
    void previewCartRepository
      .load()
      .then((items) => {
        if (active) dispatch({ type: "LOAD_SUCCEEDED", items });
      })
      .catch((error: unknown) => {
        if (active) {
          dispatch({
            type: "OPERATION_FAILED",
            message: error instanceof Error ? error.message : "Could not read the preview bag.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const mutate = useCallback(
    (operation: (items: PreviewCartLine[]) => PreviewCartLine[]) => {
      const task = queueRef.current.then(async () => {
        dispatch({ type: "OPERATION_STARTED" });
        try {
          const current = await previewCartRepository.load();
          const next = operation(current);
          await previewCartRepository.save(next);
          dispatch({ type: "OPERATION_SUCCEEDED", items: next });
          return true;
        } catch (error) {
          dispatch({
            type: "OPERATION_FAILED",
            message: error instanceof Error ? error.message : "The preview bag could not be updated.",
          });
          return false;
        }
      });
      queueRef.current = task.catch(() => false);
      return task;
    },
    [],
  );

  const addLine = useCallback(
    (variantId: string, quantity = 1) =>
      mutate((items) => {
        const current = items.find((item) => item.variantId === variantId);
        if (current) {
          return items.map((item) => item.variantId === variantId
            ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
            : item);
        }
        return [...items, { variantId, quantity }];
      }),
    [mutate],
  );

  const setQuantity = useCallback(
    (variantId: string, quantity: number) =>
      mutate((items) => items
        .map((item) => item.variantId === variantId ? { ...item, quantity } : item)
        .filter((item) => item.quantity > 0)),
    [mutate],
  );

  const removeLine = useCallback(
    (variantId: string) => mutate((items) => items.filter((item) => item.variantId !== variantId)),
    [mutate],
  );

  const clearCart = useCallback(() => mutate(() => []), [mutate]);
  const openCart = useCallback(() => dispatch({ type: "DRAWER_OPENED" }), []);
  const closeCart = useCallback(() => dispatch({ type: "DRAWER_CLOSED" }), []);

  const value = useMemo(
    () => ({ ...state, addLine, setQuantity, removeLine, clearCart, openCart, closeCart }),
    [state, addLine, setQuantity, removeLine, clearCart, openCart, closeCart],
  );

  return <StorefrontCartContext.Provider value={value}>{children}</StorefrontCartContext.Provider>;
}

export function useStorefrontCart() {
  const context = useContext(StorefrontCartContext);
  if (!context) throw new Error("useStorefrontCart must be used within StorefrontCartProvider.");
  return context;
}
