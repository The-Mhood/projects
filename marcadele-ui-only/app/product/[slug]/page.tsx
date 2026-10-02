import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getPreviewProductBySlug } from "@/lib/demo/catalog";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getPreviewProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
