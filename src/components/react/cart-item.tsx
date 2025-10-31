"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  maxQuantity?: number;
}

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (
    newQuantity: string,
  ) => {
    setIsUpdating(true);
    await new Promise((resolve) =>
      setTimeout(resolve, 300),
    ); // Simulate API call
    onUpdateQuantity(item.id, Number.parseInt(newQuantity));
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    await new Promise((resolve) =>
      setTimeout(resolve, 300),
    ); // Simulate API call
    onRemoveItem(item.id);
    setIsUpdating(false);
  };

  return (
    <div
      className={`flex space-x-4 p-4 border-b border-gray-200 last:border-b-0 ${isUpdating ? "opacity-50" : ""}`}
    >
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={item.image}
            alt={item.name}
            width={96}
            height={96}
            className="w-full h-full object-contain p-2"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {item.description}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              الحجم: {item.size}, اللون: {item.color}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="text-base font-medium text-gray-900">
              ${item.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Quantity and Remove */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Select
              value={item.quantity.toString()}
              onValueChange={handleQuantityChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-16 h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: item.maxQuantity || 10 },
                  (_, i) => i + 1,
                ).map((num) => (
                  <SelectItem
                    key={num}
                    value={num.toString()}
                  >
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">إزالة العنصر</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
