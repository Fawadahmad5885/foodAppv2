export type OrderType = "pickup" | "delivery";

export type Branch = {
  id: string;
  name: string;
  areas: { id: string; name: string }[];
};

export const BRANCHES: Branch[] = [
  {
    id: "gulberg",
    name: "Gulberg",
    areas: [
      { id: "mm-alam", name: "MM Alam Road" },
      { id: "liberty", name: "Liberty Market" },
      { id: "gulberg-iii", name: "Gulberg III" },
    ],
  },
  {
    id: "dha",
    name: "DHA",
    areas: [
      { id: "phase-5", name: "Phase 5" },
      { id: "phase-6", name: "Phase 6" },
      { id: "y-block", name: "Y Block" },
    ],
  },
  {
    id: "johar",
    name: "Johar Town",
    areas: [
      { id: "block-a", name: "Block A" },
      { id: "block-h", name: "Block H" },
      { id: "block-r", name: "Block R" },
    ],
  },
];

export function getBranchById(id: string) {
  return BRANCHES.find((b) => b.id === id);
}

export function getAreaById(branchId: string, areaId: string) {
  return getBranchById(branchId)?.areas.find((a) => a.id === areaId);
}
