/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("https://bookstore-7r11.onrender.com/api/verify-token", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            // Token jest nieprawidłowy – np. 401
            throw new Error("Invalid token");
          }
          return res.json();
        })
        .then((data) => {
          if (data.valid && data.user) {
            setUser(data.user);
          }
        })
        .catch((err) => {
          console.warn("Błąd weryfikacji tokena:", err.message);
          // Nie usuwamy tokena — pozwalamy użytkownikowi próbować dalej
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
