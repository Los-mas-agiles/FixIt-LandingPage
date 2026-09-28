// El ascensor: mueve el edificio detrás del vidrio, cambia el cielo,
// actualiza el display y la botonera, y construye cada piso al llegar.
import * as S from './sonido.js'
import { construir } from './obra.js'
import { alConstruir, activarBucles } from './escenas.js'
import { t } from './i18n.js'

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
}
const lejos = document.querySelector('.ciudad-lejos')
const cerca = document.querySelector('.ciudad-cerca')

let h = window.innerHeight
let actual = 0
let mostrado = 0
let viajando = false
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

function rotular(b, p) {
  const sub = p.id === 'azotea' ? t('bt.azotea') : p.id === 'lobby' ? t('bt.pb') : `${t('bt.piso')} ${p.dataset.etiqueta}`
  b.setAttribute('aria-label', `${t('bt.ir')} ${p.dataset.nombre}`)
  b.innerHTML = `<span class="bt-boton">${p.dataset.etiqueta}</span><span class="bt-nombre">${p.dataset.nombre}<small>${sub}</small></span>`
}
// Al cambiar de idioma se vuelven a rotular la botonera y el display
document.addEventListener('idioma', () => {
  botones.forEach((b, i) => rotular(b, pisos[i]))
  if (botones.length) mostrar(viajando ? mostrado : actual)
})

function crearBotonera(alElegir) {
  pisos.forEach((p, i) => {
    const li = document.createElement('li')
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'bt-ir'
    rotular(b, p)
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
  // Si la página pasó a la versión simple, "ir" es solo hacer scroll hasta el piso
  if (raiz.classList.contains('sin-movimiento')) { pisos[destino].scrollIntoView(); return }
  if (destino === actual || viajando) return
  const suave = raiz.classList.contains('movimiento-suave')
  obra?.terminar()
  obra = null

  const dir = Math.sign(destino - actual)
  const distancia = Math.abs(destino - actual)
  const dur = instantaneo ? 0.01 : Math.min(0.9 + 0.13 * (distancia - 1), 1.75)
  const y = -destino * h
  const px = paralaje(destino)

  viajando = true
  document.body.classList.add('viajando', 'ya-viajo')
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
  // Frenado: se pasa un poco y se asienta (sin sacudidas si el equipo pide menos movimiento)
  if (!instantaneo && !suave) {
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
  gestoBloqueado = true   // la inercia del gesto que trajo hasta aquí no debe seguir bajando
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
  if (!/auto|scroll/.test(getComputedStyle(c).overflowY)) return false
  return dir > 0 ? c.scrollTop + c.clientHeight < c.scrollHeight - 2 : c.scrollTop > 2
}

// "Tirón": para cambiar de piso no basta con pasarse un poco del borde. Hay que
// insistir en el borde con un gesto nuevo hasta llenar la barra del indicador.
// Mientras tanto el edificio cede un poco, como un resorte.
const UMBRAL_TOQUE = 110          // px de arrastre con el dedo
const UMBRAL_RUEDA = 260          // recorrido acumulado del touchpad
const UMBRAL_RUEDA_MOUSE = 100    // una "muesca" de rueda de mouse basta
const ZONA_MUERTA = 14            // px de toque que no cuentan (temblor del dedo)
const tiron = document.querySelector('.tiron')
const tironTexto = tiron?.querySelector('.tiron-texto')
const tironFlecha = tiron?.querySelector('.tiron-flecha')
const tironBarra = tiron?.querySelector('.tiron-barra i')
let gestoBloqueado = false   // el gesto actual ya se usó (o llegó al borde scrolleando): no navega

const existe = (i) => i >= 0 && i < pisos.length

function pintarTiron(progreso, dir) {
  const destino = actual + dir
  const q = existe(destino) ? Math.min(1, progreso) : 0
  if (tiron) {
    tiron.classList.toggle('visible', q > 0.05)
    tiron.classList.toggle('arriba', dir < 0)
    tiron.classList.toggle('lleno', q >= 1)
    if (q > 0) {
      tironFlecha.textContent = dir > 0 ? '▼' : '▲'
      const accion = q >= 1 ? 'tiron.suelta' : dir > 0 ? 'tiron.bajar' : 'tiron.subir'
      tironTexto.textContent = `${t(accion)} · ${pisos[destino].dataset.nombre}`
      tironBarra.style.transform = `scaleX(${q})`
    }
  }
  gsap.set(edificio, { y: -actual * h - dir * q * 34 })
  return q
}

function soltarTiron() {
  tiron?.classList.remove('visible', 'lleno')
  if (!viajando) gsap.to(edificio, { y: -actual * h, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
}

function viajarPorTiron(dir) {
  tiron?.classList.remove('visible', 'lleno')
  gestoBloqueado = true
  ir(actual + dir)
}

function controlRueda() {
  let acumulado = 0
  let dirActual = 0
  let ultimo = 0
  let decaer = null
  window.addEventListener('wheel', (e) => {
    const ahora = performance.now()
    const gestoNuevo = ahora - ultimo > 260
    ultimo = ahora
    if (viajando || e.target.closest?.('#botonera')) return
    const dy = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? h : 1)
    const dir = Math.sign(dy)
    if (!dir) return
    if (gestoNuevo) { gestoBloqueado = false; acumulado = 0 }
    // El contenido del piso todavía tiene por dónde bajar/subir: scroll normal
    if (puedeDesplazarse(e.target, dir)) { gestoBloqueado = true; acumulado = 0; soltarTiron(); return }
    // Llegó al borde en este mismo gesto (o es la inercia tras llegar al piso): se ignora
    if (gestoBloqueado) return
    if (dir !== dirActual) { acumulado = 0; dirActual = dir }
    const mouse = e.deltaMode !== 0 || (Math.abs(dy) >= 50 && Number.isInteger(e.deltaY))
    acumulado += Math.abs(dy)
    const q = pintarTiron(acumulado / (mouse ? UMBRAL_RUEDA_MOUSE : UMBRAL_RUEDA), dir)
    clearTimeout(decaer)
    if (q >= 1) { acumulado = 0; viajarPorTiron(dir); return }
    decaer = setTimeout(() => { acumulado = 0; soltarTiron() }, 380)
  }, { passive: true })
}

function controlToque() {
  let toque = null
  window.addEventListener('touchstart', (e) => {
    toque = null
    if (viajando || e.touches.length !== 1 || e.target.closest?.('#botonera, .techo-cabina')) return
    const p = e.touches[0]
    // Solo se puede tirar hacia donde el contenido YA estaba en el borde al empezar el gesto
    toque = { x: p.clientX, y: p.clientY, libre: { 1: !puedeDesplazarse(e.target, 1), [-1]: !puedeDesplazarse(e.target, -1) }, dir: 0, q: 0 }
  }, { passive: true })
  window.addEventListener('touchmove', (e) => {
    if (!toque || viajando) return
    const p = e.touches[0]
    const dx = p.clientX - toque.x
    const dy = toque.y - p.clientY
    if (!toque.dir && Math.abs(dx) > Math.abs(dy)) return   // gesto horizontal
    const dir = Math.sign(dy)
    if (!dir || !toque.libre[dir] || !existe(actual + dir)) {
      if (toque.q) { toque.q = 0; soltarTiron() }
      return
    }
    toque.dir = dir
    toque.q = pintarTiron(Math.max(0, Math.abs(dy) - ZONA_MUERTA) / UMBRAL_TOQUE, dir)
  }, { passive: true })
  const fin = (e) => {
    if (!toque) return
    const { q, dir } = toque
    toque = null
    if (q >= 1 && e.type === 'touchend') viajarPorTiron(dir)
    else if (q > 0) soltarTiron()
  }
  window.addEventListener('touchend', fin, { passive: true })
  window.addEventListener('touchcancel', fin, { passive: true })
}

function controles() {
  controlRueda()
  controlToque()
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
// (también se usa si la página pasa a la versión simple a mitad de camino)
export function modoEstatico() {
  if (!botones.length) crearBotonera((i) => ir(i))
  obra?.terminar()
  gsap.killTweensOf(edificio)
  gsap.set(edificio, { clearProps: 'all' })
  document.body.classList.remove('viajando')
  pisos.forEach((p, i) => {
    const c = cielo(p)
    const yaConstruido = p.classList.contains('construido')
    p.inert = false
    p.classList.add('construido')
    p.style.setProperty('--np', p.dataset.noche || 0)
    p.style.background = `linear-gradient(${c['--cielo-a']}, ${c['--cielo-b']})`
    botones[i].toggleAttribute('aria-current', i === 0)
    if (!yaConstruido) alConstruir(p, { estatico: true })
  })
}
