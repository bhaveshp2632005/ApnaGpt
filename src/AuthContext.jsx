// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom"; // 🔹 Add this
import { API_BASE_URL } from "./config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // 🔹 Current route path

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let res;

        if (token) {
          // JWT login
          res = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
        } else {
          // Google login (session)
          res = await axios.get(`${API_BASE_URL}/auth/me`, {
            withCredentials: true,

          });
        }
  //  console.log(res.data?.user);
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          console.error("Auth fetch error:", err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // 🧩 Condition: Don't call auth check on login/signup routes
    const publicRoutes = ["/login", "/signup"];
    if (!publicRoutes.includes(location.pathname)) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, location.pathname]);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    
    setToken(token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
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
