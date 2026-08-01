export const company = {
  name: "The Shack - IT Solutions",
  domain: "theshackit.com",
  serviceArea: ["Seguin", "New Braunfels", "San Marcos", "Remote"],
  bookingUrl: process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL ?? "https://calendly.com/john-shackles-widq/30min",
  tone: "Modern trust-first IT support for growing businesses.",
};

export const hero = {
  headline: "The Shack - IT Services You Can Trust",
  subheadline: "Hardware - Software - MSP - Projects - More",
};

export const aboutSummary =
  "Here at The Shack, we put our clients mission first. We curate our IT solutions to best suite where you are now, as well as where you plan to go! With nearly a decade of IT experience in on-premise and cloud infrastructures, we make sure we have a solution that fits your organization - not the other way around.";

export const whyChooseUs = [
  "Experts in making it work: Either we have the solution, or we find the solution - no middle ground.",
  "Affordable IT that doesn't compromise: IT that flexes to your budget without cutting corners.",
  "Dedicated to learning: Always keeping current with new and emerging technologies and threats.",
];

export const services = [
  {
    name: "IT Consulting",
    description: "Strategic guidance for growth, modernization, and risk reduction.",
    pricing: "Fixed or hourly depending on scope",
  },
  {
    name: "Hardware Procurement",
    description: "Laptops, desktops, peripherals, software, and network equipment sourcing.",
    pricing: "Variable for a-la-cart hardware / quote-based for bundles",
  },
  {
    name: "Device Troubleshooting",
    description: "Windows, Mac OS, printers, desktops, and general endpoint support.",
    pricing: "Hourly or tiered service pricing",
  },
  {
    name: "Managed IT Services",
    description: "Help desk, monitoring, and support defined by service agreement.",
    pricing: "Included in contract / tiered",
  },
  {
    name: "IT Projects",
    description: "Website builds, app builds, and network refresh initiatives.",
    pricing: "Fixed, hourly, or mixed by project",
  },
];

export const optionalServices = [
  "Inquire to learn about all of our available services",
  "More coming soon",
];

export const hardwareOfferings = [
  "Laptops and desktops",
  "Peripherals",
  "Software",
  "Network equipment",
];

export const crmStages = [
  "Lead",
  "Prospect",
  "Consultation Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Client",
  "Inactive",
];

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export const pricingApproach = [
  { label: "Services", value: "Fixed / Hourly / Tiered / Mixed / Included in Contract" },
  { label: "Hardware", value: "Variable / Quote-Based" },
  { label: "Internal cost", value: "Stored for admin use only" },
  { label: "Markup", value: "Stored and calculated for admin use only" },
  { label: "Client visibility", value: "Sell price only" },
];

export const dashboardRoles = ["user", "client", "admin"] as const;
export type DashboardRole = (typeof dashboardRoles)[number];
