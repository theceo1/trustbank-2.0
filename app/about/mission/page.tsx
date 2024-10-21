"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MissionPage() {
  return (
    <div className="container mx-auto py-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8"
      >
        Our Mission
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Simplifying Cryptocurrency for All</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              trustBank's mission is to demystify cryptocurrency trading and make it accessible to everyone. We are committed to providing a user-friendly platform that prioritizes security, speed, and simplicity. Our goal is to educate and empower individuals to participate in the digital economy confidently, fostering a community of informed and successful cryptocurrency traders.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}