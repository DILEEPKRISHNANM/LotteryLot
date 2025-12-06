/**
 * Toast Utilities for the application
 */
import toast from "react-hot-toast";

export const toastSuccess = (message: string) => {
  toast.success(message);
};

export const toastError = (message: string) => {
  toast.error(message);
};

export const toastWarning = (message: string) => {
  toast(message, {
    icon: "⚠️",
    style: {
      background: "#fef3c7",
      color: "#92400e",
    },
  });
};

export const toastInfo = (message: string) => {
  toast(message, {
    icon: "ℹ️",
    style: {
      background: "#dbeafe",
      color: "#1e40af",
    },
  });
};

export const toastLoading = (message: string) => {
  return toast.loading(message);
};
