import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { login as loginApi, me } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("shopflow_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const meResponse = await me();
        setUser(meResponse);
      } catch {
        localStorage.removeItem("shopflow_token");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (payload) => {
    const token = await loginApi(payload);
    localStorage.setItem("shopflow_token", token.access_token);
    const meResponse = await me();
    setUser(meResponse);
    return meResponse;
  };

  const logout = () => {
    localStorage.removeItem("shopflow_token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
