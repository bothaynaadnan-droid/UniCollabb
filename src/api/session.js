import { tokenStorage } from './client';

const USER_KEY = 'uc_user';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function storeUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {}
}

export function clearSession() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (e) {}
  tokenStorage.clear();
}
