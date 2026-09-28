// Punto de entrada: arma la página-ascensor.
import * as S from './sonido.js'
import { iniciarAscensor, modoEstatico, destinoInicial, ir } from './ascensor.js'
import { iniciarAzotea, entradaAzotea } from './azotea.js'
import { iniciarContacto } from './contacto.js'
import { cargar } from './carga.js'
import { dibujarCiudad } from './ciudad.js'
import { prepararEscenas } from './escenas.js'

const gsap = window.gsap
gsap.registerPlugin(window.Observer, window.CustomEase, window.SplitText)

// Los <svg> que usan una pieza del kit heredan su viewBox (así mantienen la proporción)
document.querySelectorAll('svg:not([viewBox]) > use:only-child, svg.rol-figura > use:first-child, svg.miembro-figura > use').forEach((u) => {
  const svg = u.parentNode
  if (svg.getAttribute('viewBox')) return
  const simbolo = document.querySelector(u.getAttribute('href'))
  if (simbolo) svg.setAttribute('viewBox', simbolo.getAttribute('viewBox'))
})

// Sonido: activado por defecto (salvo que la persona lo haya apagado antes);
// suena desde el primer clic, toque o tecla.
const btnSonido = document.querySelector('.btn-sonido')
const pintarSonido = () => {
  btnSonido.setAttribute('aria-pressed', String(S.sonidoActivo()))
  btnSonido.classList.toggle('pendiente', S.sonidoBloqueado())
  btnSonido.title = S.sonidoBloqueado() ? 'Haz clic en la página para activar el sonido' : ''
}
btnSonido.addEventListener('click', () => {
  if (!S.recienDesbloqueado()) S.activarSonido(!S.sonidoActivo())
  pintarSonido()
  S.clic()
})
S.alCambiarSonido(pintarSonido)
S.activarSonido(S.sonidoGuardado())
S.esperarGesto()
pintarSonido()

dibujarCiudad()
prepararEscenas()
iniciarContacto()

if (document.documentElement.classList.contains('sin-movimiento')) {
  modoEstatico()
} else {
  iniciarAscensor()
  iniciarAzotea()
  const destino = destinoInicial()
  await cargar()
  const intro = entradaAzotea()
  if (destino > 0) intro.eventCallback('onComplete', () => ir(destino))
}
