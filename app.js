(async function () {
  const D = await fetch('data.json').then(r => r.json());
  const dongs = D.dongs;
  const byName = Object.fromEntries(dongs.map(d => [d.name, d]));
  const $ = s => document.querySelector(s);
  const track = (name, params) => { try { gtag('event', name, params || {}); } catch (e) {} };
  const fmt = n => n.toLocaleString('ko-KR');
  const man = n => n >= 1e8 ? (n / 1e8).toFixed(1) + '억' : n >= 1e4 ? Math.round(n / 1e4).toLocaleString('ko-KR') + '만' : fmt(n);
  const eok = n => (n / 1e8).toFixed(0) + '억 원';
  const SPECIAL = { '용담2동': '제주국제공항 포함', '건입동': '제주항 포함' };
  const MONTH_LABEL = D.meta.months.map(m => +m.slice(4) + '월');

  function tags(d) {
    const t = [];
    if (d.busyPct >= 80) t.push(['북적', 'busy']);
    if (d.busyPct <= 30) t.push(['한적', 'quiet']);
    if (d.nightPct >= 75) t.push(['저녁 활발', '']);
    if (d.eatPct >= 75) t.push(['먹거리', '']);
    if (d.stayPct >= 80) t.push(['숙박 밀집', '']);
    if (d.tourPct >= 80) t.push(['관광지형', '']);
    if (d.tourPct <= 25) t.push(['생활권', '']);
    return t;
  }
  const tagHtml = d => tags(d).map(([s, c]) => `<span class="tag ${c ? 't-' + c : ''}">${s}</span>`).join('');
  const rankOf = (key, d, desc = true) => {
    const s = [...dongs].sort((a, b) => desc ? b[key] - a[key] : a[key] - b[key]);
    return s.indexOf(d) + 1;
  };

  /* 01 퀴즈 */
  function score(d, a) {
    let s = 0;
    s += a.busy * (d.busyPct - 50);
    s += a.night * (d.nightPct - 50) * 1.2;
    s += a.vibe * (d.tourPct - 50);
    if (a.focus === 'eat') s += (d.eatPct - 50) * 1.2;
    if (a.focus === 'stay') s += (d.stayPct - 50) * 1.2;
    return s;
  }
  function reasons(d, a) {
    const r = [];
    r.push(`관광객 방문 ${man(d.visitNative)}회, 43곳 중 ${rankOf('visitNative', d)}위`);
    if (a.night !== 0) r.push(`관광객 카드 소비의 ${d.nightShare}%가 저녁 6시 이후 (${rankOf('nightShare', d)}위)`);
    if (a.focus === 'eat') r.push(`관광객 소비 중 음식점 ${d.indShare['음식점업']}%`);
    if (a.focus === 'stay') r.push(`관광객 소비 중 숙박 ${d.indShare['숙박업']}%`);
    if (a.vibe !== 0) r.push(`카드 매출의 ${d.tourSpendShare}%가 관광객, 나머지는 도민`);
    if (d.places && d.places.length) r.push(`차로 많이 찾는 곳: ${d.places.slice(0, 3).map(p => p[0]).join(', ')}`);
    return r;
  }
  $('#quiz').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const a = { busy: +f.get('busy'), night: +f.get('night'), vibe: +f.get('vibe'), focus: f.get('focus') };
    const pool = dongs.filter(d => d.busyPct > 15);
    const top = pool.map(d => [d, score(d, a)]).sort((x, y) => y[1] - x[1]).slice(0, 3);
    $('#result').innerHTML = top.map(([d], i) => `
      <article class="pickcard">
        <div class="rank">${i + 1}</div>
        <h3>${d.name}<small>${d.city}${SPECIAL[d.name] ? ' · ' + SPECIAL[d.name] : ''}</small></h3>
        <ul>${reasons(d, a).map(x => `<li>${x}</li>`).join('')}</ul>
        <button class="more" data-open="${d.name}" type="button">${d.name} 자세히 보기</button>
      </article>`).join('');
    track('quiz_done', { busy: a.busy, night: a.night, vibe: a.vibe, focus: a.focus, pick1: top[0][0].name });
  });

  /* 02 도감 */
  let city = '', sortKey = 'visitNative';
  function renderGrid() {
    let list = dongs.filter(d => !city || d.city === city);
    const k = {
      visitNative: d => -d.visitNative, quiet: d => d.visitNative, nightShare: d => -d.nightShare,
      eat: d => -d.indShare['음식점업'], tourSpendShare: d => -d.tourSpendShare
    }[sortKey];
    list.sort((a, b) => k(a) - k(b));
    const max = Math.max(...dongs.map(d => d.visitNative));
    const statLine = d => ({
      nightShare: `저녁 소비 비중 ${d.nightShare}%`,
      eat: `음식점 소비 비중 ${d.indShare['음식점업']}%`,
      tourSpendShare: `관광객 소비 비중 ${d.tourSpendShare}%`
    }[sortKey] || `관광객 방문 ${man(d.visitNative)}회/년`);
    $('#grid').innerHTML = list.map((d, i) => `
      <li data-open="${d.name}" tabindex="0">
        <span class="n">${String(i + 1).padStart(2, '0')}</span>
        <h3>${d.name}<small>${d.city}</small></h3>
        <div class="stat">${statLine(d)}</div>
        <div class="meter"><i style="width:${(100 * d.visitNative / max).toFixed(1)}%"></i></div>
        <div class="tags">${tagHtml(d)}</div>
      </li>`).join('');
  }
  $('#cityseg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    city = b.dataset.city;
    $('#cityseg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    renderGrid(); track('filter_city', { city: city || '전체' });
  });
  $('#sort').addEventListener('change', e => { sortKey = e.target.value; renderGrid(); track('sort', { key: sortKey }); });
  renderGrid();

  /* 상세 시트 */
  function monthlySvg(d) {
    const w = 600, h = 150, p = 24, v = d.monthly, mx = Math.max(...v);
    const bw = (w - p * 2) / v.length;
    return `<svg viewBox="0 0 ${w} ${h + 22}" role="img" aria-label="${d.name} 월별 관광객 방문">
      ${v.map((x, i) => {
        const bh = (h - 20) * x / mx, autumn = i === 2 || i === 3;
        return `<rect x="${p + i * bw + 3}" y="${h - bh}" width="${bw - 6}" height="${bh}" fill="${autumn ? 'var(--tang)' : 'var(--sea2)'}"/>
        <text x="${p + i * bw + bw / 2}" y="${h + 16}" font-size="12" text-anchor="middle" fill="var(--stone)">${MONTH_LABEL[i]}</text>`;
      }).join('')}
    </svg>`;
  }
  function hourSvg(d) {
    const w = 600, h = 140, p = 24, T = d.hourTour, L = d.hourLocal;
    const st = T.reduce((a, b) => a + b, 0) || 1, sl = L.reduce((a, b) => a + b, 0) || 1;
    const t = T.map(x => x / st), l = L.map(x => x / sl), mx = Math.max(...t, ...l);
    const x = i => p + i * (w - p * 2) / 23, y = v => h - (h - 16) * v / mx;
    const line = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
    return `<svg viewBox="0 0 ${w} ${h + 22}" role="img" aria-label="${d.name} 시간대별 카드 소비">
      <rect x="${x(18)}" y="0" width="${x(23) - x(18)}" height="${h}" fill="var(--paper2)"/>
      <path d="${line(l)}" fill="none" stroke="var(--stone)" stroke-width="2" stroke-dasharray="4 3"/>
      <path d="${line(t)}" fill="none" stroke="var(--tang)" stroke-width="2.5"/>
      ${[0, 6, 12, 18, 23].map(i => `<text x="${x(i)}" y="${h + 16}" font-size="12" text-anchor="middle" fill="var(--stone)">${i}시</text>`).join('')}
    </svg>`;
  }
  const IND_COL = { '음식점업': 'var(--tang)', '숙박업': 'var(--sea)', '소매업': 'var(--sea2)', '예술스포츠여가업': 'var(--tang2)', '기타서비스업': 'var(--rule)' };
  const IND_LBL = { '음식점업': '음식점', '숙박업': '숙박', '소매업': '소매', '예술스포츠여가업': '여가', '기타서비스업': '기타' };
  function openDong(name, from) {
    const d = byName[name]; if (!d) return;
    const ri = (d.ri || []).sort((a, b) => b[1] - a[1]).slice(0, 5);
    $('#sheetbody').innerHTML = `
      <h2 class="dh">${d.name}<small>${d.city}${SPECIAL[d.name] ? ' · ' + SPECIAL[d.name] : ''}</small></h2>
      <div class="tags" style="margin-top:8px">${tagHtml(d)}</div>
      <div class="kpis">
        <div class="kpi"><b>${man(d.visitNative)}</b><span>관광객 방문/년</span> <em>${rankOf('visitNative', d)}위</em></div>
        <div class="kpi"><b>${d.nightShare}%</b><span>저녁 6시 이후 소비</span> <em>${rankOf('nightShare', d)}위</em></div>
        <div class="kpi"><b>${d.tourSpendShare}%</b><span>매출 중 관광객 몫</span> <em>${rankOf('tourSpendShare', d)}위</em></div>
        <div class="kpi"><b>${d.foreignShare}%</b><span>방문 중 외국인</span> <em>${rankOf('foreignShare', d)}위</em></div>
      </div>
      <div class="chart"><h4>월별 관광객 방문</h4>${monthlySvg(d)}<p class="note">2025년 8월~2026년 7월. 주황은 지난가을(10·11월), 1년 중 ${d.autShare}%.</p></div>
      <div class="chart"><h4>하루 중 언제 돈을 쓰나</h4>${hourSvg(d)}
        <div class="legend"><span><i style="background:var(--tang)"></i>내국인 관광객</span><span><i style="background:var(--stone)"></i>도민(점선)</span><span><i style="background:var(--paper2);border:1px solid var(--rule)"></i>18~24시</span></div>
        <p class="note">시간대별 카드 매출을 각자 하루 합계 대비 비율로 그렸습니다.</p></div>
      <div class="chart"><h4>관광객은 무엇에 쓰나</h4>
        <div class="stack">${Object.entries(d.indShare).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<i title="${IND_LBL[k]} ${v}%" style="width:${v}%;background:${IND_COL[k]}"></i>`).join('')}</div>
        <div class="legend">${Object.entries(d.indShare).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<span><i style="background:${IND_COL[k]}"></i>${IND_LBL[k]} ${v}%</span>`).join('')}</div></div>
      ${d.places && d.places.length ? `<div class="chart"><h4>차로 많이 찾아간 곳</h4><ol class="places">${d.places.map(p => `<li>${p[0]}<span>${fmt(p[1])}대</span></li>`).join('')}</ol><p class="note">티맵 도착 차량, 2025년 10월~2026년 9월.</p></div>` : ''}
      ${ri.length ? `<div class="chart"><h4>방문 많은 리</h4><ol class="places">${ri.map(p => `<li>${p[0]}<span>${man(p[1])}회</span></li>`).join('')}</ol></div>` : ''}
      <button class="btn ghost small" type="button" data-vs="${d.name}">다른 동네와 비교</button>`;
    $('#sheet').showModal();
    $('#sheet').scrollTop = 0;
    track('dong_open', { dong: d.name, from: from || 'grid' });
  }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { openDong(o.dataset.open, o.classList.contains('more') ? 'quiz' : 'grid'); return; }
    const v = e.target.closest('[data-vs]');
    if (v) { $('#sheet').close(); $('#vsA').value = v.dataset.vs; renderVs(); location.hash = 'vs'; }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('li[data-open]')) openDong(e.target.dataset.open);
  });
  $('#sheet .close').addEventListener('click', () => $('#sheet').close());
  $('#sheet').addEventListener('click', e => { if (e.target === $('#sheet')) $('#sheet').close(); });

  /* 03 비교 */
  const names = [...dongs].sort((a, b) => a.name.localeCompare(b.name, 'ko')).map(d => d.name);
  ['#vsA', '#vsB'].forEach(s => $(s).innerHTML = names.map(n => `<option>${n}</option>`).join(''));
  const q = new URLSearchParams(location.search);
  $('#vsA').value = byName[q.get('a')] ? q.get('a') : '애월읍';
  $('#vsB').value = byName[q.get('b')] ? q.get('b') : '조천읍';
  const ROWS = [
    ['관광객 방문/년', d => d.visitNative, man, ''],
    ['지난가을(10~11월) 방문', d => d.autNative, man, ''],
    ['저녁 6시 이후 소비 비중', d => d.nightShare, v => v + '%', ''],
    ['밤 9시~새벽 2시 소비 비중', d => d.lateShare, v => v + '%', ''],
    ['매출 중 관광객 몫', d => d.tourSpendShare, v => v + '%', '높을수록 관광지, 낮을수록 생활권'],
    ['관광객 소비 중 음식점', d => d.indShare['음식점업'], v => v + '%', ''],
    ['관광객 소비 중 숙박', d => d.indShare['숙박업'], v => v + '%', ''],
    ['방문 중 외국인', d => d.foreignShare, v => v + '%', ''],
    ['관광객 카드 소비/년', d => d.spendTour, eok, 'BC카드 기준']
  ];
  function renderVs() {
    const A = byName[$('#vsA').value], B = byName[$('#vsB').value];
    $('#vsout').innerHTML = ROWS.map(([l, f, fm, note]) => {
      const a = f(A) || 0, b = f(B) || 0, mx = Math.max(a, b) || 1;
      const cell = (d, v, win) => `<div class="vscell ${win ? 'win' : ''}"><small>${d.name}</small><b>${fm(v)}</b><div class="bar"><i style="width:${(100 * v / mx).toFixed(1)}%"></i></div></div>`;
      return `<div class="vsrow"><div class="lbl">${l}${note ? ' · ' + note : ''}</div>${cell(A, a, a > b)}${cell(B, b, b > a)}</div>`;
    }).join('') + `<div class="vsrow"><div class="lbl">차로 많이 찾는 곳</div>
      <div class="vscell"><small>${(A.places || []).slice(0, 5).map(p => p[0]).join(' · ')}</small></div>
      <div class="vscell"><small>${(B.places || []).slice(0, 5).map(p => p[0]).join(' · ')}</small></div></div>`;
  }
  ['#vsA', '#vsB'].forEach(s => $(s).addEventListener('change', () => {
    renderVs(); track('compare', { a: $('#vsA').value, b: $('#vsB').value });
  }));
  renderVs();
  if (q.get('a') || q.get('b')) track('shared_visit', { a: $('#vsA').value, b: $('#vsB').value });
  $('#share').addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?a=${encodeURIComponent($('#vsA').value)}&b=${encodeURIComponent($('#vsB').value)}#vs`;
    const title = `제주 ${$('#vsA').value} vs ${$('#vsB').value}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); $('#share').textContent = '복사했어요'; }
      track('share', { a: $('#vsA').value, b: $('#vsB').value, method: navigator.share ? 'native' : 'copy' });
    } catch (e) {}
  });

  /* 04 오름 */
  const oreum = [...D.oreum].sort((a, b) => b.aut - a.aut);
  function renderOreum(mode) {
    let list = mode === 'top' ? oreum.slice(0, 15) : mode === 'mid' ? oreum.slice(15, 40) : oreum;
    const mx = oreum[0].aut;
    $('#oreumlist').innerHTML = list.map(o => `<li class="${o === oreum[0] ? 'hot' : ''}"><span>${o.name}</span><div class="b"><i style="width:${Math.max(.5, 100 * o.aut / mx).toFixed(1)}%"></i></div><span class="v">${fmt(o.aut)}대</span></li>`).join('');
  }
  $('#oreumseg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('#oreumseg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    renderOreum(b.dataset.o); track('oreum_view', { mode: b.dataset.o });
  });
  renderOreum('top');

  /* 피드백 */
  document.querySelectorAll('[data-fb]').forEach(b => b.addEventListener('click', () => {
    track('feedback', { answer: b.dataset.fb });
    document.querySelectorAll('[data-fb]').forEach(x => x.disabled = true);
    $('#fbthanks').hidden = false;
  }));
})();
