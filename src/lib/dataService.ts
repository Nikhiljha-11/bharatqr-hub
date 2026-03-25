import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { BiometricChallenge, CitizenModel } from "@/types";

const citizensCol = collection(db, "citizens");
const biometricChallengesCol = collection(db, "biometricChallenges");

// fetch all citizens once
export async function fetchCitizens(): Promise<CitizenModel[]> {
  const snapshot = await getDocs(citizensCol);
  return snapshot.docs.map((d) => d.data() as CitizenModel);
}

// realtime listener
export function subscribeCitizens(callback: (citizens: CitizenModel[]) => void) {
  return onSnapshot(citizensCol, (snapshot) => {
    const list = snapshot.docs.map((d) => d.data() as CitizenModel);
    callback(list);
  });
}

export function subscribeCitizen(qrId: string, callback: (citizen: CitizenModel | null) => void) {
  const q = doc(db, "citizens", qrId);
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback(snapshot.data() as CitizenModel);
  });
}

// add or overwrite a citizen using their qrId as the document key
export async function addCitizen(citizen: CitizenModel) {
  const ref = doc(citizensCol, citizen.qrId);
  await setDoc(ref, citizen);
}

export async function deleteCitizen(qrId: string) {
  const q = doc(db, "citizens", qrId);
  await deleteDoc(q);
}

export async function getCitizen(qrId: string): Promise<CitizenModel | null> {
  const q = doc(db, "citizens", qrId);
  const snap = await getDoc(q);
  if (snap.exists()) {
    return snap.data() as CitizenModel;
  }
  return null;
}

export async function updateCitizen(qrId: string, data: Partial<CitizenModel>) {
  const q = doc(db, "citizens", qrId);
  await updateDoc(q, data);
}

export async function markBillPaid(qrId: string, billLabel: string) {
  const q = doc(db, "citizens", qrId);
  const snap = await getDoc(q);
  if (!snap.exists()) {
    return;
  }

  const citizen = snap.data() as CitizenModel;
  const nextBills = (citizen.bills || []).map((bill) =>
    bill.label === billLabel ? { ...bill, status: "Paid" as const } : bill,
  );

  const nextStatus = {
    ...(citizen.billStatus || {}),
    [billLabel]: "Paid" as const,
  };

  await updateDoc(q, {
    bills: nextBills,
    billStatus: nextStatus,
  });
}

export async function rechargeUtilityBalance(
  qrId: string,
  utility: "electricity" | "water" | "gas",
  amount: number,
) {
  const q = doc(db, "citizens", qrId);
  const snap = await getDoc(q);
  if (!snap.exists()) {
    return;
  }

  const citizen = snap.data() as CitizenModel;
  const prevBalances = citizen.utilityBalances || {
    electricity: 0,
    water: 0,
    gas: 0,
  };

  const nextBalances = {
    ...prevBalances,
    [utility]: Math.max(0, (prevBalances[utility] || 0) + amount),
  };

  await updateDoc(q, {
    utilityBalances: nextBalances,
  });
}

export async function createBiometricChallenge(input: {
  qrId: string;
  purpose: "reveal" | "document";
  field?: "aadhaar" | "abha";
  documentName?: string;
  documentAction?: "view" | "download";
  expiresInMinutes?: number;
}): Promise<string> {
  const expiresInMinutes = input.expiresInMinutes || 3;
  const challengeRef = doc(biometricChallengesCol);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000).toISOString();

  const challenge: BiometricChallenge = {
    id: challengeRef.id,
    qrId: input.qrId,
    status: "pending",
    purpose: input.purpose,
    field: input.field,
    documentName: input.documentName,
    documentAction: input.documentAction,
    createdAt: now.toISOString(),
    expiresAt,
  };

  await setDoc(challengeRef, challenge);
  return challengeRef.id;
}

export async function getBiometricChallenge(challengeId: string): Promise<BiometricChallenge | null> {
  const challengeRef = doc(db, "biometricChallenges", challengeId);
  const snap = await getDoc(challengeRef);
  if (!snap.exists()) {
    return null;
  }
  return snap.data() as BiometricChallenge;
}

export function subscribeBiometricChallenge(
  challengeId: string,
  callback: (challenge: BiometricChallenge | null) => void,
) {
  const challengeRef = doc(db, "biometricChallenges", challengeId);
  return onSnapshot(challengeRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback(snapshot.data() as BiometricChallenge);
  });
}

export async function approveBiometricChallenge(challengeId: string) {
  const challengeRef = doc(db, "biometricChallenges", challengeId);
  await updateDoc(challengeRef, {
    status: "approved",
    approvedAt: new Date().toISOString(),
  });
}

export async function expireBiometricChallenge(challengeId: string) {
  const challengeRef = doc(db, "biometricChallenges", challengeId);
  await updateDoc(challengeRef, {
    status: "expired",
  });
}
