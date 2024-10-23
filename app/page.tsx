"use client";

import React, { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FaChevronDown } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';

export default function Home() {
  return (
    <>
      <Head>
        <title>trustBank - Cryptocurrency Exchange you can trust</title>
        <meta name="description" content="Begin your cryptocurrency journey with us" />
      </Head>
      <div className="container mx-auto px-4 py-20 pt-32 md:pt-20">
        <AnimatedSection delay={0.2}>
          <motion.section
            className="text-center mb-16 md:mb-32 min-h-[calc(100vh-20rem)] flex flex-col justify-center"
          >
            <motion.h1 
              className="text-6xl font-bold mb-2"
            >
              trustBank
            </motion.h1>
            <motion.p 
              className="text-xl mb-8"
            >
              TRADE | SPEND | <span className="text-green-600">EARN</span>
            </motion.p>
            <motion.p 
              className="text-lg mb-6"
            >
              Secure and user-friendly cryptocurrency exchange you can <span className="text-green-600">trust</span>.
            </motion.p>
            <motion.div>
              <Button asChild className="bg-green-600 text-white px-6 py-3 rounded-md text-lg hover:bg-opacity-90 mt-8">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </motion.div>
            <ScrollIndicator />
          </motion.section>
        </AnimatedSection>

        <div className="mt-16">
          <AnimatedSection delay={0.2}>
            <CoreFeatures />
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <VisionBoard />
          </AnimatedSection>
          <AnimatedSection delay={0.6}>
            <UserFeedback />
          </AnimatedSection>
        </div>
      </div>
    </>
  );
}

function CoreFeatures() {
  return (
    <motion.section className="mb-16">
      <motion.h2 
        className="text-2xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Our Core Features
      </motion.h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <FeatureCard title="Secure Transactions" content="Experience fast, secure, and transparent transactions on our platform." />
        <FeatureCard title="Real-Time Market Data" content="Stay ahead with the latest market trends and live price updates." />
        <FeatureCard title="User-Friendly Interface" content="Our intuitive interface makes trading simple, even for beginners." />
      </motion.div>
    </motion.section>
  );
}

function VisionBoard() {
  return (
    <motion.section className="mb-16">
      <motion.h2 
        className="text-2xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Vision Board
      </motion.h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <VisionCard title="trustCard" content="Borderless Payments, Real-Time transactions at terminal, and cashback rewards when you transact with trustCard." />
        <VisionCard title="trustCoin" content="Experience stability with trustCoin, our most stable ETF. Safe for investment and a reliable store of value." />
        <VisionCard title="trustExchange" content="Experience user-friendly yet professional trading of ETFs and other digital assets on a trusted platform, TTX." />
        <VisionCard title="trustTerminal" content="Point Of Service terminal for merchants who accept crypto payments. Save on transaction time, cost, profit, and EARN on every transaction." />
      </motion.div>
    </motion.section>
  );
}

function UserFeedback() {
  return (
    <motion.section className="mb-16">
      <motion.h2 
        className="text-2xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        What Our Users Say
      </motion.h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <FeedbackCard name="Ijeoma Ogugua" content="TrustBank has made my crypto trading experience smooth and secure. I couldn't ask for a better platform." />
        <FeedbackCard name="Michael Massamba" content="The real-time market data and user-friendly interface have significantly improved my trading strategies." />
        <FeedbackCard name="Vivian Vincent" content="TrustBank's security features give me peace of mind. I can trade confidently knowing my assets are protected." />
      </motion.div>
    </motion.section>
  );
}

function FeatureCard({ title, content }: { title: string; content: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
      <h3 className="text-lg font-semibold mb-4 text-black">{title}</h3>
      <p className="text-gray-700">{content}</p>
    </motion.div>
  );
}

function VisionCard({ title, content }: { title: string; content: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-green-600 p-6 rounded-lg shadow-lg text-center">
      <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
      <p className="text-gray-200">{content}</p>
    </motion.div>
  );
}

function FeedbackCard({ name, content }: { name: string; content: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 p-6 rounded-lg shadow-lg text-center">
      <p className="text-gray-700 mb-4">{content}</p>
      <p className="font-semibold text-black">- {name}</p>
    </motion.div>
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
      className="text-center mt-60"
    >
      <FaChevronDown className="text-green-600 text-3xl mx-auto" />
      {/* <p className="text-sm mt-2">Scroll for more</p> */}
    </motion.div>
  );
}

function AnimatedSection({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
      transition={{ duration: 1.2, delay: delay * 1.5 }}
    >
      {children}
    </motion.div>
  );
}
