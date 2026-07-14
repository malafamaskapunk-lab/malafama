/* ====================================================
   MALAIFAMA — Datos de muestra
   Edita este archivo para personalizar el contenido.
   ==================================================== */

// ─── INTEGRANTES ────────────────────────────────────
window.MEMBERS = [
  { id: 1, name: 'Valentina Rojas',  role: 'Voz principal', initials: 'VR', img: 'vocalist-stage.jpg' },
  { id: 2, name: 'Diego Monge',      role: 'Guitarra / Coros', initials: 'DM', img: '' },
  { id: 3, name: 'Andrés Villalobos', role: 'Bajo',          initials: 'AV', img: '' },
  { id: 4, name: 'Sebastián Mora',   role: 'Batería',        initials: 'SM', img: '' },
  { id: 5, name: 'Carlos Ureña',     role: 'Trompeta / Teclados', initials: 'CU', img: '' },
];

// ─── EVENTOS ────────────────────────────────────────
// type: concert | rehearsal | recording | meeting
window.EVENTS = [
  {
    id: 1, type: 'rehearsal',
    title: 'Ensayo general',
    date: getRelativeDate(1), time: '19:00', duration: '2.5h',
    location: 'Estudio Fénix, San José',
    notes: 'Repasar setlist completo. Llevar letras actualizadas.',
    color: '#f4a261',
  },
  {
    id: 2, type: 'concert',
    title: 'Concierto — Bar El Puente',
    date: getRelativeDate(5), time: '21:00', duration: '1.5h',
    location: 'Bar El Puente, Barrio Escalante',
    notes: 'Soundcheck a las 18:30. Llevar equipo propio de monitores.',
    color: '#e63946',
  },
  {
    id: 3, type: 'recording',
    title: 'Grabación — "Resistencia"',
    date: getRelativeDate(8), time: '10:00', duration: '6h',
    location: 'Studio 4 Records, Heredia',
    notes: 'Pistas de batería y bajo. El ingeniero es Fabián Castro.',
    color: '#9b59b6',
  },
  {
    id: 4, type: 'meeting',
    title: 'Reunión de producción',
    date: getRelativeDate(12), time: '17:00', duration: '1h',
    location: 'Zoom (link en WhatsApp)',
    notes: 'Revisar presupuesto para EP, fechas de grabación y artwork.',
    color: '#00e5ff',
  },
  {
    id: 5, type: 'rehearsal',
    title: 'Ensayo — Canciones nuevas',
    date: getRelativeDate(15), time: '19:00', duration: '2h',
    location: 'Estudio Fénix, San José',
    notes: 'Montar "Calle Rota" y "Sin Aviso". Opcional practicar intro.',
    color: '#f4a261',
  },
  {
    id: 6, type: 'concert',
    title: 'Festival Ska-Punk CR',
    date: getRelativeDate(22), time: '20:30', duration: '45min',
    location: 'Teatro Nacional — Foro, San José',
    notes: 'Slot de 45 min. Confirmar setlist con organización.',
    color: '#e63946',
  },
  {
    id: 7, type: 'rehearsal',
    title: 'Ensayo técnico',
    date: getRelativeDate(-3), time: '18:30', duration: '2h',
    location: 'Estudio Fénix, San José',
    notes: 'Ajuste de sonido en vivo. Prueba de IEMs.',
    color: '#f4a261',
  },
  {
    id: 8, type: 'recording',
    title: 'Mezcla — "Mala Vida"',
    date: getRelativeDate(30), time: '14:00', duration: '4h',
    location: 'Studio 4 Records, Heredia',
    notes: 'Revisión de mezcla. Pedir archivos stems antes del jueves.',
    color: '#9b59b6',
  },
];

function getRelativeDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// ─── CANCIONES ──────────────────────────────────────
// status: activa | en-progreso | descontinuada | nueva
window.SONGS = [
  {
    id: 1,
    title: 'Resistencia',
    key: 'Am', bpm: 148,
    status: 'activa',
    duration: '3:12',
    tags: ['ska', 'punk', 'himno'],
    notes: 'Canción estrella del setlist. El solo de trompeta en el puente es fundamental — no acortar.',
    lyrics: `[Intro — riff principal]

[Verso 1]
Cada mañana la misma batalla
las calles gritan lo que el silencio calla
No es rendirse, es levantarse más fuerte
porque la vida no regala suerte

[Pre-coro]
Y aunque el sistema empuje hacia abajo
seguimos de pie, seguimos en trabajo

[Coro]
Resistencia — no es solo una palabra
resistencia — es la sangre que nos habla
Mientras haya voz, mientras haya aliento
resistencia — nuestro único sustento

[Verso 2]
El ritmo marca el paso de esta lucha
nadie nos calla mientras la gente escucha
Unidos somos más que la tormenta
malaifama grita, la ciudad se orienta

[Pre-coro]
[Coro]

[Puente — trompeta]
(improvisación 8 compases)
La ciudad no duerme, la banda no para...

[Coro final × 2]
[Outro — fade]`,
    chords: `Intro: Am  F  C  G  (× 4)
Verso: Am  F  C  G
Pre-coro: F  C  G  Am
Coro: Am  F  C  G  (× 2)
Puente: Dm  Am  F  E  (× 4)`,
    links: [
      { label: '🎵 Maqueta Marzo', url: 'https://drive.google.com/file/d/EJEMPLO1' },
      { label: '📄 Letra editable', url: 'https://docs.google.com/document/d/EJEMPLO1' },
      { label: '🎬 Video ensayo', url: 'https://drive.google.com/file/d/EJEMPLO2' },
    ],
  },
  {
    id: 2,
    title: 'Mala Vida',
    key: 'Dm', bpm: 162,
    status: 'activa',
    duration: '2:48',
    tags: ['punk', 'rápida', 'setlist'],
    notes: 'Abrir con esta canción. Intro de batería sola por 4 compases.',
    lyrics: `[Verso 1]
Mala vida, buena historia
cada cicatriz, su propia gloria
No pedimos permiso pa' existir
solo sabemos vivir y resistir

[Coro]
Mala vida — sin disculpas
mala vida — con orgullo
Lo que el mundo llama error
nosotros lo llamamos ardor

[Verso 2]
Las paredes hablan en grafiti
el corazón no entiende de tramite
Somos ruido en la quietud del barrio
un grito ronco, nuestro inventario

[Coro × 2]
[Outro]`,
    chords: `Intro: Dm  Bb  C  Dm  (batería sola × 4, luego banda)
Verso: Dm  Bb  C  A
Coro: Bb  F  C  Dm  (× 2)
Outro: Dm  (fade out con ritmo ska)`,
    links: [
      { label: '🎵 Grabación live', url: 'https://drive.google.com/file/d/EJEMPLO3' },
    ],
  },
  {
    id: 3,
    title: 'Calle Rota',
    key: 'Em', bpm: 140,
    status: 'en-progreso',
    duration: '3:35',
    tags: ['ska', 'nueva', 'coro-pendiente'],
    notes: 'Letra del puente aún en revisión. Vals pedirle a Valentina que ajuste la melodía del coro.',
    lyrics: `[Verso 1]
Por la calle rota camina la historia
de los que nunca aparecen en la gloria
Los pasos resuenan contra el pavimento
un ritmo invisible, nuestro alimento

[Coro — EN REVISIÓN]
Calle rota, ciudad partida
calle rota, nuestra guarida
(faltan 2 versos finales — coordinar con Valentina)

[Verso 2]
Los postes de luz guardan los secretos
de amores perdidos y sueños incompletos
Pero el ska nos cura, nos da la vuelta
la música es nuestra única respuesta

[Puente — LETRA PENDIENTE]
(propuesta: hablar sobre la unión de la banda / la comunidad)

[Coro]`,
    chords: `Intro: Em  C  G  D  (× 2)
Verso: Em  C  G  D
Coro: C  G  D  Em
Puente: Am  Em  C  D  (× 4)`,
    links: [
      { label: '🎵 Demo cruda', url: 'https://drive.google.com/file/d/EJEMPLO4' },
      { label: '📝 Notas composición', url: 'https://docs.google.com/document/d/EJEMPLO2' },
    ],
  },
  {
    id: 4,
    title: 'Sin Aviso',
    key: 'G', bpm: 155,
    status: 'en-progreso',
    duration: '2:55',
    tags: ['punk', 'nueva'],
    notes: 'Instrumentación casi lista. Faltan letra y melodía vocal final.',
    lyrics: `[Borrador — Verso 1]
Sin aviso llegaste a mi vida
sin aviso todo cambió de salida
El ska suena fuerte en tus oídos
somos el eco de los desafíos

[Coro — borrador]
Sin aviso — el ritmo explota
sin aviso — la banda nota
Que esto es más que música y son
es nuestro grito, nuestra revolución

(CONTINÚA EN PROGRESO...)`,
    chords: `Intro: G  D  Em  C  (× 4)
Verso: G  D  Em  C
Coro: C  G  D  Em  (× 2)`,
    links: [],
  },
  {
    id: 5,
    title: 'Barrio Adentro',
    key: 'Bm', bpm: 145,
    status: 'activa',
    duration: '3:20',
    tags: ['ska', 'social', 'favorita'],
    notes: 'Segunda en el setlist. Pedir a Diego que marque el tiempo en la intro.',
    lyrics: `[Verso 1]
Barrio adentro, barrio afuera
la diferencia es una frontera
Hecha de asfalto y de prejuicio
de miedo viejo y de inicio

[Coro]
Barrio adentro — donde nacimos
barrio adentro — donde crecimos
No es un barrio, es nuestra nación
es nuestra gente, es nuestra canción

[Verso 2]
La vecina del quinto piso
sueña con un paraíso
Que no está lejos, está aquí
en cada ska que hacemos vivir

[Coro × 2]
[Outro instrumental — ska beat]`,
    chords: `Intro: Bm  G  D  A  (× 2)
Verso: Bm  G  D  A
Coro: G  D  A  Bm  (× 2)
Outro: Bm  (ska rhythm, fade)`,
    links: [
      { label: '🎵 Live Bar El Puente', url: 'https://drive.google.com/file/d/EJEMPLO5' },
      { label: '📄 Partitura trompeta', url: 'https://drive.google.com/file/d/EJEMPLO6' },
    ],
  },
  {
    id: 6,
    title: 'Marea Alta',
    key: 'C', bpm: 138,
    status: 'activa',
    duration: '4:02',
    tags: ['ska', 'balada', 'cierre'],
    notes: 'Cierre de show. Tempo más lento, espacio para la audiencia. Trompeta tiene solo de 16 compases.',
    lyrics: `[Intro lento]

[Verso 1]
Cuando la marea sube sin control
y el mundo parece girar sin sol
Nos quedamos juntos en la oscuridad
la banda somos nuestra propia ciudad

[Coro]
Marea alta — no nos mueve
marea alta — el ska se atreve
A surfear la ola que viene
porque el ritmo siempre sostiene

[Verso 2]
Las dudas llegan, los miedos también
pero el bajo marca lo que está bien
Y la trompeta dice lo que el alma grita
Malaifama — nuestra vida infinita

[Puente — trompeta solo 16 compases]
[Coro × 2]
[Outro — decrescendo]`,
    chords: `Intro: C  Am  F  G  (lento × 2)
Verso: C  Am  F  G
Coro: F  C  G  Am  (× 2)
Puente: Am  F  G  C  (× 4, trompeta)
Outro: C  (decrescendo)`,
    links: [
      { label: '🎵 Demo estudio', url: 'https://drive.google.com/file/d/EJEMPLO7' },
      { label: '🎬 Video live teatro', url: 'https://drive.google.com/file/d/EJEMPLO8' },
    ],
  },
  {
    id: 7,
    title: 'Ruido Necesario',
    key: 'F#m', bpm: 170,
    status: 'activa',
    duration: '2:22',
    tags: ['punk', 'rápida', 'energía'],
    notes: 'La más rápida del repertorio. Diego y Andrés necesitan sincronizar el riff de intro.',
    lyrics: `[Intro — riff potente]

[Verso 1]
No somos ruido, somos el mensaje
el volumen alto es nuestro lenguaje
Cuando la ciudad duerme insensible
nosotros somos lo imposible

[Coro]
Ruido necesario — despierta ya
ruido necesario — aquí está
El ska-punk grita lo que callás
el ruido necesario nos liberará

[Verso 2]
Los altavoces tienen sus razones
para retumbar en los corazones
No es agresión, es declaración
somos el ruido de esta generación

[Coro × 3]
[Outro — fade rápido]`,
    chords: `Intro: F#m  D  A  E  (× 4, power chords)
Verso: F#m  D  A  E
Coro: D  A  E  F#m  (× 2, rápido)`,
    links: [],
  },
  {
    id: 8,
    title: 'Último Tren',
    key: 'A', bpm: 130,
    status: 'activa',
    duration: '3:48',
    tags: ['ska', 'romántica'],
    notes: 'Inspirada en el barrio de las vías del tren. Ideal para posición media del setlist.',
    lyrics: `[Verso 1]
El último tren pasa a medianoche
sus rieles cantan lo que el día no aroche
Y yo te espero en el andén vacío
con el corazón latiendo frío

[Coro]
Último tren — no me dejes aquí
último tren — llévame a ti
Las vías son el camino que escojo
este amor de ska no es un antojo

[Verso 2]
Los grafitis cuentan historias viejas
de amores idos y de nostalgias añejas
Pero el presente tiene su compás
el ska nos dice que hay que ir hacia atrás

[Puente]
Nunca el último tren llegará tarde
cuando el ritmo es claro, el amor no parte

[Coro × 2]`,
    chords: `Intro: A  E  D  E  (× 2)
Verso: A  E  D  E
Coro: D  A  E  D  (× 2)
Puente: D  A  E  E7  (× 2)`,
    links: [
      { label: '🎵 Maqueta acústica', url: 'https://drive.google.com/file/d/EJEMPLO9' },
    ],
  },
  {
    id: 9,
    title: 'Sin Red',
    key: 'D', bpm: 158,
    status: 'nueva',
    duration: '—',
    tags: ['nueva', 'en-composición'],
    notes: 'Idea inicial de Carlos. Tiene el riff principal. Falta desarrollar estructura completa.',
    lyrics: `(Letra en composición — primeras ideas)

Sin red caemos al vacío
sin red el sistema es frío
Pero la música es la red que nos sostiene
el ska-punk el abrazo que nos viene...

(CONTINÚA...)`,
    chords: `Idea riff: D  G  A  D  (× 4)
(estructura pendiente)`,
    links: [],
  },
  {
    id: 10,
    title: 'La Vuelta',
    key: 'Cm', bpm: 144,
    status: 'descontinuada',
    duration: '3:05',
    tags: ['antigua', 'ska'],
    notes: 'Se tocó en los primeros shows. Archivada por decisión del grupo en enero 2024. Conservar para referencia.',
    lyrics: `[Verso 1]
Llegamos de vuelta al mismo lugar
donde todo empezó y quiso quedar
El escenario llama, el público espera
Malaifama no para aunque sea era

[Coro]
La vuelta — de donde venimos
la vuelta — a lo que queremos
El ska nunca olvida el camino
este ritmo es nuestro destino

[Verso 2]
(...)

[Coro × 2]`,
    chords: `Verso: Cm  Ab  Eb  Bb
Coro: Ab  Eb  Bb  Cm  (× 2)`,
    links: [
      { label: '🎵 Grabación 2022', url: 'https://drive.google.com/file/d/EJEMPLO10' },
    ],
  },
];

// ─── MULTIMEDIA ──────────────────────────────────────
window.MEDIA = {
  photos: [
    { id: 1, title: 'Sesión fotográfica — Vías del tren', date: '2024-03-15', file: 'band-rails-wide.jpg', thumb: 'band-rails-wide.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 2, title: 'Concierto Bar El Puente', date: '2024-02-10', file: 'concert-live-red.jpg', thumb: 'concert-live-red.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 3, title: 'Show acústico — Estudio jardín', date: '2023-11-20', file: 'concert-bw-indoor.jpg', thumb: 'concert-bw-indoor.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 4, title: 'Valentina — Portada EP', date: '2024-04-01', file: 'vocalist-stage.jpg', thumb: 'vocalist-stage.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 5, title: 'Ensayo en finca — B&W', date: '2024-01-08', file: 'rehearsal-bw.jpg', thumb: 'rehearsal-bw.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 6, title: 'Foto grupal oficial', date: '2024-03-15', file: 'band-group-night.jpg', thumb: 'band-group-night.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
  ],
  videos: [
    { id: 1, title: 'Resistencia — Live Bar El Puente', date: '2024-02-10', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID1', description: 'Presentación completa. Video editado por Andrés.' },
    { id: 2, title: 'Mala Vida — Live Teatro', date: '2023-12-05', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID2', description: 'Grabación del Festival Ska-Punk 2023.' },
    { id: 3, title: 'Ensayo general — Enero 2024', date: '2024-01-15', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID3', description: 'Grabación completa de ensayo para referencia interna.' },
    { id: 4, title: 'Barrio Adentro — Clip estudio', date: '2024-04-20', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID4', description: 'Sesión de grabación en Studio 4 Records.' },
    { id: 5, title: 'Documental — Origen de la banda', date: '2023-10-01', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID5', description: 'Mini-doc de 12 minutos sobre la historia de Malaifama.' },
  ],
  audio: [
    { id: 1, title: 'EP Demo 2024 — Mezcla Master', date: '2024-05-01', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_AUD1', description: 'Archivos WAV de alta calidad. 5 canciones.' },
    { id: 2, title: 'Resistencia — Stems', date: '2024-04-28', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_AUD2', description: 'Pistas individuales para mezcla. Studio 4 Records.' },
    { id: 3, title: 'Maquetas Marzo 2024', date: '2024-03-20', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_AUD3', description: 'Demos de trabajo: 7 canciones en borrador.' },
    { id: 4, title: 'Live — Festival Ska-Punk 2023', date: '2023-12-05', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_AUD4', description: 'Grabación de consola. Audio completo del show.' },
    { id: 5, title: 'Ideas nuevas — Carlos (voz/trompeta)', date: '2024-06-10', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_AUD5', description: 'Notas de voz con ideas para el próximo álbum.' },
  ],
  docs: [
    { id: 1, title: 'Contrato — Festival Ska-Punk CR 2024', date: '2024-05-15', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_DOC1', description: 'Contrato firmado con festival. Rider técnico incluido.' },
    { id: 2, title: 'Rider técnico actualizado', date: '2024-04-01', driveUrl: 'https://docs.google.com/document/d/EJEMPLO_DOC2', description: 'Requerimientos de sonido, luces y camarín.' },
    { id: 3, title: 'Presupuesto EP 2024', date: '2024-03-10', driveUrl: 'https://docs.google.com/spreadsheets/d/EJEMPLO_DOC3', description: 'Desglose de costos de grabación, mezcla y master.' },
    { id: 4, title: 'Bio oficial — Español', date: '2024-02-20', driveUrl: 'https://docs.google.com/document/d/EJEMPLO_DOC4', description: 'Texto de presentación para prensa y festivales.' },
    { id: 5, title: 'Press kit completo', date: '2024-04-10', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_DOC5', description: 'Logo, fotos, bio y links en una carpeta.' },
    { id: 6, title: 'Setlist oficial 2024', date: '2024-05-01', driveUrl: 'https://docs.google.com/document/d/EJEMPLO_DOC6', description: 'Orden de canciones con tiempos y notas de sonido.' },
  ],
};

// ─── AJUSTES POR DEFECTO ────────────────────────────
window.DEFAULT_SETTINGS = {
  bandName:     'Malaifama',
  tagline:      'Ska · Punk · Costa Rica',
  genre:        'Ska-Punk / Costa Rica',
  bio:          'Malaifama es una banda de ska-punk originaria de Costa Rica, nacida de la necesidad de gritar lo que el sistema calla. Nuestra música mezcla la energía cruda del punk con los ritmos sincopados del ska, creando un sonido que invita a bailar y pensar al mismo tiempo.',
  driveRootUrl: '',
};
