import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        relative w-16 h-8 rounded-full
        bg-black/20 dark:bg-white/20
        flex items-center px-1
        transition-colors
      "
    >
      {/* SLIDER */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="
          w-6 h-6 rounded-full
          bg-white dark:bg-black
          flex items-center justify-center
          shadow-md
        "
        style={{
          marginLeft: isDark ? "32px" : "0px",
        }}
      >
        {/* ICON */}
        <motion.span
          key={theme}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-sm"
        >
          {isDark ? "🌙" : "☀️"}
        </motion.span>
      </motion.div>
    </button>
  );
}
