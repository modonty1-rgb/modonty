import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";

/**
 * The partners skeleton — drawn through the SAME shell the page uses.
 *
 * This one was already the closest of the three: right widths, right breakpoints. It still
 * hand-copied the container and the flex row, and that copy had gone stale in the small
 * places the eye does not catch — no `max-lg:py-1.5` on the container, no `max-lg:gap-4`
 * between the stacked columns, and `space-y-4` in the centre where the shell now says
 * `space-y-3 sm:space-y-4`. Each is a few pixels; together they are a visible settle on a
 * phone, and they were guaranteed to drift again on the next shell change.
 *
 * Taking `ThreeColumnLayout` ends that: the copy no longer exists. Only the rails' own
 * widths and breakpoints stay here, verbatim from `RightSidebar`/`LeftSidebar`.
 */

/** Partners rail — appears only from 1240px up, exactly like the real one. */
const RIGHT_RAIL = "hidden w-[300px] shrink-0 self-start space-y-4 min-[1240px]:block";
/** Account rail — from `lg` up. */
const LEFT_RAIL = "hidden w-[300px] shrink-0 self-start space-y-4 lg:block";

export default function ClientsLoading() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "العملاء" },
        ]}
      />
      <ThreeColumnLayout
        right={
          <div className={RIGHT_RAIL} aria-hidden>
            <Skeleton className="h-[190px] w-full rounded-lg" />
            <Skeleton className="h-[280px] w-full rounded-lg" />
            <Skeleton className="h-[68px] w-full rounded-lg" />
            <Skeleton className="h-[68px] w-full rounded-lg" />
          </div>
        }
        center={
          <>
            <Skeleton className="h-[68px] w-full rounded-lg" />
            <div className="flex items-baseline justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[188px] w-full rounded-lg" />
            ))}
          </>
        }
        left={
          <div className={LEFT_RAIL} aria-hidden>
            <Skeleton className="h-[190px] w-full rounded-lg" />
            <Skeleton className="h-[68px] w-full rounded-lg" />
            <Skeleton className="h-[68px] w-full rounded-lg" />
            <Skeleton className="h-[68px] w-full rounded-lg" />
          </div>
        }
      />
    </>
  );
}
