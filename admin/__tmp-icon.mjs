import { chromium } from '@playwright/test';
const d = 'C:/Users/w2nad/AppData/Local/Temp/claude/c--Users-w2nad-Desktop-dreamToApp-MODONTY/0cd87a3b-5bf8-4506-a67b-b54e8f6a4fb8/scratchpad/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 900, height: 260 } });
await p.goto('file:///' + d + 'reels.html');
await p.screenshot({ path: d + 'reels.png' });
await b.close();
