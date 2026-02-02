import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Home, HelpCircle, LayoutDashboard } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="container mx-auto max-w-[1128px]">
        <div className="max-w-2xl mx-auto text-center">
          {/* Brand Logo Section */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center bg-background border border-border">
                <Image
                  src="https://res.cloudinary.com/dfegnpgwx/image/upload/v1768807772/modontyIcon_svukux.svg"
                  alt="Modonty Admin"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <span className="text-xl font-semibold text-foreground">Modonty Admin</span>
            </Link>
          </div>

          {/* Main 404 Content */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-4">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Home Button */}
          <div className="flex justify-center">
            <Link href="/">
              <Button size="lg" className="gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
