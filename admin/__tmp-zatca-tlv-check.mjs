// Checks our TLV builder against the ZATCA guideline's worked example (§6.2), tags 1–5.
// Guideline hex for tags 1–5:  01 17 "Ahmed Mohamed AL Ahmady" 02 0f "301121971500003" 03 14 "2022-03-13T14:40:40Z" 04 07 "1108.90" 05 05 "144.9"
const enc = (tag, v) => { const b = Buffer.from(v, 'utf8'); return Buffer.concat([Buffer.from([tag, b.length]), b]); };
const ours = Buffer.concat([enc(1, 'Ahmed Mohamed AL Ahmady'), enc(2, '301121971500003'), enc(3, '2022-03-13T14:40:40Z'), enc(4, '1108.90'), enc(5, '144.9')]);
const expectedHexPrefix = '01 17 41 68 6d 65 64 20 4d 6f 68 61 6d 65 64 20 41 4c 20 41 68 6d 61 64 79 02 0f 33 30 31 31 32 31 39 37 31 35 30 30 30 30 33 03 14 32 30 32 32 2d 30 33 2d 31 33 54 31 34 3a 34 30 3a 34 30 5a 04 07 31 31 30 38 2e 39 30 05 05 31 34 34 2e 39'.replace(/\s+/g, '');
console.log('hex match guideline:', ours.toString('hex') === expectedHexPrefix);
const guidelineB64Prefix = 'ARdBaG1lZCBNb2hhbWVkIEFMIEFobWFkeQIPMzAxMTIxOTcxNTAwMDAzAxQyMDIyLTAzLTEzVDE0OjQwOjQwWgQHMTEwOC45MAUFMTQ0Ljk';
console.log('base64 prefix match guideline:', ours.toString('base64').startsWith(guidelineB64Prefix.slice(0, 100)));
console.log('ours base64:', ours.toString('base64'));
