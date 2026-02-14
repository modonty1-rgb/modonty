### Local Lighthouse CI (modonty)

1. **Build and start local production server**
   ```bash
   pnpm --filter @modonty/modonty build
   pnpm --filter @modonty/modonty start
   ```
   Keep this terminal running (serves `http://localhost:3000`).

2. **Run Lighthouse CI against localhost**
   In a second terminal at the repo root:
   ```bash
   npx lhci autorun --collect.numberOfRuns=5 --upload.target=temporary-public-storage
   ```

3. **Read results**
   - Check the median **Performance** score and key metrics (LCP, FCP, TBT).
   - Open the printed report URL(s) in your browser for full details and to compare future runs.

