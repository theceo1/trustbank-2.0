"use client";

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/app/components/ui/modal";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, TrendingUp, Users, Bell } from "lucide-react";
import supabase from '@/lib/supabase/client';

// Enhanced blog posts data structure
const blogPosts = [
  {
    title: "The Future of Cryptocurrency",
    icon: <TrendingUp className="h-5 w-5 text-green-600" />,
    category: "Market Insights",
    readTime: "5 min read",
    content: [
      "Crypto Insights: Stay ahead of the curve with the latest cryptocurrency market updates, trends, and predictions.",
      "Expert Analysis: Deep dives into market movements and technological advancements.",
      "Regulatory Updates: Stay informed about the evolving crypto regulatory landscape."
    ]
  },
  // ... other blog posts
];

export default function BlogPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email,
            source: 'blog_page',
            preferences: { interests: ['blog', 'updates'] },
            metadata: { subscribed_from: 'blog' }
          }
        ]);

      if (error) throw error;

      setIsModalOpen(true);
      setEmail('');
    } catch (error: any) {
      console.error('Subscription error:', error);
      if (error.code === '23505') { // Unique violation error code
        setError('This email is already subscribed to our newsletter.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-lg font-semibold mb-4 text-green-600 pt-12"
      >
        Blog
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity:2 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        className="text-sm mb-4"
      >
        Welcome to the trustBank blog! Your destination for expert insights, market trends, and company news. Empowering your financial journey, one post at a time.
      </motion.p>

      <div className="space-y-8 text-sm leading-relaxed mb-4">
        {blogPosts.map((post, index) => (
          <motion.div
            key={index}
            custom={index}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  {post.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        custom={blogPosts.length}
        className="mt-12"
      >
        <Card>
          <CardHeader>
            <CardTitle>Subscribe to our Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Stay informed, stay ahead. Receive monthly updates on:
            </p>
            <ul className="list-disc list-inside mb-6">
              <li>Market analysis and predictions</li>
              <li>New feature releases</li>
              <li>Community events and initiatives</li>
              <li>Exclusive promotions and offers</li>
            </ul>
            <form onSubmit={handleSubscribe} className="space-y-4">
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
                {isSubmitting ? 'Subscribing...' : 'Subscribe to the Waitlist'}
              </Button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
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
