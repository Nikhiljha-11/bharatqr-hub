import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine, Flashlight, ArrowLeft, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { subscribeCitizens, addCitizen, getCitizen } from "@/lib/dataService";

const Scan = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState(false);
  const [qrIds, setQrIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    let loadAttempts = 0;
    const maxRetries = 3;
    
    const loadCitizens = () => {
      const unsub = subscribeCitizens((list) => {
        if (isMounted) {
          if (list.length === 0 && loadAttempts < maxRetries) {
            // If no data and retries left, seed sample data
            loadAttempts++;
            import("@/data/sampleData").then(({ sampleCitizens }) => {
              if (isMounted) {
                setQrIds(sampleCitizens.map((c) => c.qrId));
                // Try to add them to Firestore if not already there
                sampleCitizens.forEach((c) => {
                  addCitizen(c).catch(() => {
                    // Silently fail if already exists
                  });
                });
              }
            }).catch(() => {
              // Fallback: show demo IDs even if import fails
              if (isMounted) {
                setQrIds(["BQR_IND_001", "BQR_IND_002", "BQR_IND_003"]);
              }
            });
          } else {
            setQrIds(list.map((c) => c.qrId));
          }
        }
      });
      return unsub;
    };
    
    const unsub = loadCitizens();
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const speak = (text: string) => {
    // built‑in browser TTS – works offline and doesn't require keys
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(text);
      // choose locale/voice; hi-IN for Hindi or en-IN for English
      utter.lang = "hi-IN";
      utter.volume = 1; // loudness (0–1)
      window.speechSynthesis.speak(utter);
    }
    // 📌 If you'd like to use Bhāṣini AI for more natural voices:
    //   fetch("https://api.bhasini.ai/tts", {
    //     method: "POST",
    //     headers: {
    //       "Authorization": `Bearer ${import.meta.env.VITE_BHASINI_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       text,
    //       language: "hi-IN",
    //       voice: "alloy",
    //     }),
    //   })
    //     .then((r) => r.blob())
    //     .then((blob) => {
    //       const url = URL.createObjectURL(blob);
    //       const audio = new Audio(url);
    //       audio.volume = 1;
    //       audio.play();
    //     });
  };

  const simulateScan = async (id: string) => {
    setScanning(true);
    setError(false);

    // optionally fetch citizen details and speak name
    try {
      const citizen = await getCitizen(id);
      if (citizen) {
        speak(`${citizen.name} की पहचान सफल रही।`);
      } else {
        speak("ग्राहक नहीं मिला");
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      navigate(`/dashboard/${id}`);
    }, 1500);
  };

  const simulateUnknown = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setError(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <button onClick={() => navigate("/")} className="self-start mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        {/* Scanner viewport */}
        <div className="relative w-full max-w-sm aspect-square rounded-2xl bg-primary/5 border-2 border-dashed border-primary/30 flex items-center justify-center mb-8 overflow-hidden">
          {scanning ? (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Scanning...</p>
            </div>
          ) : (
            <>
              {/* Focus box */}
              <div className="absolute inset-8 border-2 border-primary/40 rounded-lg">
                <div className="absolute -top-[2px] -left-[2px] h-6 w-6 border-t-2 border-l-2 border-secondary rounded-tl-md" />
                <div className="absolute -top-[2px] -right-[2px] h-6 w-6 border-t-2 border-r-2 border-secondary rounded-tr-md" />
                <div className="absolute -bottom-[2px] -left-[2px] h-6 w-6 border-b-2 border-l-2 border-secondary rounded-bl-md" />
                <div className="absolute -bottom-[2px] -right-[2px] h-6 w-6 border-b-2 border-r-2 border-secondary rounded-br-md" />
              </div>
              <div className="text-center z-10">
                <ScanLine className="mx-auto h-12 w-12 text-primary/40 mb-2" />
                <p className="text-sm text-muted-foreground">Position QR code here</p>
              </div>
            </>
          )}
        </div>

        {/* Flashlight toggle */}
        <button
          onClick={() => setFlashOn(!flashOn)}
          className={`mb-8 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
            flashOn ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <Flashlight className="h-4 w-4" />
          Flashlight {flashOn ? "ON" : "OFF"}
        </button>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 max-w-sm w-full animate-fade-up">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">Identity Not Found</p>
              <p className="text-xs text-muted-foreground mt-0.5">This QR code is not registered. Contact a Help Desk near you.</p>
              <button className="mt-2 text-xs font-semibold text-secondary hover:underline">Find Nearest Help Desk →</button>
            </div>
          </div>
        )}

        {/* Simulate scan buttons */}
        <div className="w-full max-w-sm">
          <p className="text-xs text-muted-foreground text-center mb-3 uppercase tracking-wider font-medium">Simulate Scan</p>
          <div className="grid gap-2">
            {qrIds.map((id) => (
              <button
                key={id}
                disabled={scanning}
                onClick={() => simulateScan(id)}
                className="btn-navy w-full text-sm disabled:opacity-50"
              >
                {id}
              </button>
            ))}
            <button
              disabled={scanning}
              onClick={simulateUnknown}
              className="w-full rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 disabled:opacity-50"
            >
              Unknown QR (Error Test)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Scan;
