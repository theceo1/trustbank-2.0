"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebook, FaInstagram, FaSnapchat, FaTwitter } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";

export default function Footer() {
  return (
    <motion.footer 
      className="bg-background border-t mt-auto"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-8 px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="font-bold mb-4 text-lg">trustBank</h3>
            <p className="text-sm">Your trusted platform for simple, secure, and fast cryptocurrency trading.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/market" className="hover:text-green-600 transition-colors">Market</Link></li>
              <li><Link href="/trade" className="hover:text-green-600 transition-colors">Trade</Link></li>
              <li><Link href="/calculator" className="hover:text-green-600 transition-colors">Calculator</Link></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="font-bold mb-4 text-lg">About</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about/vision" className="hover:text-green-600 transition-colors">Vision</Link></li>
              <li><Link href="/about/mission" className="hover:text-green-600 transition-colors">Mission</Link></li>
              <li><Link href="/about/blog" className="hover:text-green-600 transition-colors">Blog</Link></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="font-bold mb-4 text-lg">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about/faq" className="hover:text-green-600 transition-colors">FAQ</Link></li>
              <li><Link href="/about/contact" className="hover:text-green-600 transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-green-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-green-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </motion.div>
        </div>
        <motion.div 
          className="mt-8 text-center text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p>&copy; 2024 trustBank. All rights reserved.</p>
        </motion.div>
        <motion.div
          className="flex justify-center space-x-4 mt-8 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link href="https://www.facebook.com/trustbanktech" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
            <FaFacebook size={24} />
          </Link>
          <Link href="https://www.instagram.com/trustbanktech" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
            <FaInstagram size={24} />
          </Link>
          <Link href="https://www.twitter.com/trustbanktech" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
            <FaTwitter size={24} />
          </Link>
          <Link href="https://www.threads.net/@trustbanktech" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
            <FaThreads size={24} />
          </Link>
          <Link href="https://www.snapchat.com/add/trustbanktech" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
            <FaSnapchat size={24} />
          </Link>
        </motion.div>
      </div>
    </motion.footer>
  );
}
