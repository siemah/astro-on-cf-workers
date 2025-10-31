# Enhanced AddToCart Component

This enhanced AddToCart component combines both "Add to Cart" and "Buy Now" functionality, extracted from the original Product component's buy now logic.

## Features

### 🛒 Add to Cart Mode
- Simple product addition to cart
- Quantity selection
- Attribute selection (color, size, etc.)
- Basic cart simulation with success/error notifications

### 💳 Buy Now Mode
- Complete order form with customer details
- Progressive field validation
- Shipping method selection based on location
- Real-time price calculation including shipping
- Direct order submission to API
- Comprehensive error handling and user feedback

## Usage

```tsx
import { AddToCart } from "@/components/react/add-to-cart";

<AddToCart
  product={productData}
  apiEndpoint="/api"
  shippings={shippingsData}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `product` | `FullProduct` | ✅ | Product data including attributes, prices, and images |
| `apiEndpoint` | `string` | ❌ | API endpoint for order submission (required for Buy Now mode) |
| `shippings` | `Record<string, ShippingMethod[]>` | ❌ | Shipping options by state/region |

## Product Data Structure

```typescript
type FullProduct = {
  id: string;
  slug: string;
  title: string;
  regular_price: number;
  sale_price?: number;
  status: string;
  excerpt?: string;
  content?: string;
  images: Array<{
    id: string;
    url: string;
    alt: string;
  }>;
  variations: any[];
  attributes?: Array<{
    name: string;
    values: string[];
  }>;
}
```

## Shipping Data Structure

```typescript
type ShippingMethod = {
  instance_id: number;
  zone_id: string;
  method_id: string;
  method_title: string;
  price: number;
}

// Shipping data organized by state
const shippings = {
  "algiers": [
    {
      instance_id: 1,
      zone_id: "zone_1",
      method_id: "flat_rate",
      method_title: "توصيل عادي",
      price: 500,
    }
  ],
  // ... other states
}
```

## Buy Now Form Fields

When in "Buy Now" mode, the component collects:

1. **Product Attributes** (if any)
   - Dynamically generated based on product.attributes
   - Required selection for all attributes

2. **Quantity**
   - Minimum: 1
   - Maximum: 10 (configurable)

3. **Customer Information**
   - Full Name (minimum 2 characters)
   - Phone Number (Algerian format: 0XXXXXXXXX)
   - State/Wilaya (from predefined list)
   - Municipality/Commune (based on selected state)

4. **Shipping Method**
   - Available methods based on selected state
   - Displays method name and cost
   - Updates total price calculation

## Validation

The component includes comprehensive validation:

- **Progressive Validation**: Fields are validated in order, guiding user through completion
- **Real-time Feedback**: Immediate validation on field changes
- **Required Field Checking**: Ensures all necessary information is provided
- **Format Validation**: Phone numbers, names, etc. follow expected formats

## API Integration

### Add to Cart
Currently simulated with console logging. Replace with your cart service:

```typescript
// Replace the TODO in handleAddToCart
await addToCart({
  productId: product.id,
  quantity,
  attributes: selectedAttributes
});
```

### Buy Now Order Submission
Sends POST request to `${apiEndpoint}/order` with:

```typescript
{
  pid: product.id,
  fullName: string,
  phone: string,
  state: string,
  municipality: string,
  quantity: number,
  selectedVariation: null,
  shippingMethod: ShippingMethod | undefined,
  attributes: Record<string, string>
}
```

Expected API response:
```typescript
// Success
{ id: "order_id_123" }

// Error
{ errors: { field: "error_message" } }
```

## Styling

The component uses Tailwind CSS classes and is fully responsive. Key styling features:

- **Mode Toggle**: Clean button group for switching between modes
- **Form Layout**: Organized sections with proper spacing
- **Loading States**: Animated spinners and disabled states
- **Success/Error States**: Color-coded feedback
- **RTL Support**: Arabic text and layout considerations

## Notifications

Uses `sonner` toast library for user feedback:

- Loading states during operations
- Success messages for completed actions
- Error messages with helpful descriptions
- Arabic language support

## Dependencies

- React (hooks: useState, useEffect, useMemo)
- Lucide React (icons)
- Sonner (toast notifications)
- Custom UI components (Button, Input, Label, Select)
- Utility functions (cn for className merging)

## Error Handling

Comprehensive error handling for:

- Network failures
- API errors
- Validation failures
- Missing required data
- Invalid form submissions

## Accessibility

- Proper form labels and structure
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA attributes where needed

## Localization

Currently supports:
- Arabic (ar) - Primary language
- Interface text in Arabic
- State names in Arabic
- Error messages in Arabic

## Example Implementation

See `src/components/examples/add-to-cart-example.tsx` for a complete working example with sample data.
