"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { cn, formatNumber } from "@/lib/utils";
import type {
  FullProduct,
  ShippingData,
} from "@/lib/types";
import { algerianStates } from "@/lib/locations";
import municipalitiesByState from "@/config/cities.json";
import { addToCart, extractPixelId, purchase } from "@/lib/pixels/meta";

type ShippingMethod = {
  zone_id: string;
  instance_id: number;
  method_id: string | null;
};

interface AddToCartProps
  extends React.HTMLAttributes<HTMLFormElement> {
  product: FullProduct;
  apiEndpoint?: string;
  shippings?: Record<string, ShippingData>;
}

export function AddToCart({
  product,
  apiEndpoint,
  shippings,
  ...props
}: AddToCartProps) {
  const pixelEventID = useRef(`event.id.${Math.random() * 1000000}-${Date.now()}`).current;
  const [formData, setFormData] = useState({
    pid: product?.id ?? 0,
    fullName: "",
    phone: "",
    state: "",
    municipality: "",
    quantity: 1,
    selectedVariation: null,
    shippingMethod: {
      zone_id: "",
      instance_id: -1,
      method_id: null,
    },
    attributes: {} as Record<string, string>,
  });

  const [submitResponse, setSubmitResponse] = useState({
    loading: false,
    success: false,
    data: null,
  });

  const initialShakingField = product?.variations?.length
    ? "selectedVariation"
    : product?.attributes?.length
      ? `attribute_${product.attributes[0].name}`
      : "fullName";
  const [currentShakingField, setCurrentShakingField] =
    useState(initialShakingField);
  const [completedFields, setCompletedFields] = useState<
    string[]
  >([]);
  const [allFieldsComplete, setAllFieldsComplete] =
    useState(false);
  const [focusedField, setFocusedField] = useState<
    string | null
  >(null);

  // Validation functions
  const validateFullName = (name: string) => {
    return name.trim().length >= 2;
  };

  const validatePhone = (phone: string) => {
    // Algerian phone number validation (starts with 0 and has 10 digits)
    const phoneRegex = /^0[4-7][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateState = (state: string) => {
    return state.trim().length > 0;
  };

  const validateMunicipality = (municipality: string) => {
    return municipality.trim().length > 0;
  };

  const validateQuantity = (quantity: number) => {
    return quantity >= 1 && quantity <= 10;
  };

  const validateShippingMethod = (
    method: ShippingMethod,
  ) => {
    return (
      !!method &&
      method.zone_id &&
      method.instance_id !== -1
    );
  };

  const validateAttribute = (attributeName: string) => {
    const [, name] = attributeName.split("_");
    const attribute = product?.attributes?.find(
      (attr) => attr.name === name,
    );
    const attributeValue =
      formData.attributes?.[name] ?? undefined;

    if (
      formData.attributes?.[name] === undefined ||
      attribute?.values.includes(attributeValue) === false
    ) {
      return false;
    }

    return (
      attributeValue && attributeValue.trim().length > 0
    );
  };

  // Check if a field is valid
  const isFieldValid = (fieldName: string, value: any) => {
    if (fieldName.startsWith("attribute")) {
      return validateAttribute(fieldName);
    }

    switch (fieldName) {
      case "selectedVariation":
        return !product?.variations?.length || !!value;
      case "fullName":
        return validateFullName(value);
      case "phone":
        return validatePhone(value);
      case "state":
        return validateState(value);
      case "municipality":
        return validateMunicipality(value);
      case "quantity":
        return validateQuantity(value as number);
      case "shippingMethod":
        return validateShippingMethod(value);
      default:
        return false;
    }
  };

  // Field order for progressive validation
  const fieldOrder = useMemo(() => {
    const order = [];

    // Add variations or attributes first
    if (product?.variations?.length) {
      order.push("selectedVariation");
    } else if (product?.attributes?.length) {
      product.attributes.forEach((attr) => {
        order.push(`attribute_${attr.name}`);
      });
    }

    // Add the base fields
    order.push(
      "fullName",
      "phone",
      "state",
      "municipality",
    );

    // Add shipping method if available for the selected state
    if (
      !!shippings?.[formData.state] &&
      shippings?.[formData.state]?.length > 0
    ) {
      order.push("shippingMethod");
    }

    // Add quantity at the end
    order.push("quantity");

    return order;
  }, [
    product?.variations?.length,
    product?.attributes,
    formData.state,
    shippings,
  ]);

  // Check if shipping is required for this state
  const isShippingRequired =
    !!shippings?.[formData.state] &&
    shippings?.[formData.state]?.length > 0;

  // Validate required fields based on what's actually needed
  const requiredFields = useMemo(() => {
    const fields = [
      "fullName",
      "phone",
      "state",
      "municipality",
      "quantity",
    ];

    // Add variation validation or attribute validation
    if (product?.variations?.length) {
      fields.push("selectedVariation");
    } else if (product?.attributes?.length) {
      product.attributes.forEach((attr) => {
        fields.push(`attribute_${attr.name}`);
      });
    }

    // Add shipping method only if shipping is available for the state
    if (isShippingRequired) {
      fields.push("shippingMethod");
    }

    return fields;
  }, [
    product?.variations?.length,
    product?.attributes,
    isShippingRequired,
  ]);

  // Check if all required fields are valid
  const allRequiredFieldsValid = useMemo(() => {
    return requiredFields.every((field) => {
      const value =
        formData[field as keyof typeof formData];
      return isFieldValid(field, value);
    });
  }, [formData, requiredFields]);

  // Update current shaking field based on form state
  useEffect(() => {
    const newCompletedFields: string[] = [];
    const validationOrder = [...fieldOrder];
    const currentFieldIndex = validationOrder.indexOf(
      currentShakingField,
    );

    // First, collect all completed fields
    for (const field of validationOrder) {
      const value =
        formData[field as keyof typeof formData];
      if (isFieldValid(field, value)) {
        newCompletedFields.push(field);
      }
    }

    setCompletedFields(newCompletedFields);

    // If all fields are complete
    if (
      newCompletedFields.length === validationOrder.length
    ) {
      setAllFieldsComplete(true);
      setCurrentShakingField("");
      return;
    }

    setAllFieldsComplete(false);

    // If current field is completed, move to next incomplete field
    if (
      currentFieldIndex !== -1 &&
      newCompletedFields.includes(currentShakingField)
    ) {
      // Find the next incomplete field after the current one
      const nextIncompleteField = validationOrder
        .slice(currentFieldIndex + 1)
        .find(
          (field) => !newCompletedFields.includes(field),
        );

      if (nextIncompleteField) {
        setCurrentShakingField(nextIncompleteField);
        return;
      }
    }

    // If we're not on any field or current field isn't valid, find first incomplete field
    if (
      !currentShakingField ||
      !newCompletedFields.includes(currentShakingField)
    ) {
      const firstIncompleteField = validationOrder.find(
        (field) => !newCompletedFields.includes(field),
      );
      if (
        firstIncompleteField &&
        firstIncompleteField !== currentShakingField
      ) {
        setCurrentShakingField(firstIncompleteField);
      }
    }
  }, [formData, fieldOrder, currentShakingField]);

  const handleInputChange =
    (field: string, value: any) => () => {
      setFormData({
        ...formData,
        [field]: value,
      });
    };

  const handleInputChangeViaEvent =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement
      >,
    ) => {
      handleInputChange(field, e.target.value)();
    };

  const handleAttributeChange =
    (attributeName: string, value: string) => () => {
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeName]: value,
        },
      }));
    };

  const handleQuantityChange = (change: number) => () => {
    const newQuantity = formData.quantity + change;
    if (newQuantity >= 1) {
      handleInputChange("quantity", newQuantity)();
    }
  };

  const handleFocus = (field: string) => () => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const getCurrentPrice = () => {
    if (
      formData.selectedVariation &&
      product?.variations?.length
    ) {
      const selectedVariation = product.variations.find(
        (variation) =>
          variation.id === formData.selectedVariation,
      );
      if (selectedVariation) {
        return (
          selectedVariation.sale_price ??
          selectedVariation.regular_price
        );
      }
    }
    return product.sale_price ?? product.regular_price;
  };

  const currentPrice = getCurrentPrice();

  const getShippingCost = (
    state: string,
    method: ShippingMethod,
  ) => {
    const selectedShippingMethod = shippings?.[state]?.find(
      (item) =>
        item.instance_id === method.instance_id &&
        item.zone_id === method.zone_id,
    );
    const stateCosts = selectedShippingMethod?.price ?? 0;

    return stateCosts;
  };

  const calculateTotal = () => {
    const subtotal =
      parseFloat(`${getCurrentPrice()}`) *
      formData.quantity;
    const shipping =
      formData.state && formData.shippingMethod
        ? getShippingCost(
            formData.state,
            formData.shippingMethod,
          )
        : 0;
    return formatNumber(subtotal + shipping);
  };

  const getMunicipalitiesForState = (
    stateValue: keyof typeof municipalitiesByState,
  ) => {
    return municipalitiesByState[stateValue] ?? [];
  };

  const onValueChange = (value: string) => {
    handleInputChange("municipality", value)();
  };

  // Handle state change with proper municipality reset
  const handleStateChange = (value: string) => {
    setFormData({
      ...formData,
      state: value,
      municipality: "", // Reset municipality when state changes
      shippingMethod: {
        // Reset shipping method when state changes
        zone_id: "",
        instance_id: -1,
        method_id: null,
      },
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!apiEndpoint) {
      toast.error("خطأ في الإعدادات", {
        dismissible: true,
        closeButton: true,
        description: "حدث خطأ أثناء إرسال الطلب.",
        position: "bottom-center",
      });
      return;
    }

    // Check if variation is required but not selected
    if (
      product?.variations?.length &&
      !formData.selectedVariation
    ) {
      toast.error("يرجى اختيار نوع المنتج", {
        dismissible: true,
        closeButton: true,
        description:
          "يرجى اختيار نوع المنتج قبل إرسال الطلب.",
        position: "bottom-center",
      });
      return;
    }

    if (!allRequiredFieldsValid) {
      toast.error("يرجى ملء جميع الحقول المطلوبة", {
        dismissible: true,
        closeButton: true,
        description:
          "يرجى التأكد من ملء جميع الحقول المطلوبة بشكل صحيح قبل إرسال الطلب.",
        position: "bottom-center",
      });
      return;
    }

    try {
      setSubmitResponse({
        ...submitResponse,
        loading: true,
      });

      const {
        selectedVariation: vid = undefined,
        shippingMethod,
      } = formData;
      let body = {
        ...formData,
        phone: formData.phone.replaceAll(" ", ""),
        attributes: formData.attributes ?? undefined,
        shippingMethod: !!shippingMethod?.method_id
          ? shippingMethod
          : undefined,
        vid,
      };

      if (vid === null || vid === undefined) {
        delete body.vid;
      }

      toast.promise(
        fetch(`${apiEndpoint}/order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }).then((res) => res.json()),
        {
          dismissible: true,
          closeButton: true,
          loading: "جاري إرسال الطلب...",
          // @ts-expect-error sonner error at typing success function
          async success(res) {
            if (!!res?.order_number) {
              setSubmitResponse({
                ...submitResponse,
                loading: false,
                success: true,
                data: res,
              });
              const facebookPixelIds = JSON.parse(
                document
                  .querySelector("[name='facebook-pixel-id']")
                  ?.getAttribute("content") as string
              ) as string[];
              const [fn, ...rest] = formData.fullName.split(" ");
              const ln = rest.join(" ");
              console.log(`fn: ${fn}`);
              console.log(`ln: ${ln}`);
              const _fbPixels = facebookPixelIds?.map(extractPixelId);
              
              for (const pixelId of _fbPixels) {
                const metaConfig = {
                  eventID: pixelEventID,
                  sourceUrl: window.location.href,
                  pixelId,
                };
                const userData = {
                  fn: fn,
                  ln: ln,
                  ph: formData.phone,
                  ct: formData.municipality,
                  st: formData.state,
                };
                await addToCart(
                  {
                    id: product.id,
                    regular_price: product.regular_price,
                    name: product.title,
                  },
                  formData.quantity,
                  metaConfig,
                  userData
                );
                await purchase(
                  product?.sale_price ?? product.regular_price,
                  [`${product.id}`],
                  [
                    {
                      id: product.id,
                      quantity: `${formData.quantity}`,
                    },
                  ],
                  "DZD",
                  "product",
                  metaConfig,
                  userData
                );
              }

              return "تم إرسال الطلب بنجاح! شكرًا لك على طلبك.";
            }

            setSubmitResponse({
              ...submitResponse,
              loading: false,
            });

            return {
              type: "error",
              message: "حدث خطأ أثناء إرسال الطلب.",
              description:
                Object?.values(res?.error)?.[0] ??
                "يرجى التحقق من المعلومات المدخلة والمحاولة مرة أخرى.",
            };
          },
          async error(error) {
            setSubmitResponse({
              ...submitResponse,
              loading: false,
            });
            return "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.";
          },
        },
      );
    } catch (error) {
      toast.error(
        "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        {
          dismissible: true,
          closeButton: true,
          description:
            "يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.",
        },
      );
      setSubmitResponse({
        ...submitResponse,
        loading: false,
      });
    }
  };

  const getFieldClasses = (fieldName: string) => {
    const isShaking = currentShakingField === fieldName;
    const isCompleted = completedFields.includes(fieldName);
    const isFocused = focusedField === fieldName;

    return cn("transition-all duration-300", {
      "animate-pulse border-red-400 ring-1 ring-red-400":
        isShaking && !isFocused,
      "border-green-500 ring-1 ring-green-500": isCompleted,
      "border-blue-500 ring-1 ring-blue-500": isFocused,
    });
  };

  const getAttributeClasses = (
    fieldName: string,
    isSelected: boolean,
  ) => {
    const isShaking = currentShakingField === fieldName;
    const isFocused = focusedField === fieldName;

    return cn(
      "px-4 py-2 text-sm border border-primary transition-colors cursor-pointer",
      {
        "bg-primary text-white": isSelected,
        "border-primary bg-white text-gray-900 hover:bg-gray-50":
          !isSelected,
      },
      isShaking && !isFocused ? "shake" : "no-shake",
    );
  };

  const getVariationClasses = (isSelected: boolean) => {
    const isShaking =
      currentShakingField === "selectedVariation";
    const isFocused = focusedField === "selectedVariation";

    return cn(
      "px-4 py-2 text-sm border border-primary transition-colors cursor-pointer flex flex-col items-center",
      {
        "bg-primary text-white": isSelected,
        "border-primary bg-white text-gray-900 hover:bg-gray-50":
          !isSelected,
      },
      isShaking && !isFocused ? "shake" : "no-shake",
    );
  };

  useEffect(() => {
    if (typeof window?.fbq === "function") {
      window.fbq('track', 'ViewContent', {
        content_name: product.title,
        content_ids: [product.id],
        value: product?.sale_price ?? product.regular_price,
        content_type: "product",
        contents: JSON.stringify([{ id: `${product.id}`, quantity: 1 }]),
        currency: "DZD",
        source: "zzenz",
        version: "1.0.0",
        timestamp: Date.now(),
          client_user_agent: window?.navigator.userAgent,
      }, { eventID: pixelEventID });
    }
  }, [])


  if (product === null) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <div className="text-center">
          <p className="text-gray-600">
            عذرًا، لم نتمكن من العثور على المنتج المطلوب.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      {...props}
    >
      {/* Product Variations */}
      {product?.variations &&
      product?.variations?.length > 0 ? (
        <div
          className={cn(
            "flex flex-col gap-2",
            currentShakingField === "selectedVariation" &&
              focusedField !== "selectedVariation"
              ? "shake"
              : "no-shake",
          )}
        >
          <label className="block text-sm font-medium text-gray-900">
            اختر النوع المناسب *
          </label>
          {currentShakingField === "selectedVariation" && (
            <p className="text-red-500 text-sm mb-2 animate-pulse">
              يرجى اختيار نوع المنتج
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {product.variations?.map((variation) => (
              <button
                key={variation.id}
                type="button"
                onClick={handleInputChange(
                  "selectedVariation",
                  variation.id,
                )}
                className={getVariationClasses(
                  formData.selectedVariation ===
                    variation.id,
                )}
                onFocus={handleFocus("selectedVariation")}
                onBlur={handleBlur}
              >
                <div>{variation.title}</div>
                <div className="text-xs mt-1">
                  {variation.sale_price ? (
                    <>
                      <span className="font-bold">
                        {formatNumber(variation.sale_price)}{" "}
                        دج
                      </span>
                      {variation.regular_price && (
                        <span className="line-through opacity-60 ml-1">
                          {formatNumber(
                            variation.regular_price,
                          )}{" "}
                          دج
                        </span>
                      )}
                    </>
                  ) : (
                    variation.regular_price && (
                      <span className="font-bold">
                        {formatNumber(
                          variation.regular_price,
                        )}{" "}
                        دج
                      </span>
                    )
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Attributes Selection */
        product.attributes &&
        product.attributes.length > 0 && (
          <div className="space-y-4">
            {product.attributes.map((attribute) => (
              <div
                key={attribute.name}
                className={cn(
                  "flex flex-col gap-2",
                  currentShakingField ===
                    `attribute_${attribute.name}` &&
                    focusedField !==
                      `attribute_${attribute.name}`
                    ? "shake"
                    : "no-shake",
                )}
              >
                <label className="block text-sm font-medium text-gray-900">
                  {attribute.name} *
                </label>
                {currentShakingField ===
                  `attribute_${attribute.name}` && (
                  <p className="text-red-500 text-sm mb-2 animate-pulse">
                    يرجى اختيار {attribute.name}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {attribute.values.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={handleAttributeChange(
                        attribute.name,
                        value,
                      )}
                      className={getAttributeClasses(
                        `attribute_${attribute.name}`,
                        formData.attributes[
                          attribute.name
                        ] === value,
                      )}
                      onFocus={handleFocus(
                        `attribute_${attribute.name}`,
                      )}
                      onBlur={handleBlur}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Full Name */}
      <div
        className={cn(
          "flex flex-col gap-3",
          currentShakingField === "fullName" &&
            focusedField !== "fullName"
            ? "shake"
            : "no-shake",
        )}
      >
        <Label htmlFor="fullName">الاسم الكامل *</Label>
        {currentShakingField === "fullName" && (
          <p className="text-red-500 text-sm animate-pulse">
            يرجى إدخال الاسم الكامل (على الأقل حرفين)
          </p>
        )}
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChangeViaEvent("fullName")}
          placeholder="أدخل اسمك الكامل"
          className={cn(
            "mt-1 h-10",
            getFieldClasses("fullName"),
          )}
          onFocus={handleFocus("fullName")}
          onBlur={handleBlur}
        />
      </div>

      {/* Phone */}
      <div
        className={cn(
          "flex flex-col gap-3",
          currentShakingField === "phone" &&
            focusedField !== "phone"
            ? "shake"
            : "no-shake",
        )}
      >
        <Label htmlFor="phone">رقم الهاتف *</Label>
        {currentShakingField === "phone" && (
          <p className="text-red-500 text-sm animate-pulse">
            يرجى إدخال رقم هاتف صحيح (10 أرقام تبدأ بـ 04, 05,
            06, أو 07)
          </p>
        )}
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChangeViaEvent("phone")}
          placeholder="مثال: 0551234567"
          className={cn(
            "mt-1 h-10",
            getFieldClasses("phone"),
          )}
          onFocus={handleFocus("phone")}
          onBlur={handleBlur}
        />
      </div>

      {/* State */}
      <div
        className={cn(
          "flex flex-col gap-3",
          currentShakingField === "state" &&
            focusedField !== "state"
            ? "shake"
            : "no-shake",
        )}
      >
        <Label htmlFor="state">الولاية *</Label>
        {currentShakingField === "state" && (
          <p className="text-red-500 text-sm animate-pulse">
            يرجى اختيار الولاية
          </p>
        )}
        <Select
          value={formData.state}
          onValueChange={handleStateChange}
        >
          <SelectTrigger
            className={cn(
              "mt-1 h-10",
              getFieldClasses("state"),
            )}
            onFocus={handleFocus("state")}
            onBlur={handleBlur}
          >
            <SelectValue placeholder="اختر الولاية" />
          </SelectTrigger>
          <SelectContent>
            {algerianStates.map((state) => (
              <SelectItem
                key={state.value}
                value={state.code}
              >
                {state.label.ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Municipality */}
      {formData.state && (
        <div
          className={cn(
            "flex flex-col gap-3",
            currentShakingField === "municipality" &&
              focusedField !== "municipality"
              ? "shake"
              : "no-shake",
          )}
        >
          <Label htmlFor="municipality">البلدية *</Label>
          <Select
            key={formData.state}
            value={formData.municipality}
            onValueChange={onValueChange}
            disabled={!formData.state}
            onOpenChange={(open) => {
              if (open && formData.state) {
                handleFocus("municipality");
              } else {
                handleBlur();
              }
            }}
          >
            <SelectTrigger
              className={cn(
                "mt-1 h-10",
                getFieldClasses("municipality"),
              )}
            >
              <SelectValue
                placeholder={
                  formData.state
                    ? "اختر البلدية"
                    : "اختر الولاية أولاً"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {formData.state &&
                getMunicipalitiesForState(
                  formData.state as keyof typeof municipalitiesByState,
                ).map((municipality) => (
                  <SelectItem
                    key={municipality.value}
                    value={municipality.value}
                  >
                    {municipality.label.ar}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {currentShakingField === "municipality" && (
            <p className="text-red-500 text-sm mt-1 animate-pulse">
              يرجى اختيار البلدية
            </p>
          )}
        </div>
      )}

      {/* Shipping Method */}
      {shippings &&
        formData.state &&
        shippings[formData.state]?.length > 0 && (
          <div
            className={cn(
              "flex flex-col gap-3",
              currentShakingField === "shippingMethod" &&
                focusedField !== "shippingMethod"
                ? "shake"
                : "no-shake",
            )}
          >
            <Label htmlFor="shipping">طريقة الشحن *</Label>
            {currentShakingField === "shippingMethod" && (
              <p className="text-red-500 text-sm animate-pulse">
                يرجى اختيار طريقة الشحن
              </p>
            )}
            <Select
              value={JSON.stringify({
                zone_id: formData.shippingMethod.zone_id,
                instance_id:
                  formData.shippingMethod.instance_id,
                method_id:
                  formData.shippingMethod.method_id ?? null, // Ensure method_id is set
              })}
              onValueChange={(value) => {
                if (!value) return;

                const selectedShippingMethod =
                  JSON.parse(value);
                handleInputChange("shippingMethod", {
                  instance_id:
                    selectedShippingMethod.instance_id,
                  zone_id: selectedShippingMethod.zone_id,
                  method_id:
                    selectedShippingMethod?.method_id ??
                    null,
                })();
              }}
              onOpenChange={(open) => {
                if (open) {
                  handleFocus("shippingMethod");
                } else {
                  handleBlur();
                }
              }}
            >
              <SelectTrigger
                className={cn(
                  "mt-1 h-10",
                  getFieldClasses("shippingMethod"),
                )}
              >
                <SelectValue placeholder="اختر طريقة الشحن" />
              </SelectTrigger>
              <SelectContent>
                {shippings[formData.state]?.map(
                  (shippingItem) => (
                    <SelectItem
                      key={`${shippingItem.instance_id}_${shippingItem.zone_id}`}
                      // value={`${shippingItem.instance_id}_${shippingItem.zone_id}`}
                      value={JSON.stringify({
                        zone_id: shippingItem.zone_id,
                        instance_id:
                          shippingItem.instance_id,
                        method_id:
                          shippingItem.method || null, // Ensure method_id is set
                      })}
                    >
                      {shippingItem.method ===
                      "free_shipping"
                        ? "الشحن المجاني"
                        : shippingItem.method ===
                            "flat_rate"
                          ? "التوصيل إلى المنزل"
                          : `استلام من المكتب ${shippingItem.pickupLocation ?? ""}`}
                      -{" "}
                      {`${formatNumber(shippingItem.price) ?? 0} د.ج`}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        )}

      {/* Quantity Selector */}
      <div
        className={cn(
          "flex flex-col gap-3",
          currentShakingField === "quantity" &&
            focusedField !== "quantity"
            ? "shake"
            : "no-shake",
        )}
      >
        <label className="block text-sm font-medium text-gray-900">
          الكمية *
        </label>
        {currentShakingField === "quantity" && (
          <p className="text-red-500 text-sm animate-pulse">
            يرجى تحديد الكمية (من 1 إلى 10)
          </p>
        )}
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleQuantityChange(-1)}
            disabled={formData.quantity <= 1}
            className="h-10 w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span
            className={cn(
              "w-10 text-center text-lg font-medium transition-colors",
              {
                "animate-pulse text-red-500":
                  currentShakingField === "quantity" &&
                  focusedField !== "quantity",
                "text-foreground":
                  completedFields.includes("quantity"),
                "text-blue-600":
                  focusedField === "quantity",
              },
            )}
          >
            {formData.quantity}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleQuantityChange(1)}
            className="h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Total Price */}
      <div className="flex items-center justify-between pt-4 border-t border-primary/20">
        <span className="text-lg font-bold text-gray-900">
          المجموع الكلي:
        </span>
        <span className="text-xl font-bold text-primary">
          {calculateTotal()} دج
        </span>
      </div>

      {/* Buy Now Button */}
      {/* @ts-expect-error should type useState */}
      {!submitResponse.data?.order_number && (
        <Button
          type="submit"
          disabled={
            submitResponse.loading ||
            !allRequiredFieldsValid ||
            submitResponse.success
          }
          className="w-full h-12 text-base font-medium text-white"
          size="lg"
        >
          {submitResponse.loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>جاري إرسال الطلب...</span>
            </div>
          ) : (
            <span className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>اشتري الآن</span>
            </span>
          )}
        </Button>
      )}

      {/* Success Message */}
      {submitResponse.success && (
        <div className="text-center py-4">
          <div className="text-green-600 text-lg font-medium mb-2">
            <div>
              <div className="text-green-600 text-lg font-medium mb-2">
                ✅ تم إرسال طلبك بنجاح! رقم الطلب:{" "}
                <span className="text-green-700 text-4xl font-bold">
                  {/* @ts-expect-error type useState */}
                  {submitResponse.data?.order_number}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            سنتواصل معك قريباً لتأكيد الطلب
          </p>
        </div>
      )}

      {/* Stock Status */}
      {!submitResponse.success && (
        <p className="text-sm text-green-600 text-center pb-4">
          ✓ متوفر في المخزون - جاهز للشحن
        </p>
      )}
    </form>
  );
}
