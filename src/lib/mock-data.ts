import { aboutSummary, hardwareOfferings, pricingApproach, services, whyChooseUs } from "@/lib/site";

export const siteSnapshot = {
  aboutSummary,
  services,
  hardwareOfferings,
  whyChooseUs,
  pricingApproach,
};

export const seedContacts = [
  {
    id: "contact-seed-1",
    name: "Seguin Family Office",
    company_name: "Seguin Family Office",
    status: "prospect",
    stage: "Consultation Scheduled",
    service_agreement: "Managed IT Services",
  },
  {
    id: "contact-seed-2",
    name: "New Braunfels Retail Group",
    company_name: "New Braunfels Retail Group",
    status: "client",
    stage: "Client",
    service_agreement: "Managed IT + Hardware Procurement",
  },
];

export const seedEstimates = [
  {
    id: "estimate-seed-1",
    estimate_number: "EST-1001",
    contact_name: "Seguin Family Office",
    status: "finalized",
    sell_total: 1850,
    internal_total: 1325,
  },
];
