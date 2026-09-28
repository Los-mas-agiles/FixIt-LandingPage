// Punto de entrada: arma la página-ascensor.
import * as S from './sonido.js'
import { iniciarAscensor, modoEstatico, destinoInicial, ir } from './ascensor.js'
import { iniciarAzotea, entradaAzotea } from './azotea.js'
import { iniciarContacto } from './contacto.js'
import { cargar } from './carga.js'
import { dibujarCiudad } from './ciudad.js'

const gsap = window.gsap
gsap.registerPlugin(window.Observer, window.CustomEase, window.SplitText)

// Los <svg> que usan una pieza del kit heredan su viewBox (así mantienen la proporción)
document.querySelectorAll('svg:not([viewBox]) > use:only-child, svg.rol-figura > use:first-child, svg.miembro-figura > use').forEach((u) => {
  const svg = u.parentNode
  if (svg.getAttribute('viewBox')) return
  const simbolo = document.querySelector(u.getAttribute('href'))
  if (simbolo) svg.setAttribute('viewBox', simbolo.getAttribute('viewBox'))
})

// Botón de sonido del techo
const btnSonido = document.querySelector('.btn-sonido')
const pintarSonido = () => btnSonido.setAttribute('aria-pressed', String(S.sonidoActivo()))
btnSonido.addEventListener('click', () => { S.activarSonido(!S.sonidoActivo()); pintarSonido(); S.clic() })

dibujarCiudad()
iniciarContacto()

if (document.documentElement.classList.contains('sin-movimiento')) {
  modoEstatico()
} else {
  iniciarAscensor()
  iniciarAzotea()
  const destino = destinoInicial()
  await cargar()
  pintarSonido()
  const intro = entradaAzotea()
  if (destino > 0) intro.eventCallback('onComplete', () => ir(destino))
}
