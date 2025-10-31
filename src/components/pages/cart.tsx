"use client";

import { useState } from "react";
import { CartItem } from "@/components/react/cart-item";
import { CartSummary } from "@/components/react/cart-summary";
import { EmptyCart } from "@/components/react/empty-cart";
// import { RelatedProducts } from "@/components/related-products"

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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(false);

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) =>
      items.filter((item) => item.id !== id),
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    setIsLoading(true);
    // Simulate checkout process
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to checkout
    }, 1000);
  };

  const handlePayPal = () => {
    setIsLoading(true);
    // Simulate PayPal process
    setTimeout(() => {
      setIsLoading(false);
      // Handle PayPal checkout
    }, 1000);
  };

  // const relatedProducts = [
  //   {
  //     id: "3",
  //     name: "Classic Crew Neck",
  //     price: 24.99,
  //     image: "/placeholder.svg?height=200&width=200",
  //     href: "/product/3",
  //   },
  //   {
  //     id: "4",
  //     name: "Vintage Wash Tee",
  //     price: 19.99,
  //     originalPrice: 29.99,
  //     image: "/placeholder.svg?height=200&width=200",
  //     href: "/product/4",
  //   },
  // ];

  // Show empty cart if no items
  if (cartItems.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EmptyCart />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium text-gray-900">
          Shopping Cart
        </h1>
        <p className="text-gray-600 mt-1">
          {cartItems.length}{" "}
          {cartItems.length === 1 ? "item" : "items"} in
          your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            <CartSummary
              subtotal={subtotal}
              onCheckout={handleCheckout}
              onPayPal={handlePayPal}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
