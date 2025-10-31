"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-black hover:text-gray-600"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">تبديل القائمة</span>
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <nav className="px-4 py-4 space-y-4">
            <a
              href="/explore"
              className="block text-black hover:text-gray-600 py-2 text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              استكشف
            </a>
            <a
              href="/apparel"
              className="block text-black hover:text-gray-600 py-2 text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              الملابس
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
