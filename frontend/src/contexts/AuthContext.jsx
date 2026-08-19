import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("okume-admin-token");
    if (!token) return setLoading(false);
    api.get("/auth/me").then(({ data }) => setUser(data.user)).catch(() => localStorage.removeItem("okume-admin-token")).finally(() => setLoading(false));
  }, []);
  const value = useMemo(() => ({
    user, loading,
    login: async (email, password) => { const { data } = await api.post("/auth/login", { email, password }); localStorage.setItem("okume-admin-token", data.token); setUser(data.user); },
    logout: () => { localStorage.removeItem("okume-admin-token"); setUser(null); },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);