import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const UiContext = createContext(null);

export const UiProvider = ({ children }) => {
  const { pathname } = useLocation();
  const [search, setSearch] = useState({ open: false, q: "" });
  const [menuOpen, setMenuOpen] = useState(false);
  const openSearch = useCallback((q = "") => setSearch({ open: true, q }), []);
  const closeSearch = useCallback(() => setSearch({ open: false, q: "" }), []);

  useEffect(() => { setMenuOpen(false); setSearch({ open: false, q: "" }); }, [pathname]);
  useEffect(() => {
    if (pathname.startsWith("/admin")) return undefined;
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); openSearch(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, pathname]);

  const value = useMemo(() => ({ search, openSearch, closeSearch, menuOpen, setMenuOpen }), [search, openSearch, closeSearch, menuOpen]);
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
};

export const useUi = () => useContext(UiContext);
