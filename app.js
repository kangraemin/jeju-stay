(async function () {
  const $ = s => document.querySelector(s);
  const track = (name, params) => { try { gtag('event', name, params || {}); } catch (e) {} };
  const [data, geo] = await Promise.all([fetch('data.json').then(r => r.json()), fetch('geo.json').then(r => r.json())]);
  const dongs = data.dongs;
  const byName = Object.fromEntries(dongs.map(d => [d.name, d]));
  const NS = 'http://www.w3.org/2000/svg';
  const dark = () => matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.dataset.theme !== 'light';

  const man = n => n >= 1e8 ? (n / 1e8).toFixed(2).replace(/\.?0+$/, '') + '억' : Math.round(n / 1e4).toLocaleString() + '만';
  const sum = a => a.reduce((x, y) => x + y, 0);
  const val = (key, d) => key === 'stay' ? d.indShare['숙박업'] : key === 'eat' ? d.indShare['음식점업'] : d[key];
  const rankOf = (key, d) => [...dongs].sort((a, b) => val(key, b) - val(key, a)).indexOf(d) + 1;
  const sorted = key => [...dongs].sort((a, b) => val(key, b) - val(key, a));
  const total = sum(dongs.map(d => d.visitNative));
  $('.eyebrow').textContent = `43개 읍면동 · 관광객 방문 ${man(total)} 회 데이터`;

  // validated with dataviz validate_palette.js (ordinal, light #fbfbf9 / dark #131413)
  const RAMP = {
    blue: { light: ['#86b6ef', '#3987e5', '#256abf', '#184f95', '#0d366b'], dark: ['#184f95', '#256abf', '#3987e5', '#6da7ec', '#b7d3f6'] },
    orange: { light: ['#f39a6e', '#eb6834', '#c9501f', '#9a3a13', '#682508'], dark: ['#8a3412', '#b9461c', '#eb6834', '#f39a6e', '#fbd0b6'] },
    div: { light: ['#1c5cab', '#6da7ec', '#e4e3de', '#ef8e8a', '#b8302f'], dark: ['#256abf', '#184f95', '#3a3b38', '#9c3534', '#d34544'] },
  };

  const METRICS = {
    visit: { key: 'visitNative', ramp: 'blue', fmt: d => man(d.visitNative) + '회', lo: '적음', hi: '많음',
      insight() {
        const s = sorted('visitNative');
        const top5 = sum(s.slice(0, 5).map(d => d.visitNative)) / total * 100;
        return `<div class="big">${top5.toFixed(1)}<small>%</small></div><p>관광객 방문의 3분의 1 넘게가 <strong>${s.slice(0, 5).map(d => d.name).join('·')}</strong> 다섯 곳에 몰립니다. 1위 ${s[0].name}에는 제주국제공항이 있습니다.</p>`;
      } },
    night: { key: 'nightShare', ramp: 'orange', fmt: d => d.nightShare + '%', lo: '낮 위주', hi: '저녁 위주',
      insight() {
        const s = sorted('nightShare'), t = s[0], u = byName['우도면'];
        return `<div class="big">${t.nightShare}<small>%</small></div><p>서귀포 <strong>${t.name}</strong>은 관광객 카드 소비의 ${t.nightShare}%가 저녁 6시 이후입니다. 다음은 ${s[1].name} ${s[1].nightShare}%, ${s[2].name} ${s[2].nightShare}%. 우도는 ${u.nightShare}%로 해가 지면 조용합니다.</p>`;
      } },
    tour: { key: 'tourSpendShare', ramp: 'div', mid: 50, fmt: d => '관광객 ' + d.tourSpendShare + '%', lo: '도민 생활권', hi: '관광지',
      insight() {
        const s = sorted('tourSpendShare');
        const n = dongs.filter(d => d.tourSpendShare >= 50).length;
        return `<div class="big">${n}<small>곳 / 43</small></div><p>카드 매출의 절반 넘게를 관광객이 쓰는 동네입니다. <strong>${s[0].name}</strong> ${s[0].tourSpendShare}%가 가장 높고, <strong>${s.at(-1).name}</strong>은 ${s.at(-1).tourSpendShare}%로 도민 동네입니다.</p>`;
      } },
    stay: { key: 'stay', ramp: 'blue', fmt: d => '숙박 ' + d.indShare['숙박업'] + '%', lo: '낮음', hi: '높음',
      insight() {
        const s = sorted('stay');
        return `<div class="big">${val('stay', s[0])}<small>%</small></div><p><strong>${s[0].name}</strong>은 관광객 카드 소비의 ${val('stay', s[0])}%가 숙박입니다. 다음은 ${s[1].name} ${val('stay', s[1])}%, ${s[2].name} ${val('stay', s[2])}%.</p>`;
      } },
  };

  // 5 classes: quantiles (~8-9 dongs each); diverging metric uses fixed steps around 50%
  function classes(key, m) {
    const vals = dongs.map(d => val(key, d)).sort((a, b) => a - b);
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
        t.textContent = '추자면';
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
    for (const [name, v] of items) {
      const c = [...geo.shapes[name].c];
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
    const pick = m.mid != null ? [s[0], s[1], s.at(-1)] : s.slice(0, 3);
    if (selected && !pick.includes(byName[selected])) pick.push(byName[selected]);
    labels(main, pick.map(d => [d.name, m.fmt(d)]));
    const f = v => m.key === 'visitNative' ? man(v) : Math.round(v) + '%';
    $('#legend').innerHTML = `<span>${m.lo}</span><span class="ramp">${ramp.map((c, i) => `<i style="background:${c}" title="${f(breaks[i])}~${f(breaks[i + 1])}"></i>`).join('')}</span><span>${m.hi}</span><span style="margin-left:auto">${f(breaks[0])} ~ ${f(breaks[5])}</span>`;
    $('#insight').innerHTML = m.insight();
  }

  const tip = $('#tip'), box = $('.mapbox');
  $('#jeju').addEventListener('pointermove', e => {
    const n = e.target.dataset && e.target.dataset.name;
    if (!n || e.pointerType === 'touch') { tip.hidden = true; return; }
    const r = box.getBoundingClientRect();
    tip.innerHTML = `<b>${n}</b>${METRICS[metric].fmt(byName[n])}`;
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

  // ---------- 숙소 결정 응답 + 숙소 검색 이동 (실사용 성과 측정) ----------
  const decided = {};
  const decision = (name, from) => decided[name]
    ? `<div class="dec done">${name} 응답 고맙습니다. 숙소 고를 때 참고되면 좋겠어요.</div>`
    : `<div class="dec" data-dong="${name}" data-from="${from}">
      <p>${name}에 숙소 잡을 건가요?</p>
      <div class="decbtns"><button type="button" data-dec="yes">이 동네로 정했어요</button><button type="button" data-dec="maybe">고민 중</button><button type="button" data-dec="no">다른 데로</button></div>
      <a class="stay" data-search href="https://map.naver.com/p/search/${encodeURIComponent('제주 ' + name + ' 숙소')}" target="_blank" rel="noopener">네이버 지도에서 ${name} 숙소 보기 ↗</a></div>`;
  document.addEventListener('click', e => {
    const box = e.target.closest('.dec[data-dong]'); if (!box) return;
    const dong = box.dataset.dong, from = box.dataset.from;
    const b = e.target.closest('[data-dec]');
    if (b) {
      decided[dong] = b.dataset.dec;
      track('stay_decision', { dong, answer: b.dataset.dec, from });
      box.querySelector('.decbtns').innerHTML = `<span class="decok">${b.dataset.dec === 'yes' ? '좋은 여행 되세요!' : '응답 고맙습니다'}</span>`;
    }
    if (e.target.closest('[data-search]')) track('stay_search', { dong, from });
  });

  // ---------- dong card ----------
  function curveSVG(d, w = 300, h = 96) {
    const pad = { l: 4, r: 42, t: 8, b: 18 };
    const norm = a => { const t = sum(a) || 1; return a.map(x => x / t * 100); };
    const A = norm(d.hourTour), B = norm(d.hourLocal);
    const max = Math.max(...A, ...B);
    const X = i => pad.l + i / 23 * (w - pad.l - pad.r), Y = v => pad.t + (1 - v / max) * (h - pad.t - pad.b);
    const line = a => a.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join('');
    const ticks = [0, 6, 12, 18].map(i => `<text class="tk" x="${X(i)}" y="${h - 4}" text-anchor="middle">${i}시</text>`).join('');
    const ya = Y(A[23]), yb = Y(B[23]), gap = Math.abs(ya - yb) < 12 ? (ya < yb ? [0, 12] : [12, 0]) : [0, 0];
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${d.name} 시간대별 카드 소비">
      <rect class="band" x="${X(18)}" y="${pad.t}" width="${X(23) - X(18)}" height="${h - pad.t - pad.b}" rx="3"/>
      <line class="ax" x1="${pad.l}" x2="${w - pad.r}" y1="${h - pad.b}" y2="${h - pad.b}"/>
      <path class="ln" d="${line(B)}" stroke="var(--s-local)"/>
      <path class="ln" d="${line(A)}" stroke="var(--s-tour)"/>
      <text class="dl" x="${X(23) + 5}" y="${ya + 4 + gap[0]}" fill="var(--ink)">관광객</text>
      <text class="dl" x="${X(23) + 5}" y="${yb + 4 + gap[1]}" fill="var(--ink2)">도민</text>
      ${ticks}</svg>`;
  }

  function select(name, fromMap) {
    selected = name;
    const d = byName[name];
    $('#card').innerHTML = `
      <div class="card-h"><h3>${d.name}</h3><span>${d.city}</span></div>
      <div class="nums">
        <div class="num"><b>${rankOf('visitNative', d)}<small>위</small></b><span>관광객 방문<br>43곳 중</span></div>
        <div class="num"><b>${d.nightShare}<small>%</small></b><span>저녁 6시 이후<br>소비 비중</span></div>
        <div class="num"><b>${d.tourSpendShare}<small>%</small></b><span>매출 중<br>관광객 몫</span></div>
      </div>
      <div class="curve">${curveSVG(d)}<p class="capt">시간대별 카드 소비 비중 · 회색 띠 18~24시</p></div>
      ${d.places && d.places.length ? `<p class="places">차로 많이 가는 곳 <b>${d.places.slice(0, 3).map(p => p[0]).join(' · ')}</b></p>` : ''}
      ${d.ri && d.ri.length ? `<p class="places">관광객이 많이 머문 리 <b>${d.ri.slice(0, 3).map(r => r[0]).join(' · ')}</b></p>` : ''}
      ${decision(d.name, 'card')}
      <div class="cardbtns"><button class="btn ghost" data-vs="A">왼쪽 비교에 넣기</button><button class="btn ghost" data-vs="B">오른쪽에 넣기</button></div>`;
    $('#card').querySelectorAll('[data-vs]').forEach(b => b.addEventListener('click', () => {
      $('#vs' + b.dataset.vs).value = name; renderVs(true); document.getElementById('vs').scrollIntoView();
    }));
    paint();
    if (fromMap) track('dong_open', { dong: name, metric });
  }
  $('#card').innerHTML = '<p class="hint">지도에서 동네를 누르면 핵심 숫자가 나옵니다</p>';

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
    if (a.focus === 'stay') return `관광객 소비 중 숙박 ${val('stay', d)}% · 방문 ${rankOf('visitNative', d)}위`;
    if (a.focus === 'eat') return `관광객 소비 중 음식점 ${val('eat', d)}% · 저녁 ${d.nightShare}%`;
    if (a.night) return `저녁 소비 ${d.nightShare}% · 방문 ${rankOf('visitNative', d)}위`;
    if (a.vibe) return `매출 중 관광객 ${d.tourSpendShare}% · 방문 ${rankOf('visitNative', d)}위`;
    return `관광객 방문 ${rankOf('visitNative', d)}위 · 저녁 소비 ${d.nightShare}%`;
  }
  function runQuiz(log) {
    const pool = dongs.filter(d => d.busyPct > 15);
    const top = pool.map(d => [d, score(d, ans)]).sort((x, y) => y[1] - x[1]).slice(0, 3).map(x => x[0]);
    for (const [n, p] of Object.entries(pin.paths)) p.classList.toggle('hit', top.some(d => d.name === n));
    const u = unit(pin.svg);
    pin.svg.querySelector('.insetlbl').style.fontSize = 11 * u + 'px';
    pin.layer.innerHTML = top.map((d, i) => { const c = geo.shapes[d.name].c; return `<g class="pin"><circle cx="${c[0]}" cy="${c[1]}" r="${13 * u}" style="stroke-width:${2.5 * u}"/><text x="${c[0]}" y="${c[1]}" style="font-size:${14 * u}px">${i + 1}</text></g>`; }).join('');
    $('#picks').innerHTML = top.map((d, i) => `<li data-n="${d.name}"><span class="rk">${i + 1}</span><div><h3>${d.name}<small>${d.city}</small></h3><p class="why">${why(d, ans)}</p></div><span class="go">›</span></li>`).join('') + `<li class="picksdec">${decision(top[0].name, 'quiz')}</li>`;
    $('#picks').querySelectorAll('li[data-n]').forEach(li => li.addEventListener('click', () => {
      select(li.dataset.n, false); document.getElementById('map').scrollIntoView(); track('dong_open', { dong: li.dataset.n, from: 'quiz' });
    }));
    if (log) track('quiz_done', { ...ans, top: top.map(d => d.name).join(',') });
  }
  document.querySelectorAll('.quiz .seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    const k = seg.dataset.k; ans[k] = k === 'focus' ? b.dataset.v : +b.dataset.v;
    runQuiz(true);
  }));

  // ---------- stories ----------
  {
    const u = byName['우도면'], j = byName['정방동'];
    const o = data.oreum, ot = sum(o.map(x => x.aut)), top = [...o].sort((a, b) => b.aut - a.aut)[0];
    const ae = byName['애월읍'], jo = byName['조천읍'];
    const mini = (d, color) => {
      const t = sum(d.hourTour) || 1, a = d.hourTour.map(x => x / t * 100), mx = Math.max(...u.hourTour.map(x => x / sum(u.hourTour) * 100), ...j.hourTour.map(x => x / sum(j.hourTour) * 100));
      const X = i => i / 23 * 136 + 2, Y = v => 40 - v / mx * 36;
      return `<path d="${a.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join('')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
    };
    $('#stories').innerHTML = `
      <article class="story"><p class="k">저녁</p><h3>우도는 해 지면 조용하고,<br>서귀포 정방동은 그때부터</h3>
        <div class="big">${u.nightShare}%<small>vs</small> ${j.nightShare}%</div>
        <p>관광객 카드 소비 중 저녁 6시 이후 비중. 우도면 vs 정방동.</p>
        <svg viewBox="0 0 140 44" style="width:100%;margin-top:10px;overflow:visible" aria-hidden="true"><rect x="${18 / 23 * 136 + 2}" y="2" width="${5 / 23 * 136}" height="40" rx="2" fill="var(--chip)"/>${mini(u, 'var(--s-tour)')}${mini(j, 'var(--accent)')}</svg>
        <p class="capt"><span style="color:var(--s-tour)">━</span> 우도면 &nbsp;<span style="color:var(--accent)">━</span> 정방동 · 0~23시, 회색 띠 18~24시</p></article>
      <article class="story"><p class="k">가을 오름</p><h3>오름 95곳 가운데<br>${top.name} 한 곳이</h3>
        <div class="big">${(top.aut / ot * 100).toFixed(1)}%<small>차량 도착</small></div>
        <p>2025년 10~11월 티맵 차량 도착 ${ot.toLocaleString()}대 중 ${top.aut.toLocaleString()}대. 덜 붐비는 대안은 아래 오름 섹션에.</p></article>
      <article class="story"><p class="k">애월 vs 함덕</p><h3>방문은 애월이 많고,<br>숙박 비중은 조천이 높다</h3>
        <div class="big">${man(ae.visitNative)}<small>vs</small> ${man(jo.visitNative)}</div>
        <p>1년 관광객 방문 애월읍 vs 조천읍(함덕). 저녁 소비 비중은 ${ae.nightShare}% vs ${jo.nightShare}%, 숙박 비중은 ${val('stay', ae)}% vs ${val('stay', jo)}%.</p></article>`;
  }

  // ---------- compare (butterfly) ----------
  const ROWS = [
    ['관광객 방문(1년)', d => d.visitNative, d => man(d.visitNative)],
    ['가을(10~11월) 방문 비중', d => d.autShare, d => d.autShare + '%'],
    ['저녁 6시 이후 소비', d => d.nightShare, d => d.nightShare + '%'],
    ['매출 중 관광객 몫', d => d.tourSpendShare, d => d.tourSpendShare + '%'],
    ['관광객 소비 중 음식점', d => val('eat', d), d => val('eat', d) + '%'],
    ['관광객 소비 중 숙박', d => val('stay', d), d => val('stay', d) + '%'],
  ];
  const opts = [...dongs].sort((a, b) => a.name.localeCompare(b.name, 'ko')).map(d => `<option>${d.name}</option>`).join('');
  $('#vsA').innerHTML = opts; $('#vsB').innerHTML = opts;
  const qs = new URLSearchParams(location.search);
  $('#vsA').value = byName[qs.get('a')] ? qs.get('a') : '애월읍';
  $('#vsB').value = byName[qs.get('b')] ? qs.get('b') : '조천읍';
  if (qs.get('a')) track('shared_visit', { a: qs.get('a'), b: qs.get('b') });
  function renderVs(log) {
    const A = byName[$('#vsA').value], B = byName[$('#vsB').value];
    $('#fly').innerHTML = ROWS.map(([lb, f, fmt]) => {
      const mx = Math.max(...dongs.map(f)), a = f(A), b = f(B);
      return `<div class="fr"><div class="lb">${lb}</div><div class="bars">
        <div class="l ${a < b ? 'lose' : ''}"><i style="width:${a / mx * 74}%"></i><span>${fmt(A)}</span></div>
        <div class="r ${b < a ? 'lose' : ''}"><i style="width:${b / mx * 74}%"></i><span>${fmt(B)}</span></div></div></div>`;
    }).join('') + `<p class="capt" style="padding:4px 0 10px">막대 길이는 43개 동네 중 최댓값 기준</p>`;
    if (log) track('compare', { a: A.name, b: B.name });
  }
  $('#vsA').addEventListener('change', () => renderVs(true));
  $('#vsB').addEventListener('change', () => renderVs(true));
  $('#share').addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?a=${encodeURIComponent($('#vsA').value)}&b=${encodeURIComponent($('#vsB').value)}#vs`;
    try {
      if (navigator.share) await navigator.share({ title: '제주 동네 비교', url });
      else { await navigator.clipboard.writeText(url); $('#share').textContent = '링크를 복사했어요'; }
    } catch (e) {}
    track('share', { a: $('#vsA').value, b: $('#vsB').value });
  });

  // ---------- oreum ----------
  {
    const o = [...data.oreum].sort((a, b) => b.aut - a.aut), ot = sum(o.map(x => x.aut));
    const top = o.slice(0, 8), rest = o.slice(8), rs = sum(rest.map(x => x.aut));
    const top3 = sum(o.slice(0, 3).map(x => x.aut)) / ot * 100;
    $('#oreumlede').textContent = `지난가을(2025년 10~11월) 티맵으로 오름 ${o.length}곳에 도착한 차량 ${ot.toLocaleString()}대 중 상위 3곳이 ${top3.toFixed(1)}%입니다.`;
    const mx = Math.max(o[0].aut, rs);
    const row = (n, v, cls, sub) => `<div class="ob ${cls}"><span class="n">${n}</span><div class="t"><i style="width:${v / mx * 70}%"></i><span>${v.toLocaleString()}<small>${sub}</small></span></div></div>`;
    $('#oreumchart').innerHTML = top.map((x, i) => row(x.name, x.aut, i === 0 ? 'hot' : '', (x.aut / ot * 100).toFixed(1) + '%')).join('') +
      row(`나머지 ${rest.length}곳`, rs, 'rest', (rs / ot * 100).toFixed(1) + '%');
    // 가을 9위 밖인데 1년 내내 찾는 차량이 많은 곳
    const alts = o.slice(8, 40).filter(x => x.year > 0).sort((a, b) => b.year - a.year).slice(0, 4);
    $('#alts').innerHTML = alts.map(x => `<li><b>${x.name}</b><span>가을 ${x.aut.toLocaleString()}대 · 1년 ${x.year.toLocaleString()}대</span></li>`).join('');
    const g = [...data.gotjawal].sort((a, b) => b.aut - a.aut).slice(0, 3);
    $('#gotjawal').innerHTML = `숲길을 걷고 싶다면 곶자왈: ${g.map(x => `<b>${x.name}</b> ${x.aut.toLocaleString()}대`).join(' · ')} (같은 기간 티맵 도착)`;
    new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { track('oreum_view'); ob.disconnect(); } }).observe($('#oreum'));
  }

  // ---------- feedback ----------
  document.querySelectorAll('[data-fb]').forEach(b => b.addEventListener('click', () => {
    track('feedback', { answer: b.dataset.fb });
    document.querySelectorAll('[data-fb]').forEach(x => x.disabled = true);
    $('#fbthanks').hidden = false;
  }));

  paint(); runQuiz(false); renderVs(false);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { paint(); runQuiz(false); }, 150); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paint);
})();
