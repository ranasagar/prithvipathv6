import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  cornerRadius: number;
  categoryHeroRadius: number;
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#0072B5",
  accentColor: "#b91c1c",
  fontFamily: "Inter",
  cornerRadius: 24,
  categoryHeroRadius: 40,
};

const ThemeContext = createContext<ThemeSettings>(defaultTheme);

export function StyleProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().theme) {
        setTheme(docSnap.data().theme);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", theme.primaryColor);
    root.style.setProperty("--color-accent", theme.accentColor);
    root.style.setProperty("--app-radius-3xl", `${theme.cornerRadius}px`);
    root.style.setProperty("--app-category-hero-radius", `${theme.categoryHeroRadius}px`);
    // Add more variables as needed
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
