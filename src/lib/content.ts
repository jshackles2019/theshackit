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

export type PublicContactContent = {
  email: string;
  phone: string;
  bookingUrl: string;
  serviceArea: string[];
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
  source: string | null;
  pipelineStage: string;
  status: string;
  notes: string | null;
  agreement: {
    billingFrequency: string | null;
    monthlyAmount: number | null;
    includedServices: string | null;
  } | null;
  activityCount: number;
  taskCount: number;
  openTaskCount: number;
};

export type AdminCrmTask = {
  id: string;
  contactId: string | null;
  contactName: string | null;
  title: string;
  notes: string | null;
  status: string;
  dueDate: string | null;
  reminderAt: string | null;
  assignedTo: string | null;
  completedAt: string | null;
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

export type InvoicePayment = {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  notes: string | null;
  receivedAt: string;
};

export type AdminInvoice = {
  id: string;
  invoiceNumber: string;
  contactId: string;
  contactName: string | null;
  contactEmail: string | null;
  estimateId: string | null;
  estimateNumber: string | null;
  title: string;
  notes: string | null;
  status: string;
  issuedAt: string | null;
  dueDate: string | null;
  subtotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: string | null;
  sentAt: string | null;
  paidAt: string | null;
  payments: InvoicePayment[];
};

export type ClientInvoice = AdminInvoice;

export type TicketReply = {
  id: string;
  ticketId: string;
  userId: string;
  userName: string | null;
  message: string;
  isInternalNote: boolean;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  contactId: string;
  contactName: string | null;
  contactEmail: string | null;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "on_hold" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedToAdminId: string | null;
  assignedToAdminName: string | null;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  source: "dashboard" | "email";
  replies: TicketReply[];
  replyCount: number;
};

export type SupportEmailSettings = {
  id: string;
  supportEmail: string;
  forwardToAdminEmail: string | null;
  autoResponseSubject: string;
  autoResponseBody: string;
  enabled: boolean;
};

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return null;
  return `$${value.toFixed(2)}`;
}

function parseListSetting(value: string | undefined, fallback: string[]) {
  if (!value) return fallback;
  const items = value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : fallback;
}

function parsePricingApproachSetting(value: string | undefined, fallback: Array<{ label: string; value: string }>) {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      const items = parsed
        .filter((item): item is { label?: unknown; value?: unknown } => Boolean(item && typeof item === "object"))
        .map((item) => ({
          label: typeof item.label === "string" ? item.label.trim() : "",
          value: typeof item.value === "string" ? item.value.trim() : "",
        }))
        .filter((item) => item.label && item.value);
      if (items.length > 0) {
        return items;
      }
    }
  } catch {
    // Fall through to line parsing.
  }

  const items = value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [label, ...rest] = item.split(":");
      return {
        label: label?.trim() ?? "",
        value: rest.join(":").trim(),
      };
    })
    .filter((item) => item.label && item.value);

  return items.length > 0 ? items : fallback;
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

async function getInvoicePayments(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  invoiceIds: string[],
): Promise<Map<string, InvoicePayment[]>> {
  if (invoiceIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("invoice_payments")
    .select("id, invoice_id, amount, method, reference, notes, received_at")
    .in("invoice_id", invoiceIds)
    .order("received_at", { ascending: true });

  if (error || !data) {
    return new Map();
  }

  const paymentsByInvoice = new Map<string, InvoicePayment[]>();
  for (const payment of data) {
    const current = paymentsByInvoice.get(payment.invoice_id) ?? [];
    current.push({
      id: payment.id,
      amount: Number(payment.amount ?? 0),
      method: payment.method,
      reference: payment.reference,
      notes: payment.notes,
      receivedAt: payment.received_at,
    });
    paymentsByInvoice.set(payment.invoice_id, current);
  }

  return paymentsByInvoice;
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
    whyChooseUs: parseListSetting(settings.why_choose_us, fallbackWhyChooseUs),
    services: serviceCards,
    optionalServices: parseListSetting(settings.optional_services, fallbackOptionalServices),
    hardwareOfferings: hardwareCards,
    pricingApproach: parsePricingApproachSetting(settings.pricing_approach, fallbackPricingApproach),
  };
}

export async function getPublicContactContent(): Promise<PublicContactContent> {
  const settings = await getSiteSettings();
  const serviceAreaSetting = settings.service_area ?? settings.contact_service_area ?? "";
  const serviceArea = serviceAreaSetting
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    email: settings.contact_email ?? "Use the form below",
    phone: settings.contact_phone ?? "Shared after initial contact",
    bookingUrl: settings.booking_url ?? fallbackCompany.bookingUrl,
    serviceArea: serviceArea.length > 0 ? serviceArea : fallbackCompany.serviceArea,
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
      .select("id, full_name, email, company_name, source, pipeline_stage, status, notes")
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

    const tasksData = contactIds.length > 0
      ? (await supabase.from("crm_tasks").select("contact_id, status").in("contact_id", contactIds)).data ?? []
      : [];

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

    const taskCounts = new Map<string, { total: number; open: number }>();
    for (const task of tasksData ?? []) {
      if (!task.contact_id) continue;
      const current = taskCounts.get(task.contact_id) ?? { total: 0, open: 0 };
      current.total += 1;
      if (task.status !== "completed") {
        current.open += 1;
      }
      taskCounts.set(task.contact_id, current);
    }

    return contactsData.map((contact) => ({
      id: contact.id,
      fullName: contact.full_name,
      email: contact.email,
      companyName: contact.company_name,
      source: contact.source,
      pipelineStage: contact.pipeline_stage,
      status: contact.status,
      notes: contact.notes,
      agreement: agreementMap.get(contact.id) ?? null,
      activityCount: activityCounts.get(contact.id) ?? 0,
      taskCount: taskCounts.get(contact.id)?.total ?? 0,
      openTaskCount: taskCounts.get(contact.id)?.open ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getAdminCrmTasks(): Promise<AdminCrmTask[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const [{ data: tasksData, error: tasksError }, { data: contactsData }] = await Promise.all([
      supabase
        .from("crm_tasks")
        .select("id, contact_id, title, notes, status, due_date, reminder_at, assigned_to, completed_at")
        .order("created_at", { ascending: false }),
      supabase.from("crm_contacts").select("id, full_name"),
    ]);

    if (tasksError || !tasksData) {
      return [];
    }

    const contactMap = new Map<string, string>();
    for (const contact of contactsData ?? []) {
      contactMap.set(contact.id, contact.full_name);
    }

    return tasksData.map((task) => ({
      id: task.id,
      contactId: task.contact_id,
      contactName: task.contact_id ? contactMap.get(task.contact_id) ?? null : null,
      title: task.title,
      notes: task.notes,
      status: task.status,
      dueDate: task.due_date,
      reminderAt: task.reminder_at,
      assignedTo: task.assigned_to,
      completedAt: task.completed_at,
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

export async function getAdminInvoices(): Promise<AdminInvoice[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, invoice_number, contact_id, estimate_id, title, notes, status, issued_at, due_date, subtotal, tax_total, total, amount_paid, balance_due, payment_method, sent_at, paid_at, created_at")
      .order("created_at", { ascending: false });

    if (invoiceError || !invoiceData) {
      return [];
    }

    const contactIds = invoiceData.map((invoice) => invoice.contact_id).filter(Boolean) as string[];
    const estimateIds = invoiceData.map((invoice) => invoice.estimate_id).filter(Boolean) as string[];

    const [contactsResult, estimatesResult, paymentsByInvoice] = await Promise.all([
      contactIds.length > 0
        ? supabase.from("crm_contacts").select("id, full_name, email").in("id", contactIds)
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string; email: string }>, error: null }),
      estimateIds.length > 0
        ? supabase.from("estimates").select("id, estimate_number").in("id", estimateIds)
        : Promise.resolve({ data: [] as Array<{ id: string; estimate_number: string }>, error: null }),
      getInvoicePayments(supabase, invoiceData.map((invoice) => invoice.id)),
    ]);

    if (contactsResult.error || estimatesResult.error) {
      return [];
    }

    const contactMap = new Map<string, { fullName: string; email: string }>();
    for (const contact of contactsResult.data ?? []) {
      contactMap.set(contact.id, {
        fullName: contact.full_name,
        email: contact.email,
      });
    }

    const estimateMap = new Map<string, string>();
    for (const estimate of estimatesResult.data ?? []) {
      estimateMap.set(estimate.id, estimate.estimate_number);
    }

    return invoiceData.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      contactId: invoice.contact_id,
      contactName: contactMap.get(invoice.contact_id)?.fullName ?? null,
      contactEmail: contactMap.get(invoice.contact_id)?.email ?? null,
      estimateId: invoice.estimate_id,
      estimateNumber: invoice.estimate_id ? estimateMap.get(invoice.estimate_id) ?? null : null,
      title: invoice.title,
      notes: invoice.notes,
      status: invoice.status,
      issuedAt: invoice.issued_at,
      dueDate: invoice.due_date,
      subtotal: Number(invoice.subtotal ?? 0),
      taxTotal: Number(invoice.tax_total ?? 0),
      total: Number(invoice.total ?? 0),
      amountPaid: Number(invoice.amount_paid ?? 0),
      balanceDue: Number(invoice.balance_due ?? 0),
      paymentMethod: invoice.payment_method,
      sentAt: invoice.sent_at,
      paidAt: invoice.paid_at,
      payments: paymentsByInvoice.get(invoice.id) ?? [],
    }));
  } catch {
    return [];
  }
}

export async function getClientInvoices(): Promise<ClientInvoice[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (!auth.user) {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, invoice_number, contact_id, estimate_id, title, notes, status, issued_at, due_date, subtotal, tax_total, total, amount_paid, balance_due, payment_method, sent_at, paid_at, created_at")
      .neq("status", "draft")
      .order("created_at", { ascending: false });

    if (invoiceError || !invoiceData) {
      return [];
    }

    const contactIds = invoiceData.map((invoice) => invoice.contact_id).filter(Boolean) as string[];
    const estimateIds = invoiceData.map((invoice) => invoice.estimate_id).filter(Boolean) as string[];

    const [contactsResult, estimatesResult, paymentsByInvoice] = await Promise.all([
      contactIds.length > 0
        ? supabase.from("crm_contacts").select("id, full_name, email").in("id", contactIds)
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string; email: string }>, error: null }),
      estimateIds.length > 0
        ? supabase.from("estimates").select("id, estimate_number").in("id", estimateIds)
        : Promise.resolve({ data: [] as Array<{ id: string; estimate_number: string }>, error: null }),
      getInvoicePayments(supabase, invoiceData.map((invoice) => invoice.id)),
    ]);

    if (contactsResult.error || estimatesResult.error) {
      return [];
    }

    const contactMap = new Map<string, { fullName: string; email: string }>();
    for (const contact of contactsResult.data ?? []) {
      contactMap.set(contact.id, {
        fullName: contact.full_name,
        email: contact.email,
      });
    }

    const eligibleInvoices = invoiceData.filter((invoice) => {
      const contact = contactMap.get(invoice.contact_id);
      return Boolean(contact && contact.email.toLowerCase() === auth.profile?.email?.toLowerCase());
    });

    const estimateMap = new Map<string, string>();
    for (const estimate of estimatesResult.data ?? []) {
      estimateMap.set(estimate.id, estimate.estimate_number);
    }

    return eligibleInvoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      contactId: invoice.contact_id,
      contactName: contactMap.get(invoice.contact_id)?.fullName ?? null,
      contactEmail: contactMap.get(invoice.contact_id)?.email ?? null,
      estimateId: invoice.estimate_id,
      estimateNumber: invoice.estimate_id ? estimateMap.get(invoice.estimate_id) ?? null : null,
      title: invoice.title,
      notes: invoice.notes,
      status: invoice.status,
      issuedAt: invoice.issued_at,
      dueDate: invoice.due_date,
      subtotal: Number(invoice.subtotal ?? 0),
      taxTotal: Number(invoice.tax_total ?? 0),
      total: Number(invoice.total ?? 0),
      amountPaid: Number(invoice.amount_paid ?? 0),
      balanceDue: Number(invoice.balance_due ?? 0),
      paymentMethod: invoice.payment_method,
      sentAt: invoice.sent_at,
      paidAt: invoice.paid_at,
      payments: paymentsByInvoice.get(invoice.id) ?? [],
    }));
  } catch {
    return [];
  }
}

export async function getClientContactById(clientId: string): Promise<AdminContact | null> {
  if (!canUseSupabase()) {
    return null;
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return null;
    }

    const supabase = await createSupabaseServerClient();
    const { data: contactData, error: contactError } = await supabase
      .from("crm_contacts")
      .select("id, full_name, email, company_name, source, pipeline_stage, status, notes")
      .eq("id", clientId)
      .single();

    if (contactError || !contactData) {
      return null;
    }

    const { data: agreementData } = await supabase
      .from("service_agreements")
      .select("billing_frequency, monthly_amount, included_services")
      .eq("contact_id", clientId)
      .single();

    const { data: activitiesData } = await supabase
      .from("crm_activities")
      .select("id")
      .eq("contact_id", clientId);

    const { data: tasksData } = await supabase
      .from("crm_tasks")
      .select("id, status")
      .eq("contact_id", clientId);

    return {
      id: contactData.id,
      fullName: contactData.full_name,
      email: contactData.email,
      companyName: contactData.company_name,
      source: contactData.source,
      pipelineStage: contactData.pipeline_stage,
      status: contactData.status,
      notes: contactData.notes,
      agreement: agreementData
        ? {
            billingFrequency: agreementData.billing_frequency,
            monthlyAmount: agreementData.monthly_amount,
            includedServices: agreementData.included_services,
          }
        : null,
      activityCount: activitiesData?.length ?? 0,
      taskCount: tasksData?.length ?? 0,
      openTaskCount: tasksData?.filter((t) => t.status !== "completed").length ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getClientEstimatesByContactId(contactEmail: string): Promise<ClientEstimate[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data: estimatesData, error: estimatesError } = await supabase
      .from("estimates")
      .select(
        `
        id,
        estimate_number,
        title,
        crm_contacts!inner(full_name, email),
        status,
        subtotal_sell,
        tax_total_sell,
        total_sell,
        finalized_at
      `
      )
      .eq("crm_contacts.email", contactEmail)
      .order("created_at", { ascending: false });

    if (estimatesError || !estimatesData) {
      return [];
    }

    const estimateIds = estimatesData.map((e) => e.id);

    const { data: lineItemsData } = await supabase
      .from("estimate_line_items")
      .select("id, estimate_id, description, quantity, unit_sell_price, unit_cost_price, markup_pct")
      .in("estimate_id", estimateIds);

    const lineItemsMap = new Map<string, EstimateLineItem[]>();
    for (const item of lineItemsData ?? []) {
      const current = lineItemsMap.get(item.estimate_id) ?? [];
      current.push({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitSellPrice: Number(item.unit_sell_price),
        unitCostPrice: Number(item.unit_cost_price),
        markupPct: Number(item.markup_pct),
        lineTotalSell: Number(item.quantity) * Number(item.unit_sell_price),
        lineTotalCost: Number(item.quantity) * Number(item.unit_cost_price),
      });
      lineItemsMap.set(item.estimate_id, current);
    }

    return estimatesData.map((estimate) => ({
      id: estimate.id,
      estimateNumber: estimate.estimate_number,
      title: estimate.title,
      contactName: Array.isArray(estimate.crm_contacts)
        ? estimate.crm_contacts[0]?.full_name ?? null
        : (estimate.crm_contacts as unknown as { full_name: string })?.full_name ?? null,
      status: estimate.status,
      totalSell: Number(estimate.total_sell),
      finalizedAt: estimate.finalized_at,
      lineItems: lineItemsMap.get(estimate.id) ?? [],
    }));
  } catch {
    return [];
  }
}

export async function getClientInvoicesByContactId(contactEmail: string): Promise<ClientInvoice[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, invoice_number, title, notes, status, subtotal, tax_total, total, amount_paid, balance_due, payment_method, issued_at, due_date, sent_at, paid_at, estimate_id, contact_id, crm_contacts!inner(id, full_name, email)")
      .eq("crm_contacts.email", contactEmail)
      .neq("status", "draft")
      .order("issued_at", { ascending: false });

    if (invoiceError || !invoiceData) {
      return [];
    }

    const invoiceIds = invoiceData.map((invoice) => invoice.id);
    const estimateIds = invoiceData.map((inv) => inv.estimate_id).filter(Boolean) as string[];

    const [paymentsByInvoice, estimateData] = await Promise.all([
      getInvoicePayments(supabase, invoiceIds),
      estimateIds.length > 0
        ? supabase.from("estimates").select("id, estimate_number").in("id", estimateIds)
        : Promise.resolve({ data: [] as Array<{ id: string; estimate_number: string }>, error: null }),
    ]);

    const estimateMap = new Map<string, string>();
    for (const estimate of estimateData.data ?? []) {
      estimateMap.set(estimate.id, estimate.estimate_number);
    }

    return invoiceData.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      contactId: invoice.contact_id,
      contactName: Array.isArray(invoice.crm_contacts)
        ? invoice.crm_contacts[0]?.full_name ?? null
        : (invoice.crm_contacts as unknown as { full_name: string })?.full_name ?? null,
      contactEmail: Array.isArray(invoice.crm_contacts)
        ? invoice.crm_contacts[0]?.email ?? null
        : (invoice.crm_contacts as unknown as { email: string })?.email ?? null,
      estimateId: invoice.estimate_id,
      estimateNumber: invoice.estimate_id ? estimateMap.get(invoice.estimate_id) ?? null : null,
      title: invoice.title,
      notes: invoice.notes,
      status: invoice.status,
      subtotal: Number(invoice.subtotal ?? 0),
      taxTotal: Number(invoice.tax_total ?? 0),
      total: Number(invoice.total ?? 0),
      amountPaid: Number(invoice.amount_paid ?? 0),
      balanceDue: Number(invoice.balance_due ?? 0),
      paymentMethod: invoice.payment_method,
      issuedAt: invoice.issued_at,
      dueDate: invoice.due_date,
      sentAt: invoice.sent_at,
      paidAt: invoice.paid_at,
      payments: paymentsByInvoice.get(invoice.id) ?? [],
    }));
  } catch {
    return [];
  }
}

export async function getAdminSupportTickets(): Promise<SupportTicket[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("support_tickets")
      .select(
        `
        id,
        contact_id,
        crm_contacts!inner(full_name, email),
        subject,
        description,
        status,
        priority,
        assigned_to_admin,
        created_by,
        created_at,
        updated_at,
        resolved_at,
        source
      `
      )
      .order("created_at", { ascending: false });

    if (ticketsError || !ticketsData) {
      return [];
    }

    const ticketIds = ticketsData.map((t) => t.id);
    const userIds = new Set<string>();
    ticketsData.forEach((t) => {
      if (t.created_by) userIds.add(t.created_by);
      if (t.assigned_to_admin) userIds.add(t.assigned_to_admin);
    });

    const [{ data: repliesData }, { data: usersData }] = await Promise.all([
      ticketIds.length > 0
        ? supabase.from("ticket_replies").select("id, ticket_id").in("ticket_id", ticketIds)
        : Promise.resolve({ data: [] as Array<{ id: string; ticket_id: string }> }),
      userIds.size > 0
        ? supabase.from("profiles").select("id, full_name").in("id", Array.from(userIds))
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string }> }),
    ]);

    const userMap = new Map<string, string>();
    for (const user of usersData ?? []) {
      userMap.set(user.id, user.full_name);
    }

    const replyCounts = new Map<string, number>();
    for (const reply of repliesData ?? []) {
      const current = replyCounts.get(reply.ticket_id) ?? 0;
      replyCounts.set(reply.ticket_id, current + 1);
    }

    return ticketsData.map((ticket) => ({
      id: ticket.id,
      contactId: ticket.contact_id,
      contactName: Array.isArray(ticket.crm_contacts)
        ? ticket.crm_contacts[0]?.full_name ?? null
        : (ticket.crm_contacts as unknown as { full_name: string })?.full_name ?? null,
      contactEmail: Array.isArray(ticket.crm_contacts)
        ? ticket.crm_contacts[0]?.email ?? null
        : (ticket.crm_contacts as unknown as { email: string })?.email ?? null,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status as "open" | "in_progress" | "on_hold" | "resolved" | "closed",
      priority: ticket.priority as "low" | "medium" | "high" | "urgent",
      assignedToAdminId: ticket.assigned_to_admin,
      assignedToAdminName: ticket.assigned_to_admin ? userMap.get(ticket.assigned_to_admin) ?? null : null,
      createdById: ticket.created_by,
      createdByName: ticket.created_by ? userMap.get(ticket.created_by) ?? null : null,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      resolvedAt: ticket.resolved_at,
      source: ticket.source as "dashboard" | "email",
      replies: [],
      replyCount: replyCounts.get(ticket.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getClientSupportTickets(): Promise<SupportTicket[]> {
  if (!canUseSupabase()) {
    return [];
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "client") {
      return [];
    }

    const supabase = await createSupabaseServerClient();
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("support_tickets")
      .select(
        `
        id,
        contact_id,
        crm_contacts!inner(full_name, email),
        subject,
        description,
        status,
        priority,
        assigned_to_admin,
        created_by,
        created_at,
        updated_at,
        resolved_at,
        source
      `
      )
      .eq("crm_contacts.email", auth.profile?.email ?? "")
      .order("created_at", { ascending: false });

    if (ticketsError || !ticketsData) {
      return [];
    }

    const ticketIds = ticketsData.map((t) => t.id);
    const userIds = new Set<string>();
    ticketsData.forEach((t) => {
      if (t.created_by) userIds.add(t.created_by);
    });

    const [{ data: repliesData }, { data: usersData }] = await Promise.all([
      ticketIds.length > 0
        ? supabase.from("ticket_replies").select("id, ticket_id").in("ticket_id", ticketIds).eq("is_internal_note", false)
        : Promise.resolve({ data: [] as Array<{ id: string; ticket_id: string }> }),
      userIds.size > 0
        ? supabase.from("profiles").select("id, full_name").in("id", Array.from(userIds))
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string }> }),
    ]);

    const userMap = new Map<string, string>();
    for (const user of usersData ?? []) {
      userMap.set(user.id, user.full_name);
    }

    const replyCounts = new Map<string, number>();
    for (const reply of repliesData ?? []) {
      const current = replyCounts.get(reply.ticket_id) ?? 0;
      replyCounts.set(reply.ticket_id, current + 1);
    }

    return ticketsData.map((ticket) => ({
      id: ticket.id,
      contactId: ticket.contact_id,
      contactName: Array.isArray(ticket.crm_contacts)
        ? ticket.crm_contacts[0]?.full_name ?? null
        : (ticket.crm_contacts as unknown as { full_name: string })?.full_name ?? null,
      contactEmail: Array.isArray(ticket.crm_contacts)
        ? ticket.crm_contacts[0]?.email ?? null
        : (ticket.crm_contacts as unknown as { email: string })?.email ?? null,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status as "open" | "in_progress" | "on_hold" | "resolved" | "closed",
      priority: ticket.priority as "low" | "medium" | "high" | "urgent",
      assignedToAdminId: ticket.assigned_to_admin,
      assignedToAdminName: ticket.assigned_to_admin ? userMap.get(ticket.assigned_to_admin) ?? null : null,
      createdById: ticket.created_by,
      createdByName: ticket.created_by ? userMap.get(ticket.created_by) ?? null : null,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      resolvedAt: ticket.resolved_at,
      source: ticket.source as "dashboard" | "email",
      replies: [],
      replyCount: replyCounts.get(ticket.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getSupportTicketById(ticketId: string): Promise<SupportTicket | null> {
  if (!canUseSupabase()) {
    return null;
  }

  try {
    const auth = await getCurrentAuth();
    const supabase = await createSupabaseServerClient();

    const { data: ticketData, error: ticketError } = await supabase
      .from("support_tickets")
      .select(
        `
        id,
        contact_id,
        crm_contacts!inner(full_name, email),
        subject,
        description,
        status,
        priority,
        assigned_to_admin,
        created_by,
        created_at,
        updated_at,
        resolved_at,
        source
      `
      )
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticketData) {
      return null;
    }

    // Check authorization
    if (auth.profile?.role === "client") {
      const clientContact = ticketData.crm_contacts as unknown as { email: string };
      if (clientContact.email !== auth.profile?.email) {
        return null;
      }
    }

    const { data: repliesData } = await supabase
      .from("ticket_replies")
      .select(
        `
        id,
        ticket_id,
        user_id,
        message,
        is_internal_note,
        created_at,
        profiles!inner(full_name)
      `
      )
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    const userIds = new Set<string>();
    if (ticketData.created_by) userIds.add(ticketData.created_by);
    if (ticketData.assigned_to_admin) userIds.add(ticketData.assigned_to_admin);

    const { data: usersData } = userIds.size > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", Array.from(userIds))
      : { data: [] };

    const userMap = new Map<string, string>();
    for (const user of usersData ?? []) {
      userMap.set(user.id, user.full_name);
    }

    const replies: TicketReply[] = [];
    for (const reply of repliesData ?? []) {
      if (auth.profile?.role === "client" && reply.is_internal_note) {
        continue;
      }
      replies.push({
        id: reply.id,
        ticketId: reply.ticket_id,
        userId: reply.user_id,
        userName: Array.isArray(reply.profiles)
          ? reply.profiles[0]?.full_name ?? null
          : (reply.profiles as unknown as { full_name: string })?.full_name ?? null,
        message: reply.message,
        isInternalNote: reply.is_internal_note,
        createdAt: reply.created_at,
      });
    }

    return {
      id: ticketData.id,
      contactId: ticketData.contact_id,
      contactName: Array.isArray(ticketData.crm_contacts)
        ? ticketData.crm_contacts[0]?.full_name ?? null
        : (ticketData.crm_contacts as unknown as { full_name: string })?.full_name ?? null,
      contactEmail: Array.isArray(ticketData.crm_contacts)
        ? ticketData.crm_contacts[0]?.email ?? null
        : (ticketData.crm_contacts as unknown as { email: string })?.email ?? null,
      subject: ticketData.subject,
      description: ticketData.description,
      status: ticketData.status as "open" | "in_progress" | "on_hold" | "resolved" | "closed",
      priority: ticketData.priority as "low" | "medium" | "high" | "urgent",
      assignedToAdminId: ticketData.assigned_to_admin,
      assignedToAdminName: ticketData.assigned_to_admin ? userMap.get(ticketData.assigned_to_admin) ?? null : null,
      createdById: ticketData.created_by,
      createdByName: ticketData.created_by ? userMap.get(ticketData.created_by) ?? null : null,
      createdAt: ticketData.created_at,
      updatedAt: ticketData.updated_at,
      resolvedAt: ticketData.resolved_at,
      source: ticketData.source as "dashboard" | "email",
      replies,
      replyCount: replies.length,
    };
  } catch {
    return null;
  }
}

export async function getSupportEmailSettings(): Promise<SupportEmailSettings | null> {
  if (!canUseSupabase()) {
    return null;
  }

  try {
    const auth = await getCurrentAuth();
    if (auth.profile?.role !== "admin") {
      return null;
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("support_email_settings")
      .select("id, support_email, forward_to_admin_email, auto_response_subject, auto_response_body, enabled")
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      supportEmail: data.support_email,
      forwardToAdminEmail: data.forward_to_admin_email,
      autoResponseSubject: data.auto_response_subject,
      autoResponseBody: data.auto_response_body,
      enabled: data.enabled,
    };
  } catch {
    return null;
  }
}
