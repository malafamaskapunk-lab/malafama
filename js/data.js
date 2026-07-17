/* ====================================================
   MALAIFAMA — Datos de muestra
   Edita este archivo para personalizar el contenido.
   ==================================================== */

// ─── INTEGRANTES ────────────────────────────────────
window.MEMBERS = [
  { id: 1, name: 'Marieth Carrillo', role: 'Voz principal', initials: 'MC', img: 'assets/images/member-marieth.jpg' },
  { id: 2, name: 'Emanuel Carrillo', role: 'Guitarra / Coros', initials: 'EC', img: 'assets/images/member-emanuel.jpg' },
  { id: 3, name: 'Carlos Navarro',   role: 'Guitarra / Coros', initials: 'CN', img: 'assets/images/member-carlos.jpg' },
  { id: 4, name: 'Hayen Calderón',   role: 'Bajo / Coros',   initials: 'HC', img: 'assets/images/member-hayen.jpg' },
  { id: 5, name: 'Pablo Calderón',   role: 'Batería / Percusión', initials: 'PC', img: 'assets/images/member-pablo.jpg' },
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
  // Dia calendario LOCAL, no UTC (d.toISOString() corre el dia en zonas al
  // este de UTC) — mismo motivo que localDateStr() en app.js.
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// ─── CANCIONES ──────────────────────────────────────
// status: activa | en-progreso | descontinuada | nueva
window.SONGS = [
  {
    id: 1,
    title: 'Mala Fama',
    key: '', bpm: null,
    status: 'activa',
    duration: '',
    tags: ['ska', 'punk', 'sencillo'],
    notes: 'Primer sencillo de la banda (2026). Habla sobre los estigmas sociales relacionados a este tipo de música, la apariencia y la forma en la que se vive. Grabada en GBH Rekordz (Heredia) con el productor Gilbert Vásquez.',
    lyrics: `(Agregar letra oficial aquí)`,
    chords: `(Agregar acordes aquí)`,
    links: [
      { label: '🎧 Escuchar en Spotify', url: 'https://open.spotify.com/EJEMPLO_MALA_FAMA' },
    ],
    audio: { source: 'none', driveUrl: '', upload: null },
  },
  {
    id: 2,
    title: 'Sentimiento',
    key: '', bpm: null,
    status: 'activa',
    duration: '',
    tags: ['ska', 'punk', 'sencillo', 'emocional'],
    notes: 'Segundo sencillo de la banda (2026). Una canción más emocional sobre cómo se superan momentos oscuros y se transitan esas emociones hasta recuperar el sentimiento de querer volver a vivir. Grabada en GBH Rekordz (Heredia) con el productor Gilbert Vásquez.',
    lyrics: `(Agregar letra oficial aquí)`,
    chords: `(Agregar acordes aquí)`,
    links: [
      { label: '🎧 Escuchar en Spotify', url: 'https://open.spotify.com/EJEMPLO_SENTIMIENTO' },
    ],
    audio: { source: 'none', driveUrl: '', upload: null },
  },
];

// ─── MULTIMEDIA ──────────────────────────────────────
window.MEDIA = {
  photos: [
    { id: 1, title: 'Sesión fotográfica — Vías del tren', date: '2024-03-15', file: 'assets/images/band-rails-wide.jpg', thumb: 'assets/images/band-rails-wide.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 2, title: 'Concierto Bar El Puente', date: '2024-02-10', file: 'assets/images/concert-live-red.jpg', thumb: 'assets/images/concert-live-red.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 3, title: 'Show acústico — Estudio jardín', date: '2023-11-20', file: 'assets/images/concert-bw-indoor.jpg', thumb: 'assets/images/concert-bw-indoor.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 4, title: 'Marieth en escena', date: '2024-04-01', file: 'assets/images/vocalist-stage.jpg', thumb: 'assets/images/vocalist-stage.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 5, title: 'Ensayo en finca — B&W', date: '2024-01-08', file: 'assets/images/rehearsal-bw.jpg', thumb: 'assets/images/rehearsal-bw.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 6, title: 'Foto grupal oficial', date: '2024-03-15', file: 'assets/images/band-group-night.jpg', thumb: 'assets/images/band-group-night.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 7, title: 'Concierto — Luces teal', date: '2024-05-18', file: 'assets/images/concert-teal-wide.jpg', thumb: 'assets/images/concert-teal-wide.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
    { id: 8, title: 'Vías del tren — Contrapicado', date: '2024-03-15', file: 'assets/images/band-tracks-lowangle.jpg', thumb: 'assets/images/band-tracks-lowangle.jpg', driveUrl: 'https://drive.google.com/drive/folders/EJEMPLO_FOTOS' },
  ],
  videos: [
    { id: 1, title: 'Resistencia — Live Bar El Puente', date: '2024-02-10', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID1', description: 'Presentación completa. Video editado por Andrés.' },
    { id: 2, title: 'Mala Vida — Live Teatro', date: '2023-12-05', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID2', description: 'Grabación del Festival Ska-Punk 2023.' },
    { id: 3, title: 'Ensayo general — Enero 2024', date: '2024-01-15', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID3', description: 'Grabación completa de ensayo para referencia interna.' },
    { id: 4, title: 'Barrio Adentro — Clip estudio', date: '2024-04-20', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID4', description: 'Sesión de grabación en Studio 4 Records.' },
    { id: 5, title: 'Documental — Origen de la banda', date: '2023-10-01', driveUrl: 'https://drive.google.com/file/d/EJEMPLO_VID5', description: 'Mini-doc de 12 minutos sobre la historia de Mala Fama.' },
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
  bandName:     'Mala Fama',
  tagline:      'Ska · Punk · Costa Rica',
  genre:        'Ska-Punk / Costa Rica',
  bio:          'Mala Fama es una banda de ska-punk originaria de Frailes de Desamparados, Costa Rica, formada en 2022 y consolidada con su alineación actual en 2023. Es una propuesta liderada por una voz femenina, con canciones que fusionan la energía del ska-punk con matices de reggae roots. Su debut oficial en tarima fue el 9 de agosto de 2025, en Frailes. Sus letras hablan de desamor, luchas contra la depresión y esos momentos de chivo que todos hemos vivido: cervezas, amigos y música — letras sencillas y directas, pensadas para conectar con experiencias comunes.',
  driveRootUrl: 'https://drive.google.com/drive/folders/1D2fbKO_snnfnpa1aW1usP0eWDx34tG78?usp=drive_link',
};
