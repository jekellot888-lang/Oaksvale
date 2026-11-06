// Renders the data files into static HTML:
//   · index.html: the practice ledger and the people lists (between generated:* markers)
//   · practice/<slug>/index.html from src/templates/practice.html
//   · people/<slug>/index.html from src/templates/person.html
//   · contact/index.html and 404.html from src/templates/contact.html and notfound.html
// Sub-pages reuse the chrome and footer partials cut from index.html, so header, nav and footer
// have one source. Runs before `vite` and `vite build` (npm pre-scripts). Output is not hand-edited.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { practices } from '../src/data/practice.js';
import { people, partners, initials } from '../src/data/people.js';
import { contact } from '../src/data/contact.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const telHref = (t) => `tel:+256${t.replace(/\s/g, '').replace(/^0/, '')}`;
const telLinks = (phones) =>
  phones.map((t) => `<a href="${telHref(t)}" data-cursor-label="Call">${t}</a>`).join('\n              ');

function between(source, name) {
  const start = `<!-- partial:${name}:start`;
  const end = `<!-- partial:${name}:end -->`;
  const i = source.indexOf(start);
  const j = source.indexOf(end);
  if (i < 0 || j < 0) throw new Error(`index.html is missing the ${name} partial markers`);
  return source.slice(i, j + end.length);
}

function inject(source, name, html) {
  const pattern = new RegExp(`(<!-- generated:${name}:start -->)[\\s\\S]*?(\\s*<!-- generated:${name}:end -->)`);
  if (!pattern.test(source)) throw new Error(`index.html is missing the generated:${name} markers`);
  return source.replace(pattern, `$1\n${html}$2`);
}

function render(template, fill) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in fill)) throw new Error(`template placeholder {{${key}}} has no value`);
    return fill[key];
  });
}

function writePage(section, slug, html) {
  const dir = join(root, section, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

// ── Homepage: practice ledger ────────────────────────────────────
const ledger = practices
  .map((p) => {
    const id = `pa-${p.letter.toLowerCase()}`;
    const list = p.services.map((s) => `                  <li>${esc(s)}</li>`).join('\n');
    return `          <li class="ledger__item">
            <button class="ledger__row" type="button" aria-expanded="false" aria-controls="${id}" data-cursor-label="Open">
              <span class="ledger__flood" aria-hidden="true"></span>
              <span class="ledger__letter">${p.letter}</span>
              <span class="ledger__title">${esc(p.title)}</span>
              <span class="ledger__icon" aria-hidden="true"></span>
            </button>
            <div class="ledger__body" id="${id}" role="region" aria-label="${esc(p.title)}">
              <div class="ledger__inner">
                <div class="ledger__aside">
                  <p class="ledger__lede">${esc(p.short)}</p>
                  <a class="ledger__more" href="/practice/${p.slug}/">The ${esc(p.title)} practice <span aria-hidden="true">→</span></a>
                </div>
                <ul class="ledger__list">
${list}
                </ul>
              </div>
            </div>
          </li>`;
  })
  .join('\n');

// ── Homepage: people ─────────────────────────────────────────────
const practiceOf = (m) => (m.practice ? practices.find((p) => p.slug === m.practice) : null);
const focusLine = (m, cls) => {
  const p = practiceOf(m);
  if (m.practice && !p) throw new Error(`people.js: ${m.slug} names unknown practice "${m.practice}"`);
  return p ? `<p class="${cls}"><a href="/practice/${p.slug}/" data-cursor-label="Practice">${esc(p.title)}</a></p>` : '';
};
const publicPhones = (m) => (m.publishPhone ? m.phones : []);

const nameLink = (m, tag) =>
  `<${tag} class="person__name"><a href="/people/${m.slug}/" data-cursor-label="Profile">${esc(m.name)}</a></${tag}>`;

const partnerCards = partners
  .map(
    (m) => `          <li class="person person--lead" data-stagger>
            <p class="person__role">${esc(m.role)}</p>
            ${nameLink(m, 'h4')}${m.practice ? `\n            ${focusLine(m, 'person__focus')}` : ''}
            <ul class="person__quals">
${m.qualifications.map((q) => `              <li>${esc(q)}</li>`).join('\n')}
            </ul>${
              m.publishPhone
                ? `
            <p class="person__tel">
              ${telLinks(m.phones)}
            </p>`
                : ''
            }
          </li>`,
  )
  .join('\n');

const advocateCards = people
  .filter((m) => m.group === 'advocate')
  .map(
    (m) => `          <li class="person" data-stagger>
            ${nameLink(m, 'h4')}
            <p class="person__quals-inline">${m.qualifications.map(esc).join(' · ')}</p>
          </li>`,
  )
  .join('\n');

const peopleHtml = `        <h3 class="label people__group">Leadership &amp; Partnership</h3>
        <ul class="partners">
${partnerCards}
        </ul>

        <h3 class="label people__group">Advocates</h3>
        <ul class="advocates">
${advocateCards}
        </ul>`;

let index = read('index.html');
index = inject(index, 'ledger', ledger);
index = inject(index, 'people', peopleHtml);
writeFileSync(join(root, 'index.html'), index);

// ── Shared sub-page chrome ───────────────────────────────────────
// Links that were same-page anchors on the homepage point back to it from a sub-page.
const chrome = between(index, 'chrome')
  .replace(/href="#top"/g, 'href="/"')
  .replace('Oaks Shade Advocates, back to top', 'Oaks Shade Advocates, home')
  .replace(/href="#(?!main)/g, 'href="/#');
const shared = { chrome: `    ${chrome}`, footer: `    ${between(index, 'footer')}` };

// Partners as contacts, linked to their profiles; used on both sub-page types.
const partnerContacts = (exclude) =>
  partners
    .filter((m) => m.slug !== exclude)
    .map(
      (m) => `          <li class="person person--lead" data-stagger>
            <p class="person__role">${esc(m.role)}</p>
            ${nameLink(m, 'p')}${
              m.publishPhone ? `\n            <p class="person__tel">${telLinks(m.phones.slice(0, 1))}</p>` : ''
            }
          </li>`,
    )
    .join('\n');

const numberedList = (items) =>
  items
    .map(
      (s, n) => `          <li class="p-services__item" data-p-service>
            <span class="p-services__rule" aria-hidden="true"></span>
            <span class="p-services__num">${String(n + 1).padStart(2, '0')}</span>
            <span class="p-services__text">${esc(s)}</span>
          </li>`,
    )
    .join('\n');

// ── Practice pages ───────────────────────────────────────────────
const practiceTemplate = read('src/templates/practice.html');
rmSync(join(root, 'practice'), { recursive: true, force: true });

practices.forEach((p, i) => {
  const next = practices[(i + 1) % practices.length];

  const region = p.region.length
    ? `
      <section class="p-region" data-theme="night">
        <h2 class="p-region__title" data-reveal>Across Uganda <span class="region__amp">&amp;</span> Kenya</h2>
        <div class="p-region__body">
          <p>Our team includes advocates with professional capacity in both countries. For this practice that covers:</p>
          <ul class="p-region__list">
${p.region.map((r) => `            <li data-stagger>${esc(r)}</li>`).join('\n')}
          </ul>
          <a class="p-region__more" href="/#region">The regional practice</a>
        </div>
      </section>
`
    : '';

  const indexList = practices
    .map((q) => {
      const current = q.slug === p.slug ? ' aria-current="page"' : '';
      return `          <li><a href="/practice/${q.slug}/"${current}><span>${q.letter}</span>${esc(q.title)}</a></li>`;
    })
    .join('\n');

  writePage(
    'practice',
    p.slug,
    render(practiceTemplate, {
      ...shared,
      title: esc(p.title),
      description: esc(`${p.intro} Oaks Shade Advocates, Kampala.`),
      letter: p.letter,
      lastLetter: practices.at(-1).letter,
      intro: esc(p.intro),
      services: numberedList(p.services),
      region,
      partners: partnerContacts(),
      slug: p.slug,
      nextSlug: next.slug,
      nextLetter: next.letter,
      nextTitle: esc(next.title),
      index: indexList,
    }),
  );
});

// ── People pages ─────────────────────────────────────────────────
const personTemplate = read('src/templates/person.html');
rmSync(join(root, 'people'), { recursive: true, force: true });

people.forEach((m, i) => {
  const next = people[(i + 1) % people.length];
  const groupLabel = m.group === 'partner' ? 'Leadership &amp; Partnership' : 'Advocates';

  const bio = m.bio
    ? `
      <section class="p-bio">
        <h2 class="label">Profile</h2>
        <div class="p-bio__text">${m.bio
          .split(/\n{2,}/)
          .map((para) => `<p>${esc(para)}</p>`)
          .join('\n')}</div>
      </section>
`
    : '';

  // Partners are reached directly; advocates through the Firm until numbers are cleared.
  const contact = m.publishPhone
    ? `<p class="section-note">Call ${esc(m.name)} directly, or write to the Firm.</p>
          <p class="person__tel p-contact__tel">
            ${telLinks(m.phones)}
          </p>`
    : `<p class="section-note">Instructions for ${esc(m.name)} come through the Firm. Write to us, or call one of the partners.</p>`;

  // A supplied portrait fills the arch; otherwise the initials stand in.
  const webp = m.portrait ? m.portrait.replace(/\.jpe?g$/i, '.webp') : '';
  const arch = m.portrait
    ? `<picture>
              <source srcset="${webp}" type="image/webp" />
              <img class="p-hero__portrait" src="${m.portrait}" width="720" height="960" alt="Portrait of ${esc(m.name)}" data-p-portrait />
            </picture>`
    : `<span class="p-hero__letter" data-p-letter>${initials(m.name)}</span>`;

  const indexList = people
    .map((q) => {
      const current = q.slug === m.slug ? ' aria-current="page"' : '';
      return `          <li><a href="/people/${q.slug}/"${current}><span>${initials(q.name)}</span>${esc(q.name)}</a></li>`;
    })
    .join('\n');

  writePage(
    'people',
    m.slug,
    render(personTemplate, {
      ...shared,
      name: esc(m.name),
      role: esc(m.role),
      group: groupLabel,
      arch,
      archClass: m.portrait ? ' p-hero__arch--portrait' : '',
      archHidden: m.portrait ? '' : ' aria-hidden="true"',
      focus: m.practice ? `\n            ${focusLine(m, 'p-hero__focus')}` : '',
      description: esc(`${m.name}, ${m.role}${practiceOf(m) ? `, ${practiceOf(m).title}` : ''} at Oaks Shade Advocates, Kampala. ${m.qualifications.join('; ')}.`),
      qualifications: numberedList(m.qualifications),
      bio,
      contact,
      slug: m.slug,
      partners: partnerContacts(m.slug),
      nextSlug: next.slug,
      nextInitials: initials(next.name),
      nextName: esc(next.name),
      index: indexList,
    }),
  );
});

// ── Contact page ─────────────────────────────────────────────────
// Option values are slugs so practice and profile pages can prefill them (?about= / ?for=).
const contactTemplate = read('src/templates/contact.html');
rmSync(join(root, 'contact'), { recursive: true, force: true });
mkdirSync(join(root, 'contact'), { recursive: true });
writeFileSync(
  join(root, 'contact', 'index.html'),
  render(contactTemplate, {
    ...shared,
    email: contact.email,
    address: contact.address.map(esc).join('<br />'),
    post: contact.post.map(esc).join('<br />'),
    partnerPhones: partners
      .filter((m) => m.publishPhone)
      .map(
        (m) =>
          `                  <li><span>${esc(m.name)}</span> <a href="${telHref(m.phones[0])}" data-cursor-label="Call">${m.phones[0]}</a></li>`,
      )
      .join('\n'),
    matterOptions: practices
      .map((p) => `                  <option value="${p.slug}">${esc(p.title)}</option>`)
      .join('\n'),
    personOptions: people
      .map((m) => `                  <option value="${m.slug}">${esc(m.name)}, ${esc(m.role)}</option>`)
      .join('\n'),
  }),
);

// ── 404 ──────────────────────────────────────────────────────────
// Vercel serves dist/404.html for any path that has no file.
writeFileSync(
  join(root, '404.html'),
  render(read('src/templates/notfound.html'), {
    ...shared,
    index: practices
      .map((q) => `          <li><a href="/practice/${q.slug}/"><span>${q.letter}</span>${esc(q.title)}</a></li>`)
      .join('\n'),
  }),
);

console.log(
  `build-pages: homepage lists + ${practices.length} practice pages + ${people.length} people pages + contact + 404`,
);
