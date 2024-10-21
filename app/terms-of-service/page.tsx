"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-lg font-bold mb-4 text-green-600"
      >
        Terms of Service
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ delay: 0.2, duration: 1.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">trustBank Service Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Welcome to trustBank. By using our services, you agree to be bound by the following terms and conditions. Please read them carefully.
            </p>
            <h3 className="text-sm font-semibold">1. Acceptance of Terms</h3>
            <p>
              By accessing or using trustBank&apos;s services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
            <h3 className="text-sm font-semibold">2. Eligibility</h3>
            <p>
              You must be at least 18 years old and capable of forming a binding contract to use our services. By using trustBank, you represent and warrant that you meet these eligibility requirements.
            </p>
            <h3 className="text-sm font-semibold">3. Account Registration</h3>
            <p>
              To use certain features of our services, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            <h3 className="text-sm font-semibold">4. User Responsibilities</h3>
            <ul className="list-disc list-inside">
              <li>You are responsible for maintaining the confidentiality of your account and password.</li>
              <li>You agree to notify us immediately of any unauthorized use of your account.</li>
              <li>You agree not to use the service for any illegal or unauthorized purpose.</li>
            </ul>
            <h3 className="text-sm font-semibold">5. Modifications to the Service</h3>
            <p>
              trustBank reserves the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice at any time.
            </p>
            <h3 className="text-sm font-semibold">6. Limitation of Liability</h3>
            <p>
              In no event shall trustBank be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
            <h3 className="text-sm font-semibold">7. Governing Law</h3>
            <p>
              These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
            <h3 className="text-sm font-semibold">8. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at legal@trustbank.com.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

