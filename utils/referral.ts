export function generateReferralCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

export async function validateReferralCode(supabase: any, code: string): Promise<boolean> {
  if (!code) return true; // Empty referral code is valid (optional field)
  
  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('referral_code', code)
    .single();

  if (error) {
    console.error('Error validating referral code:', error);
    return false;
  }

  return !!data;
}
