"use client";

import type React from "react";

import { useState } from "react";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ExpandableSection({
  title,
  children,
  defaultExpanded = false,
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] =
    useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between p-0 h-auto py-4 text-left font-medium text-gray-900 hover:bg-transparent"
      >
        {title}
        {isExpanded ? (
          <Minus className="h-4 w-4 text-gray-500" />
        ) : (
          <Plus className="h-4 w-4 text-gray-500" />
        )}
      </Button>
      {isExpanded && (
        <div className="pb-4 text-sm text-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}
