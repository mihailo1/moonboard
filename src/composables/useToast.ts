export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', opts: {duration?: number} = {}) {
  const detail = { message, type, duration: opts.duration ?? 4000 };
  window.dispatchEvent(new CustomEvent('mb-toast', { detail }));
}

export default showToast;
