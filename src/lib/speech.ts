export type BharatQrLanguage = "EN" | "हि" | "த" | "త";

const langCodeMap: Record<BharatQrLanguage, string> = {
  EN: "en-IN",
  "हि": "hi-IN",
  "த": "ta-IN",
  "త": "te-IN",
};

function normalizeLanguage(input: string | null): BharatQrLanguage {
  if (input === "EN" || input === "हि" || input === "த" || input === "త") {
    return input;
  }

  // Backward compatibility for old label-based values.
  if (input === "English") return "EN";
  if (input === "हिन्दी") return "हि";
  if (input === "தமிழ்") return "த";
  if (input === "తెలుగు") return "త";

  return "हि";
}

export function getSelectedLanguage(): BharatQrLanguage {
  if (typeof window === "undefined") {
    return "हि";
  }

  return normalizeLanguage(localStorage.getItem("bqr_lang"));
}

export function setSelectedLanguage(language: BharatQrLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("bqr_lang", language);
}

export function speakText(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const utter = new SpeechSynthesisUtterance(text);
  const selected = getSelectedLanguage();
  utter.lang = langCodeMap[selected] || "hi-IN";
  utter.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
}

export function getAlertSpeechSummary(label: string, amount: number, dueDate: string) {
  const selected = getSelectedLanguage();

  if (selected === "हि") {
    return `${label} का बिल ${amount} रुपये बकाया है। अंतिम तिथि ${dueDate} है। कृपया तुरंत भुगतान करें।`;
  }

  if (selected === "த") {
    return `${label} கட்டணம் ரூபாய் ${amount} நிலுவையில் உள்ளது. கடைசி தேதி ${dueDate}. தயவுசெய்து உடனே செலுத்துங்கள்.`;
  }

  if (selected === "త") {
    return `${label} బిల్ రూ. ${amount} పెండింగ్‌లో ఉంది. చివరి తేదీ ${dueDate}. దయచేసి వెంటనే చెల్లించండి.`;
  }

  return `${label} bill of rupees ${amount} is pending. Due date is ${dueDate}. Please pay soon.`;
}
