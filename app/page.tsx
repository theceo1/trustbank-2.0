"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import MobileCarousel from '@/app/components/MobileCarousel';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      router.push('/dashboard');
    } else {
      console.log('No user logged in, staying on homepage');
    }
  }, [user, router]);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration:2.5 }}
        className="text-center mb-20"
      >
        <h1 className="text-6xl font-bold mb-4">trustBank</h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 2 }}
          transition={{ delay: 0.3, duration: 2.5 }}
          className="text-xl mb-8"
        >
          TRADE | SPEND | <span className="text-green-600">EARN</span>
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 2 }}
          transition={{ delay: 0.5, duration: 2.5 }}
          className="text-lg mb-8"
        >
          Secure and user-friendly cryptocurrency exchange you can <span className="text-green-600">trust</span>.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 2, y: 0 }}
          transition={{ delay: 0.7, duration: 2.5 }}
        >
          <Button onClick={handleGetStarted} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md text-lg">
            Get Started
          </Button>
        </motion.div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="mb-16"
      >
        <h2 className="text-lg font-bold text-center mb-8">Our Core Features</h2>
        <div className="hidden md:grid grid-cols-3 gap-8">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-sm font-semibold mb-4 text-black">Secure Transactions</h3>
            <p className="text-gray-700 text-sm">Experience fast, secure, and transparent transactions on our platform.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-sm font-semibold mb-4 text-black">Real-Time Market Data</h3>
            <p className="text-gray-700 text-sm">Stay ahead with the latest market trends and live price updates.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-sm font-semibold mb-4 text-black">User-Friendly Interface</h3>
            <p className="text-gray-700 text-sm">Our intuitive interface makes trading simple, even for beginners.</p>
          </motion.div>
        </div>
        <div className="md:hidden">
          <MobileCarousel
            items={[
              {
                title: "Secure Transactions",
                content: "Experience fast, secure, and transparent transactions on our platform."
              },
              {
                title: "Real-Time Market Data",
                content: "Stay ahead with the latest market trends and live price updates."
              },
              {
                title: "User-Friendly Interface",
                content: "Our intuitive interface makes trading simple, even for beginners."
              }
            ]}
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="mb-8 md:mb-16"
      >
        <h2 className="text-lg md:text-lg font-bold text-center mb-6 md:mb-8">Vision Board</h2>
        <div className="hidden md:grid md:grid-cols-2 md:gap-8">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-green-600 p-4 md:p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4 text-white">trustCard</h3>
            <p className="text-sm md:text-base text-gray-200">Borderless Payments, Real-Time transactions at terminal, and cashback rewards when you transact with trustCard.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-green-600 p-4 md:p-6 rounded-lg shadow-md text-center">
            <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4 text-white">trustCoin</h3>
            <p className="text-sm md:text-base text-gray-200">Tired of market volatility? Look no further! Experience stability with trustCoin, our most stable ETF. Safe for investment and a reliable store of value.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-green-600 p-4 md:p-6 rounded-lg shadow-md text-center">
            <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4 text-white">trustExchange</h3>
            <p className="text-sm md:text-base text-gray-200">Experience user-friendly yet professional trading of ETFs and other digital assets on a trusted platform, <span className="text-white">TTX</span>.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-green-600 p-4 md:p-6 rounded-lg shadow-md text-center">
            <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4 text-white">trustTerminal</h3>
            <p className="text-sm md:text-base text-gray-200">Point Of Service terminal for merchants who accept crypto payments. Save on transaction time, cost, profit, and EARN on every transaction approved through the terminal.</p>
          </motion.div>
        </div>
        <div className="md:hidden">
          <MobileCarousel
            items={[
              {
                title: "trustCard",
                content: "Borderless Payments, Real-Time transactions at terminal, and cashback rewards when you transact with trustCard."
              },
              {
                title: "trustCoin",
                content: "Tired of market volatility? Look no further! Experience stability with trustCoin, our most stable ETF. Safe for investment and a reliable store of value."
              },
              {
                title: "trustExchange",
                content: "Experience user-friendly yet professional trading of ETFs and other digital assets on a trusted platform, TTX."
              },
              {
                title: "trustTerminal",
                content: "Point Of Service terminal for merchants who accept crypto payments. Save on transaction time, cost, profit, and EARN on every transaction approved through the terminal."
              }
            ]}
            isVisionBoard={true}
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="mb-8 md:mb-16"
      >
        <h2 className="text-lg md:text-lg font-bold text-center mb-6 md:mb-8">What Our Users Say</h2>
        <div className="hidden md:grid md:grid-cols-3 md:gap-8">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 p-4 md:p-6 rounded-lg shadow-lg text-center">
            <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-4">
              TrustBank has made my crypto trading experience smooth and secure. I couldn&apos;t ask for a better platform.
            </p>
            <p className="font-semibold text-black">- Ijeoma Ogugua</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 p-4 md:p-6 rounded-lg shadow-lg text-center">
            <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-4">
              The real-time market data and intuitive design have helped me make informed decisions quickly.
            </p>
            <p className="font-semibold text-black">- Michael Massamba</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 p-4 md:p-6 rounded-lg shadow-lg text-center">
            <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-4">
              I use trustBank for my crypto trading needs. I like the top-notch security and reliable service. I certainly recommend it.
            </p>
            <p className="font-semibold text-black">- Vivian Vincent</p>
          </motion.div>
        </div>
        <div className="md:hidden">
          <MobileCarousel
            items={[
              {
                title: "Ijeoma Ogugua",
                content: "TrustBank has made my crypto trading experience smooth and secure. I couldn't ask for a better platform."
              },
              {
                title: "Michael Massamba",
                content: "The real-time market data and intuitive design have helped me make informed decisions quickly."
              },
              {
                title: "Vivian Vincent",
                content: "I use trustBank for my crypto trading needs. I like the top-notch security and reliable service. I certainly recommend it."
              }
            ]}
          />
        </div>
      </motion.section>

      {/* <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="w-full bg-black text-white py-8 mt-12"
      >
        <div className="container mx-auto text-center">
          <p className="mb-4">&copy; 2024 trustBank. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <Link href="/auth/signup" className="hover:underline">Join Us</Link>
            <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <Link href="/about/contact" className="hover:underline">Contact Us</Link>
          </div>
        </div>
      </motion.footer> */}
    </main>
  );
}
