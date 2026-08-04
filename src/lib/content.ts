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

export type AdminContact = {
  id: string;
  fullName: string;
  email: string;
  companyName: string | null;
  pipelineStage: string;
  status: string;
  notes: string | null;
  agreement: {
    billingFrequency: string | null;
    monthlyAmount: number | null;
    includedServices: string | null;
  } | null;
  activityCount: number;
};

export type EstimateLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitSellPrice: number;
  unitCostPrice: number;
  markupPct: number;
  lineTotalSell: number;
  lineTotalCost: number;
};

export type AdminEstimate = {
  id: string;
  estimateNumber: string;
  title: string;
  contactName: string | null;
  contactEmail: string | null;
  status: string;
  visibleToClient: boolean;
  subtotalSell: number;
  subtotalCost: number;
  totalSell: number;
  totalCost: number;
  finalizedAt: string | null;
  createdAt: string;
  lineItems: EstimateLineItem[];
};

export type ClientEstimate = {
  id: string;
  estimateNumber: string;
  title: string;
  contactName: string | null;
  status: string;
  totalSell: number;
  finalizedAt: string | null;
  lineItems: EstimateLineItem[];
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

async function getEstimateLineItems(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  estimateIds: string[],
): Promise<Map<string, EstimateLineItem[]>> {
  if (estimateIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("estimate_line_items")
    .select("id, estimate_id, description, quantity, unit_sell_price, unit_cost_price, markup_pct")
    .in("estimate_id", estimateIds)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return new Map();
  }

  const lineItemsByEstimate = new Map<string, EstimateLineItem[]>();
  for (const item of data) {
    const estimateId = item.estimate_id;
    const currentItems = lineItemsByEstimate.get(estimateId) ?? [];
    const quantity = Number(item.quantity ?? 0);
    const sellPrice = Number(item.unit_sell_price ?? 0);
    const costPrice = Number(item.unit_cost_price ?? 0);
    currentItems.push({
      id: item.id,
      description: item.description,
      quantity,
      unitSellPrice: sellPrice,
      unitCostPrice: costPrice,
      markupPct: Number(item.markup_pct ?? 0),
      lineTotalSell: quantity * sellPrice,
      lineTotalCost: quantity * costPrice,
    });
    lineItemsByEstimate.set(estimateId, currentItems);
  }

  return lineItemsByEstimate;
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

export async function getAdminCrmContacts(): Promise<AdminContact[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data: contactsData, error: contactsError } = await supabase
      .from("crm_contacts")
      .select("id, full_name, email, company_name, pipeline_stage, status, notes")
      .order("updated_at", { ascending: false });

    if (contactsError || !contactsData) {
      return [];
    }

    const contactIds = contactsData.map((contact) => contact.id);

    const [{ data: agreementsData }, { data: activitiesData }] = await Promise.all([
      contactIds.length > 0
        ? supabase.from("service_agreements").select("contact_id, billing_frequency, monthly_amount, included_services").in("contact_id", contactIds)
        : Promise.resolve({ data: [], error: null }),
      contactIds.length > 0
        ? supabase.from("crm_activities").select("contact_id").in("contact_id", contactIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const agreementMap = new Map<string, { billingFrequency: string | null; monthlyAmount: number | null; includedServices: string | null }>();
    for (const agreement of agreementsData ?? []) {
      agreementMap.set(agreement.contact_id, {
        billingFrequency: agreement.billing_frequency,
        monthlyAmount: agreement.monthly_amount,
        includedServices: agreement.included_services,
      });
    }

    const activityCounts = new Map<string, number>();
    for (const activity of activitiesData ?? []) {
      const current = activityCounts.get(activity.contact_id) ?? 0;
      activityCounts.set(activity.contact_id, current + 1);
    }

    return contactsData.map((contact) => ({
      id: contact.id,
      fullName: contact.full_name,
      email: contact.email,
      companyName: contact.company_name,
      pipelineStage: contact.pipeline_stage,
      status: contact.status,
      notes: contact.notes,
      agreement: agreementMap.get(contact.id) ?? null,
      activityCount: activityCounts.get(contact.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getAdminEstimates(): Promise<AdminEstimate[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data: estimateData, error: estimateError } = await supabase
      .from("estimates")
      .select("id, estimate_number, contact_id, title, notes, status, visible_to_client, subtotal_sell, subtotal_cost, total_sell, total_cost, finalized_at, created_at")
      .order("created_at", { ascending: false });

    if (estimateError || !estimateData) {
      return [];
    }

    const contactIds = estimateData.map((estimate) => estimate.contact_id).filter(Boolean) as string[];
    const contactMap = new Map<string, { fullName: string; email: string }>();

    if (contactIds.length > 0) {
      const { data: contactsData } = await supabase.from("crm_contacts").select("id, full_name, email").in("id", contactIds);
      for (const contact of contactsData ?? []) {
        contactMap.set(contact.id, {
          fullName: contact.full_name,
          email: contact.email,
        });
      }
    }

    const lineItemsByEstimate = await getEstimateLineItems(supabase, estimateData.map((estimate) => estimate.id));

    return estimateData.map((estimate) => ({
      id: estimate.id,
      estimateNumber: estimate.estimate_number,
      title: estimate.title,
      contactName: estimate.contact_id ? contactMap.get(estimate.contact_id)?.fullName ?? null : null,
      contactEmail: estimate.contact_id ? contactMap.get(estimate.contact_id)?.email ?? null : null,
      status: estimate.status,
      visibleToClient: estimate.visible_to_client,
      subtotalSell: Number(estimate.subtotal_sell ?? 0),
      subtotalCost: Number(estimate.subtotal_cost ?? 0),
      totalSell: Number(estimate.total_sell ?? 0),
      totalCost: Number(estimate.total_cost ?? 0),
      finalizedAt: estimate.finalized_at,
      createdAt: estimate.created_at,
      lineItems: lineItemsByEstimate.get(estimate.id) ?? [],
    }));
  } catch {
    return [];
  }
}

export async function getClientEstimates(): Promise<ClientEstimate[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (!auth.user) {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data: estimateData, error: estimateError } = await supabase
      .from("estimates")
      .select("id, estimate_number, contact_id, title, status, total_sell, finalized_at")
      .eq("status", "finalized")
      .eq("visible_to_client", true)
      .order("finalized_at", { ascending: false });

    if (estimateError || !estimateData) {
      return [];
    }

    const contactIds = estimateData.map((estimate) => estimate.contact_id).filter(Boolean) as string[];
    const contactMap = new Map<string, { fullName: string }>();

    if (contactIds.length > 0) {
      const { data: contactsData } = await supabase.from("crm_contacts").select("id, full_name").in("id", contactIds);
      for (const contact of contactsData ?? []) {
        contactMap.set(contact.id, {
          fullName: contact.full_name,
        });
      }
    }

    const lineItemsByEstimate = await getEstimateLineItems(supabase, estimateData.map((estimate) => estimate.id));

    return estimateData.map((estimate) => ({
      id: estimate.id,
      estimateNumber: estimate.estimate_number,
      title: estimate.title,
      contactName: estimate.contact_id ? contactMap.get(estimate.contact_id)?.fullName ?? null : null,
      status: estimate.status,
      totalSell: Number(estimate.total_sell ?? 0),
      finalizedAt: estimate.finalized_at,
      lineItems: lineItemsByEstimate.get(estimate.id) ?? [],
    }));
  } catch {
    return [];
  }
}
