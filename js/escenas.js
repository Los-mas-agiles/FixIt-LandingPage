// Vida propia de cada piso una vez construido.
// Las animaciones en bucle se registran con `bucle()` y solo corren mientras
// su piso está a la vista (ascensor.js llama a `activarBucles` al llegar).
import * as S from './sonido.js'
import { t } from './i18n.js'

const gsap = window.gsap
const NS = 'http://www.w3.org/2000/svg'

const bucles = new Map()   // piso → [animaciones]
function bucle(piso, anim) {
  if (!bucles.has(piso)) bucles.set(piso, [])
  bucles.get(piso).push(anim)
  if (piso.inert) anim.pause()
  return anim
}
export function activarBucles(actual) {
  bucles.forEach((lista, p) => lista.forEach((a) => (p === actual ? a.play() : a.pause())))
}
// Sonidos de las escenas: solo si el piso está a la vista
const oir = (piso, fn) => { if (!piso.inert) fn() }

export function alConstruir(piso, { estatico = false } = {}) {
  const escena = ESCENAS[piso.id]
  if (escena) escena(piso, estatico)
}

// Algunas piezas se generan aunque el piso no esté construido (para el modo estático)
export function prepararEscenas() {
  iconosHU(document.getElementById('piso-6'))
  maquetas(document.getElementById('piso-3'))
  relojPared(document.getElementById('lobby'))
}

const ESCENAS = {
  'piso-7': problema,
  'piso-6': solucion,
  'piso-5': funciona,
  'piso-4': roles,
  'piso-3': planes,
  'piso-2': nosotros,
  'piso-1': preguntas,
}

// ── Piso 7: el chat que entierra el reclamo + el reloj que avanza ──
// [día (0 = viernes … 3 = lunes), hora]
const RELOJ = [
  [0, '21:40'], [0, '22:55'], [1, '01:20'], [1, '07:45'], [1, '13:10'], [1, '19:30'],
  [2, '00:40'], [2, '09:15'], [2, '16:50'], [2, '23:05'], [3, '04:30'], [3, '08:00'],
]

function burbuja(m) {
  const el = document.createElement('div')
  el.className = 'msj' + (m.sticker ? ' sticker' : '') + (m.clave ? ' clave' : '')
  el.innerHTML = m.sticker ? m.sticker : `<small>${m.de}</small>${m.t}`
  return el
}

function problema(piso, estatico) {
  const chat = piso.querySelector('.tel-chat')
  const dia = piso.querySelector('.reloj-dia')
  const hora = piso.querySelector('.reloj-hora')
  const nota = piso.querySelector('.reloj-nota')
  let momento = 0
  const marcarHora = (k) => { momento = k; dia.textContent = t('reloj.dias')[RELOJ[k][0]]; hora.textContent = RELOJ[k][1] }

  let i = 0
  const semilla = (n = 4) => { chat.replaceChildren(); t('chat').slice(0, n).forEach((m) => chat.appendChild(burbuja(m))); i = n }
  document.addEventListener('idioma', () => { marcarHora(momento); semilla(estatico ? 8 : 4) })

  if (estatico) {
    semilla(8)
    marcarHora(RELOJ.length - 1)
    nota.style.opacity = 1
    return
  }

  // Reloj: del viernes por la noche al lunes por la mañana
  const tl = gsap.timeline({ delay: 0.5 })
  RELOJ.forEach((_, k) => tl.call(() => { marcarHora(k); oir(piso, S.clic) }, null, k * 0.22))
  tl.to(nota, { opacity: 1, duration: 0.5 }, '+=0.2')

  // Chat en bucle, solo mientras el piso está a la vista
  semilla()
  setInterval(() => {
    if (piso.inert) return
    const lista = t('chat')
    if (i >= lista.length) { if (i++ > lista.length + 2) semilla(); return }
    const el = burbuja(lista[i++])
    chat.appendChild(el)
    while (chat.children.length > 9) chat.firstElementChild.remove()
    gsap.from(el, { y: 18, autoAlpha: 0, scale: 0.9, duration: 0.35, ease: 'power3.out', transformOrigin: '0% 100%' })
    if (i % 3 === 0) S.vibrar()
  }, 1100)
}

// ── Piso 6: un ícono animado en cada historia de usuario ──
const ICONOS_HU = [
  // HU1 · cámara que dispara
  `<rect x="10" y="14" width="60" height="34" rx="9" fill="#BFE0F0" stroke="#2C2C2C" stroke-width="3"/>
   <rect x="22" y="7" width="18" height="10" rx="3" fill="#2C2C2C"/>
   <circle class="i-lente" cx="40" cy="31" r="10" fill="#FFFFFF" stroke="#2C2C2C" stroke-width="3"/><circle cx="40" cy="31" r="4" fill="#2C2C2C"/>
   <circle cx="61" cy="21" r="3.5" fill="#F5E6A3" stroke="#2C2C2C" stroke-width="2"/>
   <circle class="i-destello" cx="61" cy="21" r="16" fill="#FFF6D6" opacity="0"/>`,
  // HU2 · chip de IA que etiqueta
  `<rect x="4" y="9" width="34" height="34" rx="9" fill="#FFFFFF" stroke="#2C2C2C" stroke-width="3"/>
   <text x="21" y="32" text-anchor="middle" class="i-ia">IA</text>
   <rect class="i-tag" x="44" y="9" width="32" height="9" rx="3" fill="#C9B8E8" stroke="#2C2C2C" stroke-width="1.5"/>
   <rect class="i-tag" x="44" y="22" width="24" height="9" rx="3" fill="#2C2C2C"/>
   <rect class="i-tag" x="44" y="35" width="28" height="9" rx="3" fill="#B8E8D0" stroke="#2C2C2C" stroke-width="1.5"/>`,
  // HU3 · tarjeta que cruza el kanban
  `<g fill="#F4F4F4" stroke="#2C2C2C" stroke-width="1.5" stroke-opacity=".35"><rect x="3" y="4" width="23" height="44" rx="4"/><rect x="29" y="4" width="23" height="44" rx="4"/><rect x="55" y="4" width="23" height="44" rx="4"/></g>
   <rect x="3" y="4" width="23" height="7" rx="3" fill="#F2C4A8"/><rect x="29" y="4" width="23" height="7" rx="3" fill="#BFE0F0"/><rect x="55" y="4" width="23" height="7" rx="3" fill="#B8E8D0"/>
   <rect class="i-tarjeta" x="6" y="16" width="17" height="13" rx="3" fill="#FFFFFF" stroke="#2C2C2C" stroke-width="2"/>`,
  // HU4 · campana con aviso
  `<g class="i-campana"><path d="M27 38c0-15 5-24 13-24s13 9 13 24l4 4H23z" fill="#F5E6A3" stroke="#2C2C2C" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="45" r="4" fill="#2C2C2C"/></g>
   <g class="i-globo"><circle cx="56" cy="14" r="9" fill="#F2C4A8" stroke="#2C2C2C" stroke-width="2.5"/><text x="56" y="18" text-anchor="middle" class="i-num">1</text></g>`,
  // HU5 · barras que crecen
  `<path d="M8 6V46H76" fill="none" stroke="#2C2C2C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
   <rect class="i-barra" x="16" y="16" width="10" height="30" rx="2" fill="#BFE0F0" stroke="#2C2C2C" stroke-width="2"/>
   <rect class="i-barra" x="31" y="16" width="10" height="30" rx="2" fill="#F5E6A3" stroke="#2C2C2C" stroke-width="2"/>
   <rect class="i-barra" x="46" y="16" width="10" height="30" rx="2" fill="#B8E8D0" stroke="#2C2C2C" stroke-width="2"/>
   <rect class="i-barra" x="61" y="16" width="10" height="30" rx="2" fill="#F2C4A8" stroke="#2C2C2C" stroke-width="2"/>`,
  // HU6 · el foco pasa por cada rol
  `<circle cx="16" cy="24" r="10" fill="#BFE0F0" stroke="#2C2C2C" stroke-width="2.5"/>
   <circle cx="40" cy="24" r="10" fill="#F2C4A8" stroke="#2C2C2C" stroke-width="2.5"/>
   <circle cx="64" cy="24" r="10" fill="#C9B8E8" stroke="#2C2C2C" stroke-width="2.5"/>
   <circle class="i-anillo" cx="16" cy="24" r="15" fill="none" stroke="#2C2C2C" stroke-width="3" stroke-dasharray="6 4"/>
   <rect class="i-llave" x="10" y="40" width="12" height="7" rx="3" fill="#2C2C2C"/>`,
]

function iconosHU(piso) {
  piso.querySelectorAll('.herramientas > li').forEach((li, i) => {
    if (li.querySelector('.hu-anim')) return
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('viewBox', '0 0 80 52')
    svg.setAttribute('class', `hu-anim hu-${i + 1}`)
    svg.setAttribute('aria-hidden', 'true')
    svg.innerHTML = ICONOS_HU[i]
    li.prepend(svg)
  })
}

function solucion(piso, estatico) {
  if (estatico) return
  const q = (s) => piso.querySelector(s)
  const qa = (s) => piso.querySelectorAll(s)
  const t = (op) => bucle(piso, gsap.timeline({ repeat: -1, ...op }))

  t({ repeatDelay: 1.8 })
    .to('.hu-1 .i-lente', { scale: 0.8, svgOrigin: '40 31', duration: 0.12, yoyo: true, repeat: 1 })
    .fromTo('.hu-1 .i-destello', { opacity: 0.95, scale: 0.2, svgOrigin: '61 21' }, { opacity: 0, scale: 1.4, duration: 0.5, ease: 'power2.out' }, 0.1)

  gsap.set(qa('.hu-2 .i-tag'), { scaleX: 0, transformOrigin: '0% 50%' })
  t({ repeatDelay: 0.8 })
    .to(qa('.hu-2 .i-tag'), { scaleX: 1, duration: 0.3, ease: 'back.out(2)', stagger: 0.35 })
    .to(qa('.hu-2 .i-tag'), { scaleX: 0, duration: 0.2, stagger: 0.05 }, '+=1.4')

  t({ repeatDelay: 0.6 })
    .to('.hu-3 .i-tarjeta', { x: 26, duration: 0.45, ease: 'power2.inOut' }, 0.6)
    .to('.hu-3 .i-tarjeta', { x: 52, duration: 0.45, ease: 'power2.inOut' }, 1.8)
    .to('.hu-3 .i-tarjeta', { opacity: 0, duration: 0.2 }, 3)
    .set('.hu-3 .i-tarjeta', { x: 0 })
    .to('.hu-3 .i-tarjeta', { opacity: 1, duration: 0.2 })

  t({ repeatDelay: 1.4 })
    .to('.hu-4 .i-campana', { keyframes: { rotation: [14, -12, 9, -6, 3, 0] }, svgOrigin: '40 12', duration: 0.8, ease: 'none' })
    .fromTo('.hu-4 .i-globo', { scale: 0 }, { scale: 1, svgOrigin: '56 14', duration: 0.35, ease: 'back.out(3)' }, 0.1)
    .to('.hu-4 .i-globo', { scale: 0, svgOrigin: '56 14', duration: 0.2 }, 2)

  const barras = qa('.hu-5 .i-barra')
  gsap.set(barras, { transformOrigin: '50% 100%' })
  bucle(piso, gsap.to(barras, {
    scaleY: () => gsap.utils.random(0.2, 1), duration: 0.6, ease: 'power2.inOut', stagger: 0.08,
    repeat: -1, repeatRefresh: true, repeatDelay: 0.5,
  }))

  t({ repeatDelay: 0.4 })
    .to('.hu-6 .i-anillo, .hu-6 .i-llave', { x: 24, duration: 0.35, ease: 'power2.inOut' }, 0.8)
    .to('.hu-6 .i-anillo, .hu-6 .i-llave', { x: 48, duration: 0.35, ease: 'power2.inOut' }, 1.8)
    .to('.hu-6 .i-anillo, .hu-6 .i-llave', { x: 0, duration: 0.5, ease: 'power2.inOut' }, 2.8)
  bucle(piso, gsap.to('.hu-6 .i-anillo', { rotation: 360, svgOrigin: '16 24', duration: 6, ease: 'none', repeat: -1 }))
}

// ── Piso 5: contadores + la pizarra con el proceso completo en bucle ──
function funciona(piso, estatico) {
  piso.querySelectorAll('[data-contar]').forEach((el) => {
    const fin = +el.dataset.contar
    const pre = el.dataset.prefijo || ''
    if (estatico) { el.textContent = pre + fin; return }
    const o = { v: 0 }
    gsap.to(o, { v: fin, duration: 1.3, ease: 'power2.out', onUpdate: () => { el.textContent = pre + Math.round(o.v) } })
  })

  const q = (s) => piso.querySelector(s)
  const tarjeta = q('#pz-tarjeta')
  const tags = [q('#pz-tag1'), q('#pz-tag2')]
  const ok = q('#pz-ok')
  const aviso = q('#pz-aviso')
  const pasos = [...piso.querySelectorAll('.pasos > li')]
  const paso = (i) => pasos.forEach((p, j) => p.classList.toggle('activo', j === i))

  if (estatico) {   // foto fija: la incidencia ya resuelta y avisada
    gsap.set(tarjeta, { x: 506, y: 68, scale: 1, opacity: 1 })
    gsap.set(aviso, { y: 0 })
    return
  }

  gsap.set(tags, { scale: 0, transformOrigin: '0% 50%' })
  gsap.set(ok, { scale: 0, transformOrigin: '50% 50%' })
  gsap.set(tarjeta, { x: 40, y: 222, scale: 0.3, opacity: 0 })
  gsap.set(aviso, { y: -36 })

  const tl = bucle(piso, gsap.timeline({ repeat: -1, repeatDelay: 0.6, defaults: { ease: 'power2.inOut' } }))
  // 1 · Reporta: la gota cae, el residente saca la foto y nace la tarjeta
  tl.call(() => paso(0), null, 0)
    .fromTo('#pz-gota', { y: 0, opacity: 1 }, { y: 58, opacity: 0, duration: 0.8, ease: 'power2.in' }, 0.1)
    .fromTo('#pz-flash', { opacity: 0.95, scale: 0.2, svgOrigin: '70 238' }, { opacity: 0, scale: 1.5, duration: 0.5, ease: 'power2.out' }, 0.9)
    .call(() => oir(piso, S.interruptor), null, 0.9)
    .to(tarjeta, { opacity: 1, scale: 1, x: 112, y: 196, duration: 0.6, ease: 'back.out(1.7)' }, 1.0)
  // 2 · Clasifica: entra al chip de IA, se escanea y sale con sus etiquetas
    .call(() => paso(1), null, 2.1)
    .to(tarjeta, { x: 177, y: 190, scale: 0.7, duration: 0.6 }, 2.1)
    .fromTo('#pz-scan', { y: 0 }, { y: 51, duration: 0.32, repeat: 3, yoyo: true, ease: 'none' }, 2.7)
    .fromTo('#pz-chispas path', { scale: 0, opacity: 1, transformOrigin: '50% 50%' }, { scale: 1.2, opacity: 0, duration: 0.6, stagger: 0.12 }, 2.9)
    .to(tarjeta, { x: 262, y: 196, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, 4.0)
    .to(tags, { scale: 1, duration: 0.3, stagger: 0.14, ease: 'back.out(3)' }, 4.35)
  // 3 · Atiende: pendiente → en proceso (la llave trabaja) → resuelta
    .call(() => paso(2), null, 5.1)
    .to(tarjeta, { x: 302, y: 68, rotation: -4, duration: 0.65 }, 5.1)
    .to(tarjeta, { rotation: 0, duration: 0.2 }, 5.75)
    .to(tarjeta, { x: 404, duration: 0.55 }, 6.3)
    .to('#pz-llave', { opacity: 1, duration: 0.2 }, 6.7)
    .fromTo('#pz-llave', { rotation: -25, svgOrigin: '475 119' }, { rotation: 25, duration: 0.22, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 6.7)
    .to('#pz-llave', { opacity: 0, duration: 0.2 }, 7.7)
    .to(tarjeta, { x: 506, duration: 0.55 }, 7.8)
    .to(ok, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 8.35)
  // 4 · Avisa: la notificación llega al celular del residente
    .call(() => paso(3), null, 8.7)
    .to(aviso, { y: 0, duration: 0.45, ease: 'back.out(1.8)' }, 8.8)
    .call(() => oir(piso, S.vibrar), null, 8.8)
    .fromTo('#pz-tel', { rotation: 0 }, { keyframes: { rotation: [-4, 4, -3, 3, 0] }, svgOrigin: '70 298', duration: 0.5, ease: 'none' }, 8.8)
  // Reinicio
    .to([tarjeta, aviso], { opacity: 0, duration: 0.4 }, 10.6)
    .call(() => paso(-1), null, 10.8)
    .set(tarjeta, { x: 40, y: 222, scale: 0.3 }, 11)
    .set(tags, { scale: 0 }, 11)
    .set(ok, { scale: 0 }, 11)
    .set(aviso, { y: -36, opacity: 1 }, 11)
}

// ── Piso 4: cada rol hace lo suyo ──
function roles(piso, estatico) {
  if (estatico) return
  const q = (s) => piso.querySelector(s)
  const figuras = piso.querySelectorAll('.rol-figura')
  bucle(piso, gsap.to(figuras, { y: -5, duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.35 }))
  piso.querySelectorAll('.rol').forEach((rol) => {
    const f = rol.querySelector('.rol-figura')
    rol.addEventListener('pointerenter', () => {
      gsap.fromTo(f, { rotation: 0 }, { keyframes: { rotation: [-6, 6, -3, 0] }, duration: 0.6, ease: 'none', transformOrigin: '50% 100%' })
      S.pop()
    })
  })

  // Residente: saca la foto, el reporte sale volando y luego llega el ✓
  gsap.set([q('.rf-globo'), q('.rf-check')], { opacity: 0 })
  bucle(piso, gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
    .to('.rf-pantalla', { fill: '#FFFFFF', duration: 0.08, yoyo: true, repeat: 1 }, 0.4)
    .fromTo('.rf-globo', { opacity: 1, scale: 0.2, x: 30, y: 40, svgOrigin: '-14 64' }, { scale: 1, x: 0, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, 0.5)
    .to('.rf-globo', { y: -40, opacity: 0, duration: 0.6, ease: 'power2.in' }, 1.6)
    .fromTo('.rf-check', { opacity: 1, scale: 0, svgOrigin: '-8 62' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 3.2)
    .to('.rf-check', { opacity: 0, duration: 0.3 }, 4.6))

  // Mantenimiento: ajusta con la llave y saltan chispas
  gsap.set(q('.rf-chispas'), { opacity: 0 })
  bucle(piso, gsap.timeline({ repeat: -1, repeatDelay: 1 })
    .fromTo('.rf-llave', { rotation: -20, svgOrigin: '82 118' }, { rotation: 22, duration: 0.2, repeat: 5, yoyo: true, ease: 'sine.inOut' })
    .to('.rf-chispas', { opacity: 1, duration: 0.05, repeat: 5, yoyo: true, ease: 'steps(1)' }, 0.2))

  // Administración: las barras del reporte cambian
  gsap.set(piso.querySelectorAll('.rf-barra'), { transformOrigin: '50% 100%' })
  bucle(piso, gsap.to('.rf-barra', {
    scaleY: () => gsap.utils.random(0.25, 1), duration: 0.5, ease: 'power2.inOut', stagger: 0.1,
    repeat: -1, repeatRefresh: true, repeatDelay: 0.8,
  }))
}

// ── Piso 3: maquetas cuyas ventanas se prenden y apagan ──
const TORRES = [
  [{ x: 34, w: 52, pisos: 4, c: '#BFE0F0' }],
  [{ x: 20, w: 48, pisos: 7, c: '#F5E6A3' }, { x: 68, w: 34, pisos: 4, c: '#F2C4A8' }],
  [{ x: 6, w: 36, pisos: 6, c: '#C9B8E8' }, { x: 42, w: 38, pisos: 8, c: '#BFE0F0' }, { x: 80, w: 34, pisos: 5, c: '#B8E8D0' }],
]
function maquetas(piso) {
  piso.querySelectorAll('.plan-maqueta').forEach((svg, i) => {
    let html = '<rect x="4" y="130" width="112" height="14" rx="6" fill="#FFFFFF" stroke="#2C2C2C" stroke-width="3"/>'
    TORRES[i].forEach((t) => {
      const alto = t.pisos * 13 + 8
      const y = 130 - alto
      html += `<rect x="${t.x}" y="${y}" width="${t.w}" height="${alto}" rx="6" fill="${t.c}" stroke="#2C2C2C" stroke-width="3"/>`
      html += `<rect x="${t.x + t.w / 2 - 6}" y="${y - 6}" width="12" height="7" rx="2.5" fill="${t.c}" stroke="#2C2C2C" stroke-width="2.5"/>`
      const cols = Math.floor((t.w - 8) / 12)
      const margen = (t.w - cols * 12 + 4) / 2
      for (let p = 0; p < t.pisos; p++) {
        for (let c = 0; c < cols; c++) {
          html += `<rect class="mq-v" x="${(t.x + margen + c * 12).toFixed(1)}" y="${y + 7 + p * 13}" width="7" height="8" rx="1.5" fill="#FFFFFF" stroke="#2C2C2C" stroke-width="1.5"/>`
        }
      }
    })
    svg.setAttribute('viewBox', '0 0 120 150')
    svg.innerHTML = html
  })
}

function planes(piso, estatico) {
  if (estatico) return
  piso.querySelectorAll('.plan').forEach((plan) => {
    const ventanas = [...plan.querySelectorAll('.mq-v')]
    ventanas.forEach((v) => { if (Math.random() > 0.6) v.setAttribute('fill', '#F5E6A3') })
    // Cada tanto se prende o apaga una ventana
    bucle(piso, gsap.timeline({ repeat: -1 }).call(() => {
      const v = ventanas[Math.floor(Math.random() * ventanas.length)]
      v.setAttribute('fill', v.getAttribute('fill') === '#FFFFFF' ? '#F5E6A3' : '#FFFFFF')
    }, null, 0.35))

    gsap.set(plan, { transformPerspective: 700 })
    const base = plan.classList.contains('destacado') ? -14 : 0
    plan.addEventListener('pointermove', (e) => {
      const r = plan.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      gsap.to(plan, { rotationY: x * 14, rotationX: -y * 12, y: base - 6, duration: 0.4, ease: 'power2.out' })
    })
    plan.addEventListener('pointerleave', () => gsap.to(plan, { rotationY: 0, rotationX: 0, y: base, duration: 0.6, ease: 'power3.out' }))
    // Al pasar el mouse, se prende todo el edificio
    plan.addEventListener('pointerenter', () => {
      S.pop()
      gsap.to(ventanas, { attr: { fill: '#F5E6A3' }, duration: 0.01, stagger: { each: 0.015, from: 'end' } })
    })
  })
}

// ── Piso 2: el equipo saluda y el tablero ágil avanza ──
const NOTA = (col, fila) => ({ x: col * 100 + 30, y: 38 + fila * 42 })
function nosotros(piso, estatico) {
  const notas = [...piso.querySelectorAll('.ta-nota')]
  const inicial = notas.map((n) => [+n.dataset.col, +n.dataset.fila])
  notas.forEach((n, i) => gsap.set(n, NOTA(...inicial[i])))
  if (estatico) return

  piso.querySelectorAll('.miembro').forEach((m) => {
    const f = m.querySelector('.miembro-figura')
    m.addEventListener('pointerenter', () => {
      gsap.fromTo(f, { y: 0 }, { y: -14, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 })
      S.pop()
    })
  })

  // Un mini sprint: las notas avanzan de columna y al final empieza otro sprint
  const mover = (i, col, fila, t, tl) => {
    tl.to(notas[i], { scale: 1.12, rotation: -6, transformOrigin: '50% 50%', duration: 0.15 }, t)
      .to(notas[i], { ...NOTA(col, fila), duration: 0.6, ease: 'power2.inOut' }, t + 0.1)
      .to(notas[i], { scale: 1, rotation: 0, duration: 0.2 }, t + 0.7)
      .call(() => oir(piso, S.pop), null, t + 0.7)
  }
  const tl = bucle(piso, gsap.timeline({ repeat: -1, repeatDelay: 0.5 }))
  mover(2, 2, 2, 1, tl)      // HACIENDO → HECHO
  mover(0, 1, 0, 2.6, tl)    // POR HACER → HACIENDO
  mover(1, 0, 0, 3.6, tl)    // sube en POR HACER
  mover(1, 1, 1, 5, tl)      // POR HACER → HACIENDO
  tl.to(notas, { opacity: 0, duration: 0.3 }, 7)
    .call(() => notas.forEach((n, i) => gsap.set(n, NOTA(...inicial[i]))), null, 7.4)
    .to(notas, { opacity: 1, duration: 0.3, stagger: 0.06 }, 7.5)
}

// ── Piso 1: llega una carta a los casilleros ──
function preguntas(piso, estatico) {
  piso.querySelectorAll('.faq details').forEach((d) => d.addEventListener('toggle', () => {
    if (!d.open) return
    S.pop()
    if (!estatico) gsap.from(d.querySelector('p'), { y: -8, opacity: 0, duration: 0.35, ease: 'power2.out' })
  }))
  if (estatico) return
  gsap.set('.aviso-buzon', { scale: 0, transformOrigin: '50% 50%' })
  bucle(piso, gsap.timeline({ repeat: -1, repeatDelay: 1.5 })
    .fromTo('.sobre', { x: 200, y: 110, rotation: 18, scale: 1, opacity: 1 }, { x: 0, y: 0, rotation: 6, duration: 1.1, ease: 'power2.out' })
    .to('.sobre', { y: -150, x: 10, scale: 0.35, rotation: 0, duration: 0.5, ease: 'power2.in' }, 1.3)
    .to('.sobre', { opacity: 0, duration: 0.1 }, 1.75)
    .call(() => oir(piso, S.pop), null, 1.8)
    .to('.aviso-buzon', { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 1.8)
    .to('.aviso-buzon', { scale: 0, duration: 0.25 }, 3.4))
}

// ── Planta baja: reloj de pared con la hora real ──
function relojPared(piso) {
  const mano = (sel) => piso.querySelector(sel)
  const [h, m, s] = [mano('.rp-h'), mano('.rp-m'), mano('.rp-s')]
  const girar = (el, grados) => el.setAttribute('transform', `rotate(${grados} 40 40)`)
  const tic = () => {
    const d = new Date()
    girar(h, (d.getHours() % 12 + d.getMinutes() / 60) * 30)
    girar(m, (d.getMinutes() + d.getSeconds() / 60) * 6)
    girar(s, d.getSeconds() * 6)
  }
  tic()
  setInterval(tic, 1000)
}
