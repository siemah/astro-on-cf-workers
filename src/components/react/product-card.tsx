"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { CountdownTimer } from "@/components/react/countdown-timer";
import type { FullProduct } from "@/lib/types";
import PriceTag from "./price-tag";

interface RefinedProductCardProps {
  product: FullProduct;
  onQuickView: (product: FullProduct) => void;
}

export function ProductCard({
  product,
  onQuickView,
}: RefinedProductCardProps) {
  const hasDiscount =
    product?.sale_price !== null &&
    product?.sale_price !== undefined;
  const discount = !!product?.sale_price
    ? Math.round(
        ((product.regular_price - product.sale_price) /
          product.regular_price) *
          100,
      )
    : null;
  const handleQuickView = () => {
    onQuickView(product);
  };

  return (
    <div className="group">
      <div className="relative border border-gray-300  overflow-hidden">
        {/* Discount Badge */}
        {discount !== null && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-red-600 text-white text-xs font-medium px-2 py-1">
              -{discount}%
            </span>
          </div>
        )}

        <a
          href={`/product/${product.slug}`}
          className="aspect-square flex items-center justify-center"
        >
          <img
            src={product.images?.[0]?.url ?? undefined}
            // src="https://mockup-api.teespring.com/v3/image/qxWNs6v8yNAZCO7TK52TvhDrwSI/800/800.jpg"
            alt={product.title}
            width={200}
            height={200}
            className="object-contain w-full h-full"
          />
        </a>

        {/* Quick view button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleQuickView}
          className="absolute top-2 right-2 bg-white hover:bg-gray-100 shadow-sm"
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">عرض سريع</span>
        </Button>
      </div>

      {/* Product Info */}
      <div className="mt-4 flex flex-col justify-between gap-1 max-w-full">
        <div className="flex flex-col gap-1 flex-1  max-w-full">
          <h3 className="text-sm font-normal text-[#494949] leading-tight ">
            {product.title}
          </h3>
          <p className="text-xs text-[#8f8f8f] leading-tight truncate  max-w-full">
            {product.excerpt}
          </p>
        </div>

        {/* Price Section */}
        <PriceTag
          regular_price={product.regular_price}
          sale_price={product.sale_price}
          className="text-sm w-fit"
        />
        {/* <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-black">
            ${product?.sale_price ?? product.regular_price}
          </span>
          {product.regular_price && (
            <span className="text-xs text-gray-400 line-through">
              ${product.regular_price}
            </span>
          )}
        </div> */}

        {/* Color Options */}
        {/* {product.colors && (
          <div className="flex space-x-1 pt-1">
            {product.colors.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-lg border border-gray-300"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )} */}

        {/* Timer for limited offers */}
        {/* todo: implement a timer discount */}
        {/* {product.hasTimer && product.timerEndTime && (
          <div className="pt-1">
            <CountdownTimer
              endTime={product.timerEndTime}
            />
          </div>
        )} */}
      </div>
    </div>
  );
}
