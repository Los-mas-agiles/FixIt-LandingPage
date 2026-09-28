// Motor de obra: construye un piso en vivo en ~1,5 s.
// Etapas: ladrillo → tarrajeo (cemento) → pintura → acabados + contenido → luz.
import * as S from './sonido.js'

const gsap = window.gsap
const TONOS_LADRILLO = ['#E7A987', '#EDB594', '#DE9C7A', '#F0BD9E', '#E3A382']
const ANCHO = 66
const ALTO = 30

const SVG_LLANA = `<svg viewBox="0 0 120 70" width="96"><path d="M8 40h104l-8 22H16z" fill="#D8D2C4" stroke="#2C2C2C" stroke-width="4" stroke-linejoin="round"/><rect x="50" y="8" width="20" height="32" rx="6" fill="#F2C4A8" stroke="#2C2C2C" stroke-width="4"/></svg>`
const SVG_RODILLO = `<svg viewBox="0 0 80 240" width="64"><rect x="10" y="4" width="60" height="100" rx="18" style="fill:var(--pared)" stroke="#2C2C2C" stroke-width="5"/><path d="M40 104v40h26v70" fill="none" stroke="#2C2C2C" stroke-width="7" stroke-linejoin="round"/><rect x="56" y="196" width="20" height="40" rx="6" fill="#F5E6A3" stroke="#2C2C2C" stroke-width="4"/></svg>`

function crearLadrillos(muro) {
  const w = muro.clientWidth
  const h = muro.clientHeight
  const filas = Math.ceil(h / ALTO) + 1
  const cols = Math.ceil(w / ANCHO) + 1
  const frag = document.createDocumentFragment()
  const lista = []
  for (let f = 0; f < filas; f++) {
    const desfase = f % 2 ? -ANCHO / 2 : 0
    for (let c = 0; c < cols; c++) {
      const b = document.createElement('i')
      b.className = 'ladrillo'
      b.style.cssText = `left:${c * ANCHO + desfase}px;top:${h - (f + 1) * ALTO}px;width:${ANCHO - 4}px;--lc:${TONOS_LADRILLO[(f * 7 + c * 3) % TONOS_LADRILLO.length]}`
      frag.appendChild(b)
      lista.push(b)
    }
  }
  muro.appendChild(frag)
  return { lista, filas, cols }
}

function herramienta(sala, svg) {
  const el = document.createElement('div')
  el.className = 'herramienta'
  el.innerHTML = svg
  sala.appendChild(el)
  return el
}

// Elementos del contenido que entran en cascada
function piezasContenido(contenido) {
  return contenido.querySelectorAll(
    '.tag.dark, .t-piso, .lede, .dolores > li, .herramientas > li, .pasos > li, .metas-titulo, .meta, ' +
    '.roles-lista .block, .rol-figura, .plan, .planes-incluye, .miembro, .faq > details, ' +
    '.contacto-cta, .pie, .formulario, .reloj, .telefono'
  )
}

/**
 * Construye el piso. Devuelve { terminar } para completarlo al instante
 * (por ejemplo, si el visitante sigue bajando antes de que termine).
 */
export function construir(piso, alTerminar) {
  const sala = piso.querySelector('.sala')
  const muro = sala.querySelector('.muro')
  const tarrajeo = sala.querySelector('.tarrajeo')
  const pintura = sala.querySelector('.pintura')
  const acabados = sala.querySelectorAll('.acabados .ac')
  const contenido = sala.querySelector('.contenido')
  const piezas = piezasContenido(contenido)
  const deNoche = parseFloat(piso.dataset.noche || 0) > 0.1

  const { lista, filas, cols } = crearLadrillos(muro)
  const llana = herramienta(sala, SVG_LLANA)
  const rodillo = herramienta(sala, SVG_RODILLO)
  const h = sala.clientHeight
  const w = sala.clientWidth

  piso.classList.add('construyendo')
  if (deNoche) piso.classList.add('apagado')
  gsap.set(contenido, { visibility: 'visible' })
  gsap.set(piezas, { autoAlpha: 0, y: 26 })
  gsap.set(acabados, { opacity: 0 })
  gsap.set(llana, { left: w * 0.42, top: h, autoAlpha: 0 })
  gsap.set(rodillo, { left: -60, top: h * 0.18, autoAlpha: 0 })

  let hecho = false
  const tl = gsap.timeline({ onComplete: () => terminar(false) })

  // 1 · Ladrillo (0 → 0,55 s): de abajo hacia arriba, desde el centro
  tl.from(lista, {
    y: -46, autoAlpha: 0, scale: 0.7, duration: 0.2, ease: 'power3.out',
    stagger: { grid: [filas, cols], from: [0.5, 0], amount: 0.42 },
  }, 0)
  for (let i = 0; i < 11; i++) tl.call(() => S.ladrillo(), null, i * 0.05)
  tl.call(() => S.martillo(), null, 0.18)
  tl.call(() => S.martillo(), null, 0.4)

  // 2 · Tarrajeo (0,5 → 0,84 s): la llana sube y el cemento cubre el muro
  tl.to(llana, { autoAlpha: 1, duration: 0.05 }, 0.5)
  tl.fromTo(llana, { top: h - 20 }, { top: -40, duration: 0.34, ease: 'power1.inOut' }, 0.5)
  tl.fromTo(tarrajeo, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.34, ease: 'power1.inOut' }, 0.5)
  tl.to(llana, { autoAlpha: 0, duration: 0.06 }, 0.82)
  tl.call(() => S.llana(0, 0.3), null, 0.5)

  // 3 · Pintura (0,8 → 1,12 s): el rodillo cruza de izquierda a derecha
  tl.to(rodillo, { autoAlpha: 1, duration: 0.05 }, 0.8)
  tl.fromTo(rodillo, { left: -60 }, { left: w + 10, duration: 0.32, ease: 'power1.inOut' }, 0.8)
  tl.fromTo(pintura, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.32, ease: 'power1.inOut' }, 0.8)
  tl.to(rodillo, { autoAlpha: 0, duration: 0.06 }, 1.1)
  tl.call(() => S.rodillo(0, 0.3), null, 0.8)

  // 4 · Acabados (1,05 → 1,45 s): muebles, lámparas y ventanas
  tl.fromTo(acabados, { opacity: 0, y: -24, scale: 0.8 }, {
    opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'back.out(2)', stagger: 0.05,
  }, 1.05)
  tl.call(() => S.taladro(0, 0.2), null, 1.02)
  acabados.forEach((_, i) => tl.call(() => S.pop(), null, 1.08 + i * 0.05))
  const lamparas = sala.querySelectorAll('.acabados .lampara')
  if (lamparas.length) tl.fromTo(lamparas, { rotation: 7 }, { rotation: 0, duration: 1.2, ease: 'elastic.out(1.2, 0.3)' }, 1.1)

  // Contenido en cascada, en paralelo desde la pintura
  tl.to(piezas, { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power3.out', stagger: { amount: 0.5 } }, 0.72)

  // 5 · Luz (1,28 s): de noche, se prende la lámpara
  if (deNoche) {
    tl.call(() => { piso.classList.remove('apagado'); S.interruptor() }, null, 1.28)
  }
  tl.call(() => S.brillo(), null, 1.42)

  function terminar(saltar) {
    if (hecho) return
    hecho = true
    if (saltar) tl.progress(1, true)
    tl.kill()
    muro.replaceChildren()
    llana.remove()
    rodillo.remove()
    piso.classList.remove('construyendo', 'apagado')
    piso.classList.add('construido')
    gsap.set([tarrajeo, pintura, contenido], { clearProps: 'clipPath,visibility' })
    gsap.set(piezas, { clearProps: 'opacity,visibility,transform' })
    gsap.set(acabados, { clearProps: 'opacity,transform' })
    alTerminar?.(piso)
  }

  return { terminar: () => terminar(true) }
}
