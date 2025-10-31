"use client";

import {
  CheckCircle,
  Truck,
  Package,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface OrderStatusTrackerProps {
  orderStatus:
    | "pending"
    | "processing"
    | "delivery"
    | "completed"
    | "cancelled"
    | "refunded"
    | "failed";
  updatedAt: string;
  orderNumber: string;
  estimatedDelivery?: string;
}

export function OrderStatusTracker({
  orderStatus,
  updatedAt,
  orderNumber,
  estimatedDelivery,
}: OrderStatusTrackerProps) {
  const getStatusSteps = () => {
    const baseSteps = [
      {
        id: "pending",
        name: "تم تقديم الطلب",
        description: "تم استلام طلبك",
        icon: Package,
      },
      {
        id: "processing",
        name: "جاري المعالجة",
        description: "يتم تحضير طلبك",
        icon: RefreshCw,
      },
      {
        id: "delivery",
        name: "خارج للتوصيل",
        description: "طلبك في الطريق إليك",
        icon: Truck,
      },
      {
        id: "completed",
        name: "تم التوصيل",
        description: "تم توصيل طلبك",
        icon: CheckCircle,
      },
    ];

    // Handle special statuses
    if (orderStatus === "cancelled") {
      return [
        baseSteps[0],
        {
          id: "cancelled",
          name: "تم إلغاء الطلب",
          description: "تم إلغاء طلبك",
          icon: XCircle,
          isTerminal: true,
        },
      ];
    }

    if (orderStatus === "refunded") {
      return [
        ...baseSteps,
        {
          id: "refunded",
          name: "تم الاسترداد",
          description: "تم استرداد قيمة طلبك",
          icon: RefreshCw,
          isTerminal: true,
        },
      ];
    }

    if (orderStatus === "failed") {
      return [
        baseSteps[0],
        {
          id: "failed",
          name: "فشل الطلب",
          description: "حدثت مشكلة في طلبك",
          icon: AlertCircle,
          isTerminal: true,
        },
      ];
    }

    return baseSteps;
  };

  const getStepStatus = (stepId: string, index: number) => {
    const steps = getStatusSteps();
    const currentStepIndex = steps.findIndex(
      (step) => step.id === orderStatus,
    );
    const step = steps[index];

    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "pending";
  };

  const getStatusColor = () => {
    switch (orderStatus) {
      case "completed":
        return "text-green-600";
      case "delivery":
        return "text-blue-600";
      case "processing":
        return "text-yellow-600";
      case "pending":
        return "text-gray-600";
      case "cancelled":
      case "failed":
        return "text-red-600";
      case "refunded":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusMessage = () => {
    switch (orderStatus) {
      case "pending":
        return "تم تقديم طلبك وهو في انتظار المعالجة.";
      case "processing":
        return "يتم تحضير طلبك للشحن.";
      case "delivery":
        return "طلبك خارج للتوصيل.";
      case "completed":
        return "تم توصيل طلبك بنجاح.";
      case "cancelled":
        return "تم إلغاء طلبك.";
      case "refunded":
        return "تم استرداد قيمة طلبك.";
      case "failed":
        return "حدثت مشكلة في معالجة طلبك.";
      default:
        return "حالة الطلب غير معروفة.";
    }
  };

  const steps = getStatusSteps();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      "ar-DZ",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  return (
    <div className="space-y-8">
      {/* Order Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-medium text-gray-900">
          الطلب #{orderNumber}
        </h2>
        <p
          className={`text-lg font-medium ${getStatusColor()}`}
        >
          {orderStatus.charAt(0).toUpperCase() +
            orderStatus.slice(1)}
        </p>
        <p className="text-sm text-gray-600">
          {getStatusMessage()}
        </p>
        {estimatedDelivery &&
          orderStatus !== "completed" &&
          orderStatus !== "cancelled" &&
          orderStatus !== "failed" && (
            <p className="text-sm text-gray-600">
              التوصيل المتوقع:{" "}
              <span className="font-medium">
                {estimatedDelivery}
              </span>
            </p>
          )}
      </div>

      {/* Progress Tracker */}
      <div className="relative">
        {/* Desktop Progress Line */}
        <div className="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
            style={{
              width: `${(steps.findIndex((step) => step.id === orderStatus) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id, index);
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="flex md:flex-col items-start md:items-center space-x-4 md:space-x-0 md:space-y-2"
              >
                {/* Mobile Progress Line */}
                <div className="md:hidden flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      status === "completed"
                        ? "bg-green-100 border-green-500 text-green-600"
                        : status === "current"
                          ? orderStatus === "cancelled" ||
                            orderStatus === "failed"
                            ? "bg-red-100 border-red-500 text-red-600"
                            : orderStatus === "refunded"
                              ? "bg-purple-100 border-purple-500 text-purple-600"
                              : "bg-blue-100 border-blue-500 text-blue-600"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 mt-2 ${status === "completed" ? "bg-green-500" : "bg-gray-200"}`}
                    />
                  )}
                </div>

                {/* Desktop Icon */}
                <div
                  className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center border-2 z-10 bg-white ${
                    status === "completed"
                      ? "border-green-500 text-green-600"
                      : status === "current"
                        ? orderStatus === "cancelled" ||
                          orderStatus === "failed"
                          ? "border-red-500 text-red-600"
                          : orderStatus === "refunded"
                            ? "border-purple-500 text-purple-600"
                            : "border-blue-500 text-blue-600"
                        : "border-gray-300 text-gray-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Step Content */}
                <div className="flex-1 md:text-center">
                  <h3
                    className={`text-sm font-medium ${
                      status === "completed" ||
                      status === "current"
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 ${
                      status === "completed" ||
                      status === "current"
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.description}
                  </p>
                  {status === "current" && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      آخر تحديث {formatDate(updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          آخر تحديث:{" "}
          <span className="font-medium">
            {formatDate(updatedAt)}
          </span>
        </p>
      </div>
    </div>
  );
}
