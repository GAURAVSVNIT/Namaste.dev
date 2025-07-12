import { useState, useEffect } from "react";

export function useToast() {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); // Auto-hide after 3 seconds
  };

  return { toastMessage, showToast };
}

export const toast = {
  success: (message) => console.log(`Success: ${message}`),
  error: (message) => console.error(`Error: ${message}`),
  info: (message) => console.info(`Info: ${message}`),
};
