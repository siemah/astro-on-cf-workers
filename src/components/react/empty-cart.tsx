import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="text-center py-12">
      {/* Empty Cart Icon and Message */}
      <div className="mb-8">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-medium text-gray-900 mb-2">
          سلة التسوق فارغة
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          يبدو أنك لم تضف أي عناصر إلى سلة التسوق بعد. ابدأ
          التسوق لملئها!
        </p>
      </div>

      {/* Call to Action */}
      <div className="mb-12">
        <a href="/">
          <Button className="inline-flex items-center !px-8 py-4 h-auto">
            متابعة التسوق
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Featured Products */}
      {/* <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          قد تعجبك هذه المنتجات
        </h3>
        <RelatedProducts products={featuredProducts} />
      </div> */}
    </div>
  );
}
