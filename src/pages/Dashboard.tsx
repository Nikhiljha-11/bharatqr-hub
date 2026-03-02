import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, ShieldCheck, Heart, FileText,
  ArrowLeft, Pill, AlertTriangle,
  Download, Eye, CreditCard, Landmark
} from "lucide-react";
import Header from "@/components/Header";
import AIVoiceModal from "@/components/AIVoiceModal";
import SymbolicBillCards from "@/components/SymbolicBillCards";
import PaymentConfirm from "@/components/PaymentConfirm";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { getBhashiniGreeting } from "@/data/mockData";
import type { CitizenModel, BillItem } from "@/types";
import { getCitizen } from "@/lib/dataService";

const Dashboard = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState<CitizenModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [payingBill, setPayingBill] = useState<BillItem | null>(null);

  useEffect(() => {
    if (!qrId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const c = await getCitizen(qrId);
      setCitizen(c);
      setLoading(false);
      if (c) setShowAI(true);
    })();
  }, [qrId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-fade-up">
            <div className="h-16 w-16 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
            <p className="text-muted-foreground font-medium">Loading citizen profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!citizen) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center animate-fade-up">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Identity Not Found</h2>
            <p className="text-muted-foreground mb-6">This BharatQR ID is not registered in our system.</p>
            <button onClick={() => navigate("/scan")} className="btn-navy">Try Another Scan</button>
          </div>
        </div>
      </div>
    );
  }

  const lowBalance = citizen.balance < 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        <button onClick={() => navigate("/scan")} className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Scanner
        </button>

        {/* Profile header */}
        <div className="card-gov p-6 mb-6 animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              {citizen.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{citizen.name}</h2>
                <ShieldCheck className="h-5 w-5 text-success" />
                <span className="text-xs font-medium text-success bg-success/10 rounded-full px-2 py-0.5">Verified</span>
              </div>
              <p className="text-sm text-muted-foreground">{citizen.nameHindi}</p>
              <p className="text-sm text-muted-foreground mt-1">Aadhaar: {citizen.aadhaar} · {citizen.village}, {citizen.district}, {citizen.state}</p>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="mb-6 flex justify-center">
          <QRCodeDisplay qrId={citizen.qrId} name={citizen.name} />
        </div>

        {/* Symbolic Bill Cards — shown first if bills exist */}
        <div className="mb-6">
          <SymbolicBillCards bills={citizen.bills} onPayBill={(bill) => setPayingBill(bill)} />
        </div>

        {/* Service tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Identity */}
          <div className="card-gov p-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="section-title">Identity</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Aadhaar</span><span className="font-medium text-foreground">{citizen.aadhaar}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Voter ID</span><span className="font-medium text-foreground">{citizen.voterId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium text-foreground">{citizen.phone}</span></div>
            </div>
          </div>

          {/* Health */}
          <div className="card-gov p-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-destructive" />
              <h3 className="section-title">Health (ABHA)</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">ABHA ID: {citizen.abhaId}</p>
            <div className="space-y-2">
              {citizen.healthRecords.map((r, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-2 text-sm">
                  <p className="font-medium text-foreground">{r.condition}</p>
                  <p className="text-xs text-muted-foreground">{r.date} · {r.doctor}</p>
                </div>
              ))}
            </div>
            {citizen.prescriptions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-2"><Pill className="h-3 w-3" /> Active Prescriptions</p>
                {citizen.prescriptions.map((p, i) => (
                  <p key={i} className="text-xs text-foreground">{p.medicine} — {p.dosage}</p>
                ))}
              </div>
            )}
          </div>

          {/* Recharge Hub */}
          <div className={`card-gov p-5 animate-fade-up ${lowBalance ? "border-destructive border-2 shadow-[0_0_20px_hsl(var(--destructive)/0.2)]" : ""}`} style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-4">
              {lowBalance ? (
                <AlertTriangle className="h-6 w-6 text-destructive animate-blink-alert" />
              ) : (
                <Landmark className="h-5 w-5 text-secondary" />
              )}
              <h3 className="section-title">Recharge Hub</h3>
              {lowBalance && (
                <span className="ml-auto text-xs font-bold text-destructive animate-blink-alert">⚠ LOW BALANCE</span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">₹{citizen.balance.toLocaleString("en-IN")}</span>
              <span className="text-sm text-muted-foreground">available balance</span>
            </div>
            {lowBalance && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive font-medium">Low balance — recharge now</p>
                <button className="ml-auto rounded-lg bg-secondary px-4 py-1.5 text-xs font-bold text-secondary-foreground shadow-md hover:brightness-110 hover:scale-105 transition-all">
                  <CreditCard className="inline h-3 w-3 mr-1" />Pay Now
                </button>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Recharge Categories</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: FileText, label: "Bill Recharge" },
                  { icon: CreditCard, label: "Mobile Recharge" },
                  { icon: Landmark, label: "Utility Recharge" },
                ].map((cat) => (
                  <button key={cat.label} className="flex flex-col items-center gap-1.5 rounded-xl bg-muted p-3 text-center transition-all hover:bg-accent hover:shadow-sm">
                    <cat.icon className="h-5 w-5 text-primary" />
                    <span className="text-[11px] font-medium text-foreground leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card-gov p-5 animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="section-title">Documents (DigiLocker)</h3>
            </div>
            <div className="space-y-2">
              {citizen.documents.map((d, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.type} · Issued {d.issued}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded-md p-1.5 hover:bg-accent transition-colors"><Eye className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="rounded-md p-1.5 hover:bg-accent transition-colors"><Download className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showAI && (
        <AIVoiceModal
          text={getBhashiniGreeting(citizen)}
          onClose={() => setShowAI(false)}
        />
      )}

      {payingBill && (
        <PaymentConfirm
          bill={payingBill}
          onClose={() => setPayingBill(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
