import { StorageService } from "@/services/storage";
import { router } from "expo-router";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasAccount: boolean;
  masterPassword: string | null;
  login: (password: string) => Promise<boolean>;
  signup: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);

  useEffect(() => {
    checkUserExists();
  }, []);

  const checkUserExists = async () => {
    try {
      const exists = await StorageService.userExists();
      setHasAccount(exists);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      const isValid = await StorageService.verifyMasterPassword(password);

      if (isValid) {
        setMasterPassword(password);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (password: string): Promise<boolean> => {
    try {
      console.log("Starting signup process...");
      await StorageService.createUser(password);
      console.log("User created successfully");
      setMasterPassword(password);
      setIsAuthenticated(true);
      setHasAccount(true);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      // Re-throw the error so it can be caught in the component
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setMasterPassword(null);
    router.replace("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        hasAccount,
        masterPassword,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
