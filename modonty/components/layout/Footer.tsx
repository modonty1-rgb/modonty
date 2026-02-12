import Link from "@/components/link";
import Image from "next/image";
import { getOptimizedLogoUrl } from "@/lib/image-utils";
import { navLinksConfig } from "@/components/navigatore/nav-links-config";
import { FooterCopyright } from "@/components/layout/FooterCopyright";
import pkg from "../../package.json";

const YEAR = 2025;

export function Footer() {
  const logoSrc = getOptimizedLogoUrl();
  return (
    <footer className="border-t bg-card mt-12">
      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        {/* Top Section: Logo + Copyright */}
        <div className="flex items-center justify-between mb-6 h-11">
          <Image
            src={logoSrc}
            alt="مودونتي"
            width={120}
            height={68}
            className="object-contain"
          />
          <div className="text-sm text-muted-foreground">
            <FooterCopyright appVersion={pkg.version} year={YEAR} />
          </div>
        </div>

        {/* Link Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Company Section */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-foreground">مدونتي</h3>
            <nav className="flex flex-col gap-y-1" aria-label="روابط مدونتي">
              {navLinksConfig.company.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors block py-1 hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          {/* Support Section */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-foreground">الدعم</h3>
            <nav className="flex flex-col gap-y-1" aria-label="روابط الدعم">
              {navLinksConfig.support.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors block py-1 hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          {/* Legal Section */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-foreground">قانوني</h3>
            <nav className="flex flex-col gap-y-1" aria-label="روابط قانونية">
              {navLinksConfig.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors block py-1 hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-4 mt-4">
          <p className="text-xs text-muted-foreground text-center">
            © {YEAR} Modonty. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}




