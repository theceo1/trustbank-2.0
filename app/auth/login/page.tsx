"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, AuthContextType } from '@/context/AuthContext';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth() as AuthContextType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error: any) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl shadow-lg"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-card-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            <i>Login to continue your crypto journey with <span className="text-green-600">trustBank</span></i>
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-10"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-green-600 hover:text-green-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log in'
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white hover:bg-green-300 hover:text-black"
          disabled={isLoading}
        >
          <FcGoogle className="h-4 w-4 mr-2" />
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-green-600 hover:text-green-500">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
