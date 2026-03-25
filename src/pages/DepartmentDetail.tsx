import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ScanLine,
  Volume2,
  Wallet,
  Wheat,
  HeartPulse,
  Shield,
} from "lucide-react";
import Header from "@/components/Header";
import { departmentById, type DepartmentId } from "@/data/departmentData";
import { getCitizen, markBillPaid, rechargeUtilityBalance } from "@/lib/dataService";
import { getAlertSpeechSummary, speakText } from "@/lib/speech";
import type { BillItem, CitizenModel } from "@/types";

const ogdHealth = [
  { patientId: "ABHA-2091", district: "Varanasi", vaccine: "Td Booster", date: "2026-02-11" },
  { patientId: "ABHA-1822", district: "Jaipur", vaccine: "Hep-B", date: "2026-01-29" },
  { patientId: "ABHA-3302", district: "Chennai", vaccine: "Influenza", date: "2026-02-03" },
];

const soilCards = [
  { village: "Chandpur", ph: "6.8", nitrogen: "Medium", potassium: "High" },
  { village: "Manpur", ph: "7.2", nitrogen: "Low", potassium: "Medium" },
  { village: "Hosapete", ph: "6.5", nitrogen: "Medium", potassium: "Low" },
];

const mandiPrices = [
  { crop: "Wheat", mandi: "Lucknow", price: "INR 2485 / qtl", trend: "Up 3%" },
  { crop: "Paddy", mandi: "Varanasi", price: "INR 2140 / qtl", trend: "Stable" },
  { crop: "Onion", mandi: "Jaipur", price: "INR 1920 / qtl", trend: "Down 2%" },
];

const utilityBills = ["Electricity Bill", "Water Bill"];

const DepartmentDetail = () => {
  const { departmentId } = useParams<{ departmentId: DepartmentId }>();
  const navigate = useNavigate();
  const department = departmentId ? departmentById[departmentId] : undefined;

  const [walletQrId, setWalletQrId] = useState("BQR_IND_001");
  const [walletCitizen, setWalletCitizen] = useState<CitizenModel | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillItem | null>(null);
  const [paying, setPaying] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(100);

  const pendingUtilityBills = useMemo(() => {
    if (!walletCitizen) {
      return [];
    }
    return walletCitizen.bills.filter((bill) => {
      const status = bill.status || walletCitizen.billStatus?.[bill.label] || "Pending";
      return utilityBills.includes(bill.label) && status !== "Paid";
    });
  }, [walletCitizen]);

  if (!department) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-3" />
            <p className="text-foreground font-semibold">Department not found.</p>
            <button onClick={() => navigate("/departments")} className="btn-navy mt-4">Back to Departments</button>
          </div>
        </main>
      </div>
    );
  }

  const loadWalletCitizen = async () => {
    setWalletLoading(true);
    const citizen = await getCitizen(walletQrId.trim());
    setWalletCitizen(citizen);
    setWalletLoading(false);
  };

  const payBill = async () => {
    if (!walletCitizen || !selectedBill) {
      return;
    }
    setPaying(true);
    await markBillPaid(walletCitizen.qrId, selectedBill.label);
    const updated = await getCitizen(walletCitizen.qrId);
    setWalletCitizen(updated);
    setSelectedBill(null);
    setPaying(false);
  };

  const rechargeElectricity = async () => {
    if (!walletCitizen) {
      return;
    }
    setPaying(true);
    await rechargeUtilityBalance(walletCitizen.qrId, "electricity", rechargeAmount);
    const updated = await getCitizen(walletCitizen.qrId);
    setWalletCitizen(updated);
    setPaying(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        <button onClick={() => navigate("/departments")} className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Departments
        </button>

        <section className="card-gov p-5 mb-6">
          <h2 className="section-title">{department.label}</h2>
          <p className="text-sm text-muted-foreground mt-1">{department.headline}</p>
          <p className="text-sm text-foreground mt-3">{department.description}</p>
        </section>

        {department.id === "health" && (
          <section className="grid md:grid-cols-2 gap-4">
            <div className="card-gov p-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3"><HeartPulse className="h-4 w-4 text-destructive" /> ABHA Records</h3>
              <div className="space-y-2">
                {ogdHealth.map((row) => (
                  <div key={row.patientId} className="rounded-lg bg-muted/60 p-3 text-sm">
                    <p className="font-medium text-foreground">{row.patientId}</p>
                    <p className="text-muted-foreground">District: {row.district}</p>
                    <p className="text-muted-foreground">Last Dose: {row.vaccine} ({row.date})</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-gov p-4">
              <h3 className="font-semibold text-foreground mb-3">Vaccination History Alerts</h3>
              <div className="space-y-3">
                {ogdHealth.map((row) => (
                  <div key={row.patientId + row.date} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{row.patientId}: booster due in 30 days</p>
                      <p className="text-xs text-muted-foreground">Latest vaccine {row.vaccine}</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-md p-1 hover:bg-destructive/20"
                      onClick={() => speakText(getAlertSpeechSummary("Vaccination follow-up", 0, row.date))}
                      aria-label="Speak vaccination alert"
                    >
                      <Volume2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-success/10 border border-success/30 p-3">
                <p className="text-sm font-semibold text-success">Ayushman Bharat Eligibility: Eligible</p>
                <p className="text-xs text-muted-foreground mt-1">Family coverage up to INR 5,00,000 per year is active.</p>
              </div>
            </div>
          </section>
        )}

        {department.id === "agriculture" && (
          <section className="grid md:grid-cols-2 gap-4">
            <div className="card-gov p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Wheat className="h-4 w-4 text-success" /> Soil Health Card</h3>
              <div className="space-y-2">
                {soilCards.map((row) => (
                  <div key={row.village} className="rounded-lg bg-muted/60 p-3 text-sm">
                    <p className="font-medium text-foreground">{row.village}</p>
                    <p className="text-muted-foreground">pH: {row.ph}</p>
                    <p className="text-muted-foreground">Nitrogen: {row.nitrogen}</p>
                    <p className="text-muted-foreground">Potassium: {row.potassium}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-gov p-4">
              <h3 className="font-semibold text-foreground mb-3">PM-Kisan and Mandi Updates</h3>
              <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-sm mb-3">
                <p className="font-semibold text-success">PM-Kisan Status: Active</p>
                <p className="text-muted-foreground">Next installment expected in April cycle.</p>
              </div>
              <div className="space-y-2">
                {mandiPrices.map((row) => (
                  <div key={row.crop + row.mandi} className="rounded-lg border border-border bg-card p-3 text-sm">
                    <p className="font-medium text-foreground">{row.crop} - {row.mandi}</p>
                    <p className="text-muted-foreground">Price: {row.price}</p>
                    <p className="text-muted-foreground">Trend: {row.trend}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {department.id === "finance" && (
          <section className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card-gov p-4">
                <h3 className="font-semibold text-foreground mb-3">PM-Kisan Status</h3>
                <p className="text-sm text-foreground">Beneficiary: Active</p>
                <p className="text-sm text-muted-foreground">Last Installment: INR 2,000 credited on 2026-02-18</p>
              </div>
              <div className="card-gov p-4">
                <h3 className="font-semibold text-foreground mb-3">Atal Pension Yojana</h3>
                <p className="text-sm text-foreground">Contribution: Auto-debit enabled</p>
                <p className="text-sm text-muted-foreground">Next Contribution Date: 2026-04-05</p>
              </div>
            </div>

            <div className="card-gov p-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2"><Wallet className="h-5 w-5 text-primary" /> Recharge Hub - Wallet and Bill Pay</h3>
              <p className="text-xs text-muted-foreground mb-4">Load a QR profile and use Scan to Pay for electricity or water bills. Payment updates Firestore billStatus in real-time.</p>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  value={walletQrId}
                  onChange={(event) => setWalletQrId(event.target.value)}
                  placeholder="Enter BharatQR ID"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <button onClick={loadWalletCitizen} disabled={walletLoading} className="btn-navy text-sm disabled:opacity-70">
                  {walletLoading ? "Loading..." : "Load Wallet"}
                </button>
              </div>

              {!walletCitizen && (
                <p className="text-sm text-muted-foreground">No citizen loaded yet. Use a demo ID like BQR_IND_001.</p>
              )}

              {walletCitizen && (
                <div className="space-y-3">
                  {(() => {
                    const utility = walletCitizen.utilityBalances || { electricity: 0, water: 0, gas: 0 };
                    const lowElectricity = utility.electricity < 100;
                    return (
                      <div className={`rounded-lg p-3 text-sm border ${lowElectricity ? "bg-destructive/10 border-destructive/40" : "bg-success/10 border-success/40"}`}>
                        <p className="font-semibold text-foreground">Main Account Balance: INR {walletCitizen.balance}</p>
                        <p className={lowElectricity ? "text-destructive font-medium" : "text-success font-medium"}>
                          Electricity Balance: INR {utility.electricity} {lowElectricity ? "(Low Balance)" : "(Healthy)"}
                        </p>
                        <p className="text-muted-foreground">Water: INR {utility.water} | Gas: INR {utility.gas}</p>
                      </div>
                    );
                  })()}

                  <div className="rounded-lg bg-muted/60 p-3 text-sm">
                    <p className="font-semibold text-foreground">{walletCitizen.name}</p>
                    <p className="text-muted-foreground">Available Wallet: INR {walletCitizen.balance}</p>
                  </div>

                  <div className="rounded-lg border border-border p-3">
                    <p className="text-sm font-semibold text-foreground mb-2">Recharge Electricity Balance</p>
                    <div className="flex gap-2">
                      {[100, 200, 500].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setRechargeAmount(amount)}
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold ${rechargeAmount === amount ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground"}`}
                        >
                          INR {amount}
                        </button>
                      ))}
                      <button onClick={rechargeElectricity} disabled={paying} className="btn-saffron text-xs ml-auto">
                        {paying ? "Recharging..." : "Recharge"}
                      </button>
                    </div>
                  </div>

                  {pendingUtilityBills.length === 0 && (
                    <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-sm text-success flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Electricity and water bills already paid.
                    </div>
                  )}

                  {pendingUtilityBills.map((bill) => (
                    <div key={bill.label} className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{bill.label}</p>
                        <p className="text-xs text-muted-foreground">INR {bill.amount} due on {bill.dueDate}</p>
                      </div>
                      <button onClick={() => setSelectedBill(bill)} className="btn-saffron text-xs">Scan to Pay</button>
                      <button
                        type="button"
                        className="rounded-md p-1 hover:bg-destructive/20"
                        onClick={() => speakText(getAlertSpeechSummary(bill.label, bill.amount, bill.dueDate))}
                        aria-label="Speak finance alert"
                      >
                        <Volume2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {!["health", "agriculture", "finance"].includes(department.id) && (
          <section className="card-gov p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Active Department Console</h3>
            <p className="text-sm text-muted-foreground mb-3">This is an enabled department sub-dashboard for {department.label}. It is routed and ready for module-specific data integrations.</p>
            <ul className="text-sm text-foreground space-y-2">
              <li>Live dashboard endpoint connected for {department.label}.</li>
              <li>Operator actions and citizen workflows scaffolded.</li>
              <li>Alert cards support multilingual voice summaries.</li>
            </ul>
          </section>
        )}
      </main>

      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedBill(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-5" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2"><ScanLine className="h-5 w-5 text-secondary" /> Simulated UPI Scan</h3>
            <div className="rounded-lg bg-muted p-4 text-center mb-4">
              <p className="text-xs text-muted-foreground">UPI ID</p>
              <p className="font-semibold text-foreground">bharatqr.hub@upi</p>
              <p className="text-xs text-muted-foreground mt-2">Amount</p>
              <p className="text-2xl font-bold text-foreground">INR {selectedBill.amount}</p>
            </div>
            <button onClick={payBill} disabled={paying} className="w-full btn-saffron text-sm disabled:opacity-70">
              {paying ? "Paying..." : "Confirm Pay"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetail;
