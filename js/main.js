// Arranque a prueba de fallos:
// 1. Asegura GSAP. Viene dentro del repo (vendor/gsap); si por algo no cargó,
//    se prueba con jsDelivr y luego con cdnjs.
// 2. Recién ahí carga la página-ascensor (app.js).
// 3. Si algo falla, pasa a la versión simple (window.fixitModoSimple, en index.html)
//    en vez de dejar la pantalla de carga trabada.

const RESPALDOS = [
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/',
]
const PIEZAS = [
  ['gsap', 'gsap.min.js'],
  ['CustomEase', 'CustomEase.min.js'],
  ['SplitText', 'SplitText.min.js'],
]

function cargarScript(src) {
  return new Promise((listo, fallo) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = listo
    s.onerror = () => fallo(new Error(`No cargó ${src}`))
    document.head.appendChild(s)
  })
}

async function asegurarGsap() {
  for (const [global, archivo] of PIEZAS) {
    for (const base of RESPALDOS) {
      if (window[global]) break
      try { await cargarScript(base + archivo) } catch (e) { console.warn('FixIt:', e.message) }
    }
  }
  const falta = PIEZAS.filter(([global]) => !window[global]).map(([global]) => global)
  if (falta.length) throw new Error(`Faltan librerías: ${falta.join(', ')}`)
}

try {
  await asegurarGsap()
  await import('./app.js')
} catch (error) {
  console.error('FixIt:', error)
  window.fixitModoSimple?.('arranque')
}
