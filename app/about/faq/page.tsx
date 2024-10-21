"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is cryptocurrency?",
    answer: "Cryptocurrency is a digital or virtual currency that uses cryptography for security. It operates independently of a central bank and can be transferred directly between individuals.",
  },
  {
    question: "How do I start trading on trustBank?",
    answer: "To start trading on trustBank, simply create an account, verify your identity, deposit funds, and you're ready to buy and sell cryptocurrencies.",
  },
  {
    question: "Is trustBank secure?",
    answer: "Yes, trustBank employs state-of-the-art security measures, including encryption and multi-factor authentication, to ensure the safety of your assets and personal information.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto py-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8"
      >
        Frequently Asked Questions
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  );
}