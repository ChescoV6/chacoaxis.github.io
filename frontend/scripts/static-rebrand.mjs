// Identidade editorial v2 nas páginas geradas (catálogos, perfis, livros e institucionais).
// Aplicado no fim de cada CSS gerado: a serifa fica só nos títulos; números e micro-rótulos seguem em Sora.
export const STATIC_REBRAND_CSS = `
h1,.phero h1,.ihero h1,.chero h1{font-family:'Instrument Serif',Georgia,'Times New Roman',serif;font-weight:400;letter-spacing:-.015em}
h2,.cat h2,.empty h2,.cta h2,.block-t,.prose h2,.pcta h2{font-family:'Instrument Serif',Georgia,'Times New Roman',serif;font-weight:400;letter-spacing:-.02em}
.logo b{font-family:'Instrument Serif',Georgia,'Times New Roman',serif;font-weight:400;letter-spacing:-.01em}
.logo span{font-family:'Sora',system-ui,sans-serif;font-weight:600;font-size:.55em;letter-spacing:.32em;text-transform:uppercase;transform:translateY(-.1em)}
.btn{border-radius:9px;font-family:'Sora',system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase}
.ic a{border-radius:16px}
.cta{border-radius:20px}
`;
