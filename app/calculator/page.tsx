"use client";

import Calculator from "@/app/components/calculator/Calculator";

export default function CalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Calculator Section */}
        <div className="w-full lg:w-2/3">
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Crypto Investment Calculator</h2>
            <Calculator />
          </div>
        </div>

        {/* Side Text Section */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-primary">Smart Investment Decisions</h3>
            <p className="text-muted-foreground">
              Use our advanced calculator to simulate your potential crypto investments. Make informed decisions based on historical data and market trends.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-primary">Real-Time Data</h3>
            <p className="text-muted-foreground">
              Get access to real-time cryptocurrency prices and historical charts to help you analyze market movements and plan your investments.
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-primary">Risk Management</h3>
            <p className="text-muted-foreground">
              Understand potential risks and rewards. Our calculator helps you visualize different scenarios to better manage your investment strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
