// Shared type definitions for the application

export interface BillItem {
  type: "electricity" | "water" | "gas" | "mobile";
  label: string;
  amount: number;
  dueDate: string;
  icon: string;
  status?: "Pending" | "Paid";
}

export interface CitizenDocument {
  name: string;
  type: string;
  issued: string;
  contentUrl?: string;
  mimeType?: string;
  requiresBiometric?: boolean;
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
  utilityBalances?: {
    electricity: number;
    water: number;
    gas: number;
  };
  bills: BillItem[];
  billStatus?: Record<string, "Pending" | "Paid">;
  documents: CitizenDocument[];
  healthRecords: { condition: string; date: string; doctor: string }[];
  prescriptions: { medicine: string; dosage: string; duration: string }[];
}

export interface BiometricChallenge {
  id: string;
  qrId: string;
  status: "pending" | "approved" | "rejected" | "expired";
  purpose: "reveal" | "document";
  field?: "aadhaar" | "abha";
  documentName?: string;
  documentAction?: "view" | "download";
  createdAt: string;
  expiresAt: string;
  approvedAt?: string;
}
