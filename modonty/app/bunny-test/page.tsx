import Image from "next/image";
import Link from "next/link";

import { PAIRS } from "./pairs";

// TEMP (branch version-2 only — Bunny migration visual comparison). Delete the whole route before merge.
export default function BunnyTestPage() {
  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
        Bunny vs Cloudinary — visual + LCP test
      </h1>
      <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>
        Same source assets on both CDNs, rendered through next/image. Isolated LCP pages:{" "}
        <Link href="/bunny-test/cloudinary" style={{ color: "#2563eb" }}>/cloudinary</Link>
        {" · "}
        <Link href="/bunny-test/bunny" style={{ color: "#2563eb" }}>/bunny</Link>
      </p>

      {PAIRS.map((p) => (
        <section key={p.id} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{p.label}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <figure style={{ margin: 0 }}>
              <figcaption style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Cloudinary</figcaption>
              <Image
                src={p.cloudinary}
                alt={`${p.label} — Cloudinary`}
                width={400}
                height={400}
                quality={75}
                sizes="(max-width: 640px) 50vw, 400px"
                style={{ width: "100%", height: "auto", border: "1px solid #eee" }}
              />
            </figure>
            <figure style={{ margin: 0 }}>
              <figcaption style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Bunny</figcaption>
              <Image
                src={p.bunny}
                alt={`${p.label} — Bunny`}
                width={400}
                height={400}
                quality={75}
                sizes="(max-width: 640px) 50vw, 400px"
                style={{ width: "100%", height: "auto", border: "1px solid #eee" }}
              />
            </figure>
          </div>
        </section>
      ))}
    </main>
  );
}
