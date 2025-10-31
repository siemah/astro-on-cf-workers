"use client";

import { useState, type FormEventHandler } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderStatusTracker } from "@/components/react/order-status-tracker";
import { toast } from "sonner";

interface TrackOrderState {
  orderNumber: string;
  orderData: {
    orderNumber: string;
    orderStatus:
      | "pending"
      | "processing"
      | "delivery"
      | "completed"
      | "cancelled"
      | "refunded"
      | "failed";
    updatedAt: string;
    estimatedDelivery?: string;
  } | null;
  isLoading: boolean;
  error: string;
}

export default function TrackOrderPage({
  apiEndpoint,
}: {
  apiEndpoint: string;
}) {
  const [state, setState] = useState<TrackOrderState>({
    orderNumber: "",
    orderData: null,
    isLoading: false,
    error: "",
  });

  const updateState = (
    updates: Partial<TrackOrderState>,
  ) => {
    setState((prevState) => ({
      ...prevState,
      ...updates,
    }));
  };

  const handleTrackOrder: FormEventHandler<
    HTMLFormElement
  > = async (e) => {
    e.preventDefault();
    const orderNumber = e.currentTarget.orderNumber.value;

    if (!orderNumber.trim()) {
      updateState({ error: "يرجى إدخال رقم الطلب" });
      return;
    }

    updateState({ isLoading: true, error: "" });

    const url = `${apiEndpoint}/track-order?order_number=${orderNumber}`;
    toast.promise(
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),
      {
        dismissible: true,
        closeButton: true,
        position: "top-center",
        loading: "جاري تتبع الطلب...",
        // @ts-expect-error sonner error at typing success function
        success(res) {
          updateState({ isLoading: false });

          if (res?.success === true) {
            const orderStatus = res.data.status;
            const updatedAt = new Date(res.data.updated_at);
            const estimatedDelivery = new Date(
              updatedAt.getTime() + 3600 * 24 * 1000,
            ).toISOString();
            const orderData: TrackOrderState["orderData"] =
              {
                orderNumber: state.orderNumber,
                orderStatus: orderStatus,
                updatedAt: updatedAt.toISOString(),
                estimatedDelivery:
                  orderStatus === "delivery"
                    ? estimatedDelivery
                    : undefined,
              };

            updateState({
              orderData: orderData,
              orderNumber,
            });

            return "تم العثور على الطلب بنجاح! يمكنك الآن تتبع حالة طلبك.";
          }

          updateState({
            error:
              res?.error ??
              "لم يتم العثور على الطلب المطلوب. يرجى التأكد من صحة رقم الطلب والمحاولة مرة أخرى.",
          });
          return {
            type: "error",
            message: "حدث خطأ أثناء تتبع الطلب.",
            description:
              Object?.values(res?.error)?.[0] ??
              "يرجى التحقق من المعلومات المدخلة والمحاولة مرة أخرى.",
          };
        },
        async error() {
          updateState({
            isLoading: false,
            error:
              "حدث خطأ في الاتصال أثناء تتبع الطلب. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.",
          });
          return "حدث خطأ في الاتصال أثناء تتبع الطلب. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.";
        },
      },
    );
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Track Order Form */}
      {state.orderData === null && (
        <Card className="rounded-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-center">
              تتبع طلبك
            </CardTitle>
          </CardHeader>
          <CardContent className="max-md:px-3 space-y-4">
            <form onSubmit={handleTrackOrder}>
              <label
                htmlFor="orderNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                رقم الطلب
              </label>
              <div className="flex">
                <Input
                  id="orderNumber"
                  name="orderNumber"
                  type="text"
                  placeholder="أدخل رقم طلبك (مثال: 19)"
                  // value={state.orderNumber}
                  // onKeyPress={handleKeyPress}
                />
                <Button
                  disabled={state.isLoading}
                  className="max-md:text-xs"
                  type="submit"
                >
                  {state.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري التتبع...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4" />
                      <span>تتبع الطلب</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
            {state.error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {state.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Status Tracker Only */}
      {state.orderData && (
        <Card className="rounded-lg">
          <CardContent className="pt-6">
            <OrderStatusTracker
              orderStatus={state.orderData.orderStatus}
              updatedAt={state.orderData.updatedAt}
              orderNumber={state.orderNumber}
              estimatedDelivery={
                state.orderData.estimatedDelivery
              }
            />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
