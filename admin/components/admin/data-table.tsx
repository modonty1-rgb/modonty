"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string | React.ReactNode;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  /** يُطبَّق على رأس العمود وخلاياه معاً — مثل `w-[1%]` ليأخذ العمودُ عرضَ محتواه فقط. */
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  pageSize?: number;
  /** Controls rendered beside the search box — filters that belong on the same line as it. */
  toolbar?: React.ReactNode;
  /** صفٌّ يحمل حالةً تُقرأ من لونه (كهرمانيّ = يحتاج مراجعة) — يبقى النصّ في الصفّ لمن لا يميّز الألوان. */
  rowClassName?: (item: T) => string | undefined;
  /** نصّ حالة الفراغ — الافتراضيّ إنجليزيّ للجداول القديمة، والعربيّة تمرّر نصّها. */
  emptyText?: string;
  /** يُلحق بعنصر `<table>` — لحجم خطٍّ أصغر في جدولٍ عريض الأعمدة مثلاً. */
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  onRowClick,
  pageSize = 10,
  toolbar,
  rowClassName,
  emptyText = "No data found",
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
    return path.split(".").reduce((current, prop) => {
      if (current && typeof current === "object" && prop in current) {
        return (current as Record<string, unknown>)[prop];
      }
      return undefined;
    }, obj as unknown);
  };

  const filteredData = useMemo(() => {
    let result = searchKey
      ? data.filter((item) => {
          const value = item[searchKey];
          return value && String(value).toLowerCase().includes(search.toLowerCase());
        })
      : data;

    if (sortKey && sortDirection) {
      const column = columns.find((col) => String(col.key) === sortKey);
      if (column?.sortFn) {
        result = [...result].sort((a, b) => {
          const comparison = column.sortFn!(a, b);
          return sortDirection === "asc" ? comparison : -comparison;
        });
      } else {
        result = [...result].sort((a, b) => {
          const aValue = getNestedValue(a, sortKey);
          const bValue = getNestedValue(b, sortKey);
          
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;
          
          if (typeof aValue === "string" && typeof bValue === "string") {
            return aValue.localeCompare(bValue);
          }
          if (typeof aValue === "number" && typeof bValue === "number") {
            return aValue - bValue;
          }
          return String(aValue).localeCompare(String(bValue));
        });
        if (sortDirection === "desc") {
          result.reverse();
        }
      }
    }

    return result;
  }, [data, searchKey, search, sortKey, sortDirection, columns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // الرأسُ نفسه هو زرّ الفرز (خالد ١٨ سبتمبر): لا أيقونةَ «⇅» ولا سهمَ اتّجاه — أيُّ
  // رمزٍ يُضاف يوسّع العمود لحظةَ الضغط. الحالةُ تُقال باللون (أزرق العلامة) وبالتلميح.
  const sortTitle = (columnKey: string) => {
    if (sortKey !== columnKey) return "اضغط للترتيب";
    return sortDirection === "asc" ? "مرتَّب تصاعديّاً — اضغط للتنازليّ" : "مرتَّب تنازليّاً — اضغط للإلغاء";
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      {(searchKey || toolbar) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchKey && (
            <div className="relative w-full max-w-sm">
              {/* `start-3`/`ps-10` لا `left-3`/`pl-10`: الجداول العربية (شاشات فاتن) تُرسم
                  داخل `dir="rtl"`، والقيمة المثبّتة يساراً تضع الأيقونة فوق آخر ما يُكتب.
                  في الإنجليزية `start` = يسار، فالرسم لا يتغيّر في أي جدول قائم. */}
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="ps-10"
              />
            </div>
          )}
          {/* الفلاتر تجلس في صفّ البحث لا في صفٍّ فوقه. سطران أحدهما شبه فارغ يدفعان الجدول
              — وهو المقصود من الصفحة — تحت الطيّة بلا مقابل. */}
          {toolbar}
        </div>
      )}

      {/* Standard admin-table look (entity-standard #3, mirrors the accounts table):
          LOCKED row height 40px header / 44px body row · muted small headers · column dividers · zebra rows.
          Row height is fixed here ONCE — never override per table. */}
      {/* الحشو الأفقيّ 10px لا 16px (خالد ١٨ سبتمبر): جدولُ اثني عشر عموداً كان يدفع
          ٣٨٤px حشواً وحدها فيولد تمريرٌ أفقيّ على ١٢٨٠. كلّ عمودٍ يأخذ ما يحتاجه فقط. */}
      <div className="border rounded-lg bg-card scroll-x-visible [&_th]:!h-10 [&_td]:!py-0 [&_th]:!px-2.5 [&_td]:!px-2.5 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
        <Table
          className={cn(
            "whitespace-nowrap text-[13px]",
            "[&_th]:border-e [&_td]:border-e [&_th:last-child]:border-e-0 [&_td:last-child]:border-e-0",
            "[&_th]:border-border/50 [&_td]:border-border/50",
            className,
          )}
        >
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    // الرأسُ القابل للفرز يقول ذلك عند المرور: أرضيّةٌ أزرقُ العلامة الباهت
                    // ونصٌّ بلون العلامة — لا رماديٌّ يُشبه الزيبرا (خالد ١٨ سبتمبر ٢٠٢٦).
                    column.sortable !== false &&
                      "cursor-pointer transition-colors hover:bg-primary/10 hover:!text-primary",
                    sortKey === String(column.key) && "bg-primary/10 !text-primary",
                    column.key === "seo" && "w-[70px]",
                    column.className,
                  )}
                  onClick={() => column.sortable !== false && handleSort(String(column.key))}
                  title={column.sortable !== false ? sortTitle(String(column.key)) : undefined}
                  aria-sort={
                    sortKey === String(column.key) ? (sortDirection === "asc" ? "ascending" : "descending") : undefined
                  }
                >
                  <div className="flex items-center">{column.header}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&>tr:nth-child(even)]:bg-muted/20">
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={cn("h-10", onRowClick && "cursor-pointer", rowClassName?.(item))}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={column.className}>
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] ?? "-")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
