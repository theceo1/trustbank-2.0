"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/app/components/ui/modal";
import { supabase } from '@/supabase/client';

export default function MissionPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) throw error;

      setIsModalOpen(true);
      setEmail('');
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration:1.5 }}
        className="text-lg font-semibold mb-4 text-green-600"
      >
        Mission
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="space-y-8 text-lg leading-relaxed mb-4"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              At trustBank, our mission is to make financial services accessible, secure, and effortless for everyone, everywhere. We believe that financial inclusion is key to unlocking individual potential and global economic growth.
            </p>
            <p className="text-sm">
              Through innovative solutions and a commitment to transparency, we strive to build trust with our users and create a secure financial ecosystem for everyone.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Our Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Empower a billion individuals globally with access to cryptocurrency and digital assets by 2045.</li>
              <li>Reduce financial exclusion by 4% in the next 3 years.</li>
              <li>Foster a community of financially literate individuals.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How We Do It</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Harnessing blockchain technology for efficient, secure transactions.</li>
              <li>Providing intuitive platforms for easy onboarding.</li>
              <li>Offering competitive rates and low fees.</li>
              <li>Fostering partnerships with local businesses and organizations.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Join the Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Be part of a community tha&apos;s shaping the future of finance. Experience the trustBank difference.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stay Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Subscribe to our waitlist to receive updates on our mission and how we&apos;re making a difference.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe to the waitlist'}
              </Button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4 text-black">Subscribed</h2>
        <p className="text-green-600">Welcome to the <span className="font-bold text-green-600">TRUSTED</span> community.🤝</p>
        <p className="text-green-600">We will reach out to you soon.</p>
        <p className="mt-6 bg-gray-300 p-2 rounded-lg text-black"> <span className="font-bold text-green-600">Signed:</span> Tony from trustBank</p>
        <Button onClick={closeModal} className="mt-4 bg-red-600 hover:bg-red-700 text-white w-50% mx-auto">Close</Button>
      </Modal>
    </div>
  );
}
