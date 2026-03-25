export type DepartmentId =
  | "health"
  | "finance"
  | "agriculture"
  | "education"
  | "water-resources"
  | "defence"
  | "railways"
  | "industry"
  | "housing";

export interface DepartmentMeta {
  id: DepartmentId;
  label: string;
  headline: string;
  description: string;
}

export const departmentList: DepartmentMeta[] = [
  {
    id: "health",
    label: "Health",
    headline: "ABHA-linked rural health records",
    description: "ABHA profile snapshots with immunization and visit history.",
  },
  {
    id: "finance",
    label: "Finance",
    headline: "Direct benefit and recharge services",
    description: "PM-Kisan, APY status, and utility bill pay with simulated UPI scan.",
  },
  {
    id: "agriculture",
    label: "Agriculture",
    headline: "Soil and mandi intelligence",
    description: "Soil Health Card indicators and mandi market alerts from OGD-style samples.",
  },
  {
    id: "education",
    label: "Education",
    headline: "Scholarship and attendance monitor",
    description: "Student scholarship progress and district attendance rollups.",
  },
  {
    id: "water-resources",
    label: "Water Resources",
    headline: "Village water risk board",
    description: "Reservoir levels and drinking-water tanker dispatch signals.",
  },
  {
    id: "defence",
    label: "Defence",
    headline: "Veteran welfare desk",
    description: "Ex-servicemen pension and hospital referral checkpoints.",
  },
  {
    id: "railways",
    label: "Railways",
    headline: "Rail citizen facilitation",
    description: "Rural mobility routes and assisted booking counters.",
  },
  {
    id: "industry",
    label: "Industry",
    headline: "MSME support panel",
    description: "District cluster grants and permit lifecycle status.",
  },
  {
    id: "housing",
    label: "Housing",
    headline: "Affordable housing tracker",
    description: "PMAY allotment queue and document-verification status.",
  },
];

export const departmentById = Object.fromEntries(
  departmentList.map((department) => [department.id, department]),
) as Record<DepartmentId, DepartmentMeta>;
