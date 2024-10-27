"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import BackButton from '@/components/ui/back-button';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
}

export default function BillingPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', last4: '4242', expiryDate: '12/24', isDefault: true },
    { id: '2', type: 'bank', last4: '1234', isDefault: false },
  ]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { toast } = useToast();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated successfully.",
    });
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
    toast({
      title: "Payment method removed",
      description: "The payment method has been removed successfully.",
    });
  };

  return (
    <motion.div
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <BackButton />
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-green-600" />
              <CardTitle className="text-2xl font-bold text-green-600">Billing & Payments</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input placeholder="Card Number" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="MM/YY" />
                    <Input placeholder="CVC" />
                  </div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      toast({
                        title: "Payment method added",
                        description: "Your new payment method has been added successfully.",
                      });
                    }}
                  >
                    Add Payment Method
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div variants={itemVariants} className="space-y-4">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                variants={itemVariants}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <CreditCard className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {method.type === 'card' ? 'Card' : 'Bank Account'} ending in {method.last4}
                    </p>
                    {method.expiryDate && (
                      <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>
                    )}
                    {method.isDefault && (
                      <Badge variant="secondary" className="mt-1">Default</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Billing History</h3>
            <div className="space-y-2">
              {/* Add billing history items here */}
              <p className="text-gray-500 text-center py-4">No billing history available</p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
