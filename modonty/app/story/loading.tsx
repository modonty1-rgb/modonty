export default function StoryLoading() {
  return (
    <div className="min-h-[80vh] bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl space-y-6">
        <div className="h-8 w-2/3 mx-auto rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-1/2 mx-auto rounded-md bg-muted/70 animate-pulse" />
        <div className="rounded-2xl border border-border bg-card shadow-sm h-[60vh] animate-pulse mt-8" />
      </div>
    </div>
  );
}
