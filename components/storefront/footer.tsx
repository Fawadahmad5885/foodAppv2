import Image from "next/image";
import Link from "next/link";

type FooterProps = {
  tenantName: string;
};

const SITEMAP_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/#menu" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
  { label: "My Account", href: "/#account" },
  { label: "My Orders", href: "/#orders" },
] as const;

const USEFUL_LINKS = [
  { label: "Deals", href: "/#cat-deals" },
  { label: "Appetizers", href: "/#menu" },
  { label: "Burgers", href: "/#menu" },
  { label: "Wraps & Sandwiches", href: "/#menu" },
  { label: "Dips", href: "/#menu" },
  { label: "Drinks", href: "/#menu" },
] as const;

const linkClassName =
  "text-sm text-white transition hover:text-white/80";

export function Footer({ tenantName }: FooterProps) {
  return (
    <footer className="mt-auto bg-[#00a89e] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="mb-6 inline-block">
              <Image
                src="/images/logos/fiestaa-white-logo.png"
                alt={tenantName}
                width={140}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
            <h3 className="text-sm font-bold uppercase tracking-wide">
              Sitemap
            </h3>
            <ul className="mt-4 space-y-2.5">
              {SITEMAP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:pt-15">
            <h3 className="text-sm font-bold uppercase tracking-wide">
              Useful Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {USEFUL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:pt-15">
            <h3 className="text-sm font-bold">Subscribe Now</h3>
            <form className="mt-4 flex flex-col gap-2">
              <input
                type="email"
                name="email"
                placeholder="Insert your email"
                className="w-full rounded-md bg-white px-4 py-2.5 text-sm text-stone-800 outline-none placeholder:text-stone-400"
              />
              <button
                type="button"
                className="w-full rounded-md bg-[#ffc145] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-95"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/25">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <p className="text-sm text-white/90">
            © Copyright {new Date().getFullYear()} | {tenantName}
          </p>
        </div>
      </div>
    </footer>
  );
}
