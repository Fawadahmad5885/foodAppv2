import { PageHeader } from "@/components/dashboard/page-header";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <p className="text-stone-500">This module will be implemented in a future phase.</p>
      </div>
    </div>
  );
}
