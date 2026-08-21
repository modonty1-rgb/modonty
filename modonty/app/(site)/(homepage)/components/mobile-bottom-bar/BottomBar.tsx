import { ServiceBar } from "./ServiceBar";

// The homepage service bar is links only, so it renders on the server without adding
// client JavaScript. Search now lives in the global TopNav where its DOM order matches
// its visual position and it remains available on every site route.
export function BottomBar() {
  return <ServiceBar />;
}
