import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50/50 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-stone-100 p-4">
        <Icon className="h-8 w-8 text-stone-400" />
      </div>
      <h3 className="text-lg font-medium text-stone-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-stone-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
