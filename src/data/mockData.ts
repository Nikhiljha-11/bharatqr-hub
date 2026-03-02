import { BillItem, CitizenModel } from "@/types";

// placeholder for compatibility; real data lives in Firestore
export const citizens: Record<string, CitizenModel> = {};


export const impactStats = {
  citizensServed: 202078,
  servicesIntegrated: 12,
  projectsCompleted: 88856,
  activeSchemes: 47,
};

export function getBhashiniGreeting(citizen: CitizenModel): string {
  const lowBalance = citizen.balance < 100;
  let greeting = `Namaste ${citizen.name}, `;
  
  if (citizen.bills.length > 0) {
    const topBill = citizen.bills[0];
    greeting += `your ${topBill.label.toLowerCase()} of ₹${topBill.amount} is due. `;
  } else {
    greeting += `all your bills are clear! `;
  }
  
  if (lowBalance) {
    greeting += `Alert: Your account balance is ₹${citizen.balance}. Please recharge soon. `;
  }
  greeting += `You have ${citizen.documents.length} documents and ${citizen.healthRecords.length} health records on file.`;
  return greeting;
}
