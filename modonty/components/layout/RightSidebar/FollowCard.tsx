import { Card, CardContent } from "@/components/ui/card";
import { IconBell } from "@/lib/icons";
import { FollowCardInteractive } from "./FollowCardInteractive";

export function FollowCard() {
  return (
    <Card className="flex-none">
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Label — social icons moved to the homepage welcome card */}
        <div className="flex items-center gap-2">
          <IconBell className="h-4 w-4 shrink-0 text-primary" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase shrink-0">
            تابعنا
          </h2>
        </div>

        {/* Newsletter form + expandable links — Client */}
        <FollowCardInteractive />
      </CardContent>
    </Card>
  );
}
