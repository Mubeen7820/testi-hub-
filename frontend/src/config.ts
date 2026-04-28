export const API_URL = import.meta.env.VITE_API_URL || '';

if (!API_URL && import.meta.env.PROD) {
  console.warn('VITE_API_URL is not defined in production!');
}
