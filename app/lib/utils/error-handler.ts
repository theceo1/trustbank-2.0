import { QuidaxError } from '../services/quidax';

export class TransactionError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public retry?: boolean
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

export function handleTransactionError(error: unknown): TransactionError {
  if (error instanceof QuidaxError) {
    return new TransactionError(
      error.message,
      error.code || 'QUIDAX_ERROR',
      error.status || 500,
      error.status === 503 // Allow retry for service unavailable
    );
  }

  if (error instanceof Error) {
    return new TransactionError(
      error.message,
      'INTERNAL_ERROR',
      500,
      true
    );
  }

  return new TransactionError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    false
  );
}