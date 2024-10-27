"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import BackButton from '@/components/ui/back-button';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Settings, Lock, Bell, Shield, Smartphone, Mail } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AccountSettingsPage() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    trades: true,
    marketing: false,
  });
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement password change logic here
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    });
    setIsChangingPassword(false);
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast({
      title: "Settings updated",
      description: "Your notification settings have been updated.",
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
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-green-600" />
            <CardTitle className="text-2xl font-bold text-green-600">Account Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="security">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Security Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div variants={itemVariants} className="space-y-4 p-4">
                  <div className="space-y-4">
                    {isChangingPassword ? (
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <Input type="password" placeholder="Current Password" />
                        <Input type="password" placeholder="New Password" />
                        <Input type="password" placeholder="Confirm New Password" />
                        <div className="flex space-x-2">
                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Update Password
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsChangingPassword(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button
                        onClick={() => setIsChangingPassword(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Change Password
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notifications">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div variants={itemVariants} className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={() => handleNotificationChange('email')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={() => handleNotificationChange('push')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <Label htmlFor="trade-notifications">Trade Alerts</Label>
                    </div>
                    <Switch
                      id="trade-notifications"
                      checked={notifications.trades}
                      onCheckedChange={() => handleNotificationChange('trades')}
                    />
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}
