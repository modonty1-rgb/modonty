# Local Lighthouse CI (modonty)

## Run Tests

**Terminal 1:** Build and start local production server
```bash
pnpm --filter @modonty/modonty build
pnpm --filter @modonty/modonty start
```
Serves `http://localhost:3000`.

**Terminal 2:** Run Lighthouse CI
```bash
npx lhci autorun --collect.numberOfRuns=5 --upload.target=temporary-public-storage
```

## Review Results

- Check median **Performance** score and key metrics (LCP, FCP, TBT)
- Open printed report URL(s) in browser for full details
- Use results to compare future runs
