import { Heart, Landmark, Leaf, GraduationCap, Droplets, Shield, Train, Factory, Home } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "@/hooks/use-toast";

const departments = [
  { icon: Heart, label: "Health", color: "text-destructive" },
  { icon: Landmark, label: "Finance", color: "text-primary" },
  { icon: Leaf, label: "Agriculture", color: "text-success" },
  { icon: GraduationCap, label: "Education", color: "text-secondary" },
  { icon: Droplets, label: "Water Resources", color: "text-primary" },
  { icon: Shield, label: "Defence", color: "text-foreground" },
  { icon: Train, label: "Railways", color: "text-secondary" },
  { icon: Factory, label: "Industry", color: "text-muted-foreground" },
  { icon: Home, label: "Housing", color: "text-primary" },
];

const Departments = () => {
  const handleClick = (label: string) => {
    toast({
      title: `${label} Department`,
      description: "Coming Soon — Contact Helpline 1800-XXX-XXXX",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <h2 className="section-title mb-6">Government Departments</h2>
        <div className="grid grid-cols-3 gap-4">
          {departments.map((dept) => (
            <button
              key={dept.label}
              onClick={() => handleClick(dept.label)}
              className="card-gov p-5 flex flex-col items-center gap-3 text-center transition-all hover:scale-[1.03] active:scale-95 animate-fade-up"
            >
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                <dept.icon className={`h-7 w-7 ${dept.color}`} />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">{dept.label}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Departments;
