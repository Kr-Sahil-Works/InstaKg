import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <Button
      size="sm"
      variant="outline"
      className="glass transition-all hover:scale-105"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "☀ Light" : "🌙 Dark"}
    </Button>
  );
}
