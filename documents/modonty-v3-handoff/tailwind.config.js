/** Tokens from DESIGN_SYSTEM_V3.md §2 — copy into the real project's tailwind config */
module.exports = {
  content: ['./modonty-home.html'],
  theme: { extend: {
    colors: {
      bg:'hsl(222 47% 7%)', surface:'hsl(222 40% 11%)', surface2:'hsl(222 36% 15%)',
      line:'hsl(222 25% 22%)', ink:'hsl(210 40% 98%)', muted:'hsl(215 20% 70%)',
      primary:'hsl(240 100% 65%)', primary2:'hsl(240 100% 74%)',
      featured:'hsl(240 60% 16%)', whatsapp:'hsl(142 70% 45%)',
    },
    fontFamily: { sans:['Tajawal','system-ui','sans-serif'] },
    borderRadius: { card:'8px', chip:'20px' },
  } },
}
