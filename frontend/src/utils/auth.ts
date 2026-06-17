export const setToken = (token: string) => {
  localStorage.setItem('formbuilder_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('formbuilder_token');
};

export const removeToken = () => {
  localStorage.removeItem('formbuilder_token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
