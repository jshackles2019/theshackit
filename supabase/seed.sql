insert into public.services (name, description, pricing_model, base_price, internal_cost, markup_pct)
values
  ('IT Consulting', 'Strategic guidance for growth, modernization, and risk reduction.', 'Fixed', 150.00, 90.00, 66.67),
  ('Hardware Procurement', 'Laptops, desktops, peripherals, software, and network equipment sourcing.', 'Quote-Based', 0.00, 0.00, 0.00),
  ('Managed IT Services', 'Support defined by service agreement.', 'Included in Contract', 250.00, 150.00, 66.67)
on conflict (name) do update set description = excluded.description, updated_at = now();

insert into public.hardware_catalog (name, description, internal_cost, sell_price, markup_pct)
values
  ('Business Laptop', 'Mid-range productivity laptop', 725.00, 949.00, 30.9),
  ('Docking Station', 'USB-C dock for workstations', 85.00, 129.00, 51.8),
  ('Wi-Fi Router', 'Small-business router and firewall', 165.00, 249.00, 50.9)
on conflict (name) do update set description = excluded.description, updated_at = now();

insert into public.site_settings (key, value)
values
  ('hero_headline', 'The Shack - IT Services You Can Trust'),
  ('hero_subheadline', 'Hardware - Software - MSP - Projects - More'),
  ('about_summary', 'Here at The Shack, we put our clients mission first. We curate our IT solutions to best suite where you are now, as well as where you plan to go!')
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.crm_contacts (id, full_name, email, company_name, pipeline_stage, status, source, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'Seguin Family Office', 'contact1@example.com', 'Seguin Family Office', 'Consultation Scheduled', 'prospect', 'seed', 'Managed IT discovery'),
  ('22222222-2222-2222-2222-222222222222', 'New Braunfels Retail Group', 'contact2@example.com', 'New Braunfels Retail Group', 'Client', 'client', 'seed', 'Managed IT and hardware coverage')
on conflict (email) do update set full_name = excluded.full_name, updated_at = now();

insert into public.service_agreements (contact_id, billing_frequency, monthly_amount, start_date, end_date, included_services)
values
  ('22222222-2222-2222-2222-222222222222', 'Monthly', 650.00, '2026-01-01', '2026-12-31', 'Help desk, patching, workstation support')
on conflict (contact_id) do update set included_services = excluded.included_services, updated_at = now();

insert into public.estimates (id, estimate_number, contact_id, created_by_role, title, notes, status, visible_to_client, subtotal_sell, subtotal_cost, total_sell, total_cost, finalized_at)
values
  ('33333333-3333-3333-3333-333333333333', 'EST-1001', '22222222-2222-2222-2222-222222222222', 'admin', 'Managed IT refresh', 'Seed estimate for portal preview', 'finalized', true, 1850.00, 1325.00, 1850.00, 1325.00, now())
on conflict (estimate_number) do update set status = excluded.status, updated_at = now();

insert into public.estimate_line_items (estimate_id, item_type, description, quantity, unit_sell_price, unit_cost_price, markup_pct)
values
  ('33333333-3333-3333-3333-333333333333', 'service', 'Managed IT onboarding', 1, 850.00, 500.00, 70.00),
  ('33333333-3333-3333-3333-333333333333', 'hardware', 'Business laptops', 2, 500.00, 412.50, 21.20);
