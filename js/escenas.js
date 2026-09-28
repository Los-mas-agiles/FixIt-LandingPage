// Vida propia de cada piso una vez construido.
import * as S from './sonido.js'

const gsap = window.gsap

export function alConstruir(piso, { estatico = false } = {}) {
  const escena = ESCENAS[piso.id]
  if (escena) escena(piso, estatico)
}

const ESCENAS = {
  'piso-7': problema,
  'piso-5': funciona,
  'piso-4': roles,
  'piso-3': planes,
  'piso-2': nosotros,
}

// ── Piso 7: el chat que entierra el reclamo + el reloj que avanza ──
const CHAT = [
  { de: 'Sra. Rosa · 701', t: 'Buenos días vecinos 🌞' },
  { sticker: '🌻' },
  { de: 'Dpto 302', t: '¿Alguien sabe a qué hora pasa el camión?' },
  { de: 'Dpto 504', t: 'Se malogró el ascensor 😩 ¿alguien avisó?', clave: true },
  { de: 'Dpto 101', t: 'Jajaja 😂' },
  { de: 'Sra. Rosa · 701', t: '¡Feliz cumple, Don Julio! 🎂' },
  { de: 'Dpto 203', t: '¡Feliz cumple! 🎉' },
  { de: 'Dpto 702', t: 'Feliz cumpleaños 🥳🥳' },
  { sticker: '🎂' },
  { de: 'Dpto 401', t: '¿De quién es la bici del pasillo?' },
  { de: 'Dpto 302', t: 'Buenas noches 🌙' },
  { sticker: '😴' },
]
const RELOJ = [
  ['VIE', '21:40'], ['VIE', '22:55'], ['SÁB', '01:20'], ['SÁB', '07:45'], ['SÁB', '13:10'], ['SÁB', '19:30'],
  ['DOM', '00:40'], ['DOM', '09:15'], ['DOM', '16:50'], ['DOM', '23:05'], ['LUN', '04:30'], ['LUN', '08:00'],
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

  if (estatico) {
    CHAT.slice(0, 8).forEach((m) => chat.appendChild(burbuja(m)))
    ;[dia.textContent, hora.textContent] = RELOJ.at(-1)
    nota.style.opacity = 1
    return
  }

  // Reloj: del viernes por la noche al lunes por la mañana
  const tl = gsap.timeline({ delay: 0.5 })
  RELOJ.forEach(([d, hh], i) => tl.call(() => { dia.textContent = d; hora.textContent = hh; if (!piso.inert) S.clic() }, null, i * 0.22))
  tl.to(nota, { opacity: 1, duration: 0.5 }, '+=0.2')

  // Chat en bucle, solo mientras el piso está a la vista
  let i = 0
  const semilla = () => { chat.replaceChildren(); CHAT.slice(0, 4).forEach((m) => chat.appendChild(burbuja(m))); i = 4 }
  semilla()
  setInterval(() => {
    if (piso.inert) return
    if (i >= CHAT.length) { if (i++ > CHAT.length + 2) semilla(); return }
    const m = CHAT[i++]
    const el = burbuja(m)
    chat.appendChild(el)
    while (chat.children.length > 9) chat.firstElementChild.remove()
    gsap.from(el, { y: 18, autoAlpha: 0, scale: 0.9, duration: 0.35, ease: 'power3.out', transformOrigin: '0% 100%' })
    if (i % 3 === 0) S.vibrar()
  }, 1100)
}

// ── Piso 5: contadores de las metas ──
function funciona(piso, estatico) {
  piso.querySelectorAll('[data-contar]').forEach((el) => {
    const fin = +el.dataset.contar
    const pre = el.dataset.prefijo || ''
    if (estatico) { el.textContent = pre + fin; return }
    const o = { v: 0 }
    gsap.to(o, { v: fin, duration: 1.3, ease: 'power2.out', onUpdate: () => { el.textContent = pre + Math.round(o.v) } })
  })
}

// ── Piso 4: las figuras respiran y saludan al pasar el mouse ──
function roles(piso, estatico) {
  if (estatico) return
  const figuras = piso.querySelectorAll('.rol-figura')
  gsap.to(figuras, { y: -5, duration: 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.35 })
  piso.querySelectorAll('.rol').forEach((rol) => {
    const f = rol.querySelector('.rol-figura')
    rol.addEventListener('pointerenter', () => {
      gsap.fromTo(f, { rotation: 0 }, { keyframes: { rotation: [-6, 6, -3, 0] }, duration: 0.6, ease: 'none' })
      S.pop()
    })
  })
}

// ── Piso 3: los planes se inclinan como cartas ──
function planes(piso, estatico) {
  if (estatico) return
  piso.querySelectorAll('.plan').forEach((plan) => {
    gsap.set(plan, { transformPerspective: 700 })
    const base = plan.classList.contains('destacado') ? -14 : 0
    plan.addEventListener('pointermove', (e) => {
      const r = plan.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      gsap.to(plan, { rotationY: x * 14, rotationX: -y * 12, y: base - 6, duration: 0.4, ease: 'power2.out' })
    })
    plan.addEventListener('pointerleave', () => gsap.to(plan, { rotationY: 0, rotationX: 0, y: base, duration: 0.6, ease: 'power3.out' }))
    plan.addEventListener('pointerenter', () => S.pop())
  })
}

// ── Piso 2: el equipo saluda ──
function nosotros(piso, estatico) {
  if (estatico) return
  piso.querySelectorAll('.miembro').forEach((m) => {
    const f = m.querySelector('.miembro-figura')
    m.addEventListener('pointerenter', () => {
      gsap.fromTo(f, { y: 0 }, { y: -14, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 })
      S.pop()
    })
  })
}
