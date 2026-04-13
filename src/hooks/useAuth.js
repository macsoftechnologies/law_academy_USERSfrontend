export function useAuth() {
  const token  = localStorage.getItem('token');
  const user   = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  return { token, user, isAuthenticated: !!token };
}
