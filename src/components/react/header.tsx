"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  Package,
  ShoppingCart,
  X,
  GalleryVerticalEnd,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  storeName?: string;
}

export function Header({
  storeName = "zenghouf",
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHome, setIsHome] = useState(false);

  useEffect(() => {
    if (window.location.pathname === "/") {
      setIsHome(true);
    }
  }, []);

  return (
    <>
      <header className="bg-background border-b border-gray-300 sticky top-0 z-40 shadow-sm flex justify-center">
        <div className="flex-1 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-black hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Logo */}
          <a
            href="/"
            className="text-xl font-normal text-black"
          >
            {storeName}
          </a>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex min-h-full space-x-8">
            <a
              href="/"
              className={cn(
                "flex items-center text-black hover:text-gray-600 px-3 py-2 text-sm font-medium border-b-2  border-transparent",
                {
                  "border-black": isHome,
                },
              )}
            >
              استكشف
            </a>
            {/* <a
              href="/apparel"
              className="flex items-center text-black hover:text-gray-600 px-3 py-2 text-sm font-medium"
            >
              Apparel
            </a> */}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:text-gray-600"
              asChild
            >
              <a href="/track-order">
                <span className="sr-only">track order</span>
                <Package className="h-5 w-5" />
                <span className="sr-only">بحث</span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:text-gray-600 relative"
              asChild
            >
              <a href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
                <span className="sr-only">سلة التسوق</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <span className="text-xl font-normal text-black">
                القائمة
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-4">
              <a
                href="/"
                className="flex items-center gap-2 text-black hover:text-gray-600 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <GalleryVerticalEnd className="h-4 w-4" />{" "}
                استكشف
              </a>
              <a
                href="/track-order"
                className="flex items-center gap-2 text-black hover:text-gray-600 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="h-4 w-4" />
                تتبع الطلب
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
