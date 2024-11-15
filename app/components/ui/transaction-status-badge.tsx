import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { TransactionStatus } from "@/app/types/transactions";

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

type StatusConfigType = {
  [K in Lowercase<TransactionStatus> | Uppercase<TransactionStatus>]: {
    color: string;
    icon: typeof Clock | typeof CheckCircle | typeof XCircle | typeof AlertCircle;
    label: string;
  };
};

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as Lowercase<TransactionStatus>;
  
  const statusConfig: StatusConfigType = {
    pending: {
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: Clock,
      label: "Pending"
    },
    completed: {
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: CheckCircle,
      label: "Completed"
    },
    failed: {
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      icon: XCircle,
      label: "Failed"
    },
    PENDING: {
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      icon: Clock,
      label: "Pending"
    },
    COMPLETED: {
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      icon: CheckCircle,
      label: "Completed"
    },
    FAILED: {
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      icon: XCircle,
      label: "Failed"
    }
  };

  const defaultConfig = {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    icon: AlertCircle,
    label: "Unknown"
  };

  const config = statusConfig[normalizedStatus] || defaultConfig;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      <span className="capitalize">{config.label}</span>
    </Badge>
  );
}