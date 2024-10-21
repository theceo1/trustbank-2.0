"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const blogPosts = [
  {
    title: "Understanding Cryptocurrency Basics",
    excerpt: "Learn the fundamentals of cryptocurrency and blockchain technology.",
  },
  {
    title: "Top 5 Cryptocurrencies to Watch in 2024",
    excerpt: "Discover the most promising cryptocurrencies for the coming year.",
  },
  {
    title: "Securing Your Crypto Wallet: Best Practices",
    excerpt: "Essential tips to keep your digital assets safe and secure.",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto py-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8"
      >
        trustBank Blog
      </motion.h1>
      <div className="space-y-6">
        {blogPosts.map((post, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{post.excerpt}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}