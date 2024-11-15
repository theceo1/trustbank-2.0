import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '@/lib/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, verificationData } = req.body;

    // Check if userId and verificationData are provided
    if (!userId || !verificationData) {
      return res.status(400).json({ message: 'User ID and verification data are required' });
    }

    // Insert KYC verification record
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert([
        {
          user_id: userId,
          status: 'pending',
          verification_data: verificationData,
        },
      ]);

    if (error) {
      return res.status(500).json({ message: 'Error inserting KYC verification', error });
    }

    return res.status(201).json({ message: 'KYC verification initiated', data });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}