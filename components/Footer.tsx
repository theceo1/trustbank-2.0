// components/Footer.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebook, FaInstagram, FaSnapchat, FaTwitter, FaAt, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <motion.footer 
      className="bg-background border-t mt-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-8 px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">trustBank</h3>
            <p className="text-sm">We are <span className="text-green-600">Crypto | Simplified</span>. The trusted exchange for simple, secure, and swift cryptocurrency trading.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/market" className="hover:text-green-600 transition-colors">Market</Link></li>
              <li><Link href="/trade" className="hover:text-green-600 transition-colors">Trade</Link></li>
              <li><Link href="/profile/wallet" className="hover:text-green-600 transition-colors">Wallet</Link></li>
              <li><Link href="/calculator" className="hover:text-green-600 transition-colors">Calculator</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">About</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about/vision" className="hover:text-green-600 transition-colors">Vision</Link></li>
              <li><Link href="/about/mission" className="hover:text-green-600 transition-colors">Mission</Link></li>
              <li><Link href="/about/blog" className="hover:text-green-600 transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about/faq" className="hover:text-green-600 transition-colors">FAQ</Link></li>
              <li><Link href="/about/contact" className="hover:text-green-600 transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-green-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-green-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div>
            <h4 className="font-semibold mt-2 mb-2">Connect With Us</h4>
            <div className="flex space-x-6">
              <SocialIcon href="https://www.facebook.com/trustbanktech" icon={FaFacebook} />
              <SocialIcon href="https://www.instagram.com/trustbanktech" icon={FaInstagram} />
              <SocialIcon href="https://www.twitter.com/trustbanktech" icon={FaTwitter} />
              <SocialIcon href="https://www.threads.net/trustbanktech" icon={FaAt} />
              <SocialIcon href="https://www.snapchat.com/add/trustbanktech" icon={FaSnapchat} />
              <SocialIcon href="https://www.tiktok.com/@trustbanktech" icon={FaTiktok} />
            </div>
          </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} trustBank. All rights reserved.
        </div>
      </div>
    </motion.footer>
  );
}

function SocialIcon({ href, icon: Icon }: { href: string; icon: React.ElementType }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
      <Icon size={24} />
    </Link>
  );
}
