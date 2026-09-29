/* ==================================================================
   SCREEN RULER – SHARED ENGINE
   Used by index.html (ruler) and ring.html (ring size).
   Holds the device table, auto-detection, the setup screen,
   card calibration and the saved setting. Edit the device
   table here and both tools pick it up.
   ================================================================== */
(function(){

/* ---------- DEVICE TABLE ----------
   Screen DIAGONAL in inches. The page works out pixels-per-inch
   from this, so it stays right even if a phone runs at a lower
   resolution or a different display scale. */

// iPhones: matched on "narrow x long @ pixel ratio" (CSS pixels)
const IPHONES = {
  "320x568@2": [{n:"iPhone SE (1st gen) / 5s", d:4.0}],
  "375x667@2": [{n:"iPhone 6 / 6s / 7 / 8 / SE (2nd or 3rd gen)", d:4.7}],
  "414x736@3": [{n:"iPhone 6 Plus / 7 Plus / 8 Plus", d:5.5}],
  "375x812@3": [{n:"iPhone X / XS / 11 Pro", d:5.8}, {n:"iPhone 12 mini / 13 mini", d:5.4}],
  "414x896@2": [{n:"iPhone XR / 11", d:6.1}],
  "414x896@3": [{n:"iPhone XS Max / 11 Pro Max", d:6.5}],
  "390x844@3": [{n:"iPhone 12 / 12 Pro / 13 / 13 Pro / 14 / 16e", d:6.1}],
  "428x926@3": [{n:"iPhone 12 Pro Max / 13 Pro Max / 14 Plus", d:6.7}],
  "393x852@3": [{n:"iPhone 14 Pro / 15 / 15 Pro / 16", d:6.1}],
  "430x932@3": [{n:"iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus", d:6.7}],
  "402x874@3": [{n:"iPhone 16 Pro / 17 / 17 Pro", d:6.3}],
  "420x912@3": [{n:"iPhone Air", d:6.5}],
  "440x956@3": [{n:"iPhone 16 Pro Max / 17 Pro Max", d:6.9}]
};

// Android: [model codes, name, diagonal inches]
// Samsung codes match by prefix (SM-S921 covers SM-S921B, SM-S921E...).
// Everything else must match exactly. Add new rows at the bottom.
const ANDROID = [
  // Galaxy S
  [["SM-G981"],"Galaxy S20",6.2], [["SM-G780","SM-G781"],"Galaxy S20 FE",6.5],
  [["SM-G991"],"Galaxy S21",6.2], [["SM-G996"],"Galaxy S21+",6.7],
  [["SM-G998"],"Galaxy S21 Ultra",6.8], [["SM-G990"],"Galaxy S21 FE",6.4],
  [["SM-S901"],"Galaxy S22",6.1], [["SM-S906"],"Galaxy S22+",6.6], [["SM-S908"],"Galaxy S22 Ultra",6.8],
  [["SM-S911"],"Galaxy S23",6.1], [["SM-S916"],"Galaxy S23+",6.6], [["SM-S918"],"Galaxy S23 Ultra",6.8],
  [["SM-S711"],"Galaxy S23 FE",6.4],
  [["SM-S921"],"Galaxy S24",6.2], [["SM-S926"],"Galaxy S24+",6.7], [["SM-S928"],"Galaxy S24 Ultra",6.8],
  [["SM-S721"],"Galaxy S24 FE",6.7],
  [["SM-S931"],"Galaxy S25",6.2], [["SM-S936"],"Galaxy S25+",6.7], [["SM-S938"],"Galaxy S25 Ultra",6.9],
  [["SM-S937"],"Galaxy S25 Edge",6.7], [["SM-S731"],"Galaxy S25 FE",6.7],
  [["SM-N970"],"Galaxy Note10",6.3],
  // Galaxy A
  [["SM-A125"],"Galaxy A12",6.5], [["SM-A135"],"Galaxy A13",6.6],
  [["SM-A145","SM-A146"],"Galaxy A14",6.6], [["SM-A155","SM-A156"],"Galaxy A15",6.5],
  [["SM-A165","SM-A166"],"Galaxy A16",6.7], [["SM-A055"],"Galaxy A05",6.7], [["SM-A057"],"Galaxy A05s",6.7],
  [["SM-A065"],"Galaxy A06",6.7], [["SM-A235","SM-A236"],"Galaxy A23",6.6],
  [["SM-A245"],"Galaxy A24",6.5], [["SM-A256"],"Galaxy A25",6.5], [["SM-A266"],"Galaxy A26",6.7],
  [["SM-A325"],"Galaxy A32",6.4], [["SM-A336"],"Galaxy A33",6.4], [["SM-A346"],"Galaxy A34",6.6],
  [["SM-A356"],"Galaxy A35",6.6], [["SM-A366"],"Galaxy A36",6.7],
  [["SM-A515"],"Galaxy A51",6.5], [["SM-A525","SM-A526"],"Galaxy A52",6.5], [["SM-A528"],"Galaxy A52s",6.5],
  [["SM-A536"],"Galaxy A53",6.5], [["SM-A546"],"Galaxy A54",6.4], [["SM-A556"],"Galaxy A55",6.6],
  [["SM-A566"],"Galaxy A56",6.7], [["SM-A715"],"Galaxy A71",6.7],
  // Galaxy M and F
  [["SM-M215"],"Galaxy M21",6.4], [["SM-M315"],"Galaxy M31",6.4], [["SM-M325"],"Galaxy M32",6.4],
  [["SM-M135"],"Galaxy M13",6.6], [["SM-M336"],"Galaxy M33",6.6],
  [["SM-M146"],"Galaxy M14",6.6], [["SM-M156"],"Galaxy M15",6.5], [["SM-M346"],"Galaxy M34",6.5],
  [["SM-M356"],"Galaxy M35",6.6], [["SM-M556"],"Galaxy M55",6.7],
  [["SM-E146"],"Galaxy F14",6.6], [["SM-E156"],"Galaxy F15",6.5], [["SM-E546"],"Galaxy F54",6.7],
  // Google Pixel
  [["PIXEL 4A"],"Pixel 4a",5.8], [["PIXEL 5"],"Pixel 5",6.0],
  [["PIXEL 6"],"Pixel 6",6.4], [["PIXEL 6 PRO"],"Pixel 6 Pro",6.7], [["PIXEL 6A"],"Pixel 6a",6.1],
  [["PIXEL 7"],"Pixel 7",6.3], [["PIXEL 7 PRO"],"Pixel 7 Pro",6.7], [["PIXEL 7A"],"Pixel 7a",6.1],
  [["PIXEL 8"],"Pixel 8",6.2], [["PIXEL 8 PRO"],"Pixel 8 Pro",6.7], [["PIXEL 8A"],"Pixel 8a",6.1],
  [["PIXEL 9"],"Pixel 9",6.3], [["PIXEL 9 PRO"],"Pixel 9 Pro",6.3], [["PIXEL 9 PRO XL"],"Pixel 9 Pro XL",6.8],
  [["PIXEL 9A"],"Pixel 9a",6.3],
  [["PIXEL 10"],"Pixel 10",6.3], [["PIXEL 10 PRO"],"Pixel 10 Pro",6.3], [["PIXEL 10 PRO XL"],"Pixel 10 Pro XL",6.8]
  // Add more here, e.g.  ,[["RMX3834"],"Realme example",6.7]
];

/* ---------- Basics ---------- */
const KEY = 'screenRuler.v1';
const CARD_L = 85.60, CARD_S = 53.98;   // standard bank/ID card, mm
const $ = id => document.getElementById(id);
const scr = () => ({ s: Math.min(screen.width, screen.height), l: Math.max(screen.width, screen.height) });
const dprNow = () => Math.round((window.devicePixelRatio || 1) * 100) / 100;
const cssDiag = () => { const {s, l} = scr(); return Math.hypot(s, l); };
const isPortrait = () => innerHeight >= innerWidth;
const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function load(){ try { return JSON.parse(localStorage.getItem(KEY)); } catch(e){ return null; } }
function save(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){} }
function stillValid(s){
  if (!s || !s.ppi) return false;
  const {s:a, l:b} = scr();
  return s.sw === a && s.sh === b && Math.abs(s.dpr - dprNow()) < 0.01;
}

/* ---------- Shared look ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
:root{
  --steel:#e6eaee; --ink:#15202b; --muted:#5d6b78; --line:#c3ccd4;
  --panel:#f7f9fa; --signal:#f2c300; --signal-ink:#15202b; --blue:#2b5f8a;
  color-scheme: light dark;
}
@media (prefers-color-scheme: dark){
  :root{ --steel:#1a2128; --ink:#dde4ea; --muted:#8e9ba6; --line:#34404b;
         --panel:#222b33; --signal:#f2c300; --signal-ink:#15202b; --blue:#7fb1dc; }
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--steel);color:var(--ink);
  font-family:"Segoe UI",Roboto,"Helvetica Neue",system-ui,-apple-system,sans-serif;font-variant-numeric:tabular-nums}
button,a.btn{font:inherit;font-size:15px;border:1px solid var(--line);background:var(--panel);color:var(--ink);
  border-radius:8px;padding:9px 14px;cursor:pointer;text-decoration:none;display:inline-block;line-height:1.2}
button.primary,a.btn.primary{background:var(--signal);color:var(--signal-ink);border-color:var(--signal);font-weight:650}
button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid var(--blue);outline-offset:2px}
[hidden]{display:none!important}
.sr-overlay{position:fixed;inset:0;background:var(--steel);overflow:auto;z-index:50;touch-action:auto;-webkit-user-select:auto;user-select:auto}
.sr-sheet{max-width:460px;margin:0 auto;padding:28px 20px 40px}
.sr-sheet h1{font-size:28px;font-weight:750;letter-spacing:-.01em;margin-bottom:8px}
.sr-lede{font-size:16px;line-height:1.5;color:var(--muted);margin-bottom:22px}
.sr-option{border-top:2px solid var(--ink);padding:16px 0 22px}
.sr-option h2{font-size:17px;font-weight:700;margin-bottom:6px}
.sr-option p{font-size:14.5px;line-height:1.5;color:var(--muted);margin-bottom:12px}
.sr-option p.sr-precise{color:var(--blue)}
.sr-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.sr-row input[type=number]{font:inherit;font-size:17px;width:110px;padding:9px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink)}
.sr-picks{display:flex;flex-direction:column;gap:8px}
.sr-picks button{text-align:left}
.sr-note{font-size:14px;line-height:1.5;color:var(--blue);margin-top:6px}
.sr-fine{font-size:13px;color:var(--muted);margin-top:18px;line-height:1.5}
#srCalib{position:fixed;inset:0;background:var(--steel);touch-action:none;z-index:60}
#srCardBox{position:fixed;left:50%;top:14px;transform:translateX(-50%);border:2px solid var(--ink);
  background:repeating-linear-gradient(135deg,transparent 0 10px,rgba(242,195,0,.18) 10px 20px);
  display:flex;align-items:center;justify-content:center;text-align:center;padding:10px}
#srCardBox span{font-size:14px;line-height:1.4;max-width:220px}
.sr-calctl{position:fixed;left:0;right:0;bottom:0;padding:14px 16px 18px;background:var(--panel);border-top:1px solid var(--line)}
.sr-calctl .sr-row{justify-content:center}
.sr-calctl input[type=range]{flex:1;min-width:140px;max-width:520px;accent-color:var(--ink);height:36px}
.sr-calctl .sr-row+.sr-row{margin-top:10px}
.sr-step{width:48px;font-size:20px!important;padding:6px 0!important}
</style>`);

/* ---------- Setup + calibration screens ---------- */
document.body.insertAdjacentHTML('beforeend', `
<section id="srSetup" class="sr-overlay" hidden>
  <div class="sr-sheet">
    <h1 id="srTitle">Set up your screen</h1>
    <p class="sr-lede">To show real sizes, this page needs to know how big your screen physically is. You only do this once on each device.</p>
    <div id="srDetect" class="sr-option" hidden></div>
    <div class="sr-option">
      <h2>Enter your screen size</h2>
      <p>Use the diagonal from your device's specs, for example 6.1 for an iPhone 15 or 15.6 for a 15.6-inch laptop.</p>
      <div class="sr-row">
        <input id="srDiag" type="number" inputmode="decimal" step="0.1" min="3" max="120" placeholder="6.1" aria-label="Screen diagonal in inches">
        <span>inches</span>
        <button id="srDiagGo" class="primary">Use this size</button>
      </div>
    </div>
    <div class="sr-option">
      <h2>Match a card</h2>
      <p>Hold any bank card, ID card or metro card against the screen and resize a box until it matches. They're all the same standard size.</p>
      <p id="srPrecise" class="sr-precise" hidden>This is the most accurate option, and the one to use before ordering a ring.</p>
      <button id="srCardGo" class="primary">Start card calibration</button>
    </div>
    <p id="srNote" class="sr-note"></p>
    <p class="sr-fine">Saved in this browser only. Nothing is sent anywhere.</p>
  </div>
</section>
<section id="srCalib" hidden>
  <div id="srCardBox"><span>Place your card here and adjust until the edges line up</span></div>
  <div class="sr-calctl">
    <div class="sr-row">
      <button id="srMinus" class="sr-step" aria-label="Smaller">−</button>
      <input id="srSlider" type="range" step="0.25" aria-label="Box size">
      <button id="srPlus" class="sr-step" aria-label="Bigger">+</button>
    </div>
    <div class="sr-row">
      <button id="srCalCancel">Cancel</button>
      <button id="srCalDone" class="primary">Save calibration</button>
    </div>
  </div>
</section>`);

/* ---------- Detection ---------- */
async function getAndroidModel(){
  try {
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues){
      const v = await navigator.userAgentData.getHighEntropyValues(['model']);
      if (v.model) return v.model.trim();
    }
  } catch(e){}
  const m = navigator.userAgent.match(/Android [^;)]*;\s*([^;)]+?)(?:\s+Build\/|\))/);
  if (m && m[1] && m[1] !== 'K') return m[1].trim();   // Chrome now hides it as "K"
  return null;
}
function lookupAndroid(model){
  const m = model.toUpperCase().trim();
  for (const [codes, name, d] of ANDROID) for (const c of codes) if (m === c) return {n:name, d};
  for (const [codes, name, d] of ANDROID) for (const c of codes)
    if (c.startsWith('SM-') && m.startsWith(c)) return {n:name, d};
  return null;
}
async function detect(){
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)){
    const {s, l} = scr();
    const hit = IPHONES[`${s}x${l}@${Math.round(window.devicePixelRatio || 1)}`];
    return hit ? {candidates: hit} : null;
  }
  if (/Android/.test(ua)){
    const model = await getAndroidModel();
    if (!model) return null;
    const hit = lookupAndroid(model);
    return hit ? {candidates:[hit], model} : {model};
  }
  return null;
}

/* ---------- Public API ---------- */
const SR = window.SR = {
  state: null, detected: null, opts: {},
  CARD_L, cssDiag, isPortrait,
  ppm(){ return SR.state.ppi / 25.4; },
  impliedDiagonal(){ return cssDiag() / SR.state.ppi; },

  async start(opts){
    SR.opts = opts || {};
    if (SR.opts.title) $('srTitle').textContent = SR.opts.title;
    $('srPrecise').hidden = !SR.opts.precise;
    const saved = load();
    SR.detected = await detect();
    if (stillValid(saved)){ SR.state = saved; ready(); return; }
    const d = SR.detected;
    if (d && d.candidates && d.candidates.length === 1){ fromDiagonal(d.candidates[0].d, d.candidates[0].n, 'auto'); return; }
    SR.showSetup(saved ? 'Your screen or zoom level changed since last time, so set it up again.' : '');
  },

  showSetup(note){
    SR.state = null;
    $('srCalib').hidden = true; $('srSetup').hidden = false;
    $('srNote').textContent = note || '';
    const box = $('srDetect'), d = SR.detected; box.innerHTML = '';
    if (d && d.candidates){
      const many = d.candidates.length > 1;
      box.hidden = false;
      box.innerHTML = `<h2>${many ? 'Which one is yours?' : 'Your device'}</h2>
        <p>${many ? 'These models look the same to the browser, so pick yours.' : 'We recognised this device.'}</p>
        <div class="sr-picks"></div>`;
      for (const c of d.candidates){
        const b = document.createElement('button');
        b.textContent = `${c.n} (${c.d}″)`;
        b.onclick = () => fromDiagonal(c.d, c.n, 'auto');
        box.querySelector('.sr-picks').appendChild(b);
      }
    } else if (d && d.model){
      box.hidden = false;
      box.innerHTML = `<h2>Your device</h2><p>This phone reports its model as “${esc(d.model)}”, which isn't in the built-in list yet. Use one of the options below.</p>`;
    } else box.hidden = true;
    SR.opts.onSetup && SR.opts.onSetup();
  },

  startCalib(){
    SR.opts.onSetup && SR.opts.onSetup();
    $('srSetup').hidden = true; $('srCalib').hidden = false;
    const sl = $('srSlider'), max = Math.floor(calibLimit());
    sl.min = 120; sl.max = max;
    const guessPpi = SR.state ? SR.state.ppi : cssDiag() / (scr().l > 1000 ? 14 : 6.5);
    sl.value = Math.min(max, guessPpi * CARD_L / 25.4);
    layoutCard();
  }
};

function ready(){
  $('srSetup').hidden = true; $('srCalib').hidden = true;
  SR.opts.onReady && SR.opts.onReady(SR.state);
}
function setScale(ppi, label, method){
  const {s, l} = scr();
  SR.state = {ppi, label, method, sw:s, sh:l, dpr:dprNow(), model: SR.detected && SR.detected.model || null};
  save(SR.state);
  ready();
}
function fromDiagonal(d, label, method){ setScale(cssDiag() / d, label, method); }

function calibLimit(){
  const ctl = 150;
  return isPortrait()
    ? Math.min(innerHeight - ctl - 28, (innerWidth - 24) * CARD_L / CARD_S)
    : Math.min(innerWidth - 48, (innerHeight - ctl - 28) * CARD_L / CARD_S);
}
function layoutCard(){
  const sl = $('srSlider'); sl.max = Math.floor(calibLimit());
  const L = +sl.value, S = L * CARD_S / CARD_L, b = $('srCardBox'), p = isPortrait();
  b.style.width = (p ? S : L) + 'px';
  b.style.height = (p ? L : S) + 'px';
  b.style.borderRadius = (L * 3.18 / CARD_L) + 'px';   // real card corner radius
}

function useTypedSize(){
  const d = parseFloat($('srDiag').value);
  if (!(d >= 3 && d <= 120)){ $('srNote').textContent = 'Enter a screen size between 3 and 120 inches.'; return; }
  fromDiagonal(d, `Screen size entered as ${d}″`, 'size');
}
$('srDiagGo').onclick = useTypedSize;
$('srDiag').addEventListener('keydown', e => { if (e.key === 'Enter') useTypedSize(); });
$('srCardGo').onclick = () => SR.startCalib();
$('srSlider').addEventListener('input', layoutCard);
$('srMinus').onclick = () => { $('srSlider').value = +$('srSlider').value - 0.5; layoutCard(); };
$('srPlus').onclick  = () => { $('srSlider').value = +$('srSlider').value + 0.5; layoutCard(); };
$('srCalDone').onclick = () => setScale(+$('srSlider').value * 25.4 / CARD_L, 'Calibrated with a card', 'card');
$('srCalCancel').onclick = () => {
  const s = load();
  if (stillValid(s)){ SR.state = s; ready(); } else SR.showSetup();
};

addEventListener('resize', () => {
  if (!$('srCalib').hidden){ layoutCard(); return; }
  if (SR.state && !stillValid(SR.state)){
    SR.showSetup('Your screen or zoom level changed, so set it up again. Keep browser zoom at 100%.');
    return;
  }
  SR.opts.onResize && SR.opts.onResize();
});

})();
