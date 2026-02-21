import { Link, useLocation } from "react-router-dom";
import { Sparkles, BarChart3, History, Sun, Moon, Trophy, GitCompareArrows } from "lucide-react";
import { useEffect, useState } from "react";

const NavBar = () => {
  const location = useLocation();
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: white)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const navItems = [
    { to: "/", label: "Idea", icon: Sparkles },
    
    { to: "/compare", label: "Compare", icon: GitCompareArrows },
    { to: "/scoreboard", label: "Scoreboard", icon: Trophy },
    { to: "/history", label: "History", icon: History },
    { to: "/dashboard", label: "Metrics", icon: BarChart3 },
  ];

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg gradient-text">StartupAI</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </span>
            </Link>
          ))}
          <button
            onClick={() => setDark(d => !d)}
            className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
