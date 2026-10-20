(async function () {
  const $ = s => document.querySelector(s);
  const track = (name, params) => { try { gtag('event', name, params || {}); } catch (e) {} };
  // 화면 전환: 주소의 #map·#pick·#vs·#oreum·#story·#how 중 하나만 보인다
  const VIEWS = ['map', 'pick', 'vs', 'oreum', 'story', 'how'];
  const go = v => { if (location.hash === '#' + v) show(v); else location.hash = v; };
  let show = () => {};
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
  // 여름(7·8월) 지수: 5년(2019·2022~2025) 해마다 월평균=1로 놓고 7·8월 평균 - 1 (%)
  dongs.forEach(d => { d.summerIdx = d.summer5; });
  const sgn = v => (v >= 0 ? '+' : '') + v + '%';
  const top1 = d => d.countries && d.countries[0];
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
    summer: { key: 'summerIdx', ramp: 'orange', fmt: d => '여름 ' + (d.summerIdx >= 0 ? '+' : '') + d.summerIdx + '%', lo: '여름에 덜', hi: '여름에 더',
      insight() {
        const s = sorted('summerIdx');
        const big = s.filter(d => rankOf('visitNative', d) <= 10).slice(0, 2);
        return `<div class="big">+${s[0].summerIdx}<small>%</small></div><p>5년(2019·2022~2025) 평균으로 7·8월 방문이 1년 평균보다 가장 많이 느는 곳은 <strong>${s[0].name}</strong>입니다. 방문 상위 10곳 중에서는 해변 마을이 있는 <strong>${big.map(d => `${d.name}(+${d.summerIdx}%)`).join('·')}</strong>이 여름에 특히 붐빕니다.</p>`;
      } },
    trend: { key: 'trend', ramp: 'div', steps: [-20, -5, 5, 20], fmt: d => '2019년보다 ' + sgn(d.trend), lo: '줄었음', hi: '늘었음',
      insight() {
        const s = sorted('trend').filter(d => d.visit2025 > 1e6);
        return `<div class="big">${sgn(s[0].trend)}</div><p>2019년보다 2025년 관광객 방문이 가장 많이 는 곳은 <strong>${s[0].name}</strong>, 다음은 ${s[1].name} ${sgn(s[1].trend)}, ${s[2].name} ${sgn(s[2].trend)}입니다. 줄어든 곳은 <strong>${s.at(-1).name}</strong> ${sgn(s.at(-1).trend)}, ${s.at(-2).name} ${sgn(s.at(-2).trend)}, ${s.at(-3).name} ${sgn(s.at(-3).trend)}입니다.</p>`;
      } },
    foreign: { key: 'foreignShare2025', ramp: 'blue', fmt: d => '외국인 ' + d.foreignShare2025 + '%', lo: '적음', hi: '많음',
      insight() {
        const s = sorted('foreignShare2025'), cn = [...dongs].filter(d => d.foreignSpend > 1e10 && top1(d)).sort((a, b) => (b.countries.find(c => c[0] === '중국') || [0, 0])[1] - (a.countries.find(c => c[0] === '중국') || [0, 0])[1]);
        const tw = [...dongs].filter(d => d.foreignSpend > 1e10).sort((a, b) => ((b.countries.find(c => c[0] === '대만') || [0, 0])[1]) - ((a.countries.find(c => c[0] === '대만') || [0, 0])[1]))[0];
        return `<div class="big">${s[0].foreignShare2025}<small>%</small></div><p>2025년 방문 중 외국인 비중이 가장 높은 곳은 <strong>${s[0].name}</strong>, 다음은 ${s[1].name}·${s[2].name}입니다. 외국인 카드 소비는 <strong>${cn[0].name}·${cn[1].name}</strong>에서 중국이 40% 넘고, <strong>${tw.name}</strong>은 대만이 ${(tw.countries.find(c => c[0] === '대만') || [0, 0])[1]}%입니다.</p>`;
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
      <p class="places">덜 붐비는 달 <b>${d.quietMonth}월</b> · 붐비는 달 <b>${d.busyMonth}월</b> <span class="capt">(5년 평균)</span></p>
      <p class="places">2019년보다 방문 <b>${sgn(d.trend)}</b> · 외국인 <b>${d.foreignShare2025}%</b>${top1(d) && d.foreignSpend > 1e9 ? ` · 외국인 카드 소비 1위 <b>${top1(d)[0]} ${top1(d)[1]}%</b>` : ''}</p>
      ${d.places && d.places.length ? `<p class="places">차로 많이 가는 곳 <b>${d.places.slice(0, 3).map(p => p[0]).join(' · ')}</b></p>` : ''}
      ${d.ri && d.ri.length ? `<p class="places">관광객이 많이 머문 리 <b>${d.ri.slice(0, 3).map(r => r[0]).join(' · ')}</b></p>` : ''}
      ${decision(d.name, 'card')}
      <div class="cardbtns"><button class="btn ghost" data-vs="A">왼쪽 비교에 넣기</button><button class="btn ghost" data-vs="B">오른쪽에 넣기</button></div>`;
    $('#card').querySelectorAll('[data-vs]').forEach(b => b.addEventListener('click', () => {
      $('#vs' + b.dataset.vs).value = name; renderVs(true); go('vs');
    }));
    paint();
    try { gtag('event', 'page_view', { page_title: name + ' · 제주 숙소 동네', page_path: '/jeju-stay/d/' + name, page_location: location.origin + '/jeju-stay/d/' + encodeURIComponent(name) }); } catch (e) {}
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
      select(li.dataset.n, false); go('map'); track('dong_open', { dong: li.dataset.n, from: 'quiz' });
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
    const tr = [...dongs].filter(d => d.visit2025 > 1e6).sort((a, b) => b.trend - a.trend), up = tr[0], dn = tr.at(-1);
    const nh = byName['노형동'], ih = byName['이호동'];
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
      <article class="story"><p class="k">가을 오름</p><h3>오름 ${o.length}곳 가운데<br>${top.name} 한 곳이</h3>
        <div class="big">${(top.aut / ot * 100).toFixed(1)}%<small>차량 도착</small></div>
        <p>2025년 10~11월 티맵 차량 도착 ${ot.toLocaleString()}대 중 ${top.aut.toLocaleString()}대. 덜 붐비는 대안은 아래 오름 섹션에.</p></article>
      <article class="story"><p class="k">애월 vs 함덕</p><h3>방문은 애월이 많고,<br>숙박 비중은 조천이 높다</h3>
        <div class="big">${man(ae.visitNative)}<small>vs</small> ${man(jo.visitNative)}</div>
        <p>1년 관광객 방문 애월읍 vs 조천읍(함덕). 저녁 소비 비중은 ${ae.nightShare}% vs ${jo.nightShare}%, 숙박 비중은 ${val('stay', ae)}% vs ${val('stay', jo)}%.</p></article>
      <article class="story"><p class="k">2019 → 2025</p><h3>${up.name}은 늘고,<br>${dn.name}은 줄었다</h3>
        <div class="big">${sgn(up.trend)}<small>vs</small> ${sgn(dn.trend)}</div>
        <p>코로나 전 2019년과 2025년 관광객 방문 비교. 우도면 ${sgn(byName['우도면'].trend)}, 성산읍 ${sgn(byName['성산읍'].trend)}도 줄었습니다.</p></article>
      <article class="story"><p class="k">외국인</p><h3>중국인은 노형·연동,<br>대만인은 이호동</h3>
        <div class="big">${(nh.countries.find(c => c[0] === '중국') || [0, 0])[1]}%<small>vs</small> ${(ih.countries.find(c => c[0] === '대만') || [0, 0])[1]}%</div>
        <p>최근 1년 외국인 카드 소비 중 노형동의 중국 비중, 이호동의 대만 비중. 외국인 입도객은 2025년 224만 명으로 2019년(173만 명)을 넘었습니다.</p></article>`;
  }

  // ---------- compare (butterfly) ----------
  const ROWS = [
    ['관광객 방문(1년)', d => d.visitNative, d => man(d.visitNative)],
    ['가을(10~11월) 방문 비중', d => d.autShare, d => d.autShare + '%'],
    ['저녁 6시 이후 소비', d => d.nightShare, d => d.nightShare + '%'],
    ['매출 중 관광객 몫', d => d.tourSpendShare, d => d.tourSpendShare + '%'],
    ['관광객 소비 중 음식점', d => val('eat', d), d => val('eat', d) + '%'],
    ['관광객 소비 중 숙박', d => val('stay', d), d => val('stay', d) + '%'],
    ['방문 중 외국인(2025)', d => d.foreignShare2025, d => d.foreignShare2025 + '%'],
  ];
  const opts = [...dongs].sort((a, b) => a.name.localeCompare(b.name, 'ko')).map(d => `<option>${d.name}</option>`).join('');
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
    const cntHtml = top.map((x, i) => row(x.name, x.aut, i === 0 ? 'hot' : '', (x.aut / ot * 100).toFixed(1) + '%')).join('') +
      row(`나머지 ${rest.length}곳`, rs, 'rest', (rs / ot * 100).toFixed(1) + '%');
    const cntLede = $('#oreumlede').textContent;
    // 도민 픽: 5년(2021~2025) 도착 5,000대 이상 중 도민(차량 주 사용지역 제주) 비율 높은 순, 비교로 1위 오름
    const o5 = data.oreum.filter(x => x.season);
    const loc = o5.filter(x => x.total5 >= 5000).sort((a, b) => b.local5 - a.local5).slice(0, 8);
    const big5 = [...o5].sort((a, b) => b.total5 - a.total5)[0];
    const lrow = (x, cls) => `<div class="ob ${cls}"><span class="n">${x.name}</span><div class="t"><i style="width:${x.local5 * 0.7}%"></i><span>${x.local5}%<small>5년 ${x.total5.toLocaleString()}대</small></span></div></div>`;
    const locHtml = loc.map((x, i) => lrow(x, i === 0 ? 'hot' : '')).join('') + lrow(big5, 'rest');
    const locLede = `도민 차가 많이 가는 오름은 따로 있습니다. 5년(2021~2025) 동안 ${loc[0].name}은 도착 차량의 ${loc[0].local5}%가 도민 차, 가장 붐비는 ${big5.name}은 ${big5.local5}%입니다.`;
    // 철: 5년 도착 5,000대 이상, 가장 붐비는 달 지수(그 해 월평균=1) 높은 순
    const MN = m => m + '월';
    const peak = x => Math.max(...x.season);
    const sea = o5.filter(x => x.total5 >= 5000).sort((a, b) => peak(b) - peak(a)).slice(0, 9);
    const seaHtml = sea.map((x, i) => `<div class="ob ${i === 0 ? 'hot' : ''}"><span class="n">${x.name}</span><div class="t"><i style="width:${peak(x) / peak(sea[0]) * 70}%"></i><span>${x.bestMonths.map(MN).join('·')}<small>평소의 ${peak(x).toFixed(1)}배 · 한적 ${MN(x.season.indexOf(Math.min(...x.season)) + 1)}</small></span></div></div>`).join('');
    const spring = sea.filter(x => x.bestMonths[0] >= 3 && x.bestMonths[0] <= 5).map(x => x.name).slice(0, 3);
    const seaLede = `오름마다 붐비는 철이 다릅니다. 새별·따라비는 억새철 10~11월, ${spring.join('·')}은 봄(3~5월)에 가장 많이 찾습니다. 5년(2021~2025) 티맵 도착 기준.`;
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
    $('#alts').innerHTML = alts.map(x => `<li><b>${x.name}</b><span>가을 ${x.aut.toLocaleString()}대 · 1년 ${x.year.toLocaleString()}대</span></li>`).join('');
    const g = [...data.gotjawal].sort((a, b) => b.aut - a.aut).slice(0, 3);
    $('#gotjawal').innerHTML = `숲길을 걷고 싶다면 곶자왈: ${g.map(x => `<b>${x.name}</b> ${x.aut.toLocaleString()}대`).join(' · ')} (같은 기간 티맵 도착)`;
    new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { track('oreum_view', { oreum: o[0].name }); try { gtag('event', 'page_view', { page_title: '오름 · 제주 숙소 동네', page_path: '/jeju-stay/oreum', page_location: location.origin + '/jeju-stay/oreum' }); } catch (e) {} ob.disconnect(); } }).observe($('#oreum'));
  }

  // ---------- feedback ----------
  document.querySelectorAll('[data-fb]').forEach(b => b.addEventListener('click', () => {
    track('feedback', { answer: b.dataset.fb });
    document.querySelectorAll('[data-fb]').forEach(x => x.disabled = true);
    $('#fbthanks').hidden = false;
  }));

  paint(); runQuiz(false); renderVs(false);
  show = v => {
    if (!VIEWS.includes(v)) v = 'map';
    document.querySelectorAll('main>.view').forEach(s => s.classList.toggle('on', s.id === v));
    document.querySelectorAll('.topnav a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
    document.body.dataset.view = v;
    scrollTo(0, 0);
    if (v === 'map') paint();
    if (v === 'pick') runQuiz(false);
    track('view', { view: v });
  };
  const fromHash = () => show(location.hash === '#oreum-local' ? 'oreum' : location.hash.slice(1));
  addEventListener('hashchange', fromHash);
  fromHash();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { paint(); runQuiz(false); }, 150); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paint);
})();
