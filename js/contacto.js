// Formulario de contacto. Por ahora el envío es SIMULADO: valida, espera
// un momento y muestra el sello de "recibida", pero no guarda ni envía nada.
// Cuando haya backend, reemplazar `enviar()` por un fetch a POST /api/contactos.
import * as S from './sonido.js'
import { t } from './i18n.js'

const gsap = window.gsap
const COLORES = ['#BFE0F0', '#F2C4A8', '#B8E8D0', '#F5E6A3', '#C9B8E8', '#BFE0F0']
const REGLAS = {
  nombre: (v) => v.trim().length >= 2 || t('form.nombre'),
  correo: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || t('form.correo'),
  edificio: (v) => v.trim().length >= 2 || t('form.edificio'),
  dptos: (v) => (Number.isInteger(+v) && +v >= 1 && +v <= 999) || t('form.dptos'),
  // Opcional: vacío vale; si se llena, celular peruano (9 dígitos que empiezan en 9, con o sin +51)
  telefono: (v) => v.trim() === '' || /^(\+?51)?9\d{8}$/.test(v.replace(/[\s-]/g, '')) || t('form.telefono'),
}

const enviar = () => new Promise((r) => setTimeout(r, 1100))

export function iniciarContacto() {
  const form = document.querySelector('.formulario')
  if (!form) return
  const obra = form.querySelector('.obra-mini')
  const boton = form.querySelector('button[type="submit"]')
  const enviado = form.querySelector('.enviado')
  const campos = [...form.querySelectorAll('.f-in')]

  // Mini-obra: cada campo lleno suma un bloque al edificio
  campos.forEach((c, i) => {
    const b = document.createElement('i')
    b.style.setProperty('--c', COLORES[i % COLORES.length])
    b.style.height = `${14 + (i % 3) * 8}px`
    obra.appendChild(b)
    gsap.set(b, { scaleY: 0, transformOrigin: '50% 100%' })
  })
  const bloques = [...obra.children]
  const lleno = campos.map(() => false)
  campos.forEach((c, i) => c.addEventListener('input', () => {
    const ahora = c.value.trim() !== ''
    if (ahora === lleno[i]) return
    lleno[i] = ahora
    gsap.to(bloques[i], { scaleY: ahora ? 1 : 0, duration: 0.35, ease: ahora ? 'back.out(2.4)' : 'power2.in' })
    if (ahora) S.ladrillo()
    if (c.getAttribute('aria-invalid') === 'true') validar(c)
  }))

  function validar(c) {
    const regla = REGLAS[c.name]
    const err = form.querySelector(`#e-${c.name}`)
    if (!regla || !err) return true
    const r = regla(c.value)
    const ok = r === true
    c.setAttribute('aria-invalid', String(!ok))
    if (ok) c.removeAttribute('aria-describedby')
    else c.setAttribute('aria-describedby', err.id)
    err.textContent = ok ? '' : r
    return ok
  }

  // Si cambia el idioma, los errores visibles se vuelven a escribir
  document.addEventListener('idioma', () => campos.filter((c) => c.getAttribute('aria-invalid') === 'true').forEach(validar))

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const malos = campos.filter((c) => !validar(c))
    if (malos.length) {
      malos[0].focus()
      gsap.fromTo(form, { x: 0 }, { keyframes: { x: [-8, 8, -5, 5, 0] }, duration: 0.4, ease: 'none' })
      S.martillo()
      return
    }
    // Si la trampa viene llena es un bot: se le muestra el éxito igual, pero cuando
    // haya backend no se debe enviar nada.
    const esBot = form.elements.web.value !== ''
    boton.disabled = true
    boton.textContent = t('form.enviando')
    S.taladro(0, 0.5)
    await (esBot ? new Promise((r) => setTimeout(r, 1100)) : enviar())
    enviado.hidden = false
    const sello = enviado.querySelector('.sello')
    gsap.timeline()
      .from(enviado, { opacity: 0, duration: 0.25 })
      .from(sello, { scale: 2.4, opacity: 0, rotation: -24, duration: 0.35, ease: 'power4.in' }, 0.1)
      .call(() => { S.martillo(); S.brillo(0.1) })
      .fromTo(form, { y: 0 }, { y: 6, duration: 0.06, yoyo: true, repeat: 1 })
      .from(enviado.querySelector('p'), { y: 12, opacity: 0, duration: 0.4 })
    enviado.setAttribute('tabindex', '-1')
    enviado.focus({ preventScroll: true })
  })
}
