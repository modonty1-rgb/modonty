import { DiscoveryBar } from "./DiscoveryBar";
import { ServiceBar } from "./ServiceBar";

// The homepage's two mobile bars. Both are links only, so both render on the server
// and the homepage ships no JavaScript for either.
export function BottomBar() {
  return (
    <>
      <DiscoveryBar />
      <ServiceBar />
    </>
  );
}
