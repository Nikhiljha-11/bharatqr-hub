import { useState, useEffect } from "react";
import { Globe, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/cfea4efc866df78dba4f5702722615ad.jpg";

const languages = ["English", "हिन्दी", "தமிழ்", "తెలుగు"];

const navItems = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Departments", path: "/departments" },
  { label: "Schemes", path: "/schemes" },
  { label: "Documents", path: "/documents" },
];

const Header = () => {
  const [time, setTime] = useState(new Date());
  const [lang, setLang] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={logo} alt="BharatQR" className="h-10 w-10 rounded bg-primary-foreground/10 object-contain p-0.5" />
          <div>
            <h1 className="text-lg font-bold tracking-wide">BHARATQR</h1>
            <p className="text-[11px] font-medium text-primary-foreground/70">Personal Digital Identity</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`relative px-3 py-1.5 rounded-md transition-all duration-200 ${
                isActive(item.path)
                  ? "text-primary-foreground bg-primary-foreground/15 shadow-[0_0_10px_hsl(0_0%_100%/0.15)]"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {item.label}
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-secondary rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm font-mono text-primary-foreground/70">
            {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button
            onClick={() => setLang((l) => (l + 1) % languages.length)}
            className="flex items-center gap-1.5 rounded-md bg-primary-foreground/10 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-primary-foreground/20"
          >
            <Globe className="h-4 w-4" />
            {languages[lang]}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-primary-foreground/10 bg-primary/95 backdrop-blur-sm px-4 pb-4 pt-2 animate-fade-up">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "text-primary-foreground bg-primary-foreground/15 shadow-[0_0_8px_hsl(0_0%_100%/0.1)]"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {item.label}
              {isActive(item.path) && (
                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-secondary" />
              )}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
