// El ascensor: mueve el edificio detrás del vidrio, cambia el cielo,
// actualiza el display y la botonera, y construye cada piso al llegar.
import * as S from './sonido.js'
import { construir } from './obra.js'
import { alConstruir, activarBucles } from './escenas.js'

const gsap = window.gsap
const raiz = document.documentElement
const edificio = document.getElementById('edificio')
const pisos = [...document.querySelectorAll('.piso')]
const lista = document.querySelector('.bt-lista')
const botonera = document.getElementById('botonera')
const btMovil = document.querySelector('.bt-movil')
const display = {
  flecha: document.querySelector('.display-flecha'),
  piso: document.querySelector('.display-piso'),
  nombre: document.querySelector('.display-nombre'),
  panel: document.querySelector('.bt-display'),
  movil: document.querySelector('.bt-movil-piso'),
}
const lejos = document.querySelector('.ciudad-lejos')
const cerca = document.querySelector('.ciudad-cerca')

let h = window.innerHeight
let actual = 0
let mostrado = 0
let viajando = false
let llegada = 0
let ultimoEvento = 0
let obra = null
const botones = []

export const pisoActual = () => actual
export const indicePorId = (id) => pisos.findIndex((p) => p.id === id)

// ── Datos de cada piso ──────────────────────────────────────
function cielo(p) {
  const [a, b] = (p.dataset.cielo || '#BFE0F0,#FAFAFA').split(',')
  const noche = parseFloat(p.dataset.noche || 0)
  return {
    '--cielo-a': a,
    '--cielo-b': b,
    '--noche': noche,
    '--luna': parseFloat(p.dataset.luna || 0),
    '--sol-y': parseFloat(p.dataset.sol ?? (noche > 0.2 ? 120 : 60)),
    '--lluvia': parseFloat(p.dataset.lluvia || 0),
  }
}

function paralaje(i) {
  const t = i / (pisos.length - 1)
  return { lejos: (22 - 30 * t) * h / 100, cerca: (46 - 62 * t) * h / 100 }
}

// ── Preparación ─────────────────────────────────────────────
function medir() {
  h = window.innerHeight
  raiz.style.setProperty('--h', `${h}px`)
  gsap.set(edificio, { y: -actual * h })
  const p = paralaje(actual)
  gsap.set(lejos, { y: p.lejos })
  gsap.set(cerca, { y: p.cerca })
}

function crearBotonera(alElegir) {
  pisos.forEach((p, i) => {
    const li = document.createElement('li')
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'bt-ir'
    b.setAttribute('aria-label', `Ir a ${p.dataset.nombre}`)
    b.innerHTML = `<span class="bt-boton">${p.dataset.etiqueta}</span><span class="bt-nombre">${p.dataset.nombre}<small>${p.dataset.etiqueta === 'AZ' ? 'Azotea' : p.dataset.etiqueta === 'PB' ? 'Planta baja' : 'Piso ' + p.dataset.etiqueta}</small></span>`
    b.addEventListener('click', () => {
      S.clic()
      botonera.classList.remove('abierta')
      btMovil.setAttribute('aria-expanded', 'false')
      alElegir(i)
    })
    li.appendChild(b)
    lista.appendChild(li)
    botones.push(b)
  })
  btMovil.addEventListener('click', () => {
    const abierta = botonera.classList.toggle('abierta')
    btMovil.setAttribute('aria-expanded', String(abierta))
  })
}

function mostrar(i, dir = 0) {
  const p = pisos[i]
  display.piso.textContent = p.dataset.etiqueta
  display.nombre.textContent = p.dataset.nombre
  display.panel.textContent = p.dataset.etiqueta
  display.movil.textContent = p.dataset.etiqueta
  display.flecha.textContent = dir > 0 ? '▼' : dir < 0 ? '▲' : '■'
}

function marcar(i) {
  botones.forEach((b, j) => {
    if (j === i) b.setAttribute('aria-current', 'true')
    else b.removeAttribute('aria-current')
    b.classList.remove('destino')
  })
  pisos.forEach((p, j) => { p.inert = j !== i })
}

// ── Viaje ───────────────────────────────────────────────────
export function ir(destino, { instantaneo = false } = {}) {
  destino = Math.max(0, Math.min(pisos.length - 1, destino))
  if (destino === actual || viajando) return
  obra?.terminar()
  obra = null

  const dir = Math.sign(destino - actual)
  const distancia = Math.abs(destino - actual)
  const dur = instantaneo ? 0.01 : Math.min(0.9 + 0.13 * (distancia - 1), 1.75)
  const y = -destino * h
  const px = paralaje(destino)

  viajando = true
  document.body.classList.add('viajando')
  botones[destino].classList.add('destino')
  mostrar(actual, dir)
  const pararMotor = instantaneo ? () => {} : S.motor()

  const tl = gsap.timeline({ onComplete: () => llegar(destino, pararMotor) })
  tl.to(edificio, {
    y, duration: dur, ease: 'power2.inOut',
    onUpdate() {
      const i = Math.round(-gsap.getProperty(edificio, 'y') / h)
      if (i !== mostrado && i >= 0 && i < pisos.length) { mostrado = i; mostrar(i, dir) }
    },
  }, 0)
  // Frenado: se pasa un poco y se asienta
  if (!instantaneo) {
    tl.to(edificio, { y: y - dir * 9, duration: 0.12, ease: 'power1.out' })
    tl.to(edificio, { y, duration: 0.35, ease: 'power2.out' })
    tl.fromTo('#cabina', { y: 0 }, { y: 1.5, duration: 0.05, repeat: Math.round(dur / 0.05), yoyo: true, ease: 'none' }, 0)
    tl.set('#cabina', { y: 0 })
  }
  tl.to(raiz, { ...cielo(pisos[destino]), duration: dur, ease: 'power1.inOut' }, 0)
  tl.to(lejos, { y: px.lejos, duration: dur, ease: 'power2.inOut' }, 0)
  tl.to(cerca, { y: px.cerca, duration: dur, ease: 'power2.inOut' }, 0)
}

function llegar(i, pararMotor) {
  pararMotor()
  actual = i
  mostrado = i
  viajando = false
  llegada = performance.now()
  document.body.classList.remove('viajando')
  mostrar(i, 0)
  marcar(i)
  S.ding()
  const p = pisos[i]
  activarBucles(p)
  history.replaceState(null, '', i === 0 ? location.pathname : `#${p.id}`)
  if (!p.classList.contains('construido')) {
    obra = construir(p, (piso) => { obra = null; alConstruir(piso) })
  }
}

// ── Controles: rueda, toque, teclado y enlaces ──────────────
function puedeDesplazarse(el, dir) {
  const c = el?.closest?.('.contenido')
  if (!c || c.scrollHeight <= c.clientHeight + 2) return false
  return dir > 0 ? c.scrollTop + c.clientHeight < c.scrollHeight - 2 : c.scrollTop > 2
}

function intento(dir, evento) {
  const ahora = performance.now()
  const pausa = ahora - ultimoEvento
  ultimoEvento = ahora
  if (viajando) return
  if (evento?.target?.closest?.('#botonera')) return
  if (puedeDesplazarse(evento?.target, dir)) return
  // La inercia del touchpad sigue mandando eventos después de llegar: se exige una pausa
  if (ahora - llegada < 2200 && pausa < 240) return
  ir(actual + dir)
}

function controles() {
  window.Observer.create({
    target: window, type: 'wheel,touch', wheelSpeed: -1, tolerance: 12, preventDefault: false,
    onUp: (self) => intento(1, self.event),
    onDown: (self) => intento(-1, self.event),
  })
  window.addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
    const mapa = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }
    if (e.key === ' ' && !e.target.closest?.('button, a, summary')) mapa[' '] = e.shiftKey ? -1 : 1
    if (e.key === 'Home') { e.preventDefault(); ir(0); return }
    if (e.key === 'End') { e.preventDefault(); ir(pisos.length - 1); return }
    if (mapa[e.key]) { e.preventDefault(); if (!viajando) ir(actual + mapa[e.key]) }
  })
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-ir], a[href^="#"]')
    if (!a) return
    const id = a.dataset.ir || a.getAttribute('href').slice(1)
    const i = indicePorId(id)
    if (i < 0) return
    e.preventDefault()
    ir(i)
  })
  let espera
  window.addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(medir, 120) })
}

// ── Inicio ──────────────────────────────────────────────────
export function iniciarAscensor() {
  // El documento nunca hace scroll: solo se mueve el edificio. Los anclas (#piso-4)
  // o el foco pueden desplazarlo igual, así que se devuelve a 0.
  history.scrollRestoration = 'manual'
  const alOrigen = () => { if (scrollX || scrollY) scrollTo(0, 0) }
  alOrigen()
  window.addEventListener('scroll', alOrigen)
  pisos.forEach((p) => p.style.setProperty('--np', p.dataset.noche || 0))
  crearBotonera((i) => ir(i))
  medir()
  gsap.set(raiz, cielo(pisos[0]))
  mostrar(0)
  marcar(0)
  controles()
}

// Destino pedido en la URL (#piso-3, #lobby…), para ir después de la carga
export function destinoInicial() {
  const i = indicePorId(location.hash.slice(1))
  return i > 0 ? i : 0
}

// Modo sin movimiento: todo construido y la botonera hace scroll normal
export function modoEstatico() {
  crearBotonera((i) => pisos[i].scrollIntoView())
  pisos.forEach((p, i) => {
    const c = cielo(p)
    p.classList.add('construido')
    p.style.setProperty('--np', p.dataset.noche || 0)
    p.style.background = `linear-gradient(${c['--cielo-a']}, ${c['--cielo-b']})`
    botones[i].toggleAttribute('aria-current', i === 0)
    alConstruir(p, { estatico: true })
  })
}
