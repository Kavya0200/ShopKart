let nextToastId = 0;

export const notifyToast = (message, type = 'success') => {
  window.dispatchEvent(new CustomEvent('shopkart:toast', {
    detail: { id: nextToastId++, message, type }
  }));
};