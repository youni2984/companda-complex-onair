(() => {
  const box = document.getElementById('weeklyRanking');
  const status = document.getElementById('weeklyStatus');
  const list = document.getElementById('weeklyWinners');
  const source = 'https://www.nielsenkorea.co.kr/tv_terrestrial_day.asp?sub_menu=1_2&area=00';
  // Confirmed official episode 1 links, matched by channel and program.
  const programReplays = {
    'kbs1:엄마가미쳤어요': {
      url: 'https://vod.kbs.co.kr/index.html?source=episode&sname=vod&stype=vod&program_code=T2026-0197&program_id=PS-2026084265-01-000&broadcast_complete_yn=N&local_station_code=00&section_code=03'
    },
    'kbs2:사랑이온다': {
      url: 'https://vod.kbs.co.kr/index.html?source=episode&sname=vod&stype=vod&program_code=T2026-0039&program_id=PS-2026034678-01-000&broadcast_complete_yn=N&local_station_code=00&section_code=03'
    },
    'sbs:닥터X하얀마피아의시대': {
      url: 'https://programs.sbs.co.kr/drama/doctorx/vod/88585/22000637949'
    }
  };
  function replayFor(winners, channelId) {
    if (winners.length !== 1) return null;
    const name = winners[0].program.replace(/\s/g, '').replace(/^(?:KBS[12]|SBS)(?:일일|주말|금토)드라마\((.*)\)$/, '$1').replace(/[:：]/g, '');
    return programReplays[channelId + ':' + name] || null;
  }
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
          data.scope !== '전국 지상파 · 가구 시청률' || !Array.isArray(data.channelWinners) || !data.channelWinners.length ||
          data.channelWinners.some(w => !channels.has(w.channelId) || typeof w.program !== 'string' || !w.program.trim() ||
            typeof w.channel !== 'string' || !Number.isFinite(w.rating) || w.rating <= 0 || w.rating > 100)) throw Error('Invalid ranking');
      const stale = (parseDate(kstToday) - end) / 86400000 > 14;
      status.textContent = `${data.periodStart.replaceAll('-', '.')} ~ ${data.periodEnd.slice(5).replace('-', '.')} · 전국 가구${stale ? ' · 갱신 지연' : ' · 최신 확인'}`;
      list.replaceChildren();
      const labels = {kbs1:'KBS 1TV', kbs2:'KBS 2TV', mbc:'MBC', sbs:'SBS'};
      for (const [channelId, channelLabel] of Object.entries(labels)) {
        const winners = data.channelWinners.filter(w => w.channelId === channelId);
        if (winners.some(w => w.rating !== winners[0].rating)) throw Error('Invalid joint winner');
        const row = document.createElement('div'); row.className = 'weekly-winner';
        const label = document.createElement('span'); label.className = 'weekly-channel'; label.textContent = channelLabel;
        const title = document.createElement(winners.length ? 'a' : 'span'); title.className = 'weekly-program';
        const rating = document.createElement('b'); rating.className = 'weekly-value';
        if (winners.length) {
          title.textContent = winners.map(w => w.program).join(' · ') + (winners.length > 1 ? ' (공동 1위)' : '');
          const replay = replayFor(winners, channelId);
          if (replay) {
            title.href = replay.url; title.target = '_blank'; title.rel = 'noopener';
            title.setAttribute('aria-label', winners[0].program + ' · ' + channelLabel + ' 공식 1회부터 정주행');
            title.title = '공식 1회부터 보기 · 전체회차에서 다음 회차를 선택하세요';
            const hint = document.createElement('span'); hint.className = 'replay-hint';
            hint.textContent = ' 1회부터 정주행 ↗'; title.append(hint);
            if (!stale) {
              const badge = document.createElement('span'); badge.className = 'new-badge'; badge.textContent = 'NEW';
              badge.title = '최신 확인 주간 순위 · 신작 방영 표시가 아닙니다';
              title.prepend(badge);
            }
          } else {
            const hint = document.createElement('span'); hint.className = 'replay-hint';
            hint.textContent = ' · 정주행 링크 확인 중'; title.append(hint);
          }
          rating.textContent = winners[0].rating.toFixed(1) + '%';
        } else {
          title.textContent = '공개 TOP 20 미포함 · 1위 확인 불가';
          title.style.fontSize = '12px'; rating.textContent = '—';
        }
        row.append(label, title, rating); list.append(row);
        if (!stale && winners.length) {
          const card = document.querySelector('.ch[data-channel="' + channelId + '"]');
          if (card && !card.querySelector('.weekly-badge')) {
            const badge = document.createElement('span'); badge.className = 'weekly-badge';
            badge.textContent = '🏆 채널 주간 ' + (winners.length > 1 ? '공동 ' : '') + '1위';
            badge.title = winners.map(w => w.program).join(' · ') + ' · ' + winners[0].rating + '%';
            card.querySelector('.name').before(badge); card.classList.add('weekly-top');
          }
        }
      }
      document.getElementById('weeklyTitle').textContent = '🏆 방송사별 주간 시청률 1위';
    } catch (error) {
      list.replaceChildren();
      document.querySelectorAll('.weekly-badge').forEach(el => el.remove());
      document.querySelectorAll('.weekly-top').forEach(el => el.classList.remove('weekly-top'));
      status.textContent = '주간 시청률 자료를 확인할 수 없습니다. 공식 순위에서 확인해 주세요.';
    } finally { box.setAttribute('aria-busy', 'false'); }
  }
  load();
})();

(() => {
  const SPORTS_URL = 'https://seoul-tv.net/streaming?ch=live202';
  function applySportsLink() {
    const sports = document.querySelector('.sports-link, .ch[data-channel="sports"]');
    if (!sports) return;
    sports.href = SPORTS_URL;
    sports.dataset.official = SPORTS_URL;
    sports.target = '_blank';
    sports.rel = 'noopener';
    sports.setAttribute('aria-label', 'SPORTS 스포츠 페이지 열기');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applySportsLink, {once:true});
  else applySportsLink();
})();
