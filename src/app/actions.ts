"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentAuth } from "@/lib/auth";
import { canUseSupabase, createSupabaseServerClient } from "@/lib/supabase/server";
import { getEnv, hasEmailConfig } from "@/lib/env";

const authSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const leadSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  companyName: z.string().trim().optional(),
  message: z.string().trim().min(10),
  redirectTo: z.string().optional(),
});

const consultSchema = z.object({
  preferredTime: z.string().trim().optional(),
  topic: z.string().trim().min(2),
  notes: z.string().trim().optional(),
  redirectTo: z.string().optional(),
});

const serviceSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  pricingModel: z.string().trim().optional(),
  basePrice: z.coerce.number().optional(),
  internalCost: z.coerce.number().optional(),
  markupPct: z.coerce.number().optional(),
  active: z.string().optional(),
  redirectTo: z.string().optional(),
});

const hardwareSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  internalCost: z.coerce.number().optional(),
  sellPrice: z.coerce.number().optional(),
  markupPct: z.coerce.number().optional(),
  active: z.string().optional(),
  redirectTo: z.string().optional(),
});

const contactSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  companyName: z.string().trim().optional(),
  pipelineStage: z.string().trim().optional(),
  status: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  billingFrequency: z.string().trim().optional(),
  monthlyAmount: z.coerce.number().optional(),
  slaStartDate: z.string().trim().optional(),
  slaEndDate: z.string().trim().optional(),
  includedServices: z.string().trim().optional(),
  redirectTo: z.string().optional(),
});

const activitySchema = z.object({
  contactId: z.string().trim().min(1),
  activityType: z.string().trim().min(2),
  note: z.string().trim().min(2),
  followUpAt: z.string().trim().optional(),
  redirectTo: z.string().optional(),
});

const taskSchema = z.object({
  contactId: z.string().trim().optional(),
  title: z.string().trim().min(2),
  notes: z.string().trim().optional(),
  status: z.string().trim().optional(),
  dueDate: z.string().trim().optional(),
  reminderAt: z.string().trim().optional(),
  assignedTo: z.string().trim().optional(),
  redirectTo: z.string().optional(),
});

const taskUpdateSchema = z.object({
  taskId: z.string().trim().min(1),
  contactId: z.string().trim().optional(),
  title: z.string().trim().min(2),
  notes: z.string().trim().optional(),
  status: z.string().trim().optional(),
  dueDate: z.string().trim().optional(),
  reminderAt: z.string().trim().optional(),
  assignedTo: z.string().trim().optional(),
  redirectTo: z.string().optional(),
});

const estimateSchema = z.object({
  contactId: z.string().trim().optional(),
  title: z.string().trim().min(2),
  notes: z.string().trim().optional(),
  redirectTo: z.string().optional(),
});

const estimateUpdateSchema = z.object({
  estimateId: z.string().trim().min(1),
  title: z.string().trim().min(2),
  notes: z.string().trim().optional(),
  status: z.string().trim().optional(),
  visibleToClient: z.string().optional(),
  redirectTo: z.string().optional(),
});

const estimateLineItemSchema = z.object({
  estimateId: z.string().trim().min(1),
  description: z.string().trim().min(2),
  quantity: z.coerce.number().min(1),
  unitSellPrice: z.coerce.number().optional(),
  unitCostPrice: z.coerce.number().optional(),
  markupPct: z.coerce.number().optional(),
  redirectTo: z.string().optional(),
});

const estimateLineItemUpdateSchema = z.object({
  lineItemId: z.string().trim().min(1),
  description: z.string().trim().min(2),
  quantity: z.coerce.number().min(1),
  unitSellPrice: z.coerce.number().optional(),
  unitCostPrice: z.coerce.number().optional(),
  markupPct: z.coerce.number().optional(),
  redirectTo: z.string().optional(),
});

const siteSettingSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string().trim().min(1),
  redirectTo: z.string().optional(),
});

function jump(path: string, key: "success" | "error", value: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

function redirectTarget(formData: FormData, fallback: string) {
  const value = formData.get("redirectTo");
  return typeof value === "string" && value ? value : fallback;
}

async function upsertProfile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  email: string | undefined,
  fullName: string | undefined,
) {
  await supabase.from("profiles").upsert({
    id: userId,
    email: email ?? "",
    full_name: fullName ?? null,
    updated_at: new Date().toISOString(),
  });
}

async function requireAdminOrJump(redirectTo: string) {
  if (!canUseSupabase()) {
    jump(redirectTo, "error", "Connect Supabase env vars to save this form.");
  }

  const auth = await getCurrentAuth();
  if (!auth.user || auth.profile?.role !== "admin") {
    jump("/dashboard", "error", "Admin access required.");
  }

  return createSupabaseServerClient();
}

async function recalculateEstimateTotals(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  estimateId: string,
) {
  const { data: lineItems } = await supabase
    .from("estimate_line_items")
    .select("quantity, unit_sell_price, unit_cost_price")
    .eq("estimate_id", estimateId);

  const totals =
    lineItems?.reduce(
      (acc, item) => {
        const sell = Number(item.unit_sell_price ?? 0) * Number(item.quantity ?? 0);
        const cost = Number(item.unit_cost_price ?? 0) * Number(item.quantity ?? 0);
        return {
          sell: acc.sell + sell,
          cost: acc.cost + cost,
        };
      },
      { sell: 0, cost: 0 },
    ) ?? { sell: 0, cost: 0 };

  await supabase
    .from("estimates")
    .update({
      subtotal_sell: totals.sell,
      subtotal_cost: totals.cost,
      total_sell: totals.sell,
      total_cost: totals.cost,
      updated_at: new Date().toISOString(),
    })
    .eq("id", estimateId);
}

function parseReminderAt(value: string | undefined) {
  if (!value) return null;
  const reminderDate = new Date(value);
  if (Number.isNaN(reminderDate.getTime())) {
    return undefined;
  }
  return reminderDate.toISOString();
}

export async function signUpAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    jump("/auth/sign-up", "error", "Please complete every field with a valid value.");
  }

  if (!canUseSupabase()) {
    const env = getEnv();
    const missingVars = [];
    if (!env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missingVars.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    const errorMsg = missingVars.length > 0 
      ? `Missing env vars: ${missingVars.join(", ")}`
      : "Supabase config invalid";
    jump("/auth/sign-up", "error", errorMsg);
  }

  const env = getEnv();
  const supabase = await createSupabaseServerClient();
  const confirmationRedirect = env.NEXT_PUBLIC_SITE_URL
    ? `${env.NEXT_PUBLIC_SITE_URL}/auth/sign-in`
    : undefined;
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: confirmationRedirect,
    },
  });

  if (error || !data.user) {
    jump("/auth/sign-up", "error", error?.message ?? "Account creation failed.");
  }

  await upsertProfile(supabase, data.user.id, parsed.data.email, parsed.data.fullName);

  if (data.session) {
    jump("/dashboard", "success", "Account created and signed in.");
  }

  jump("/auth/sign-in", "success", "Account created. Check your email to confirm the account before signing in.");
}

export async function signInAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    jump("/auth/sign-in", "error", "Enter a valid email and password.");
  }

  if (!canUseSupabase()) {
    jump("/auth/sign-in", "error", "Connect Supabase env vars to enable sign in.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    jump("/auth/sign-in", "error", error?.message ?? "Unable to sign in.");
  }

  await upsertProfile(supabase, data.user.id, data.user.email, data.user.user_metadata?.full_name);
  jump("/dashboard", "success", "Signed in successfully.");
}

export async function signOutAction() {
  if (canUseSupabase()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}

export async function submitLeadAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/contact");
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    companyName: formData.get("companyName"),
    message: formData.get("message"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please fill out the contact form correctly.");
  }

  if (!canUseSupabase()) {
    jump(redirectTo, "success", "Thanks. The CRM is ready once Supabase is connected.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("crm_contacts").insert({
    full_name: parsed.data.name,
    email: parsed.data.email,
    company_name: parsed.data.companyName ?? null,
    pipeline_stage: "Lead",
    status: "lead",
    source: "contact_form",
    notes: parsed.data.message,
  });

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Contact request saved.");
}

export async function requestConsultationAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/book");
  const parsed = consultSchema.safeParse({
    preferredTime: formData.get("preferredTime"),
    topic: formData.get("topic"),
    notes: formData.get("notes"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the consultation request.");
  }

  if (!canUseSupabase()) {
    jump(redirectTo, "error", "Connect Supabase to enable consultation requests.");
  }

  const auth = await getCurrentAuth();
  if (!auth.user) {
    jump("/auth/sign-in", "error", "Please sign in before requesting a consultation.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("consultation_requests").insert({
    requested_by: auth.user.id,
    topic: parsed.data.topic,
    preferred_time: parsed.data.preferredTime ?? null,
    notes: parsed.data.notes ?? null,
    status: "new",
    source: "booking_page",
  });

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  if (hasEmailConfig()) {
    const env = getEnv();
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: env.RESEND_FROM_EMAIL,
        subject: "New consultation request",
        text: `A new consultation request was submitted for ${parsed.data.topic}.`,
      }),
    });
  }

  jump(redirectTo, "success", "Consultation request captured.");
}

export async function saveServiceAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/services");
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    pricingModel: formData.get("pricingModel"),
    basePrice: formData.get("basePrice"),
    internalCost: formData.get("internalCost"),
    markupPct: formData.get("markupPct"),
    active: formData.get("active")?.toString(),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the service form.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { error } = await supabase.from("services").upsert(
    {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      pricing_model: parsed.data.pricingModel ?? null,
      base_price: parsed.data.basePrice ?? null,
      internal_cost: parsed.data.internalCost ?? null,
      markup_pct: parsed.data.markupPct ?? null,
      active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "name" },
  );

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Service saved.");
}

export async function saveHardwareAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/services");
  const parsed = hardwareSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    internalCost: formData.get("internalCost"),
    sellPrice: formData.get("sellPrice"),
    markupPct: formData.get("markupPct"),
    active: formData.get("active")?.toString(),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the hardware form.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { error } = await supabase.from("hardware_catalog").upsert(
    {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      internal_cost: parsed.data.internalCost ?? null,
      sell_price: parsed.data.sellPrice ?? null,
      markup_pct: parsed.data.markupPct ?? null,
      active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "name" },
  );

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Hardware saved.");
}

export async function saveContactAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/crm");
  const parsed = contactSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    companyName: formData.get("companyName"),
    pipelineStage: formData.get("pipelineStage"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    billingFrequency: formData.get("billingFrequency"),
    monthlyAmount: formData.get("monthlyAmount"),
    slaStartDate: formData.get("slaStartDate"),
    slaEndDate: formData.get("slaEndDate"),
    includedServices: formData.get("includedServices"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the contact form.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { data: contact, error } = await supabase
    .from("crm_contacts")
    .upsert(
      {
        full_name: parsed.data.fullName,
        email: parsed.data.email,
        company_name: parsed.data.companyName ?? null,
        pipeline_stage: parsed.data.pipelineStage ?? "Lead",
        status: parsed.data.status ?? "lead",
        source: "admin",
        notes: parsed.data.notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (error || !contact) {
    jump(redirectTo, "error", error?.message ?? "Unable to save contact.");
  }

  await supabase.from("service_agreements").upsert(
    {
      contact_id: contact.id,
      billing_frequency: parsed.data.billingFrequency ?? null,
      monthly_amount: parsed.data.monthlyAmount ?? null,
      start_date: parsed.data.slaStartDate ?? null,
      end_date: parsed.data.slaEndDate ?? null,
      included_services: parsed.data.includedServices ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "contact_id" },
  );

  jump(redirectTo, "success", "Contact saved.");
}

export async function addCrmActivityAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/crm");
  const parsed = activitySchema.safeParse({
    contactId: formData.get("contactId"),
    activityType: formData.get("activityType"),
    note: formData.get("note"),
    followUpAt: formData.get("followUpAt"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the activity form.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { error } = await supabase.from("crm_activities").insert({
    contact_id: parsed.data.contactId,
    activity_type: parsed.data.activityType,
    note: parsed.data.note,
    follow_up_at: parsed.data.followUpAt || null,
  });

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Activity logged.");
}

export async function createCrmTaskAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/crm");
  const parsed = taskSchema.safeParse({
    contactId: formData.get("contactId"),
    title: formData.get("title"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    dueDate: formData.get("dueDate"),
    reminderAt: formData.get("reminderAt"),
    assignedTo: formData.get("assignedTo"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the task form.");
  }

  const reminderAt = parseReminderAt(parsed.data.reminderAt);
  if (reminderAt === undefined) {
    jump(redirectTo, "error", "Enter a valid reminder date and time.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const auth = await getCurrentAuth();
  const { error } = await supabase.from("crm_tasks").insert({
    contact_id: parsed.data.contactId || null,
    title: parsed.data.title,
    notes: parsed.data.notes ?? null,
    status: parsed.data.status ?? "open",
    due_date: parsed.data.dueDate || null,
    reminder_at: reminderAt,
    assigned_to: parsed.data.assignedTo || null,
    created_by_user_id: auth.user?.id ?? null,
  });

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Task created.");
}

export async function updateCrmTaskAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/crm");
  const parsed = taskUpdateSchema.safeParse({
    taskId: formData.get("taskId"),
    contactId: formData.get("contactId"),
    title: formData.get("title"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    dueDate: formData.get("dueDate"),
    reminderAt: formData.get("reminderAt"),
    assignedTo: formData.get("assignedTo"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the task update form.");
  }

  const reminderAt = parseReminderAt(parsed.data.reminderAt);
  if (reminderAt === undefined) {
    jump(redirectTo, "error", "Enter a valid reminder date and time.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const completedAt = parsed.data.status === "completed" ? new Date().toISOString() : null;
  const { error } = await supabase
    .from("crm_tasks")
    .update({
      contact_id: parsed.data.contactId || null,
      title: parsed.data.title,
      notes: parsed.data.notes ?? null,
      status: parsed.data.status ?? "open",
      due_date: parsed.data.dueDate || null,
      reminder_at: reminderAt,
      assigned_to: parsed.data.assignedTo || null,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.taskId);

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Task updated.");
}

export async function createEstimateAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/estimates");
  const parsed = estimateSchema.safeParse({
    contactId: formData.get("contactId"),
    title: formData.get("title"),
    notes: formData.get("notes"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the estimate form.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { error } = await supabase.from("estimates").insert({
    contact_id: parsed.data.contactId || null,
    estimate_number: `EST-${Date.now().toString().slice(-6)}`,
    title: parsed.data.title,
    notes: parsed.data.notes ?? null,
    status: "draft",
    created_by_role: "admin",
    visible_to_client: false,
  });

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Estimate created.");
}

export async function addEstimateLineItemAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/estimates");
  const parsed = estimateLineItemSchema.safeParse({
    estimateId: formData.get("estimateId"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitSellPrice: formData.get("unitSellPrice"),
    unitCostPrice: formData.get("unitCostPrice"),
    markupPct: formData.get("markupPct"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the line item form.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { error } = await supabase.from("estimate_line_items").insert({
    estimate_id: parsed.data.estimateId,
    item_type: "custom",
    description: parsed.data.description,
    quantity: parsed.data.quantity,
    unit_sell_price: parsed.data.unitSellPrice ?? 0,
    unit_cost_price: parsed.data.unitCostPrice ?? 0,
    markup_pct: parsed.data.markupPct ?? 0,
  });

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  await recalculateEstimateTotals(supabase, parsed.data.estimateId);
  jump(redirectTo, "success", "Line item added.");
}

export async function updateEstimateAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/estimates");
  const parsed = estimateUpdateSchema.safeParse({
    estimateId: formData.get("estimateId"),
    title: formData.get("title"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    visibleToClient: formData.get("visibleToClient")?.toString(),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the estimate update form.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { error } = await supabase
    .from("estimates")
    .update({
      title: parsed.data.title,
      notes: parsed.data.notes ?? null,
      status: parsed.data.status ?? "draft",
      visible_to_client: parsed.data.visibleToClient === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.estimateId);

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Estimate updated.");
}

export async function updateEstimateLineItemAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/estimates");
  const parsed = estimateLineItemUpdateSchema.safeParse({
    lineItemId: formData.get("lineItemId"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
    unitSellPrice: formData.get("unitSellPrice"),
    unitCostPrice: formData.get("unitCostPrice"),
    markupPct: formData.get("markupPct"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the line item update form.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { data: lineItem, error } = await supabase
    .from("estimate_line_items")
    .update({
      description: parsed.data.description,
      quantity: parsed.data.quantity,
      unit_sell_price: parsed.data.unitSellPrice ?? 0,
      unit_cost_price: parsed.data.unitCostPrice ?? 0,
      markup_pct: parsed.data.markupPct ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.lineItemId)
    .select("estimate_id")
    .maybeSingle();

  if (error || !lineItem) {
    jump(redirectTo, "error", error?.message ?? "Unable to update line item.");
  }

  await recalculateEstimateTotals(supabase, lineItem.estimate_id);
  jump(redirectTo, "success", "Line item updated.");
}

export async function finalizeEstimateAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/estimates");
  const estimateId = String(formData.get("estimateId") ?? "").trim();
  if (!estimateId) {
    jump(redirectTo, "error", "Enter an estimate ID.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { error } = await supabase
    .from("estimates")
    .update({
      status: "finalized",
      visible_to_client: true,
      finalized_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", estimateId);

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Estimate finalized.");
}

export async function createClientEstimateRequestAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/client/estimates");
  const summary = String(formData.get("summary") ?? "").trim();
  if (summary.length < 10) {
    jump(redirectTo, "error", "Please add a longer request summary.");
  }

  if (!canUseSupabase()) {
    jump(redirectTo, "error", "Connect Supabase env vars to submit estimate requests.");
  }

  const auth = await getCurrentAuth();
  if (!auth.user) {
    jump("/auth/sign-in", "error", "Please sign in to request an estimate.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("estimates").insert({
    contact_id: null,
    estimate_number: `REQ-${Date.now().toString().slice(-6)}`,
    title: "Client estimate request",
    notes: summary,
    status: "draft",
    created_by_role: "client",
    created_by_user_id: auth.user.id,
    visible_to_client: false,
  });

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Estimate request saved.");
}

export async function saveSiteSettingAction(formData: FormData) {
  const redirectTo = redirectTarget(formData, "/dashboard/admin/services");
  const parsed = siteSettingSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value"),
    redirectTo,
  });

  if (!parsed.success) {
    jump(redirectTo, "error", "Please complete the setting form.");
  }

  const supabase = await requireAdminOrJump(redirectTo);
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: parsed.data.key,
      value: parsed.data.value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    jump(redirectTo, "error", error.message);
  }

  jump(redirectTo, "success", "Website setting saved.");
}
