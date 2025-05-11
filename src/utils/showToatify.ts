// utils/showToast.ts
import { useToaster } from 'rsuite';

interface ToastOptions {
  successMessage?: string;
  errorMessage?: string;
  response: any;
}

export const showToast = ({ response, successMessage, errorMessage }: ToastOptions) => {
    const toaster=useToaster()
  if (response?.meta?.requestStatus === 'fulfilled') {
    // toaster.push(<Message type="success">Login successfully</Message>);
} else if (response?.meta?.requestStatus === 'rejected') {
    const payload = response?.payload;

    const errMsg =
      payload?.message?.error?.validationErrors?.body?.message ||
      payload?.message?.error?.message ||
      errorMessage ||
      'An unknown error occurred';

    // toast.error(errMsg);
  }
};
