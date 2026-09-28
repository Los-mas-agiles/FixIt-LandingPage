// Efectos de sonido sintetizados con Web Audio: no hay archivos de audio.
// El sonido viene activado, pero el navegador no deja que suene hasta el primer
// gesto de la persona (clic, toque o tecla; la rueda del mouse no cuenta).
// `esperarGesto()` lo desbloquea en ese momento.

const CLAVE = 'fixit-sonido-v2'
let ctx = null
let salida = null
let ruido = null
let activo = false

export function sonidoGuardado() {
  try { return localStorage.getItem(CLAVE) !== 'no' } catch { return true }
}

export function activarSonido(si) {
  activo = si
  try { localStorage.setItem(CLAVE, si ? 'si' : 'no') } catch { /* sin almacenamiento */ }
  if (si && !ctx) iniciar()
  if (ctx && ctx.state === 'suspended') ctx.resume().then(avisar, () => {})
  avisar()
}

export const sonidoActivo = () => activo
// true si está activado pero el navegador todavía no lo deja sonar
export const sonidoBloqueado = () => activo && (!ctx || ctx.state !== 'running')

const avisos = new Set()
export const alCambiarSonido = (fn) => avisos.add(fn)
const avisar = () => avisos.forEach((fn) => fn())

let desbloqueadoEn = -1e9
// El gesto que desbloquea el audio no debe contar además como "apagar el sonido"
export const recienDesbloqueado = () => performance.now() - desbloqueadoEn < 800

export function esperarGesto() {
  const desbloquear = () => {
    if (activo && !ctx) iniciar()
    if (ctx && ctx.state !== 'running') { desbloqueadoEn = performance.now(); ctx.resume().then(avisar) }
  }
  ;['pointerdown', 'keydown', 'touchend'].forEach((ev) => window.addEventListener(ev, desbloquear, { capture: true, passive: true }))
}

function iniciar() {
  ctx = new AudioContext()
  ctx.onstatechange = avisar
  salida = ctx.createGain()
  salida.gain.value = 0.42
  const comp = ctx.createDynamicsCompressor()
  salida.connect(comp).connect(ctx.destination)
  // 1 s de ruido blanco reutilizable
  ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const d = ruido.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
}

const var_ = (v, p = 0.15) => v * (1 + (Math.random() * 2 - 1) * p)

function env(g, t, ataque, caida, pico = 1) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(pico, t + ataque)
  g.gain.exponentialRampToValueAtTime(0.0001, t + ataque + caida)
}

function fuenteRuido(t, dur) {
  const s = ctx.createBufferSource()
  s.buffer = ruido
  s.loop = true
  s.start(t, Math.random() * 0.5)
  s.stop(t + dur + 0.05)
  return s
}

function tono(tipo, f, t, dur, pico, destino = salida) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = tipo
  o.frequency.setValueAtTime(f, t)
  env(g, t, 0.004, dur, pico)
  o.connect(g).connect(destino)
  o.start(t)
  o.stop(t + dur + 0.05)
  return o
}

function listo() { return activo && ctx && ctx.state === 'running' }

// ── Obra ────────────────────────────────────────────────────
export function ladrillo(retraso = 0) {
  if (!listo()) return
  const t = ctx.currentTime + retraso
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = var_(1700, 0.3); bp.Q.value = 1.4
  const g = ctx.createGain(); env(g, t, 0.002, 0.06, 0.55)
  fuenteRuido(t, 0.08).connect(bp).connect(g).connect(salida)
  const o = tono('sine', var_(160), t, 0.09, 0.5)
  o.frequency.exponentialRampToValueAtTime(55, t + 0.09)
}

export function martillo(retraso = 0) {
  if (!listo()) return
  const t = ctx.currentTime + retraso
  tono('triangle', var_(980, 0.08), t, 0.14, 0.28)
  tono('square', var_(2400, 0.08), t, 0.04, 0.05)
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000
  const g = ctx.createGain(); env(g, t, 0.001, 0.03, 0.4)
  fuenteRuido(t, 0.05).connect(hp).connect(g).connect(salida)
}

export function llana(retraso = 0, dur = 0.34) {
  if (!listo()) return
  const t = ctx.currentTime + retraso
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9
  bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(1600, t + dur)
  const g = ctx.createGain(); env(g, t, 0.06, dur, 0.5)
  fuenteRuido(t, dur + 0.1).connect(bp).connect(g).connect(salida)
}

export function rodillo(retraso = 0, dur = 0.4) {
  if (!listo()) return
  const t = ctx.currentTime + retraso
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900
  const g = ctx.createGain(); env(g, t, 0.05, dur, 0.55)
  const lfo = ctx.createOscillator(); lfo.frequency.value = 16
  const prof = ctx.createGain(); prof.gain.value = 0.25
  lfo.connect(prof).connect(g.gain); lfo.start(t); lfo.stop(t + dur + 0.1)
  fuenteRuido(t, dur + 0.1).connect(lp).connect(g).connect(salida)
}

export function taladro(retraso = 0, dur = 0.28) {
  if (!listo()) return
  const t = ctx.currentTime + retraso
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 2
  const g = ctx.createGain(); env(g, t, 0.02, dur, 0.22)
  const o = ctx.createOscillator(); o.type = 'sawtooth'
  o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(260, t + dur)
  const vib = ctx.createOscillator(); vib.frequency.value = 38
  const vg = ctx.createGain(); vg.gain.value = 18
  vib.connect(vg).connect(o.frequency)
  o.connect(bp).connect(g).connect(salida)
  o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05)
}

export function pop(retraso = 0) {
  if (!listo()) return
  const t = ctx.currentTime + retraso
  const o = tono('sine', var_(520, 0.2), t, 0.1, 0.3)
  o.frequency.exponentialRampToValueAtTime(var_(1100, 0.2), t + 0.08)
}

export function interruptor(retraso = 0) {
  if (!listo()) return
  const t = ctx.currentTime + retraso
  tono('square', 1900, t, 0.012, 0.18)
  tono('square', 1300, t + 0.045, 0.012, 0.14)
}

export function brillo(retraso = 0) {
  if (!listo()) return
  const t = ctx.currentTime + retraso
  ;[1568, 2093, 2637, 3136].forEach((f, i) => tono('sine', f, t + i * 0.05, 0.25, 0.09))
}

// ── Ascensor ────────────────────────────────────────────────
export function ding(retraso = 0) {
  if (!listo()) return
  const t = ctx.currentTime + retraso
  ;[[1318.5, 0], [1046.5, 0.22]].forEach(([f, d]) => {
    tono('sine', f, t + d, 1.4, 0.26)
    tono('sine', f * 2.01, t + d, 0.5, 0.05)
  })
}

// Zumbido del motor mientras viaja; devuelve una función para detenerlo
export function motor() {
  if (!listo()) return () => {}
  const t = ctx.currentTime
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.25)
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240
  const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 52
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 104
  const aire = ctx.createBiquadFilter(); aire.type = 'bandpass'; aire.frequency.value = 700; aire.Q.value = 0.6
  const ga = ctx.createGain(); ga.gain.value = 0.12
  const r = ctx.createBufferSource(); r.buffer = ruido; r.loop = true
  o1.connect(lp); o2.connect(lp); lp.connect(g); r.connect(aire).connect(ga).connect(g); g.connect(salida)
  o1.start(t); o2.start(t); r.start(t)
  return () => {
    const f = ctx.currentTime
    g.gain.cancelScheduledValues(f)
    g.gain.setValueAtTime(g.gain.value, f)
    g.gain.exponentialRampToValueAtTime(0.0001, f + 0.3)
    ;[o1, o2, r].forEach((n) => n.stop(f + 0.35))
  }
}

export function clic() {
  if (!listo()) return
  tono('triangle', 1400, ctx.currentTime, 0.03, 0.15)
}

// ── Azotea ──────────────────────────────────────────────────
export function engranaje() {
  if (!listo()) return
  for (let i = 0; i < 10; i++) martillo(i * 0.06)
  taladro(0, 0.55)
}

export function chispa() {
  if (!listo()) return
  const t = ctx.currentTime
  for (let i = 0; i < 9; i++) {
    const d = Math.random() * 0.35
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = var_(4200, 0.3)
    const g = ctx.createGain(); env(g, t + d, 0.001, 0.02, 0.5)
    fuenteRuido(t + d, 0.03).connect(hp).connect(g).connect(salida)
  }
}

export function agua() {
  if (!listo()) return
  const t = ctx.currentTime
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3
  bp.frequency.setValueAtTime(300, t)
  for (let i = 0; i < 6; i++) bp.frequency.linearRampToValueAtTime(i % 2 ? 380 : 900, t + 0.12 * (i + 1))
  const g = ctx.createGain(); env(g, t, 0.05, 0.8, 0.5)
  fuenteRuido(t, 0.9).connect(bp).connect(g).connect(salida)
  const o = tono('sine', 90, t, 0.6, 0.25)
  o.frequency.linearRampToValueAtTime(70, t + 0.6)
}

export function aleteo() {
  if (!listo()) return
  const t = ctx.currentTime
  for (let i = 0; i < 8; i++) {
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = var_(900, 0.3); bp.Q.value = 0.8
    const g = ctx.createGain(); env(g, t + i * 0.07, 0.01, 0.05, 0.35)
    fuenteRuido(t + i * 0.07, 0.07).connect(bp).connect(g).connect(salida)
  }
}

export function viento() {
  if (!listo()) return
  const t = ctx.currentTime
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2
  bp.frequency.setValueAtTime(400, t); bp.frequency.linearRampToValueAtTime(900, t + 0.4); bp.frequency.linearRampToValueAtTime(500, t + 0.9)
  const g = ctx.createGain(); env(g, t, 0.2, 0.7, 0.18)
  fuenteRuido(t, 1).connect(bp).connect(g).connect(salida)
}

export function vibrar() {
  if (!listo()) return
  const t = ctx.currentTime
  ;[0, 0.18].forEach((d) => {
    const o = tono('square', 170, t + d, 0.12, 0.05)
    o.frequency.setValueAtTime(170, t + d)
  })
}
