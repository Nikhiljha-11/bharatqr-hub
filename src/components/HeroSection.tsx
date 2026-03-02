import { useNavigate } from "react-router-dom";
import { ScanLine, ShieldCheck, Users, Search, Bell, ChevronRight } from "lucide-react";
import { impactStats } from "@/data/mockData";
import { useState } from "react";

const announcements = [
  { title: "PM-KISAN 17th Installment Released", date: "Feb 2026", tag: "Finance" },
  { title: "Ayushman Bharat expansion to 50 cr citizens", date: "Jan 2026", tag: "Health" },
  { title: "Digital India 3.0 initiative launched", date: "Dec 2025", tag: "Digital" },
];

const quickServices = [
  "Aadhaar Services", "Ration Card", "Voter ID", "Driving License",
  "Health Insurance", "Tax Filing", "Passport", "Property Records",
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = quickServices.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="relative overflow-hidden bg-primary py-12 md:py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="container relative mx-auto px-4">
        {/* Top badge */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground/80">
            <ShieldCheck className="h-4 w-4" />
            Serving Citizens with Transparency and Trust
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left: Hero text + Search + Scan */}
          <div className="animate-fade-up">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl leading-tight">
              Your Digital Identity,
              <br />
              <span className="text-saffron">One Scan Away</span>
            </h2>

            <p className="mb-6 text-base text-primary-foreground/70 max-w-md">
              Access government services, health records, financial tools, and official documents — all through a single QR code.
            </p>

            {/* Service Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services — Aadhaar, Ration Card, Tax..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-primary-foreground pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-card border border-border shadow-xl z-20 overflow-hidden">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((s) => (
                      <button key={s} className="flex w-full items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors">
                        <span>{s}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-muted-foreground">No services found</p>
                  )}
                </div>
              )}
            </div>

            {/* Scan CTA */}
            <button
              onClick={() => navigate("/scan")}
              className="group relative inline-flex items-center gap-3 rounded-2xl bg-secondary px-8 py-4 text-lg font-bold text-secondary-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-pulse-scan"
            >
              <ScanLine className="h-6 w-6 transition-transform group-hover:rotate-12" />
              SCAN BHARATQR
            </button>

            {/* Stats row */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { label: "Citizens Served", value: impactStats.citizensServed.toLocaleString("en-IN"), icon: Users },
                { label: "Services Integrated", value: `${impactStats.servicesIntegrated}+`, icon: ShieldCheck },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 p-3">
                  <p className="stat-number text-xl md:text-2xl text-primary-foreground">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-primary-foreground/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Announcements panel */}
          <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-secondary" />
                <h3 className="text-base font-semibold text-primary-foreground">Latest Announcements</h3>
              </div>
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.title} className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/5 p-4 hover:bg-primary-foreground/10 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-primary-foreground leading-snug">{a.title}</p>
                        <p className="text-xs text-primary-foreground/50 mt-1">{a.date}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                        {a.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-3 text-center">
                  <p className="text-xl font-bold text-primary-foreground">{impactStats.projectsCompleted.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-primary-foreground/60">Projects Done</p>
                </div>
                <div className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-3 text-center">
                  <p className="text-xl font-bold text-primary-foreground">{impactStats.activeSchemes}+</p>
                  <p className="text-xs text-primary-foreground/60">Active Schemes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
