import { pipeline, env } from '@xenova/transformers';
import './style.css';

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = './models/';
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.proxy = false;
env.backends.onnx.wasm.wasmPaths = new URL('./wasm/', window.location.href).href;

const root = document.querySelector('#app');
root.innerHTML = `
  <header><div class="brand"><div class="logo">ID</div><div><h1>IDEN Translator</h1><p>Terjemahan offline Inggris ↔ Indonesia</p></div></div><button id="theme" class="icon-btn" aria-label="Ganti tema">◐</button></header>
  <main>
    <section class="language"><span id="source-label">Inggris</span><button id="swap" class="swap" aria-label="Tukar bahasa">⇄</button><span id="target-label">Indonesia</span></section>
    <section class="panel"><textarea id="source" placeholder="Ketik atau tempel teks di sini..." spellcheck="false"></textarea><div class="panel-foot"><span id="count">0 karakter</span><button id="clear" class="text-btn">Hapus</button></div></section>
    <button id="translate" class="primary" disabled>Terjemahkan</button>
    <div id="status" class="status">Menyiapkan penerjemah offline…</div>
    <section class="panel output"><div class="output-head"><strong>Hasil terjemahan</strong><button id="copy" class="text-btn">Salin</button></div><div id="result" class="result">Hasil akan muncul di sini.</div></section>
    <section class="history"><div class="history-head"><strong>Riwayat</strong><button id="clear-history" class="text-btn">Hapus riwayat</button></div><div id="history-list" class="history-list">Belum ada riwayat.</div></section>
    <footer>Model berjalan di perangkat. Tidak memerlukan akun atau koneksi internet setelah instalasi.</footer>
  </main>`;
const $ = id => document.getElementById(id);
let direction = 'en-id';
let translator = null;
let busy = false;
let dark = localStorage.getItem('iden-dark') === '1';
let history = JSON.parse(localStorage.getItem('iden-history') || '[]');
function theme() { document.body.classList.toggle('dark', dark); localStorage.setItem('iden-dark', dark ? '1' : '0'); }
theme();
function labels() { $('source-label').textContent = direction === 'en-id' ? 'Inggris' : 'Indonesia'; $('target-label').textContent = direction === 'en-id' ? 'Indonesia' : 'Inggris'; }
function setStatus(s, error=false) { $('status').textContent=s; $('status').classList.toggle('error',error); }
function renderHistory() {
  const host=$('history-list');
  if (!history.length) { host.textContent='Belum ada riwayat.'; return; }
  host.innerHTML='';
  history.slice(0,12).forEach(item => {
    const row=document.createElement('button'); row.className='history-item';
    const a=document.createElement('span'); a.textContent=item.input;
    const b=document.createElement('small'); b.textContent=item.output;
    row.append(a,b); row.addEventListener('click',()=>{$('source').value=item.input;$('result').textContent=item.output;updateCount();});
    host.append(row);
  });
}
function updateCount() { $('count').textContent=$('source').value.length.toLocaleString('id-ID')+' karakter'; $('translate').disabled=!translator || busy || !$('source').value.trim(); }
async function loadModel() {
  try {
    setStatus('Memuat model penerjemah offline. Pertama kali dapat memerlukan waktu…');
    translator = await pipeline('translation', direction === 'en-id' ? 'Xenova/opus-mt-en-id' : 'Xenova/opus-mt-id-en', { quantized: true });
    setStatus('Siap digunakan tanpa internet.'); updateCount();
  } catch (e) {
    console.error(e); setStatus('Model belum tersedia atau gagal dimuat. Build APK harus menyertakan kedua model ONNX dan tokenizer.', true);
  }
}
$('swap').addEventListener('click', async () => {
  if (busy) return;
  direction=direction==='en-id'?'id-en':'en-id'; labels(); translator=null; $('result').textContent='Hasil akan muncul di sini.'; updateCount(); await loadModel();
});
$('theme').addEventListener('click',()=>{dark=!dark;theme();});
$('source').addEventListener('input',updateCount);
$('clear').addEventListener('click',()=>{$('source').value='';$('result').textContent='Hasil akan muncul di sini.';updateCount();});
$('copy').addEventListener('click',async()=>{
  const value=$('result').textContent;
  if (!value || value==='Hasil akan muncul di sini.') return;
  try { await navigator.clipboard.writeText(value); setStatus('Hasil berhasil disalin.'); }
  catch { const t=document.createElement('textarea');t.value=value;document.body.append(t);t.select();document.execCommand('copy');t.remove();setStatus('Hasil berhasil disalin.'); }
});
$('translate').addEventListener('click',async()=>{
  const input=$('source').value.trim(); if(!input || !translator || busy)return;
  busy=true;updateCount();setStatus('Sedang menerjemahkan…');
  try {
    const chunks=input.match(/[\s\S]{1,1400}(?:\s|$)/g) || [input];
    const outputs=[];
    for (const chunk of chunks) { const r=await translator(chunk.trim(),{ max_new_tokens:512 }); outputs.push(r.map(x=>x.translation_text).join(' ')); }
    const output=outputs.join(' ');
    $('result').textContent=output;
    history.unshift({input,output,direction,at:Date.now()}); history=history.slice(0,30);
    localStorage.setItem('iden-history',JSON.stringify(history));renderHistory();setStatus('Terjemahan selesai.');
  } catch(e) { console.error(e);setStatus('Terjadi kesalahan saat menerjemahkan. Coba teks yang lebih pendek.',true); }
  finally { busy=false;updateCount(); }
});
$('clear-history').addEventListener('click',()=>{history=[];localStorage.setItem('iden-history','[]');renderHistory();});
labels();renderHistory();loadModel();
