"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-lg font-bold mb-4 text-green-600 pt-12"
      >
        Privacy Policy
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ delay: 0.2, duration: 1.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Our Commitment to Your Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              At trustBank, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you use our services.
            </p>
            <h3 className="text-lg font-semibold">Information We Collect</h3>
            <ul className="list-disc list-inside">
              <li>Personal information (e.g., name, email address, phone number)</li>
              <li>Financial information necessary for transactions</li>
              <li>Usage data and analytics</li>
            </ul>
            <h3 className="text-lg font-semibold">How We Use Your Information</h3>
            <ul className="list-disc list-inside">
              <li>To provide and improve our services</li>
              <li>To process transactions and maintain your account</li>
              <li>To communicate with you about our services and updates</li>
              <li>To comply with legal and regulatory requirements</li>
            </ul>
            <h3 className="text-lg font-semibold">Data Security</h3>
            <p>
              We implement robust security measures to protect your data from unauthorized access, alteration, disclosure, or destruction. These measures include encryption, access controls, and regular security audits.
            </p>
            <h3 className="text-lg font-semibold">Your Rights</h3>
            <p>
              You have the right to access, correct, or delete your personal information. You may also have the right to object to or restrict certain processing of your data. To exercise these rights, please contact us using the information provided below.
            </p>
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <p>
              If you have any questions or concerns about our Privacy Policy, please contact us at privacy@trustbank.com.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

