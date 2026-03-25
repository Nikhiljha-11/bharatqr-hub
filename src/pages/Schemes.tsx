import { useState } from "react";
import { BellRing, CheckCircle, Flame, Heart, Leaf, Volume2 } from "lucide-react";
import Header from "@/components/Header";
import { speakText } from "@/lib/speech";

const schemes = [
  {
    name: "PM-KISAN Samman Nidhi",
    description: "₹6,000 per year direct income support for eligible farming families.",
    icon: Leaf,
    status: "Active",
  },
  {
    name: "PM Ujjwala Yojana (LPG Subsidy)",
    description: "Free LPG connections and subsidised refills for BPL households.",
    icon: Flame,
    status: "Active",
  },
  {
    name: "Ayushman Bharat (PM-JAY)",
    description: "Health insurance cover of ₹5 lakh per family per year for secondary and tertiary care.",
    icon: Heart,
    status: "Active",
  },
];

const notifications = [
  "You are eligible for the Ujjwala Yojana. Click to apply.",
  "PM-Kisan installment window is open for this quarter.",
  "Ayushman Bharat e-card is ready. Download from the Health desk.",
];

const Schemes = () => {
  const [applied, setApplied] = useState<string[]>([]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <h2 className="section-title mb-6">Government Schemes</h2>

        <div className="card-gov p-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <BellRing className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Schemes Notification Center</h3>
          </div>
          <div className="space-y-2">
            {notifications.map((item) => (
              <div key={item} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm text-foreground">{item}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setApplied((prev) => (prev.includes(item) ? prev : [...prev, item]))}
                    className="rounded-md bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
                  >
                    {applied.includes(item) ? "Applied" : "Click to Apply"}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-border p-1"
                    onClick={() => speakText(item)}
                    aria-label="Listen to scheme alert"
                  >
                    <Volume2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {schemes.map((scheme, i) => (
            <div
              key={scheme.name}
              className="card-gov p-5 flex items-start gap-4 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <scheme.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-foreground">{scheme.name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success">
                    <CheckCircle className="h-3 w-3" />
                    {scheme.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{scheme.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Schemes;
