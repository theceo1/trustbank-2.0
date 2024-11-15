import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/app/lib/utils";
import { format } from 'date-fns';
import { ChevronDown, Eye } from 'lucide-react';
import { Transaction, CryptoTransaction } from "@/app/types/transactions";
import { TransactionStatusBadge } from "@/app/components/ui/transaction-status-badge";

interface TransactionTableProps {
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
}

export default function TransactionTable({ transactions, onViewDetails }: TransactionTableProps) {
  const [sortField, setSortField] = useState<keyof Transaction>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const sortedAndFilteredTransactions = transactions
    .filter(tx => {
      const searchTerm = filter.toLowerCase();
      if (isCryptoTransaction(tx)) {
        return tx.crypto_currency.toLowerCase().includes(searchTerm) ||
               tx.status.toLowerCase().includes(searchTerm) ||
               tx.type.toLowerCase().includes(searchTerm);
      }
      return tx.status.toLowerCase().includes(searchTerm) ||
             tx.type.toLowerCase().includes(searchTerm);
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const handleSort = (field: keyof Transaction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Helper function to check transaction type
  const isCryptoTransaction = (tx: Transaction): tx is CryptoTransaction => {
    return tx.type === 'buy' || tx.type === 'sell';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filter transactions..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer">
              Date {sortField === 'created_at' && <ChevronDown className={`inline ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />}
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            {transactions.some(isCryptoTransaction) && (
              <>
                <TableHead>Crypto Amount</TableHead>
                <TableHead>Rate</TableHead>
              </>
            )}
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAndFilteredTransactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
              <TableCell className="capitalize">{tx.type}</TableCell>
              <TableCell>{formatCurrency(tx.amount, tx.currency || 'NGN')}</TableCell>
              {isCryptoTransaction(tx) && (
                <>
                  <TableCell>{tx.crypto_amount} {tx.crypto_currency}</TableCell>
                  <TableCell>{formatCurrency(tx.rate, 'NGN')}</TableCell>
                </>
              )}
              <TableCell>
                <TransactionStatusBadge status={tx.status} />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails?.(tx)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}