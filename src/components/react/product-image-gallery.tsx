"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  images: { id: string; url: string }[];
  productName: string;
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage(
      (prev) => (prev - 1 + images.length) % images.length,
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="lg:aspect-square lg:overflow-hidden lg:pb-[100%] lg:w-full lg:z-0 max-lg:flex max-lg:justify-center relative">
        <img
          src={images[selectedImage]?.url}
          alt={`${productName} - عرض ${selectedImage + 1}`}
          className="w-full lg:absolute lg:inset-0 lg:h-full lg:w-full lg:object-contain"
        />

        {/* Navigation Arrows - Desktop */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary/10 hover:bg-white transition-opacity hidden md:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/10 hover:bg-white  transition-opacity hidden md:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      <div className="max-lg:hidden flex justify-center space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 ${selectedImage === index
                ? "border-primary"
                : "border-gray-200"
              }`}
          >
            <img
              src={image.url}
              alt={`${productName} صورة مصغرة ${index + 1}`}
              width={80}
              height={80}
              className="w-full h-full object-contain bg-gray-50 p-1"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
