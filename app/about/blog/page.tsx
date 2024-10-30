"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/app/components/ui/modal";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, TrendingUp, Users, Bell, Calendar, 
  Clock, Tag, ChevronRight, Share2, BookmarkPlus, 
  Shield, DollarSign, Check 
} from "lucide-react";
import BackButton from "@/components/ui/back-button";
import supabase from '@/lib/supabase/client';

const blogPosts = [
  {
    id: 1,
    title: "The Future of Cryptocurrency",
    icon: <TrendingUp className="h-5 w-5 text-green-600" />,
    category: "Market Insights",
    readTime: "5 min read",
    date: "2024-03-20",
    author: "Tony Smith",
    tags: ["Crypto", "Market Analysis", "Technology", "Future Trends"],
    content: [
      "Bitcoin's trajectory and its impact on global finance in 2024",
      "The rise of institutional adoption and its implications for retail investors",
      "CBDCs vs Traditional Cryptocurrencies: The brewing competition",
      "How AI and blockchain convergence is reshaping crypto trading",
      "Key market indicators to watch in the coming quarters"
    ]
  },
  {
    id: 2,
    title: "Security Best Practices in Crypto",
    icon: <Shield className="h-5 w-5 text-blue-600" />,
    category: "Security",
    readTime: "7 min read",
    date: "2024-03-18",
    author: "Sarah Johnson",
    tags: ["Security", "Best Practices", "Wallet Safety", "Cybersecurity"],
    content: [
      "Multi-factor authentication: Your first line of defense",
      "Hardware vs Software wallets: Making the right choice",
      "Common phishing tactics in crypto and how to avoid them",
      "The importance of seed phrase management",
      "Regular security audits for your crypto holdings"
    ]
  },
  {
    id: 3,
    title: "DeFi Revolution: Beyond Traditional Banking",
    icon: <BookOpen className="h-5 w-5 text-purple-600" />,
    category: "Technology",
    readTime: "6 min read",
    date: "2024-03-15",
    author: "Michael Chen",
    tags: ["DeFi", "Innovation", "Banking", "Finance"],
    content: [
      "How DeFi is disrupting traditional lending and borrowing",
      "Yield farming strategies for beginners",
      "Smart contracts: The backbone of DeFi applications",
      "Risk management in DeFi investments",
      "The future of decentralized exchanges"
    ]
  },
  {
    id: 4,
    title: "Crypto Tax Guide 2024",
    icon: <DollarSign className="h-5 w-5 text-green-600" />,
    category: "Education",
    readTime: "8 min read",
    date: "2024-03-12",
    author: "David Wilson",
    tags: ["Taxes", "Compliance", "Regulation", "Finance"],
    content: [
      "Understanding your crypto tax obligations",
      "How to track and report crypto transactions",
      "Tax implications of DeFi yields and staking rewards",
      "Common crypto tax mistakes to avoid",
      "Tools and software for crypto tax reporting"
    ]
  }
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controls = useAnimation();

  const categories = ["all", "Market Insights", "Security", "Technology", "Education"];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = useCallback((postId: number) => {
    setBookmarkedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  }, []);

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
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-600">Blog</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Insights, updates, and expert analysis
            </p>
          </div>
          <Input
            placeholder="Search articles..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            {categories.map(category => (
              <TabsTrigger
                key={category}
                value={category}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subscribe to Our Newsletter</CardTitle>
            <CardDescription>Get the latest crypto insights delivered to your inbox</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {post.icon}
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBookmark(post.id)}
                    >
                      <BookmarkPlus 
                        className={`h-5 w-5 ${
                          bookmarkedPosts.includes(post.id) 
                            ? "fill-current text-green-600" 
                            : ""
                        }`}
                      />
                    </Button>
                  </div>
                  <CardTitle className="text-xl mt-2">{post.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    {post.content.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="text-center p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-4">Welcome to Our Blog Community! 📚</h2>
            <p className="text-muted-foreground mb-6">
              You&apos;ll now receive our latest articles, insights, and updates directly in your inbox.
            </p>
            <Button 
              onClick={() => setIsModalOpen(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Reading
            </Button>
          </div>
        </Modal>
      </motion.div>
    </div>
  );
}
