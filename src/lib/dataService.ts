import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { CitizenModel } from "@/types";

const citizensCol = collection(db, "citizens");

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
