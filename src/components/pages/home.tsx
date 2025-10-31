"use client";

import { useState } from "react";
import { ProductCard } from "@/components/react/product-card";
import { ProductQuickView } from "@/components/react/product-quick-view";
import type {
  FullProduct,
  ShippingData,
} from "@/lib/types";

export default function HomePage({
  products,
  shippings,
  apiEndpoint,
}: {
  products: FullProduct[] | null;
  shippings: Record<string, ShippingData>;
  apiEndpoint?: string;
}) {
  const [quickViewProduct, setQuickViewProduct] =
    useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] =
    useState(false);

  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // todo: handle null products
  if (products === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          لا توجد منتجات متاحة
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Product Grid - 2 columns on mobile, responsive for larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products?.map((product, index) => (
            <ProductCard
              key={`${product.id}-${product.slug}-${index}`}
              product={product}
              onQuickView={handleQuickView}
            />
          ))}
        </div>
      </main>

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        shippings={shippings}
        apiEndpoint={apiEndpoint}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </>
  );
}
