// Same page, same skeleton: /page/n IS the homepage starting at chunk n.
// The homepage itself no longer has a loading.tsx (plan أ١, 2 Oct 2026): it is fully prerendered,
// and its route-level Suspense only made the first paint wait for the content to be swapped in
// behind the skeleton (PageSpeed: element render delay 1,705ms). /page/n keeps the skeleton.
export { default } from "../../components/home-skeleton/home-skeleton";
