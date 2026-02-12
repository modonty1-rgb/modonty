export function FooterCopyright({
  appVersion,
  year,
}: {
  appVersion: string;
  year: number;
}) {
  return (
    <>
      © {year}
      <span className="mx-1.5 text-xs text-muted-foreground/80">· v{appVersion}</span>
    </>
  );
}
