"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VisionPage() {
  return (
    <div className="container mx-auto py-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8"
      >
        Our Vision
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Empowering Financial Freedom</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              At trustBank, we envision a world where cryptocurrency is accessible to everyone, fostering financial inclusion and empowerment. We strive to be at the forefront of the digital currency revolution, providing a platform that combines simplicity, security, and speed to make cryptocurrency trading a seamless experience for all.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}