const access_token = 'accessToken';

export const authService = {
  getToken() {
    return localStorage.getItem(access_token);
  },
  setToken(token: string) {
    localStorage.setItem(access_token, token);
  },
  removeToken() {
    localStorage.removeItem(access_token);
  },
};
