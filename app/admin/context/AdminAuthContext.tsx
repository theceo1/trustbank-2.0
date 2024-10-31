"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '@/lib/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AdminAuthContextType {
  isAdmin: boolean;
  loading: boolean;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  loading: true,
  permissions: [],
  hasPermission: () => false,
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  const checkAdmin = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        return;
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (adminUser) {
        setIsAdmin(true);
        setPermissions(adminUser.permissions || []);
      } else {
        setIsAdmin(false);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setPermissions([]);
      } else {
        await checkAdmin();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const hasPermission = useCallback((permission: string) => {
    return permissions.includes(permission) || permissions.includes('*');
  }, [permissions]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, loading, permissions, hasPermission }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);