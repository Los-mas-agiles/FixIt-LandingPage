# FixIt · Landing page

Página de presentación de **FixIt**, de la startup **Los más Agiles** (curso Desarrollo Ágil de Productos de Software, UPC 2026-2).

Integrantes: Jefrey Martin Sanchez Ignacio · George Arturo Aliaga Pimentel · Edery Renzo Abanto Vicente.

## Concepto: un viaje en ascensor

La página es un edificio y el visitante baja en un ascensor con vidrio, desde la **azotea** hasta la **recepción**. Cada piso es una sección que **se construye en vivo** la primera vez que se llega (ladrillo → tarrajeo → pintura → acabados → luz, ~1,5 s) con efectos de sonido de obra. La hora avanza mientras se baja: atardecer en la azotea, noche en el problema, amanecer y mañana hacia la recepción.

| Parada | Contenido |
|---|---|
| Azotea | Hero + "Ir a FixIt". Objetos interactivos: engranaje, antena, parabólica, tendedero, tanque y palomas |
| 7 | El problema (chat del edificio que entierra el reclamo, reloj de viernes a lunes) |
| 6 | La solución (las 6 HU) |
| 5 | Cómo funciona + metas del proyecto |
| 4 | Para cada rol |
| 3 | Planes (precios **referenciales**, se ajustarán al TF) |
| 2 | Sobre nosotros |
| 1 | Preguntas frecuentes |
| PB | Recepción: formulario de contacto + "Ir a FixIt" |

Se navega con la rueda del mouse, las flechas, deslizando en celular o con la **botonera** (a la derecha; se abre al pasar el mouse).

## Tecnología

HTML + CSS + JavaScript puro, sin paso de compilación.

- [GSAP 3](https://gsap.com) (Observer, CustomEase, SplitText) desde jsDelivr.
- Efectos de sonido **sintetizados** con Web Audio (`js/sonido.js`): no hay archivos de audio. No hay música.
- Estilo **Modular Block City**, igual que la app: `css/tokens.css` es copia de `FixIt-FrontEnd/src/styles/tokens.css`.
- Todas las ilustraciones son SVG hechos en código (kit de piezas al inicio de `index.html`).

```
index.html        pisos, kit SVG, cabina, botonera y pantalla de carga
css/              tokens, base, cabina, pisos, azotea, carga
js/main.js        punto de entrada
js/ascensor.js    viaje entre pisos, cielo, display, botonera y controles
js/obra.js        motor de construcción de cada piso
js/escenas.js     animaciones propias de cada piso ya construido
js/azotea.js      objetos interactivos de la azotea
js/carga.js       pantalla de carga (grúa + puertas)
js/contacto.js    formulario (envío SIMULADO)
js/sonido.js      efectos de sonido
js/ciudad.js      siluetas de la ciudad del fondo
```

## Correr en local

Los módulos de JavaScript necesitan un servidor (no funciona abriendo el archivo con doble clic):

```bash
python -m http.server 5510
```

y abrir http://localhost:5510. También sirve la extensión Live Server de VS Code.

## Notas

- **El formulario no guarda nada**: valida, simula el envío y muestra el sello de "recibida". Cuando haya backend, reemplazar `enviar()` en `js/contacto.js` por un `fetch` a la API.
- Con "reducir movimiento" activado en el sistema (o sin JavaScript), la página se muestra como una web normal con scroll y todos los pisos ya construidos.
- Enlaces directos a un piso: `#piso-3`, `#lobby`, etc.
