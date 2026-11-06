// Single source for the Firm's people. Every field is from the firm profile, section 7
// (source/Oaks_Shade_Advocates_Firm_Profile.pdf). Names are written as the profile writes them.
//
// publishPhone: false keeps a person's number off every page (homepage, profiles, contact page,
//   partner contact lists) until the client confirms it may be published (AGENTS.md open questions).
// bio: empty until the client supplies one. Pages render the section only when it has text.
// portrait: path under public/ (a .jpg with a .webp twin). Supplied by the Firm 2026-11-05;
//   profiles without one show initials in the arch.
// practice: slug of the practice a person leads, from src/data/practice.js (optional).
//
// 2026-11-05: Okoth Arnold Charles moved from Advocate to Partner, Corporate and Commercial Law,
//   on the Firm's instruction (the profile PDF still lists him as an advocate). His number stays
//   unpublished until the Firm clears it.

export const people = [
  {
    slug: 'bowen-joshua',
    name: 'Bowen Joshua',
    role: 'Managing Partner',
    group: 'partner',
    qualifications: [
      'LLB (Hons), KIU',
      'Diploma in Legal Practice, LDC',
      'LLM, Makerere University (candidate)',
    ],
    phones: ['0776 487197', '0752 065169'],
    publishPhone: true,
    bio: '',
  },
  {
    slug: 'okoth-karol-ronald',
    name: 'Okoth Karol Ronald',
    role: 'Partner',
    group: 'partner',
    qualifications: ['LLB (Hons), KIU', 'Diploma in Legal Practice, LDC', 'DPAM, UMI'],
    phones: ['0777 136621', '0784 809645'],
    publishPhone: true,
    bio: '',
  },
  {
    slug: 'odongo-peter-ronaldo',
    name: 'Odongo Peter Ronaldo',
    role: 'Partner',
    group: 'partner',
    qualifications: [
      'LLB, Uganda Christian University',
      'Diploma in Legal Practice, LDC',
      'PGDPAM, UMI',
      'MMS, UMI (candidate)',
    ],
    phones: ['0777 406018'],
    publishPhone: true,
    portrait: '/assets/people/odongo-peter-ronaldo.jpg',
    bio: '',
  },
  {
    slug: 'okoth-arnold-charles',
    name: 'Okoth Arnold Charles',
    role: 'Partner',
    group: 'partner',
    practice: 'corporate-commercial',
    qualifications: ['LLB (Hons), Makerere University', 'Postgraduate Diploma (ongoing)'],
    phones: [], // held back until the Firm clears publication; kept in the local copy
    publishPhone: false,
    portrait: '/assets/people/okoth-arnold-charles.jpg',
    bio: '',
  },
  {
    slug: 'nsamba-javira-lubadde',
    name: 'Nsamba Javira Lubadde',
    role: 'Advocate',
    group: 'advocate',
    qualifications: ['LLB, Uganda Christian University', 'Postgraduate Diploma in Legal Practice, LDC'],
    phones: [], // held back until the Firm clears publication; kept in the local copy
    publishPhone: false,
    bio: '',
  },
  {
    slug: 'aliolu-joseline',
    name: 'Aliolu Joseline',
    role: 'Advocate',
    group: 'advocate',
    qualifications: ['LLB (Hons), Uganda Christian University', 'Diploma in Legal Practice, LDC'],
    phones: [], // held back until the Firm clears publication; kept in the local copy
    publishPhone: false,
    bio: '',
  },
  {
    slug: 'nambooze-sheila',
    name: 'Nambooze Sheila',
    role: 'Advocate',
    group: 'advocate',
    qualifications: ['LLB (Hons), KIU', 'Legal Practice, LDC'],
    phones: [], // held back until the Firm clears publication; kept in the local copy
    publishPhone: false,
    bio: '',
  },
  {
    slug: 'lukyamuzi-patrick',
    name: 'Lukyamuzi Patrick',
    role: 'Advocate',
    group: 'advocate',
    qualifications: ['LLB (Hons), KIU', 'Diploma in Legal Practice, LDC'],
    phones: [], // held back until the Firm clears publication; kept in the local copy
    publishPhone: false,
    bio: '',
  },
];

export const partners = people.filter((p) => p.group === 'partner');

export const initials = (name) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
