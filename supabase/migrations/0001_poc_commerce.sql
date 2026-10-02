-- Marcadele commerce POC only. This is not the final production schema.
-- All customer-facing amounts are integer cents; Stripe is the payment authority.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  designer_name text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  sku text not null unique,
  size text,
  color text,
  price_cents bigint not null check (price_cents >= 0),
  inventory_quantity integer not null default 0 check (inventory_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0 and reserved_quantity <= inventory_quantity),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists products_status_slug_idx on public.products(status, slug);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  checkout_request_id uuid not null unique,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'expired', 'refunded')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled')),
  currency text not null default 'usd' check (currency = lower(currency)),
  subtotal_cents bigint not null default 0 check (subtotal_cents >= 0),
  shipping_cents bigint not null default 0 check (shipping_cents >= 0),
  tax_cents bigint not null default 0 check (tax_cents >= 0),
  discount_cents bigint not null default 0 check (discount_cents >= 0),
  total_cents bigint not null default 0 check (total_cents >= 0),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_payment_status_idx on public.orders(payment_status, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  designer_name text not null,
  sku text not null,
  selected_options jsonb not null default '{}'::jsonb,
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cents bigint not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

create table if not exists public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  status text not null default 'reserved' check (status in ('reserved', 'consumed', 'released')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (order_id, variant_id)
);

create index if not exists inventory_reservations_expiry_idx on public.inventory_reservations(status, expires_at);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete restrict,
  movement_type text not null check (movement_type in ('sale')),
  quantity_delta integer not null check (quantity_delta < 0),
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (order_id, variant_id, movement_type)
);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  order_id uuid references public.orders(id) on delete set null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

-- Public readers can read active product copy only. Variant stock is never granted to the browser.
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
create policy "Public can read active products"
  on public.products for select to anon, authenticated
  using (status = 'active');
revoke all on public.products, public.product_variants from anon, authenticated;
grant select on public.products to anon, authenticated;

-- Private commerce tables are server-only for this POC. RLS is enabled with no browser policies.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_reservations enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.stripe_webhook_events enable row level security;
revoke all on public.orders, public.order_items, public.inventory_reservations,
  public.inventory_movements, public.stripe_webhook_events from anon, authenticated;

create or replace function public.release_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_reservation record;
  v_released integer := 0;
begin
  for v_reservation in
    select id, order_id, variant_id, quantity
    from public.inventory_reservations
    where status = 'reserved' and expires_at <= now()
    for update skip locked
  loop
    update public.product_variants
    set reserved_quantity = reserved_quantity - v_reservation.quantity,
        updated_at = now()
    where id = v_reservation.variant_id
      and reserved_quantity >= v_reservation.quantity;

    if not found then
      raise exception 'RESERVATION_INVENTORY_INCONSISTENT';
    end if;

    update public.inventory_reservations
    set status = 'released'
    where id = v_reservation.id and status = 'reserved';

    update public.orders
    set payment_status = 'expired', updated_at = now()
    where id = v_reservation.order_id and payment_status = 'pending';

    v_released := v_released + 1;
  end loop;

  return v_released;
end;
$$;

create or replace function public.create_pending_order(
  p_checkout_request_id uuid,
  p_items jsonb,
  p_reservation_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_existing public.orders%rowtype;
  v_line record;
  v_variant record;
  v_subtotal bigint := 0;
  v_expires_at timestamptz := p_reservation_expires_at;
  v_item_count integer;
begin
  if p_checkout_request_id is null then
    raise exception 'INVALID_CHECKOUT_REQUEST_ID';
  end if;
  if p_reservation_expires_at is null then
    raise exception 'INVALID_RESERVATION_EXPIRY';
  end if;
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'INVALID_CART';
  end if;

  select count(*) into v_item_count from jsonb_array_elements(p_items);
  if v_item_count < 1 or v_item_count > 30 then
    raise exception 'INVALID_CART_SIZE';
  end if;
  if v_expires_at < now() + interval '30 minutes'
     or v_expires_at > now() + interval '24 hours' then
    raise exception 'INVALID_RESERVATION_EXPIRY';
  end if;

  perform public.release_expired_reservations();

  select * into v_existing
  from public.orders
  where checkout_request_id = p_checkout_request_id
  for update;

  if found then
    if v_existing.payment_status <> 'pending' then
      raise exception 'CHECKOUT_REQUEST_ALREADY_FINISHED';
    end if;
    return jsonb_build_object(
      'orderId', v_existing.id,
      'orderNumber', v_existing.order_number,
      'currency', v_existing.currency,
      'subtotalCents', v_existing.subtotal_cents,
      'items', coalesce((
        select jsonb_agg(jsonb_build_object(
          'variantId', oi.variant_id,
          'productName', oi.product_name,
          'designerName', oi.designer_name,
          'sku', oi.sku,
          'selectedOptions', oi.selected_options,
          'quantity', oi.quantity,
          'unitPriceCents', oi.unit_price_cents,
          'lineTotalCents', oi.line_total_cents
        ) order by oi.created_at)
        from public.order_items oi where oi.order_id = v_existing.id
      ), '[]'::jsonb)
    );
  end if;

  v_order_id := gen_random_uuid();
  v_order_number := 'MC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into public.orders (id, order_number, checkout_request_id)
  values (v_order_id, v_order_number, p_checkout_request_id);

  -- Lock variants in deterministic order so simultaneous checkouts cannot reserve the same last unit.
  for v_line in
    select (entry.value->>'variant_id')::uuid as variant_id,
           sum((entry.value->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items) as entry(value)
    group by (entry.value->>'variant_id')::uuid
    order by (entry.value->>'variant_id')::uuid
  loop
    if v_line.quantity is null or v_line.quantity < 1 or v_line.quantity > 10 then
      raise exception 'INVALID_QUANTITY';
    end if;

    select pv.id, pv.product_id, pv.sku, pv.size, pv.color, pv.price_cents,
           pv.inventory_quantity, pv.reserved_quantity, pv.active,
           p.name as product_name, p.designer_name, p.status as product_status, p.is_demo as product_is_demo
    into v_variant
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = v_line.variant_id
    for update of pv;

    if not found then
      raise exception 'VARIANT_UNAVAILABLE';
    end if;
    if v_variant.active is not true
       or v_variant.product_status <> 'active'
       or v_variant.product_is_demo is not true then
      raise exception 'VARIANT_UNAVAILABLE';
    end if;
    if v_variant.inventory_quantity - v_variant.reserved_quantity < v_line.quantity then
      raise exception 'OUT_OF_STOCK';
    end if;

    update public.product_variants
    set reserved_quantity = reserved_quantity + v_line.quantity,
        updated_at = now()
    where id = v_variant.id;

    insert into public.inventory_reservations (order_id, variant_id, quantity, expires_at)
    values (v_order_id, v_variant.id, v_line.quantity, v_expires_at);

    insert into public.order_items (
      order_id, product_id, variant_id, product_name, designer_name, sku,
      selected_options, unit_price_cents, quantity, line_total_cents
    ) values (
      v_order_id, v_variant.product_id, v_variant.id, v_variant.product_name,
      v_variant.designer_name, v_variant.sku,
      jsonb_strip_nulls(jsonb_build_object('size', v_variant.size, 'color', v_variant.color)),
      v_variant.price_cents, v_line.quantity, v_variant.price_cents * v_line.quantity
    );

    v_subtotal := v_subtotal + v_variant.price_cents * v_line.quantity;
  end loop;

  update public.orders
  set subtotal_cents = v_subtotal,
      total_cents = v_subtotal,
      updated_at = now()
  where id = v_order_id;

  return jsonb_build_object(
    'orderId', v_order_id,
    'orderNumber', v_order_number,
    'currency', 'usd',
    'subtotalCents', v_subtotal,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'variantId', oi.variant_id,
        'productName', oi.product_name,
        'designerName', oi.designer_name,
        'sku', oi.sku,
        'selectedOptions', oi.selected_options,
        'quantity', oi.quantity,
        'unitPriceCents', oi.unit_price_cents,
        'lineTotalCents', oi.line_total_cents
      ) order by oi.created_at)
      from public.order_items oi where oi.order_id = v_order_id
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.mark_order_paid(
  p_event_id text,
  p_event_type text,
  p_order_id uuid,
  p_session_id text,
  p_payment_intent_id text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_reservation record;
  v_inserted_event text;
begin
  insert into public.stripe_webhook_events (event_id, event_type, order_id)
  values (p_event_id, p_event_type, p_order_id)
  on conflict (event_id) do nothing
  returning event_id into v_inserted_event;

  if v_inserted_event is null then
    return jsonb_build_object('duplicate', true, 'orderId', p_order_id);
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if v_order.stripe_checkout_session_id is distinct from p_session_id then
    raise exception 'CHECKOUT_SESSION_MISMATCH';
  end if;

  if v_order.payment_status = 'paid' then
    update public.stripe_webhook_events
    set processed_at = now(), order_id = p_order_id
    where event_id = p_event_id;
    return jsonb_build_object('alreadyPaid', true, 'orderId', p_order_id);
  end if;
  if v_order.payment_status <> 'pending' then
    raise exception 'ORDER_NOT_PAYABLE';
  end if;

  for v_reservation in
    select id, variant_id, quantity
    from public.inventory_reservations
    where order_id = p_order_id and status = 'reserved'
    for update
  loop
    update public.product_variants
    set inventory_quantity = inventory_quantity - v_reservation.quantity,
        reserved_quantity = reserved_quantity - v_reservation.quantity,
        updated_at = now()
    where id = v_reservation.variant_id
      and inventory_quantity >= v_reservation.quantity
      and reserved_quantity >= v_reservation.quantity;

    if not found then
      raise exception 'RESERVATION_INVENTORY_INCONSISTENT';
    end if;

    insert into public.inventory_movements (
      variant_id, order_id, movement_type, quantity_delta, note
    ) values (
      v_reservation.variant_id, p_order_id, 'sale', -v_reservation.quantity, 'Stripe checkout payment confirmed'
    );

    update public.inventory_reservations
    set status = 'consumed'
    where id = v_reservation.id;
  end loop;

  if not exists (
    select 1 from public.inventory_reservations
    where order_id = p_order_id and status = 'consumed'
  ) then
    raise exception 'ORDER_HAS_NO_RESERVED_INVENTORY';
  end if;

  update public.orders
  set payment_status = 'paid',
      fulfillment_status = 'processing',
      stripe_payment_intent_id = p_payment_intent_id,
      updated_at = now()
  where id = p_order_id;

  update public.stripe_webhook_events
  set processed_at = now(), order_id = p_order_id
  where event_id = p_event_id;

  return jsonb_build_object('paid', true, 'orderId', p_order_id);
end;
$$;

create or replace function public.release_order_reservation(
  p_order_id uuid,
  p_session_id text,
  p_reason text,
  p_event_id text,
  p_event_type text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_order public.orders%rowtype;
  v_reservation record;
  v_inserted_event text;
begin
  if p_event_id is not null then
    insert into public.stripe_webhook_events (event_id, event_type, order_id)
    values (p_event_id, coalesce(p_event_type, 'checkout.session.expired'), p_order_id)
    on conflict (event_id) do nothing
    returning event_id into v_inserted_event;

    if v_inserted_event is null then
      return jsonb_build_object('duplicate', true, 'orderId', p_order_id);
    end if;
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if p_session_id is not null and v_order.stripe_checkout_session_id is distinct from p_session_id then
    raise exception 'CHECKOUT_SESSION_MISMATCH';
  end if;

  if v_order.payment_status = 'paid' then
    if p_event_id is not null then
      update public.stripe_webhook_events set processed_at = now() where event_id = p_event_id;
    end if;
    return jsonb_build_object('alreadyPaid', true, 'orderId', p_order_id);
  end if;

  for v_reservation in
    select id, variant_id, quantity
    from public.inventory_reservations
    where order_id = p_order_id and status = 'reserved'
    for update
  loop
    update public.product_variants
    set reserved_quantity = reserved_quantity - v_reservation.quantity,
        updated_at = now()
    where id = v_reservation.variant_id
      and reserved_quantity >= v_reservation.quantity;

    if not found then
      raise exception 'RESERVATION_INVENTORY_INCONSISTENT';
    end if;

    update public.inventory_reservations
    set status = 'released'
    where id = v_reservation.id;
  end loop;

  if v_order.payment_status = 'pending' then
    update public.orders
    set payment_status = case when p_reason = 'expired' then 'expired' else 'failed' end,
        updated_at = now()
    where id = p_order_id;
  end if;

  if p_event_id is not null then
    update public.stripe_webhook_events
    set processed_at = now(), order_id = p_order_id
    where event_id = p_event_id;
  end if;

  return jsonb_build_object('released', true, 'orderId', p_order_id);
end;
$$;

revoke all on function public.release_expired_reservations() from public, anon, authenticated;
revoke all on function public.create_pending_order(uuid, jsonb, timestamptz) from public, anon, authenticated;
revoke all on function public.mark_order_paid(text, text, uuid, text, text) from public, anon, authenticated;
revoke all on function public.release_order_reservation(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.release_expired_reservations() to service_role;
grant execute on function public.create_pending_order(uuid, jsonb, timestamptz) to service_role;
grant execute on function public.mark_order_paid(text, text, uuid, text, text) to service_role;
grant execute on function public.release_order_reservation(uuid, text, text, text, text) to service_role;
