import { IconEmail, IconPhone, IconMapPin } from "@/lib/icons";

/**
 * بنية المؤسسة على هذه الصفحة تعلن البريد والهاتف والعنوان لجوجل، وجوجل تنصّ صراحةً:
 * «Don't mark up content that is not visible to readers of the page» (سياسات البيانات
 * المنظَّمة). فكانت الثلاثة تُبثّ ولا يراها زائر — هذه الكتلة تجعل ما يقرأه الروبوت
 * هو نفسه ما يقرأه الإنسان، وتعطي الزائر طريقاً للتواصل غير النموذج.
 * الحقل الفارغ لا يرسم صفّاً — لا لافتة بلا قيمة بعدها.
 */
interface ContactDetailsProps {
  email: string | null;
  telephone: string | null;
  address: string | null;
}

export function ContactDetails({ email, telephone, address }: ContactDetailsProps) {
  if (!email && !telephone && !address) return null;

  return (
    <ul className="mb-8 grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-2">
      {email && (
        <li className="flex items-center gap-2">
          <IconEmail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <a href={`mailto:${email}`} dir="ltr" className="hover:text-primary">
            {email}
          </a>
        </li>
      )}
      {telephone && (
        <li className="flex items-center gap-2">
          <IconPhone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <a href={`tel:${telephone}`} dir="ltr" className="hover:text-primary">
            {telephone}
          </a>
        </li>
      )}
      {address && (
        <li className="flex items-start gap-2 sm:col-span-2">
          <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="text-muted-foreground">{address}</span>
        </li>
      )}
    </ul>
  );
}
