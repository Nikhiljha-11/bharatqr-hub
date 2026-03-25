import { useEffect, useState } from "react";
import { Volume2, X } from "lucide-react";
import { speakText } from "@/lib/speech";

interface Props {
  text: string;
  onClose: () => void;
}

const AIVoiceModal = ({ text, onClose }: Props) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    speakText(text);

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-card p-6 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20">
              <Volume2 className="h-4 w-4 text-secondary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Bhashini AI Assistant</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Speaking indicator */}
        {!done && (
          <div className="flex items-center gap-1 mb-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-3 w-1 rounded-full bg-secondary"
                style={{
                  animation: `pulse 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                  transformOrigin: "bottom",
                }}
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">Speaking...</span>
          </div>
        )}

        <p className="text-base leading-relaxed text-foreground min-h-[4rem]">
          {displayed}
          {!done && <span className="inline-block w-0.5 h-4 bg-secondary ml-0.5 animate-pulse" />}
        </p>

        {done && (
          <button onClick={onClose} className="mt-4 btn-saffron w-full text-sm">
            Continue to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default AIVoiceModal;
