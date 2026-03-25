import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Fingerprint, ShieldAlert } from "lucide-react";
import Header from "@/components/Header";
import { approveBiometricChallenge, getBiometricChallenge } from "@/lib/dataService";
import { authenticateWithPlatformBiometrics } from "@/lib/webauthn";
import type { BiometricChallenge } from "@/types";
import { toast } from "sonner";

const BiometricApproval = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<BiometricChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    getBiometricChallenge(challengeId)
      .then((data) => {
        setChallenge(data);
      })
      .finally(() => setLoading(false));
  }, [challengeId]);

  const isExpired = challenge ? new Date(challenge.expiresAt).getTime() < Date.now() : false;

  const handleApprove = async () => {
    if (!challengeId || !challenge) {
      return;
    }

    if (isExpired || challenge.status !== "pending") {
      toast.error("This request is no longer active.");
      return;
    }

    setProcessing(true);
    const verified = await authenticateWithPlatformBiometrics();
    if (!verified) {
      setProcessing(false);
      toast.error("Biometric verification failed on this device.");
      return;
    }

    await approveBiometricChallenge(challengeId);
    setChallenge((prev) => (prev ? { ...prev, status: "approved", approvedAt: new Date().toISOString() } : prev));
    setProcessing(false);
    toast.success("Verified. You can now continue on the first device.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-lg px-4 py-12">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Loading biometric request...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!challengeId || !challenge) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-lg px-4 py-12">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              <p className="font-semibold">Invalid request</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">This biometric approval link is invalid or unavailable.</p>
          </div>
        </div>
      </div>
    );
  }

  const isDone = challenge.status === "approved";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-bold text-foreground">Cross-Device Biometric Approval</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use this device biometric to approve secure access for ID {challenge.qrId}.</p>

          <div className="mt-4 rounded-xl bg-muted/60 p-4 text-sm">
            <p>
              Purpose: {challenge.purpose === "document" ? "Document Access" : "Sensitive ID Reveal"}
            </p>
            {challenge.documentName && <p>Document: {challenge.documentName}</p>}
            {challenge.field && <p>Field: {challenge.field.toUpperCase()}</p>}
          </div>

          {isDone ? (
            <div className="mt-5 rounded-xl bg-success/10 p-4 text-success">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5" /> Approved
              </div>
              <p className="mt-1 text-sm">Verification is complete. Return to the original device.</p>
            </div>
          ) : (
            <button
              type="button"
              disabled={processing || isExpired}
              onClick={handleApprove}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              <Fingerprint className="h-4 w-4" />
              {processing ? "Verifying..." : isExpired ? "Request Expired" : "Verify with this device"}
            </button>
          )}

          <button
            type="button"
            className="mt-3 w-full rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default BiometricApproval;
