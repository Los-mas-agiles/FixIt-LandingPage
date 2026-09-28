// Siluetas de la ciudad detrás del edificio (dos capas para el paralaje).
// Aleatorio con semilla: la ciudad es siempre la misma en cada visita.

function aleatorio(semilla) {
  return () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646 }
}

function capa(svg, semilla, { min, max, anchoMin, anchoMax }) {
  const r = aleatorio(semilla)
  let html = ''
  let x = -20
  while (x < 1620) {
    const w = anchoMin + r() * (anchoMax - anchoMin)
    const h = min + r() * (max - min)
    const y = 400 - h
    html += `<rect class="edif" x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="8"/>`
    if (r() > 0.6) html += `<rect class="edif" x="${(x + w / 2 - 3).toFixed(0)}" y="${(y - 26).toFixed(0)}" width="6" height="28"/>`
    for (let vy = y + 16; vy < 390; vy += 22) {
      for (let vx = x + 10; vx < x + w - 14; vx += 18) {
        if (r() > 0.55) html += `<rect class="vent" x="${vx.toFixed(0)}" y="${vy.toFixed(0)}" width="8" height="10" rx="2"/>`
      }
    }
    x += w + 4 + r() * 18
  }
  svg.innerHTML = html
}

export function dibujarCiudad() {
  capa(document.querySelector('.ciudad-lejos'), 7, { min: 90, max: 300, anchoMin: 50, anchoMax: 120 })
  capa(document.querySelector('.ciudad-cerca'), 31, { min: 60, max: 240, anchoMin: 90, anchoMax: 190 })
}
