import { useNavigate } from "react-router-dom";
import { ScanLine, ShieldCheck, Users, Globe, Wifi, Lock } from "lucide-react";
import { impactStats } from "@/data/mockData";
import { useState, useEffect } from "react";
import logo from "@/assets/cfea4efc866df78dba4f5702722615ad.jpg";

const languages = [
  { code: "EN", label: "English" },
  { code: "हि", label: "हिन्दी" },
  { code: "த", label: "தமிழ்" },
];

const Index = () => {
  const navigate = useNavigate();
  const [activeLang, setActiveLang] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background dot pattern */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(213 88% 33%) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <img src={logo} alt="BharatQR" className="h-11 w-11 rounded-lg bg-card shadow-sm object-contain p-1" />
          <div>
            <h1 className="text-lg font-bold tracking-wide text-foreground">BHARATQR</h1>
            <p className="text-[11px] font-medium text-muted-foreground">Personal Digital Identity</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-mono text-secondary">
              ⏱ {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {/* Admin Button */}
          <button
            onClick={() => navigate("/admin-login")}
            className="flex items-center gap-2 rounded-lg bg-secondary/20 border border-secondary/50 px-3 py-2 text-sm font-semibold text-secondary hover:bg-secondary/30 transition-all hover:shadow-md"
            title="Admin Access"
          >
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </header>

      {/* Language Toggle */}
      <div className="relative z-10 flex items-center gap-2 px-5 py-3">
        <Globe className="h-4 w-4 text-muted-foreground" />
        {languages.map((lang, i) => (
          <button
            key={lang.code}
            onClick={() => setActiveLang(i)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
              activeLang === i
                ? "bg-secondary text-secondary-foreground shadow-[0_0_12px_hsl(var(--secondary)/0.5)]"
                : "bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            {lang.code}
          </button>
        ))}
      </div>

      {/* Center: Massive Scan Button */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Pulsing Halo Rings */}
        <div className="relative mb-8">
          <div className="absolute inset-0 -m-6 rounded-full border-2 border-secondary/30 animate-scan-halo-1" />
          <div className="absolute inset-0 -m-12 rounded-full border border-secondary/20 animate-scan-halo-2" />
          <div className="absolute inset-0 -m-[72px] rounded-full border border-secondary/10 animate-scan-halo-3" />

          {/* The Button */}
          <button
            onClick={() => navigate("/scan")}
            className="relative flex h-40 w-40 md:h-48 md:w-48 items-center justify-center rounded-full shadow-[0_0_40px_hsl(var(--secondary)/0.3),0_0_80px_hsl(0_0%_100%/0.2)] transition-transform duration-300 hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, hsl(30 100% 55%), hsl(30 100% 65%))`,
            }}
          >
            <ScanLine className="h-16 w-16 md:h-20 md:w-20 text-secondary-foreground drop-shadow-lg" />
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-wide mb-2">
          SCAN BHARATQR
        </h2>
        <p className="text-sm text-muted-foreground">
          Hold QR card near camera to identify citizen
        </p>
      </div>

      {/* National Impact Stats */}
      <div className="relative z-10 px-5 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
          National Impact
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: impactStats.citizensServed.toLocaleString("en-IN"), label: "Citizens Served", icon: Users },
            { value: `${impactStats.servicesIntegrated}+`, label: "Services Integrated", icon: Wifi },
            { value: "28", label: "States Connected", icon: ShieldCheck },
            { value: impactStats.projectsCompleted.toLocaleString("en-IN"), label: "Documents Issued", icon: ShieldCheck },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card border border-border shadow-sm p-3.5">
              <p className="text-xl font-bold text-secondary">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted Footer */}
      <footer className="relative z-10 pb-5 pt-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-success/15 border border-success/20 px-5 py-2">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="text-xs font-semibold text-success">Trusted by Government of India</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">Powered by DigiLocker · ABHA · UIDAI</p>
      </footer>
    </div>
  );
};

export default Index;
