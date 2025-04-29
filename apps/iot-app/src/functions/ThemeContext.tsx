import { ReactNode, createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    root.classList.remove("light", "dark");
    root.classList.add(theme);

    body.classList.remove(
      "bg-white",
      "text-black",
      "bg-neutral-900",
      "bg-neutral-800",
      "text-white",
    );
    if (theme === "dark") {
      body.classList.add("bg-neutral-700", "text-white");
    } else {
      body.classList.add("bg-white", "text-black");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
