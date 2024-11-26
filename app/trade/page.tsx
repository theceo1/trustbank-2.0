"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketStats } from "./components/MarketStats";
import { TradeForm } from "./components/TradeForm";
import { TradeHistory } from "./components/TradeHistory";

export default function TradePage() {
  // Reference existing state and auth logic
  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <MarketStats currency="btc" />
      </div>

      <Tabs defaultValue="trade" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trade" className="mt-4 space-y-4">
          <Card className="p-4 sm:p-6">
            <TradeForm />
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <TradeHistory trades={[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
