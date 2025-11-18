// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getProfile } from '../api/profile';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // Инициализация токена только при первом рендере
    return sessionStorage.getItem('token') || null;
  });
  const [loading, setLoading] = useState(true); // глобальная загрузка при старте
  const [initializing, setInitializing] = useState(true); // отдельно для инициализации

  // Загрузка профиля по токену
  const loadUserData = useCallback(
    async (authToken) => {
      try {
        const userData = await getProfile(authToken);
        setUser(userData);
        return userData;
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Очищаем всё при невалидном токене
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
        throw error;
      }
    },
    []
  );

  // Инициализация при монтировании и при изменении токена
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      setInitializing(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    loadUserData(token)
      .then((userData) => {
        if (!cancelled) {
          setUser(userData);
        }
      })
      .catch(() => {
        // Ошибка уже обработана внутри loadUserData
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setInitializing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, loadUserData]);

  // Логин
  const login = async (newToken) => {
    if (!newToken) throw new Error('Token is required');

    sessionStorage.setItem('token', newToken);
    setToken(newToken);

    // Загрузка пользователя уже произойдёт через useEffect выше
    // Но возвращаем промис, чтобы можно было await
    const userData = await loadUserData(newToken);
    return userData;
  };

  // Логаут
  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // Обновление данных пользователя (например, после редактирования профиля)
  const updateUser = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
  };

  // Принудительное обновление профиля с сервера
  const refreshUser = async () => {
    if (!token) return null;
    return await loadUserData(token);
  };

  // Проверка ролей
  const hasRole = useCallback((requiredRole) => {
    return user?.role === requiredRole;
  }, [user?.role]);

  const isAdmin = () => hasRole('ADMIN');
  const isManager = () => hasRole('MANAGER');
  const isClient = () => hasRole('CLIENT');

  const value = {
    user,
    token,
    loading: loading || initializing,
    isAuthenticated: !!token && !!user,
    isAdmin,
    isManager,
    isClient,
    hasRole,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};