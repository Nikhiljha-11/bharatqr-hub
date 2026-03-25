const langCodeMap: Record<string, string> = {
  EN: "en-IN",
  "हि": "hi-IN",
  "த": "ta-IN",
};

function getSelectedLanguage() {
  if (typeof window === "undefined") {
    return "EN";
  }
  return localStorage.getItem("bqr_lang") || "EN";
}

export function speakText(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const utter = new SpeechSynthesisUtterance(text);
  const selected = getSelectedLanguage();
  utter.lang = langCodeMap[selected] || "en-IN";
  utter.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function getAlertSpeechSummary(label: string, amount: number, dueDate: string) {
  const selected = getSelectedLanguage();

  if (selected === "हि") {
    return `${label} का बिल ${amount} रुपये बकाया है। अंतिम तिथि ${dueDate} है। कृपया तुरंत भुगतान करें।`;
  }

  if (selected === "த") {
    return `${label} கட்டணம் ரூபாய் ${amount} நிலுவையில் உள்ளது. கடைசி தேதி ${dueDate}. தயவுசெய்து உடனே செலுத்துங்கள்.`;
  }

  return `${label} bill of rupees ${amount} is pending. Due date is ${dueDate}. Please pay soon.`;
}
