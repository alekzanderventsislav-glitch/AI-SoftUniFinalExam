import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.SESSION));
  const [users, setUsers] = useState(() => loadFromStorage(STORAGE_KEYS.USERS, []));

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    if (user) {
      saveToStorage(STORAGE_KEYS.SESSION, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }, [user]);

  const register = useCallback(({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!name.trim() || !normalizedEmail || !password) {
      return { success: false, message: 'Моля, попълнете всички полета.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Паролата трябва да е поне 6 символа.' };
    }

    if (users.some((u) => u.email === normalizedEmail)) {
      return { success: false, message: 'Вече съществува акаунт с този имейл.' };
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email });

    return { success: true, message: 'Регистрацията е успешна!' };
  }, [users]);

  const login = useCallback(({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find(
      (u) => u.email === normalizedEmail && u.password === password
    );

    if (!found) {
      return { success: false, message: 'Невалиден имейл или парола.' };
    }

    setUser({ id: found.id, name: found.name, email: found.email });
    return { success: true, message: 'Успешен вход!' };
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth трябва да се използва в AuthProvider');
  }
  return context;
}
