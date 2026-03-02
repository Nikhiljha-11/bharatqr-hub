import { CheckCircle, Leaf, Flame, Heart } from "lucide-react";
import Header from "@/components/Header";

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

const Schemes = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <h2 className="section-title mb-6">Government Schemes</h2>
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
