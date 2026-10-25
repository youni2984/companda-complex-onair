"""Fetch Nielsen's published national terrestrial household weekly winners."""
import json
import re
from datetime import date, datetime, timedelta
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

SOURCE = 'https://www.nielsenkorea.co.kr/tv_terrestrial_day.asp?sub_menu=1_2&area=00'
OUTPUT = Path(__file__).resolve().parents[1] / 'data/weekly-ratings.json'
CHANNELS = {'KBS1': 'kbs1', 'KBS2': 'kbs2', 'MBC': 'mbc', 'SBS': 'sbs', 'EBS1': 'ebs1', 'EBS2': 'ebs2', 'EBS': 'ebs1'}


class Rows(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows, self.row, self.cell = [], None, None

    def handle_starttag(self, tag, attrs):
        if tag == 'tr':
            self.row = []
        elif tag == 'td':
            self.cell = []

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag):
        if tag == 'td' and self.cell is not None:
            if self.row is not None:
                self.row.append(' '.join(''.join(self.cell).split()))
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            self.rows.append(self.row)
            self.row = None


def parse(html, today=None):
    today = today or datetime.now(ZoneInfo('Asia/Seoul')).date()
    html = re.sub(r'<!--.*?-->', '', html, flags=re.S)
    if '지상파 주간' not in html or not re.search(r'class="tab_on"[^>]*>.*?>전국</a>', html, re.S):
        raise ValueError('Expected national terrestrial weekly page')
    period = re.search(r'class="t_year"[^>]*>\s*(\d{4}\.\d{2}\.\d{2})\s*~\s*(\d{4}\.\d{2}\.\d{2})', html)
    if not period:
        raise ValueError('Missing weekly reporting period')
    start, end = (date.fromisoformat(s.replace('.', '-')) for s in period.groups())
    if end - start != timedelta(days=6) or start.weekday() != 0 or end >= today:
        raise ValueError('Reporting week must be a completed Monday–Sunday period')
    table = re.search(r'<table\b[^>]*class="ranking_tb"[^>]*>(.*?)</table>', html, re.S)
    if not table or '가구시청률 TOP 20' not in table[1] or '13개지역' not in table[1]:
        raise ValueError('Missing national household ratings table')
    parser = Rows()
    parser.feed(table[1])
    rows = [r for r in parser.rows if len(r) == 4 and r[0].isdigit()]
    if len(rows) < 20 or rows[0][0] != '1':
        raise ValueError('Incomplete rankings')
    previous = 101.0
    previous_rank = 0
    winners = []
    per_channel = {}
    for rank, channel, program, value in rows:
        rating = float(value)
        rank = int(rank)
        if not 0 < rating <= 100 or rating > previous or rank < previous_rank or not program:
            raise ValueError('Invalid rating order or value')
        previous, previous_rank = rating, rank
        channel_id = CHANNELS.get(channel.replace(' ', ''))
        if channel_id:
            item = {'channel': channel, 'channelId': channel_id, 'program': program, 'rating': rating}
            best = per_channel.setdefault(channel_id, [])
            if not best or rating == best[0]['rating']:
                best.append(item)
        if rank == 1:
            channel_id = CHANNELS.get(channel.replace(' ', ''))
            if not channel_id:
                raise ValueError('Unrecognized winner channel')
            winners.append({'channel': channel, 'channelId': channel_id, 'program': program, 'rating': rating})
    if any(w['rating'] != winners[0]['rating'] for w in winners):
        raise ValueError('Inconsistent joint first place')
    return {'periodStart': str(start), 'periodEnd': str(end), 'scope': '전국 지상파 · 가구 시청률',
            'sourceName': '닐슨코리아', 'sourceUrl': SOURCE, 'winners': winners,
            'channelWinners': [item for group in per_channel.values() for item in group]}


def main():
    request = Request(SOURCE, headers={'User-Agent': 'Companda-OnAir/1.0', 'Cache-Control': 'no-cache'})
    with urlopen(request, timeout=30) as response:
        html = response.read().decode('utf-8-sig')
    data = parse(html)
    if OUTPUT.exists():
        old = json.loads(OUTPUT.read_text(encoding='utf-8'))
        if old['periodEnd'] > data['periodEnd']:
            raise ValueError('Refusing an older reporting period')
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Published weekly winners updated:', data['periodStart'], data['periodEnd'])


if __name__ == '__main__':
    main()
