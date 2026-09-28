// Pantalla de carga: la grúa arma la marca con 3 bloques mientras carga
// la página; luego se elige entrar con o sin sonido y se abren las puertas.
import * as S from './sonido.js'

const gsap = window.gsap
const NS = 'http://www.w3.org/2000/svg'

// La marca (viewBox 44) escalada ×3 y ubicada bajo la pluma de la grúa
const BLOQUES = [
  { x: 249, y: 245, w: 57, h: 45, c: '#BFE0F0' },
  { x: 306, y: 245, w: 57, h: 45, c: '#F2C4A8' },
  { x: 277.5, y: 200, w: 57, h: 45, c: '#B8E8D0', stud: true },
]
const REPOSO = 118   // largo del cable cuando la grúa está quieta

export function cargar() {
  return new Promise((resolver) => {
    const carga = document.getElementById('carga')
    const carro = document.getElementById('grua-carro')
    const cable = document.getElementById('grua-cable')
    const gancho = document.getElementById('grua-gancho')
    const grupo = document.getElementById('grua-bloques')
    const pct = carga.querySelector('.carga-pct')
    const texto = carga.querySelector('.carga-texto')
    const barra = carga.querySelector('.carga-barra span')
    const titulo = carga.querySelector('.carga-titulo')
    const botones = carga.querySelector('.carga-botones')

    gsap.set(carro, { x: 380 })
    gsap.set(gancho, { y: REPOSO })

    const tl = gsap.timeline({ paused: true })
    BLOQUES.forEach((b, i) => {
      const r = document.createElementNS(NS, 'rect')
      Object.entries({ width: b.w, height: b.h, rx: 13, fill: b.c, stroke: '#2C2C2C', 'stroke-width': 5 }).forEach(([k, v]) => r.setAttribute(k, v))
      const cx = b.x + b.w / 2
      const colgado = { x: 380 - b.w / 2, y: REPOSO + 10 }
      gsap.set(r, { attr: colgado, opacity: 0 })
      grupo.appendChild(r)
      const t = i * 1.05
      tl.set(r, { opacity: 1 }, t)
        .to(carro, { x: cx, duration: 0.45, ease: 'power2.inOut' }, t)
        .to(r, { attr: { x: b.x }, duration: 0.45, ease: 'power2.inOut' }, t)
        .to(cable, { attr: { y2: b.y - 10 }, duration: 0.35, ease: 'power2.in' }, t + 0.45)
        .to(gancho, { y: b.y - 10, duration: 0.35, ease: 'power2.in' }, t + 0.45)
        .to(r, { attr: { y: b.y }, duration: 0.35, ease: 'power2.in' }, t + 0.45)
        .call(() => S.ladrillo(), null, t + 0.8)
        .to([cable], { attr: { y2: REPOSO }, duration: 0.22, ease: 'power2.out' }, t + 0.82)
        .to(gancho, { y: REPOSO, duration: 0.22, ease: 'power2.out' }, t + 0.82)
        .to(carro, { x: 380, duration: 0.3, ease: 'power2.inOut' }, t + 0.8)
      if (b.stud) {
        const s = document.createElementNS(NS, 'rect')
        Object.entries({ x: 289.5, y: 186.5, width: 15, height: 13.5, rx: 4, fill: b.c, stroke: '#2C2C2C', 'stroke-width': 4 }).forEach(([k, v]) => s.setAttribute(k, v))
        grupo.appendChild(s)
        tl.from(s, { opacity: 0, y: -10, duration: 0.2 }, t + 0.85)
      }
    })
    gsap.set(cable, { attr: { y1: 78, y2: REPOSO } })

    // Progreso: animación de la grúa + fuentes + página cargadas
    const progreso = { v: 0 }
    const pintar = () => { pct.textContent = `${Math.round(progreso.v)} %`; barra.style.transform = `scaleX(${progreso.v / 100})` }
    tl.play()
    gsap.to(progreso, { v: 80, duration: tl.duration(), ease: 'power1.inOut', onUpdate: pintar })

    const paginaLista = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => window.addEventListener('load', r, { once: true }))
    Promise.all([document.fonts.ready, paginaLista, new Promise((r) => tl.eventCallback('onComplete', r))]).then(() => {
      gsap.to(progreso, { v: 100, duration: 0.3, onUpdate: pintar })
      texto.textContent = 'Edificio listo'
      gsap.to(titulo, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)', startAt: { y: 20 } })
      botones.hidden = false
      gsap.from(botones.children, { y: 16, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out' })
      const preferido = botones.querySelector(`[data-sonido="${S.sonidoGuardado() ? 'si' : 'no'}"]`)
      preferido.focus({ preventScroll: true })
    })

    botones.addEventListener('click', (e) => {
      const b = e.target.closest('.entrar')
      if (!b) return
      S.activarSonido(b.dataset.sonido === 'si')
      botones.querySelectorAll('button').forEach((x) => { x.disabled = true })
      S.ding()
      // La azotea empieza a animarse mientras las puertas se abren
      gsap.delayedCall(0.3, resolver)
      gsap.timeline({ onComplete: () => carga.remove() })
        .to('.carga-centro', { opacity: 0, scale: 0.96, duration: 0.3 })
        .to('.puerta.izq', { xPercent: -101, duration: 0.95, ease: 'power3.inOut' }, 0.25)
        .to('.puerta.der', { xPercent: 101, duration: 0.95, ease: 'power3.inOut' }, 0.25)
    })
  })
}
