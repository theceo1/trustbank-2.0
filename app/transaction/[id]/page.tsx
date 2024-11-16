import { Suspense } from 'react';
import TransactionStatusView from '@/app/transaction/[id]/TransactionStatusView';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionPageProps {
  params: {
    id: string;
  };
}

export default function TransactionPage({ params }: TransactionPageProps) {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <TransactionStatusView transactionId={params.id} />
      </Suspense>
    </div>
  );
}