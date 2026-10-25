(() => {
  const box = document.getElementById('weeklyRanking');
  const status = document.getElementById('weeklyStatus');
  const list = document.getElementById('weeklyWinners');
  const source = 'https://www.nielsenkorea.co.kr/tv_terrestrial_day.asp?sub_menu=1_2&area=00';
  const channels = new Set(['kbs1', 'kbs2', 'mbc', 'sbs', 'ebs1', 'ebs2']);
  const parseDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error('Invalid date');
    const date = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw Error('Invalid date');
    return date;
  };
  async function load() {
    try {
      const response = await fetch('./data/weekly-ratings.json', {cache: 'no-store', signal: AbortSignal.timeout(10000)});
      if (!response.ok) throw Error('Unavailable');
      const data = await response.json();
      const start = parseDate(data.periodStart), end = parseDate(data.periodEnd);
      const now = new Date();
      const kstToday = new Date(now.getTime() + 9 * 3600000).toISOString().slice(0, 10);
      if (end - start !== 6 * 86400000 || start.getUTCDay() !== 1 || data.periodEnd >= kstToday || data.sourceUrl !== source ||
          data.scope !== '전국 지상파 · 가구 시청률' || !Array.isArray(data.winners) || !data.winners.length ||
          data.winners.some(w => !channels.has(w.channelId) || typeof w.program !== 'string' || !w.program.trim() ||
            typeof w.channel !== 'string' || !Number.isFinite(w.rating) || w.rating <= 0 || w.rating > 100 || w.rating !== data.winners[0].rating)) throw Error('Invalid ranking');
      const stale = (parseDate(kstToday) - end) / 86400000 > 14;
      status.textContent = `${data.periodStart.replaceAll('-', '.')} ~ ${data.periodEnd.replaceAll('-', '.')} · 전국 지상파 · 가구 기준${stale ? ' · 갱신 지연: 이전 발표 자료' : ' · 최신 확인 발표 자료'}`;
      list.replaceChildren();
      const joint = data.winners.length > 1;
      for (const winner of data.winners) {
        const row = document.createElement('div'); row.className = 'weekly-winner';
        const label = document.createElement('span'); label.className = 'weekly-channel'; label.textContent = winner.channel;
        const title = document.createElement('strong'); title.className = 'weekly-program'; title.textContent = winner.program;
        const rating = document.createElement('b'); rating.className = 'weekly-value'; rating.textContent = `${winner.rating.toFixed(1)}%`;
        row.append(label, title, rating); list.append(row);
        if (!stale) {
          const card = document.querySelector(`.ch[data-channel="${winner.channelId}"]`);
          if (card && !card.querySelector('.weekly-badge')) {
            const badge = document.createElement('span'); badge.className = 'weekly-badge';
            badge.textContent = `🏆 주간 시청률 ${joint ? '공동 ' : ''}1위 프로그램`;
            badge.title = `${winner.program} · ${winner.rating}% · ${data.periodStart} ~ ${data.periodEnd}`;
            card.querySelector('.name').before(badge); card.classList.add('weekly-top');
          }
        }
      }
      document.getElementById('weeklyTitle').textContent = `🏆 지상파 주간 시청률 ${joint ? '공동 ' : ''}1위 프로그램`;
    } catch (error) {
      status.textContent = '주간 시청률 자료를 확인할 수 없습니다. 공식 순위에서 확인해 주세요.';
    } finally { box.setAttribute('aria-busy', 'false'); }
  }
  load();
})();
