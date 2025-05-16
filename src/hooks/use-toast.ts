
import { useState, useEffect, useRef, useReducer } from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
import { toast as sonnerToast } from "sonner";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function generateId() {
  return (++count).toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: string;
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        if (toastTimeouts.has(toastId)) {
          clearTimeout(toastTimeouts.get(toastId));
          toastTimeouts.delete(toastId);
        }
      } else {
        for (const [id, timeout] of toastTimeouts.entries()) {
          clearTimeout(timeout);
          toastTimeouts.delete(id);
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

export function useToast() {
  const [state, dispatch] = useReducer(reducer, { toasts: [] });
  const toastRef = useRef<State["toasts"]>([]);

  useEffect(() => {
    toastRef.current = state.toasts;
  }, [state.toasts]);

  const toast = (props: Omit<ToasterToast, "id"> & { id?: string }) => {
    const id = props.id || generateId();
    const newToast = { id, ...props } as ToasterToast;

    dispatch({ type: "ADD_TOAST", toast: newToast });

    return id;
  };

  const update = (props: Partial<ToasterToast>) => {
    if (!props.id) {
      return;
    }

    dispatch({ type: "UPDATE_TOAST", toast: props });
  };

  const dismiss = (toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId });
  };

  const remove = (toastId?: string) => {
    dispatch({ type: "REMOVE_TOAST", toastId });
  };

  return {
    toasts: state.toasts,
    toast,
    dismiss,
    remove,
    update,
  };
}

export const toast = sonnerToast;
