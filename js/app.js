/* ====================================================
   MALAIFAMA — App CMS v2.0
   CRUD completo: eventos, canciones, multimedia,
   integrantes, ajustes, export/import.
   ==================================================== */
'use strict';

// ── Estado global ─────────────────────────────────────
const App = {
  currentPage: 'dashboard',
  calView: 'month',
  calDate: new Date(),
  songFilter: 'all',
  mediaTab: 'photos',
  settings: {},
  events: [],
  songs: [],
  members: [],
  media: { photos: [], videos: [], audio: [], docs: [] },
};

// ── Utilidades ────────────────────────────────────────
function esc(s) {
  return (s || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function nextId(arr) {
  return arr.length ? Math.max(0, ...arr.map(x => x.id || 0)) + 1 : 1;
}
function moveItem(arr, id, dir) {
  const idx = arr.findIndex(x => x.id === id);
  if (idx < 0) return arr;
  const to = idx + dir;
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  [copy[idx], copy[to]] = [copy[to], copy[idx]];
  return copy;
}

// ── Persistencia ──────────────────────────────────────
function loadAllData() {
  const def = window.DEFAULT_SETTINGS || {};
  App.settings = tryParse('malaifama_settings', def);
  App.events   = tryParse('malaifama_events',   window.EVENTS  || []);
  App.songs    = tryParse('malaifama_songs',    window.SONGS   || []);
  App.members  = tryParse('malaifama_members',  window.MEMBERS || []);
  App.media    = tryParse('malaifama_media',    window.MEDIA   || { photos:[], videos:[], audio:[], docs:[] });
}
function tryParse(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : (Array.isArray(fallback) ? [...fallback] : {...fallback});
  } catch { return Array.isArray(fallback) ? [...fallback] : {...fallback}; }
}
function saveAll() {
  localStorage.setItem('malaifama_settings', JSON.stringify(App.settings));
  localStorage.setItem('malaifama_events',   JSON.stringify(App.events));
  localStorage.setItem('malaifama_songs',    JSON.stringify(App.songs));
  localStorage.setItem('malaifama_members',  JSON.stringify(App.members));
  localStorage.setItem('malaifama_media',    JSON.stringify(App.media));
}

// ── Export / Import ───────────────────────────────────
function exportData() {
  const payload = {
    version: '2.0', exportDate: new Date().toISOString(),
    settings: App.settings, events: App.events,
    songs: App.songs, members: App.members, media: App.media,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `malaifama-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast('✓ Backup descargado');
}
function importData(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result);
      if (d.settings) App.settings = d.settings;
      if (d.events)   App.events   = d.events;
      if (d.songs)    App.songs    = d.songs;
      if (d.members)  App.members  = d.members;
      if (d.media)    App.media    = d.media;
      saveAll(); applySettings(); navigateTo(App.currentPage);
      closeModal('modal-export'); showToast('✓ Datos importados');
    } catch { showToast('Error al leer el archivo', 'error'); }
  };
  reader.readAsText(file); input.value = '';
}
function resetToDefaults() {
  if (!confirm('¿Restablecer todos los datos a los valores por defecto? Esta acción no se puede deshacer.')) return;
  localStorage.clear(); location.reload();
}
function openExportModal() {
  openModal('modal-export', `
    <p style="color:var(--text-muted);font-size:13px;margin-bottom:20px">
      Exporta todos los datos (canciones, eventos, multimedia, integrantes) a un archivo JSON
      que puedes guardar como respaldo o importar en otro navegador.
    </p>
    <div style="display:flex;flex-direction:column;gap:12px">
      <button class="btn btn-primary" onclick="exportData()">⬇ Descargar backup JSON</button>
      <hr class="divider">
      <div class="form-group">
        <label class="form-label" style="display:block;margin-bottom:6px">Importar desde backup</label>
        <input type="file" accept=".json" class="input" onchange="importData(this)" style="padding:6px">
      </div>
      <hr class="divider">
      <button class="btn btn-danger btn-sm" onclick="resetToDefaults()">↺ Restablecer datos por defecto</button>
    </div>
  `, '💾 Export / Import datos');
}

// ── Ajustes de banda ──────────────────────────────────
function applySettings() {
  const s = App.settings;
  const name = s.bandName || 'Malaifama';
  const tag  = s.tagline  || 'Ska · Punk';
  const el = document.querySelector('.sidebar-brand strong');
  if (el) el.textContent = name;
  const tl = document.querySelector('.sidebar-brand span');
  if (tl) tl.textContent = tag;
  document.title = `${name} — Gestión Interna`;
}
function openSettingsModal() {
  const s = App.settings;
  openModal('modal-settings', `
    <div class="event-form">
      <div class="form-group form-row single"><label class="form-label">Nombre de la banda</label>
        <input class="input" id="st-name" value="${esc(s.bandName||'Malaifama')}"></div>
      <div class="form-group form-row single"><label class="form-label">Eslogan (sidebar)</label>
        <input class="input" id="st-tagline" value="${esc(s.tagline||'Ska · Punk · Costa Rica')}"></div>
      <div class="form-group form-row single"><label class="form-label">Género / País</label>
        <input class="input" id="st-genre" value="${esc(s.genre||'')}"></div>
      <div class="form-group form-row single"><label class="form-label">Biografía</label>
        <textarea class="input" id="st-bio" rows="4">${esc(s.bio||'')}</textarea></div>
      <div class="form-group form-row single"><label class="form-label">URL carpeta Google Drive (raíz)</label>
        <input class="input" id="st-drive" placeholder="https://drive.google.com/drive/folders/..." value="${esc(s.driveRootUrl||'')}"></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
        <button class="btn btn-outline" onclick="closeModal('modal-settings')">Cancelar</button>
        <button class="btn btn-primary" onclick="saveSettings()">💾 Guardar ajustes</button>
      </div>
    </div>
  `, '⚙️ Ajustes de banda');
}
function saveSettings() {
  App.settings = {
    ...App.settings,
    bandName:     document.getElementById('st-name')?.value.trim()    || 'Malaifama',
    tagline:      document.getElementById('st-tagline')?.value.trim() || 'Ska · Punk',
    genre:        document.getElementById('st-genre')?.value.trim()   || '',
    bio:          document.getElementById('st-bio')?.value.trim()     || '',
    driveRootUrl: document.getElementById('st-drive')?.value.trim()  || '',
  };
  saveAll(); applySettings(); closeModal('modal-settings');
  showToast('✓ Ajustes guardados');
}

// ── Router ────────────────────────────────────────────
function navigateTo(page) {
  App.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  const titles = { dashboard:'Dashboard', calendar:'Calendario', songs:'Canciones',
                   media:'Multimedia', search:'Búsqueda', about:'Nosotros' };
  const el = document.getElementById('topbar-title');
  if (el) el.textContent = titles[page] || page;
  if (page === 'dashboard')  renderDashboard();
  if (page === 'calendar')   renderCalendar();
  if (page === 'songs')      renderSongs();
  if (page === 'media')      renderMedia();
  if (page === 'about')      renderAbout();
  closeMobileSidebar();
  history.replaceState(null, '', '#' + page);
  window.scrollTo(0, 0);
}
function openMobileSidebar() {
  document.querySelector('.sidebar')?.classList.add('open');
  document.querySelector('.sidebar-backdrop')?.classList.add('open');
}
function closeMobileSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-backdrop')?.classList.remove('open');
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type==='success'?'✓':'✕'}</span> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Modal ─────────────────────────────────────────────
function openModal(id, content, title = '') {
  const overlay = document.getElementById(id + '-overlay'); if (!overlay) return;
  const h = overlay.querySelector('.modal-header h3');
  if (h && title) h.textContent = title;
  const body = overlay.querySelector('.modal-body');
  if (body) body.innerHTML = content;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const overlay = document.getElementById(id + '-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════
function set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

function renderDashboard() {
  const today = new Date().toISOString().split('T')[0];
  set('stat-songs',      App.songs.filter(s => s.status==='activa').length);
  set('stat-events',     App.events.filter(e => e.date >= today).length);
  set('stat-concerts',   App.events.filter(e => e.type==='concert' && e.date>=today).length);
  set('stat-recordings', App.events.filter(e => e.type==='recording').length);

  const list = document.getElementById('upcoming-list'); if (!list) return;
  const next = App.events.filter(e => e.date >= today)
    .sort((a,b) => a.date.localeCompare(b.date)).slice(0,6);
  const tagCls = t => ({concert:'red',rehearsal:'amber',recording:'purple',meeting:'cyan'}[t]||'muted');
  const typeLabel = t => ({concert:'🎸 Concierto',rehearsal:'🥁 Ensayo',recording:'🎙️ Grabación',meeting:'💬 Reunión'}[t]||t);
  list.innerHTML = next.map(e => {
    const d = new Date(e.date+'T12:00:00');
    return `<div class="event-item type-${e.type}" onclick="openEventDetail(${e.id})">
      <div class="event-date">
        <div class="day">${d.getDate()}</div>
        <div class="month">${d.toLocaleDateString('es',{month:'short'}).toUpperCase()}</div>
      </div>
      <div class="event-info"><h4>${esc(e.title)}</h4><p>${typeLabel(e.type)} · ${e.time||''} · ${esc(e.location||'')}</p></div>
      <span class="tag tag-${tagCls(e.type)}" style="flex-shrink:0">${e.duration||''}</span>
    </div>`;
  }).join('') || '<p class="text-muted text-sm" style="padding:16px">No hay eventos próximos.</p>';
}

// ══════════════════════════════════════════════════════
// CALENDARIO
// ══════════════════════════════════════════════════════
function renderCalendar() {
  document.querySelectorAll('.cal-tab').forEach(t => t.classList.toggle('active', t.dataset.view===App.calView));
  const c = document.getElementById('cal-view-container'); if (!c) return;
  if (App.calView==='month') renderMonthView(c);
  else if (App.calView==='week') renderWeekView(c);
  else renderDayView(c);
  updateCalTitle();
}
function updateCalTitle() {
  const el = document.getElementById('cal-title'); if (!el) return;
  const d = App.calDate;
  if (App.calView==='month')
    el.textContent = d.toLocaleDateString('es-CR',{month:'long',year:'numeric'});
  else if (App.calView==='week') {
    const mon = getWeekStart(d); const sun = new Date(mon); sun.setDate(sun.getDate()+6);
    el.textContent = `${mon.getDate()} – ${sun.getDate()} ${sun.toLocaleDateString('es-CR',{month:'long',year:'numeric'})}`;
  } else {
    el.textContent = d.toLocaleDateString('es-CR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }
}
function getWeekStart(d) {
  const day = d.getDay(); const diff = day===0?-6:1-day;
  const mon = new Date(d); mon.setDate(d.getDate()+diff); return mon;
}
function renderMonthView(container) {
  const year=App.calDate.getFullYear(), month=App.calDate.getMonth();
  const first=new Date(year,month,1), last=new Date(year,month+1,0);
  const today=new Date().toISOString().split('T')[0];
  let dow=first.getDay(); if(dow===0) dow=7; dow--;
  const cells=[];
  for(let i=0;i<dow;i++) cells.push({date:new Date(year,month,1-dow+i),other:true});
  for(let d=1;d<=last.getDate();d++) cells.push({date:new Date(year,month,d),other:false});
  const rem=42-cells.length;
  for(let i=1;i<=rem;i++) cells.push({date:new Date(year,month+1,i),other:true});
  const dows=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  container.innerHTML=`<div class="cal-month">
    <div class="cal-month-header">${dows.map(d=>`<span>${d}</span>`).join('')}</div>
    <div class="cal-month-grid">${cells.map(cell=>{
      const ds=cell.date.toISOString().split('T')[0], isToday=ds===today;
      const ev=App.events.filter(e=>e.date===ds);
      const num=isToday?`<div class="cal-day-num"><span>${cell.date.getDate()}</span></div>`:`<div class="cal-day-num">${cell.date.getDate()}</div>`;
      const chips=ev.slice(0,3).map(e=>`<div class="cal-event-chip chip-${e.type}" onclick="openEventDetail(${e.id});event.stopPropagation();" title="${esc(e.title)}">${esc(e.title)}</div>`).join('');
      const more=ev.length>3?`<div class="cal-event-chip chip-meeting">+${ev.length-3} más</div>`:'';
      return `<div class="cal-day${cell.other?' other-month':''}${isToday?' today':''}" onclick="openAddEventModal('${ds}')">${num}${chips}${more}</div>`;
    }).join('')}</div></div>`;
}
function renderWeekView(container) {
  const mon=getWeekStart(App.calDate), today=new Date().toISOString().split('T')[0];
  const days=[]; for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);days.push(d);}
  const dw=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const hours=[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
  container.innerHTML=`<div class="cal-week" style="overflow-x:auto">
    <div class="cal-week-header"><div></div>${days.map((d,i)=>{
      const ds=d.toISOString().split('T')[0];
      return `<div class="cal-week-header-cell${ds===today?' today-col':''}">
        <div style="font-weight:700;color:${ds===today?'var(--cyan)':'var(--text-hi)'}">${d.getDate()}</div>
        <div>${dw[i]}</div></div>`;
    }).join('')}</div>
    <div class="cal-week-body">${hours.map(h=>`<div class="cal-week-row">
      <div class="cal-week-time">${h}:00</div>
      ${days.map(d=>{
        const ds=d.toISOString().split('T')[0];
        const ev=App.events.filter(e=>e.date===ds&&parseInt((e.time||'0:00').split(':')[0])===h);
        return `<div class="cal-week-cell${ds===today?' today-col':''}">${ev.map(e=>`<div class="cal-event-chip chip-${e.type}" onclick="openEventDetail(${e.id})">${e.time} ${esc(e.title)}</div>`).join('')}</div>`;
      }).join('')}</div>`).join('')}</div></div>`;
}
function renderDayView(container) {
  const ds=App.calDate.toISOString().split('T')[0], today=new Date().toISOString().split('T')[0];
  const ev=App.events.filter(e=>e.date===ds).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const typeIco = t => ({concert:'🎸',rehearsal:'🥁',recording:'🎙️',meeting:'💬'}[t]||'📌');
  container.innerHTML=`<div style="max-width:600px">
    ${ds===today?'<div class="tag tag-cyan" style="margin-bottom:16px">HOY</div>':''}
    ${ev.length===0
      ?`<div class="card p-card" style="padding:32px;text-align:center">
          <div style="font-size:36px;margin-bottom:12px">📅</div>
          <p class="text-muted text-sm">No hay eventos para este día.</p>
          <button class="btn btn-primary" style="margin-top:16px" onclick="openAddEventModal('${ds}')">+ Agregar evento</button></div>`
      :ev.map(e=>`<div class="event-item type-${e.type} card" style="margin-bottom:10px;padding:16px" onclick="openEventDetail(${e.id})">
          <div style="font-size:28px;width:40px;text-align:center">${typeIco(e.type)}</div>
          <div style="flex:1">
            <h4 style="font-size:16px;color:var(--text-hi);margin-bottom:4px">${esc(e.title)}</h4>
            <p style="font-size:13px;color:var(--text-muted)">${e.time||''} · ${e.duration||''} · ${esc(e.location||'')}</p>
            ${e.notes?`<p style="font-size:12px;color:var(--text-muted);margin-top:6px;border-top:1px solid var(--border);padding-top:6px">${esc(e.notes)}</p>`:''}
          </div></div>`).join('')}
    <button class="btn btn-outline" style="margin-top:8px;width:100%" onclick="openAddEventModal('${ds}')">+ Agregar evento este día</button>
  </div>`;
}

// ── Events CRUD ───────────────────────────────────────
function openEventDetail(id) {
  const e=App.events.find(ev=>ev.id===id); if(!e) return;
  const d=new Date(e.date+'T12:00:00');
  const dateStr=d.toLocaleDateString('es-CR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const tagCls={concert:'red',rehearsal:'amber',recording:'purple',meeting:'cyan'}[e.type]||'muted';
  const typeLabel={concert:'🎸 Concierto',rehearsal:'🥁 Ensayo',recording:'🎙️ Grabación',meeting:'💬 Reunión'}[e.type]||e.type;
  openModal('modal-event',`
    <div style="margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">
      <span class="tag tag-${tagCls}">${typeLabel}</span>
      ${e.duration?`<span class="tag tag-muted">⏱ ${e.duration}</span>`:''}
    </div>
    <div class="song-detail-section"><h4>Fecha y hora</h4>
      <p style="font-size:15px;color:var(--text-hi)">${dateStr} · ${e.time||'Sin hora definida'}</p></div>
    ${e.location?`<div class="song-detail-section"><h4>Lugar</h4><p style="color:var(--text-hi)">${esc(e.location)}</p></div>`:''}
    ${e.notes?`<div class="song-detail-section"><h4>Notas</h4><div class="notes-block">${esc(e.notes)}</div></div>`:''}
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
      <button class="btn btn-outline btn-sm" onclick="closeModal('modal-event');openEditEventModal(${e.id})">✏️ Editar</button>
      <button class="btn btn-danger btn-sm" onclick="deleteEvent(${e.id})">🗑 Eliminar</button>
    </div>
  `, esc(e.title));
}
function openAddEventModal(dateStr) { openModal('modal-add-event', buildEventForm(dateStr), '+ Nuevo Evento'); }
function openEditEventModal(id) {
  const e=App.events.find(ev=>ev.id===id); if(!e) return;
  openModal('modal-add-event', buildEventForm(e.date, e), '✏️ Editar evento');
}
function buildEventForm(dateStr='', ev=null) {
  const v=ev||{};
  return `<div class="event-form">
    <div class="form-group form-row single"><label class="form-label">Título *</label>
      <input class="input" id="ef-title" placeholder="Nombre del evento" value="${esc(v.title||'')}"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Tipo</label>
        <select class="input" id="ef-type">
          <option value="rehearsal" ${v.type==='rehearsal'?'selected':''}>🥁 Ensayo</option>
          <option value="concert"   ${v.type==='concert'  ?'selected':''}>🎸 Concierto</option>
          <option value="recording" ${v.type==='recording'?'selected':''}>🎙️ Grabación</option>
          <option value="meeting"   ${v.type==='meeting'  ?'selected':''}>💬 Reunión</option>
        </select></div>
      <div class="form-group"><label class="form-label">Fecha *</label>
        <input class="input" type="date" id="ef-date" value="${dateStr||v.date||''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Hora</label>
        <input class="input" type="time" id="ef-time" value="${v.time||''}"></div>
      <div class="form-group"><label class="form-label">Duración</label>
        <input class="input" id="ef-duration" placeholder="2h, 45min" value="${esc(v.duration||'')}"></div>
    </div>
    <div class="form-group form-row single"><label class="form-label">Lugar</label>
      <input class="input" id="ef-location" placeholder="Lugar o link de reunión" value="${esc(v.location||'')}"></div>
    <div class="form-group form-row single"><label class="form-label">Notas</label>
      <textarea class="input" id="ef-notes" rows="3" placeholder="Instrucciones, recordatorios...">${esc(v.notes||'')}</textarea></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
      <button class="btn btn-outline" onclick="closeModal('modal-add-event')">Cancelar</button>
      <button class="btn btn-primary" onclick="saveEvent(${ev?ev.id:'null'})">💾 Guardar</button>
    </div>
  </div>`;
}
function saveEvent(existingId) {
  const title=document.getElementById('ef-title')?.value.trim();
  const type =document.getElementById('ef-type')?.value;
  const date =document.getElementById('ef-date')?.value;
  const time =document.getElementById('ef-time')?.value;
  const dur  =document.getElementById('ef-duration')?.value.trim();
  const loc  =document.getElementById('ef-location')?.value.trim();
  const notes=document.getElementById('ef-notes')?.value.trim();
  if (!title||!date){showToast('Título y fecha son obligatorios','error');return;}
  const colors={concert:'#e63946',rehearsal:'#f4a261',recording:'#9b59b6',meeting:'#00e5ff'};
  const isNew = !existingId || existingId==='null';
  if (!isNew) {
    const idx=App.events.findIndex(e=>e.id===existingId);
    if(idx!==-1) App.events[idx]={...App.events[idx],title,type,date,time,duration:dur,location:loc,notes,color:colors[type]};
  } else {
    App.events.push({id:nextId(App.events),title,type,date,time,duration:dur,location:loc,notes,color:colors[type]});
  }
  App.events.sort((a,b)=>a.date.localeCompare(b.date));
  saveAll(); closeModal('modal-add-event'); closeModal('modal-event');
  renderCalendar(); renderDashboard();
  showToast(isNew?'✓ Evento creado':'✓ Evento actualizado');
}
function deleteEvent(id) {
  if(!confirm('¿Eliminar este evento?'))return;
  App.events=App.events.filter(e=>e.id!==id);
  saveAll(); closeModal('modal-event'); renderCalendar(); renderDashboard();
  showToast('✓ Evento eliminado');
}
function calPrev() {
  if(App.calView==='month') App.calDate.setMonth(App.calDate.getMonth()-1);
  else if(App.calView==='week') App.calDate.setDate(App.calDate.getDate()-7);
  else App.calDate.setDate(App.calDate.getDate()-1);
  App.calDate=new Date(App.calDate); renderCalendar();
}
function calNext() {
  if(App.calView==='month') App.calDate.setMonth(App.calDate.getMonth()+1);
  else if(App.calView==='week') App.calDate.setDate(App.calDate.getDate()+7);
  else App.calDate.setDate(App.calDate.getDate()+1);
  App.calDate=new Date(App.calDate); renderCalendar();
}
function calToday(){ App.calDate=new Date(); renderCalendar(); }

// ══════════════════════════════════════════════════════
// CANCIONES — CRUD COMPLETO
// ══════════════════════════════════════════════════════
function renderSongs() {
  const filter=App.songFilter;
  const q=(document.getElementById('song-search')?.value||'').toLowerCase();
  let filtered=[...App.songs];
  if(filter!=='all') filtered=filtered.filter(s=>s.status===filter);
  if(q) filtered=filtered.filter(s=>
    s.title.toLowerCase().includes(q)||(s.tags||[]).some(t=>t.includes(q))||(s.key||'').toLowerCase().includes(q));

  const grid=document.getElementById('songs-grid'); if(!grid) return;
  const stTag = s => ({
    'activa':        '<span class="tag tag-green">Activa</span>',
    'en-progreso':   '<span class="tag tag-amber">En progreso</span>',
    'descontinuada': '<span class="tag tag-muted">Descontinuada</span>',
    'nueva':         '<span class="tag tag-cyan">Nueva</span>',
  }[s.status]||'');

  grid.innerHTML=filtered.map(s=>`
    <div class="card card-hover song-card" onclick="openSongDetail(${s.id})">
      <div class="song-card-header">
        <div class="song-title">${esc(s.title)}</div>
        <div class="song-key">${esc(s.key||'—')}</div>
      </div>
      <div class="song-meta">
        ${stTag(s)}
        ${s.bpm?`<span class="tag tag-muted">♩ ${s.bpm} bpm</span>`:''}
        ${s.duration&&s.duration!=='—'?`<span class="tag tag-muted">⏱ ${s.duration}</span>`:''}
        ${(s.tags||[]).map(t=>`<span class="tag tag-muted">${esc(t)}</span>`).join('')}
      </div>
      <p class="song-excerpt text-muted text-sm">${esc(s.notes||(s.lyrics||'').slice(0,120))}</p>
      <div class="card-actions" onclick="event.stopPropagation()">
        <button class="ca-btn" onclick="moveSong(${s.id},-1)" title="Subir">↑</button>
        <button class="ca-btn" onclick="moveSong(${s.id},1)"  title="Bajar">↓</button>
        <button class="ca-btn ca-edit" onclick="openSongForm(${s.id})" title="Editar">✏️</button>
        <button class="ca-btn ca-del"  onclick="deleteSong(${s.id})"   title="Eliminar">🗑</button>
      </div>
    </div>`).join('')||'<p class="text-muted text-sm" style="grid-column:1/-1;padding:32px;text-align:center">No se encontraron canciones.</p>';

  document.querySelectorAll('.filter-chip').forEach(c=>{
    const f=c.dataset.filter;
    const cnt=f==='all'?App.songs.length:App.songs.filter(s=>s.status===f).length;
    const cc=c.querySelector('.fc-count'); if(cc) cc.textContent=` (${cnt})`;
    c.classList.toggle('active',f===filter);
  });
}

function openSongDetail(id) {
  const s=App.songs.find(x=>x.id===id); if(!s) return;
  const stTag = {
    'activa':        '<span class="tag tag-green">Activa</span>',
    'en-progreso':   '<span class="tag tag-amber">En progreso</span>',
    'descontinuada': '<span class="tag tag-muted">Descontinuada</span>',
    'nueva':         '<span class="tag tag-cyan">Nueva</span>',
  }[s.status]||'';
  const links=(s.links||[]).map(l=>`<a href="${esc(l.url)}" target="_blank" class="song-link-btn">${esc(l.label)} ↗</a>`).join('');
  openModal('modal-song',`
    <div class="song-detail-meta">
      ${stTag}
      ${s.key?`<span class="tag tag-amber">🎵 ${esc(s.key)}</span>`:''}
      ${s.bpm?`<span class="tag tag-muted">♩ ${s.bpm} bpm</span>`:''}
      ${s.duration&&s.duration!=='—'?`<span class="tag tag-muted">⏱ ${s.duration}</span>`:''}
      ${(s.tags||[]).map(t=>`<span class="tag tag-muted">${esc(t)}</span>`).join('')}
    </div>
    ${s.notes?`<div class="song-detail-section"><h4>Notas</h4><div class="notes-block">${esc(s.notes)}</div></div>`:''}
    ${s.chords?`<div class="song-detail-section"><h4>Acordes</h4><div class="chords-block">${esc(s.chords)}</div></div>`:''}
    ${s.lyrics?`<div class="song-detail-section"><h4>Letra</h4><div class="lyrics-block">${esc(s.lyrics)}</div></div>`:''}
    ${links?`<div class="song-detail-section"><h4>Archivos y enlaces</h4><div class="song-links">${links}</div></div>`:''}
    <div style="margin-top:12px;display:flex;gap:8px">
      <button class="btn btn-primary btn-sm" onclick="closeModal('modal-song');openSongForm(${s.id})">✏️ Editar</button>
      <button class="btn btn-danger btn-sm" onclick="deleteSong(${s.id})">🗑 Eliminar</button>
    </div>
  `, esc(s.title));
}

function openSongForm(id=null) {
  const isEdit = id !== null && id !== undefined;
  const s = isEdit ? App.songs.find(x=>x.id===id) : null;
  const keys=['Am','Dm','Em','Gm','Bm','Cm','F#m','C#m','A','D','E','G','B','C','F','Bb','Eb','Ab'];
  openModal('modal-song-edit',`
    <div class="event-form">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Título *</label>
          <input class="input" id="sf-title" placeholder="Nombre de la canción" value="${esc(s?.title||'')}"></div>
        <div class="form-group"><label class="form-label">Estado</label>
          <select class="input" id="sf-status">
            <option value="activa"        ${s?.status==='activa'        ?'selected':''}>Activa</option>
            <option value="en-progreso"   ${s?.status==='en-progreso'   ?'selected':''}>En progreso</option>
            <option value="nueva"         ${s?.status==='nueva'         ?'selected':''}>Nueva</option>
            <option value="descontinuada" ${s?.status==='descontinuada' ?'selected':''}>Descontinuada</option>
          </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Tonalidad</label>
          <select class="input" id="sf-key">
            <option value="">Sin definir</option>
            ${keys.map(k=>`<option value="${k}" ${s?.key===k?'selected':''}>${k}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">BPM</label>
          <input class="input" type="number" id="sf-bpm" placeholder="140" value="${s?.bpm||''}"></div>
        <div class="form-group"><label class="form-label">Duración</label>
          <input class="input" id="sf-duration" placeholder="3:24" value="${esc(s?.duration||'')}"></div>
      </div>
      <div class="form-group form-row single"><label class="form-label">Tags (separados por coma)</label>
        <input class="input" id="sf-tags" placeholder="ska, punk, himno, cierre" value="${esc((s?.tags||[]).join(', '))}"></div>
      <div class="form-group form-row single"><label class="form-label">Notas internas</label>
        <textarea class="input" id="sf-notes" rows="2" placeholder="Instrucciones para la banda...">${esc(s?.notes||'')}</textarea></div>
      <div class="song-detail-section"><h4>Acordes</h4>
        <textarea class="input font-mono" id="sf-chords" rows="3" placeholder="Am  F  C  G (× 4)&#10;Verso: Am  F  C  G...">${esc(s?.chords||'')}</textarea></div>
      <div class="song-detail-section"><h4>Letra</h4>
        <textarea class="input" id="sf-lyrics" rows="10" placeholder="[Verso 1]&#10;...">${esc(s?.lyrics||'')}</textarea></div>
      <div class="song-detail-section"><h4>Archivos y enlaces (Google Drive)</h4>
        <div id="sf-links-container" style="display:flex;flex-direction:column;gap:8px;margin-bottom:8px"></div>
        <button class="btn btn-outline btn-sm" onclick="addSongLink()">+ Agregar enlace</button>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
        <button class="btn btn-outline" onclick="closeModal('modal-song-edit')">Cancelar</button>
        <button class="btn btn-primary" onclick="saveSongForm(${isEdit?id:'null'})">💾 Guardar canción</button>
      </div>
    </div>
  `, isEdit?`✏️ Editar: ${esc(s?.title||'')}`: '+ Nueva canción');
  // Populate existing links after modal renders
  setTimeout(()=>(s?.links||[]).forEach(l=>addSongLink(l.label,l.url)),50);
}

function addSongLink(label='', url='') {
  const c=document.getElementById('sf-links-container'); if(!c) return;
  const row=document.createElement('div');
  row.className='sf-link-row';
  row.innerHTML=`
    <input class="input sf-link-label" placeholder="Etiqueta (🎵 Demo)" value="${esc(label)}" style="flex:1;min-width:100px">
    <input class="input sf-link-url" placeholder="URL de Google Drive" value="${esc(url)}" style="flex:2;min-width:140px">
    <button class="btn btn-icon" onclick="this.closest('.sf-link-row').remove()" style="color:var(--red);flex-shrink:0" title="Quitar">✕</button>`;
  c.appendChild(row);
}

function getSongLinks() {
  return Array.from(document.querySelectorAll('.sf-link-row')).map(r=>({
    label: r.querySelector('.sf-link-label')?.value.trim()||'',
    url:   r.querySelector('.sf-link-url')?.value.trim()||'',
  })).filter(l=>l.label||l.url);
}

function saveSongForm(existingId) {
  const title=document.getElementById('sf-title')?.value.trim();
  if(!title){showToast('El título es obligatorio','error');return;}
  const isNew = !existingId || existingId==='null';
  const song={
    id:       isNew ? nextId(App.songs) : Number(existingId),
    title,
    status:   document.getElementById('sf-status')?.value||'nueva',
    key:      document.getElementById('sf-key')?.value||'',
    bpm:      parseInt(document.getElementById('sf-bpm')?.value)||null,
    duration: document.getElementById('sf-duration')?.value.trim()||'',
    tags:     (document.getElementById('sf-tags')?.value||'').split(',').map(t=>t.trim()).filter(Boolean),
    notes:    document.getElementById('sf-notes')?.value.trim()||'',
    chords:   document.getElementById('sf-chords')?.value||'',
    lyrics:   document.getElementById('sf-lyrics')?.value||'',
    links:    getSongLinks(),
  };
  if(isNew) App.songs.push(song);
  else { const idx=App.songs.findIndex(s=>s.id===song.id); if(idx!==-1) App.songs[idx]=song; }
  saveAll(); closeModal('modal-song-edit'); closeModal('modal-song');
  renderSongs(); renderDashboard();
  showToast(isNew?'✓ Canción creada':'✓ Canción actualizada');
}

function deleteSong(id) {
  if(!confirm('¿Eliminar esta canción? No se puede deshacer.'))return;
  App.songs=App.songs.filter(s=>s.id!==id);
  saveAll(); closeModal('modal-song'); renderSongs(); renderDashboard();
  showToast('✓ Canción eliminada');
}
function moveSong(id,dir) { App.songs=moveItem(App.songs,id,dir); saveAll(); renderSongs(); }

// ══════════════════════════════════════════════════════
// MULTIMEDIA — CRUD COMPLETO
// ══════════════════════════════════════════════════════
function renderMedia() {
  const tab=App.mediaTab;
  document.querySelectorAll('.media-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  const container=document.getElementById('media-content'); if(!container) return;
  const items=App.media[tab]||[];
  const icons={photos:'📷',videos:'🎬',audio:'🎵',docs:'📄'};
  const addLabel={photos:'Agregar foto',videos:'Agregar video',audio:'Agregar audio',docs:'Agregar documento'};

  const actBtns = (type,id) => `
    <div style="display:flex;gap:3px" onclick="event.stopPropagation()">
      <button class="ca-btn" onclick="moveMediaItem('${type}',${id},-1)" title="Subir">↑</button>
      <button class="ca-btn" onclick="moveMediaItem('${type}',${id},1)"  title="Bajar">↓</button>
      <button class="ca-btn ca-edit" onclick="openMediaForm('${type}',${id})" title="Editar">✏️</button>
      <button class="ca-btn ca-del"  onclick="deleteMediaItem('${type}',${id})" title="Eliminar">🗑</button>
    </div>`;

  if(tab==='photos') {
    const driveLink = (items[0] && items[0].driveUrl)
      ? '<div style="margin-top:20px;text-align:center"><a href="' + esc(items[0].driveUrl) + '" target="_blank" class="btn btn-outline">📁 Ver todas en Google Drive ↗</a></div>'
      : '';
    container.innerHTML=`
      <div style="margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="openMediaForm('photos')">+ ${addLabel[tab]}</button></div>
      <div class="photo-gallery">
        ${items.map(p=>`<div class="gallery-item" style="position:relative">
          <img src="${esc(p.thumb||p.file||'')}" alt="${esc(p.title)}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div style="display:none;width:100%;height:100%;background:linear-gradient(135deg,#111,#1a1a2e);align-items:center;justify-content:center;font-size:40px">📷</div>
          <div class="gallery-item-overlay"><span>${esc(p.title)}</span></div>
          <div class="media-card-actions">${actBtns('photos',p.id)}</div>
        </div>`).join('')}
      </div>
      ${driveLink}`;
  } else if(tab==='docs') {
    container.innerHTML=`
      <div style="margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="openMediaForm('docs')">+ ${addLabel[tab]}</button></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${items.map(item=>`<div class="card" style="display:flex;align-items:center;gap:16px;padding:16px">
          <div style="font-size:32px;width:44px;text-align:center">${icons[tab]}</div>
          <div style="flex:1">
            <h4 style="font-size:15px;color:var(--text-hi);margin-bottom:3px">${esc(item.title)}</h4>
            <p style="font-size:12px;color:var(--text-muted)">${item.date||''} - ${esc(item.description||'')}</p>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;align-items:center">
            ${actBtns(tab,item.id)}
            ${item.driveUrl?`<a href="${esc(item.driveUrl)}" target="_blank" class="btn btn-outline btn-sm">Abrir</a>`:''}
          </div>
        </div>`).join('')}
      </div>`;
  } else {
    container.innerHTML=`
      <div style="margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="openMediaForm('${tab}')">+ ${addLabel[tab]}</button></div>
      <div class="media-grid">
        ${items.map(item=>`<div class="card media-card">
          <div class="media-thumb"><div class="media-thumb-placeholder">${icons[tab]}</div></div>
          <div class="media-info"><h4>${esc(item.title)}</h4><p>${item.date||''} - ${esc(item.description||'')}</p></div>
          <div class="media-footer">
            ${item.driveUrl?`<a href="${esc(item.driveUrl)}" target="_blank">Ver en Drive</a>`:'<span></span>'}
            ${actBtns(tab,item.id)}
          </div>
        </div>`).join('')}
      </div>`;
  }
}

function openMediaForm(type, id) {
  var idVal = (id !== null && id !== undefined) ? id : null;
  var items = App.media[type] || [];
  var item = idVal !== null ? items.find(function(x){return x.id===idVal;}) : null;
  var typeLabels = {photos:'Foto',videos:'Video',audio:'Audio',docs:'Documento'};
  var label = typeLabels[type] || type;
  var isPhoto = (type === 'photos');
  openModal('modal-media-edit', [
    '<div class="event-form">',
    '<div class="form-group form-row single"><label class="form-label">Titulo *</label>',
    '<input class="input" id="mf-title" placeholder="Titulo del archivo" value="' + esc(item ? item.title : '') + '"></div>',
    '<div class="form-group form-row single"><label class="form-label">Fecha</label>',
    '<input class="input" type="date" id="mf-date" value="' + (item ? (item.date||'') : '') + '"></div>',
    isPhoto ? ('<div class="form-group form-row single"><label class="form-label">Imagen: nombre en assets/images/ o URL</label><input class="input" id="mf-file" placeholder="foto.jpg  o  https://..." value="' + esc(item ? (item.thumb||item.file||'') : '') + '"></div>') : '',
    '<div class="form-group form-row single"><label class="form-label">Link de Google Drive</label>',
    '<input class="input" id="mf-drive" placeholder="https://drive.google.com/file/d/..." value="' + esc(item ? (item.driveUrl||'') : '') + '"></div>',
    '<div class="form-group form-row single"><label class="form-label">Descripcion</label>',
    '<textarea class="input" id="mf-desc" rows="2">' + esc(item ? (item.description||'') : '') + '</textarea></div>',
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">',
    '<button class="btn btn-outline" onclick="closeModal(\'modal-media-edit\')">Cancelar</button>',
    '<button class="btn btn-primary" onclick="saveMediaForm(\'' + type + '\',' + (idVal !== null ? idVal : 'null') + ')">Guardar</button>',
    '</div></div>'
  ].join(''), (idVal !== null ? 'Editar' : 'Nueva') + ' ' + label);
}

function saveMediaForm(type, existingId) {
  var title = (document.getElementById('mf-title') || {}).value;
  if (!title || !title.trim()) { showToast('El titulo es obligatorio', 'error'); return; }
  title = title.trim();
  var isNew = !existingId || existingId === 'null' || existingId === null;
  var items = App.media[type] || [];
  var file = ((document.getElementById('mf-file') || {}).value || '').trim();
  var item = {
    id: isNew ? nextId(items) : Number(existingId),
    title: title,
    date: ((document.getElementById('mf-date') || {}).value || ''),
    driveUrl: ((document.getElementById('mf-drive') || {}).value || '').trim(),
    description: ((document.getElementById('mf-desc') || {}).value || '').trim(),
  };
  if (type === 'photos') { item.file = file; item.thumb = file; }
  if (isNew) { App.media[type] = items.concat([item]); }
  else { App.media[type] = items.map(function(x){return x.id===item.id ? item : x;}); }
  saveAll(); closeModal('modal-media-edit'); renderMedia();
  showToast(isNew ? 'Elemento creado' : 'Elemento actualizado');
}

function deleteMediaItem(type, id) {
  if (!confirm('Eliminar este elemento?')) return;
  App.media[type] = (App.media[type] || []).filter(function(x){return x.id !== id;});
  saveAll(); renderMedia(); showToast('Eliminado');
}

function moveMediaItem(type, id, dir) {
  App.media[type] = moveItem(App.media[type] || [], id, dir);
  saveAll(); renderMedia();
}

// ── INTEGRANTES ───────────────────────────────────────
function renderAbout() {
  var grid = document.getElementById('members-grid');
  if (!grid) return;
  grid.innerHTML = App.members.map(function(m) {
    return '<div class="card member-card" style="position:relative">' +
      '<div class="member-avatar-init">' + esc(m.initials || (m.name||'').slice(0,2) || '??') + '</div>' +
      '<div class="member-name">' + esc(m.name) + '</div>' +
      '<div class="member-role">' + esc(m.role) + '</div>' +
      (m.bio ? '<p style="font-size:12px;color:var(--text-muted);margin-top:8px">' + esc(m.bio) + '</p>' : '') +
      '<div class="card-actions" onclick="event.stopPropagation()">' +
        '<button class="ca-btn" onclick="moveMember(' + m.id + ',-1)">&#8593;</button>' +
        '<button class="ca-btn" onclick="moveMember(' + m.id + ',1)">&#8595;</button>' +
        '<button class="ca-btn ca-edit" onclick="openMemberForm(' + m.id + ')">&#9998;</button>' +
        '<button class="ca-btn ca-del" onclick="deleteMember(' + m.id + ')">&#128465;</button>' +
      '</div>' +
    '</div>';
  }).join('');
  var bioEl = document.getElementById('about-bio');
  if (bioEl && App.settings.bio) bioEl.textContent = App.settings.bio;
}

function openMemberForm(id) {
  var isEdit = (id !== null && id !== undefined);
  var m = isEdit ? App.members.find(function(x){return x.id===id;}) : null;
  openModal('modal-member-edit', [
    '<div class="event-form">',
    '<div class="form-row">',
    '<div class="form-group"><label class="form-label">Nombre *</label>',
    '<input class="input" id="mem-name" value="' + esc(m ? m.name : '') + '"></div>',
    '<div class="form-group"><label class="form-label">Iniciales (2-3)</label>',
    '<input class="input" id="mem-init" maxlength="3" value="' + esc(m ? m.initials : '') + '"></div>',
    '</div>',
    '<div class="form-group form-row single"><label class="form-label">Rol</label>',
    '<input class="input" id="mem-role" value="' + esc(m ? m.role : '') + '"></div>',
    '<div class="form-group form-row single"><label class="form-label">Bio breve</label>',
    '<textarea class="input" id="mem-bio" rows="2">' + esc(m ? (m.bio||'') : '') + '</textarea></div>',
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">',
    '<button class="btn btn-outline" onclick="closeModal(\'modal-member-edit\')">Cancelar</button>',
    '<button class="btn btn-primary" onclick="saveMemberForm(' + (isEdit ? id : 'null') + ')">Guardar</button>',
    '</div></div>'
  ].join(''), isEdit ? 'Editar: ' + esc(m ? m.name : '') : '+ Nuevo integrante');
}

function saveMemberForm(existingId) {
  var name = ((document.getElementById('mem-name') || {}).value || '').trim();
  if (!name) { showToast('El nombre es obligatorio', 'error'); return; }
  var isNew = !existingId || existingId === 'null' || existingId === null;
  var member = {
    id: isNew ? nextId(App.members) : Number(existingId),
    name: name,
    initials: (((document.getElementById('mem-init') || {}).value || '').trim()) || name.slice(0,2).toUpperCase(),
    role: ((document.getElementById('mem-role') || {}).value || '').trim(),
    bio: ((document.getElementById('mem-bio') || {}).value || '').trim(),
  };
  if (isNew) { App.members = App.members.concat([member]); }
  else { App.members = App.members.map(function(x){return x.id===member.id ? member : x;}); }
  saveAll(); closeModal('modal-member-edit'); renderAbout();
  showToast(isNew ? 'Integrante agregado' : 'Integrante actualizado');
}

function deleteMember(id) {
  if (!confirm('Eliminar este integrante?')) return;
  App.members = App.members.filter(function(x){return x.id !== id;});
  saveAll(); renderAbout(); showToast('Integrante eliminado');
}

function moveMember(id, dir) {
  App.members = moveItem(App.members, id, dir);
  saveAll(); renderAbout();
}

// ── BUSQUEDA ──────────────────────────────────────────
function runSearch() {
  var q = ((document.getElementById('search-input') || {}).value || '').toLowerCase().trim();
  var container = document.getElementById('search-results');
  if (!container) return;
  if (!q) {
    container.innerHTML = '<div class="search-empty"><div class="empty-icon">&#128269;</div><p>Escribe para buscar.</p></div>';
    return;
  }
  var songs = App.songs.filter(function(s) {
    return s.title.toLowerCase().includes(q) ||
      (s.lyrics||'').toLowerCase().includes(q) ||
      (s.notes||'').toLowerCase().includes(q) ||
      (s.tags||[]).some(function(t){return t.includes(q);}) ||
      (s.key||'').toLowerCase().includes(q);
  });
  var events = App.events.filter(function(e) {
    return e.title.toLowerCase().includes(q) ||
      (e.location||'').toLowerCase().includes(q) ||
      (e.notes||'').toLowerCase().includes(q) ||
      e.type.includes(q);
  });
  var allMedia = []
    .concat((App.media.photos||[]).map(function(m){return Object.assign({},m,{mt:'photo'});}))
    .concat((App.media.videos||[]).map(function(m){return Object.assign({},m,{mt:'video'});}))
    .concat((App.media.audio||[]).map(function(m){return Object.assign({},m,{mt:'audio'});}))
    .concat((App.media.docs||[]).map(function(m){return Object.assign({},m,{mt:'doc'});}))
    .filter(function(m){return m.title.toLowerCase().includes(q)||(m.description||'').toLowerCase().includes(q);});
  var members = App.members.filter(function(m){
    return m.name.toLowerCase().includes(q)||(m.role||'').toLowerCase().includes(q);
  });
  var total = songs.length + events.length + allMedia.length + members.length;
  if (!total) {
    container.innerHTML = '<div class="search-empty"><div class="empty-icon">&#128533;</div><p>Sin resultados para <strong>' + esc(q) + '</strong></p></div>';
    return;
  }
  var ic = {photo:'&#128247;',video:'&#127916;',audio:'&#127925;',doc:'&#128196;'};
  var evIco = {concert:'&#127928;',rehearsal:'&#129345;',recording:'&#127897;',meeting:'&#128172;'};
  var html = '<p style="font-size:13px;color:var(--text-muted);margin-bottom:20px">' + total + ' resultado(s) para <strong style="color:var(--text-hi)">' + esc(q) + '</strong></p>';
  html += '<div class="search-results-groups">';
  if (songs.length) {
    html += '<div class="search-group"><h3>Canciones</h3>';
    songs.forEach(function(s){
      html += '<div class="search-result-item" onclick="navigateTo(\'songs\');setTimeout(function(){openSongDetail('+s.id+');},150)">';
      html += '<div class="search-result-icon">&#127925;</div>';
      html += '<div class="search-result-main"><h4>' + esc(s.title) + '</h4><p>' + (s.key||'?') + ' - ' + s.status + ' - ' + (s.bpm||'?') + ' bpm</p></div>';
      html += '<span class="tag tag-' + (s.status==='activa'?'green':'muted') + '">' + s.status + '</span></div>';
    });
    html += '</div>';
  }
  if (events.length) {
    html += '<div class="search-group"><h3>Eventos</h3>';
    events.forEach(function(e){
      html += '<div class="search-result-item" onclick="openEventDetail(' + e.id + ')">';
      html += '<div class="search-result-icon">' + (evIco[e.type]||'&#128204;') + '</div>';
      html += '<div class="search-result-main"><h4>' + esc(e.title) + '</h4><p>' + e.date + ' - ' + esc(e.location||'') + '</p></div></div>';
    });
    html += '</div>';
  }
  if (allMedia.length) {
    html += '<div class="search-group"><h3>Archivos</h3>';
    allMedia.forEach(function(m){
      html += '<div class="search-result-item">';
      html += '<div class="search-result-icon">' + (ic[m.mt]||'&#128193;') + '</div>';
      html += '<div class="search-result-main"><h4>' + esc(m.title) + '</h4><p>' + (m.date||'') + ' - ' + esc(m.description||'') + '</p></div>';
      if (m.driveUrl) html += '<a href="' + esc(m.driveUrl) + '" target="_blank" class="btn btn-outline btn-sm" onclick="event.stopPropagation()">Drive</a>';
      html += '</div>';
    });
    html += '</div>';
  }
  if (members.length) {
    html += '<div class="search-group"><h3>Integrantes</h3>';
    members.forEach(function(m){
      html += '<div class="search-result-item" onclick="navigateTo(\'about\')">';
      html += '<div class="search-result-icon" style="font-size:20px;font-weight:700;color:var(--cyan)">' + esc(m.initials) + '</div>';
      html += '<div class="search-result-main"><h4>' + esc(m.name) + '</h4><p>' + esc(m.role) + '</p></div></div>';
    });
    html += '</div>';
  }
  html += '</div>';
  container.innerHTML = html;
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  loadAllData();
  applySettings();

  // Nav links
  document.querySelectorAll('.nav-item[data-page]').forEach(function(item) {
    item.addEventListener('click', function(){navigateTo(item.dataset.page);});
  });

  // Mobile sidebar
  var menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) menuToggle.addEventListener('click', openMobileSidebar);
  var backdrop = document.querySelector('.sidebar-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);
  var sidebarLogo = document.querySelector('.sidebar-logo');
  if (sidebarLogo) sidebarLogo.addEventListener('click', function(){navigateTo('dashboard');});

  // Calendar
  document.querySelectorAll('.cal-tab').forEach(function(t){
    t.addEventListener('click', function(){App.calView=t.dataset.view;renderCalendar();});
  });
  var calPrevBtn = document.getElementById('cal-prev');
  var calNextBtn = document.getElementById('cal-next');
  var calTodayBtn = document.getElementById('cal-today');
  if (calPrevBtn) calPrevBtn.addEventListener('click', calPrev);
  if (calNextBtn) calNextBtn.addEventListener('click', calNext);
  if (calTodayBtn) calTodayBtn.addEventListener('click', calToday);
  var addEventBtn = document.getElementById('btn-add-event');
  if (addEventBtn) addEventBtn.addEventListener('click', function(){openAddEventModal('');});

  // Songs
  document.querySelectorAll('.filter-chip').forEach(function(c){
    c.addEventListener('click', function(){App.songFilter=c.dataset.filter;renderSongs();});
  });
  var songSearch = document.getElementById('song-search');
  if (songSearch) songSearch.addEventListener('input', renderSongs);
  var addSongBtn = document.getElementById('btn-add-song');
  if (addSongBtn) addSongBtn.addEventListener('click', function(){openSongForm(null);});

  // Media tabs
  document.querySelectorAll('.media-tab').forEach(function(t){
    t.addEventListener('click', function(){App.mediaTab=t.dataset.tab;renderMedia();});
  });

  // Topbar search
  var topSearch = document.getElementById('topbar-search-input');
  if (topSearch) topSearch.addEventListener('input', function(e){
    if (e.target.value.trim()) {
      navigateTo('search');
      var si = document.getElementById('search-input');
      if (si) { si.value = e.target.value; runSearch(); }
    }
  });
  var searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', runSearch);

  // Admin buttons
  var settingsBtn = document.getElementById('btn-settings');
  var exportBtn = document.getElementById('btn-export');
  var addMemberBtn = document.getElementById('btn-add-member');
  if (settingsBtn) settingsBtn.addEventListener('click', openSettingsModal);
  if (exportBtn) exportBtn.addEventListener('click', openExportModal);
  if (addMemberBtn) addMemberBtn.addEventListener('click', function(){openMemberForm(null);});

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(function(btn){
    btn.addEventListener('click', function(){
      var ov = btn.closest('.modal-overlay');
      if (ov) { ov.classList.remove('open'); document.body.style.overflow = ''; }
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(function(ov){
    ov.addEventListener('click', function(e){
      if (e.target === ov) { ov.classList.remove('open'); document.body.style.overflow = ''; }
    });
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(function(o){
        o.classList.remove('open'); document.body.style.overflow = '';
      });
    }
  });

  // Initial page
  var hash = window.location.hash.replace('#','') || 'dashboard';
  var valid = ['dashboard','calendar','songs','media','search','about'];
  navigateTo(valid.indexOf(hash) >= 0 ? hash : 'dashboard');
});

// ── Global expose for inline onclick ─────────────────
window.App = App;
window.navigateTo = navigateTo;
window.openEventDetail = openEventDetail;
window.openAddEventModal = openAddEventModal;
window.openEditEventModal = openEditEventModal;
window.saveEvent = saveEvent;
window.deleteEvent = deleteEvent;
window.openSongDetail = openSongDetail;
window.openSongForm = openSongForm;
window.addSongLink = addSongLink;
window.saveSongForm = saveSongForm;
window.deleteSong = deleteSong;
window.moveSong = moveSong;
window.openMediaForm = openMediaForm;
window.saveMediaForm = saveMediaForm;
window.deleteMediaItem = deleteMediaItem;
window.moveMediaItem = moveMediaItem;
window.openMemberForm = openMemberForm;
window.saveMemberForm = saveMemberForm;
window.deleteMember = deleteMember;
window.moveMember = moveMember;
window.openSettingsModal = openSettingsModal;
window.saveSettings = saveSettings;
window.exportData = exportData;
window.importData = importData;
window.openExportModal = openExportModal;
window.resetToDefaults = resetToDefaults;
window.closeModal = closeModal;
window.runSearch = runSearch;
window.renderMedia = renderMedia;
