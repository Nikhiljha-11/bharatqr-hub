export interface OfflinePaymentItem {
  id: string;
  qrId: string;
  billLabel: string;
  amount: number;
  url: string;
  createdAt: string;
}

const OFFLINE_PAYMENT_KEY = "bqr_offline_payments_v1";

function readQueue(): OfflinePaymentItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(OFFLINE_PAYMENT_KEY) || "[]");
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

function writeQueue(items: OfflinePaymentItem[]) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(OFFLINE_PAYMENT_KEY, JSON.stringify(items));
}

export function queueOfflinePayment(item: Omit<OfflinePaymentItem, "id" | "createdAt">) {
  const queue = readQueue();
  queue.push({
    ...item,
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  });
  writeQueue(queue);
  return queue.length;
}

async function notifyPaymentExecution(item: OfflinePaymentItem) {
  if (typeof window === "undefined") {
    return;
  }

  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      return;
    }
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const text = `${item.billLabel} payment is now being executed.`;
  if (navigator.serviceWorker?.ready) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("BharatQR Offline Queue", {
      body: text,
      tag: item.id,
    });
    return;
  }

  new Notification("BharatQR Offline Queue", { body: text });
}

function executePaymentUrl(url: string) {
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) {
    window.location.assign(url);
  }
}

export async function flushOfflinePayments() {
  if (typeof window === "undefined" || !navigator.onLine) {
    return 0;
  }

  const queue = readQueue();
  if (!queue.length) {
    return 0;
  }

  writeQueue([]);

  for (const item of queue) {
    await notifyPaymentExecution(item);
    executePaymentUrl(item.url);
  }

  return queue.length;
}

export function getOfflinePaymentCount() {
  return readQueue().length;
}
