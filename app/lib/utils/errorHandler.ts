import { toast } from "@/hooks/use-toast";

export function handleError(error: unknown, defaultMessage: string) {
  let errorMessage = defaultMessage;

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  console.error("Error:", errorMessage);

  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
}