import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

import { AxiosError } from "axios";

import apiClient from "../api/axiosConfig";
import LoadingOverlay from "../components/LoadingOverlay";

interface User {
  userId: string;
  role: "admin" | "user";
  username?: string;
  email?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete apiClient.defaults.headers.common["Authorization"];
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  const fetchUser = useCallback(
    async (currentToken: string | null) => {
      if (!currentToken) {
        if (accessToken) logout();
        return;
      }

      apiClient.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
      try {
        const response = await apiClient.get<User>("/api/auth/me");
        if (localStorage.getItem("accessToken") === currentToken) {
          setAccessToken(currentToken);
          setUser(response.data);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Failed to fetch user (likely token expired/invalid):", error);
        if (!(error instanceof AxiosError) || error.response?.status !== 401) {
          logout();
        }
      }
    },
    [logout, accessToken],
  );

  useEffect(() => {
    const loadAuthData = async () => {
      setIsLoading(true);
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      setRefreshToken(storedRefreshToken);

      if (storedAccessToken) {
        await fetchUser(storedAccessToken);
      }

      setIsLoading(false);
    };
    loadAuthData();
  }, [fetchUser]);

  const login = useCallback(
    async (tokens: AuthTokens) => {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      await fetchUser(tokens.accessToken);
    },
    [fetchUser],
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        user,
        accessToken,
        refreshToken,
        login,
        logout,
        isLoading,
      }}
    >
      {!isLoading ? children : <LoadingOverlay />}
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
