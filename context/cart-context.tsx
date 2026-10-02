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
import {
  guestCartRepository,
  type GuestCartLine,
} from "@/lib/cart/guest-cart-repository";

type OperationStatus = "idle" | "loading" | "success" | "error";

type CartState = {
  items: GuestCartLine[];
  status: OperationStatus;
  error?: string;
};

type CartAction =
  | { type: "LOAD_SUCCEEDED"; items: GuestCartLine[] }
  | { type: "OPERATION_STARTED" }
  | { type: "OPERATION_SUCCEEDED"; items: GuestCartLine[] }
  | { type: "OPERATION_FAILED"; message: string };

type CartContextValue = CartState & {
  addLine: (variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeLine: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const initialState: CartState = { items: [], status: "loading" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD_SUCCEEDED":
      return { items: action.items, status: "success" };
    case "OPERATION_STARTED":
      return { ...state, status: "loading", error: undefined };
    case "OPERATION_SUCCEEDED":
      return { items: action.items, status: "success" };
    case "OPERATION_FAILED":
      return { ...state, status: "error", error: action.message };
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    void guestCartRepository
      .load()
      .then((items) => {
        if (active) dispatch({ type: "LOAD_SUCCEEDED", items });
      })
      .catch((error: unknown) => {
        if (active) {
          dispatch({
            type: "OPERATION_FAILED",
            message: error instanceof Error ? error.message : "Could not read the saved bag.",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const mutate = useCallback(
    (operation: (items: GuestCartLine[]) => GuestCartLine[]) => {
      const task = queueRef.current.then(async () => {
        dispatch({ type: "OPERATION_STARTED" });
        try {
          const current = await guestCartRepository.load();
          const next = operation(current);
          await guestCartRepository.save(next);
          dispatch({ type: "OPERATION_SUCCEEDED", items: next });
        } catch (error) {
          dispatch({
            type: "OPERATION_FAILED",
            message: error instanceof Error ? error.message : "The bag could not be updated.",
          });
        }
      });
      queueRef.current = task.catch(() => undefined);
      return task;
    },
    [],
  );

  const addLine = useCallback(
    (variantId: string, quantity = 1) =>
      mutate((items) => {
        const current = items.find((item) => item.variantId === variantId);
        if (current) {
          return items.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [...items, { variantId, quantity }];
      }),
    [mutate],
  );

  const setQuantity = useCallback(
    (variantId: string, quantity: number) =>
      mutate((items) =>
        items
          .map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0),
      ),
    [mutate],
  );

  const removeLine = useCallback(
    (variantId: string) => mutate((items) => items.filter((item) => item.variantId !== variantId)),
    [mutate],
  );

  const clearCart = useCallback(() => mutate(() => []), [mutate]);

  const value = useMemo(
    () => ({ ...state, addLine, setQuantity, removeLine, clearCart }),
    [state, addLine, setQuantity, removeLine, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider.");
  return context;
}
