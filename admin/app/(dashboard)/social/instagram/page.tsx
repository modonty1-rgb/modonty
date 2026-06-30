import { Instagram } from "lucide-react";

export default function InstagramPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Instagram className="h-6 w-6 text-[#E1306C]" />
        <h1 className="text-2xl font-semibold">Instagram</h1>
      </div>
      <p className="text-muted-foreground text-sm">
        Manage Instagram posts published automatically on article publish.
      </p>
    </div>
  );
}
