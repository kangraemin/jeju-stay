// build_i18n.py가 만든다. 고치려면 scripts/i18n_ui.js·i18n_names.py를 고친다.
(function(){
// 지도 앱(app.js) 화면 문구. build_i18n.py가 이 파일 + 이름 번역표로 site/i18n.js를 만든다.
// 번체(zh-tw)는 아래 ZH 블록을 OpenCC로 바꿔 만든다. 이름(n, a, b …)은 이미 그 언어로 바뀌어 들어온다.
const KO = {
  join: '·', list: '·',
  num: n => n >= 1e8 ? (n / 1e8).toFixed(2).replace(/\.?0+$/, '') + '억' : Math.round(n / 1e4).toLocaleString() + '만',
  eyebrow: t => `43개 읍면동 · 관광객 방문 ${t} 회 데이터`,
  times: v => v + '회',
  lohi: { visit: ['적음', '많음'], night: ['낮 위주', '저녁 위주'], tour: ['도민 생활권', '관광지'], stay: ['낮음', '높음'], summer: ['여름에 덜', '여름에 더'], trend: ['줄었음', '늘었음'], foreign: ['적음', '많음'] },
  fmt: { tour: v => '관광객 ' + v + '%', stay: v => '숙박 ' + v + '%', summer: v => '여름 ' + v, trend: v => '2019년보다 ' + v, foreign: v => '외국인 ' + v + '%' },
  ins: {
    visit: (p, five, top) => `<div class="big">${p}<small>%</small></div><p>관광객 방문의 3분의 1 넘게가 <strong>${five}</strong> 다섯 곳에 몰립니다. 1위 ${top}에는 제주국제공항이 있습니다.</p>`,
    night: (s, u) => `<div class="big">${s[0][1]}<small>%</small></div><p>서귀포 <strong>${s[0][0]}</strong>은 관광객 카드 소비의 ${s[0][1]}%가 저녁 6시 이후입니다. 다음은 ${s[1][0]} ${s[1][1]}%, ${s[2][0]} ${s[2][1]}%. 우도는 ${u}%로 해가 지면 조용합니다.</p>`,
    tour: (n, hi, lo) => `<div class="big">${n}<small>곳 / 43</small></div><p>카드 매출의 절반 넘게를 관광객이 쓰는 동네입니다. <strong>${hi[0]}</strong> ${hi[1]}%가 가장 높고, <strong>${lo[0]}</strong>은 ${lo[1]}%로 도민 동네입니다.</p>`,
    stay: s => `<div class="big">${s[0][1]}<small>%</small></div><p><strong>${s[0][0]}</strong>은 관광객 카드 소비의 ${s[0][1]}%가 숙박입니다. 다음은 ${s[1][0]} ${s[1][1]}%, ${s[2][0]} ${s[2][1]}%.</p>`,
    summer: (top, big) => `<div class="big">+${top[1]}<small>%</small></div><p>5년(2019·2022~2025) 평균으로 7·8월 방문이 1년 평균보다 가장 많이 느는 곳은 <strong>${top[0]}</strong>입니다. 방문 상위 10곳 중에서는 해변 마을이 있는 <strong>${big.map(x => `${x[0]}(+${x[1]}%)`).join('·')}</strong>이 여름에 특히 붐빕니다.</p>`,
    trend: (up, dn) => `<div class="big">${up[0][1]}</div><p>2019년보다 2025년 관광객 방문이 가장 많이 는 곳은 <strong>${up[0][0]}</strong>, 다음은 ${up[1][0]} ${up[1][1]}, ${up[2][0]} ${up[2][1]}입니다. 줄어든 곳은 <strong>${dn[0][0]}</strong> ${dn[0][1]}, ${dn[1][0]} ${dn[1][1]}, ${dn[2][0]} ${dn[2][1]}입니다.</p>`,
    foreign: (top, s1, s2, cn1, cn2, tw, twv) => `<div class="big">${top[1]}<small>%</small></div><p>2025년 방문 중 외국인 비중이 가장 높은 곳은 <strong>${top[0]}</strong>, 다음은 ${s1}·${s2}입니다. 외국인 카드 소비는 <strong>${cn1}·${cn2}</strong>에서 중국이 40% 넘고, <strong>${tw}</strong>은 대만이 ${twv}%입니다.</p>`,
  },
  dec: {
    done: n => `${n} 응답 고맙습니다. 숙소 고를 때 참고되면 좋겠어요.`,
    ask: n => `${n}에 숙소 잡을 건가요?`,
    yes: '이 동네로 정했어요', maybe: '고민 중', no: '다른 데로',
    search: (ko, n) => [`https://map.naver.com/p/search/${encodeURIComponent('제주 ' + ko + ' 숙소')}`, `네이버 지도에서 ${n} 숙소 보기 ↗`],
    ok: '좋은 여행 되세요!', thanks: '응답 고맙습니다',
  },
  hour: i => i + '시', tourist: '관광객', local: '도민', curveAria: n => `${n} 시간대별 카드 소비`,
  card: {
    rank: '위', visit: '관광객 방문<br>43곳 중', night: '저녁 6시 이후<br>소비 비중', tour: '매출 중<br>관광객 몫',
    capt: '시간대별 카드 소비 비중 · 회색 띠 18~24시',
    months: (q, b) => `덜 붐비는 달 <b>${q}</b> · 붐비는 달 <b>${b}</b> <span class="capt">(5년 평균)</span>`,
    trend: (t, f, c) => `2019년보다 방문 <b>${t}</b> · 외국인 <b>${f}%</b>${c ? ` · 외국인 카드 소비 1위 <b>${c}</b>` : ''}`,
    places: p => `차로 많이 가는 곳 <b>${p}</b>`, ri: r => `관광객이 많이 머문 리 <b>${r}</b>`,
    left: '왼쪽 비교에 넣기', right: '오른쪽에 넣기', hint: '지도에서 동네를 누르면 핵심 숫자가 나옵니다',
  },
  month: m => m + '월',
  why: {
    stay: (s, r) => `관광객 소비 중 숙박 ${s}% · 방문 ${r}위`, eat: (e, n) => `관광객 소비 중 음식점 ${e}% · 저녁 ${n}%`,
    night: (n, r) => `저녁 소비 ${n}% · 방문 ${r}위`, vibe: (t, r) => `매출 중 관광객 ${t}% · 방문 ${r}위`, base: (r, n) => `관광객 방문 ${r}위 · 저녁 소비 ${n}%`,
  },
  story: (S) => `
      <article class="story"><p class="k">저녁</p><h3>우도는 해 지면 조용하고,<br>서귀포 정방동은 그때부터</h3>
        <div class="big">${S.u}%<small>vs</small> ${S.j}%</div>
        <p>관광객 카드 소비 중 저녁 6시 이후 비중. 우도면 vs 정방동.</p>${S.svg}
        <p class="capt"><span style="color:var(--s-tour)">━</span> 우도면 &nbsp;<span style="color:var(--accent)">━</span> 정방동 · 0~23시, 회색 띠 18~24시</p></article>
      <article class="story"><p class="k">가을 오름</p><h3>오름 ${S.on}곳 가운데<br>${S.top} 한 곳이</h3>
        <div class="big">${S.tp}%<small>차량 도착</small></div>
        <p>2025년 10~11월 티맵 차량 도착 ${S.ot}대 중 ${S.ta}대. 덜 붐비는 대안은 아래 오름 섹션에.</p></article>
      <article class="story"><p class="k">애월 vs 함덕</p><h3>방문은 애월이 많고,<br>숙박 비중은 조천이 높다</h3>
        <div class="big">${S.aev}<small>vs</small> ${S.jov}</div>
        <p>1년 관광객 방문 애월읍 vs 조천읍(함덕). 저녁 소비 비중은 ${S.aen}% vs ${S.jon}%, 숙박 비중은 ${S.aes}% vs ${S.jos}%.</p></article>
      <article class="story"><p class="k">2019 → 2025</p><h3>${S.up}은 늘고,<br>${S.dn}은 줄었다</h3>
        <div class="big">${S.upv}<small>vs</small> ${S.dnv}</div>
        <p>코로나 전 2019년과 2025년 관광객 방문 비교. 우도면 ${S.udo}, 성산읍 ${S.ss}도 줄었습니다.</p></article>
      <article class="story"><p class="k">외국인</p><h3>중국인은 노형·연동,<br>대만인은 이호동</h3>
        <div class="big">${S.cn}%<small>vs</small> ${S.tw}%</div>
        <p>최근 1년 외국인 카드 소비 중 노형동의 중국 비중, 이호동의 대만 비중. 외국인 입도객은 2025년 224만 명으로 2019년(173만 명)을 넘었습니다.</p></article>`,
  rows: ['관광객 방문(1년)', '가을(10~11월) 방문 비중', '저녁 6시 이후 소비', '매출 중 관광객 몫', '관광객 소비 중 음식점', '관광객 소비 중 숙박', '방문 중 외국인(2025)'],
  barNote: '막대 길이는 43개 동네 중 최댓값 기준', shareTitle: '제주 동네 비교', copied: '링크를 복사했어요', collate: 'ko',
  oreum: {
    lede: (n, ot, p) => `지난가을(2025년 10~11월) 티맵으로 오름 ${n}곳에 도착한 차량 ${ot}대 중 상위 3곳이 ${p}%입니다.`,
    rest: n => `나머지 ${n}곳`, five: v => `5년 ${v}대`,
    locLede: (a, av, b, bv) => `도민 차가 많이 가는 오름은 따로 있습니다. 5년(2021~2025) 동안 ${a}은 도착 차량의 ${av}%가 도민 차, 가장 붐비는 ${b}은 ${bv}%입니다.`,
    peak: (x, q) => `평소의 ${x}배 · 한적 ${q}`,
    seaLede: sp => `오름마다 붐비는 철이 다릅니다. 새별·따라비는 억새철 10~11월, ${sp}은 봄(3~5월)에 가장 많이 찾습니다. 5년(2021~2025) 티맵 도착 기준.`,
    alt: (a, y) => `가을 ${a}대 · 1년 ${y}대`,
    gj: g => `숲길을 걷고 싶다면 곶자왈: ${g} (같은 기간 티맵 도착)`, car: v => `${v}대`,
  },
};

const EN = {
  join: ', ', list: ' · ',
  num: n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : Math.round(n / 1e3).toLocaleString('en') + 'K',
  eyebrow: t => `43 neighborhoods · ${t} tourist visits`,
  times: v => v + ' visits',
  lohi: { visit: ['Fewer', 'More'], night: ['Daytime', 'Evening'], tour: ['Local area', 'Tourist area'], stay: ['Low', 'High'], summer: ['Less in summer', 'More in summer'], trend: ['Down', 'Up'], foreign: ['Fewer', 'More'] },
  fmt: { tour: v => 'Tourists ' + v + '%', stay: v => 'Lodging ' + v + '%', summer: v => 'Summer ' + v, trend: v => 'vs 2019 ' + v, foreign: v => 'Foreign ' + v + '%' },
  ins: {
    visit: (p, five, top) => `<div class="big">${p}<small>%</small></div><p>Over a third of all tourist visits go to just five places: <strong>${five}</strong>. No. 1, ${top}, is home to Jeju International Airport.</p>`,
    night: (s, u) => `<div class="big">${s[0][1]}<small>%</small></div><p>In <strong>${s[0][0]}</strong> (Seogwipo), ${s[0][1]}% of tourist card spending happens after 6 pm. Next: ${s[1][0]} ${s[1][1]}%, ${s[2][0]} ${s[2][1]}%. Udo is just ${u}%, quiet once the sun sets.</p>`,
    tour: (n, hi, lo) => `<div class="big">${n}<small> of 43</small></div><p>Neighborhoods where tourists make up more than half of card sales. <strong>${hi[0]}</strong> is highest at ${hi[1]}%; <strong>${lo[0]}</strong> is a locals' area at ${lo[1]}%.</p>`,
    stay: s => `<div class="big">${s[0][1]}<small>%</small></div><p>In <strong>${s[0][0]}</strong>, ${s[0][1]}% of tourist card spending goes to lodging. Next: ${s[1][0]} ${s[1][1]}%, ${s[2][0]} ${s[2][1]}%.</p>`,
    summer: (top, big) => `<div class="big">+${top[1]}<small>%</small></div><p>On a 5-year average (2019, 2022–2025), July–August visits rise the most above the yearly average in <strong>${top[0]}</strong>. Among the 10 busiest areas, beach towns <strong>${big.map(x => `${x[0]} (+${x[1]}%)`).join(', ')}</strong> get especially crowded in summer.</p>`,
    trend: (up, dn) => `<div class="big">${up[0][1]}</div><p>Tourist visits grew the most from 2019 to 2025 in <strong>${up[0][0]}</strong>, then ${up[1][0]} ${up[1][1]} and ${up[2][0]} ${up[2][1]}. They fell in <strong>${dn[0][0]}</strong> ${dn[0][1]}, ${dn[1][0]} ${dn[1][1]} and ${dn[2][0]} ${dn[2][1]}.</p>`,
    foreign: (top, s1, s2, cn1, cn2, tw, twv) => `<div class="big">${top[1]}<small>%</small></div><p>The highest share of foreign visitors in 2025 is in <strong>${top[0]}</strong>, then ${s1} and ${s2}. In foreign card spending, China is over 40% in <strong>${cn1} and ${cn2}</strong>, while in <strong>${tw}</strong> Taiwan accounts for ${twv}%.</p>`,
  },
  dec: {
    done: n => `Thanks for answering about ${n}. Hope it helps you pick a place.`,
    ask: n => `Will you stay in ${n}?`,
    yes: 'Yes, staying here', maybe: 'Still deciding', no: 'Somewhere else',
    search: (ko, n) => [`https://www.google.com/maps/search/${encodeURIComponent(n + ', Jeju hotels')}`, `Hotels in ${n} on Google Maps ↗`],
    ok: 'Have a great trip!', thanks: 'Thanks for answering',
  },
  hour: i => i + 'h', tourist: 'Tourists', local: 'Locals', curveAria: n => `Card spending by hour in ${n}`,
  card: {
    rank: '', visit: 'Tourist visits<br>rank of 43', night: 'Spending<br>after 6 pm', tour: 'Tourist share<br>of card sales',
    capt: 'Card spending by hour · gray band 6 pm–midnight',
    months: (q, b) => `Quietest month <b>${q}</b> · busiest <b>${b}</b> <span class="capt">(5-yr avg)</span>`,
    trend: (t, f, c) => `Visits vs 2019 <b>${t}</b> · foreign <b>${f}%</b>${c ? ` · top country in foreign card spending <b>${c}</b>` : ''}`,
    places: p => `Top car destinations <b>${p}</b>`, ri: r => `Villages where tourists stay longest <b>${r}</b>`,
    left: 'Compare (left)', right: 'Compare (right)', hint: 'Tap a neighborhood on the map to see its key numbers',
  },
  month: m => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1],
  why: {
    stay: (s, r) => `Lodging ${s}% of tourist spending · visits #${r}`, eat: (e, n) => `Restaurants ${e}% of tourist spending · evening ${n}%`,
    night: (n, r) => `Evening spending ${n}% · visits #${r}`, vibe: (t, r) => `Tourists ${t}% of card sales · visits #${r}`, base: (r, n) => `Tourist visits #${r} · evening spending ${n}%`,
  },
  story: (S) => `
      <article class="story"><p class="k">Evening</p><h3>Udo goes quiet at sunset,<br>Jeongbang-dong wakes up</h3>
        <div class="big">${S.u}%<small>vs</small> ${S.j}%</div>
        <p>Share of tourist card spending after 6 pm. Udo-myeon vs Jeongbang-dong.</p>${S.svg}
        <p class="capt"><span style="color:var(--s-tour)">━</span> Udo-myeon &nbsp;<span style="color:var(--accent)">━</span> Jeongbang-dong · 0–23h, gray band 6 pm–midnight</p></article>
      <article class="story"><p class="k">Autumn oreum</p><h3>Of ${S.on} oreum (volcanic cones),<br>${S.top} alone gets</h3>
        <div class="big">${S.tp}%<small>of cars</small></div>
        <p>${S.ta} of ${S.ot} cars arriving by T map navigation in Oct–Nov 2025. Less crowded picks are in the Oreum tab.</p></article>
      <article class="story"><p class="k">Aewol vs Hamdeok</p><h3>Aewol gets more visits,<br>Jocheon more lodging spend</h3>
        <div class="big">${S.aev}<small>vs</small> ${S.jov}</div>
        <p>Tourist visits in a year: Aewol-eup vs Jocheon-eup (Hamdeok). Evening spending ${S.aen}% vs ${S.jon}%, lodging ${S.aes}% vs ${S.jos}%.</p></article>
      <article class="story"><p class="k">2019 → 2025</p><h3>${S.up} grew,<br>${S.dn} shrank</h3>
        <div class="big">${S.upv}<small>vs</small> ${S.dnv}</div>
        <p>Tourist visits in 2025 compared with pre-COVID 2019. Udo-myeon ${S.udo} and Seongsan-eup ${S.ss} also fell.</p></article>
      <article class="story"><p class="k">Foreign visitors</p><h3>Chinese visitors in Nohyeong and Yeon-dong,<br>Taiwanese in Iho-dong</h3>
        <div class="big">${S.cn}%<small>vs</small> ${S.tw}%</div>
        <p>Last 12 months of foreign card spending: China's share in Nohyeong-dong, Taiwan's share in Iho-dong. Foreign arrivals to Jeju hit 2.24 million in 2025, above 2019 (1.73 million).</p></article>`,
  rows: ['Tourist visits (1 yr)', 'Autumn (Oct–Nov) share', 'Spending after 6 pm', 'Tourist share of sales', 'Restaurants in tourist spend', 'Lodging in tourist spend', 'Foreign share of visits (2025)'],
  barNote: 'Bar length relative to the max among 43 neighborhoods', shareTitle: 'Jeju neighborhood comparison', copied: 'Link copied', collate: 'en',
  oreum: {
    lede: (n, ot, p) => `Last autumn (Oct–Nov 2025), the top 3 of ${n} oreum got ${p}% of the ${ot} cars that arrived by T map navigation.`,
    rest: n => `Other ${n}`, five: v => `${v} cars in 5 yrs`,
    locLede: (a, av, b, bv) => `Locals have their own favorites. Over 5 years (2021–2025), ${av}% of cars at ${a} were local; at the busiest, ${b}, ${bv}%.`,
    peak: (x, q) => `${x}× usual · quiet in ${q}`,
    seaLede: sp => `Each oreum has its own season. Saebyeol and Ttarabi peak in silver-grass season (Oct–Nov); ${sp} peak in spring (Mar–May). Based on 5 years (2021–2025) of T map arrivals.`,
    alt: (a, y) => `Autumn ${a} cars · year ${y}`,
    gj: g => `For a forest walk, try a gotjawal: ${g} (T map arrivals, same period)`, car: v => `${v} cars`,
  },
};

/*ZH*/const ZH = {
  join: '、', list: '·',
  num: n => n >= 1e8 ? (n / 1e8).toFixed(2).replace(/\.?0+$/, '') + '亿' : Math.round(n / 1e4).toLocaleString() + '万',
  eyebrow: t => `43个邑面洞 · 游客到访${t}次数据`,
  times: v => v + '次',
  lohi: { visit: ['少', '多'], night: ['白天为主', '晚上为主'], tour: ['居民生活区', '旅游区'], stay: ['低', '高'], summer: ['夏季较少', '夏季更多'], trend: ['减少', '增加'], foreign: ['少', '多'] },
  fmt: { tour: v => '游客' + v + '%', stay: v => '住宿' + v + '%', summer: v => '夏季' + v, trend: v => '比2019年' + v, foreign: v => '外国人' + v + '%' },
  ins: {
    visit: (p, five, top) => `<div class="big">${p}<small>%</small></div><p>超过三分之一的游客到访集中在<strong>${five}</strong>这五个地方。第1名${top}有济州国际机场。</p>`,
    night: (s, u) => `<div class="big">${s[0][1]}<small>%</small></div><p>西归浦<strong>${s[0][0]}</strong>的游客刷卡消费有${s[0][1]}%发生在晚上6点以后。其次是${s[1][0]} ${s[1][1]}%、${s[2][0]} ${s[2][1]}%。牛岛只有${u}%，天黑后很安静。</p>`,
    tour: (n, hi, lo) => `<div class="big">${n}<small>个 / 43</small></div><p>刷卡销售额一半以上来自游客的地区。<strong>${hi[0]}</strong> ${hi[1]}%最高，<strong>${lo[0]}</strong> ${lo[1]}%，是本地居民区。</p>`,
    stay: s => `<div class="big">${s[0][1]}<small>%</small></div><p><strong>${s[0][0]}</strong>的游客刷卡消费有${s[0][1]}%用于住宿。其次是${s[1][0]} ${s[1][1]}%、${s[2][0]} ${s[2][1]}%。</p>`,
    summer: (top, big) => `<div class="big">+${top[1]}<small>%</small></div><p>按5年（2019、2022–2025）平均，7–8月到访比全年平均增加最多的是<strong>${top[0]}</strong>。到访前10名中，有海滩的<strong>${big.map(x => `${x[0]}（+${x[1]}%）`).join('、')}</strong>夏天特别拥挤。</p>`,
    trend: (up, dn) => `<div class="big">${up[0][1]}</div><p>2025年比2019年游客到访增加最多的是<strong>${up[0][0]}</strong>，其次是${up[1][0]} ${up[1][1]}、${up[2][0]} ${up[2][1]}。减少的是<strong>${dn[0][0]}</strong> ${dn[0][1]}、${dn[1][0]} ${dn[1][1]}、${dn[2][0]} ${dn[2][1]}。</p>`,
    foreign: (top, s1, s2, cn1, cn2, tw, twv) => `<div class="big">${top[1]}<small>%</small></div><p>2025年到访中外国人占比最高的是<strong>${top[0]}</strong>，其次是${s1}、${s2}。外国人刷卡消费中，<strong>${cn1}、${cn2}</strong>的中国占比超过40%，<strong>${tw}</strong>的台湾占${twv}%。</p>`,
  },
  dec: {
    done: n => `谢谢你关于${n}的回答，希望对选住处有帮助。`,
    ask: n => `你会住在${n}吗？`,
    yes: '就住这里', maybe: '还在考虑', no: '住别的地方',
    search: (ko, n, en) => [`https://www.google.com/maps/search/${encodeURIComponent(en + ', Jeju hotels')}`, `在Google地图查看${n}的住宿 ↗`],
    ok: '祝旅途愉快！', thanks: '谢谢你的回答',
  },
  hour: i => i + '时', tourist: '游客', local: '居民', curveAria: n => `${n}各时段刷卡消费`,
  card: {
    rank: '名', visit: '游客到访<br>43个中', night: '晚上6点后<br>消费占比', tour: '销售额中<br>游客占比',
    capt: '各时段刷卡消费占比 · 灰色带为18–24时',
    months: (q, b) => `最清静 <b>${q}</b> · 最拥挤 <b>${b}</b> <span class="capt">（5年平均）</span>`,
    trend: (t, f, c) => `到访比2019年 <b>${t}</b> · 外国人 <b>${f}%</b>${c ? ` · 外国人刷卡消费第1 <b>${c}</b>` : ''}`,
    places: p => `开车常去 <b>${p}</b>`, ri: r => `游客停留多的里 <b>${r}</b>`,
    left: '放入左侧对比', right: '放入右侧', hint: '点击地图上的地区查看主要数据',
  },
  month: m => m + '月',
  why: {
    stay: (s, r) => `游客消费中住宿${s}% · 到访第${r}`, eat: (e, n) => `游客消费中餐饮${e}% · 晚间${n}%`,
    night: (n, r) => `晚间消费${n}% · 到访第${r}`, vibe: (t, r) => `销售额中游客${t}% · 到访第${r}`, base: (r, n) => `游客到访第${r} · 晚间消费${n}%`,
  },
  story: (S) => `
      <article class="story"><p class="k">晚上</p><h3>牛岛天黑就安静，<br>西归浦正房洞从那时开始热闹</h3>
        <div class="big">${S.u}%<small>vs</small> ${S.j}%</div>
        <p>游客刷卡消费中晚上6点以后的占比。牛岛面 vs 正房洞。</p>${S.svg}
        <p class="capt"><span style="color:var(--s-tour)">━</span> 牛岛面 &nbsp;<span style="color:var(--accent)">━</span> 正房洞 · 0–23时，灰色带18–24时</p></article>
      <article class="story"><p class="k">秋天的火山锥</p><h3>${S.on}座火山锥（오름）中，<br>${S.top}一处就占</h3>
        <div class="big">${S.tp}%<small>车辆到达</small></div>
        <p>2025年10–11月T map导航到达${S.ot}辆中的${S.ta}辆。人少的选择在火山锥页面。</p></article>
      <article class="story"><p class="k">涯月 vs 咸德</p><h3>到访涯月多，<br>住宿占比朝天高</h3>
        <div class="big">${S.aev}<small>vs</small> ${S.jov}</div>
        <p>一年游客到访：涯月邑 vs 朝天邑（咸德）。晚间消费${S.aen}% vs ${S.jon}%，住宿${S.aes}% vs ${S.jos}%。</p></article>
      <article class="story"><p class="k">2019 → 2025</p><h3>${S.up}增加，<br>${S.dn}减少</h3>
        <div class="big">${S.upv}<small>vs</small> ${S.dnv}</div>
        <p>疫情前2019年与2025年游客到访对比。牛岛面${S.udo}、城山邑${S.ss}也减少了。</p></article>
      <article class="story"><p class="k">外国人</p><h3>中国游客在老衡·莲洞，<br>台湾游客在梨湖洞</h3>
        <div class="big">${S.cn}%<small>vs</small> ${S.tw}%</div>
        <p>最近1年外国人刷卡消费中，老衡洞的中国占比和梨湖洞的台湾占比。2025年入境济州的外国人达224万人，超过2019年（173万人）。</p></article>`,
  rows: ['游客到访（1年）', '秋季（10–11月）到访占比', '晚上6点后消费', '销售额中游客占比', '游客消费中餐饮', '游客消费中住宿', '到访中外国人（2025）'],
  barNote: '条形长度以43个地区中的最大值为基准', shareTitle: '济州地区对比', copied: '已复制链接', collate: 'zh',
  oreum: {
    lede: (n, ot, p) => `去年秋天（2025年10–11月）用T map导航到达${n}座火山锥的${ot}辆车中，前3名占${p}%。`,
    rest: n => `其余${n}座`, five: v => `5年${v}辆`,
    locLede: (a, av, b, bv) => `本地人常去的火山锥另有其处。5年（2021–2025）间，${a}的到达车辆有${av}%是本地车，最拥挤的${b}是${bv}%。`,
    peak: (x, q) => `平时的${x}倍 · 清静${q}`,
    seaLede: sp => `每座火山锥拥挤的季节不同。晓星（새별）·Ttarabi在芒草季10–11月，${sp}在春季（3–5月）人最多。按5年（2021–2025）T map到达计算。`,
    alt: (a, y) => `秋季${a}辆 · 全年${y}辆`,
    gj: g => `想走森林步道就去Gotjawal：${g}（同期T map到达）`, car: v => `${v}辆`,
  },
};/*END*/

const ZHTW = {
  join: '、', list: '·',
  num: n => n >= 1e8 ? (n / 1e8).toFixed(2).replace(/\.?0+$/, '') + '億' : Math.round(n / 1e4).toLocaleString() + '萬',
  eyebrow: t => `43個邑面洞 · 遊客到訪${t}次資料`,
  times: v => v + '次',
  lohi: { visit: ['少', '多'], night: ['白天為主', '晚上為主'], tour: ['居民生活區', '旅遊區'], stay: ['低', '高'], summer: ['夏季較少', '夏季更多'], trend: ['減少', '增加'], foreign: ['少', '多'] },
  fmt: { tour: v => '遊客' + v + '%', stay: v => '住宿' + v + '%', summer: v => '夏季' + v, trend: v => '比2019年' + v, foreign: v => '外國人' + v + '%' },
  ins: {
    visit: (p, five, top) => `<div class="big">${p}<small>%</small></div><p>超過三分之一的遊客到訪集中在<strong>${five}</strong>這五個地方。第1名${top}有濟州國際機場。</p>`,
    night: (s, u) => `<div class="big">${s[0][1]}<small>%</small></div><p>西歸浦<strong>${s[0][0]}</strong>的遊客刷卡消費有${s[0][1]}%發生在晚上6點以後。其次是${s[1][0]} ${s[1][1]}%、${s[2][0]} ${s[2][1]}%。牛島只有${u}%，天黑後很安靜。</p>`,
    tour: (n, hi, lo) => `<div class="big">${n}<small>個 / 43</small></div><p>刷卡銷售額一半以上來自遊客的地區。<strong>${hi[0]}</strong> ${hi[1]}%最高，<strong>${lo[0]}</strong> ${lo[1]}%，是本地居民區。</p>`,
    stay: s => `<div class="big">${s[0][1]}<small>%</small></div><p><strong>${s[0][0]}</strong>的遊客刷卡消費有${s[0][1]}%用於住宿。其次是${s[1][0]} ${s[1][1]}%、${s[2][0]} ${s[2][1]}%。</p>`,
    summer: (top, big) => `<div class="big">+${top[1]}<small>%</small></div><p>按5年（2019、2022–2025）平均，7–8月到訪比全年平均增加最多的是<strong>${top[0]}</strong>。到訪前10名中，有海灘的<strong>${big.map(x => `${x[0]}（+${x[1]}%）`).join('、')}</strong>夏天特別擁擠。</p>`,
    trend: (up, dn) => `<div class="big">${up[0][1]}</div><p>2025年比2019年遊客到訪增加最多的是<strong>${up[0][0]}</strong>，其次是${up[1][0]} ${up[1][1]}、${up[2][0]} ${up[2][1]}。減少的是<strong>${dn[0][0]}</strong> ${dn[0][1]}、${dn[1][0]} ${dn[1][1]}、${dn[2][0]} ${dn[2][1]}。</p>`,
    foreign: (top, s1, s2, cn1, cn2, tw, twv) => `<div class="big">${top[1]}<small>%</small></div><p>2025年到訪中外國人佔比最高的是<strong>${top[0]}</strong>，其次是${s1}、${s2}。外國人刷卡消費中，<strong>${cn1}、${cn2}</strong>的中國佔比超過40%，<strong>${tw}</strong>的臺灣佔${twv}%。</p>`,
  },
  dec: {
    done: n => `謝謝你關於${n}的回答，希望對選住處有幫助。`,
    ask: n => `你會住在${n}嗎？`,
    yes: '就住這裡', maybe: '還在考慮', no: '住別的地方',
    search: (ko, n, en) => [`https://www.google.com/maps/search/${encodeURIComponent(en + ', Jeju hotels')}`, `在Google地圖檢視${n}的住宿 ↗`],
    ok: '祝旅途愉快！', thanks: '謝謝你的回答',
  },
  hour: i => i + '時', tourist: '遊客', local: '居民', curveAria: n => `${n}各時段刷卡消費`,
  card: {
    rank: '名', visit: '遊客到訪<br>43個中', night: '晚上6點後<br>消費佔比', tour: '銷售額中<br>遊客佔比',
    capt: '各時段刷卡消費佔比 · 灰色帶為18–24時',
    months: (q, b) => `最清靜 <b>${q}</b> · 最擁擠 <b>${b}</b> <span class="capt">（5年平均）</span>`,
    trend: (t, f, c) => `到訪比2019年 <b>${t}</b> · 外國人 <b>${f}%</b>${c ? ` · 外國人刷卡消費第1 <b>${c}</b>` : ''}`,
    places: p => `開車常去 <b>${p}</b>`, ri: r => `遊客停留多的裡 <b>${r}</b>`,
    left: '放入左側對比', right: '放入右側', hint: '點選地圖上的地區檢視主要資料',
  },
  month: m => m + '月',
  why: {
    stay: (s, r) => `遊客消費中住宿${s}% · 到訪第${r}`, eat: (e, n) => `遊客消費中餐飲${e}% · 晚間${n}%`,
    night: (n, r) => `晚間消費${n}% · 到訪第${r}`, vibe: (t, r) => `銷售額中遊客${t}% · 到訪第${r}`, base: (r, n) => `遊客到訪第${r} · 晚間消費${n}%`,
  },
  story: (S) => `
      <article class="story"><p class="k">晚上</p><h3>牛島天黑就安靜，<br>西歸浦正房洞從那時開始熱鬧</h3>
        <div class="big">${S.u}%<small>vs</small> ${S.j}%</div>
        <p>遊客刷卡消費中晚上6點以後的佔比。牛島面 vs 正房洞。</p>${S.svg}
        <p class="capt"><span style="color:var(--s-tour)">━</span> 牛島面 &nbsp;<span style="color:var(--accent)">━</span> 正房洞 · 0–23時，灰色帶18–24時</p></article>
      <article class="story"><p class="k">秋天的火山錐</p><h3>${S.on}座火山錐（오름）中，<br>${S.top}一處就佔</h3>
        <div class="big">${S.tp}%<small>車輛到達</small></div>
        <p>2025年10–11月T map導航到達${S.ot}輛中的${S.ta}輛。人少的選擇在火山錐頁面。</p></article>
      <article class="story"><p class="k">涯月 vs 鹹德</p><h3>到訪涯月多，<br>住宿佔比朝天高</h3>
        <div class="big">${S.aev}<small>vs</small> ${S.jov}</div>
        <p>一年遊客到訪：涯月邑 vs 朝天邑（鹹德）。晚間消費${S.aen}% vs ${S.jon}%，住宿${S.aes}% vs ${S.jos}%。</p></article>
      <article class="story"><p class="k">2019 → 2025</p><h3>${S.up}增加，<br>${S.dn}減少</h3>
        <div class="big">${S.upv}<small>vs</small> ${S.dnv}</div>
        <p>疫情前2019年與2025年遊客到訪對比。牛島面${S.udo}、城山邑${S.ss}也減少了。</p></article>
      <article class="story"><p class="k">外國人</p><h3>中國遊客在老衡·蓮洞，<br>臺灣遊客在梨湖洞</h3>
        <div class="big">${S.cn}%<small>vs</small> ${S.tw}%</div>
        <p>最近1年外國人刷卡消費中，老衡洞的中國佔比和梨湖洞的臺灣佔比。2025年入境濟州的外國人達224萬人，超過2019年（173萬人）。</p></article>`,
  rows: ['遊客到訪（1年）', '秋季（10–11月）到訪佔比', '晚上6點後消費', '銷售額中遊客佔比', '遊客消費中餐飲', '遊客消費中住宿', '到訪中外國人（2025）'],
  barNote: '條形長度以43個地區中的最大值為基準', shareTitle: '濟州地區對比', copied: '已複製連結', collate: 'zh',
  oreum: {
    lede: (n, ot, p) => `去年秋天（2025年10–11月）用T map導航到達${n}座火山錐的${ot}輛車中，前3名佔${p}%。`,
    rest: n => `其餘${n}座`, five: v => `5年${v}輛`,
    locLede: (a, av, b, bv) => `本地人常去的火山錐另有其處。5年（2021–2025）間，${a}的到達車輛有${av}%是本地車，最擁擠的${b}是${bv}%。`,
    peak: (x, q) => `平時的${x}倍 · 清靜${q}`,
    seaLede: sp => `每座火山錐擁擠的季節不同。曉星（새별）·Ttarabi在芒草季10–11月，${sp}在春季（3–5月）人最多。按5年（2021–2025）T map到達計算。`,
    alt: (a, y) => `秋季${a}輛 · 全年${y}輛`,
    gj: g => `想走森林步道就去Gotjawal：${g}（同期T map到達）`, car: v => `${v}輛`,
  },
};
window.I18N = {ui: {ko: KO, en: EN, zh: ZH, 'zh-tw': ZHTW}, names: {"en": {"일도1동": "Ildo 1-dong", "일도2동": "Ildo 2-dong", "이도1동": "Ido 1-dong", "이도2동": "Ido 2-dong", "삼도1동": "Samdo 1-dong", "삼도2동": "Samdo 2-dong", "용담1동": "Yongdam 1-dong", "용담2동": "Yongdam 2-dong", "건입동": "Geonip-dong", "화북동": "Hwabuk-dong", "삼양동": "Samyang-dong", "봉개동": "Bonggae-dong", "아라동": "Ara-dong", "오라동": "Ora-dong", "연동": "Yeon-dong", "노형동": "Nohyeong-dong", "외도동": "Oedo-dong", "이호동": "Iho-dong", "도두동": "Dodu-dong", "한림읍": "Hallim-eup", "애월읍": "Aewol-eup", "구좌읍": "Gujwa-eup", "조천읍": "Jocheon-eup", "한경면": "Hangyeong-myeon", "추자면": "Chuja-myeon", "우도면": "Udo-myeon", "대정읍": "Daejeong-eup", "남원읍": "Namwon-eup", "성산읍": "Seongsan-eup", "안덕면": "Andeok-myeon", "표선면": "Pyoseon-myeon", "송산동": "Songsan-dong", "정방동": "Jeongbang-dong", "중앙동": "Jungang-dong", "천지동": "Cheonji-dong", "효돈동": "Hyodon-dong", "영천동": "Yeongcheon-dong", "동홍동": "Donghong-dong", "서홍동": "Seohong-dong", "대륜동": "Daeryun-dong", "대천동": "Daecheon-dong", "중문동": "Jungmun-dong", "예래동": "Yerae-dong", "제주시": "Jeju-si", "서귀포시": "Seogwipo-si", "중국": "China", "대만": "Taiwan", "일본": "Japan", "미국": "USA", "홍콩": "Hong Kong", "태국": "Thailand", "싱가폴": "Singapore", "새별오름": "Saebyeol Oreum", "금오름": "Geum Oreum", "용눈이오름": "Yongnuni Oreum", "따라비오름": "Ttarabi Oreum", "군산오름": "Gunsan Oreum", "서우봉": "Seoubong", "물영아리오름": "Muryeongari Oreum", "큰노꼬메오름": "Keunnokkome Oreum", "백약이오름": "Baegyagi Oreum", "다랑쉬오름": "Darangswi Oreum", "궷물오름": "Gwetmul Oreum", "이승이오름": "Iseungi Oreum", "아부오름": "Abu Oreum", "저지오름": "Jeoji Oreum", "안친오름": "Anchin Oreum", "바리메오름": "Barime Oreum", "안돌오름": "Andol Oreum", "쇠머리오름": "Soemeori Oreum", "베릿내오름": "Beritnae Oreum", "민오름": "Min Oreum", "정물오름": "Jeongmul Oreum", "거문오름": "Geomun Oreum", "족은노꼬메오름": "Jogeunnokkome Oreum", "거슨세미오름": "Geoseunsemi Oreum", "개오름": "Gae Oreum", "솔오름": "Sol Oreum", "붉은오름": "Bulgeun Oreum", "아끈다랑쉬": "Akkeundarangswi", "바농오름": "Banong Oreum", "느지리오름": "Neujiri Oreum", "당오름": "Dang Oreum", "윗세오름": "Witse Oreum", "섯알오름": "Seosal Oreum", "부소오름": "Buso Oreum", "단산바굼지오름": "Dansanbagumji Oreum", "제지기오름": "Jejigi Oreum", "안세미오름": "Ansemi Oreum", "검은오름": "Geomeun Oreum", "세미오름": "Semi Oreum", "거친오름": "Geochin Oreum", "삼의악오름": "Samuiak Oreum", "왕이메오름": "Wangime Oreum", "마보기오름": "Mabogi Oreum", "원물오름": "Wonmul Oreum", "사라오름": "Sara Oreum", "천아오름": "Cheona Oreum", "동검은이오름": "Donggeomeuni Oreum", "소산오름": "Sosan Oreum", "광이오름": "Gwangi Oreum", "높은오름": "Nopeun Oreum", "누운오름": "Nuun Oreum", "우진제비오름": "Ujinjebi Oreum", "매오름": "Mae Oreum", "둔지오름": "Dunji Oreum", "궁대오름": "Gungdae Oreum", "남송이오름": "Namsongi Oreum", "통오름": "Tong Oreum", "돝오름": "Dot Oreum", "망밭오름": "Mangbat Oreum", "노리손이오름": "Norisoni Oreum", "시오름": "Si Oreum", "가마오름": "Gama Oreum", "어도오름": "Eodo Oreum", "영아리오름": "Yeongari Oreum", "성불오름": "Seongbul Oreum", "밧돌오름": "Batdol Oreum", "과오름": "Gwa Oreum", "도청오름": "Docheong Oreum", "칡오름": "Chik Oreum", "병곳오름": "Byeonggot Oreum", "각시바우오름": "Gaksibau Oreum", "모지오름": "Moji Oreum", "거린오름": "Georin Oreum", "파군봉바굼지오름": "Pagunbongbagumji Oreum", "갑선이오름": "Gapseoni Oreum", "큰지그리오름": "Keunjigeuri Oreum", "눈오름": "Nun Oreum", "알밤오름": "Albam Oreum", "가시오름": "Gasi Oreum", "감낭오름": "Gamnang Oreum", "민머루오름": "Minmeoru Oreum", "손지오름": "Sonji Oreum", "체오름": "Che Oreum", "넙게오름": "Neopge Oreum", "번널오름": "Beonneol Oreum", "걸시오름": "Geolsi Oreum", "오구시오름": "Ogusi Oreum", "이달오름": "Idal Oreum", "개오리오름": "Gaeori Oreum", "가새기오름": "Gasaegi Oreum", "삼형제큰오름": "Samhyeongjekeun Oreum", "마중오름": "Majung Oreum", "활오름": "Hwal Oreum", "모구리오름": "Moguri Oreum", "권제오름": "Gwonje Oreum", "이승악오름": "Iseungak Oreum", "문도지오름": "Mundoji Oreum", "화순곶자왈생태탐방숲길": "Hwasun Gotjawal Eco Trail", "서광동리곶자왈생태탐방로": "Seogwang-dongri Gotjawal Eco Trail", "화순곶자왈": "Hwasun Gotjawal", "송당곶자왈": "Songdang Gotjawal", "무릉곶자왈": "Mureung Gotjawal", "청수곶자왈": "Cheongsu Gotjawal", "1100고지휴게소": "1100 Highland Rest Area", "GS 용담셀프주유소": "GS Yongdam gas station", "SK렌터카/제주지점": "SK Rent-a-car Jeju", "검멀레해수욕장": "Geommeolle Beach", "골든데이지호텔/제주서귀포오션": "Golden Daisy Hotel Seogwipo", "곽지해수욕장": "Gwakji Beach", "금능해수욕장": "Geumneung Beach", "금호제주리조트": "Kumho Jeju Resort", "김녕해수욕장": "Gimnyeong Beach", "더시에나리조트": "The Siena Resort", "더퍼스트70호텔": "The First 70 Hotel", "도두동무지개해안도로": "Dodu Rainbow Coastal Road", "동문공영주차장": "Dongmun public parking", "동문시장주차장": "Dongmun Market parking", "동문재래시장": "Dongmun Market", "라온GC": "Raon Golf Club", "롯데렌터카/제주오토하우스지점": "Lotte Rent-a-car Jeju Auto House", "롯데마트/제주점": "Lotte Mart Jeju", "메종글래드제주호텔": "Maison Glad Jeju", "무상찻집": "Musang tea house", "무지개렌트카": "Mujigae Rent-a-car", "비자림": "Bijarim Forest", "산양큰엉곶": "Sanyang Keuneonggot", "삼성혈": "Samseonghyeol", "삼양해수욕장": "Samyang Beach", "삼화부영5차아파트": "Samhwa Booyoung apartments (5)", "삼화휴먼시아1단지아파트": "Samhwa Humansia apartments", "서귀포등기소": "Seogwipo registry office", "서귀포매일올레시장": "Seogwipo Maeil Olle Market", "서귀포보건소": "Seogwipo health center", "서귀포시청/제1청사": "Seogwipo City Hall", "서귀포의료원": "Seogwipo Medical Center", "서귀포치유의숲": "Seogwipo Healing Forest", "서귀포칼호텔": "Seogwipo KAL Hotel", "서귀포향토오일시장": "Seogwipo 5-day Market", "서문공설시장": "Seomun Market", "섭지코지": "Seopjikoji", "성산일출봉": "Seongsan Ilchulbong", "성이시돌목장": "Isidore Ranch", "소노캄/제주": "Sono Calm Jeju", "송악산공영주차장": "Songaksan public parking", "쇠소깍": "Soesokkak", "쇠소깍공영주차장": "Soesokkak public parking", "스타벅스/제주일도DT점": "Starbucks Jeju Ildo DT", "신라스테이플러스/이호테우": "Shilla Stay Plus Iho Tewoo", "신라호텔/제주": "The Shilla Jeju", "신신호텔/제주오션": "Shinshin Hotel Jeju Ocean", "신신호텔/천지연점": "Shinshin Hotel Cheonjiyeon", "신양항": "Sinyang Port", "신양항공영주차장": "Sinyang Port parking", "신창풍차해안도로": "Sinchang Windmill Coastal Road", "아베베베이커리": "Abebe Bakery", "아스타호텔": "Asta Hotel", "아쿠아플라넷/제주": "Aqua Planet Jeju", "에코랜드테마파크": "Ecoland Theme Park", "연돈": "Yeondon (tonkatsu)", "오는정김밥": "Oneunjeong Gimbap", "오설록티뮤지엄": "Osulloc Tea Museum", "외도2차부영아파트": "Oedo Booyoung apartments (2)", "용머리해안": "Yongmeori Coast", "우진해장국/본관": "Woojin Haejangguk", "윈드1947카트테마파크": "Wind1947 Kart Theme Park", "유니클로/서귀포점": "Uniqlo Seogwipo", "유니클로/제주도남점": "Uniqlo Jeju Donam", "유지커피웍스": "Yuji Coffee Works", "은희네해장국/본점": "Eunhuine Haejangguk", "이랜드파크켄싱턴리조트/서귀포점": "Kensington Resort Seogwipo", "이마트/서귀포점": "E-mart Seogwipo", "이마트/신제주점": "E-mart Sin-Jeju", "이마트/제주점": "E-mart Jeju", "이재모피자/제주점": "Lee Jae-mo Pizza Jeju", "이호테우말등대": "Iho Tewoo horse lighthouses", "이호테우해변": "Iho Tewoo Beach", "자매국수/본점": "Jamae Guksu (noodles)", "정방폭포": "Jeongbang Falls", "제스코마트": "Jesco Mart", "제주4.3평화공원": "Jeju 4.3 Peace Park", "제주강정유승한내들퍼스트오션아파트": "Gangjeong apartments", "제주고용복지플러스센터": "Jeju Employment Center", "제주국제공항": "Jeju International Airport", "제주김만복/본점": "Kim Man-bok Gimbap", "제주당베이커리카페": "Jejudang Bakery Cafe", "제주대학교/아라캠퍼스": "Jeju National University", "제주대학교병원": "Jeju National University Hospital", "제주동백수목원": "Jeju Camellia Arboretum", "제주동화마을": "Jeju Fairy Tale Village", "제주민속오일시장": "Jeju 5-day Market", "제주민속자연사박물관": "Jeju Folklore & Natural History Museum", "제주부영호텔&리조트": "Booyoung Hotel & Resort", "제주삼정G에듀아파트": "Samjung G-Edu apartments", "제주삼화6차부영아파트": "Samhwa Booyoung apartments (6)", "제주시청": "Jeju City Hall", "제주외도1차부영아파트": "Oedo Booyoung apartments (1)", "제주월드컵경기장": "Jeju World Cup Stadium", "제주절물자연휴양림": "Jeolmul Forest", "제주한라병원": "Jeju Halla Hospital", "제주항/제6부두": "Jeju Port Pier 6", "제주항국제여객선터미널": "Jeju Port International Terminal", "제주항연안여객터미널": "Jeju Port Ferry Terminal", "주상절리대": "Jusangjeolli Cliff", "천지연공영주차장": "Cheonjiyeon public parking", "천지연폭포": "Cheonjiyeon Falls", "천진항": "Cheonjin Port", "추자도": "Chujado", "카멜리아힐": "Camellia Hill", "테라로사/서귀포점": "Terarosa Seogwipo", "표선해수욕장": "Pyoseon Beach", "픽업": "Pickup point", "하나로마트/대정농협": "Hanaro Mart Daejeong", "하나로마트/서귀포농협": "Hanaro Mart Seogwipo", "하나로마트/제주시농협 노형점": "Hanaro Mart Nohyeong", "하나로마트/제주시농협오라점": "Hanaro Mart Ora", "하나로마트/중문농협본점": "Hanaro Mart Jungmun", "하나로마트/하귀농협": "Hanaro Mart Hagwi", "하우목동항": "Haumokdong Port", "한국병원": "Hankook Hospital", "한라산둘레길/사려니숲길": "Saryeoni Forest Trail", "한라수목원": "Halla Arboretum", "한화리조트/제주": "Hanwha Resort Jeju", "함덕해수욕장": "Hamdeok Beach", "해비치호텔": "Haevichi Hotel", "행복밀": "Haengbokmil", "허니문하우스": "Honeymoon House", "협재해수욕장": "Hyeopjae Beach", "형제상사/화북본점": "Hyeongje Sangsa Hwabuk", "호텔브릿지서귀포": "Hotel Bridge Seogwipo", "홈플러스/서귀포점": "Homeplus Seogwipo", "화북4아파트": "Hwabuk 4 apartments", "휴애리자연생활공원": "Hueree Nature Park", "애월리": "Aewol-ri", "광령리": "Gwangryeong-ri", "곽지리": "Gwakji-ri", "하귀2리": "Hagwi2-ri", "어음리": "Eoeum-ri", "고내리": "Gonae-ri", "신엄리": "Sineom-ri", "소길리": "Sogil-ri", "하귀1리": "Hagwi1-ri", "고성리": "Goseong-ri", "유수암리": "Yusuam-ri", "봉성리": "Bongseong-ri", "구엄리": "Gueom-ri", "상가리": "Sangga-ri", "하가리": "Haga-ri", "납읍리": "Nabeup-ri", "금성리": "Geumseong-ri", "상귀리": "Sanggwi-ri", "장전리": "Jangjeon-ri", "수산리": "Susan-ri", "서광리": "Seogwang-ri", "상창리": "Sangchang-ri", "상천리": "Sangcheon-ri", "화순리": "Hwasun-ri", "동광리": "Donggwang-ri", "사계리": "Sagye-ri", "창천리": "Changcheon-ri", "광평리": "Gwangpyeong-ri", "감산리": "Gamsan-ri", "덕수리": "Deoksu-ri", "함덕리": "Hamdeok-ri", "북촌리": "Bukchon-ri", "교래리": "Gyorae-ri", "조천리": "Jocheon-ri", "선흘리": "Seonheul-ri", "와흘리": "Waheul-ri", "신촌리": "Sinchon-ri", "대흘리": "Daeheul-ri", "와산리": "Wasan-ri", "신흥리": "Sinheung-ri", "송당리": "Songdang-ri", "김녕리": "Gimnyeong-ri", "세화리": "Sehwa-ri", "평대리": "Pyeongdae-ri", "월정리": "Woljeong-ri", "행원리": "Haengwon-ri", "동복리": "Dongbok-ri", "한동리": "Handong-ri", "종달리": "Jongdal-ri", "하도리": "Hado-ri", "상도리": "Sangdo-ri", "덕천리": "Deokcheon-ri", "한림리": "Hanrim-ri", "협재리": "Hyeopjae-ri", "금악리": "Geumak-ri", "금능리": "Geumneung-ri", "귀덕리": "Gwideok-ri", "대림리": "Daerim-ri", "옹포리": "Ongpo-ri", "동명리": "Dongmyeong-ri", "월령리": "Wollyeong-ri", "월림리": "Wollim-ri", "명월리": "Myeongwol-ri", "한수리": "Hansu-ri", "상대리": "Sangdae-ri", "수원리": "Suwon-ri", "상명리": "Sangmyeong-ri", "성산리": "Seongsan-ri", "오조리": "Ojo-ri", "신산리": "Sinsan-ri", "시흥리": "Siheung-ri", "삼달리": "Samdal-ri", "온평리": "Onpyeong-ri", "난산리": "Nansan-ri", "신풍리": "Sinpung-ri", "신천리": "Sincheon-ri", "표선리": "Pyoseon-ri", "성읍리": "Seongeup-ri", "가시리": "Gasi-ri", "토산리": "Tosan-ri", "하천리": "Hacheon-ri", "하모리": "Hamo-ri", "보성리": "Boseong-ri", "상모리": "Sangmo-ri", "구억리": "Gueok-ri", "안성리": "Anseong-ri", "일과리": "Ilgwa-ri", "무릉리": "Mureung-ri", "신도리": "Sindo-ri", "인성리": "Inseong-ri", "영락리": "Yeongrak-ri", "동일리": "Dongil-ri", "신평리": "Sinpyeong-ri", "남원리": "Namwon-ri", "신례리": "Sinrye-ri", "위미리": "Wimi-ri", "태흥리": "Taeheung-ri", "하례리": "Harye-ri", "수망리": "Sumang-ri", "한남리": "Hannam-ri", "의귀리": "Uigwi-ri", "고산리": "Gosan-ri", "저지리": "Jeoji-ri", "신창리": "Sinchang-ri", "청수리": "Cheongsu-ri", "판포리": "Panpo-ri", "두모리": "Dumo-ri", "조수리": "Josu-ri", "용수리": "Yongsu-ri", "낙천리": "Nakcheon-ri", "금등리": "Geumdeung-ri", "연평리": "Yeonpyeong-ri", "신양리": "Sinyang-ri", "대서리": "Daeseo-ri", "예초리": "Yecho-ri", "묵리": "Muk-ri", "영흥리": "Yeongheung-ri"}, "zh": {"일도1동": "一徒一洞", "일도2동": "一徒二洞", "이도1동": "二徒一洞", "이도2동": "二徒二洞", "삼도1동": "三徒一洞", "삼도2동": "三徒二洞", "용담1동": "龙潭一洞", "용담2동": "龙潭二洞", "건입동": "健入洞", "화북동": "禾北洞", "삼양동": "三阳洞", "봉개동": "奉盖洞", "아라동": "我罗洞", "오라동": "吾罗洞", "연동": "莲洞", "노형동": "老衡洞", "외도동": "外都洞", "이호동": "梨湖洞", "도두동": "道头洞", "한림읍": "翰林邑", "애월읍": "涯月邑", "구좌읍": "旧左邑", "조천읍": "朝天邑", "한경면": "翰京面", "추자면": "楸子面", "우도면": "牛岛面", "대정읍": "大静邑", "남원읍": "南元邑", "성산읍": "城山邑", "안덕면": "安德面", "표선면": "表善面", "송산동": "松山洞", "정방동": "正房洞", "중앙동": "中央洞", "천지동": "天地洞", "효돈동": "孝敦洞", "영천동": "灵泉洞", "동홍동": "东烘洞", "서홍동": "西烘洞", "대륜동": "大伦洞", "대천동": "大川洞", "중문동": "中文洞", "예래동": "猊来洞", "제주시": "济州市", "서귀포시": "西归浦市", "중국": "中国", "대만": "台湾", "일본": "日本", "미국": "美国", "홍콩": "香港", "태국": "泰国", "싱가폴": "新加坡", "새별오름": "Saebyeol Oreum", "금오름": "Geum Oreum", "용눈이오름": "Yongnuni Oreum", "따라비오름": "Ttarabi Oreum", "군산오름": "Gunsan Oreum", "서우봉": "Seoubong", "물영아리오름": "Muryeongari Oreum", "큰노꼬메오름": "Keunnokkome Oreum", "백약이오름": "Baegyagi Oreum", "다랑쉬오름": "Darangswi Oreum", "궷물오름": "Gwetmul Oreum", "이승이오름": "Iseungi Oreum", "아부오름": "Abu Oreum", "저지오름": "Jeoji Oreum", "안친오름": "Anchin Oreum", "바리메오름": "Barime Oreum", "안돌오름": "Andol Oreum", "쇠머리오름": "Soemeori Oreum", "베릿내오름": "Beritnae Oreum", "민오름": "Min Oreum", "정물오름": "Jeongmul Oreum", "거문오름": "Geomun Oreum", "족은노꼬메오름": "Jogeunnokkome Oreum", "거슨세미오름": "Geoseunsemi Oreum", "개오름": "Gae Oreum", "솔오름": "Sol Oreum", "붉은오름": "Bulgeun Oreum", "아끈다랑쉬": "Akkeundarangswi", "바농오름": "Banong Oreum", "느지리오름": "Neujiri Oreum", "당오름": "Dang Oreum", "윗세오름": "Witse Oreum", "섯알오름": "Seosal Oreum", "부소오름": "Buso Oreum", "단산바굼지오름": "Dansanbagumji Oreum", "제지기오름": "Jejigi Oreum", "안세미오름": "Ansemi Oreum", "검은오름": "Geomeun Oreum", "세미오름": "Semi Oreum", "거친오름": "Geochin Oreum", "삼의악오름": "Samuiak Oreum", "왕이메오름": "Wangime Oreum", "마보기오름": "Mabogi Oreum", "원물오름": "Wonmul Oreum", "사라오름": "Sara Oreum", "천아오름": "Cheona Oreum", "동검은이오름": "Donggeomeuni Oreum", "소산오름": "Sosan Oreum", "광이오름": "Gwangi Oreum", "높은오름": "Nopeun Oreum", "누운오름": "Nuun Oreum", "우진제비오름": "Ujinjebi Oreum", "매오름": "Mae Oreum", "둔지오름": "Dunji Oreum", "궁대오름": "Gungdae Oreum", "남송이오름": "Namsongi Oreum", "통오름": "Tong Oreum", "돝오름": "Dot Oreum", "망밭오름": "Mangbat Oreum", "노리손이오름": "Norisoni Oreum", "시오름": "Si Oreum", "가마오름": "Gama Oreum", "어도오름": "Eodo Oreum", "영아리오름": "Yeongari Oreum", "성불오름": "Seongbul Oreum", "밧돌오름": "Batdol Oreum", "과오름": "Gwa Oreum", "도청오름": "Docheong Oreum", "칡오름": "Chik Oreum", "병곳오름": "Byeonggot Oreum", "각시바우오름": "Gaksibau Oreum", "모지오름": "Moji Oreum", "거린오름": "Georin Oreum", "파군봉바굼지오름": "Pagunbongbagumji Oreum", "갑선이오름": "Gapseoni Oreum", "큰지그리오름": "Keunjigeuri Oreum", "눈오름": "Nun Oreum", "알밤오름": "Albam Oreum", "가시오름": "Gasi Oreum", "감낭오름": "Gamnang Oreum", "민머루오름": "Minmeoru Oreum", "손지오름": "Sonji Oreum", "체오름": "Che Oreum", "넙게오름": "Neopge Oreum", "번널오름": "Beonneol Oreum", "걸시오름": "Geolsi Oreum", "오구시오름": "Ogusi Oreum", "이달오름": "Idal Oreum", "개오리오름": "Gaeori Oreum", "가새기오름": "Gasaegi Oreum", "삼형제큰오름": "Samhyeongjekeun Oreum", "마중오름": "Majung Oreum", "활오름": "Hwal Oreum", "모구리오름": "Moguri Oreum", "권제오름": "Gwonje Oreum", "이승악오름": "Iseungak Oreum", "문도지오름": "Mundoji Oreum", "화순곶자왈생태탐방숲길": "和顺Gotjawal生态步道", "서광동리곶자왈생태탐방로": "西广东里Gotjawal生态步道", "화순곶자왈": "和顺Gotjawal", "송당곶자왈": "松堂Gotjawal", "무릉곶자왈": "武陵Gotjawal", "청수곶자왈": "清水Gotjawal", "1100고지휴게소": "1100高地休息站", "GS 용담셀프주유소": "GS龙潭自助加油站", "SK렌터카/제주지점": "SK租车济州店", "검멀레해수욕장": "Geommeolle海水浴场", "골든데이지호텔/제주서귀포오션": "Golden Daisy酒店西归浦", "곽지해수욕장": "郭支海水浴场", "금능해수욕장": "金陵海水浴场", "금호제주리조트": "锦湖济州度假村", "김녕해수욕장": "金宁海水浴场", "더시에나리조트": "The Siena度假村", "더퍼스트70호텔": "The First 70酒店", "도두동무지개해안도로": "道头彩虹海岸路", "동문공영주차장": "东门公营停车场", "동문시장주차장": "东门市场停车场", "동문재래시장": "东门传统市场", "라온GC": "Raon高尔夫球场", "롯데렌터카/제주오토하우스지점": "乐天租车济州店", "롯데마트/제주점": "乐天玛特济州店", "메종글래드제주호텔": "Maison Glad济州酒店", "무상찻집": "Musang茶馆", "무지개렌트카": "彩虹租车", "비자림": "榧子林", "산양큰엉곶": "Sanyang Keuneonggot森林", "삼성혈": "三姓穴", "삼양해수욕장": "三阳海水浴场", "삼화부영5차아파트": "三华富荣5期公寓", "삼화휴먼시아1단지아파트": "三华Humansia公寓", "서귀포등기소": "西归浦登记所", "서귀포매일올레시장": "西归浦每日偶来市场", "서귀포보건소": "西归浦保健所", "서귀포시청/제1청사": "西归浦市厅", "서귀포의료원": "西归浦医疗院", "서귀포치유의숲": "西归浦治愈之林", "서귀포칼호텔": "西归浦KAL酒店", "서귀포향토오일시장": "西归浦乡土五日市场", "서문공설시장": "西门公设市场", "섭지코지": "涉地可支", "성산일출봉": "城山日出峰", "성이시돌목장": "圣伊西多尔牧场", "소노캄/제주": "Sono Calm济州", "송악산공영주차장": "松岳山公营停车场", "쇠소깍": "牛沼河口", "쇠소깍공영주차장": "牛沼河口公营停车场", "스타벅스/제주일도DT점": "星巴克济州一徒DT店", "신라스테이플러스/이호테우": "新罗舒泰Plus梨湖", "신라호텔/제주": "济州新罗酒店", "신신호텔/제주오션": "Shinshin酒店济州Ocean", "신신호텔/천지연점": "Shinshin酒店天地渊店", "신양항": "新阳港", "신양항공영주차장": "新阳港公营停车场", "신창풍차해안도로": "新昌风车海岸路", "아베베베이커리": "Abebe面包店", "아스타호텔": "Asta酒店", "아쿠아플라넷/제주": "济州Aqua Planet水族馆", "에코랜드테마파크": "生态乐园主题公园", "연돈": "Yeondon炸猪排", "오는정김밥": "Oneunjeong紫菜包饭", "오설록티뮤지엄": "O'sulloc茶博物馆", "외도2차부영아파트": "外都富荣2期公寓", "용머리해안": "龙头海岸", "우진해장국/본관": "Woojin醒酒汤", "윈드1947카트테마파크": "Wind1947卡丁车乐园", "유니클로/서귀포점": "优衣库西归浦店", "유니클로/제주도남점": "优衣库济州道南店", "유지커피웍스": "Yuji咖啡", "은희네해장국/본점": "Eunhuine醒酒汤", "이랜드파크켄싱턴리조트/서귀포점": "肯辛顿度假村西归浦", "이마트/서귀포점": "易买得西归浦店", "이마트/신제주점": "易买得新济州店", "이마트/제주점": "易买得济州店", "이재모피자/제주점": "李在模披萨济州店", "이호테우말등대": "梨湖木马灯塔", "이호테우해변": "梨湖海边", "자매국수/본점": "Jamae面馆", "정방폭포": "正房瀑布", "제스코마트": "Jesco超市", "제주4.3평화공원": "济州4·3和平公园", "제주강정유승한내들퍼스트오션아파트": "江汀公寓", "제주고용복지플러스센터": "济州就业福利中心", "제주국제공항": "济州国际机场", "제주김만복/본점": "金万福紫菜包饭", "제주당베이커리카페": "Jejudang面包咖啡", "제주대학교/아라캠퍼스": "济州大学", "제주대학교병원": "济州大学医院", "제주동백수목원": "济州山茶树木园", "제주동화마을": "济州童话村", "제주민속오일시장": "济州民俗五日市场", "제주민속자연사박물관": "济州民俗自然史博物馆", "제주부영호텔&리조트": "富荣酒店度假村", "제주삼정G에듀아파트": "Samjung G公寓", "제주삼화6차부영아파트": "三华富荣6期公寓", "제주시청": "济州市厅", "제주외도1차부영아파트": "外都富荣1期公寓", "제주월드컵경기장": "济州世界杯体育场", "제주절물자연휴양림": "节物自然休养林", "제주한라병원": "济州汉拿医院", "제주항/제6부두": "济州港第6码头", "제주항국제여객선터미널": "济州港国际客运码头", "제주항연안여객터미널": "济州港沿岸客运码头", "주상절리대": "柱状节理带", "천지연공영주차장": "天地渊公营停车场", "천지연폭포": "天地渊瀑布", "천진항": "天津港（牛岛）", "추자도": "楸子岛", "카멜리아힐": "山茶花之丘", "테라로사/서귀포점": "Terarosa西归浦店", "표선해수욕장": "表善海水浴场", "픽업": "接送点", "하나로마트/대정농협": "Hanaro超市大静", "하나로마트/서귀포농협": "Hanaro超市西归浦", "하나로마트/제주시농협 노형점": "Hanaro超市老衡", "하나로마트/제주시농협오라점": "Hanaro超市吾罗", "하나로마트/중문농협본점": "Hanaro超市中文", "하나로마트/하귀농협": "Hanaro超市下贵", "하우목동항": "Haumokdong港", "한국병원": "韩国医院", "한라산둘레길/사려니숲길": "思连伊林荫路", "한라수목원": "汉拿树木园", "한화리조트/제주": "韩华度假村济州", "함덕해수욕장": "咸德海水浴场", "해비치호텔": "海比奇酒店", "행복밀": "Haengbokmil", "허니문하우스": "蜜月之家", "협재해수욕장": "挟才海水浴场", "형제상사/화북본점": "兄弟商社禾北店", "호텔브릿지서귀포": "Bridge酒店西归浦", "홈플러스/서귀포점": "Homeplus西归浦店", "화북4아파트": "禾北4公寓", "휴애리자연생활공원": "休爱里自然生活公园", "애월리": "Aewol-ri", "광령리": "Gwangryeong-ri", "곽지리": "Gwakji-ri", "하귀2리": "Hagwi2-ri", "어음리": "Eoeum-ri", "고내리": "Gonae-ri", "신엄리": "Sineom-ri", "소길리": "Sogil-ri", "하귀1리": "Hagwi1-ri", "고성리": "Goseong-ri", "유수암리": "Yusuam-ri", "봉성리": "Bongseong-ri", "구엄리": "Gueom-ri", "상가리": "Sangga-ri", "하가리": "Haga-ri", "납읍리": "Nabeup-ri", "금성리": "Geumseong-ri", "상귀리": "Sanggwi-ri", "장전리": "Jangjeon-ri", "수산리": "Susan-ri", "서광리": "Seogwang-ri", "상창리": "Sangchang-ri", "상천리": "Sangcheon-ri", "화순리": "Hwasun-ri", "동광리": "Donggwang-ri", "사계리": "Sagye-ri", "창천리": "Changcheon-ri", "광평리": "Gwangpyeong-ri", "감산리": "Gamsan-ri", "덕수리": "Deoksu-ri", "함덕리": "Hamdeok-ri", "북촌리": "Bukchon-ri", "교래리": "Gyorae-ri", "조천리": "Jocheon-ri", "선흘리": "Seonheul-ri", "와흘리": "Waheul-ri", "신촌리": "Sinchon-ri", "대흘리": "Daeheul-ri", "와산리": "Wasan-ri", "신흥리": "Sinheung-ri", "송당리": "Songdang-ri", "김녕리": "Gimnyeong-ri", "세화리": "Sehwa-ri", "평대리": "Pyeongdae-ri", "월정리": "Woljeong-ri", "행원리": "Haengwon-ri", "동복리": "Dongbok-ri", "한동리": "Handong-ri", "종달리": "Jongdal-ri", "하도리": "Hado-ri", "상도리": "Sangdo-ri", "덕천리": "Deokcheon-ri", "한림리": "Hanrim-ri", "협재리": "Hyeopjae-ri", "금악리": "Geumak-ri", "금능리": "Geumneung-ri", "귀덕리": "Gwideok-ri", "대림리": "Daerim-ri", "옹포리": "Ongpo-ri", "동명리": "Dongmyeong-ri", "월령리": "Wollyeong-ri", "월림리": "Wollim-ri", "명월리": "Myeongwol-ri", "한수리": "Hansu-ri", "상대리": "Sangdae-ri", "수원리": "Suwon-ri", "상명리": "Sangmyeong-ri", "성산리": "Seongsan-ri", "오조리": "Ojo-ri", "신산리": "Sinsan-ri", "시흥리": "Siheung-ri", "삼달리": "Samdal-ri", "온평리": "Onpyeong-ri", "난산리": "Nansan-ri", "신풍리": "Sinpung-ri", "신천리": "Sincheon-ri", "표선리": "Pyoseon-ri", "성읍리": "Seongeup-ri", "가시리": "Gasi-ri", "토산리": "Tosan-ri", "하천리": "Hacheon-ri", "하모리": "Hamo-ri", "보성리": "Boseong-ri", "상모리": "Sangmo-ri", "구억리": "Gueok-ri", "안성리": "Anseong-ri", "일과리": "Ilgwa-ri", "무릉리": "Mureung-ri", "신도리": "Sindo-ri", "인성리": "Inseong-ri", "영락리": "Yeongrak-ri", "동일리": "Dongil-ri", "신평리": "Sinpyeong-ri", "남원리": "Namwon-ri", "신례리": "Sinrye-ri", "위미리": "Wimi-ri", "태흥리": "Taeheung-ri", "하례리": "Harye-ri", "수망리": "Sumang-ri", "한남리": "Hannam-ri", "의귀리": "Uigwi-ri", "고산리": "Gosan-ri", "저지리": "Jeoji-ri", "신창리": "Sinchang-ri", "청수리": "Cheongsu-ri", "판포리": "Panpo-ri", "두모리": "Dumo-ri", "조수리": "Josu-ri", "용수리": "Yongsu-ri", "낙천리": "Nakcheon-ri", "금등리": "Geumdeung-ri", "연평리": "Yeonpyeong-ri", "신양리": "Sinyang-ri", "대서리": "Daeseo-ri", "예초리": "Yecho-ri", "묵리": "Muk-ri", "영흥리": "Yeongheung-ri"}, "zh-tw": {"일도1동": "一徒一洞", "일도2동": "一徒二洞", "이도1동": "二徒一洞", "이도2동": "二徒二洞", "삼도1동": "三徒一洞", "삼도2동": "三徒二洞", "용담1동": "龍潭一洞", "용담2동": "龍潭二洞", "건입동": "健入洞", "화북동": "禾北洞", "삼양동": "三陽洞", "봉개동": "奉蓋洞", "아라동": "我羅洞", "오라동": "吾羅洞", "연동": "蓮洞", "노형동": "老衡洞", "외도동": "外都洞", "이호동": "梨湖洞", "도두동": "道頭洞", "한림읍": "翰林邑", "애월읍": "涯月邑", "구좌읍": "舊左邑", "조천읍": "朝天邑", "한경면": "翰京面", "추자면": "楸子面", "우도면": "牛島面", "대정읍": "大靜邑", "남원읍": "南元邑", "성산읍": "城山邑", "안덕면": "安德面", "표선면": "表善面", "송산동": "松山洞", "정방동": "正房洞", "중앙동": "中央洞", "천지동": "天地洞", "효돈동": "孝敦洞", "영천동": "靈泉洞", "동홍동": "東烘洞", "서홍동": "西烘洞", "대륜동": "大倫洞", "대천동": "大川洞", "중문동": "中文洞", "예래동": "猊來洞", "제주시": "濟州市", "서귀포시": "西歸浦市", "중국": "中國", "대만": "臺灣", "일본": "日本", "미국": "美國", "홍콩": "香港", "태국": "泰國", "싱가폴": "新加坡", "새별오름": "Saebyeol Oreum", "금오름": "Geum Oreum", "용눈이오름": "Yongnuni Oreum", "따라비오름": "Ttarabi Oreum", "군산오름": "Gunsan Oreum", "서우봉": "Seoubong", "물영아리오름": "Muryeongari Oreum", "큰노꼬메오름": "Keunnokkome Oreum", "백약이오름": "Baegyagi Oreum", "다랑쉬오름": "Darangswi Oreum", "궷물오름": "Gwetmul Oreum", "이승이오름": "Iseungi Oreum", "아부오름": "Abu Oreum", "저지오름": "Jeoji Oreum", "안친오름": "Anchin Oreum", "바리메오름": "Barime Oreum", "안돌오름": "Andol Oreum", "쇠머리오름": "Soemeori Oreum", "베릿내오름": "Beritnae Oreum", "민오름": "Min Oreum", "정물오름": "Jeongmul Oreum", "거문오름": "Geomun Oreum", "족은노꼬메오름": "Jogeunnokkome Oreum", "거슨세미오름": "Geoseunsemi Oreum", "개오름": "Gae Oreum", "솔오름": "Sol Oreum", "붉은오름": "Bulgeun Oreum", "아끈다랑쉬": "Akkeundarangswi", "바농오름": "Banong Oreum", "느지리오름": "Neujiri Oreum", "당오름": "Dang Oreum", "윗세오름": "Witse Oreum", "섯알오름": "Seosal Oreum", "부소오름": "Buso Oreum", "단산바굼지오름": "Dansanbagumji Oreum", "제지기오름": "Jejigi Oreum", "안세미오름": "Ansemi Oreum", "검은오름": "Geomeun Oreum", "세미오름": "Semi Oreum", "거친오름": "Geochin Oreum", "삼의악오름": "Samuiak Oreum", "왕이메오름": "Wangime Oreum", "마보기오름": "Mabogi Oreum", "원물오름": "Wonmul Oreum", "사라오름": "Sara Oreum", "천아오름": "Cheona Oreum", "동검은이오름": "Donggeomeuni Oreum", "소산오름": "Sosan Oreum", "광이오름": "Gwangi Oreum", "높은오름": "Nopeun Oreum", "누운오름": "Nuun Oreum", "우진제비오름": "Ujinjebi Oreum", "매오름": "Mae Oreum", "둔지오름": "Dunji Oreum", "궁대오름": "Gungdae Oreum", "남송이오름": "Namsongi Oreum", "통오름": "Tong Oreum", "돝오름": "Dot Oreum", "망밭오름": "Mangbat Oreum", "노리손이오름": "Norisoni Oreum", "시오름": "Si Oreum", "가마오름": "Gama Oreum", "어도오름": "Eodo Oreum", "영아리오름": "Yeongari Oreum", "성불오름": "Seongbul Oreum", "밧돌오름": "Batdol Oreum", "과오름": "Gwa Oreum", "도청오름": "Docheong Oreum", "칡오름": "Chik Oreum", "병곳오름": "Byeonggot Oreum", "각시바우오름": "Gaksibau Oreum", "모지오름": "Moji Oreum", "거린오름": "Georin Oreum", "파군봉바굼지오름": "Pagunbongbagumji Oreum", "갑선이오름": "Gapseoni Oreum", "큰지그리오름": "Keunjigeuri Oreum", "눈오름": "Nun Oreum", "알밤오름": "Albam Oreum", "가시오름": "Gasi Oreum", "감낭오름": "Gamnang Oreum", "민머루오름": "Minmeoru Oreum", "손지오름": "Sonji Oreum", "체오름": "Che Oreum", "넙게오름": "Neopge Oreum", "번널오름": "Beonneol Oreum", "걸시오름": "Geolsi Oreum", "오구시오름": "Ogusi Oreum", "이달오름": "Idal Oreum", "개오리오름": "Gaeori Oreum", "가새기오름": "Gasaegi Oreum", "삼형제큰오름": "Samhyeongjekeun Oreum", "마중오름": "Majung Oreum", "활오름": "Hwal Oreum", "모구리오름": "Moguri Oreum", "권제오름": "Gwonje Oreum", "이승악오름": "Iseungak Oreum", "문도지오름": "Mundoji Oreum", "화순곶자왈생태탐방숲길": "和順Gotjawal生態步道", "서광동리곶자왈생태탐방로": "西廣東里Gotjawal生態步道", "화순곶자왈": "和順Gotjawal", "송당곶자왈": "松堂Gotjawal", "무릉곶자왈": "武陵Gotjawal", "청수곶자왈": "清水Gotjawal", "1100고지휴게소": "1100高地休息站", "GS 용담셀프주유소": "GS龍潭自助加油站", "SK렌터카/제주지점": "SK租車濟州店", "검멀레해수욕장": "Geommeolle海水浴場", "골든데이지호텔/제주서귀포오션": "Golden Daisy酒店西歸浦", "곽지해수욕장": "郭支海水浴場", "금능해수욕장": "金陵海水浴場", "금호제주리조트": "錦湖濟州度假村", "김녕해수욕장": "金寧海水浴場", "더시에나리조트": "The Siena度假村", "더퍼스트70호텔": "The First 70酒店", "도두동무지개해안도로": "道頭彩虹海岸路", "동문공영주차장": "東門公營停車場", "동문시장주차장": "東門市場停車場", "동문재래시장": "東門傳統市場", "라온GC": "Raon高爾夫球場", "롯데렌터카/제주오토하우스지점": "樂天租車濟州店", "롯데마트/제주점": "樂天瑪特濟州店", "메종글래드제주호텔": "Maison Glad濟州酒店", "무상찻집": "Musang茶館", "무지개렌트카": "彩虹租車", "비자림": "榧子林", "산양큰엉곶": "Sanyang Keuneonggot森林", "삼성혈": "三姓穴", "삼양해수욕장": "三陽海水浴場", "삼화부영5차아파트": "三華富榮5期公寓", "삼화휴먼시아1단지아파트": "三華Humansia公寓", "서귀포등기소": "西歸浦登記所", "서귀포매일올레시장": "西歸浦每日偶來市場", "서귀포보건소": "西歸浦保健所", "서귀포시청/제1청사": "西歸浦市廳", "서귀포의료원": "西歸浦醫療院", "서귀포치유의숲": "西歸浦治癒之林", "서귀포칼호텔": "西歸浦KAL酒店", "서귀포향토오일시장": "西歸浦鄉土五日市場", "서문공설시장": "西門公設市場", "섭지코지": "涉地可支", "성산일출봉": "城山日出峰", "성이시돌목장": "聖伊西多爾牧場", "소노캄/제주": "Sono Calm濟州", "송악산공영주차장": "松嶽山公營停車場", "쇠소깍": "牛沼河口", "쇠소깍공영주차장": "牛沼河口公營停車場", "스타벅스/제주일도DT점": "星巴克濟州一徒DT店", "신라스테이플러스/이호테우": "新羅舒泰Plus梨湖", "신라호텔/제주": "濟州新羅酒店", "신신호텔/제주오션": "Shinshin酒店濟州Ocean", "신신호텔/천지연점": "Shinshin酒店天地淵店", "신양항": "新陽港", "신양항공영주차장": "新陽港公營停車場", "신창풍차해안도로": "新昌風車海岸路", "아베베베이커리": "Abebe麵包店", "아스타호텔": "Asta酒店", "아쿠아플라넷/제주": "濟州Aqua Planet水族館", "에코랜드테마파크": "生態樂園主題公園", "연돈": "Yeondon炸豬排", "오는정김밥": "Oneunjeong紫菜包飯", "오설록티뮤지엄": "O'sulloc茶博物館", "외도2차부영아파트": "外都富榮2期公寓", "용머리해안": "龍頭海岸", "우진해장국/본관": "Woojin醒酒湯", "윈드1947카트테마파크": "Wind1947卡丁車樂園", "유니클로/서귀포점": "優衣庫西歸浦店", "유니클로/제주도남점": "優衣庫濟州道南店", "유지커피웍스": "Yuji咖啡", "은희네해장국/본점": "Eunhuine醒酒湯", "이랜드파크켄싱턴리조트/서귀포점": "肯辛頓度假村西歸浦", "이마트/서귀포점": "易買得西歸浦店", "이마트/신제주점": "易買得新濟州店", "이마트/제주점": "易買得濟州店", "이재모피자/제주점": "李在模披薩濟州店", "이호테우말등대": "梨湖木馬燈塔", "이호테우해변": "梨湖海邊", "자매국수/본점": "Jamae麵館", "정방폭포": "正房瀑布", "제스코마트": "Jesco超市", "제주4.3평화공원": "濟州4·3和平公園", "제주강정유승한내들퍼스트오션아파트": "江汀公寓", "제주고용복지플러스센터": "濟州就業福利中心", "제주국제공항": "濟州國際機場", "제주김만복/본점": "金萬福紫菜包飯", "제주당베이커리카페": "Jejudang麵包咖啡", "제주대학교/아라캠퍼스": "濟州大學", "제주대학교병원": "濟州大學醫院", "제주동백수목원": "濟州山茶樹木園", "제주동화마을": "濟州童話村", "제주민속오일시장": "濟州民俗五日市場", "제주민속자연사박물관": "濟州民俗自然史博物館", "제주부영호텔&리조트": "富榮酒店度假村", "제주삼정G에듀아파트": "Samjung G公寓", "제주삼화6차부영아파트": "三華富榮6期公寓", "제주시청": "濟州市廳", "제주외도1차부영아파트": "外都富榮1期公寓", "제주월드컵경기장": "濟州世界盃體育場", "제주절물자연휴양림": "節物自然休養林", "제주한라병원": "濟州漢拿醫院", "제주항/제6부두": "濟州港第6碼頭", "제주항국제여객선터미널": "濟州港國際客運碼頭", "제주항연안여객터미널": "濟州港沿岸客運碼頭", "주상절리대": "柱狀節理帶", "천지연공영주차장": "天地淵公營停車場", "천지연폭포": "天地淵瀑布", "천진항": "天津港（牛島）", "추자도": "楸子島", "카멜리아힐": "山茶花之丘", "테라로사/서귀포점": "Terarosa西歸浦店", "표선해수욕장": "表善海水浴場", "픽업": "接送點", "하나로마트/대정농협": "Hanaro超市大靜", "하나로마트/서귀포농협": "Hanaro超市西歸浦", "하나로마트/제주시농협 노형점": "Hanaro超市老衡", "하나로마트/제주시농협오라점": "Hanaro超市吾羅", "하나로마트/중문농협본점": "Hanaro超市中文", "하나로마트/하귀농협": "Hanaro超市下貴", "하우목동항": "Haumokdong港", "한국병원": "韓國醫院", "한라산둘레길/사려니숲길": "思連伊林蔭路", "한라수목원": "漢拿樹木園", "한화리조트/제주": "韓華度假村濟州", "함덕해수욕장": "鹹德海水浴場", "해비치호텔": "海比奇酒店", "행복밀": "Haengbokmil", "허니문하우스": "蜜月之家", "협재해수욕장": "挾才海水浴場", "형제상사/화북본점": "兄弟商社禾北店", "호텔브릿지서귀포": "Bridge酒店西歸浦", "홈플러스/서귀포점": "Homeplus西歸浦店", "화북4아파트": "禾北4公寓", "휴애리자연생활공원": "休愛裡自然生活公園", "애월리": "Aewol-ri", "광령리": "Gwangryeong-ri", "곽지리": "Gwakji-ri", "하귀2리": "Hagwi2-ri", "어음리": "Eoeum-ri", "고내리": "Gonae-ri", "신엄리": "Sineom-ri", "소길리": "Sogil-ri", "하귀1리": "Hagwi1-ri", "고성리": "Goseong-ri", "유수암리": "Yusuam-ri", "봉성리": "Bongseong-ri", "구엄리": "Gueom-ri", "상가리": "Sangga-ri", "하가리": "Haga-ri", "납읍리": "Nabeup-ri", "금성리": "Geumseong-ri", "상귀리": "Sanggwi-ri", "장전리": "Jangjeon-ri", "수산리": "Susan-ri", "서광리": "Seogwang-ri", "상창리": "Sangchang-ri", "상천리": "Sangcheon-ri", "화순리": "Hwasun-ri", "동광리": "Donggwang-ri", "사계리": "Sagye-ri", "창천리": "Changcheon-ri", "광평리": "Gwangpyeong-ri", "감산리": "Gamsan-ri", "덕수리": "Deoksu-ri", "함덕리": "Hamdeok-ri", "북촌리": "Bukchon-ri", "교래리": "Gyorae-ri", "조천리": "Jocheon-ri", "선흘리": "Seonheul-ri", "와흘리": "Waheul-ri", "신촌리": "Sinchon-ri", "대흘리": "Daeheul-ri", "와산리": "Wasan-ri", "신흥리": "Sinheung-ri", "송당리": "Songdang-ri", "김녕리": "Gimnyeong-ri", "세화리": "Sehwa-ri", "평대리": "Pyeongdae-ri", "월정리": "Woljeong-ri", "행원리": "Haengwon-ri", "동복리": "Dongbok-ri", "한동리": "Handong-ri", "종달리": "Jongdal-ri", "하도리": "Hado-ri", "상도리": "Sangdo-ri", "덕천리": "Deokcheon-ri", "한림리": "Hanrim-ri", "협재리": "Hyeopjae-ri", "금악리": "Geumak-ri", "금능리": "Geumneung-ri", "귀덕리": "Gwideok-ri", "대림리": "Daerim-ri", "옹포리": "Ongpo-ri", "동명리": "Dongmyeong-ri", "월령리": "Wollyeong-ri", "월림리": "Wollim-ri", "명월리": "Myeongwol-ri", "한수리": "Hansu-ri", "상대리": "Sangdae-ri", "수원리": "Suwon-ri", "상명리": "Sangmyeong-ri", "성산리": "Seongsan-ri", "오조리": "Ojo-ri", "신산리": "Sinsan-ri", "시흥리": "Siheung-ri", "삼달리": "Samdal-ri", "온평리": "Onpyeong-ri", "난산리": "Nansan-ri", "신풍리": "Sinpung-ri", "신천리": "Sincheon-ri", "표선리": "Pyoseon-ri", "성읍리": "Seongeup-ri", "가시리": "Gasi-ri", "토산리": "Tosan-ri", "하천리": "Hacheon-ri", "하모리": "Hamo-ri", "보성리": "Boseong-ri", "상모리": "Sangmo-ri", "구억리": "Gueok-ri", "안성리": "Anseong-ri", "일과리": "Ilgwa-ri", "무릉리": "Mureung-ri", "신도리": "Sindo-ri", "인성리": "Inseong-ri", "영락리": "Yeongrak-ri", "동일리": "Dongil-ri", "신평리": "Sinpyeong-ri", "남원리": "Namwon-ri", "신례리": "Sinrye-ri", "위미리": "Wimi-ri", "태흥리": "Taeheung-ri", "하례리": "Harye-ri", "수망리": "Sumang-ri", "한남리": "Hannam-ri", "의귀리": "Uigwi-ri", "고산리": "Gosan-ri", "저지리": "Jeoji-ri", "신창리": "Sinchang-ri", "청수리": "Cheongsu-ri", "판포리": "Panpo-ri", "두모리": "Dumo-ri", "조수리": "Josu-ri", "용수리": "Yongsu-ri", "낙천리": "Nakcheon-ri", "금등리": "Geumdeung-ri", "연평리": "Yeonpyeong-ri", "신양리": "Sinyang-ri", "대서리": "Daeseo-ri", "예초리": "Yecho-ri", "묵리": "Muk-ri", "영흥리": "Yeongheung-ri"}}};
})();
