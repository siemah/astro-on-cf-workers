"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyScrollButtonProps {
  targetId: string;
  buttonText?: string;
}

export function StickyScrollButton({
  targetId,
  buttonText = "View Details",
}: StickyScrollButtonProps) {
  const [isVisible, setIsVisible] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(
    null,
  );

  useEffect(() => {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(targetElement);

    return () => observerRef.current?.disconnect();
  }, [targetId]);

  const scrollToTarget = () => {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth", // Smoothly animates the scroll instead of jumping instantly
      block: "nearest", // Aligns the target element to the top of the viewport
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 md:bottom-6 animate-bounce">
      <Button
        onClick={scrollToTarget}
        className="bg-primary text-white !px-12 py-4 h-auto rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300 hover:scale-105"
      >
        <span className="text-sm font-medium">
          {buttonText}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
