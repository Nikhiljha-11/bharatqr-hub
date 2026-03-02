import { useNavigate } from "react-router-dom";
import { ScanLine, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <h2 className="section-title mb-6">Active Services</h2>
        <div className="card-gov p-8 flex flex-col items-center text-center animate-fade-up">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-5">
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Active Session</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Please scan a BharatQR card to view active services, pending bills, and citizen details.
          </p>
          <button
            onClick={() => navigate("/scan")}
            className="btn-saffron flex items-center gap-2"
          >
            <ScanLine className="h-5 w-5" />
            Scan BharatQR Card
          </button>
        </div>
      </main>
    </div>
  );
};

export default Services;
