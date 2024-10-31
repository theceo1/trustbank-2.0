import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

async function createAdmin(email: string, password: string) {
  try {
    // First, create the auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth Error:', authError);
      throw authError;
    }

    if (!authUser.user) {
      throw new Error('No user created');
    }

    // Get the admin role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    if (roleError) {
      console.error('Role Error:', roleError);
      throw roleError;
    }

    // Add user to admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: authUser.user.id,
        role_id: roleData.id,
        is_active: true,
        last_login_at: new Date().toISOString()
      });

    if (adminError) {
      console.error('Admin Error:', adminError);
      throw adminError;
    }

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

const [email, password] = process.argv.slice(2);
if (email && password) {
  createAdmin(email, password).catch(console.error);
} else {
  console.error('Please provide email and password');
  process.exit(1);
}