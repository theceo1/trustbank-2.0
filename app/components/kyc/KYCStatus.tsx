import { useEffect, useState } from 'react';
import { KYCService, type KYCStatusType } from '@/app/lib/services/kyc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

interface KYCStatusProps {
  userId: string;
  showAction?: boolean;
}

export default function KYCStatus({ userId, showAction = true }: KYCStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState<KYCStatusType>('unverified');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const eligibility = await KYCService.isEligibleForTrade(userId);
      setStatus(eligibility.eligible ? 'verified' : 'unverified');
      setIsLoading(false);
    };

    fetchStatus();
  }, [userId]);

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Shield className="w-4 h-4 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <ShieldAlert className="w-4 h-4 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <ShieldQuestion className="w-4 h-4 mr-1" />
            Unverified
          </Badge>
        );
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-4">
      {getStatusBadge()}
      {showAction && status !== 'verified' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/profile/kyc')}
        >
          Complete KYC
        </Button>
      )}
    </div>
  );
}