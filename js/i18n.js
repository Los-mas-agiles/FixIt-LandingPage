// Idiomas: español (el HTML está escrito en español) e inglés.
//
// Cómo funciona:
// - Los textos fijos del HTML se traducen solos: se recorren los nodos de texto y
//   ciertos atributos, y se buscan en el diccionario ES → EN (`EN`). Para agregar un
//   texto nuevo al HTML basta con sumarlo aquí con su traducción.
// - Los textos que arma JavaScript (chat, reloj, errores, botonera…) se piden con
//   t('clave') y se vuelven a dibujar al escuchar el evento 'idioma'.
// - Lo que tenga [data-no-traducir] (o esté dentro) se salta: lo maneja su propio JS.

const CLAVE = 'fixit-idioma'
export const IDIOMAS = ['es', 'en']
let idioma = 'es'

// ── Textos del HTML (español → inglés) ──────────────────────
const EN = {
  // Documento y accesibilidad
  'FixIt · Tu edificio, sin reclamos perdidos': 'FixIt · Your building, no more lost requests',
  'FixIt registra cada incidencia de mantenimiento de tu edificio, la prioriza con IA y muestra su estado a residentes, personal y administración.':
    'FixIt logs every maintenance issue in your building, prioritizes it with AI and shows its status to residents, staff and management.',
  'Incidencias de mantenimiento registradas, priorizadas con IA y a la vista de todos. Una startup de Los más Agiles.':
    'Maintenance issues logged, prioritized with AI and visible to everyone. A startup by Los más Agiles.',
  'Saltar al contacto': 'Skip to contact',
  'FixIt, ir a la azotea': 'FixIt, go to the rooftop',
  'Abrir la botonera': 'Open the elevator panel',
  'Efectos de sonido': 'Sound effects',
  'Botonera del ascensor': 'Elevator panel',
  'Idioma': 'Language',

  // Cabina y carga
  '▲▼ rueda · flechas · desliza': '▲▼ wheel · arrows · swipe',
  'FIXIT · CAP. 8': 'FIXIT · MAX 8',
  'Desliza para bajar': 'Swipe to go down',
  'Iniciar': 'Start',
  'Ver versión sin animaciones': 'View without animations',
  'AZ': 'R',
  'PB': 'L',

  // Nombres de los pisos (data-nombre)
  'Azotea': 'Rooftop',
  'El problema': 'The problem',
  'La solución': 'The solution',
  'Cómo funciona': 'How it works',
  'Para cada rol': 'For every role',
  'Planes': 'Plans',
  'Sobre nosotros': 'About us',
  'Preguntas': 'FAQ',
  'Recepción': 'Reception',

  // Cinta de obra
  'EN OBRA · PISO 07': 'UNDER CONSTRUCTION · FLOOR 07',
  'EN OBRA · PISO 06': 'UNDER CONSTRUCTION · FLOOR 06',
  'EN OBRA · PISO 05': 'UNDER CONSTRUCTION · FLOOR 05',
  'EN OBRA · PISO 04': 'UNDER CONSTRUCTION · FLOOR 04',
  'EN OBRA · PISO 03': 'UNDER CONSTRUCTION · FLOOR 03',
  'EN OBRA · PISO 02': 'UNDER CONSTRUCTION · FLOOR 02',
  'EN OBRA · PISO 01': 'UNDER CONSTRUCTION · FLOOR 01',
  'EN OBRA · PLANTA BAJA': 'UNDER CONSTRUCTION · LOBBY',

  // Azotea
  'Los más Agiles presenta': 'Los más Agiles presents',
  'Tu edificio, sin reclamos perdidos.': 'Your building, no more lost requests.',
  'Cada falla de mantenimiento queda registrada, priorizada con IA y con su estado a la vista del residente, el personal y la administración.':
    'Every maintenance issue is logged, prioritized with AI, and its status is visible to residents, staff and management.',
  'Ir a FixIt': 'Open FixIt',
  'Solicitar para mi edificio': 'Request it for my building',
  'Pasa el mouse': 'Hover over',
  'por la azotea ↘': 'the rooftop ↘',
  'MÁQUINAS': 'MACHINES',
  'AGUA': 'WATER',

  // Piso 7
  'Piso 07 · El problema': 'Floor 07 · The problem',
  'Viernes, 21:40.': 'Friday, 9:40 PM.',
  'Se malogró el ascensor.': 'The elevator broke down.',
  'El aviso se pierde en el grupo de WhatsApp del edificio y nadie sabe si alguien ya lo está viendo. Mientras tanto:':
    'The message gets lost in the building’s WhatsApp group and nobody knows if anyone is on it. Meanwhile:',
  'Residente': 'Resident',
  'No sabe si su reclamo llegó ni en qué quedó.': 'Doesn’t know if their request arrived or what happened to it.',
  'Mantenimiento': 'Maintenance',
  'Atiende sin una lista ordenada de prioridades.': 'Works without a prioritized list.',
  'Administración': 'Management',
  'No puede medir los tiempos ni sustentarlos ante la junta.': 'Can’t measure response times or report them to the board.',
  'Vecinos Torre Sol 🏢': 'Sun Tower Neighbors 🏢',
  '48 participantes': '48 members',
  '…y recién el lunes alguien lo lee.': '…and nobody reads it until Monday.',

  // Piso 6
  'Piso 06 · La solución': 'Floor 06 · The solution',
  'Un registro único para cada incidencia.': 'One single record for every issue.',
  'HU1': 'US1', 'HU2': 'US2', 'HU3': 'US3', 'HU4': 'US4', 'HU5': 'US5', 'HU6': 'US6',
  'Reporte con foto': 'Photo reports',
  'El residente describe la falla y adjunta una foto en segundos.': 'Residents describe the issue and attach a photo in seconds.',
  'Clasificación con IA': 'AI classification',
  'La IA sugiere el tipo y la prioridad al instante.': 'AI suggests the type and priority instantly.',
  'Tablero Kanban': 'Kanban board',
  'Pendiente, en proceso y resuelta, a la vista de todos.': 'Pending, in progress and resolved, visible to everyone.',
  'Avisos al instante': 'Instant alerts',
  'El residente recibe una notificación cuando cambia el estado.': 'Residents get a notification whenever the status changes.',
  'Indicadores': 'Metrics',
  'La administración ve pendientes y tiempos de atención.': 'Management sees open issues and response times.',
  'Acceso por roles': 'Role-based access',
  'Cada persona ve solo lo que le toca de su edificio.': 'Everyone sees only what they need from their building.',
  'IA': 'AI',

  // Piso 5
  'Piso 05 · Cómo funciona': 'Floor 05 · How it works',
  'De la falla a la solución, en cuatro pasos.': 'From issue to fix, in four steps.',
  'Reporta': 'Report',
  'El residente toma una foto y describe la falla.': 'The resident takes a photo and describes the issue.',
  'Clasifica': 'Classify',
  'La IA sugiere el tipo y la prioridad.': 'AI suggests the type and priority.',
  'Atiende': 'Fix',
  'Mantenimiento mueve la tarjeta en el tablero.': 'Maintenance moves the card across the board.',
  'Avisa': 'Notify',
  'El residente recibe la notificación.': 'The resident gets notified.',
  'Metas del proyecto': 'Project goals',
  'para resolver lo de prioridad alta': 'to resolve high-priority issues',
  'de incidencias clasificadas por IA': 'of issues classified by AI',
  'EN VIVO · UNA INCIDENCIA': 'LIVE · ONE ISSUE',
  'PENDIENTE': 'PENDING',
  'EN PROCESO': 'IN PROGRESS',
  'RESUELTA': 'RESOLVED',
  'PLOMERÍA': 'PLUMBING',
  'ALTA': 'HIGH',
  'RESIDENTE': 'RESIDENT',
  'CLASIFICA': 'CLASSIFIES',

  // Piso 4
  'Piso 04 · Para cada rol': 'Floor 04 · For every role',
  'Tres roles, una sola verdad.': 'Three roles, one single truth.',
  'Reporta desde el celular y sigue el estado sin tener que preguntar.': 'Reports from their phone and tracks the status without having to ask.',
  'Ve sus incidencias ordenadas por prioridad y actualiza el estado.': 'Sees their issues sorted by priority and updates the status.',
  'Supervisa el tablero completo y mide los tiempos de atención.': 'Oversees the whole board and measures response times.',

  // Piso 3
  'Piso 03 · Planes': 'Floor 03 · Plans',
  'Un precio por edificio, no por usuario.': 'One price per building, not per user.',
  'Edificio': 'Building',
  'Hasta 20 departamentos': 'Up to 20 apartments',
  '/mes': '/mo',
  'Más elegido': 'Most popular',
  'Torre': 'Tower',
  'Hasta 60 departamentos': 'Up to 60 apartments',
  'Condominio': 'Condo',
  'Más de 60 departamentos': 'Over 60 apartments',
  'Todos incluyen: usuarios ilimitados · configuración inicial · soporte el primer mes · precios referenciales':
    'Every plan includes: unlimited users · initial setup · first-month support · reference prices',

  // Piso 2
  'POR HACER': 'TO DO',
  'HACIENDO': 'DOING',
  'HECHO': 'DONE',
  'Piso 02 · Sobre nosotros': 'Floor 02 · About us',
  'Somos Los más Agiles.': 'We are Los más Agiles.',
  'Una startup de estudiantes de Ingeniería de Software de la UPC. Construimos FixIt en el curso Desarrollo Ágil de Productos de Software (2026-2), con Kanban, entregas continuas y validación con usuarios.':
    'A startup of Software Engineering students at UPC. We built FixIt in the Agile Software Product Development course (2026-2), with Kanban, continuous delivery and user validation.',
  'Backend e IA': 'Backend & AI',
  'Frontend y Scrum Master': 'Frontend & Scrum Master',
  'Product Owner y QA': 'Product Owner & QA',

  // Piso 1
  'Piso 01 · Preguntas': 'Floor 01 · FAQ',
  'Preguntas en conserjería.': 'Questions at the front desk.',
  '¿Hay que instalar algo?': 'Do I need to install anything?',
  'No. FixIt funciona en el navegador y, si quieres, se instala en el celular como una app (PWA).':
    'No. FixIt runs in the browser and, if you want, installs on your phone like an app (PWA).',
  '¿Qué pasa si la IA se equivoca?': 'What if the AI gets it wrong?',
  'La clasificación es una sugerencia: la administración puede corregir el tipo y la prioridad cuando quiera.':
    'The classification is a suggestion: management can correct the type and priority at any time.',
  '¿Los datos de mi edificio se mezclan con otros?': 'Is my building’s data mixed with others?',
  'No. Cada cuenta solo ve la información de su propio edificio.': 'No. Each account only sees its own building’s information.',
  '¿Cuánto demora empezar?': 'How long does it take to get started?',
  'Nosotros configuramos la cuenta del edificio, creamos los usuarios y te acompañamos el primer mes.':
    'We set up your building’s account, create the users and support you during the first month.',

  // Planta baja
  'RECEPCIÓN': 'RECEPTION',
  'Planta baja · Recepción': 'Lobby · Reception',
  'Llegaste a recepción.': 'You’ve reached reception.',
  'Déjanos los datos de tu edificio y te contactamos para mostrarte FixIt.': 'Leave your building’s details and we’ll get in touch to show you FixIt.',
  '¿Prefieres verlo ya?': 'Rather see it now?',
  'Tu nombre': 'Your name',
  'Correo': 'Email',
  'Nombre del edificio': 'Building name',
  'N.º de departamentos': 'No. of apartments',
  'Distrito': 'District',
  'Teléfono (opcional)': 'Phone (optional)',
  'No llenar': 'Do not fill',
  'Solicitar FixIt': 'Request FixIt',
  'SOLICITUD': 'REQUEST',
  'RECIBIDA': 'RECEIVED',
  '¡Gracias!': 'Thank you!',
  'Te escribiremos pronto a tu correo.': 'We’ll email you soon.',
}

// ── Textos que arma JavaScript ──────────────────────────────
const T = {
  es: {
    'carga.construyendo': 'Construyendo el edificio',
    'carga.listo': 'Edificio listo',
    'bt.ir': 'Ir a',
    'bt.azotea': 'Azotea',
    'bt.pb': 'Planta baja',
    'bt.piso': 'Piso',
    'sonido.bloqueado': 'Haz clic en la página para activar el sonido',
    'form.enviando': 'Enviando…',
    'tiron.bajar': 'Sigue para bajar',
    'tiron.subir': 'Sigue para subir',
    'tiron.suelta': 'Suelta para ir',
    'form.nombre': 'Escribe tu nombre.',
    'form.correo': 'Revisa el correo (ejemplo: ana@correo.com).',
    'form.edificio': 'Escribe el nombre del edificio.',
    'form.dptos': 'Indica cuántos departamentos tiene (1 a 999).',
    'form.telefono': 'Revisa el celular (9 dígitos, ejemplo: 987 654 321).',
    'reloj.dias': ['VIE', 'SÁB', 'DOM', 'LUN'],
    chat: [
      { de: 'Sra. Rosa · 701', t: 'Buenos días vecinos 🌞' },
      { sticker: '🌻' },
      { de: 'Dpto 302', t: '¿Alguien sabe a qué hora pasa el camión?' },
      { de: 'Dpto 504', t: 'Se malogró el ascensor 😩 ¿alguien avisó?', clave: true },
      { de: 'Dpto 101', t: 'Jajaja 😂' },
      { de: 'Sra. Rosa · 701', t: '¡Feliz cumple, Don Julio! 🎂' },
      { de: 'Dpto 203', t: '¡Feliz cumple! 🎉' },
      { de: 'Dpto 702', t: 'Feliz cumpleaños 🥳🥳' },
      { sticker: '🎂' },
      { de: 'Dpto 401', t: '¿De quién es la bici del pasillo?' },
      { de: 'Dpto 302', t: 'Buenas noches 🌙' },
      { sticker: '😴' },
    ],
  },
  en: {
    'carga.construyendo': 'Constructing the building',
    'carga.listo': 'Building ready',
    'bt.ir': 'Go to',
    'bt.azotea': 'Rooftop',
    'bt.pb': 'Lobby',
    'bt.piso': 'Floor',
    'sonido.bloqueado': 'Click anywhere on the page to turn on sound',
    'form.enviando': 'Sending…',
    'tiron.bajar': 'Keep going down',
    'tiron.subir': 'Keep going up',
    'tiron.suelta': 'Release to go',
    'form.nombre': 'Please enter your name.',
    'form.correo': 'Check the email address (e.g. ana@mail.com).',
    'form.edificio': 'Please enter the building name.',
    'form.dptos': 'How many apartments does it have? (1 to 999)',
    'form.telefono': 'Check the phone number (9 digits, e.g. 987 654 321).',
    'reloj.dias': ['FRI', 'SAT', 'SUN', 'MON'],
    chat: [
      { de: 'Mrs. Rosa · 701', t: 'Good morning, neighbors 🌞' },
      { sticker: '🌻' },
      { de: 'Apt 302', t: 'Does anyone know when the garbage truck comes?' },
      { de: 'Apt 504', t: 'The elevator broke down 😩 did anyone report it?', clave: true },
      { de: 'Apt 101', t: 'Hahaha 😂' },
      { de: 'Mrs. Rosa · 701', t: 'Happy birthday, Mr. Julio! 🎂' },
      { de: 'Apt 203', t: 'Happy birthday! 🎉' },
      { de: 'Apt 702', t: 'Happy bday 🥳🥳' },
      { sticker: '🎂' },
      { de: 'Apt 401', t: 'Whose bike is in the hallway?' },
      { de: 'Apt 302', t: 'Good night 🌙' },
      { sticker: '😴' },
    ],
  },
}

export const t = (clave) => T[idioma][clave] ?? T.es[clave] ?? clave
export const idiomaActual = () => idioma

// ── Aplicar el idioma a la página ───────────────────────────
const textosOriginales = new WeakMap()     // nodo de texto → texto en español
const atributosOriginales = new WeakMap()  // elemento → { atributo: valor en español }
const ATRIBUTOS = ['aria-label', 'title', 'data-nombre', 'data-etiqueta', 'content']
const normalizar = (s) => s.replace(/\s+/g, ' ').trim()
// Diccionario inverso: si un nodo se recrea ya traducido, se recupera su original
const ES_DE_EN = Object.fromEntries(Object.entries(EN).map(([es, en]) => [en, es]))
function enEspanol(texto) {
  const es = ES_DE_EN[normalizar(texto)]
  if (!es) return texto
  const [, antes, , despues] = texto.match(/^(\s*)([\s\S]*?)(\s*)$/)
  return antes + es + despues
}

function traducir(original) {
  if (idioma === 'es') return original
  const clave = normalizar(original)
  const en = EN[clave]
  if (!en) return original
  const [, antes, , despues] = original.match(/^(\s*)([\s\S]*?)(\s*)$/)
  return antes + en + despues
}

const saltar = (el) => el?.closest?.('[data-no-traducir], script, style')

function traducirTextos(raiz) {
  const recorrido = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT)
  for (let n = recorrido.nextNode(); n; n = recorrido.nextNode()) {
    if (saltar(n.parentElement)) continue
    if (!textosOriginales.has(n)) {
      if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(n.nodeValue)) continue
      textosOriginales.set(n, enEspanol(n.nodeValue))
    }
    const nuevo = traducir(textosOriginales.get(n))
    if (n.nodeValue !== nuevo) n.nodeValue = nuevo
  }
}

function traducirAtributos() {
  const selector = ATRIBUTOS.map((a) => `[${a}]`).join(',')
  document.querySelectorAll(selector).forEach((el) => {
    if (saltar(el) || (el.tagName === 'META' && !/description|og:title/.test(el.getAttribute('name') || el.getAttribute('property') || ''))) return
    if (!atributosOriginales.has(el)) {
      const o = {}
      ATRIBUTOS.forEach((a) => { if (el.hasAttribute(a)) o[a] = enEspanol(el.getAttribute(a)) })
      atributosOriginales.set(el, o)
    }
    Object.entries(atributosOriginales.get(el)).forEach(([a, v]) => el.setAttribute(a, traducir(v)))
  })
}

let tituloOriginal = null
export function aplicarIdioma(nuevo) {
  idioma = IDIOMAS.includes(nuevo) ? nuevo : 'es'
  try { localStorage.setItem(CLAVE, idioma) } catch { /* sin almacenamiento */ }
  document.documentElement.lang = idioma
  tituloOriginal ??= document.title
  document.title = traducir(tituloOriginal)
  traducirTextos(document.body)
  traducirAtributos()
  document.querySelectorAll('.idioma-sel button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.idioma === idioma)))
  document.dispatchEvent(new CustomEvent('idioma', { detail: idioma }))
}

// ?lang=en en la URL > lo que eligió antes > idioma del navegador
export function idiomaInicial() {
  const url = new URLSearchParams(location.search).get('lang')
  if (IDIOMAS.includes(url)) return url
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (IDIOMAS.includes(guardado)) return guardado
  } catch { /* sin almacenamiento */ }
  return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function iniciarIdioma() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('.idioma-sel button')
    if (b && b.dataset.idioma !== idioma) aplicarIdioma(b.dataset.idioma)
  })
  aplicarIdioma(idiomaInicial())
}
