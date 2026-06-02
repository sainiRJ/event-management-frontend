import { toast } from "sonner";

interface ToastOptions {
  successMessage?: string;
  errorMessage?: string;
  response: any;
}

export const showToast = ({ response, successMessage, errorMessage }: ToastOptions) => {
  if (response?.meta?.requestStatus === 'fulfilled') {
    toast.success(successMessage || "Operation successful");
  } else if (response?.meta?.requestStatus === 'rejected') {
    const payload = response?.payload;
    const errMsg =
      payload?.message?.error?.validationErrors?.body?.message ||
      payload?.message?.error?.message ||
      errorMessage ||
      'An unknown error occurred';
    toast.error(errMsg);
  }
};
