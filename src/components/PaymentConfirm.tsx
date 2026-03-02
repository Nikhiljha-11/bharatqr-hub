import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { BillItem } from "@/types";

interface Props {
  bill: BillItem;
  onClose: () => void;
}

const PaymentConfirm = ({ bill, onClose }: Props) => {
  const [paid, setPaid] = useState(false);

  if (paid) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl animate-fade-up text-center" onClick={(e) => e.stopPropagation()}>
          <CheckCircle2 className="mx-auto h-20 w-20 text-success mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">Payment Successful</h3>
          <p className="text-muted-foreground mb-6">₹{bill.amount} paid for {bill.label}</p>
          <button onClick={onClose} className="btn-saffron w-full text-sm">Done</button>
        </div>
      </div>
    );
  }

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
          onClick={() => setPaid(true)}
          className="w-full rounded-xl bg-success py-4 text-lg font-bold text-success-foreground shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
          ✓ Pay Now
        </button>
      </div>
    </div>
  );
};

export default PaymentConfirm;
