// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // 🧩 Skip call if no token and no session (prevents 401 spam)
      if (!token && !document.cookie.includes("connect.sid")) {
        setLoading(false);
        return;
      }

      try {
        let res;

        if (token) {
          // Local JWT login
          res = await axios.get("https://apnagpt-backend-4u32.onrender.com/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
        } else {
          // Google login (cookie-based session)
          res = await axios.get("https://apnagpt-backend-4u32.onrender.com/auth/me", {
            withCredentials: true,
          });
        }

        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn("Auth check failed — probably no active session.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await axios.post("https://apnagpt-backend-4u32.onrender.com/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      localStorage.removeItem("token");
      setToken("");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
