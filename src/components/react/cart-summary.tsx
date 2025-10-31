"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  onCheckout: () => void;
  onPayPal: () => void;
}

export function CartSummary({
  subtotal,
  discount = 0,
  onCheckout,
  onPayPal,
}: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] =
    useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    // Simulate API call
    await new Promise((resolve) =>
      setTimeout(resolve, 1000),
    );
    setIsApplyingPromo(false);
    // Handle promo code application
  };

  const total = subtotal - discount;

  return (
    <div className="space-y-6">
      {/* Subtotal */}
      <div className="space-y-2">
        <div className="flex justify-between text-lg font-medium">
          <span>المجموع الفرعي</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>الخصم</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <p className="text-sm text-gray-600">
          يتم حساب الشحن والضرائب عند الدفع. لديك رمز
          ترويجي؟ أدخله في الخطوة التالية.
        </p>
      </div>

      {/* PayPal Button */}
      <Button
        onClick={onPayPal}
        className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white py-4 rounded-lg flex items-center justify-center"
      >
        <svg
          className="w-20 h-6"
          viewBox="0 0 101 25"
          fill="currentColor"
        >
          <path d="M12.017 0L4.396 25h-4.39L7.627 0h4.39zm7.94 0L12.336 25H7.946L15.567 0h4.39zm7.94 0L20.276 25h-4.39L23.507 0h4.39zm7.94 0L28.216 25h-4.39L31.447 0h4.39z" />
          <path d="M43.508 7.956c0-1.152-.905-2.095-2.095-2.095h-5.486c-.905 0-1.714.619-1.905 1.524L32.168 25h4.39l.81-5.486h3.238c3.238 0 5.905-2.667 5.905-5.905V7.956zm-4.39 5.905h-2.286l.619-4.19h2.286c.619 0 1.143.524 1.143 1.143v1.905c0 .619-.524 1.143-1.143 1.143h-.619z" />
          <path d="M65.956 7.956c0-1.152-.905-2.095-2.095-2.095h-5.486c-.905 0-1.714.619-1.905 1.524L54.616 25h4.39l.81-5.486h3.238c3.238 0 5.905-2.667 5.905-5.905V7.956zm-4.39 5.905h-2.286l.619-4.19h2.286c.619 0 1.143.524 1.143 1.143v1.905c0 .619-.524 1.143-1.143 1.143h-.619z" />
          <path d="M79.831 25h-4.39L83.062 0h4.39L79.831 25z" />
        </svg>
      </Button>

      {/* Promo Code Section */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          هل لديك رمز ترويجي؟
        </p>
        <p className="text-sm text-gray-500">
          أدخله في الخطوة التالية.
        </p>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium rounded-lg"
      >
        الدفع
      </Button>
    </div>
  );
}
