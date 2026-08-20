export default function ReelWatchLoading() {
  // Matches the watch page frame: full-screen black with the 9:16 card centred, so the poster
  // fades into the same box it will settle in.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950">
      <div className="aspect-[9/16] h-full max-h-[94dvh] animate-pulse rounded-2xl bg-neutral-900" />
    </div>
  );
}
