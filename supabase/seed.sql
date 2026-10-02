-- Fictional test data only. This is not a real Marcadele designer, product, or offer.
insert into public.products (id, slug, name, designer_name, description, status, is_demo)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'demo-satin-dress',
  'Demo Satin Dress',
  'Demo Atelier',
  'Fictional product data for testing catalog, cart, and checkout integrations.',
  'active',
  true
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  designer_name = excluded.designer_name,
  description = excluded.description,
  status = excluded.status,
  is_demo = excluded.is_demo,
  updated_at = now();

insert into public.product_variants (
  id, product_id, sku, size, color, price_cents, inventory_quantity, reserved_quantity, active
)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'DEMO-SATIN-BLK-M',
  'M',
  'Black',
  12500,
  2,
  0,
  true
)
on conflict (id) do update set
  product_id = excluded.product_id,
  sku = excluded.sku,
  size = excluded.size,
  color = excluded.color,
  price_cents = excluded.price_cents,
  inventory_quantity = excluded.inventory_quantity,
  reserved_quantity = excluded.reserved_quantity,
  active = excluded.active,
  updated_at = now();
