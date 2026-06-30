import { Loader2 } from "lucide-react";

type CartLoadingStateProps = {
  message?: string;
};

export function CartLoadingState({
  message = "Loading your cart…",
}: CartLoadingStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" aria-hidden />
      <p className="mt-4 text-sm text-stone-500">{message}</p>
    </div>
  );
}
