import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { flushOfflinePayments } from "./lib/offlinePayments";

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js").catch(() => {
			// Keep app boot resilient even if service worker registration fails.
		});
	});
}

const flushQueueOnConnectivity = async () => {
	await flushOfflinePayments();
};

window.addEventListener("online", flushQueueOnConnectivity);
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible" && navigator.onLine) {
		flushQueueOnConnectivity();
	}
});
