import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine, Flashlight, ArrowLeft, AlertCircle, Volume2 } from "lucide-react";
import Header from "@/components/Header";
import { subscribeCitizens, addCitizen, getCitizen } from "@/lib/dataService";
import { getSelectedLanguage, speakText } from "@/lib/speech";
import type { CitizenModel } from "@/types";

type DemoCitizen = Pick<CitizenModel, "qrId" | "name">;

const getScanSpeechText = (key: "identified" | "notFound" | "identityError", citizenName?: string) => {
  const selected = getSelectedLanguage();

  if (selected === "हि") {
    if (key === "identified") return `${citizenName ?? "नागरिक"} की पहचान सफल रही।`;
    if (key === "notFound") return "नागरिक नहीं मिला।";
    return "पहचान नहीं मिली। कृपया नजदीकी सहायता केंद्र से संपर्क करें।";
  }

  if (selected === "த") {
    if (key === "identified") return `${citizenName ?? "குடிமகன்"} அடையாளம் வெற்றிகரமாக உறுதிப்படுத்தப்பட்டது.`;
    if (key === "notFound") return "குடிமகன் கிடைக்கவில்லை.";
    return "அடையாளம் கிடைக்கவில்லை. அருகிலுள்ள உதவி மையத்தை தொடர்பு கொள்ளவும்.";
  }

  if (selected === "త") {
    if (key === "identified") return `${citizenName ?? "పౌరుడు"} గుర్తింపు విజయవంతంగా పూర్తైంది.`;
    if (key === "notFound") return "పౌరుడు కనబడలేదు.";
    return "గుర్తింపు దొరకలేదు. దయచేసి సమీప హెల్ప్ డెస్క్‌ను సంప్రదించండి.";
  }

  if (key === "identified") return `${citizenName ?? "Citizen"} identified successfully.`;
  if (key === "notFound") return "Citizen not found.";
  return "Identity not found. Please contact nearest help desk.";
};

const BQR_ID_PATTERN = /BQR_[A-Z]+_\d+/i;
const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

const extractCitizenIdFromQr = (rawValue: string): string | null => {
  const raw = rawValue.trim();
  if (!raw) {
    return null;
  }

  const bqrMatch = raw.match(BQR_ID_PATTERN);
  if (bqrMatch?.[0]) {
    return bqrMatch[0].toUpperCase();
  }

  const uuidMatch = raw.match(UUID_PATTERN);
  if (uuidMatch?.[0]) {
    return uuidMatch[0];
  }

  // Support QR payloads that encode route links like /dashboard/:id or /citizen/:id.
  try {
    const url = new URL(raw);
    const fromQuery = url.searchParams.get("id")?.trim();
    if (fromQuery) {
      const bqrFromQuery = fromQuery.match(BQR_ID_PATTERN)?.[0];
      if (bqrFromQuery) {
        return bqrFromQuery.toUpperCase();
      }
      const uuidFromQuery = fromQuery.match(UUID_PATTERN)?.[0];
      if (uuidFromQuery) {
        return uuidFromQuery;
      }
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const routeIndex = parts.findIndex((part) => part === "dashboard" || part === "citizen");
    if (routeIndex >= 0 && parts[routeIndex + 1]) {
      const candidate = decodeURIComponent(parts[routeIndex + 1]).trim();
      const bqrFromPath = candidate.match(BQR_ID_PATTERN)?.[0];
      if (bqrFromPath) {
        return bqrFromPath.toUpperCase();
      }
      const uuidFromPath = candidate.match(UUID_PATTERN)?.[0];
      if (uuidFromPath) {
        return uuidFromPath;
      }
    }
  } catch {
    // Non-URL payloads are expected for many scanners.
  }

  return null;
};

const Scan = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState(false);
  const [demoCitizens, setDemoCitizens] = useState<DemoCitizen[]>([]);
  const [cameraMessage, setCameraMessage] = useState("Initializing physical scanner...");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
                setDemoCitizens(sampleCitizens.map((c) => ({ qrId: c.qrId, name: c.name })));
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
                setDemoCitizens([
                  { qrId: "BQR_IND_001", name: "Sunita Devi" },
                  { qrId: "BQR_IND_002", name: "Ramesh Kumar" },
                  { qrId: "BQR_IND_003", name: "Fatima Begum" },
                ]);
              }
            });
          } else {
            setDemoCitizens(list.map((c) => ({ qrId: c.qrId, name: c.name })));
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

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const setupPhysicalScanner = async () => {
      const Detector = (window as Window & { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (el: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;

      if (!Detector || !navigator.mediaDevices?.getUserMedia) {
        setCameraMessage("Physical scanner unavailable. Use Simulate Scan.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (!isMounted || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraMessage("Physical scanner active. Point camera to BharatQR code.");

        const detector = new Detector({ formats: ["qr_code"] });
        intervalId = setInterval(async () => {
          if (!videoRef.current || scanning) {
            return;
          }

          try {
            const codes = await detector.detect(videoRef.current);
            if (!codes.length) {
              return;
            }

            const extractedId = extractCitizenIdFromQr(codes[0].rawValue || "");
            if (!extractedId) {
              return;
            }

            setScanning(true);
            setError(false);

            const citizen = await getCitizen(extractedId);
            if (citizen) {
              speakText(getScanSpeechText("identified", citizen.name));
              navigate(`/citizen/${extractedId}`);
              return;
            }

            setError(true);
            setScanning(false);
          } catch {
            // Ignore transient detector failures.
          }
        }, 300);
      } catch {
        setCameraMessage("Camera access blocked. Allow camera permission or use Simulate Scan.");
      }
    };

    setupPhysicalScanner();

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [navigate, scanning]);

  const simulateScan = async (id: string) => {
    setScanning(true);
    setError(false);

    // Fetch and speak in parallel, then navigate quickly for better UX.
    getCitizen(id)
      .then((citizen) => {
      if (citizen) {
          speakText(getScanSpeechText("identified", citizen.name));
      } else {
          speakText(getScanSpeechText("notFound"));
      }
      })
      .catch((err) => {
        console.error(err);
      });

    setTimeout(() => {
      navigate(`/citizen/${id}`);
    }, 350);
  };

  const simulateUnknown = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setError(true);
    }, 600);
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
          <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover opacity-50" playsInline muted autoPlay />
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
                <p className="text-[11px] text-muted-foreground mt-1">{cameraMessage}</p>
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
            <button
              type="button"
              className="rounded-md p-1 hover:bg-destructive/20"
              onClick={() => speakText(getScanSpeechText("identityError"))}
              aria-label="Speak identity error"
            >
              <Volume2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
        )}

        {/* Simulate scan buttons */}
        <div className="w-full max-w-sm">
          <p className="text-xs text-muted-foreground text-center mb-3 uppercase tracking-wider font-medium">Simulate Scan</p>
          <div className="grid gap-2">
            {demoCitizens.map((citizen) => (
              <button
                key={citizen.qrId}
                disabled={scanning}
                onClick={() => simulateScan(citizen.qrId)}
                className="btn-navy w-full text-sm disabled:opacity-50"
              >
                {citizen.name} · {citizen.qrId}
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
