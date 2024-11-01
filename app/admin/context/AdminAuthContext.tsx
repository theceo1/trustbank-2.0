// app/admin/context/AdminAuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

// Update interface to match the database structure
interface AdminRole {
  name: string;
  permissions: Record<string, string[]>;
}

interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  is_active: boolean;
}

interface AdminRoleResponse {
  name: string;
  permissions: Record<string, string[]>;
}

interface AdminUserResponse {
  id: string;
  user_id: string;
  is_active: boolean;
  role: AdminRoleResponse[] | null;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  adminUser: AdminUser | null;
  hasPermission: (resource: string, action: string) => boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isLoading: true,
  adminUser: null,
  hasPermission: () => false,
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsAdmin(false);
      setAdminUser(null);
      router.push('/auth/login');
    }
  };

  const hasPermission = (resource: string, action: string) => {
    if (!adminUser?.role?.permissions) return false;
    const permissions = adminUser.role.permissions[resource];
    return permissions?.includes(action) || false;
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setAdminUser(null);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select(`
            id,
            user_id,
            is_active,
            role:admin_roles(name, permissions)
          `)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Admin check error:', error);
          setIsAdmin(false);
          setAdminUser(null);
        } else if (!data || !data.is_active) {
          console.log('User is not an active admin');
          setIsAdmin(false);
          setAdminUser(null);
        } else {
          const roleData = data.role && Array.isArray(data.role) && data.role.length > 0 
            ? data.role[0] 
            : { name: '', permissions: {} };

          const adminData: AdminUser = {
            id: data.id,
            user_id: data.user_id,
            is_active: data.is_active,
            role: {
              name: roleData.name,
              permissions: roleData.permissions
            }
          };
          
          console.log('Admin data:', adminData);
          setIsAdmin(true);
          setAdminUser(adminData);
          
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/dashboard') {
            router.push('/admin/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, adminUser, hasPermission, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);