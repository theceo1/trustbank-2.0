"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import AdminSidebar from "./components/AdminSidebar";
import { AdminAuthWrapper } from "./utils/withAdminAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthWrapper>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 p-8 bg-gray-50">{children}</main>
        </div>
      </AdminAuthWrapper>
    </QueryClientProvider>
  );
}