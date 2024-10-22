"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/modal";

type TradeAction = 'buy' | 'sell';

export default function TradePage() {
  const [action, setAction] = useState<TradeAction>('buy');
  const [currency, setCurrency] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleTrade = () => {
    closeModal();
    toast({
      title: "Trade Executed",
      description: `Successfully ${action === 'buy' ? 'bought' : 'sold'} ${amount} ${currency}`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-lg font-bold mb-4 text-green-600 pt-12"
      >
        Trade 
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ delay: 0.2, duration: 1.5 }}
        className="max-w-md mx-auto"
      >
        <Card className="bg-white dark:bg-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-center">Buy / Sell Cryptocurrency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-2 ${action === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-l transition-colors duration-300`}
                onClick={() => setAction('buy')}
              >
                Buy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-2 ${action === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-r transition-colors duration-300`}
                onClick={() => setAction('sell')}
              >
                Sell
              </motion.button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); openModal(); }} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="currency">
                  Currency
                </label>
                <Select onValueChange={setCurrency} value={currency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="amount in USD">
                  Amount in USD
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit" className={`w-full py-2 px-4 rounded-md ${
                  action === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                } text-white font-bold transition-colors duration-300`}>
                  {action === 'buy' ? 'Buy' : 'Sell'} {currency}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={`Confirm ${action}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 2, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <p className="text-gray-700 dark:text-gray-300">
                You are about to {action} ${amount} worth of {currency}. Do you want to proceed?
              </p>
              <div className="flex justify-end mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTrade}
                  className={`px-4 py-2 ${action === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded transition-colors duration-300`}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
