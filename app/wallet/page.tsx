"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  if (!user) {
    return null; // Return null instead of the redirect object
  }

  return (
    <div className="container mx-auto py-8">
      {/* Your wallet page content */}
    </div>
  );
}