import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, ShieldCheck, Heart, FileText,
  ArrowLeft, Pill, AlertTriangle,
  Download, Eye, CreditCard, Landmark, Volume2, Fingerprint, Mic, Zap, Droplets, Flame
} from "lucide-react";
import Header from "@/components/Header";
import AIVoiceModal from "@/components/AIVoiceModal";
import SymbolicBillCards from "@/components/SymbolicBillCards";
import PaymentConfirm from "@/components/PaymentConfirm";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { getBhashiniGreeting } from "@/data/mockData";
import type { CitizenModel, BillItem, CitizenDocument } from "@/types";
import { subscribeCitizen } from "@/lib/dataService";
import { getAlertSpeechSummary, speakText } from "@/lib/speech";
import { toast } from "sonner";
import { maskIdentifier } from "@/lib/security";
import { authenticateWithPlatformBiometrics } from "@/lib/webauthn";
import { setActiveRole } from "@/lib/auth";

const getDefaultUtilityBalances = (qrId: string) => {
  const source = qrId || "BQR_IND_000";
  const seed = source.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  return {
    electricity: 40 + (seed % 220),
    water: 60 + ((seed * 3) % 260),
    gas: 70 + ((seed * 7) % 300),
  };
};

const utilityConsumptionPerDay = {
  electricity: 55,
  water: 40,
  gas: 35,
};

const getDaysRemaining = (amount: number, type: keyof typeof utilityConsumptionPerDay) => {
  return Math.max(1, Math.floor(amount / utilityConsumptionPerDay[type]));
};

const buildFirstScanSummary = (bills: BillItem[]) => {
  const nextBill = bills[0];
  if (!nextBill) {
    return "You are all set. No pending bills today.";
  }
  return `Your ${nextBill.label.toLowerCase()} bill is due soon. Please pay in time.`;
};

const Dashboard = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  const [citizen, setCitizen] = useState<CitizenModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [payingBill, setPayingBill] = useState<BillItem | null>(null);
  const [revealed, setRevealed] = useState({ aadhaar: false, abha: false });
  const [verifyingField, setVerifyingField] = useState<"aadhaar" | "abha" | "document" | null>(null);
  const [pendingDocumentAction, setPendingDocumentAction] = useState<{
    doc: CitizenDocument;
    action: "view" | "download";
  } | null>(null);
  const [isVoiceGuideOpen, setIsVoiceGuideOpen] = useState(false);

  useEffect(() => {
    setActiveRole("citizen");
    if (!qrId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeCitizen(qrId, (c) => {
      setCitizen(c);
      setLoading(false);
      if (c) {
        setShowAI((prev) => prev || true);
      }
    });

    return () => unsub();
  }, [qrId]);

  useEffect(() => {
    if (!citizen) {
      return;
    }

    const key = `bqr_voice_summary_played_${citizen.qrId}`;
    if (localStorage.getItem(key) === "1") {
      return;
    }

    const pending = citizen.bills.filter(
      (bill) => (bill.status || citizen.billStatus?.[bill.label] || "Pending") !== "Paid",
    );
    const text = buildFirstScanSummary(pending);
    const timer = window.setTimeout(() => {
      speakText(text);
      localStorage.setItem(key, "1");
    }, 600);

    return () => clearTimeout(timer);
  }, [citizen]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md space-y-3 animate-fade-up">
            <div className="h-16 w-1/2 mx-auto rounded-xl animate-shimmer" />
            <div className="h-24 w-full rounded-2xl animate-shimmer" />
            <div className="h-24 w-full rounded-2xl animate-shimmer" />
            <p className="text-muted-foreground text-center font-medium">Loading citizen profile...</p>
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

  const requestReveal = async (field: "aadhaar" | "abha") => {
    setVerifyingField(field);

    const verified = await authenticateWithPlatformBiometrics();
    if (!verified) {
      setVerifyingField(null);
      toast.error("Biometric verification was not completed.");
      return;
    }

    setTimeout(() => {
      setRevealed((prev) => ({ ...prev, [field]: true }));
      setVerifyingField(null);
    }, 300);
  };

  const openDocument = (doc: CitizenDocument, action: "view" | "download") => {
    if (!doc.contentUrl) {
      toast.info("No uploaded file available for this document.");
      return;
    }

    if (action === "view") {
      window.open(doc.contentUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const link = document.createElement("a");
    link.href = doc.contentUrl;
    link.download = doc.name || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const requestDocumentAccess = async (doc: CitizenDocument, action: "view" | "download") => {
    if (doc.requiresBiometric === false) {
      openDocument(doc, action);
      return;
    }

    setPendingDocumentAction({ doc, action });
    setVerifyingField("document");

    const verified = await authenticateWithPlatformBiometrics();
    if (!verified) {
      setVerifyingField(null);
      setPendingDocumentAction(null);
      toast.error("Document unlock requires successful biometric verification.");
      return;
    }

    openDocument(doc, action);
    setPendingDocumentAction(null);
    setVerifyingField(null);
  };

  const pendingBills = citizen.bills.filter(
    (bill) => (bill.status || citizen.billStatus?.[bill.label] || "Pending") !== "Paid",
  );

  const utilityBalances = citizen.utilityBalances || getDefaultUtilityBalances(citizen.qrId);
  const lowElectricity = utilityBalances.electricity < 100;
  const voiceGuideText = [
    pendingBills.length
      ? `${pendingBills.length} bill alerts are active on this page.`
      : "No pending bill alerts are active.",
    lowElectricity
      ? `Electricity balance is low with about ${getDaysRemaining(utilityBalances.electricity, "electricity")} days remaining.`
      : "Electricity balance is stable.",
    `Water has about ${getDaysRemaining(utilityBalances.water, "water")} days remaining and gas has about ${getDaysRemaining(utilityBalances.gas, "gas")} days remaining.`,
  ].join(" ");

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
              <p className="text-sm text-muted-foreground mt-1">Aadhaar: {revealed.aadhaar ? citizen.aadhaar : maskIdentifier(citizen.aadhaar)} · {citizen.village}, {citizen.district}, {citizen.state}</p>
            </div>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="mb-6 flex justify-center">
          <QRCodeDisplay qrId={citizen.qrId} name={citizen.name} />
        </div>

        {/* Symbolic Bill Cards — shown first if bills exist */}
        <div className="mb-6">
          <SymbolicBillCards bills={pendingBills} onPayBill={(bill) => setPayingBill(bill)} />
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
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Fingerprint className="h-3.5 w-3.5" /> Aadhaar</span>
                <span className="flex items-center gap-2 font-medium text-foreground">
                  {revealed.aadhaar ? citizen.aadhaar : maskIdentifier(citizen.aadhaar)}
                  {!revealed.aadhaar && (
                    <button
                      type="button"
                      onClick={() => requestReveal("aadhaar")}
                      className="rounded-md px-2 py-1 text-[10px] border border-border hover:bg-accent"
                      aria-label="Verify biometric for Aadhaar"
                    >
                      Verify Biometric
                    </button>
                  )}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Voter ID</span><span className="font-medium text-foreground">{citizen.voterId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium text-foreground">XXXXXX{citizen.phone.replace(/\D/g, "").slice(-4)}</span></div>
            </div>
          </div>

          {/* Health */}
          <div className="card-gov p-5 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-destructive" />
              <h3 className="section-title">Health (ABHA)</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
              <Heart className="h-3.5 w-3.5" /> ABHA ID: {revealed.abha ? citizen.abhaId : maskIdentifier(citizen.abhaId)}
              {!revealed.abha && (
                <button
                  type="button"
                  onClick={() => requestReveal("abha")}
                  className="rounded-md px-2 py-1 text-[10px] border border-border hover:bg-accent"
                  aria-label="Verify biometric for ABHA"
                >
                  Verify Biometric
                </button>
              )}
            </p>
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
          <div className={`card-gov p-5 animate-fade-up ${lowElectricity ? "border-destructive border-2 shadow-[0_0_20px_hsl(var(--destructive)/0.2)] bg-destructive/5" : "border-success/40 border-2 bg-success/5"}`} style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-4">
              {lowElectricity ? (
                <AlertTriangle className="h-6 w-6 text-destructive animate-blink-alert" />
              ) : (
                <Landmark className="h-5 w-5 text-success" />
              )}
              <h3 className="section-title">Recharge Hub</h3>
              {lowElectricity && (
                <span className="ml-auto text-xs font-bold text-destructive animate-blink-alert">⚠ LOW BALANCE</span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">₹{citizen.balance.toLocaleString("en-IN")}</span>
                <span className="text-sm text-muted-foreground">main account</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`rounded-lg p-2 ${lowElectricity ? "bg-destructive/15" : "bg-success/20"}`}>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Zap className="h-3 w-3" />Electricity</p>
                  <p className={`font-bold ${lowElectricity ? "text-destructive" : "text-success"}`}>₹{utilityBalances.electricity}</p>
                  <p className="text-[10px] text-muted-foreground">{getDaysRemaining(utilityBalances.electricity, "electricity")} days left</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Droplets className="h-3 w-3" />Water</p>
                  <p className="font-bold text-foreground">₹{utilityBalances.water}</p>
                  <p className="text-[10px] text-muted-foreground">{getDaysRemaining(utilityBalances.water, "water")} days left</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Flame className="h-3 w-3" />Gas</p>
                  <p className="font-bold text-foreground">₹{utilityBalances.gas}</p>
                  <p className="text-[10px] text-muted-foreground">{getDaysRemaining(utilityBalances.gas, "gas")} days left</p>
                </div>
              </div>
            </div>
            {lowElectricity && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive font-medium">Electricity low balance — recharge now</p>
                <button
                  type="button"
                  onClick={() => speakText(getAlertSpeechSummary("Electricity low balance", utilityBalances.electricity, "Today"))}
                  className="rounded-md p-1.5 hover:bg-destructive/20"
                  aria-label="Speak low balance alert"
                >
                  <Volume2 className="h-4 w-4 text-destructive" />
                </button>
                <button
                  className="ml-auto rounded-lg bg-secondary px-4 py-1.5 text-xs font-bold text-secondary-foreground shadow-md hover:brightness-110 hover:scale-105 transition-all"
                  onClick={() => window.open("https://www.bharat-connect.com/", "_blank", "noopener,noreferrer")}
                >
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
                    <button
                      onClick={() => requestDocumentAccess(d, "view")}
                      className="rounded-md p-1.5 hover:bg-accent transition-colors"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => requestDocumentAccess(d, "download")}
                      className="rounded-md p-1.5 hover:bg-accent transition-colors"
                    >
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
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

      <button
        type="button"
        className="fixed bottom-5 right-5 z-40 rounded-full bg-secondary p-4 shadow-xl hover:brightness-110"
        aria-label="Open Bhashini voice walkthrough"
        onClick={() => {
          setIsVoiceGuideOpen(true);
          speakText(voiceGuideText);
        }}
      >
        <Mic className="h-7 w-7 text-secondary-foreground" />
      </button>

      {isVoiceGuideOpen && (
        <AIVoiceModal
          text={voiceGuideText}
          onClose={() => setIsVoiceGuideOpen(false)}
        />
      )}

      {payingBill && (
        <PaymentConfirm
          bill={payingBill}
          qrId={citizen.qrId}
          onClose={() => setPayingBill(null)}
        />
      )}

      {verifyingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center">
            <Fingerprint className="mx-auto h-12 w-12 text-primary animate-pulse mb-3" />
            <p className="font-semibold text-foreground">Use FaceID or Fingerprint</p>
            <p className="text-xs text-muted-foreground mt-1">
              {verifyingField === "document"
                ? `Use native biometric authentication to ${pendingDocumentAction?.action || "access"} document...`
                : "Use native biometric authentication for secure reveal..."}
            </p>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-full bg-primary animate-[pulse_1.2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
