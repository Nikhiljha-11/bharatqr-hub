// Shared type definitions for the application

export interface BillItem {
  type: "electricity" | "water" | "gas" | "mobile";
  label: string;
  amount: number;
  dueDate: string;
  icon: string;
}

export interface CitizenModel {
  qrId: string;
  name: string;
  nameHindi: string;
  aadhaar: string;
  voterId: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  abhaId: string;
  balance: number;
  bills: BillItem[];
  documents: { name: string; type: string; issued: string }[];
  healthRecords: { condition: string; date: string; doctor: string }[];
  prescriptions: { medicine: string; dosage: string; duration: string }[];
}
