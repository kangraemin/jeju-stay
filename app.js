(async function () {
  const $ = s => document.querySelector(s);
  const track = (name, params) => { try { gtag('event', name, params || {}); } catch (e) {} };
  // 화면 전환: 주소의 #map·#pick·#vs·#oreum·#story·#how 중 하나만 보인다
  const VIEWS = ['map', 'pick', 'vs', 'oreum', 'story', 'how'];
  const go = v => { if (location.hash === '#' + v) show(v); else location.hash = v; };
  let show = () => {};
  // 언어: 외국어 페이지(en/·zh/·zh-tw/)는 <html data-l data-root="../">로 같은 앱을 띄운다. 문구·이름은 i18n.js
  const LG = document.documentElement.dataset.l || 'ko', ROOT = document.documentElement.dataset.root || '';
  const U = I18N.ui[LG], NM = I18N.names[LG] || {}, nm = n => NM[n] || n, enm = n => I18N.names.en[n] || n;
  const [data, geo] = await Promise.all([fetch(ROOT + 'data.json').then(r => r.json()), fetch(ROOT + 'geo.json').then(r => r.json())]);
  const dongs = data.dongs;
  const byName = Object.fromEntries(dongs.map(d => [d.name, d]));
  const NS = 'http://www.w3.org/2000/svg';
  const dark = () => matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.dataset.theme !== 'light';

  const man = U.num;
  const sum = a => a.reduce((x, y) => x + y, 0);
  const val = (key, d) => key === 'stay' ? d.indShare['숙박업'] : key === 'eat' ? d.indShare['음식점업'] : d[key];
  const rankOf = (key, d) => [...dongs].sort((a, b) => val(key, b) - val(key, a)).indexOf(d) + 1;
  const sorted = key => [...dongs].sort((a, b) => val(key, b) - val(key, a));
  const total = sum(dongs.map(d => d.visitNative));
  // 여름(7·8월) 지수: 5년(2019·2022~2025) 해마다 월평균=1로 놓고 7·8월 평균 - 1 (%)
  dongs.forEach(d => { d.summerIdx = d.summer5; });
  const sgn = v => (v >= 0 ? '+' : '') + v + '%';
  const top1 = d => d.countries && d.countries[0];
  $('.eyebrow').textContent = U.eyebrow(man(total));
  const P = (d, v) => [nm(d.name), v]; // 문구 함수에 넘기는 [이름, 값]

  // validated with dataviz validate_palette.js (ordinal, light #fbfbf9 / dark #131413)
  const RAMP = {
    blue: { light: ['#86b6ef', '#3987e5', '#256abf', '#184f95', '#0d366b'], dark: ['#184f95', '#256abf', '#3987e5', '#6da7ec', '#b7d3f6'] },
    orange: { light: ['#f39a6e', '#eb6834', '#c9501f', '#9a3a13', '#682508'], dark: ['#8a3412', '#b9461c', '#eb6834', '#f39a6e', '#fbd0b6'] },
    div: { light: ['#1c5cab', '#6da7ec', '#e4e3de', '#ef8e8a', '#b8302f'], dark: ['#256abf', '#184f95', '#3a3b38', '#9c3534', '#d34544'] },
  };

  const LH = U.lohi;
  const METRICS = {
    visit: { key: 'visitNative', ramp: 'blue', fmt: d => U.times(man(d.visitNative)), lo: LH.visit[0], hi: LH.visit[1],
      insight() {
        const s = sorted('visitNative');
        const top5 = sum(s.slice(0, 5).map(d => d.visitNative)) / total * 100;
        return U.ins.visit(top5.toFixed(1), s.slice(0, 5).map(d => nm(d.name)).join(U.join), nm(s[0].name));
      } },
    night: { key: 'nightShare', ramp: 'orange', fmt: d => d.nightShare + '%', lo: LH.night[0], hi: LH.night[1],
      insight() {
        const s = sorted('nightShare');
        return U.ins.night(s.slice(0, 3).map(d => P(d, d.nightShare)), byName['우도면'].nightShare);
      } },
    tour: { key: 'tourSpendShare', ramp: 'div', mid: 50, fmt: d => U.fmt.tour(d.tourSpendShare), lo: LH.tour[0], hi: LH.tour[1],
      insight() {
        const s = sorted('tourSpendShare');
        const n = dongs.filter(d => d.tourSpendShare >= 50).length;
        return U.ins.tour(n, P(s[0], s[0].tourSpendShare), P(s.at(-1), s.at(-1).tourSpendShare));
      } },
    stay: { key: 'stay', ramp: 'blue', fmt: d => U.fmt.stay(d.indShare['숙박업']), lo: LH.stay[0], hi: LH.stay[1],
      insight() {
        return U.ins.stay(sorted('stay').slice(0, 3).map(d => P(d, val('stay', d))));
      } },
    summer: { key: 'summerIdx', ramp: 'orange', fmt: d => U.fmt.summer((d.summerIdx >= 0 ? '+' : '') + d.summerIdx + '%'), lo: LH.summer[0], hi: LH.summer[1],
      insight() {
        const s = sorted('summerIdx');
        const big = s.filter(d => rankOf('visitNative', d) <= 10).slice(0, 2);
        return U.ins.summer(P(s[0], s[0].summerIdx), big.map(d => P(d, d.summerIdx)));
      } },
    trend: { key: 'trend', ramp: 'div', steps: [-20, -5, 5, 20], fmt: d => U.fmt.trend(sgn(d.trend)), lo: LH.trend[0], hi: LH.trend[1],
      insight() {
        const s = sorted('trend').filter(d => d.visit2025 > 1e6);
        return U.ins.trend(s.slice(0, 3).map(d => P(d, sgn(d.trend))), [s.at(-1), s.at(-2), s.at(-3)].map(d => P(d, sgn(d.trend))));
      } },
    foreign: { key: 'foreignShare2025', ramp: 'blue', fmt: d => U.fmt.foreign(d.foreignShare2025), lo: LH.foreign[0], hi: LH.foreign[1],
      insight() {
        const s = sorted('foreignShare2025'), cn = [...dongs].filter(d => d.foreignSpend > 1e10 && top1(d)).sort((a, b) => (b.countries.find(c => c[0] === '중국') || [0, 0])[1] - (a.countries.find(c => c[0] === '중국') || [0, 0])[1]);
        const tw = [...dongs].filter(d => d.foreignSpend > 1e10).sort((a, b) => ((b.countries.find(c => c[0] === '대만') || [0, 0])[1]) - ((a.countries.find(c => c[0] === '대만') || [0, 0])[1]))[0];
        return U.ins.foreign(P(s[0], s[0].foreignShare2025), nm(s[1].name), nm(s[2].name), nm(cn[0].name), nm(cn[1].name), nm(tw.name), (tw.countries.find(c => c[0] === '대만') || [0, 0])[1]);
      } },
  };

  // 5 classes: quantiles (~8-9 dongs each); diverging metric uses fixed steps around 50%
  function classes(key, m) {
    const vals = dongs.map(d => val(key, d)).sort((a, b) => a - b);
    if (m.steps) {
      const t = m.steps;
      return { breaks: [vals[0], ...t, vals.at(-1)], cls: v => t.filter(x => v >= x).length };
    }
    if (m.mid != null) {
      return { breaks: [vals[0], 35, 45, 55, 65, vals.at(-1)], cls: v => v < 35 ? 0 : v < 45 ? 1 : v < 55 ? 2 : v < 65 ? 3 : 4 };
    }
    const q = [0.2, 0.4, 0.6, 0.8].map(p => vals[Math.floor(p * vals.length)]);
    return { breaks: [vals[0], ...q, vals.at(-1)], cls: v => q.filter(x => v >= x).length };
  }

  // ---------- map ----------
  function buildMap(svg) {
    svg.setAttribute('viewBox', `0 0 ${geo.w} ${geo.h}`);
    const paths = {};
    for (const [name, s] of Object.entries(geo.shapes)) {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', s.d);
      p.dataset.name = name;
      svg.appendChild(p);
      paths[name] = p;
      if (s.inset) {
        const [x, y, w, h] = s.inset;
        const r = document.createElementNS(NS, 'rect');
        Object.entries({ x, y, width: w, height: h, rx: 8, class: 'inset' }).forEach(([k, v]) => r.setAttribute(k, v));
        svg.insertBefore(r, svg.firstChild);
        const t = document.createElementNS(NS, 'text');
        Object.entries({ x: x + w / 2, y: y + h + 18, 'text-anchor': 'middle', class: 'insetlbl' }).forEach(([k, v]) => t.setAttribute(k, v));
        t.textContent = nm('추자면').replace(/-myeon$/, '');
        svg.appendChild(t);
      }
    }
    const layer = document.createElementNS(NS, 'g');
    svg.appendChild(layer);
    return { svg, paths, layer };
  }
  const unit = svg => geo.w / (svg.clientWidth || geo.w); // viewBox units per CSS px

  const main = buildMap($('#jeju'));
  let metric = 'visit', selected = null;

  function labels(map, items) {
    const u = unit(map.svg), fs = 12.5 * u;
    map.svg.querySelector('.insetlbl').style.fontSize = 11 * u + 'px';
    map.layer.innerHTML = '';
    for (const [key, v] of items) {
      const c = [...geo.shapes[key].c], name = nm(key);
      const half = Math.max(name.length, String(v).length * .6) * fs * .55;
      c[0] = Math.min(Math.max(c[0], half + 4), geo.w - half - 4);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('class', 'lbl');
      t.setAttribute('text-anchor', 'middle');
      t.style.fontSize = fs + 'px';
      t.style.strokeWidth = 3.5 * u + 'px';
      t.innerHTML = `<tspan x="${c[0]}" y="${c[1] - fs * .1}">${name}</tspan><tspan class="v" x="${c[0]}" dy="${fs * 1.1}" style="font-size:${fs * .88}px">${v}</tspan>`;
      map.layer.appendChild(t);
    }
  }

  function paint() {
    const m = METRICS[metric];
    const ramp = RAMP[m.ramp][dark() ? 'dark' : 'light'];
    const { breaks, cls } = classes(m.key, m);
    for (const d of dongs) {
      const p = main.paths[d.name];
      if (!p) continue;
      p.style.fill = ramp[cls(val(m.key, d))];
      p.classList.toggle('sel', d.name === selected);
      if (d.name === selected) p.parentNode.insertBefore(p, main.layer);
    }
    const s = sorted(m.key);
    const pick = m.mid != null || m.steps ? [s[0], s[1], s.at(-1)] : s.slice(0, 3);
    if (selected && !pick.includes(byName[selected])) pick.push(byName[selected]);
    labels(main, pick.map(d => [d.name, m.fmt(d)]));
    const f = v => m.key === 'visitNative' ? man(v) : m.key === 'summerIdx' || m.key === 'trend' ? sgn(Math.round(v)) : m.key === 'foreignShare2025' ? v + '%' : Math.round(v) + '%';
    $('#legend').innerHTML = `<span>${m.lo}</span><span class="ramp">${ramp.map((c, i) => `<i style="background:${c}" title="${f(breaks[i])}~${f(breaks[i + 1])}"></i>`).join('')}</span><span>${m.hi}</span><span style="margin-left:auto">${f(breaks[0])} ~ ${f(breaks[5])}</span>`;
    $('#insight').innerHTML = m.insight();
  }

  const tip = $('#tip'), box = $('.mapbox');
  $('#jeju').addEventListener('pointermove', e => {
    const n = e.target.dataset && e.target.dataset.name;
    if (!n || e.pointerType === 'touch') { tip.hidden = true; return; }
    const r = box.getBoundingClientRect();
    tip.innerHTML = `<b>${nm(n)}</b>${METRICS[metric].fmt(byName[n])}`;
    tip.style.left = e.clientX - r.left + 'px'; tip.style.top = e.clientY - r.top + 'px';
    tip.hidden = false;
  });
  $('#jeju').addEventListener('pointerleave', () => tip.hidden = true);
  $('#jeju').addEventListener('click', e => {
    const n = e.target.dataset && e.target.dataset.name;
    tip.hidden = true;
    if (n) select(n, true);
  });

  document.querySelectorAll('.chips button').forEach(b => b.addEventListener('click', () => {
    metric = b.dataset.m;
    document.querySelectorAll('.chips button').forEach(x => x.setAttribute('aria-selected', x === b));
    paint();
    track('metric_change', { metric });
  }));

  // ---------- 숙소 결정 응답 + 숙소 검색 이동 + 예약 되묻기 (실사용 성과 측정) ----------
  const decided = {};
  const store = { get() { try { return JSON.parse(localStorage.getItem('jejuStayDec') || 'null'); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem('jejuStayDec', JSON.stringify(v)); } catch (e) {} } };
  const stayLink = (name, from, cls, rank) => { const [href, txt] = U.dec.search(name, nm(name), enm(name));
    return `<a class="${cls}" data-search data-dong="${name}" data-from="${from}"${rank ? ` data-rank="${rank}"` : ''} href="${href}" target="_blank" rel="noopener" title="${txt}">${U.dec.stay}</a>`; };
  const bookAsk = () => `<p class="decq">${U.dec.book}</p><div class="decbtns"><button type="button" data-book="booked">${U.dec.booked}</button><button type="button" data-book="not_yet">${U.dec.notyet}</button></div>`;
  const decision = (name, from) => { const D = U.dec; return decided[name]
    ? `<div class="dec done">${D.done(nm(name))}<div class="decmain">${stayLink(name, from, 'btn stay')}</div></div>`
    : `<div class="dec" data-dong="${name}" data-from="${from}">
      <div class="decmain">${stayLink(name, from, 'btn stay')}<button type="button" class="btn decyes" data-dec="yes">${D.yes}</button></div>
      <div class="decsub"><button type="button" data-dec="maybe">${D.maybe}</button><button type="button" data-dec="no">${D.no}</button></div></div>`; };
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-search]');
    if (s) track('stay_search', s.dataset.rank ? { dong: s.dataset.dong, from: s.dataset.from, rank: +s.dataset.rank } : { dong: s.dataset.dong, from: s.dataset.from });
    const box = e.target.closest('.dec[data-dong]'); if (!box) return;
    const dong = box.dataset.dong, from = box.dataset.from;
    const b = e.target.closest('[data-dec]');
    if (b) {
      decided[dong] = b.dataset.dec;
      track('stay_decision', { dong, answer: b.dataset.dec, from });
      const sub = box.querySelector('.decsub'), yes = box.querySelector('.decyes');
      if (yes) yes.remove();
      if (b.dataset.dec === 'yes') { sub.innerHTML = bookAsk(); store.set({ dong, t: Date.now() }); }
      else sub.innerHTML = `<span class="decok">${U.dec.thanks}</span>`;
    }
    const k = e.target.closest('[data-book]');
    if (k) {
      track('stay_booked', { dong, answer: k.dataset.book, from });
      const v = store.get(); if (v && v.dong === dong) store.set({ ...v, booked: k.dataset.book });
      box.querySelector('.decsub').innerHTML = `<span class="decok">${U.dec.bookThanks}</span>`;
    }
  });
  // 다시 들어온 사람: 지난번에 '여기로 정했어요'를 누르고 아직 예약 전이면(답 없음·아직) 한 번만 되묻기
  {
    const v = store.get(), hrs = v && (Date.now() - v.t) / 36e5;
    if (v && byName[v.dong] && v.booked !== 'booked' && !v.asked && hrs >= 0.5) {
      const f = $('#follow');
      f.innerHTML = `<p>${U.dec.follow(nm(v.dong))}</p><div class="decbtns"><button type="button" data-fu="booked">${U.dec.booked}</button><button type="button" data-fu="not_yet">${U.dec.notyet}</button><button type="button" data-fu="changed">${U.dec.changed}</button><button type="button" class="x" data-fu="close" aria-label="${U.dec.close}">×</button></div>`;
      f.hidden = false;
      track('stay_followup_view', { dong: v.dong, hours: Math.round(hrs) });
      f.addEventListener('click', e => {
        const b = e.target.closest('[data-fu]'); if (!b) return;
        const a = b.dataset.fu;
        store.set({ ...v, asked: true, booked: a === 'close' ? undefined : a });
        if (a === 'close') { f.hidden = true; return; }
        track('stay_followup', { dong: v.dong, answer: a, hours: Math.round(hrs) });
        f.innerHTML = `<p class="decok">${U.dec.bookThanks}</p>`;
      });
    }
  }

  // ---------- dong card ----------
  function curveSVG(d, w = 300, h = 96) {
    const pad = { l: 4, r: 42, t: 8, b: 18 };
    const norm = a => { const t = sum(a) || 1; return a.map(x => x / t * 100); };
    const A = norm(d.hourTour), B = norm(d.hourLocal);
    const max = Math.max(...A, ...B);
    const X = i => pad.l + i / 23 * (w - pad.l - pad.r), Y = v => pad.t + (1 - v / max) * (h - pad.t - pad.b);
    const line = a => a.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join('');
    const ticks = [0, 6, 12, 18].map(i => `<text class="tk" x="${X(i)}" y="${h - 4}" text-anchor="middle">${U.hour(i)}</text>`).join('');
    const ya = Y(A[23]), yb = Y(B[23]), gap = Math.abs(ya - yb) < 12 ? (ya < yb ? [0, 12] : [12, 0]) : [0, 0];
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${U.curveAria(nm(d.name))}">
      <rect class="band" x="${X(18)}" y="${pad.t}" width="${X(23) - X(18)}" height="${h - pad.t - pad.b}" rx="3"/>
      <line class="ax" x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}"/>
      <path class="ln" d="${line(B)}" stroke="var(--s-local)"/>
      <path class="ln" d="${line(A)}" stroke="var(--s-tour)"/>
      <text class="dl" x="${X(23) + 5}" y="${ya + 4 + gap[0]}" fill="var(--ink)">${U.tourist}</text>
      <text class="dl" x="${X(23) + 5}" y="${yb + 4 + gap[1]}" fill="var(--ink2)">${U.local}</text>
      ${ticks}</svg>`;
  }

  function select(name, fromMap) {
    selected = name;
    const d = byName[name];
    const C = U.card, c1 = top1(d) && d.foreignSpend > 1e9 ? `${nm(top1(d)[0])} ${top1(d)[1]}%` : '';
    $('#card').innerHTML = `
      <div class="card-h"><h3>${nm(d.name)}</h3><span>${nm(d.city)}</span><button class="btn vsgo" type="button" data-vsgo="${d.name}">${C.vs}</button></div>
      <div class="nums">
        <div class="num"><b>${C.rank ? '' : '#'}${rankOf('visitNative', d)}<small>${C.rank}</small></b><span>${C.visit}</span></div>
        <div class="num"><b>${d.nightShare}<small>%</small></b><span>${C.night}</span></div>
        <div class="num"><b>${d.tourSpendShare}<small>%</small></b><span>${C.tour}</span></div>
      </div>
      ${decision(d.name, 'card')}
      <div class="curve">${curveSVG(d)}<p class="capt">${C.capt}</p></div>
      <p class="places">${C.months(U.month(d.quietMonth), U.month(d.busyMonth))}</p>
      <p class="places">${C.trend(sgn(d.trend), d.foreignShare2025, c1)}</p>
      ${d.places && d.places.length ? `<p class="places">${C.places(d.places.slice(0, 3).map(p => nm(p[0])).join(' · '))}</p>` : ''}
      ${d.ri && d.ri.length ? `<p class="places">${C.ri(d.ri.slice(0, 3).map(r => nm(r[0])).join(' · '))}</p>` : ''}
`;
    side.classList.add('has-dong');
    sheetHead();
    if (narrow() && !side.classList.contains('open')) { side.classList.remove('bump'); void side.offsetWidth; side.classList.add('bump'); }
    paint();
    try { gtag('event', 'page_view', { page_title: name + ' · 제주 숙소 동네', page_path: '/jeju-stay/d/' + name, page_location: location.origin + '/jeju-stay/d/' + encodeURIComponent(name) }); } catch (e) {}
    if (fromMap) track('dong_open', { dong: name, metric });
  }
  $('#card').innerHTML = `<p class="hint">${U.card.hint}</p><a class="cta small" href="#pick" data-cta="card">${U.card.cta}</a>`;

  // ---------- 아래 패널(폭 900px 미만) ----------
  // 지도 화면에서 설명·동네 카드를 화면 아래에 붙여 둔다. 손잡이 줄은 늘 보이고, 누르거나 끌어 올리면 펼친다
  const side = $('#side'), narrow = () => innerWidth < 900;
  const sheet = open => { side.classList.toggle('open', open); sheetHead(); };
  function sheetHead() {
    const C = U.card, d = selected && byName[selected], o = side.classList.contains('open');
    $('#sheethead').innerHTML = `<span class="grip" aria-hidden="true"></span>
      <button type="button" class="shtoggle" aria-expanded="${o}"><b>${d ? nm(d.name) : C.sheet}</b><small>${d ? nm(d.city) : C.sheetN}</small>
        <span class="shsub">${d ? C.sheetSub(rankOf('visitNative', d), d.nightShare) : C.sheetHint}</span></button>
      ${d ? `<button type="button" class="btn vsgo" data-vsgo="${d.name}">${C.vs}</button>` : ''}
      <span class="shmore" aria-hidden="true">${o ? C.close + ' ▾' : C.open + ' ▴'}</span>`;
  }
  sheetHead();
  {
    let y0 = null, moved = false;
    const h = $('#sheethead');
    h.addEventListener('pointerdown', e => { if (e.target.closest('.vsgo')) return; y0 = e.clientY; moved = false; });
    h.addEventListener('pointermove', e => { if (y0 != null && Math.abs(e.clientY - y0) > 8) moved = true; });
    h.addEventListener('pointerup', e => {
      if (y0 == null) return;
      const dy = e.clientY - y0; y0 = null;
      const o = side.classList.contains('open'), want = moved ? dy < 0 : !o;
      if (want !== o) { sheet(want); track('sheet', { open: want ? 1 : 0, how: moved ? 'drag' : 'tap' }); }
    });
    h.addEventListener('pointercancel', () => { y0 = null; });
  }
  // 동네 카드의 '다른 동네와 비교': 이 동네를 왼쪽에 넣고 비교 화면으로 간다. 오른쪽은 지금 고른 동네와 다른 곳
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-vsgo]'); if (!b) return;
    const n = b.dataset.vsgo, A = $('#vsA').value, B = $('#vsB').value;
    $('#vsB').value = B !== n ? B : A !== n ? A : n === '애월읍' ? '조천읍' : '애월읍';
    $('#vsA').value = n;
    track('vs_from_card', { dong: n, from: b.closest('#sheethead') ? 'sheet' : 'card' });
    renderVs(true); go('vs');
    $('#vsB').classList.add('ask'); setTimeout(() => $('#vsB').classList.remove('ask'), 2400);
  });
  // 첫 화면·빈 카드의 추천 버튼
  document.addEventListener('click', e => { const c = e.target.closest('[data-cta]'); if (c) track('cta_click', { from: c.dataset.cta }); });
  // 첫 화면 입구 카드: 지도 카드는 같은 화면이라 해시 대신 지도까지 내린다
  document.querySelectorAll('[data-hero]').forEach(a => a.addEventListener('click', e => {
    track('hero_card', { card: a.dataset.hero });
    if (a.dataset.hero === 'map' && document.body.dataset.view === 'map') { e.preventDefault(); $('.chips').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }));

  // ---------- quiz ----------
  const pin = buildMap($('#pinmap'));
  const ans = { busy: 0, night: 0, vibe: 0, focus: 'none' };
  function score(d, a) {
    let s = 0;
    s += a.busy * (d.busyPct - 50);
    s += a.night * (d.nightPct - 50) * 1.2;
    s += a.vibe * (d.tourPct - 50);
    if (a.focus === 'eat') s += (d.eatPct - 50) * 1.2;
    if (a.focus === 'stay') s += (d.stayPct - 50) * 1.2;
    return s;
  }
  function why(d, a) {
    const W = U.why, r = rankOf('visitNative', d);
    if (a.focus === 'stay') return W.stay(val('stay', d), r);
    if (a.focus === 'eat') return W.eat(val('eat', d), d.nightShare);
    if (a.night) return W.night(d.nightShare, r);
    if (a.vibe) return W.vibe(d.tourSpendShare, r);
    return W.base(r, d.nightShare);
  }
  // 끝나면 다른 화면으로 옮긴 뒤 할 일(예: 카드로 스크롤). show()가 맨 위로 올린 다음 부른다
  let after = null;
  const openCard = (n, from) => {
    select(n, false); track('dong_open', { dong: n, from });
    after = () => { if (narrow()) sheet(true); };
    go('map');
  };
  function runQuiz(log) {
    const pool = dongs.filter(d => d.busyPct > 15);
    const top = pool.map(d => [d, score(d, ans)]).sort((x, y) => y[1] - x[1]).slice(0, 3).map(x => x[0]);
    for (const [n, p] of Object.entries(pin.paths)) p.classList.toggle('hit', top.some(d => d.name === n));
    const u = unit(pin.svg);
    pin.svg.querySelector('.insetlbl').style.fontSize = 11 * u + 'px';
    pin.layer.innerHTML = top.map((d, i) => { const c = geo.shapes[d.name].c; return `<g class="pin"><circle cx="${c[0]}" cy="${c[1]}" r="${13 * u}" style="stroke-width:${2.5 * u}"/><text x="${c[0]}" y="${c[1]}" style="font-size:${14 * u}px">${i + 1}</text></g>`; }).join('');
    const b = top[0];
    // 1순위 바로 아래에 숙소 보기·여기로 정했어요
    $('#best').innerHTML = `<p class="k"><span class="rk">1</span>${U.card.best}</p><h3>${nm(b.name)}<small>${nm(b.city)}</small></h3><p class="why">${why(b, ans)}</p>${decision(b.name, 'quiz')}<button type="button" class="more" data-n="${b.name}">${U.card.more}</button>`;
    $('#picks').innerHTML = top.slice(1).map((d, i) => `<li data-n="${d.name}"><span class="rk">${i + 2}</span><div><h3>${nm(d.name)}<small>${nm(d.city)}</small></h3><p class="why">${why(d, ans)}</p></div>${stayLink(d.name, 'quiz', 'stay sm', i + 2)}</li>`).join('');
    $('#best .more').addEventListener('click', () => openCard(b.name, 'quiz'));
    $('#picks').querySelectorAll('li[data-n]').forEach(li => li.addEventListener('click', e => { if (!e.target.closest('[data-search]')) openCard(li.dataset.n, 'quiz'); }));
    if (log) track('quiz_done', { ...ans, top: top.map(d => d.name).join(',') });
  }
  // 질문 3개를 한 장씩: 사람 → 저녁 → 동네. 중심(맛집·숙박)은 결과 화면에서 바꾼다
  const steps = [...document.querySelectorAll('.wstep')], wback = $('.wback');
  let step = 0, done = false;
  const setStep = i => {
    step = i;
    steps.forEach((x, j) => x.classList.toggle('on', j === i));
    wback.hidden = i === 0;
    $('#wiz').hidden = done; $('#result').hidden = !done;
  };
  steps.forEach((st, i) => st.querySelector('.wopts').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = st.querySelector('.wopts').dataset.k;
    ans[k] = +b.dataset.v;
    st.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    if (i === 0) track('quiz_start', { from: document.referrer ? 'ref' : 'direct' });
    track('quiz_step', { step: i + 1, [k]: ans[k] });
    if (i < steps.length - 1) { setStep(i + 1); return; }
    done = true; setStep(i); runQuiz(true);
    scrollTo(0, 0);
  }));
  wback.addEventListener('click', () => setStep(Math.max(0, step - 1)));
  $('#redo').addEventListener('click', () => { done = false; setStep(0); scrollTo(0, 0); track('quiz_redo', {}); });
  document.querySelectorAll('.quiz .seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    const k = seg.dataset.k; ans[k] = k === 'focus' ? b.dataset.v : +b.dataset.v;
    runQuiz(true);
  }));

  // ---------- stories: 오늘의 제주 숫자 ----------
  // 고르는 규칙(StoryDays)과 그리는 화면(renderStories)을 나눠 둔다 — 화면 모양이 바뀌어도 날짜→이야기 배정은 그대로.
  // stories.json: start(첫날, KST) · from(목록에 보이기 시작하는 날) · per(하루 개수) · order(배정 순서) · stories(id→글·그림·링크)
  const StoryDays = SP => {
    const day = ymd => Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) / 864e5;
    const ymd = n => new Date(n * 864e5).toISOString().slice(0, 10);
    const q = new URLSearchParams(location.search).get('day'); // ?day=2026-10-25 로 다른 날 미리 보기(검사용)
    const today = q && /^\d{4}-\d\d-\d\d$/.test(q) ? day(q) : Math.floor((Date.now() + 9 * 36e5) / 864e5); // KST 날짜
    const L = SP.order.length, per = SP.per, cycle = Math.floor(L / per), s0 = day(SP.start);
    const ids = n => Array.from({ length: per }, (_, k) => SP.order[(((n - s0) * per + k) % L + L) % L]);
    const first = Math.max(day(SP.from || SP.start), today - cycle + 1); // 한 바퀴 넘게 지난 날은 안 보인다(같은 이야기 두 번 안 나오게)
    return { today, ymd, ids, past: Array.from({ length: Math.max(0, today - first) }, (_, i) => today - 1 - i) };
  };
  const storiesP = fetch(ROOT + 'stories.json').then(r => r.json()).catch(() => null);
  const ST = U.st, SL = LG;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dlab = n => { const d = new Date(n * 864e5); return ST.date(d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCDay()); };
  // 작은 그림: 320폭 SVG, 색은 테마 변수
  const VIZ = {
    hour(v) { // 24시간 두 줄(%)
      const mx = Math.max(...v.s.flat()), X = i => 8 + i / 23 * 304, Y = x => 70 - x / mx * 60, C = ['var(--accent)', 'var(--s-tour)'];
      const ln = (a, c) => `<path d="${a.map((x, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(x).toFixed(1)).join('')}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"/>`;
      return `<svg viewBox="0 0 320 96"><rect x="${X((v.hl || [18])[0])}" y="6" width="${X((v.hl || [18, 23])[1]) - X((v.hl || [18])[0])}" height="64" rx="3" fill="var(--chip)"/>${v.s.map((a, i) => ln(a, C[i])).join('')}
        ${[0, 6, 12, 18].map(h => `<text x="${X(h)}" y="88" class="vt">${U.hour(h)}</text>`).join('')}</svg>
        <p class="vl">${v.lab[SL].map((n, i) => `<span style="color:${C[i]}">━</span> ${esc(n)}`).join(' &nbsp;')}</p>`;
    },
    split(v) { // 한 줄 100% 막대
      return `<svg viewBox="0 0 320 30"><rect x="0" y="4" width="320" height="22" rx="6" fill="var(--chip)"/><rect x="0" y="4" width="${v.v * 3.2}" height="22" rx="6" fill="var(--accent)"/></svg>
        <p class="vl"><span style="color:var(--accent)">■</span> ${esc(v.lab[SL][0])} ${v.v}% &nbsp;<span style="color:var(--ink2)">■</span> ${esc(v.lab[SL][1])} ${Math.round((100 - v.v) * 10) / 10}%</p>`;
    },
    bars(v) { // 가로 막대(첫 막대 강조)
      const mx = Math.max(...v.v), h = 26;
      return `<svg viewBox="0 0 320 ${v.v.length * h}">${v.v.map((x, i) => `<text x="0" y="${i * h + 16}" class="vt l">${esc(v.lab[SL][i])}</text>
        <rect x="118" y="${i * h + 5}" width="${Math.max(2, x / mx * 140)}" height="14" rx="4" fill="${i ? 'var(--line)' : 'var(--accent)'}"/>
        <text x="${122 + x / mx * 140}" y="${i * h + 16}" class="vt l">${x.toLocaleString()}${v.u}</text>`).join('')}</svg>`;
    },
    pm(v) { // 늘고 줄고(가운데 0)
      const mx = Math.max(...v.v.map(Math.abs)), h = 26;
      return `<svg viewBox="0 0 320 ${v.v.length * h}"><line x1="210" x2="210" y1="0" y2="${v.v.length * h}" stroke="var(--line)"/>${v.v.map((x, i) => {
        const w = Math.abs(x) / mx * 70; return `<text x="0" y="${i * h + 16}" class="vt l">${esc(v.lab[SL][i])}</text>
        <rect x="${x < 0 ? 210 - w : 210}" y="${i * h + 5}" width="${w}" height="14" rx="4" fill="${x < 0 ? 'var(--s-local)' : 'var(--accent)'}"/>
        <text x="${x < 0 ? 206 - w : 214 + w}" y="${i * h + 16}" class="vt l" text-anchor="${x < 0 ? 'end' : 'start'}">${sgn(x)}</text>`; }).join('')}</svg>`;
    },
    months(v) { // 12달 막대(강조 달)
      const mx = Math.max(...v.v), w = 320 / 12;
      return `<svg viewBox="0 0 320 84">${v.v.map((x, i) => `<rect x="${i * w + 3}" y="${64 - x / mx * 58}" width="${w - 6}" height="${x / mx * 58}" rx="3" fill="${v.hi.includes(i + 1) ? 'var(--accent)' : 'var(--line)'}"/>
        <text x="${i * w + w / 2}" y="80" class="vt" text-anchor="middle">${i + 1}</text>`).join('')}</svg>`;
    },
  };
  const card = (id, S) => {
    const s = S.stories[id]; if (!s) return '';
    const t = s.t[SL] || s.t.ko, g = s.link;
    return `<article class="story" id="st-${id}"><p class="k">${esc(t.k)}</p><h3>${esc(t.h)}</h3><div class="big">${esc(t.big)}</div>
      <p>${esc(t.p)}</p><div class="viz" aria-hidden="true">${VIZ[s.viz.type] ? VIZ[s.viz.type](s.viz) : ''}</div>
      <div class="st-f"><span class="src">${esc(t.src)}</span><button class="stgo" type="button" data-sid="${id}">${ST.go[g.v]}</button></div></article>`;
  };
  let SP = null;
  function renderStories() {
    if (!SP) return;
    const D = StoryDays(SP), seen = [D.today, ...D.past].flatMap(D.ids);
    // 지도에서 고른 동네 이야기(이미 열린 것만, 2개까지) — 내일 이야기는 미리 안 보여 준다
    const mine = selected ? [...new Set(seen)].filter(id => (SP.stories[id].dongs || []).includes(selected)).slice(0, 2) : [];
    $('#stories').innerHTML = (mine.length ? `<div class="sday mine"><h3>${esc(ST.mine(nm(selected)))}</h3><div class="stories">${mine.map(id => card(id, SP)).join('')}</div></div>` : '') +
      `<div class="sday"><h3>${esc(ST.today(dlab(D.today)))}</h3><div class="stories">${D.ids(D.today).map(id => card(id, SP)).join('')}</div></div>` +
      `<div class="story lock"><p class="k">${esc(ST.lock(dlab(D.today + 1)))}</p><h3>${esc((SP.stories[D.ids(D.today + 1)[0]].t[SL] || {}).h || '')}</h3><p>${esc(ST.lockP)}</p></div>` +
      D.past.map(n => `<details class="sday past" data-day="${D.ymd(n)}"><summary><b>${esc(dlab(n))}</b><span>${esc(ST.past(SP.per))}</span></summary><div class="stories">${D.ids(n).map(id => card(id, SP)).join('')}</div></details>`).join('');
  }
  $('#stories').addEventListener('click', e => {
    const b = e.target.closest('.stgo'); if (!b) return;
    const id = b.dataset.sid, g = SP.stories[id].link;
    track('story_open', { id, to: g.v });
    if (g.v === 'vs') { $('#vsA').value = g.a; $('#vsB').value = g.b; renderVs(true); go('vs'); }
    else if (g.v === 'oreum') { go('oreum'); const o = document.querySelector(`.oseg button[data-o="${g.o}"]`); if (o) o.click(); }
    else {
      const mb = document.querySelector(`.chips button[data-m="${g.m}"]`); if (mb) mb.click();
      go('map'); if (g.d && byName[g.d]) setTimeout(() => select(g.d, false), 0);
    }
  });
  $('#stories').addEventListener('toggle', e => { if (e.target.open) track('story_more', { date: e.target.dataset.day }); }, true);
  storiesP.then(j => { SP = j; renderStories(); });

  // ---------- compare (butterfly) ----------
  const ROWS = [
    [d => d.visitNative, d => man(d.visitNative)],
    [d => d.autShare, d => d.autShare + '%'],
    [d => d.nightShare, d => d.nightShare + '%'],
    [d => d.tourSpendShare, d => d.tourSpendShare + '%'],
    [d => val('eat', d), d => val('eat', d) + '%'],
    [d => val('stay', d), d => val('stay', d) + '%'],
    [d => d.foreignShare2025, d => d.foreignShare2025 + '%'],
  ].map((r, i) => [U.rows[i], ...r]);
  const opts = [...dongs].sort((a, b) => nm(a.name).localeCompare(nm(b.name), U.collate)).map(d => `<option value="${d.name}">${nm(d.name)}</option>`).join('');
  $('#vsA').innerHTML = opts; $('#vsB').innerHTML = opts;
  const qs = new URLSearchParams(location.search);
  $('#vsA').value = byName[qs.get('a')] ? qs.get('a') : '애월읍';
  $('#vsB').value = byName[qs.get('b')] ? qs.get('b') : '조천읍';
  if (qs.get('a')) track('shared_visit', { a: qs.get('a'), b: qs.get('b') });
  const mb = qs.get('m') && document.querySelector(`.chips button[data-m="${qs.get('m')}"]`); // ?m=trend 처럼 지도 지표를 링크로 연다(SNS 글 링크용)
  if (mb) { mb.click(); setTimeout(() => mb.scrollIntoView({ block: 'nearest', inline: 'center' }), 0); track('metric_link', { metric: qs.get('m') }); } // dong과 같이 쓸 수 있다: ?m=trend&dong=우도면
  if (byName[qs.get('dong')]) { select(qs.get('dong'), false); track('dong_open', { dong: qs.get('dong'), from: 'page' }); }
  function renderVs(log) {
    const A = byName[$('#vsA').value], B = byName[$('#vsB').value];
    $('#fly').innerHTML = ROWS.map(([lb, f, fmt]) => {
      const mx = Math.max(...dongs.map(f)), a = f(A), b = f(B);
      return `<div class="fr"><div class="lb">${lb}</div><div class="bars">
        <div class="l ${a < b ? 'lose' : ''}"><i style="width:${a / mx * 74}%"></i><span>${fmt(A)}</span></div>
        <div class="r ${b < a ? 'lose' : ''}"><i style="width:${b / mx * 74}%"></i><span>${fmt(B)}</span></div></div></div>`;
    }).join('') + `<p class="capt" style="padding:4px 0 10px">${U.barNote}</p>`;
    if (log) track('compare', { a: A.name, b: B.name });
  }
  $('#vsA').addEventListener('change', () => renderVs(true));
  $('#vsB').addEventListener('change', () => renderVs(true));
  $('#share').addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?a=${encodeURIComponent($('#vsA').value)}&b=${encodeURIComponent($('#vsB').value)}#vs`;
    try {
      if (navigator.share) await navigator.share({ title: U.shareTitle, url });
      else { await navigator.clipboard.writeText(url); $('#share').textContent = U.copied; }
    } catch (e) {}
    track('share', { a: $('#vsA').value, b: $('#vsB').value });
  });

  // ---------- oreum ----------
  {
    const o = [...data.oreum].sort((a, b) => b.aut - a.aut), ot = sum(o.map(x => x.aut));
    const top = o.slice(0, 8), rest = o.slice(8), rs = sum(rest.map(x => x.aut));
    const top3 = sum(o.slice(0, 3).map(x => x.aut)) / ot * 100;
    const O = U.oreum;
    $('#oreumlede').textContent = O.lede(o.filter(x => x.aut > 0).length, ot.toLocaleString(), top3.toFixed(1));
    const mx = Math.max(o[0].aut, rs);
    const row = (n, v, cls, sub) => `<div class="ob ${cls}"><span class="n">${n}</span><div class="t"><i style="width:${v / mx * 70}%"></i><span>${v.toLocaleString()}<small>${sub}</small></span></div></div>`;
    const cntHtml = top.map((x, i) => row(nm(x.name), x.aut, i === 0 ? 'hot' : '', (x.aut / ot * 100).toFixed(1) + '%')).join('') +
      row(O.rest(rest.filter(x => x.aut > 0).length), rs, 'rest', (rs / ot * 100).toFixed(1) + '%');
    const cntLede = $('#oreumlede').textContent;
    // 도민 픽: 5년(2021~2025) 도착 5,000대 이상 중 도민(차량 주 사용지역 제주) 비율 높은 순, 비교로 1위 오름
    const o5 = data.oreum.filter(x => x.season);
    const loc = o5.filter(x => x.total5 >= 5000).sort((a, b) => b.local5 - a.local5).slice(0, 8);
    const big5 = [...o5].sort((a, b) => b.total5 - a.total5)[0];
    const lrow = (x, cls) => `<div class="ob ${cls}"><span class="n">${nm(x.name)}</span><div class="t"><i style="width:${x.local5 * 0.7}%"></i><span>${x.local5}%<small>${O.five(x.total5.toLocaleString())}</small></span></div></div>`;
    const locHtml = loc.map((x, i) => lrow(x, i === 0 ? 'hot' : '')).join('') + lrow(big5, 'rest');
    const locLede = O.locLede(nm(loc[0].name), loc[0].local5, nm(big5.name), big5.local5);
    // 철: 5년 도착 5,000대 이상, 가장 붐비는 달 지수(그 해 월평균=1) 높은 순
    const MN = U.month;
    const peak = x => Math.max(...x.season);
    const sea = o5.filter(x => x.total5 >= 5000).sort((a, b) => peak(b) - peak(a)).slice(0, 9);
    const seaHtml = sea.map((x, i) => `<div class="ob ${i === 0 ? 'hot' : ''}"><span class="n">${nm(x.name)}</span><div class="t"><i style="width:${peak(x) / peak(sea[0]) * 70}%"></i><span>${x.bestMonths.map(MN).join('·')}<small>${O.peak(peak(x).toFixed(1), MN(x.season.indexOf(Math.min(...x.season)) + 1))}</small></span></div></div>`).join('');
    const spring = sea.filter(x => x.bestMonths[0] >= 3 && x.bestMonths[0] <= 5).map(x => nm(x.name)).slice(0, 3);
    const seaLede = O.seaLede(U.seaList ? U.seaList(spring) : spring.join(U.list));
    let seenLocal = false;
    const oview = (m, from) => {
      $('#oreumchart').innerHTML = m === 'local' ? locHtml : m === 'season' ? seaHtml : cntHtml;
      $('#oreumlede').textContent = m === 'local' ? locLede : m === 'season' ? seaLede : cntLede;
      $('#oreumnote').hidden = m !== 'local';
      document.querySelectorAll('.oseg button').forEach(b => b.classList.toggle('on', b.dataset.o === m));
      if (m === 'local' && !seenLocal) { seenLocal = true; track('oreum_local_view', { from }); }
    };
    $('.oseg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) oview(b.dataset.o, 'toggle'); });
    if (location.hash === '#oreum-local') oview('local', 'link'); else oview('cnt');
    // 가을 9위 밖인데 1년 내내 찾는 차량이 많은 곳
    const alts = o.slice(8, 40).filter(x => x.year > 0).sort((a, b) => b.year - a.year).slice(0, 4);
    $('#alts').innerHTML = alts.map(x => `<li><b>${nm(x.name)}</b><span>${O.alt(x.aut.toLocaleString(), x.year.toLocaleString())}</span></li>`).join('');
    const g = [...data.gotjawal].sort((a, b) => b.aut - a.aut).slice(0, 3);
    $('#gotjawal').innerHTML = O.gj(g.map(x => `<b>${nm(x.name)}</b> ${O.car(x.aut.toLocaleString())}`).join(' · '));
    new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { track('oreum_view', { oreum: o[0].name }); try { gtag('event', 'page_view', { page_title: '오름 · 제주 숙소 동네', page_path: '/jeju-stay/oreum', page_location: location.origin + '/jeju-stay/oreum' }); } catch (e) {} ob.disconnect(); } }).observe($('#oreum'));
  }

  // ---------- feedback ----------
  document.querySelectorAll('[data-fb]').forEach(b => b.addEventListener('click', () => {
    track('feedback', { answer: b.dataset.fb });
    document.querySelectorAll('[data-fb]').forEach(x => x.disabled = true);
    $('#fbthanks').hidden = false;
  }));

  paint(); runQuiz(false); setStep(0); renderVs(false);
  show = v => {
    if (!VIEWS.includes(v)) v = 'map';
    document.querySelectorAll('main>.view').forEach(s => s.classList.toggle('on', s.id === v));
    document.querySelectorAll('.topnav a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
    document.body.dataset.view = v;
    sheet(false);
    scrollTo(0, 0);
    if (v === 'map') paint();
    if (after) { const f = after; after = null; requestAnimationFrame(f); }
    if (v === 'pick') runQuiz(false);
    if (v === 'story') renderStories();
    track('view', { view: v });
  };
  const fromHash = () => show(location.hash === '#oreum-local' ? 'oreum' : location.hash.slice(1));
  addEventListener('hashchange', fromHash);
  fromHash();
  // 모바일은 스크롤만 해도 높이가 바뀌어 resize가 온다 → 폭이 바뀔 때만 다시 그린다(결과 화면의 응답 상태 유지)
  let rt, lw = innerWidth; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (innerWidth === lw) return; lw = innerWidth; paint(); runQuiz(false); }, 150); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paint);
})();
