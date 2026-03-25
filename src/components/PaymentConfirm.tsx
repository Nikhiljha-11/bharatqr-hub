import { useState } from "react";
import { X } from "lucide-react";
import type { BillItem } from "@/types";

interface Props {
  bill: BillItem;
  qrId: string;
  onClose: () => void;
}

const PaymentConfirm = ({ bill, qrId, onClose }: Props) => {
  const [processing, setProcessing] = useState(false);

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

        <button
          onClick={async () => {
            setProcessing(true);
            const url = `https://www.bharat-connect.com/?qrId=${encodeURIComponent(qrId)}&bill=${encodeURIComponent(bill.label)}&amount=${bill.amount}`;
            window.open(url, "_blank", "noopener,noreferrer");
            setProcessing(false);
            onClose();
          }}
          disabled={processing}
          className="w-full rounded-xl bg-success py-4 text-lg font-bold text-success-foreground shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
        >
          {processing ? "Redirecting..." : "Proceed to Bharat Connect"}
        </button>
      </div>
    </div>
  );
};

export default PaymentConfirm;
