"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import BackButton from '@/components/ui/back-button';
import { User, Mail, Phone, MapPin } from 'lucide-react';

export default function PersonalInfoPage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your update logic here
    
    toast({
      title: "Success",
      description: "Your personal information has been updated.",
      variant: "default",
    });
    setIsEditing(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <BackButton />
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="flex items-center space-x-4">
              <User className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full"
                />
              </div>
            </motion.div>

            {/* Add similar motion.div blocks for email, phone, and address fields */}

            <motion.div variants={itemVariants} className="flex justify-end space-x-4">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Edit Information
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
