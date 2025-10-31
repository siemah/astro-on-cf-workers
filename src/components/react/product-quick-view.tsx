"use client";

import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddToCart } from "@/components/react/add-to-cart";
import type {
  FullProduct,
  ShippingData,
} from "@/lib/types";

interface ProductQuickViewProps {
  product: FullProduct | null;
  shippings: Record<string, ShippingData>;
  apiEndpoint?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({
  product,
  shippings,
  apiEndpoint,
  isOpen,
  onClose,
}: ProductQuickViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  // Calculate discount if sale price exists
  const hasDiscount =
    product.sale_price &&
    product.sale_price < product.regular_price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.regular_price - product.sale_price!) /
          product.regular_price) *
          100,
      )
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        // className="max-w-md mx-auto h-full max-h-screen overflow-y-auto p-0 gap-0"
        className="w-full h-full max-w-none max-h-none m-0 p-0 gap-0 md:max-w-4xl md:max-h-[80vh] md:h-auto md:m-auto overflow-y-auto"
        showCloseButton={false}
        dir="rtl"
      >
        <VisuallyHidden>
          <DialogTitle>{product.title}</DialogTitle>
        </VisuallyHidden>
        <DialogHeader
          className="p-4 pb-0"
          aria-describedby={product.title}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 bg-white shadow-sm hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">إغلاق</span>
          </Button>
        </DialogHeader>

        <div className="px-4 pb-4 md:grid md:grid-cols-2 md:gap-8 md:p-6">
          {/* Product Image */}
          <div className="mb-6">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]?.url}
                alt={product.title}
                width={400}
                height={400}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 justify-center">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} عرض ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Title and Price */}
          <div className="flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {product.title}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {hasDiscount
                    ? `${product.sale_price} د.ج`
                    : `${product.regular_price} د.ج`}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.regular_price}
                    </span>
                    <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>
              {product.excerpt && (
                <p className="text-sm text-gray-600 mt-2">
                  {product.excerpt}
                </p>
              )}
            </div>

            {/* Add to Cart Section */}
            <AddToCart
              product={product}
              shippings={shippings}
              apiEndpoint={apiEndpoint}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
