"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import { Modal } from "@/app/components/ui/modal";
import { supabase } from '@/supabase/client';

export default function VisionPage() {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 }
    }));
  }, [controls]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ email: email }, { onConflict: 'email' })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setIsModalOpen(true);
        setEmail('');
      } else {
        setError('This email is already subscribed to our newsletter.');
      }
    } catch (error: any) {
      setError('An error occurred while subscribing. Please try again.');
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto py-12 px-2 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-xl font-semibold mb-4"
      >
        Our Vision
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={controls}
        className="space-y-6"
      >
        <Card className="mb-12 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Unlock a Brighter Financial Future</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.p custom={0} animate={controls} initial={{ opacity: 0, y: 20 }} className="text-lg leading-relaxed">
              At trustBank, our vision is to transform the financial landscape, empowering individuals to thrive in a secure, transparent, and innovative ecosystem.
            </motion.p>
            
            <motion.div custom={1} animate={controls} initial={{ opacity: 0, y: 20 }}>
              <h2 className="text-2xl font-semibold mb-4">Future of Payment</h2>
              <div className="relative w-full h-[300px] mb-6">
                <Image 
                  src="/images/debit-card2.svg" 
                  fill 
                  style={{ objectFit: 'contain' }}
                  alt="Debit Card" 
                  priority
                />
              </div>
              <p className="text-lg leading-relaxed">
                Introducing the trustBank Debit Card - a game-changing tool that combines style, security, and convenience. With our iconic logo, this card symbolizes our dedication to empowering your financial ecosystem.
              </p>
            </motion.div>

            <motion.div custom={2} animate={controls} initial={{ opacity: 0, y: 20 }}>
              <h2 className="text-2xl font-semibold mb-4">Empowering Individuals</h2>
              <p className="text-lg mb-4">Our platform is designed to unleash your financial potential, providing:</p>
              <ul className="list-disc list-inside space-y-2 text-lg">
                <li>Intuitive tools for effortless money management.</li>
                <li>Invest and grow your wealth with confidence.</li>
                <li>Access to emerging asset classes and digital economy opportunities.</li>
              </ul>
            </motion.div>

            <motion.div custom={3} animate={controls} initial={{ opacity: 0, y: 20 }}>
              <h2 className="text-2xl font-semibold mb-4">Innovation, Amplified</h2>
              <p className="text-lg mb-4">
                We took a responsible approach to innovation, taking into consideration the unique attributes of blockchain technology. 
                We harness the power of blockchain technology, balancing innovation with regulatory compliance. Our solutions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-lg">
                <li>Foster financial inclusion and accessibility.</li>
                <li>Drive transparency and security.</li>
                <li>Unlock new possibilities for individuals and communities.</li>
              </ul>
            </motion.div>

            <motion.div custom={4} animate={controls} initial={{ opacity: 0, y: 20 }}>
              <h2 className="text-2xl font-semibold mb-4">Built on Trust</h2>
              <p className="text-lg mb-4">
                At the heart of our vision is a commitment to building trust with our users. We believe that transparency, security, and ethical practices are essential for creating a financial ecosystem that truly serves the needs of individuals and communities, globally.
              </p>
              <p className="text-lg mb-4">Transparency, security, and ethics are the foundation of our vision. We&apos;re committed to:</p>
              <ul className="list-disc list-inside space-y-2 text-lg">
                <li>Protecting your assets and data.</li>
                <li>Delivering exceptional user experiences.</li>
                <li>Fostering a community of trust and empowerment.</li>
              </ul>
            </motion.div>

            <motion.div custom={5} animate={controls} initial={{ opacity: 0, y: 20 }}>
              <h2 className="text-2xl font-semibold mb-4">Join the Movement</h2>
              <p className="text-lg mb-6">
                Be part of the financial ecosystem that puts you first. Experience the future of finance with trustBank.
              </p>
            </motion.div>

            <motion.div custom={6} animate={controls} initial={{ opacity: 0, y: 20 }} className="bg-gray-100 p-8 rounded-lg shadow-inner">
              <h3 className="text-2xl font-bold mb-6 text-black">Subscribe to Our Waitlist</h3>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-grow text-lg py-3"
                />
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-lg py-3 px-6">
                  Subscribe
                </Button>
              </form>
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-4 text-black">Subscribed</h2>
        <p className="text-green-600">Welcome to the <span className="font-bold text-green-600">TRUSTED</span> community.🤝</p>
        <p className="text-green-600">We will reach out to you soon.</p>
        <p className="mt-6 bg-gray-300 p-2 rounded-lg text-black"> <span className="font-bold text-green-600">Signed:</span> Tony from trustBank</p>
        <Button onClick={closeModal} className="mt-4 bg-red-600 hover:bg-red-700 text-white w-50% mx-auto">Close</Button>
      </Modal>
    </div>
  );
}
