export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL for Clerk
export const getLoginUrl = () => {
  // Clerk maneja el login automáticamente con su componente
  // Redirigir a la página de sign-in de Clerk
  return '/sign-in';
};
