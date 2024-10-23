"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, AuthContextType } from '@/context/AuthContext';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { ThemeToggle } from "@/components/theme-toggle";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth() as AuthContextType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to log in');
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error(error);
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
        className="w-full max-w-md space-y-8 bg-card p-6 rounded-xl shadow-md"
      >
        <div>
          <h2 className="mt-6 text-center text-lg font-extrabold text-card-foreground">Log in</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email-address" className="sr-only">
                Email address
              </Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-green-600 rounded-t-md focus:outline-none focus:ring-green-600 focus:border-green-600 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-green-600 rounded-b-md focus:outline-none focus:ring-green-600 focus:border-green-600 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
            >
              Log in
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-green-300"
            >
              <FcGoogle className="h-4 w-4 mr-2" />
            Google
            </Button>
          </div>
        </div>

        <p className="mt-2 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-green-600 hover:text-green-500">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
