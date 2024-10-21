"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/supabase/client';
import { Modal } from "@/app/components/ui/modal";

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Fetch user location based on IP address using ipinfo
      const response = await fetch(`https://ipinfo.io?token=${process.env.NEXT_PUBLIC_IPINFO_API_KEY}`);
      const locationData = await response.json();
      const userLocation = `${locationData.city}, ${locationData.region}, ${locationData.country}`;

      const { data, error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name,
            email,
            message,
            location: userLocation,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      setIsModalOpen(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      setError('An error occurred while sending your message. Please try again.');
      toast({
        title: "Error",
        description: "An error occurred while sending your message. Please try again.",
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto py-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-lg font-bold mb-4 text-green-600 pt-12"
      >
        Contact Us
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 1.5 }}
        className="text-sm mb-4 text-gray-500"
      >
        <i>Have questions or need assistance? Reach out to us, we&apos;re happy to help.</i>
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ delay: 0.4, duration: 1.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                placeholder="Your Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input 
                type="email" 
                placeholder="Your Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Textarea 
                placeholder="How can we help?" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-50% mx-auto">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="text-center">
          <div className="animate-checkmark">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-black">Thank you for contacting us!</h2>
          <p className="text-green-600">Your satisfaction is our priority. We will reach out to you via email, shortly.</p>
          <p className="mt-6 bg-gray-300 p-2 rounded-lg text-black"> <span className="font-bold text-green-600">Signed:</span> Tony from trustBank</p>
          <Button onClick={closeModal} className="mt-4 bg-red-600 hover:bg-red-700 text-white w-50% mx-auto">Close</Button>
          </div>
      </Modal>
    </div>
  );
}
