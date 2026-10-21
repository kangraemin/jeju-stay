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
    blue: { light: ['#d6e6fa', '#94bff1', '#4b91e4', '#1f5fb0', '#0d366b'], dark: ['#184f95', '#256abf', '#3987e5', '#6da7ec', '#b7d3f6'] },
    orange: { light: ['#fcdcc9', '#f5a179', '#eb6834', '#b9461c', '#682508'], dark: ['#8a3412', '#b9461c', '#eb6834', '#f39a6e', '#fbd0b6'] },
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

  const TOP5 = new Set(sorted('visitNative').slice(0, 5).map(d => d.name));
  function paint() {
    const m = METRICS[metric];
    const ramp = RAMP[m.ramp][dark() ? 'dark' : 'light'];
    const { breaks, cls } = classes(m.key, m);
    for (const d of dongs) {
      const p = main.paths[d.name];
      if (!p) continue;
      p.style.fill = ramp[cls(val(m.key, d))];
      p.classList.toggle('sel', d.name === selected);
      p.classList.toggle('hot5', metric === 'visit' && TOP5.has(d.name)); // 제목 '5곳에'를 지도에서 바로 보이게
      if (d.name === selected || (metric === 'visit' && TOP5.has(d.name))) p.parentNode.insertBefore(p, main.layer);
    }
    $('#jeju').classList.toggle('t5', metric === 'visit'); // 상위 5곳 외는 흐리게 → 몰림이 보이게
    const s = sorted(m.key);
    const pick = m.mid != null || m.steps ? [s[0], s[1], s.at(-1)] : s.slice(0, 3);
    if (selected && !pick.includes(byName[selected])) pick.push(byName[selected]);
    labels(main, pick.map(d => [d.name, m.fmt(d)]));
    const f = v => m.key === 'visitNative' ? man(v) : m.key === 'summerIdx' || m.key === 'trend' ? sgn(Math.round(v)) : m.key === 'foreignShare2025' ? v + '%' : Math.round(v) + '%';
    $('#legend').innerHTML = `<span>${m.lo}</span><span class="ramp">${ramp.map((c, i) => `<i style="background:${c}" title="${f(breaks[i])}~${f(breaks[i + 1])}"></i>`).join('')}</span><span>${m.hi}</span><span style="margin-left:auto">${f(breaks[0])} ~ ${f(breaks[5])}</span>${metric === 'visit' ? `<span class="lg5"><i></i>${esc(U.st.top5)}</span>` : ''}`;
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
    return { today, ymd, ids, no: today - s0 + 1, past: Array.from({ length: Math.max(0, today - first) }, (_, i) => today - 1 - i) };
  };
  const storiesP = fetch(ROOT + 'stories.json').then(r => r.json()).catch(() => null);
  const ST = U.st, SL = LG;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dlab = n => { const d = new Date(n * 864e5); return ST.date(d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCDay()); };
  // 시안 고르기(검사용): ?sd=a|b|c 이야기 화면, ?hd=a|b 첫 화면
  const QS = new URLSearchParams(location.search), SD = QS.get('sd') || 'd', HD = QS.get('hd') || 'c';
  const STRIP = SD === 'b' || SD === 'd', SHELF = SD === 'a' || SD === 'd';
  document.documentElement.dataset.hd = HD;
  if (QS.get('dr')) document.documentElement.dataset.dr = '1'; // 시안: 입구를 가로 한 줄로(지도가 첫 화면에)
  const fmtN = x => x.toLocaleString(LG === 'ko' ? 'ko-KR' : 'en-US');
  const r1 = x => Math.round(x * 10) / 10;
  const labs = v => v.lab[SL] || v.lab.ko;
  // 카드 큰 숫자: 대결 이야기는 배수(×1.2·7분의 1), 나머지는 원래 숫자
  const bigOf = s => {
    const v = s.viz, t = s.t[SL] || s.t.ko;
    if (!v.duel) return t.big;
    const [a, b, k] = v.duel, r = v.v[a] / v.v[b];
    // 차이가 1.15배 안쪽이면 배수 대신 대수 차이(1.0배 더 많다는 어색함 방지)
    return k === 'more' ? (r < 1.15 ? ST.diff(fmtN(v.v[a] - v.v[b])) : ST.ratio(r1(r))) : k === 'same' ? ST.same : fracOf(s) || Math.round(r * 100) + '%';
  };
  // 제목이 'N분의 1'이면 큰 숫자도 같은 말로(제목 7분의 1인데 숫자 14%로 엇갈리던 것)
  const fracOf = s => { const m = /(\d+)분의 1/.exec(s.t.ko.h); return m ? ST.frac(m[1]) : '';
  };
  const CAR = '<svg class="car" viewBox="0 0 24 14" aria-hidden="true"><path d="M4.5 3.2C5 2 5.8 1.5 7 1.5h9.6c1.1 0 1.9.5 2.4 1.6L20.6 6c1.4.3 2.4 1.4 2.4 2.8V11h-2.2a2.6 2.6 0 0 0-5.2 0H8.4a2.6 2.6 0 0 0-5.2 0H1V8.8C1 7.4 2 6.3 3.3 6zM6.4 6h5V3.3H7.2c-.4 0-.7.2-.8.5zm6.9 0h5.2l-1-2.2c-.2-.3-.5-.5-.9-.5h-3.3z"/><circle cx="5.8" cy="11.4" r="2.1"/><circle cx="18.2" cy="11.4" r="2.1"/></svg>';
  // 이야기 그림: 유형마다 다른 모양, 색은 테마 변수(주황=이긴 쪽·주인공, 파랑=다들 아는 곳)
  const VIZ = {
    duel(v, alt) {
      const L = labs(v), [a, b, k] = v.duel, A = v.v[a], B = v.v[b], r = A / B;
      // 차 그림: 몇 분의 1이거나, 하루에 대결이 여럿이면 둘째마다(막대만 이어지지 않게). 큰 쪽 10대, 끝 한 대는 잘라서
      if ((k === 'less' && r <= 0.2) || (alt && k === 'more' && r >= 1.25)) {
        const m = Math.max(A, B), cars = x => { const n = x / m * 10, f = n % 1; return CAR.repeat(Math.floor(n)) + (f > .05 ? `<span class="cfr"><span class="cg">${CAR}</span><span class="cf" style="width:${(f * 100).toFixed(0)}%">${CAR.replace('class="car"', `class="car" style="width:${(100 / f).toFixed(1)}%"`)}</span></span>` : ''); };
        return `<div class="pict"><div class="pr win"><span class="dn">${esc(L[a])}</span><b class="dv">${fmtN(A)}${ST.carU}</b><span class="cars">${cars(A)}</span></div>
          <div class="pr foe"><span class="dn">${esc(L[b])}</span><b class="dv">${fmtN(B)}${ST.carU}</b><span class="cars">${cars(B)}</span></div></div>`;
      }
      const mx = Math.max(A, B);
      const row = (n, x, c) => `<div class="dr ${c}"><div class="dh"><span class="dn">${esc(n)}</span><b class="dv">${fmtN(x)}${ST.carU}</b></div><div class="db"><i style="width:${(x / mx * 100).toFixed(1)}%"></i></div></div>`;
      return `<div class="duel">${row(L[a], A, 'win')}${row(L[b], B, 'foe')}</div>`;
    },
    months(v) { // 12달 막대 + 평소(=1) 기준선, 강조 달만 주황
      const mx = Math.max(...v.v, 1.2), w = 320 / 12, H = 76, Y = x => 92 - x / mx * H;
      return `<svg viewBox="0 0 356 112">${v.v.map((x, i) => { const hi = v.hi.includes(i + 1);
        return `<rect x="${i * w + 3}" y="${Y(x)}" width="${w - 6}" height="${92 - Y(x)}" rx="3" class="${hi ? 'mhi' : 'mlo'}"/>` +
          (hi ? `<text x="${i * w + w / 2}" y="${Math.min(Y(x), Y(1)) - 5}" class="vt vb" text-anchor="middle">${x.toFixed(2)}</text>` : '') +
          `<text x="${i * w + w / 2}" y="107" class="vt${hi ? ' vb' : ''}" text-anchor="middle">${i + 1}</text>`; }).join('')}
        <line x1="0" x2="322" y1="${Y(1)}" y2="${Y(1)}" class="avg"/><text x="325" y="${Y(1) + 4}" class="vt avgl">${esc(ST.avg)}</text></svg>`;
    },
    hour(v) { // 24시간: 저녁(18시~) 띠 + 첫 줄 면, 둘째 줄 선
      const mx = Math.max(...v.s.flat()), X = i => 6 + i / 23 * 308, Y = x => 84 - x / mx * 68;
      const pts = a => a.map((x, i) => X(i).toFixed(1) + ' ' + Y(x).toFixed(1));
      const L = labs(v);
      return `<svg viewBox="0 0 320 104"><rect x="${X(18)}" y="8" width="${X(23) - X(18) + 6}" height="76" class="nightb"/>
        <text x="${X(18) + 4}" y="20" class="vt">${esc(ST.night)}</text>
        <path d="M${X(0)} 84 L${pts(v.s[0]).join(' L')} L${X(23)} 84Z" class="ar0"/><path d="M${pts(v.s[0]).join(' L')}" class="ln0"/>
        ${v.s[1] ? `<path d="M${pts(v.s[1]).join(' L')}" class="ln1"/>` : ''}
        ${[0, 6, 12, 18].map(h => `<text x="${X(h)}" y="100" class="vt"${h ? ' text-anchor="middle"' : ''}>${U.hour(h)}</text>`).join('')}</svg>
        <p class="vl"><span class="k0">●</span> ${esc(L[0])} &nbsp;<span class="k1">●</span> ${esc(L[1] || '')}</p>`;
    },
    split(v) { // 100칸 와플
      const L = labs(v);
      return `<div class="wafw"><div class="waf">${Array.from({ length: 100 }, (_, i) => `<i${i < v.v ? ' class="on"' : ''}></i>`).join('')}</div>
        <p class="vl"><span class="k0">■</span> ${esc(L[0])} ${v.v}%<br><span class="kx">■</span> ${esc(L[1])} ${Math.round((100 - v.v) * 10) / 10}%</p></div>`;
    },
    bars(v) { // 대결 아닌 막대: 작은 정수면 점 줄(한 점=한 곳), 아니면 순위 막대
      const L = labs(v), mx = Math.max(...v.v);
      if (v.v.every(x => Number.isInteger(x) && x <= 30)) return `<div class="dots">${v.v.map((x, i) => `<div class="dt-r${i ? '' : ' win'}"><span class="dn">${esc(L[i])}</span><span class="ds">${'<i></i>'.repeat(x)}</span><b>${x}</b></div>`).join('')}</div>`;
      return `<div class="duel">${v.v.map((x, i) => `<div class="dr ${i ? 'rest' : 'win'}"><div class="dh"><span class="dn">${esc(L[i])}</span><b class="dv">${fmtN(x)}${v.u}</b></div><div class="db"><i style="width:${(x / mx * 100).toFixed(1)}%"></i></div></div>`).join('')}</div>`;
    },
  };
  // 하루 5개 보여 주는 순서: 대결을 맨 앞(커버)에 두고 다른 모양과 번갈아(배정은 그대로, 순서만)
  // 맨 앞(커버)은 그날 가장 센 숫자 — 1.2배 같은 약한 차이를 첫 카드로 두지 않는다
  const pow = s => { const v = s.viz;
    if (v.duel) { const [a, b, k] = v.duel, r = v.v[a] / v.v[b]; return k === 'more' ? r : k === 'less' ? 1 / r : 1.2; }
    const big = s.t.ko.big, m = /([\d.]+)\s*배/.exec(big); return m ? +m[1] : /[월시]$/.test(big) ? 1.5 : 2.2; };
  const dayIds = (D, n) => { const ids = [...D.ids(n)].sort((x, y) => pow(SP.stories[y]) - pow(SP.stories[x])), out = [ids.shift()],
      du = ids.filter(id => SP.stories[id].viz.duel), ot = ids.filter(id => !SP.stories[id].viz.duel), dl = !!SP.stories[out[0]].viz.duel;
    while (du.length || ot.length) { const a = dl ? ot : du, b = dl ? du : ot; if (a.length) out.push(a.shift()); if (b.length) out.push(b.shift()); } return out; };
  const vizOf = (s, alt) => s.viz.duel ? VIZ.duel(s.viz, alt) : VIZ[s.viz.type] ? VIZ[s.viz.type](s.viz) : '';
  const tyOf = s => s.viz.duel ? 'duel' : s.viz.type;
  // 숫자 덩이(N분의 1·35.5%가)는 줄에서 안 갈라지게
  const nobr = h => h.replace(/(\d[\d,.]*\s?(?:분의\s?\d+|%|배|곳|대)\S{0,2})/g, '<span class="nb">$1</span>');
  // 타일용 작은 그림(모양별로 한 눈에): 대결·막대=막대, 달=12칸, 시간=선, 나눔=띠
  const tiny = s => { const v = s.viz, sv = b => `<svg class="tiny" viewBox="0 0 120 34" preserveAspectRatio="xMinYMid meet" aria-hidden="true">${b}</svg>`;
    const hb = a => { const m = Math.max(...a); return sv(a.slice(0, 3).map((x, i) => `<rect x="0" y="${i * 12}" height="8" rx="3" width="${Math.max(3, x / m * 120)}" class="${i ? 'b0' : 'b1'}"/>`).join('')); };
    if (v.duel) { const [a, b] = v.duel; return hb([v.v[a], v.v[b]]); }
    if (v.type === 'months') { const m = Math.max(...v.v); return sv(v.v.map((x, i) => `<rect x="${i * 10 + 1}" y="${34 - x / m * 32}" width="8" height="${x / m * 32}" rx="1.5" class="${v.hi.includes(i + 1) ? 'b1' : 'b0'}"/>`).join('')); }
    if (v.type === 'hour') { const a = v.s[0], m = Math.max(...a); return sv(`<path d="M${a.map((x, i) => `${(i / 23 * 118 + 1).toFixed(1)} ${(32 - x / m * 30).toFixed(1)}`).join(' L')}" class="tl"/>`); }
    if (v.type === 'split') return sv(`<rect x="0" y="10" height="14" rx="4" width="120" class="b0"/><rect x="0" y="10" height="14" rx="4" width="${v.v * 1.2}" class="b1"/>`);
    if (v.type === 'bars') return hb(v.v);
    return ''; };
  // 내일 맞히기: 대결은 라벨로 문제를 만들고, 나머지는 stories.json q
  const quizOf = id => {
    const s = SP.stories[id];
    if (s.q) {
      const o = s.q.o;
      return { q: s.q.t[SL] || s.q.t.ko, ans: s.q.a,
        opts: o.m ? o.m.map(U.month) : o.h ? o.h.map(U.hour) : o.x ? o.x.map(ST.ratio) : o.n ? o.n.map(nm) : o.t || o[SL] || o.ko };
    }
    const v = s.viz, L = labs(v), [a, b, k] = v.duel;
    if (k === 'more') return { q: ST.more(L[b], L[a]), opts: [L[b], L[a]], ans: 1 };
    if (k === 'same') return { q: ST.sameQ(L[a], L[b]), opts: ST.sameO(L[b]), ans: 1 };
    const c = Math.round(v.v[a] / v.v[b] * 10), set = c <= 2 ? [c, c + 3, c + 6] : [Math.max(1, c - 3), c, c + 3];
    return { q: ST.less(L[a], L[b]), opts: set.map(ST.cars), ans: set.indexOf(c) };
  };
  const GK = 'jeju-guess';
  const guesses = () => { try { return JSON.parse(localStorage.getItem(GK)) || {}; } catch (e) { return {}; } };
  const card = (id, S, cover, alt) => {
    const s = S.stories[id]; if (!s) return '';
    const t = s.t[SL] || s.t.ko, g = s.link, my = guesses()[id];
    let res = '';
    if (my != null) { const Q = quizOf(id); res = `<p class="gres ${my === Q.ans ? 'ok' : 'no'}">${esc(my === Q.ans ? ST.right : ST.wrong(Q.opts[Q.ans]))}</p>`; }
    return `<article class="story ty-${tyOf(s)}${cover ? ' cover' : ''}" id="st-${id}"><p class="k">${esc(t.k)}</p><div class="big">${esc(bigOf(s))}</div><h3>${esc(t.h)}</h3>${res}
      <div class="viz" aria-hidden="true">${vizOf(s, alt)}</div><p class="sp">${esc(t.p)}</p>
      <div class="st-f"><span class="src">${esc(t.src)}</span><button class="stgo" type="button" data-sid="${id}">${ST.go[g.v]}</button></div></article>`;
  };
  const cut = h => { // 중국어는 띄어쓰기가 없어 글자 30%로 자른다(반전이 새지 않게)
    if (/^zh/.test(LG)) return h.slice(0, Math.max(6, Math.round(h.length * .3))) + '…';
    const w = h.split(' '); return w.slice(0, Math.max(2, Math.ceil(w.length * .45))).join(' ') + ' …'; };
  const tease = (id, n) => {
    const Q = quizOf(id), my = guesses()[id];
    const left = 24 - Math.floor((Date.now() + 9 * 36e5) % 864e5 / 36e5);
    return `<div class="story tease" data-qid="${id}"><p class="k">${esc(ST.tease(dlab(n)))}</p><span class="qcd">${esc(ST.left(left))}</span><p class="tz">${esc(ST.tz)} <b>${esc(cut((SP.stories[id].t[SL] || SP.stories[id].t.ko).h))}</b></p><h3>${esc(Q.q)}</h3>
      <div class="qopts">${Q.opts.map((o, i) => `<button type="button" data-qi="${i}"${my === i ? ' class="on"' : ''}>${esc(o)}</button>`).join('')}</div>
      <p class="qnote">${esc(my != null ? ST.picked(Q.opts[my]) : ST.guess)}</p></div>`;
  };
  const mini = id => { const s = SP.stories[id], t = s.t[SL] || s.t.ko;
    return `<button type="button" class="smini ty-${tyOf(s)}" data-mid="${id}"><b>${esc(bigOf(s))}</b><span>${esc(t.h)}</span></button>`; };
  let SP = null, pastOpen = false, selDay = null;
  function renderStories() {
    if (!SP) return;
    const D = StoryDays(SP), seen = [D.today, ...D.past].flatMap(D.ids);
    // 지도에서 고른 동네 이야기(이미 열린 것만, 2개까지) — 내일 이야기는 미리 안 보여 준다
    const mine = selected ? [...new Set(seen)].filter(id => (SP.stories[id].dongs || []).includes(selected)).slice(0, 2) : [];
    const today = dayIds(D, D.today), nPast = D.past.length * SP.per;
    let past = '';
    if (SHELF) past = D.past.length ? `<h3 class="shelfh">${esc(ST.shelf)}</h3>` + D.past.filter(n => !STRIP || n !== selDay).map(n => `<section class="shelf" data-day="${D.ymd(n)}"><h4>${esc(dlab(n))}<span class="hn">${SP.per} ›</span></h4><div class="rail">${dayIds(D, n).map(mini).join('')}</div><div class="shopen"></div></section>`).join('') : '';
    else if (SD === 'b') past = '';
    else past = !D.past.length ? '' : pastOpen ? D.past.map(n => `<div class="sday past"><h3>${esc(dlab(n))}</h3><div class="stories">${dayIds(D, n).map(id => card(id, SP)).join('')}</div></div>`).join('')
      : `<button type="button" class="pastmore">${esc(ST.moreBtn(nPast))}</button>`;
    $('#stories').innerHTML = (mine.length ? `<div class="sday mine"><h3>${esc(ST.mine(nm(selected)))}</h3><div class="stories">${mine.map(id => card(id, SP)).join('')}</div></div>` : '') +
      (STRIP ? strip(D) : '') +
      `<div class="sday"><h3>${esc(STRIP && selDay != null && selDay !== D.today ? dlab(selDay) : ST.today(dlab(D.today)))}<span class="sno">No.${(STRIP && selDay != null ? selDay - D.today : 0) + D.no}</span></h3><div class="stories">${dayCards(STRIP && selDay != null ? dayIds(D, selDay) : today, tease(dayIds(D, D.today + 1)[0], D.today + 1))}</div></div>` + past;
    renderHomeStory(D);
  }
  // 하루 카드: 커버 크게 → 내일 맞히기 → 나머지는 숫자+제목 타일(누르면 아래 펼침, 대결은 차 그림)
  const dayCards = (ids, tz) => card(ids[0], SP, true) + (tz || '') +
    `<h4 class="tileh">${esc(ST.tiles(ids.length - 1))}</h4><div class="tiles">${ids.slice(1).map(id => { const s = SP.stories[id], t = s.t[SL] || s.t.ko;
      return `<button type="button" class="stile ty-${tyOf(s)}" data-tid="${id}"><b>${esc(bigOf(s))}</b>${tiny(s)}<span>${esc(t.h)}</span></button>`; }).join('')}</div><div class="tileopen"></div>`;
  const md = n => { const d = new Date(n * 864e5); return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };
  const strip = D => `<div class="dwrap"><p class="dsh">${esc(ST.stripH)}</p><div class="dstrip" role="tablist">${[...D.past].reverse().concat(D.today).map(n => `<button type="button" role="tab" data-day="${n}" aria-selected="${n === (selDay ?? D.today)}"><small>${md(n)}</small><span>${esc(bigOf(SP.stories[dayIds(D, n)[0]]))}</span></button>`).join('')}<button type="button" class="dlock" data-go="tease"><small>${md(D.today + 1)}</small><span>🔒 ?</span></button></div></div>`;
  const openStory = id => {
    const g = SP.stories[id].link;
    track('story_open', { id, to: g.v });
    if (g.v === 'vs') { $('#vsA').value = g.a; $('#vsB').value = g.b; renderVs(true); go('vs'); }
    else if (g.v === 'oreum') { go('oreum'); const o = document.querySelector(`.oseg button[data-o="${g.o}"]`); if (o) o.click(); }
    else {
      const mb = document.querySelector(`.chips button[data-m="${g.m}"]`); if (mb) mb.click();
      go('map'); if (g.d && byName[g.d]) setTimeout(() => select(g.d, false), 0);
    }
  };
  const onGuess = e => {
    const b = e.target.closest('.tease [data-qi]'); if (!b) return false;
    const id = b.closest('.tease').dataset.qid, i = +b.dataset.qi, G = guesses();
    G[id] = i; try { localStorage.setItem(GK, JSON.stringify(G)); } catch (er) {}
    track('story_guess', { id, pick: i });
    renderStories(); return true;
  };
  $('#stories').addEventListener('click', e => {
    if (onGuess(e)) return;
    const sp = e.target.closest('.story.cover .sp'); if (sp) { sp.classList.toggle('open'); return; }
    const tl = e.target.closest('.stile');
    if (tl) { // 오늘 나머지 타일: 누르면 타일 아래 그 카드(다시 누르면 닫힘)
      const box = tl.parentElement.nextElementSibling, on = tl.classList.contains('on');
      tl.parentElement.querySelectorAll('.stile').forEach(x => x.classList.remove('on'));
      box.innerHTML = on ? '' : card(tl.dataset.tid, SP, false, true);
      if (!on) { tl.classList.add('on'); box.firstElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); track('story_tile', { id: tl.dataset.tid }); }
      return;
    }
    const m = e.target.closest('.smini');
    if (m) { // 지난 이야기 선반: 누르면 그 카드가 선반 아래 펼쳐진다(다시 누르면 닫힘)
      const sh = m.closest('.shelf'), box = sh.querySelector('.shopen'), on = m.classList.contains('on');
      sh.querySelectorAll('.smini').forEach(x => x.classList.remove('on'));
      box.innerHTML = on ? '' : card(m.dataset.mid, SP);
      if (!on) { m.classList.add('on'); sh.scrollIntoView({ block: 'start', behavior: 'smooth' }); track('story_more', { date: sh.dataset.day, id: m.dataset.mid }); }
      return;
    }
    if (e.target.closest('.dlock')) { $('#stories .tease').scrollIntoView({ block: 'center', behavior: 'smooth' }); track('story_more', { date: 'lock' }); return; }
    const dd = e.target.closest('.dstrip [data-day]');
    if (dd) { selDay = +dd.dataset.day; track('story_more', { date: 'strip', n: selDay }); renderStories(); return; }
    if (e.target.closest('.pastmore')) { pastOpen = true; track('story_more', { date: 'all' }); renderStories(); return; }
    const b = e.target.closest('.stgo'); if (b) openStory(b.dataset.sid);
  });

  // ---------- 첫 화면 입구 맛보기: 입구마다 안에 든 가장 의외인 숫자 하나 + 작은 그림 ----------
  (() => {
    const DT = ST.dt, s5 = sorted('visitNative').slice(0, 5), hot = new Set(s5.map(d => d.name));
    const p5 = (sum(s5.map(d => d.visitNative)) / total * 100).toFixed(1);
    const pk = sorted('nightShare').slice(0, 3);
    const A = byName['애월읍'], B = byName['연동'], sb = (data.oreum || []).find(o => o.name === '새별오름');
    const bar2 = (x, y, a, b) => { const m = Math.max(x, y), W = 84; return `<svg preserveAspectRatio="xMinYMid meet" class="dmini dvs" viewBox="0 0 200 40" aria-hidden="true"><text x="0" y="13" class="dl">${esc(a)}</text><rect x="62" y="3" height="13" rx="3" width="${x / m * W}" class="b1"/><text x="${66 + x / m * W}" y="14" class="dl dv1">${x}%</text><text x="0" y="34" class="dl">${esc(b)}</text><rect x="62" y="24" height="13" rx="3" width="${y / m * W}" class="b0"/><text x="${66 + y / m * W}" y="35" class="dl">${y}%</text></svg>`; };
    const T = {
      map: [DT.map(p5), `<svg preserveAspectRatio="xMinYMid meet" class="dmini dmap" viewBox="0 0 ${geo.w} ${geo.h}" aria-hidden="true">${Object.entries(geo.shapes).filter(([, s]) => !s.inset).map(([k, s]) => `<path d="${s.d}"${hot.has(k) ? ' class="hot"' : ''}/>`).join('')}</svg>`],
      vs: [DT.vs(nm(B.name), nm(A.name), B.nightShare, A.nightShare), bar2(B.nightShare, A.nightShare, nm(B.name), nm(A.name))],
      pick: [DT.pick, `<span class="dmini dpick" aria-hidden="true"><b class="on">${esc(DT.q3go)} →</b></span>`],
      oreum: sb ? [DT.oreum(nm(sb.name), r1(sb.season[9])), `<svg preserveAspectRatio="xMinYMid meet" class="dmini dore" viewBox="0 0 120 42" aria-hidden="true">${sb.season.map((x, i) => `<rect x="${i * 10 + 1}" y="${28 - x / 2.5 * 27}" width="8" height="${x / 2.5 * 27}" rx="1.5" class="${i === 9 ? 'b1' : 'b0'}"/>`).join('')}<text x="1" y="40" font-size="11" class="mt">${esc(U.month(1))}</text><text x="95" y="40" font-size="11" text-anchor="middle" class="mt on">${esc(U.month(10))}</text></svg>`] : null,
    };
    for (const [k, v] of Object.entries(T)) { const d = document.querySelector(`.door[data-hero="${k}"]`); if (d && v) d.insertAdjacentHTML('beforeend', `<em class="dt">${nobr(esc(v[0]))}</em>${v[1]}`); }
    if (HD === 'a') $('.hero-head').insertAdjacentHTML('afterend', '<div id="hcover" class="hcover"></div>');
    if (HD === 'c') $('.hero-head').insertAdjacentHTML('afterend', '<a id="hband" class="hband" href="#story" data-hero="band"></a>');
    // 지도 제목 = 지도 입구에 있던 의외인 숫자(모바일은 지도 입구 카드를 빼고 이 제목으로 대신)
    if (HD === 'c') $('.chips').insertAdjacentHTML('beforebegin', `<h2 class="maph">${nobr(esc(DT.map(p5)))}<small>${esc(ST.mapH)}</small></h2>`);
    if (HD === 'c') $('.stage').after($('.doorlinks'));
    // 지도 아래 빈자리 = 제목 '5곳'의 순위표(누르면 그 동네 선택)
    // 칸 %는 합이 제목(p5)과 같게 큰 나머지부터 올림
    const raw = s5.map(d => d.visitNative / total * 1000), fl = raw.map(Math.floor);
    raw.map((x, i) => [x - fl[i], i]).sort((a, b) => b[0] - a[0]).slice(0, Math.round(p5 * 10) - sum(fl)).forEach(([, i]) => fl[i]++);
    const pc5 = fl.map(x => (x / 10).toFixed(1));
    if (HD === 'c') $('.stage').insertAdjacentHTML('afterend', `<div class="top5"><h3>${esc(DT.rank)}</h3><ol>${s5.map((d, i) => `<li><button type="button" data-t5="${d.name}"><b>${i + 1}</b><span>${esc(nm(d.name))}</span><small>${pc5[i]}%</small></button></li>`).join('')}</ol><a class="t5go" href="#pick">${esc(DT.next)}</a></div>`);
    document.addEventListener('click', e => { const t = e.target.closest('[data-t5]'); if (!t) return; select(t.dataset.t5); track('top5', { dong: t.dataset.t5 }); $('.mapbox').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    // 비교 입구는 입구 그림과 같은 두 동네로 연다
    $('.door[data-hero="vs"]').addEventListener('click', () => { $('#vsA').value = B.name; $('#vsB').value = A.name; renderVs(); }); // 표·CSV 링크는 지도 아래로(여행자 흐름 안 끊게)
    if (HD === 'c') $('#hband').addEventListener('click', () => track('hero_card', { card: 'band' }));
    // 아래 동네 패널은 지도가 화면에 들어올 때만(첫 화면 입구를 가리지 않게)
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => document.body.classList.toggle('mapin', e.isIntersecting)), { rootMargin: '0px 0px -40% 0px' }).observe($('.stage'));
    else document.body.classList.add('mapin');
  })();
  // 첫 화면 이야기: hd=a는 오늘 첫 이야기를 크게(+이야기 입구엔 내일 맞히기), hd=b는 이야기 입구에 오늘 숫자
  function renderHomeStory(D) {
    const sd = document.querySelector('.door[data-hero="story"]'); if (!sd) return;
    sd.querySelectorAll('.dt,.dmini').forEach(x => x.remove());
    const id0 = dayIds(D, D.today)[0], s0 = SP.stories[id0];
    if (HD === 'c') {
      $('#hband').innerHTML = `<small>${esc(ST.cover)} · No.${D.no}</small><b>${esc(bigOf(s0))}</b><em>${nobr(esc((s0.t[SL] || s0.t.ko).h))}</em>`;
      const Q = quizOf(dayIds(D, D.today + 1)[0]);
      $('#hband').insertAdjacentHTML('beforeend', `<i class="hq"><small>${esc(ST.dt.qz)}</small>${esc(Q.q)} <u>${esc(ST.dt.ans)}</u></i>`); // 모바일은 이야기 입구 대신 띠에 내일 문제
      const qid = dayIds(D, D.today + 1)[0], my = guesses()[qid];
      sd.dataset.qid = qid;
      sd.insertAdjacentHTML('beforeend', `<em class="dt">${esc(Q.q)}</em><span class="dqo">${Q.opts.map((o, i) => `<span role="button" data-hq="${i}"${my === i ? ' class="on"' : ''}>${esc(o)}</span>`).join('')}</span><span class="dq">?</span>`);
    } else if (HD === 'a') {
      $('#hcover').innerHTML = `<p class="hck">${esc(ST.today(dlab(D.today)))}</p>` + card(id0, SP, true);
      const Q = quizOf(dayIds(D, D.today + 1)[0]);
      sd.insertAdjacentHTML('beforeend', `<em class="dt">${esc(Q.q)}</em><span class="dq">?</span>`);
    } else {
      sd.insertAdjacentHTML('beforeend', `<em class="dt">${esc((s0.t[SL] || s0.t.ko).h)}</em><span class="dq">${esc(bigOf(s0))}</span>`);
    }
  }
  document.addEventListener('click', e => { const h = e.target.closest('#hcover .stgo'); if (h) openStory(h.dataset.sid); });
  // 홈에서 고른 답은 이야기 화면 맞히기와 같은 기록
  document.addEventListener('click', e => {
    const o = e.target.closest('.door [data-hq]'); if (!o) return;
    const id = o.closest('.door').dataset.qid, G = guesses(); G[id] = +o.dataset.hq;
    try { localStorage.setItem(GK, JSON.stringify(G)); } catch (er) {}
    track('story_guess', { id, pick: +o.dataset.hq, from: 'home' });
  }, true);
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
