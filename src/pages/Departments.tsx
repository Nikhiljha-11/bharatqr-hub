import { Heart, Landmark, Leaf, GraduationCap, Droplets, Shield, Train, Factory, Home } from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { departmentList } from "@/data/departmentData";

const iconMap = {
  Health: Heart,
  Finance: Landmark,
  Agriculture: Leaf,
  Education: GraduationCap,
  "Water Resources": Droplets,
  Defence: Shield,
  Railways: Train,
  Industry: Factory,
  Housing: Home,
};

const colorMap = {
  Health: "text-destructive",
  Finance: "text-primary",
  Agriculture: "text-success",
  Education: "text-secondary",
  "Water Resources": "text-primary",
  Defence: "text-foreground",
  Railways: "text-secondary",
  Industry: "text-muted-foreground",
  Housing: "text-primary",
};

const Departments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <h2 className="section-title mb-6">Government Departments</h2>
        <div className="grid grid-cols-3 gap-4">
          {departmentList.map((dept) => {
            const Icon = iconMap[dept.label as keyof typeof iconMap] || Home;
            const color = colorMap[dept.label as keyof typeof colorMap] || "text-primary";

            return (
            <button
              key={dept.id}
              onClick={() => navigate(`/departments/${dept.id}`)}
              className="card-gov p-5 flex flex-col items-center gap-3 text-center transition-all hover:scale-[1.03] active:scale-95 animate-fade-up"
            >
              <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">{dept.label}</span>
            </button>
          )})}
        </div>
      </main>
    </div>
  );
};

export default Departments;
