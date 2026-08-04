import { getCurrentAuth } from "@/lib/auth";
import { aboutSummary as fallbackAboutSummary, company as fallbackCompany, hero as fallbackHero, hardwareOfferings as fallbackHardwareOfferings, optionalServices as fallbackOptionalServices, pricingApproach as fallbackPricingApproach, services as fallbackServices, whyChooseUs as fallbackWhyChooseUs } from "@/lib/site";
import { createSupabaseServerClient, canUseSupabase } from "@/lib/supabase/server";

export type PublicService = {
  name: string;
  description: string;
  pricing: string;
};

export type PublicHardware = {
  name: string;
  description: string;
  price: string | null;
};

export type PublicSiteContent = {
  heroHeadline: string;
  heroSubheadline: string;
  aboutSummary: string;
  companyTone: string;
  whyChooseUs: string[];
  services: PublicService[];
  optionalServices: string[];
  hardwareOfferings: PublicHardware[];
  pricingApproach: Array<{ label: string; value: string }>;
};

export type AdminCatalogContent = {
  services: Array<{
    name: string;
    description: string | null;
    pricingModel: string | null;
    basePrice: number | null;
    internalCost: number | null;
    markupPct: number | null;
    active: boolean;
  }>;
  hardware: Array<{
    name: string;
    description: string | null;
    internalCost: number | null;
    sellPrice: number | null;
    markupPct: number | null;
    active: boolean;
  }>;
};

export type DashboardStats = {
  contacts: number;
  estimates: number;
  isAdmin: boolean;
};

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return null;
  return `$${value.toFixed(2)}`;
}

async function getSiteSettings() {
  if (!canUseSupabase()) {
    return {} as Record<string, string>;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error || !data) {
      return {} as Record<string, string>;
    }

    return Object.fromEntries(data.map((item) => [item.key, item.value])) as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

async function getActiveServices() {
  if (!canUseSupabase()) {
    return [] as Array<{ name: string; description: string | null; pricing_model: string | null; base_price: number | null }>;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("services")
      .select("name, description, pricing_model, base_price")
      .eq("active", true)
      .order("name");

    if (error || !data) {
      return [] as Array<{ name: string; description: string | null; pricing_model: string | null; base_price: number | null }>;
    }

    return data as Array<{ name: string; description: string | null; pricing_model: string | null; base_price: number | null }>;
  } catch {
    return [] as Array<{ name: string; description: string | null; pricing_model: string | null; base_price: number | null }>;
  }
}

async function getActiveHardware() {
  if (!canUseSupabase()) {
    return [] as Array<{ name: string; description: string | null; sell_price: number | null }>;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("hardware_catalog")
      .select("name, description, sell_price")
      .eq("active", true)
      .order("name");

    if (error || !data) {
      return [] as Array<{ name: string; description: string | null; sell_price: number | null }>;
    }

    return data as Array<{ name: string; description: string | null; sell_price: number | null }>;
  } catch {
    return [] as Array<{ name: string; description: string | null; sell_price: number | null }>;
  }
}

export async function getPublicSiteContent(): Promise<PublicSiteContent> {
  const [settings, services, hardware] = await Promise.all([getSiteSettings(), getActiveServices(), getActiveHardware()]);

  const serviceCards = services.length > 0
    ? services.map((service) => {
        const pricingParts = [] as string[];
        if (service.pricing_model) {
          pricingParts.push(service.pricing_model);
        }
        const formattedPrice = formatCurrency(service.base_price);
        if (formattedPrice) {
          pricingParts.push(`Starting at ${formattedPrice}`);
        }
        return {
          name: service.name,
          description: service.description ?? "Custom support tailored to your environment.",
          pricing: pricingParts.join(" • "),
        } satisfies PublicService;
      })
    : fallbackServices.map((service) => ({
        name: service.name,
        description: service.description,
        pricing: service.pricing,
      }));

  const hardwareCards = hardware.length > 0
    ? hardware.map((item) => ({
        name: item.name,
        description: item.description ?? "Available for quote.",
        price: item.sell_price === null || item.sell_price === undefined ? null : formatCurrency(item.sell_price),
      }))
    : fallbackHardwareOfferings.map((item) => ({
        name: item,
        description: "Available for quote.",
        price: null,
      }));

  return {
    heroHeadline: settings.hero_headline ?? fallbackHero.headline,
    heroSubheadline: settings.hero_subheadline ?? fallbackHero.subheadline,
    aboutSummary: settings.about_summary ?? fallbackAboutSummary,
    companyTone: settings.company_tone ?? fallbackCompany.tone,
    whyChooseUs: fallbackWhyChooseUs,
    services: serviceCards,
    optionalServices: fallbackOptionalServices,
    hardwareOfferings: hardwareCards,
    pricingApproach: fallbackPricingApproach,
  };
}

export async function getAdminCatalogContent(): Promise<AdminCatalogContent> {
  if (!canUseSupabase()) {
    return { services: [], hardware: [] };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: servicesData, error: servicesError }, { data: hardwareData, error: hardwareError }] = await Promise.all([
      supabase.from("services").select("name, description, pricing_model, base_price, internal_cost, markup_pct, active").order("name"),
      supabase.from("hardware_catalog").select("name, description, internal_cost, sell_price, markup_pct, active").order("name"),
    ]);

    if (servicesError || hardwareError) {
      return { services: [], hardware: [] };
    }

    return {
      services: (servicesData ?? []).map((service) => ({
        name: service.name,
        description: service.description,
        pricingModel: service.pricing_model,
        basePrice: service.base_price,
        internalCost: service.internal_cost,
        markupPct: service.markup_pct,
        active: service.active,
      })),
      hardware: (hardwareData ?? []).map((item) => ({
        name: item.name,
        description: item.description,
        internalCost: item.internal_cost,
        sellPrice: item.sell_price,
        markupPct: item.markup_pct,
        active: item.active,
      })),
    };
  } catch {
    return { services: [], hardware: [] };
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!canUseSupabase()) {
    return { contacts: 0, estimates: 0, isAdmin: false };
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return { contacts: 0, estimates: 0, isAdmin: false };
    }

    const supabase = await createSupabaseServerClient();
    const [{ count: contactsCount }, { count: estimatesCount }] = await Promise.all([
      supabase.from("crm_contacts").select("*", { count: "exact", head: true }),
      supabase.from("estimates").select("*", { count: "exact", head: true }),
    ]);

    return {
      contacts: contactsCount ?? 0,
      estimates: estimatesCount ?? 0,
      isAdmin: true,
    };
  } catch {
    return { contacts: 0, estimates: 0, isAdmin: false };
  }
}
