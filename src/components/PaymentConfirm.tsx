import { useState } from "react";
import { X } from "lucide-react";
import type { BillItem } from "@/types";
import { toast } from "sonner";
import { getOfflinePaymentCount, queueOfflinePayment } from "@/lib/offlinePayments";

interface Props {
  bill: BillItem;
  qrId: string;
  onClose: () => void;
}

const PaymentConfirm = ({ bill, qrId, onClose }: Props) => {
  const [processing, setProcessing] = useState(false);

  const url = `https://www.bharat-connect.com/?qrId=${encodeURIComponent(qrId)}&bill=${encodeURIComponent(bill.label)}&amount=${bill.amount}`;

  const handlePayment = async () => {
    setProcessing(true);

    if (!navigator.onLine) {
      const count = queueOfflinePayment({
        qrId,
        billLabel: bill.label,
        amount: bill.amount,
        url,
      });
      setProcessing(false);
      toast.warning(`No connectivity. Payment queued securely (${count} pending).`);
      onClose();
      return;
    }

    const queued = getOfflinePaymentCount();
    if (queued > 0) {
      toast.info(`${queued} queued payment${queued > 1 ? "s" : ""} will auto-execute when online.`);
    }

    window.open(url, "_blank", "noopener,noreferrer");
    setProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Confirm Payment</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="rounded-xl bg-muted p-4 mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">{bill.label}</p>
          <p className="text-4xl font-bold text-foreground">₹{bill.amount}</p>
          <p className="text-xs text-muted-foreground mt-1">Due: {bill.dueDate}</p>
        </div>

        {processing ? (
          <div className="space-y-3">
            <div className="h-4 w-full rounded-md animate-shimmer" />
            <div className="h-4 w-3/4 rounded-md animate-shimmer" />
            <div className="h-12 w-full rounded-xl bg-success/20 animate-shimmer" />
            <p className="text-xs text-muted-foreground text-center">Processing securely...</p>
          </div>
        ) : (
          <button
            onClick={handlePayment}
            disabled={processing}
            className="w-full rounded-xl bg-success py-4 text-lg font-bold text-success-foreground shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
          >
            Proceed to Bharat Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirm;
