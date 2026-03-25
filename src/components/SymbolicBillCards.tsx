import { Lightbulb, Droplets, Flame, Smartphone, CheckCircle2, AlertTriangle, Volume2 } from "lucide-react";
import type { BillItem } from "@/types";
import { getAlertSpeechSummary, speakText } from "@/lib/speech";

const iconMap: Record<string, typeof Lightbulb> = {
  Lightbulb,
  Droplets,
  Flame,
  Smartphone,
};

interface Props {
  bills: BillItem[];
  onPayBill: (bill: BillItem) => void;
}

const SymbolicBillCards = ({ bills, onPayBill }: Props) => {
  if (bills.length === 0) {
    return (
      <div className="card-gov p-8 text-center animate-fade-up">
        <CheckCircle2 className="mx-auto h-20 w-20 text-success mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-1">All Clear!</h3>
        <p className="text-sm text-muted-foreground">No pending bills or dues</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-up">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="h-5 w-5 text-destructive animate-blink-alert" />
        <h3 className="section-title text-destructive">Bills Due</h3>
      </div>
      {bills.map((bill, i) => {
        const Icon = iconMap[bill.icon] || Lightbulb;
        return (
          <button
            key={i}
            onClick={() => onPayBill(bill)}
            className="w-full flex items-center gap-4 rounded-2xl border-2 border-destructive bg-destructive/5 p-5 shadow-md hover:shadow-lg hover:bg-destructive/10 transition-all active:scale-[0.98]"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-destructive/15">
              <Icon className="h-9 w-9 text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-lg font-bold text-foreground">{bill.label}</p>
              <p className="text-xs text-muted-foreground">Due: {bill.dueDate}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-destructive">₹{bill.amount}</p>
              <p className="text-xs font-semibold text-destructive">TAP TO PAY</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  speakText(getAlertSpeechSummary(bill.label, bill.amount, bill.dueDate));
                }}
                className="mt-1 rounded-md p-1 hover:bg-destructive/20"
                aria-label={`Speak ${bill.label} alert`}
              >
                <Volume2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SymbolicBillCards;
