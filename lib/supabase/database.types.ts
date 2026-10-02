export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  designer_name: string;
  description: string;
  status: "draft" | "active" | "archived";
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

type ProductVariantRow = {
  id: string;
  product_id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price_cents: number;
  inventory_quantity: number;
  reserved_quantity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  checkout_request_id: string;
  payment_status: "pending" | "paid" | "failed" | "expired" | "refunded";
  fulfillment_status: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";
  currency: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  designer_name: string;
  sku: string;
  selected_options: Json;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  created_at: string;
};

type InventoryReservationRow = {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  status: "reserved" | "consumed" | "released";
  expires_at: string;
  created_at: string;
};

type InventoryMovementRow = {
  id: string;
  variant_id: string;
  order_id: string;
  movement_type: "sale";
  quantity_delta: number;
  note: string;
  created_at: string;
};

type StripeWebhookEventRow = {
  event_id: string;
  event_type: string;
  order_id: string | null;
  received_at: string;
  processed_at: string | null;
};

type Table<Row, Insert, Update, Relationships = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

type ProductVariantRelationship = {
  foreignKeyName: "product_variants_product_id_fkey";
  columns: ["product_id"];
  isOneToOne: false;
  referencedRelation: "products";
  referencedColumns: ["id"];
};

export type Database = {
  public: {
    Tables: {
      products: Table<ProductRow, Omit<ProductRow, "id" | "created_at" | "updated_at"> & Partial<Pick<ProductRow, "id" | "created_at" | "updated_at">>, Partial<ProductRow>>;
      product_variants: Table<
        ProductVariantRow,
        Omit<ProductVariantRow, "id" | "created_at" | "updated_at" | "inventory_quantity" | "reserved_quantity" | "active"> &
          Partial<Pick<ProductVariantRow, "id" | "created_at" | "updated_at" | "inventory_quantity" | "reserved_quantity" | "active">>,
        Partial<ProductVariantRow>,
        [ProductVariantRelationship]
      >;
      orders: Table<OrderRow, Partial<OrderRow>, Partial<OrderRow>>;
      order_items: Table<OrderItemRow, Partial<OrderItemRow>, Partial<OrderItemRow>>;
      inventory_reservations: Table<InventoryReservationRow, Partial<InventoryReservationRow>, Partial<InventoryReservationRow>>;
      inventory_movements: Table<InventoryMovementRow, Partial<InventoryMovementRow>, Partial<InventoryMovementRow>>;
      stripe_webhook_events: Table<StripeWebhookEventRow, Partial<StripeWebhookEventRow>, Partial<StripeWebhookEventRow>>;
    };
    Views: { [_ in never]: never };
    Functions: {
      create_pending_order: {
        Args: {
          p_checkout_request_id: string;
          p_items: Json;
          p_reservation_expires_at: string;
        };
        Returns: Json;
      };
      mark_order_paid: {
        Args: {
          p_event_id: string;
          p_event_type: string;
          p_order_id: string;
          p_session_id: string;
          p_payment_intent_id: string | null;
        };
        Returns: Json;
      };
      release_order_reservation: {
        Args: {
          p_order_id: string;
          p_session_id: string | null;
          p_reason: string;
          p_event_id: string | null;
          p_event_type: string | null;
        };
        Returns: Json;
      };
      release_expired_reservations: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
