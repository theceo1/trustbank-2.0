"use client";

import Calculator from "@/app/components/calculator/Calculator";

export default function CalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="bg-card rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Crypto Investment Calculator</h2>
        <Calculator />
      </div>
    </div>
  );
}
