/* ============================================================
   CASO CERRADO · script.js
   Toda la lógica. Sin dependencias externas. Funciona offline.
   ============================================================ */
'use strict';

/* ───────── ESTADO ───────── */
const KEY = 'casocerrado_v1';
let P = cargar();

function nuevo(){
  return { nombre:'', clase:'', respondidas:0, aciertos:0, errores:0,
           falladas:{}, dominadas:{}, versiculos:{}, examen:null, sesion:null };
}
function cargar(){
  try{ const d = JSON.parse(localStorage.getItem(KEY)); return d ? Object.assign(nuevo(), d) : nuevo(); }
  catch(e){ return nuevo(); }
}
function guardar(){
  P.sesion = new Date().toISOString();
  try{ localStorage.setItem(KEY, JSON.stringify(P)); }catch(e){}
}

/* ───────── NAVEGACIÓN ───────── */
function ir(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  window.scrollTo(0,0);
  document.getElementById('tabbar').style.display = (id==='s-perfil') ? 'none' : 'flex';
}
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove('show'), 1900);
}
const esc = s => String(s).replace(/[&<>"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const barra = (t,extra='') => `<div class="bar">
  <button class="back" onclick="ir('s-inicio')" aria-label="Volver"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
  <h2>${esc(t)}</h2>${extra?`<span class="cnt">${esc(extra)}</span>`:''}</div>`;
const mezclar = a => { const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[b[i],b[j]]=[b[j],b[i]];} return b; };

/* ───────── PERFIL Y PROGRESO ───────── */
function guardarPerfil(){
  const n = document.getElementById('in-nombre').value.trim();
  if(!n){ toast('Escribe tu nombre'); return; }
  P.nombre = n; P.clase = document.getElementById('in-clase').value;
  guardar(); pintarInicio(); ir('s-inicio');
}
function nivelDe(pct){
  if(pct>=90) return 'Perito';
  if(pct>=75) return 'Investigador';
  if(pct>=55) return 'Analista';
  if(pct>=30) return 'Aprendiz';
  return 'Recluta';
}
function pctDominio(){
  const dom = Object.keys(P.dominadas).length;
  return Math.min(100, Math.round(dom / PREGUNTAS.length * 100));
}
function pintarInicio(){
  document.getElementById('lbl-nombre').textContent = P.nombre || 'Conquistador';
  const pct = pctDominio();
  document.getElementById('st-dom').textContent = pct + '%';
  document.getElementById('st-resp').textContent = P.respondidas;
  document.getElementById('st-ok').textContent = P.aciertos;
  document.getElementById('st-err').textContent = P.errores;
  document.getElementById('nivel-fill').style.width = pct + '%';
  document.getElementById('lbl-nivel').textContent = nivelDe(pct);
}
function borrarProgreso(){
  if(!confirm('¿Borrar todo tu progreso? No se puede deshacer.')) return;
  P = nuevo(); guardar(); pintarInicio(); toast('Progreso borrado'); ir('s-perfil');
}

/* ───────── REGISTRO DE RESPUESTAS ───────── */
function registrar(id, ok){
  P.respondidas++;
  if(ok){
    P.aciertos++;
    const n = (P.falladas[id]||0) - 1;
    if(n<=0){ delete P.falladas[id]; P.dominadas[id] = (P.dominadas[id]||0)+1; }
    else P.falladas[id] = n;
  } else {
    P.errores++;
    P.falladas[id] = (P.falladas[id]||0) + 2;   // lo fallado vuelve con más peso
    delete P.dominadas[id];
  }
  guardar(); pintarInicio();
}
/* Repetición inteligente: más peso a lo fallado, menos a lo dominado */
function peso(q){
  let w = 1;
  if(P.falladas[q.id]) w += P.falladas[q.id] * 3;
  if(P.dominadas[q.id]) w = Math.max(0.15, w - P.dominadas[q.id]*0.4);
  return w;
}
function elegir(pool, n){
  const c = pool.slice(); const out = [];
  while(out.length < n && c.length){
    const tot = c.reduce((s,q)=>s+peso(q),0);
    let r = Math.random()*tot, i = 0;
    while(i<c.length-1 && (r -= peso(c[i])) > 0) i++;
    out.push(c.splice(i,1)[0]);
  }
  return out;
}

/* ───────── ENTRENAMIENTO RÁPIDO ───────── */
const PLANES = {
  5:{t:'5 MINUTOS',d:'Lo esencial y nada más',pasos:['Memoria prioritaria','Los 9 versículos clave','10 preguntas de lo que fallas']},
  10:{t:'10 MINUTOS',d:'Esencial + práctica',pasos:['Memoria prioritaria','Versículos','15 flashcards','10 preguntas']},
  15:{t:'15 MINUTOS',d:'Estudio con corrección',pasos:['Los 8 módulos','Versículos','20 flashcards','15 preguntas','Repaso de errores']},
  30:{t:'30 MINUTOS',d:'Entrenamiento completo',pasos:['Los 8 módulos','Versículos','Flashcards','Quiz de 20','Casos prácticos','Repaso de errores']}
};
function abrirRapido(){
  let h = barra('Entrenamiento rápido');
  h += '<p class="lead">¿Cuánto tiempo tienes? Yo escojo qué estudiar.</p>';
  for(const m of [5,10,15,30]){
    const p = PLANES[m];
    h += `<button class="btn destacado" onclick="plan(${m})">
      <span class="btn-t">${p.t}</span><span class="btn-s">${p.d}</span></button>`;
  }
  document.getElementById('c-rapido').innerHTML = h; ir('s-rapido');
}
function plan(m){
  const p = PLANES[m];
  let h = barra(p.t);
  h += '<div class="card acc"><p class="lead" style="margin:0 0 10px"><strong>Tu plan:</strong></p>';
  p.pasos.forEach((s,i)=> h += `<div class="rep-line"><span class="k">PASO ${i+1}</span><span class="v">${esc(s)}</span></div>`);
  h += '</div>';
  h += `<button class="btn primary big" onclick="abrirMemoria()">EMPEZAR POR MEMORIA PRIORITARIA</button>`;
  h += `<button class="btn examen" onclick="abrirVersiculos()"><span class="btn-t">Versículos</span></button>`;
  h += `<button class="btn examen" onclick="abrirFlash()"><span class="btn-t">Flashcards</span></button>`;
  const n = m<=5?10:(m<=10?10:(m<=15?15:20));
  h += `<button class="btn examen" onclick="iniciarQuiz('mixto',${n})"><span class="btn-t">Quiz de ${n} preguntas</span></button>`;
  if(m>=15) h += `<button class="btn oro" onclick="abrirErrores()"><span class="btn-t">REPASAR MIS ERRORES</span><span class="btn-s">Lo que más rinde</span></button>`;
  document.getElementById('c-rapido').innerHTML = h; ir('s-rapido');
}

/* ───────── ESTUDIAR ───────── */
function abrirEstudiar(){
  let h = barra('Estudiar', MODULOS.length + ' módulos');
  MODULOS.forEach((m,i)=>{
    h += `<div class="mod">
      <span class="chip">MÓDULO ${i+1}</span>
      <h3>${esc(m.titulo)}</h3>
      <p>${esc(m.explicacion)}</p>
      <div class="rec"><strong>Recuerda:</strong> ${esc(m.recordar)}</div>
      <div class="kv" style="font-size:12px;color:#B0B0B0;margin-bottom:10px">${esc(m.versiculo)}</div>
      <button class="btn ghost small" onclick="toggleR('r${i}')">Práctica: ${esc(m.practica)}</button>
      <div class="hidden-a" id="r${i}">${esc(m.respuesta)}</div>
    </div>`;
  });
  document.getElementById('c-lista').innerHTML = h; ir('s-lista');
}
function toggleR(id){ document.getElementById(id).classList.toggle('show'); }

/* ───────── MEMORIA PRIORITARIA ───────── */
function abrirMemoria(){
  let h = barra('Memoria prioritaria', MEMORIA.length + ' claves');
  h += '<p class="lead">Tapa la derecha con el dedo y ve diciéndolas.</p>';
  MEMORIA.forEach(m=>{
    h += `<div class="mem"><div class="c">${esc(m.c)}</div>
      <div class="r"><b>${esc(m.r)}</b><i>${esc(m.v)}</i></div></div>`;
  });
  document.getElementById('c-lista').innerHTML = h; ir('s-lista');
}

/* ───────── VERSÍCULOS ───────── */
function abrirVersiculos(){
  const ETQ = ['NO DOMINADO','EN PROCESO','MEMORIZADO'];
  let h = barra('Arsenal de versículos', VERSICULOS.length + '');
  VERSICULOS.forEach(v=>{
    const e = P.versiculos[v.id] ?? 0;
    h += `<div class="vers">
      <div class="ref">${esc(v.ref)}</div>
      <div class="txt">${esc(v.texto)}</div>
      <div class="clave">${esc(v.clave)}</div>
      <div class="kv"><b>Idea:</b> ${esc(v.idea)}</div>
      <div class="kv"><b>Demuestra:</b> ${esc(v.demuestra)}</div>
      <div class="kv"><b>Te preguntan:</b> ${esc(v.pregunta)}</div>
      <div class="estados">
        ${ETQ.map((t,i)=>`<button data-e="${i}" class="${e===i?'on':''}" onclick="marcarV('${v.id}',${i})">${t}</button>`).join('')}
      </div></div>`;
  });
  document.getElementById('c-lista').innerHTML = h; ir('s-lista');
}
function marcarV(id, e){ P.versiculos[id] = e; guardar(); abrirVersiculos(); toast('Guardado'); }

/* ───────── FLASHCARDS ───────── */
let FL = { lista:[], i:0, rev:false };
function abrirFlash(){
  FL = { lista: elegir(PREGUNTAS, Math.min(25, PREGUNTAS.length)), i:0, rev:false };
  pintarFlash();
}
function pintarFlash(){
  if(FL.i >= FL.lista.length){ return finFlash(); }
  const q = FL.lista[FL.i];
  const resp = q.type==='mc' ? q.opts[q.a] : (q.type==='vf' ? (q.a?'VERDADERO':'FALSO') : q.a);
  let h = barra('Flashcards', (FL.i+1)+' de '+FL.lista.length);
  h += `<div class="progbar"><div class="progfill" style="width:${(FL.i)/FL.lista.length*100}%"></div></div>`;
  h += `<div class="flash" onclick="revelar()">
    <div class="q">${esc(q.q)}</div>
    ${FL.rev ? `<div class="a">${esc(resp)}</div><div class="v">${esc(q.verse)}</div>` :
               `<div class="hint">TOCA PARA REVELAR</div>`}
  </div>`;
  if(FL.rev){
    h += `<div class="dosbtn">
      <button class="bad-b" onclick="calif(false)">NO LO SÉ</button>
      <button class="ok-b" onclick="calif(true)">LO SÉ</button></div>`;
  }
  document.getElementById('c-lista').innerHTML = h; ir('s-lista');
}
function revelar(){ if(!FL.rev){ FL.rev = true; pintarFlash(); } }
function calif(ok){ registrar(FL.lista[FL.i].id, ok); FL.i++; FL.rev=false; pintarFlash(); }
function finFlash(){
  let h = barra('Flashcards');
  h += `<div class="score"><div class="pct">${FL.lista.length}</div><div class="lbl2">TARJETAS REPASADAS</div></div>`;
  h += `<button class="btn primary big" onclick="abrirFlash()">OTRA RONDA</button>`;
  h += `<button class="btn examen" onclick="abrirErrores()"><span class="btn-t">Ver mis errores</span></button>`;
  document.getElementById('c-lista').innerHTML = h;
}

/* ───────── QUIZ ───────── */
let Q = null;
function menuQuiz(){
  let h = barra('Quiz');
  const modos = [
    ['rapido','QUIZ RÁPIDO','10 preguntas, cualquier nivel'],
    ['normal','QUIZ NORMAL','20 preguntas equilibradas'],
    ['dificil','QUIZ DIFÍCIL','Solo nivel 3 y 4'],
    ['capcioso','QUIZ CAPCIOSO','Las que más confunden']
  ];
  modos.forEach(([m,t,d])=> h += `<button class="btn destacado" onclick="iniciarQuiz('${m}')">
    <span class="btn-t">${t}</span><span class="btn-s">${d}</span></button>`);
  document.getElementById('s-quizmenu').innerHTML = h; ir('s-quizmenu');
}
function poolPor(modo){
  if(modo==='dificil')  return PREGUNTAS.filter(q=>q.difficulty>=3);
  if(modo==='capcioso') return PREGUNTAS.filter(q=>q.difficulty===4);
  return PREGUNTAS;
}
function iniciarQuiz(modo, n){
  const pool = poolPor(modo);
  const total = n || (modo==='rapido'?10:(modo==='dificil'||modo==='capcioso'? Math.min(15,pool.length) :20));
  Q = { lista: elegir(pool, Math.min(total,pool.length)), i:0, ok:0, err:0, racha:0, mejor:0,
        modo, titulo:'Quiz', mostrarAlFinal:false, fallos:[] };
  pintarQuiz();
}
function pintarQuiz(){
  if(Q.i >= Q.lista.length) return finQuiz();
  const q = Q.lista[Q.i];
  let h = barra(Q.titulo, (Q.i+1)+' / '+Q.lista.length);
  h += `<div class="progbar"><div class="progfill" style="width:${Q.i/Q.lista.length*100}%"></div></div>`;
  if(!Q.mostrarAlFinal)
    h += `<div class="hud"><span>Aciertos <b>${Q.ok}</b></span><span>Errores <b>${Q.err}</b></span><span>Racha <b>${Q.racha}</b></span></div>`;
  h += `<div class="q-txt">${esc(q.q)}</div><div class="opts" id="opts">`;
  if(q.type==='vf'){
    h += `<button class="opt" onclick="responder(1)"><span class="l">V</span>VERDADERO</button>
          <button class="opt" onclick="responder(0)"><span class="l">F</span>FALSO</button>`;
  } else if(q.type==='mc'){
    if(!q._ord) q._ord = mezclar(q.opts.map((o,i)=>i));
    q._ord.forEach((oi,j)=> h += `<button class="opt" onclick="responder(${oi})">
      <span class="l">${'ABCD'[j]}</span>${esc(q.opts[oi])}</button>`);
  } else {
    h += `<textarea id="ta" placeholder="Escribe tu respuesta…"></textarea>
          <button class="btn primary" style="margin-top:10px" onclick="responderTexto()">RESPONDER</button>`;
  }
  h += '</div><div id="fb"></div>';
  document.getElementById('c-quiz').innerHTML = h; ir('s-quiz');
}
function responder(v){
  const q = Q.lista[Q.i];
  const ok = q.type==='vf' ? (!!v === q.a) : (v === q.a);
  cerrarPregunta(ok, v);
}
/* Modo jurado / preguntas abiertas: comparación por palabras clave */
function normalizar(s){
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\s]/g,' ');
}
function evaluarTexto(txt, q){
  const t = normalizar(txt);
  if(t.trim().length < 2) return false;
  const kw = (q.keywords||[]).map(normalizar).filter(Boolean);
  if(!kw.length) return t.trim().length > 8;
  const hit = kw.filter(k=> t.includes(k)).length;
  // El guardián solo aplica a preguntas de sí/no: cuando la respuesta esperada
  // EMPIEZA por una negación. Así no se rechazan respuestas correctas afirmativas.
  const arrancaNeg = /^\s*(no|nada|nunca|ninguno?)\b/.test(normalizar(q.a||''));
  const diceNeg = /\bno\b|\bnunca\b|\bnada\b|\bningun/.test(t);
  const diceSi = /\bsi\b|\bclaro\b|\bpuede\b/.test(t);
  if(arrancaNeg && diceSi && !diceNeg) return false;       // dijo lo contrario
  if(arrancaNeg && !diceNeg && hit < kw.length) return false;
  return hit >= Math.ceil(kw.length * 0.5);
}
function responderTexto(){
  const q = Q.lista[Q.i];
  const txt = document.getElementById('ta').value;
  cerrarPregunta(evaluarTexto(txt, q), null, txt);
}
function cerrarPregunta(ok, v, txt){
  const q = Q.lista[Q.i];
  registrar(q.id, ok);
  if(ok){ Q.ok++; Q.racha++; Q.mejor = Math.max(Q.mejor, Q.racha); }
  else  { Q.err++; Q.racha = 0; Q.fallos.push(q); }
  document.querySelectorAll('#opts .opt').forEach((b,j)=>{
    b.disabled = true;
    if(q.type==='vf'){ if((j===0)===!!q.a) b.classList.add('correcta'); else if(v!==null && (j===0)===!!v) b.classList.add('mala'); }
    else if(q.type==='mc'){ const oi = q._ord[j];
      if(oi===q.a) b.classList.add('correcta'); else if(oi===v) b.classList.add('mala'); }
  });
  const ta = document.getElementById('ta'); if(ta) ta.disabled = true;
  const resp = q.type==='mc' ? q.opts[q.a] : (q.type==='vf' ? (q.a?'VERDADERO':'FALSO') : q.a);
  document.getElementById('fb').innerHTML = `
    <div class="feedback ${ok?'ok':'bad'}">
      <div class="verdicto">${ok?'CORRECTO':'INCORRECTO'}</div>
      ${ok?'':`<div style="margin-bottom:6px"><strong>Respuesta:</strong> ${esc(resp)}</div>`}
      <div>${esc(q.exp)}</div>
      <div class="ref">${esc(q.verse)}</div>
    </div>
    <button class="btn primary big" onclick="siguiente()">CONTINUAR</button>`;
  document.getElementById('fb').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function siguiente(){ Q.i++; pintarQuiz(); }
function finQuiz(){
  const tot = Q.lista.length, pct = tot? Math.round(Q.ok/tot*100):0;
  let h = barra(Q.titulo);
  h += `<div class="score"><div class="pct">${pct}%</div><div class="lbl2">PRECISIÓN</div>
        <div class="nivel">${nivelDe(pct)}</div></div>`;
  h += `<div class="resumen">
    <div><b style="color:#2E9E5B">${Q.ok}</b><span>Aciertos</span></div>
    <div><b style="color:#D9453C">${Q.err}</b><span>Errores</span></div>
    <div><b style="color:#FFC107">${Q.mejor}</b><span>Mejor racha</span></div>
    <div><b>${tot}</b><span>Preguntas</span></div></div>`;
  if(Q.fallos.length){
    h += '<div class="rep-h">LO QUE DEBES REPASAR</div>';
    Q.fallos.forEach(q=> h += `<div class="caso"><div class="sit">${esc(q.q)}</div>
      <div style="font-size:13.5px"><strong>${esc(q.type==='mc'?q.opts[q.a]:(q.type==='vf'?(q.a?'VERDADERO':'FALSO'):q.a))}</strong></div>
      <div class="ref" style="font-size:12px;color:#B0B0B0;margin-top:5px">${esc(q.verse)}</div></div>`);
  } else {
    h += '<div class="card acc"><p style="margin:0">Sin errores en esta ronda. Sube la dificultad.</p></div>';
  }
  h += `<button class="btn primary big" onclick="iniciarQuiz('${Q.modo}')">OTRA RONDA</button>`;
  h += `<button class="btn examen" onclick="abrirErrores()"><span class="btn-t">Entrenar mis errores</span></button>`;
  document.getElementById('c-result').innerHTML = h; ir('s-result');
}

/* ───────── SIMULACRO, JURADO, EXAMEN, GRUPO ───────── */
function iniciarSimulacro(){
  Q = { lista: elegir(PREGUNTAS, 15), i:0, ok:0, err:0, racha:0, mejor:0,
        modo:'simulacro', titulo:'Caso Cerrado', mostrarAlFinal:false, fallos:[] };
  pintarQuiz();
}
function iniciarJurado(){
  const abiertas = PREGUNTAS.filter(q=>q.type==='open');
  Q = { lista: elegir(abiertas, Math.min(12,abiertas.length)), i:0, ok:0, err:0, racha:0, mejor:0,
        modo:'jurado', titulo:'Modo Jurado', mostrarAlFinal:false, fallos:[] };
  pintarQuiz();
}
function iniciarExamen(){
  Q = { lista: mezclar(PREGUNTAS).slice(0,50), i:0, ok:0, err:0, racha:0, mejor:0,
        modo:'examen', titulo:'Examen final', mostrarAlFinal:true, fallos:[] };
  pintarQuiz();
}
function iniciarGrupo(){
  Q = { lista: mezclar(PREGUNTAS).slice(0,20), i:0, ok:0, err:0, racha:0, mejor:0,
        modo:'grupo', titulo:'Reto en grupo', mostrarAlFinal:false, fallos:[] };
  toast('Pasa el teléfono entre ustedes');
  pintarQuiz();
}

/* ───────── DESAFÍO 5 SEGUNDOS ───────── */
let S5 = null;
function iniciar5s(){
  S5 = { lista: elegir(PREGUNTAS.filter(q=>q.type!=='open'), 12), i:0, ok:0, err:0, t:null };
  pintar5s();
}
function pintar5s(){
  if(S5.t) clearInterval(S5.t);
  if(S5.i >= S5.lista.length) return fin5s();
  const q = S5.lista[S5.i];
  let seg = 5;
  let h = barra('Desafío 5 segundos', (S5.i+1)+' / '+S5.lista.length);
  h += `<div class="timer" id="tmr">5</div>`;
  h += `<div class="q-txt">${esc(q.q)}</div><div class="opts" id="opts">`;
  if(q.type==='vf'){
    h += `<button class="opt" onclick="resp5(1)"><span class="l">V</span>VERDADERO</button>
          <button class="opt" onclick="resp5(0)"><span class="l">F</span>FALSO</button>`;
  } else {
    if(!q._o5) q._o5 = mezclar(q.opts.map((o,i)=>i));
    q._o5.forEach((oi,j)=> h += `<button class="opt" onclick="resp5(${oi})">
      <span class="l">${'ABCD'[j]}</span>${esc(q.opts[oi])}</button>`);
  }
  h += '</div><div id="fb"></div>';
  document.getElementById('c-quiz').innerHTML = h; ir('s-quiz');
  S5.t = setInterval(()=>{
    seg--;
    const e = document.getElementById('tmr');
    if(!e){ clearInterval(S5.t); return; }
    e.textContent = seg;
    if(seg<=2) e.classList.add('alerta');
    if(seg<=0){ clearInterval(S5.t); resp5(-1); }
  },1000);
}
function resp5(v){
  if(S5.t) clearInterval(S5.t);
  const q = S5.lista[S5.i];
  const ok = v===-1 ? false : (q.type==='vf' ? (!!v===q.a) : (v===q.a));
  registrar(q.id, ok);
  ok ? S5.ok++ : S5.err++;
  document.querySelectorAll('#opts .opt').forEach(b=> b.disabled = true);
  const resp = q.type==='mc' ? q.opts[q.a] : (q.a?'VERDADERO':'FALSO');
  document.getElementById('fb').innerHTML = `
    <div class="feedback ${ok?'ok':'bad'}">
      <div class="verdicto">${v===-1?'SE ACABÓ EL TIEMPO':(ok?'CORRECTO':'INCORRECTO')}</div>
      <div><strong>${esc(resp)}</strong></div>
      <div style="margin-top:5px">${esc(q.exp)}</div>
      <div class="ref">${esc(q.verse)}</div></div>
    <button class="btn primary big" onclick="S5.i++;pintar5s()">SIGUIENTE</button>`;
}
function fin5s(){
  const pct = Math.round(S5.ok/S5.lista.length*100);
  let h = barra('Desafío 5 segundos');
  h += `<div class="score"><div class="pct">${pct}%</div><div class="lbl2">BAJO PRESIÓN</div></div>`;
  h += `<div class="resumen"><div><b style="color:#2E9E5B">${S5.ok}</b><span>Aciertos</span></div>
        <div><b style="color:#D9453C">${S5.err}</b><span>Errores</span></div></div>`;
  h += `<button class="btn primary big" onclick="iniciar5s()">OTRA RONDA</button>`;
  document.getElementById('c-result').innerHTML = h; ir('s-result');
}

/* ───────── CASOS, CONFUSIONES, ERRORES, REPASO ───────── */
function abrirCasos(){
  let h = barra('Casos prácticos', CASOS.length+'');
  h += '<p class="lead">Responde en voz alta antes de abrir la respuesta.</p>';
  CASOS.forEach((c,i)=>{
    h += `<div class="caso"><div class="num">CASO ${i+1}</div>
      <div class="sit">${esc(c.s)}</div>
      <button class="btn ghost small" onclick="toggleR('c${i}')">Ver cómo responder</button>
      <div class="hidden-a" id="c${i}">${esc(c.r)}<div class="ref" style="margin-top:7px;font-size:12px;color:#B0B0B0">${esc(c.v)}</div></div>
    </div>`;
  });
  document.getElementById('c-lista').innerHTML = h; ir('s-lista');
}
function abrirConfusiones(){
  let h = barra('No te dejes confundir');
  CONFUSIONES.forEach(c=>{
    h += `<div class="conf"><div class="par">
      <span class="p1">${esc(c.a)}</span><span class="x">≠</span><span class="p2">${esc(c.b)}</span></div>
      <p style="margin:0;font-size:14px;color:#ddd">${esc(c.exp)}</p></div>`;
  });
  document.getElementById('c-lista').innerHTML = h; ir('s-lista');
}
function abrirErrores(){
  const ids = Object.keys(P.falladas).map(Number);
  const fall = PREGUNTAS.filter(q=> ids.includes(q.id));
  let h = barra('Mis errores', fall.length+'');
  if(!fall.length){
    h += `<div class="vacio"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>
      <p>Todavía no has fallado nada.<br>Haz un quiz y vuelve aquí.</p></div>`;
  } else {
    h += `<button class="btn oro" onclick="entrenarErrores()"><span class="btn-t">ENTRENAR MIS ERRORES</span>
      <span class="btn-s">${fall.length} preguntas falladas</span></button>`;
    fall.forEach(q=>{
      const resp = q.type==='mc'?q.opts[q.a]:(q.type==='vf'?(q.a?'VERDADERO':'FALSO'):q.a);
      h += `<div class="caso"><div class="sit">${esc(q.q)}</div>
        <div style="font-size:14px"><strong style="color:#FFC107">${esc(resp)}</strong></div>
        <div style="font-size:13px;color:#ccc;margin-top:6px">${esc(q.exp)}</div>
        <div style="font-size:12px;color:#B0B0B0;margin-top:5px">${esc(q.verse)}</div></div>`;
    });
  }
  document.getElementById('c-lista').innerHTML = h; ir('s-lista');
}
function entrenarErrores(){
  const ids = Object.keys(P.falladas).map(Number);
  const fall = PREGUNTAS.filter(q=> ids.includes(q.id));
  if(!fall.length){ toast('No tienes errores'); return; }
  Q = { lista: mezclar(fall), i:0, ok:0, err:0, racha:0, mejor:0,
        modo:'errores', titulo:'Mis errores', mostrarAlFinal:false, fallos:[] };
  pintarQuiz();
}
function abrirRepaso(){
  let h = barra('Repaso 10 minutos antes');
  h += '<div class="rep-h">LA CADENA COMPLETA</div>';
  h += `<div class="cadena">Polvo + aliento = alma viviente → unidad indivisible → pecado → muerte →
    los muertos nada saben → prohibido consultarlos → Saúl lo hizo porque Dios no le respondió →
    lo que aparece es Satanás disfrazado.</div>`;
  h += '<div class="rep-h">LOS VERSÍCULOS</div>';
  [['Gén. 2:7','Y fue el hombre un alma viviente'],
   ['Eze. 18:4','El alma que pecare, esa morirá'],
   ['Ecl. 9:2','Un mismo suceso ocurre al justo y al impío'],
   ['Ecl. 9:4','Mejor es perro vivo que león muerto'],
   ['Ecl. 9:5,6','Nada saben · memoria en olvido · amor y odio fenecieron'],
   ['Lev. 20:27','Quien evoque espíritus de muertos ha de morir'],
   ['1 Sam. 28:6','Ni por sueños, ni por Urim, ni por profetas'],
   ['2 Cor. 11:14','Satanás se disfraza como ángel de luz']]
  .forEach(([k,v])=> h += `<div class="rep-line"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`);
  h += '<div class="rep-h">LOS 5 ERRORES QUE NO DEBO COMETER</div>';
  ['Decir que Saúl habló con Samuel. NO: fue donde una mujer con espíritu de adivinación.',
   'Decir que el alma es inmortal. NO: el alma que pecare, esa morirá.',
   'Decir que hay esperanza para los muertos. NO: la esperanza es para los vivos.',
   'Inventar el nombre de la mujer de Endor. La Biblia no lo da.',
   'Agregar cosas que el material no dice. Si no está, dilo.']
  .forEach((t,i)=> h += `<div class="nono"><b>${i+1}.</b> ${esc(t)}</div>`);
  h += '<div class="rep-h">SI TE BLOQUEAS</div>';
  h += `<div class="cadena" style="border-color:#6A1B9A">Vuelve siempre a la misma frase:
    <strong style="color:#FFC107">LOS MUERTOS NADA SABEN</strong>.
    De ahí sale la respuesta de casi todo el tema.</div>`;
  document.getElementById('c-lista').innerHTML = h; ir('s-lista');
}

/* ───────── ARRANQUE ───────── */
document.getElementById('s-rapido').addEventListener('click', e=>{}, false);
window.abrirRapido = abrirRapido;
document.querySelector('[onclick="ir(\'s-rapido\')"]').setAttribute('onclick','abrirRapido()');
document.querySelector('[onclick="ir(\'s-quizmenu\')"]').setAttribute('onclick','menuQuiz()');

(function init(){
  if(P.nombre){
    document.getElementById('in-nombre').value = P.nombre;
    document.getElementById('in-clase').value = P.clase || '';
    pintarInicio(); ir('s-inicio');
  } else {
    ir('s-perfil');
  }
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  }
})();
