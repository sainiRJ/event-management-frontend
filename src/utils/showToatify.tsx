// utils/showToast.ts
import React from "react";
import {Message, toaster} from "rsuite";

interface ToastOptions {
  successMessage?: string;
  errorMessage?: string;
  response: any;
}

export const showToast = ({ response, successMessage, errorMessage }: ToastOptions) => {
  if (response?.meta?.requestStatus === 'fulfilled') {
	toaster.push(<Message type="success">{successMessage}</Message>);

  } else if (response?.meta?.requestStatus === 'rejected') {
    const payload = response?.payload;

    const errMsg =
      payload?.message?.error?.validationErrors?.body?.message ||
      payload?.message?.error?.message ||
      errorMessage ||
      'An unknown error occurred';
		toaster.push(<Message type="success">{errMsg}</Message>);

  }
};
