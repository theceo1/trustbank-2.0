"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8">Welcome to trustBank</h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-xl mb-8 text-center max-w-2xl"
      >
        Your trusted platform for simple, secure, and fast cryptocurrency trading
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="flex space-x-4"
      >
        <Button asChild>
          <Link href="/market">View Market</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/login">Login</Link>
        </Button>
      </motion.div>
    </main>
  );
}
