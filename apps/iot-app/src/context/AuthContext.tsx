import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

import apiClient from "../api/axiosConfig";
import LoadingOverlay from "../components/LoadingOverlay";

interface User {
  userId: string;
  role: "admin" | "user"; 
  username?: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>; 
  logout: () => void;
  isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    delete apiClient.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  const fetchUser = useCallback(
    async (currentToken: string | null) => {
      const targetToken = currentToken || localStorage.getItem("authToken");
      if (!targetToken) {
        delete apiClient.defaults.headers.common["Authorization"];
        setToken(null);
        setUser(null);
        return;
      }

      apiClient.defaults.headers.common["Authorization"] = `Bearer ${targetToken}`;
      try {
        const response = await apiClient.get<User>("/api/auth/me");
        if (localStorage.getItem("authToken") === targetToken) {
          setToken(targetToken);
          setUser(response.data);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Failed to fetch user or token expired:", error);
        localStorage.removeItem("authToken");
        delete apiClient.defaults.headers.common["Authorization"];
        setToken(null);
        setUser(null);
      }
    },
    [logout],
  );

  useEffect(() => {
    const loadAuthData = async () => {
      await fetchUser(null);
      setIsLoading(false);
    };
    loadAuthData();
  }, [fetchUser]);

  const login = useCallback(
    async (newToken: string) => {
      localStorage.setItem("authToken", newToken);
      await fetchUser(newToken);
    },
    [fetchUser],
  );

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!token, user, token, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
