"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const marketData = [
  { id: 1, name: "Bitcoin", price: 30000, change: 2.5 },
  { id: 2, name: "Ethereum", price: 2000, change: -1.2 },
  { id: 3, name: "Cardano", price: 1.2, change: 5.7 },
];

export default function MarketOverview({ itemsPerPage = 3 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 2, y: 0 }}
      transition={{ duration: 1.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {marketData.slice(0, itemsPerPage).map((coin) => (
              <li key={coin.id} className="flex justify-between items-center">
                <span>{coin.name}</span>
                <div>
                  <span className="mr-2">${coin.price.toLocaleString()}</span>
                  <span className={coin.change > 0 ? "text-green-500" : "text-red-500"}>
                    {coin.change > 0 ? "+" : ""}{coin.change}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}