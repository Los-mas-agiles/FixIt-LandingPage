// Azotea: objetos que reaccionan al mouse (o al toque en celular).
import * as S from './sonido.js'

const gsap = window.gsap
const NS = 'http://www.w3.org/2000/svg'
const $ = (s) => document.querySelector(s)

const PALOMAS = [[252, 156], [1032, 134], [858, 172]]

function crearPaloma([x, y]) {
  const g = document.createElementNS(NS, 'g')
  g.setAttribute('class', 'az-paloma')
  g.innerHTML = `
    <path d="M-4 -4V2M4 -4V2" stroke="#C98763" stroke-width="3" stroke-linecap="round"/>
    <path d="M18 -18 34 -26 30 -12Z" fill="#9A93B3" stroke="#2C2C2C" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="2" cy="-16" rx="21" ry="13" fill="#DAD4E8" stroke="#2C2C2C" stroke-width="3"/>
    <path class="pal-ala" d="M-4 -22Q12 -32 22 -18Q8 -12 -4 -22Z" fill="#B9B2CF" stroke="#2C2C2C" stroke-width="2.5" stroke-linejoin="round"/>
    <g class="pal-cabeza">
      <circle cx="-17" cy="-29" r="9" fill="#DAD4E8" stroke="#2C2C2C" stroke-width="2.5"/>
      <circle cx="-20" cy="-31" r="1.9" fill="#2C2C2C"/>
      <path d="M-26 -29-33-27-26-24Z" fill="#F5E6A3" stroke="#2C2C2C" stroke-width="1.5" stroke-linejoin="round"/>
    </g>
    <rect x="-30" y="-46" width="66" height="50" fill="transparent"/>`
  $('#az-palomas').appendChild(g)
  gsap.set(g, { x, y })
  const cabeza = g.querySelector('.pal-cabeza')
  const ala = g.querySelector('.pal-ala')
  let volando = false

  // Picotea de vez en cuando
  const picotear = () => {
    if (!volando) gsap.to(cabeza, { y: 7, x: -3, duration: 0.12, yoyo: true, repeat: 3, ease: 'power1.inOut' })
    gsap.delayedCall(2 + Math.random() * 4, picotear)
  }
  gsap.delayedCall(Math.random() * 3, picotear)

  const volar = () => {
    if (volando) return
    volando = true
    S.aleteo()
    const aleteo = gsap.to(ala, { scaleY: -1, transformOrigin: '0% 100%', duration: 0.08, yoyo: true, repeat: -1 })
    const lado = Math.random() > 0.5 ? 1 : -1
    gsap.timeline({ onComplete: () => { aleteo.kill(); gsap.set(ala, { scaleY: 1 }); volando = false } })
      .to(g, { x: x + lado * 420, y: y - 420, duration: 1.1, ease: 'power2.in' })
      .set(g, { x: x - lado * 500, y: y - 360, scaleX: lado }, '+=2.2')
      .to(g, { x, y, duration: 1.3, ease: 'power2.out' })
      .set(g, { scaleX: 1 })
  }
  g.addEventListener('pointerenter', volar)
  g.addEventListener('pointerdown', volar)
}

export function iniciarAzotea() {
  const escena = $('.azotea-escena')
  PALOMAS.forEach(crearPaloma)

  // Sala de máquinas: el engranaje gira
  const engranaje = $('#az-engranaje')
  let girando = false
  const girar = () => {
    if (girando) return
    girando = true
    S.engranaje()
    gsap.to(engranaje, { rotation: '+=360', svgOrigin: '234 280', duration: 1.1, ease: 'power2.inOut', onComplete: () => { girando = false } })
  }
  $('#az-caseta').addEventListener('pointerenter', girar)
  $('#az-caseta').addEventListener('pointerdown', girar)

  // Antena: chispas
  const chispas = $('#az-antena .az-chispas')
  let chispeando = false
  const chispear = () => {
    if (chispeando) return
    chispeando = true
    S.chispa()
    gsap.timeline({ onComplete: () => { chispeando = false } })
      .to(chispas, { opacity: 1, duration: 0.04, repeat: 7, yoyo: true, ease: 'steps(1)' })
      .to(chispas, { opacity: 0, duration: 0.1 })
  }
  $('#az-antena').addEventListener('pointerenter', chispear)
  $('#az-antena').addEventListener('pointerdown', chispear)

  // Tanque: se tambalea y salpica
  const tanque = $('#az-tanque')
  const gotas = $('#az-tanque .az-gotas')
  let tambaleando = false
  const tambalear = () => {
    if (tambaleando) return
    tambaleando = true
    S.agua()
    gsap.timeline({ onComplete: () => { tambaleando = false } })
      .to(tanque, { keyframes: { rotation: [5, -4, 3, -2, 1, 0] }, svgOrigin: '1010 260', duration: 1, ease: 'none' })
      .fromTo(gotas, { opacity: 1, y: 0 }, { y: -26, duration: 0.3, ease: 'power2.out' }, 0)
      .to(gotas, { y: 40, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.3)
  }
  $('#az-tanque-base').addEventListener('pointerenter', tambalear)
  $('#az-tanque-base').addEventListener('pointerdown', tambalear)

  // Tendedero: la ropa se mece sola y con el paso del mouse
  const prendas = [...document.querySelectorAll('.az-prenda')]
  prendas.forEach((p, i) => {
    gsap.set(p, { svgOrigin: `${p.dataset.x} ${p.dataset.y}` })
    gsap.to(p, { rotation: 3, duration: 1.4 + i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -i })
  })
  let ultimoX = null
  let ultimoViento = 0
  $('.az-zona-tendedero').addEventListener('pointermove', (e) => {
    const vx = ultimoX === null ? 0 : e.clientX - ultimoX
    ultimoX = e.clientX
    if (Math.abs(vx) < 3) return
    const giro = gsap.utils.clamp(-28, 28, vx * 1.6)
    prendas.forEach((p, i) => {
      gsap.to(p, { rotation: giro * (1 - i * 0.12), duration: 0.25, ease: 'power2.out', overwrite: 'auto',
        onComplete: () => gsap.to(p, { rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.25)' }) })
    })
    if (performance.now() - ultimoViento > 1400) { ultimoViento = performance.now(); S.viento() }
  })
  $('.az-zona-tendedero').addEventListener('pointerleave', () => { ultimoX = null })

  // Parabólica y brillo del panel solar siguen al cursor
  const parabolica = $('#az-parabolica')
  const brillo = $('#az-brillo')
  const girarParabolica = gsap.quickTo(parabolica, 'rotation', { duration: 0.6, ease: 'power3.out' })
  gsap.set(parabolica, { svgOrigin: '500 292' })
  const moverBrillo = gsap.quickTo(brillo, 'x', { duration: 0.5, ease: 'power3.out' })
  window.addEventListener('pointermove', (e) => {
    if (document.getElementById('azotea').inert) return
    const m = escena.getScreenCTM()
    if (!m) return
    const px = (e.clientX - m.e) / m.a
    const py = (e.clientY - m.f) / m.d
    const ang = Math.atan2(py - 292, px - 500) * 180 / Math.PI   // -90 = arriba
    girarParabolica(gsap.utils.clamp(-40, 30, ang + 130))
    moverBrillo((e.clientX / window.innerWidth) * 190)
  })
}

// Entrada de la azotea después de abrir las puertas
export function entradaAzotea() {
  const tl = gsap.timeline()
  const objetos = document.querySelectorAll('.azotea-escena > g:not(#az-palomas), .azotea-escena > use, #az-palomas > g')
  tl.from(objetos, { y: -60, opacity: 0, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.07 }, 0.1)
  objetos.forEach((_, i) => tl.call(() => S.ladrillo(), null, 0.3 + i * 0.07))
  const lema = document.querySelector('.hero-lema')
  const partes = window.SplitText ? new window.SplitText(lema, { type: 'words' }).words : [lema]
  tl.from('.azotea .eyebrow', { y: 16, opacity: 0, duration: 0.4 }, 0.15)
  tl.from('.hero-marca', { y: 40, opacity: 0, scale: 0.9, transformOrigin: '0% 100%', duration: 0.6, ease: 'back.out(1.8)' }, 0.25)
  tl.from(partes, { y: 30, opacity: 0, rotation: 4, duration: 0.45, ease: 'power3.out', stagger: 0.06 }, 0.45)
  tl.from('.hero-texto, .hero-acciones .btn, .hero-pista', { y: 20, opacity: 0, duration: 0.45, ease: 'power3.out', stagger: 0.08 }, 0.7)
  return tl
}
