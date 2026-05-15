"""
fix_i18n.py — Wire all hardcoded text into the i18n system.

- Adds data-i18n / data-i18n-html attributes to un-wired elements in every HTML page.
- Accumulates new EN + DE keys and injects them into assets/i18n.js.
- DE is initialised to the same value as EN (placeholder). Translators fill the DE
  column in the regenerated Excel and the keys can be updated from there.
- Run: python3 fix_i18n.py
"""

from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag
import glob, re, json

BASE = Path(__file__).parent

# ── translation accumulator ──────────────────────────────────────────────────
KEYS = {}   # {key: {'en': str, 'de': str}}

def reg(key, en, de=None):
    if key not in KEYS:
        KEYS[key] = {'en': en, 'de': de if de is not None else en}

def is_plain(el):
    return all(isinstance(c, NavigableString) for c in el.children)

def inner_html(el):
    return ''.join(str(c) for c in el.children).strip()

def inner_text(el):
    return el.get_text(strip=True)

def wire(el, key, en=None, de=None):
    """Attach data-i18n / data-i18n-html to element; skip if already wired."""
    if el.get('data-i18n') or el.get('data-i18n-html') or el.get('data-i18n-placeholder'):
        return
    plain = is_plain(el)
    if en is None:
        en = inner_text(el) if plain else inner_html(el)
    if not en.strip():
        return
    if de is None:
        de = en
    el['data-i18n' if plain else 'data-i18n-html'] = key
    reg(key, en, de)

def reuse(el, key):
    """Point an element at an EXISTING i18n key (no new entry needed)."""
    if el.get('data-i18n') or el.get('data-i18n-html'):
        return
    el['data-i18n'] = key

# ── page-type maps ────────────────────────────────────────────────────────────
SERVICE_MAP = {
    'service-data-platform-architecture': 1,
    'service-cloud-data-engineering':      2,
    'service-modern-data-stack':           3,
    'service-analytics-bi':               4,
    'service-ai-ml':                      5,
    'service-ai-agents':                  6,
    'service-process-automation':         7,
    'service-data-governance':            8,
    'service-dataops-devops':             9,
    'service-streaming-iot':             10,
    'service-it-strategy':               11,
    'service-enterprise-performance':    12,
}

HREF_TO_SVC = {
    'service-data-platform-architecture.html': 1,
    'service-cloud-data-engineering.html':      2,
    'service-modern-data-stack.html':           3,
    'service-analytics-bi.html':               4,
    'service-ai-ml.html':                      5,
    'service-ai-agents.html':                  6,
    'service-process-automation.html':         7,
    'service-data-governance.html':            8,
    'service-dataops-devops.html':             9,
    'service-streaming-iot.html':             10,
    'service-it-strategy.html':               11,
    'service-enterprise-performance.html':    12,
}

INDUSTRY_MAP = {
    'industry-manufacturing':   1,
    'industry-financial':       2,
    'industry-energy':          3,
    'industry-pharma':          4,
    'industry-retail':          5,
    'industry-aerospace':       6,
    'industry-medtech':         7,
    'industry-public-transport':8,
}

HREF_TO_IND = {f'industry-{s}.html': n for s, n in [
    ('manufacturing',1),('financial',2),('energy',3),('pharma',4),
    ('retail',5),('aerospace',6),('medtech',7),('public-transport',8),
]}

POST_MAP = {
    'post-lakehouse-vs-warehouse': 'lakehouse',
    'post-rag-evaluation':         'rag',
    'post-fabric-vs-databricks':   'fabric',
    'post-sap-modernization':      'sap',
    'post-kpi-tree':               'kpi',
    'post-data-team-org':          'datateam',
    'post-mdm-pharma':             'mdm',
    'post-streaming-iot-cost':     'streaming',
}

# ── shared: footer ────────────────────────────────────────────────────────────
FOOTER_HREF_KEYS = {
    'how-we-work.html':             ('footer.how-we-work', 'How We Work',        'Wie wir arbeiten'),
    'technology.html':              ('footer.tech-stack',  'Technology Stack',   'Technologie-Stack'),
    'industry-manufacturing.html':  ('footer.ind.mfg',     'Manufacturing',      'Fertigung'),
    'industry-financial.html':      ('footer.ind.fin',     'Financial',          'Finanzdienstleistungen'),
    'industry-energy.html':         ('footer.ind.energy',  'Energy',             'Energie'),
    'industry-pharma.html':         ('footer.ind.pharma',  'Pharma',             'Pharma'),
    'industry-medtech.html':        ('footer.ind.medtech', 'MedTech',            'Medizintechnik'),
    'industry-retail.html':         ('footer.ind.retail',  'Retail',             'Handel'),
    'industry-aerospace.html':      ('footer.ind.aero',    'Aerospace',          'Luft- & Raumfahrt'),
    'industry-public-transport.html':('footer.ind.transport','Public Transport', 'Öffentlicher Verkehr'),
}

def process_footer(soup):
    footer = soup.find('footer')
    if not footer:
        return
    for a in footer.find_all('a', href=True):
        href = a['href']
        if href in FOOTER_HREF_KEYS and not a.get('data-i18n'):
            key, en, de = FOOTER_HREF_KEYS[href]
            a['data-i18n'] = key
            reg(key, en, de)

# ── shared: header breadcrumb ─────────────────────────────────────────────────
def process_breadcrumb_links(soup):
    """Wire standard breadcrumb anchor links that have no data-i18n yet."""
    for a in soup.select('.breadcrumb a'):
        href = a.get('href','')
        if not a.get('data-i18n'):
            if 'index.html' in href:
                reuse(a, 'common.home')
            elif 'insights.html' in href:
                reuse(a, 'nav.insights')
            elif 'services.html' in href:
                reuse(a, 'nav.services')
            elif 'industries.html' in href:
                reuse(a, 'nav.industries')

# ── service detail pages ─────────────────────────────────────────────────────
H2_TO_KEY = {
    'overview':              'detail.overview',
    'how it works':          'detail.howitworks',
    'case studies':          'detail.casestudies',
    'related capabilities':  'detail.relatedservices',
}
H3_TO_KEY = {
    'deliverables':           'detail.deliverables',
    'tools & technologies':   'detail.tools',
    'tools':                  'detail.tools',
    'engagement model':       'detail.engagement',
}

def process_service(soup, n):
    s = f'svc.{n}'

    # Breadcrumb last span → reuse svc.N.title
    spans = soup.select('.breadcrumb span')
    if spans:
        reuse(spans[-1], f'{s}.title')

    # Hero eyebrow + lead
    hero = soup.find('section', class_='page-hero')
    if hero:
        ey = hero.find('div', class_='eyebrow')
        if ey: wire(ey, f'{s}.cap-eyebrow')
        lp = hero.find('p', class_='lead')
        if lp: wire(lp, f'{s}.hero-lead')

    # Section h2 → existing keys
    for h2 in soup.find_all('h2'):
        t = inner_text(h2).lower()
        for match, key in H2_TO_KEY.items():
            if match in t:
                reuse(h2, key)
                break

    # Overview prose paragraph + intro-quote
    prose = soup.find('div', class_='prose')
    if prose:
        for i, p in enumerate(prose.find_all('p'), 1):
            wire(p, f'{s}.overview.p{i}')
    iq = soup.find('div', class_='intro-quote')
    if iq: wire(iq, f'{s}.intro-quote')

    # How-list steps
    for i, li in enumerate(soup.select('.how-list li'), 1):
        t_span = li.find('span', class_='how-title')
        body   = li.find('p')
        if t_span: wire(t_span, f'{s}.how.{i}.title')
        if body:   wire(body,   f'{s}.how.{i}.body')

    # Case cards
    for i, card in enumerate(soup.select('.case-card'), 1):
        for cls, suffix in [('case-meta','meta'),('case-title','title'),
                             ('case-desc','desc'), ('case-tools','tools')]:
            el = card.find(class_=cls)
            # case-desc is a <p class="case-desc">
            if el is None and suffix == 'desc':
                el = card.find('p', class_='case-desc')
            if el: wire(el, f'{s}.case.{i}.{suffix}')

    # Sidebox h3 → existing keys
    for h3 in soup.find_all('h3'):
        t = inner_text(h3).lower()
        for match, key in H3_TO_KEY.items():
            if match in t:
                reuse(h3, key)
                break

    # Deliverables list
    for sb in soup.select('.sidebox'):
        h3 = sb.find('h3')
        if not h3: continue
        h3t = inner_text(h3).lower()
        if 'deliver' in h3t:
            for i, li in enumerate(sb.find_all('li'), 1):
                wire(li, f'{s}.deliver.{i}')
        elif 'tools' in h3t:
            # div with tools text (no list)
            for child in sb.children:
                if isinstance(child, Tag) and child.name == 'div':
                    t = inner_text(child)
                    if t and '·' in t:
                        wire(child, f'{s}.tools-text')
        elif 'engagement' in h3t:
            p = sb.find('p')
            if p: wire(p, f'{s}.engage-body')
            btn = sb.find('a', class_='btn')
            if btn:
                sp = btn.find('span')
                if sp: wire(sp, f'{s}.engage-cta')

    # Related-service cards
    for card in soup.select('.related-card'):
        rc_title = card.find(class_='rc-title')
        rc_arr   = card.find(class_='rc-arr')
        if rc_title and not rc_title.get('data-i18n'):
            m = HREF_TO_SVC.get(card.get('href',''))
            if m:
                reuse(rc_title, f'svc.{m}.title')
            else:
                wire(rc_title, f'{s}.related.title')
        if rc_arr: reuse(rc_arr, 'common.read')

# ── industry detail pages ─────────────────────────────────────────────────────
def process_industry(soup, n):
    p = f'ind.{n}'

    # Breadcrumb last span → reuse ind.N.name
    spans = soup.select('.breadcrumb span')
    if spans: reuse(spans[-1], f'ind.{n}.name')

    # Hero section
    hero = soup.find('section', class_='page-hero')
    if hero:
        ey = hero.find('div', class_='eyebrow')
        if ey: wire(ey, f'{p}.hero-eyebrow')
        h1 = hero.find('h1')
        if h1: wire(h1, f'{p}.h1')
        lp = hero.find('p', class_='lead')
        if lp: wire(lp, f'{p}.hero-lead')
        for i, meta in enumerate(soup.select('.ind-hero-meta > div'), 1):
            k_el = meta.find(class_='k')
            v_el = meta.find(class_='v')
            if k_el: wire(k_el, f'{p}.meta.{i}.k')
            if v_el: wire(v_el, f'{p}.meta.{i}.v')

    # ind-block items
    for block in soup.select('.ind-block'):
        h3 = block.find('h3')
        block_type = ''
        if h3 and h3.get('data-i18n'):
            key = h3['data-i18n']
            block_type = key.replace('ind.h.', '')  # 'problems' → 'problem', etc.
            # normalise
            block_type = {'problems':'problem','solutions':'solution','kpis':'kpi'}.get(block_type, block_type)
        for i, li in enumerate(block.find_all('li'), 1):
            if not li.get('data-i18n'):
                wire(li, f'{p}.{block_type}.{i}' if block_type else f'{p}.block.li.{i}')

    # Section eyebrows → reuse existing industriesidx keys
    EYEBROW_REUSE = {
        'anonymized': 'industriesidx.section.eyebrow',
        'common challenges': 'industriesidx.challenges.eyebrow',
        'case studies': 'industriesidx.cases.eyebrow',
    }
    for ey in soup.find_all('div', class_='eyebrow'):
        t = inner_text(ey).lower()
        for match, key in EYEBROW_REUSE.items():
            if match in t and not ey.get('data-i18n'):
                reuse(ey, key)
                break

    # Selected clients section: h2 + lead
    for h2 in soup.find_all('h2'):
        t = inner_text(h2).lower()
        if 'selected clients' in t:
            reuse(h2, 'industriesidx.section.title')
    for lp in soup.find_all('p', class_='lead'):
        if 'confidential' in inner_text(lp).lower():
            reuse(lp, 'industriesidx.section.lead')

    # Client logos
    for i, logo in enumerate(soup.select('.client-logos .logo'), 1):
        lg    = logo.find(class_='lg')
        lg_sub = logo.find(class_='lg-sub')
        if lg:    wire(lg,    f'{p}.logo.{i}.name')
        if lg_sub: wire(lg_sub, f'{p}.logo.{i}.sub')

    # Challenges section
    for section in soup.find_all('section'):
        cl = section.find('ul', class_='challenges-list')
        if not cl: continue
        sh2 = section.find('h2')
        if sh2: wire(sh2, f'{p}.challenges.h2')
        slp = section.find('p', class_='lead')
        if slp and 'confidential' not in inner_text(slp).lower():
            wire(slp, f'{p}.challenges.lead')
        for i, li in enumerate(cl.find_all('li'), 1):
            sp = li.find('span')
            if sp: wire(sp, f'{p}.challenge.{i}')

    # Cases section
    for section in soup.find_all('section'):
        if not section.find('div', class_='case-block'): continue
        sh2 = section.find('h2')
        if sh2 and not sh2.get('data-i18n'):
            wire(sh2, f'{p}.cases.h2')
        slp = section.find('p', class_='lead')
        if slp and not slp.get('data-i18n') and 'confidential' not in inner_text(slp).lower():
            wire(slp, f'{p}.cases.lead')
        for i, cb in enumerate(section.select('.case-block'), 1):
            for cls, suf in [('case-meta','meta'),('case-title','title'),
                              ('case-body','body'),('case-outcome','outcome'),
                              ('case-tools','tools')]:
                el = cb.find(class_=cls)
                if el: wire(el, f'{p}.case.{i}.{suf}')

# ── blog post pages ───────────────────────────────────────────────────────────
def process_post(soup, slug):
    p = f'post.{slug}'

    # Breadcrumb links
    process_breadcrumb_links(soup)
    # Breadcrumb last span (category)
    spans = soup.select('.breadcrumb span')
    if spans: wire(spans[-1], f'{p}.bc-cat')

    # Post eyebrow
    for ey in soup.find_all('div', class_='eyebrow'):
        # the first one above h1 is the post eyebrow
        sibling = ey.find_next_sibling('h1')
        if sibling or ey.find_next('h1'):
            if not ey.get('data-i18n'):
                wire(ey, f'{p}.eyebrow')
                break

    # Post meta bar items
    for i, item in enumerate(soup.select('.pmb-item'), 1):
        spans = item.find_all('span')
        if len(spans) == 2:
            label, val = spans
            # label like "By", "—" - wire the value
            if not val.get('data-i18n') and inner_text(val).strip():
                wire(val, f'{p}.meta.{i}.val')

    # Post content: paragraphs and h2s — search ALL post-content divs
    # (posts have multiple: title block, article body, "continue reading")
    h2_count = 0
    p_count  = 0
    for post_content in soup.find_all('div', class_='post-content'):
        for el in post_content.children:
            if not isinstance(el, Tag): continue
            if el.name == 'h2' and not el.get('data-i18n'):
                # skip the "Related field notes." h2 — handled separately below
                if 'related' not in inner_text(el).lower():
                    h2_count += 1
                    wire(el, f'{p}.h2.{h2_count}')
            elif el.name == 'p' and not el.get('data-i18n') and not el.get('data-i18n-html'):
                p_count += 1
                wire(el, f'{p}.p.{p_count}')

    # Author card
    ac = soup.find('div', class_='author-card')
    if ac:
        name = ac.find(class_='ac-name')
        bio  = ac.find(class_='ac-bio')
        if name: wire(name, f'{p}.author-name')
        if bio:  wire(bio,  f'{p}.author-bio')

    # "Continue reading" section
    for ey in soup.find_all('div', class_='eyebrow'):
        if 'continue' in inner_text(ey).lower() and not ey.get('data-i18n'):
            wire(ey, 'post.continue-reading')
            reg('post.continue-reading', '— Continue reading', '— Weiterlesen')
    for h2 in soup.find_all('h2'):
        if 'related' in inner_text(h2).lower() and not h2.get('data-i18n'):
            wire(h2, 'post.related-heading')
            reg('post.related-heading', 'Related field notes.', 'Verwandte Feldnotizen.')

    # Related posts
    for i, rp in enumerate(soup.select('.related-post'), 1):
        cat  = rp.find(class_='rp-cat')
        h3   = rp.find('h3')
        meta = rp.find(class_='rp-meta')
        if cat:  wire(cat,  f'{p}.related.{i}.cat')
        if h3:   wire(h3,   f'{p}.related.{i}.title')
        if meta: wire(meta, f'{p}.related.{i}.meta')

# ── services.html ────────────────────────────────────────────────────────────
def process_services_page(soup):
    # Hero eyebrow, h1, lead
    hero = soup.find('section', class_='page-hero')
    if hero:
        ey = hero.find('div', class_='eyebrow')
        if ey: wire(ey, 'services.hero-eyebrow')
        h1 = hero.find('h1')
        if h1: wire(h1, 'services.h1')
        lp = hero.find('p', class_='lead')
        if lp: wire(lp, 'services.hero-lead')
    # Service family cards → reuse svcfam.N.t / svcfam.N.d
    for i, card in enumerate(soup.select('.svc-grid > .svc-card'), 1):
        title = card.find('h3', class_='svc-card__title')
        desc  = card.find('p',  class_='svc-card__desc')
        if title and not title.get('data-i18n'): reuse(title, f'svcfam.{i}.t')
        if desc  and not desc.get('data-i18n'):
            # desc has a nested <span> with "Includes capabilities…" — wire via html
            wire(desc, f'svcfam.{i}.d-full')
    # Section h2 + lead
    for h2 in soup.find_all('h2'):
        if not h2.get('data-i18n'):
            wire(h2, 'services.cap-section-h2')
            break
    for lp in soup.select('.section--alt p.lead'):
        if not lp.get('data-i18n'):
            wire(lp, 'services.cap-section-lead')
            break
    # "Read more →" spans in capability cards
    for span in soup.select('.svc-card__cta'):
        if not span.get('data-i18n') and 'read more' in inner_text(span).lower():
            reuse(span, 'common.read')

# ── solutions.html ────────────────────────────────────────────────────────────
def process_solutions_page(soup):
    # Timeline <li> items → sol.N.t.M  (keys already exist in i18n)
    for section in soup.select('section.sol'):
        sol_id = section.get('id', '')
        # Map section id to solution number
        SOL_ID = {
            'kpi-cockpit': 1, 'platform-assessment': 2, 'powerbi-modernization': 3,
            'ai-readiness': 4, 'healthcare-dashboard': 5, 'data-integration': 6,
        }
        n = SOL_ID.get(sol_id)
        if not n:
            continue
        # Timeline list (h3 = sol.h.timeline, already wired)
        for tl_div in section.select('div'):
            h3 = tl_div.find('h3')
            if h3 and h3.get('data-i18n') == 'sol.h.timeline':
                for j, li in enumerate(tl_div.find_all('li'), 1):
                    if not li.get('data-i18n'):
                        reuse(li, f'sol.{n}.t.{j}')
        # Tech stack paragraph (p.stack)
        for p_el in section.select('p.stack'):
            if not p_el.get('data-i18n'):
                wire(p_el, f'sol.{n}.stack')

# ── main loop ─────────────────────────────────────────────────────────────────
html_files = sorted(glob.glob(str(BASE / '*.html')))

for html_path in html_files:
    path = Path(html_path)
    stem = path.stem
    source = path.read_text(encoding='utf-8')

    soup = BeautifulSoup(source, 'html.parser')

    # Footer (shared)
    process_footer(soup)

    # Page-type dispatch
    if stem in SERVICE_MAP:
        process_service(soup, SERVICE_MAP[stem])
    elif stem in INDUSTRY_MAP:
        process_industry(soup, INDUSTRY_MAP[stem])
    elif stem in POST_MAP:
        process_post(soup, POST_MAP[stem])
    elif stem == 'services':
        process_services_page(soup)
    elif stem == 'solutions':
        process_solutions_page(soup)
    else:
        # For remaining pages, just wire the footer links (already done above)
        # and any breadcrumb links
        process_breadcrumb_links(soup)

    # Serialize — html.parser preserves the original structure
    output = str(soup)
    # Restore doctype if html.parser ate it
    if source.startswith('<!doctype') and not output.startswith('<!doctype'):
        output = '<!doctype html>\n' + output

    path.write_text(output, encoding='utf-8')
    changed = source != output
    print(f"{'CHANGED' if changed else 'same   '} {stem}")

print(f"\nNew keys generated: {len(KEYS)}")

# ── inject new keys into i18n.js ──────────────────────────────────────────────
i18n_path = BASE / 'assets' / 'i18n.js'
i18n_text = i18n_path.read_text(encoding='utf-8')

def build_block(keys_dict, lang):
    lines = []
    for key, vals in sorted(keys_dict.items()):
        val = vals[lang].replace('\\', '\\\\').replace('"', '\\"')
        lines.append(f'    "{key}": "{val}",')
    return '\n'.join(lines)

en_block = build_block(KEYS, 'en')
de_block = build_block(KEYS, 'de')

# Insert before closing brace of each language block
# Pattern: find the last key in en: { ... } and append after it
def inject_lang(text, lang, new_lines):
    # Find the closing of the lang block: look for `  },` or `  }` after the lang block
    pattern = rf'({lang}:\s*\{{.*?)(  \}})'
    m = re.search(pattern, text, re.DOTALL)
    if not m:
        print(f"WARNING: could not find {lang} block in i18n.js")
        return text
    block_content = m.group(1)
    closing = m.group(2)
    # Remove trailing comma/whitespace from block_content
    new_text = text[:m.start()] + block_content.rstrip() + '\n\n    // ── auto-generated keys ──\n' + new_lines + '\n' + closing + text[m.end():]
    return new_text

i18n_text = inject_lang(i18n_text, 'en', en_block)
i18n_text = inject_lang(i18n_text, 'de', de_block)

i18n_path.write_text(i18n_text, encoding='utf-8')
print(f"Injected {len(KEYS)} new keys into assets/i18n.js")
