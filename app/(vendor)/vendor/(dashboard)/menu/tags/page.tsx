import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TagsManager } from "@/components/vendor/tags-manager";
import { getTags } from "@/lib/actions/vendor/tags";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function TagsPage() {
  await requireVendorOwner();
  const tags = await getTags();

  return (
    <div>
      <PageHeader title="Tags" description="Product labels like Bestseller or New." />
      {tags.length === 0 ? (
        <EmptyState title="No tags yet" description="Create tags to label products." action={null} />
      ) : null}
      <TagsManager tags={tags} />
    </div>
  );
}
