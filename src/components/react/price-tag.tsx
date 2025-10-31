import { cn, formatNumber } from "@/lib/utils";
import type { ComponentProps } from "react";

export default function PriceTag({
  regular_price,
  sale_price,
  className,
}: ComponentProps<"div"> & {
  regular_price: number;
  sale_price?: number | null;
}) {
  // this component is used to display the price tag of a product
  // it takes regular_price and sale_price as props
  // and displays the price tag accordingly
  const regularPrice = regular_price;
  const salePrice = sale_price ?? regular_price;
  const isOnSale = salePrice < regularPrice;
  const formattedRegularPrice = formatNumber(regularPrice);
  const formattedSalePrice = isOnSale
    ? formatNumber(salePrice)
    : null;

  return (
    <div
      className={cn("flex gap-4 items-baseline", className)}
    >
      {isOnSale ? (
        <>
          <span className="text-primary-foreground font-bold">
            {formattedSalePrice} د.ج
          </span>
          <span className="text-sm line-through decoration-double text-muted-foreground">
            {formattedRegularPrice} د.ج
          </span>
        </>
      ) : (
        <span className="text-primary-foreground font-bold">
          {formattedRegularPrice} د.ج
        </span>
      )}
    </div>
  );
}
