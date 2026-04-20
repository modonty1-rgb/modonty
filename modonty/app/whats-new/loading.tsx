export default function WhatsNewLoading() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
      <div className="h-8 w-40 rounded-full bg-muted animate-pulse mb-6" />
      <div className="h-12 w-64 rounded-lg bg-muted animate-pulse mb-4" />
      <div className="h-4 w-80 rounded bg-muted animate-pulse" />
    </div>
  );
}
