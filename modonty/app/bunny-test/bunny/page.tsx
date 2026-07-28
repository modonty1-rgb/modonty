import Image from "next/image";

import { LCP_PAIR } from "../pairs";

// TEMP (branch version-2 only). Isolated LCP measurement — Bunny source via next/image.
export default function BunnyLcpPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 18, marginBottom: 16 }}>LCP — Bunny</h1>
      <Image
        src={LCP_PAIR.bunny}
        alt={LCP_PAIR.label}
        width={1200}
        height={1200}
        priority
        quality={75}
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
      />
    </main>
  );
}
