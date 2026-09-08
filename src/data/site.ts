/**
 * Every business fact rendered by this concept lives here, so the contents of
 * the page can be checked against docs/VERIFIED-FACTS.md in one place.
 *
 * Nothing in this file may be invented. No prices, packages, warranties,
 * durations, product specifications, certifications, history or testimonials.
 */

export const PHONE_DISPLAY = '+91 76248 33840';
export const PHONE_E164 = '+917624833840';
export const EMAIL = 'morpheddetailing@gmail.com';

/** Prefilled WhatsApp enquiry — the primary conversion route. */
export const WHATSAPP =
  'https://wa.me/917624833840?text=Hi%20Morphed%20Detailing%20Studio%2C%20I%27d%20like%20to%20discuss%20protecting%20my%20vehicle.';

export const INSTAGRAM = 'https://www.instagram.com/morphedetailingstudio/';
export const FACEBOOK = 'https://www.facebook.com/MorphedDetailingStudio/';
export const YOUTUBE = 'https://www.youtube.com/@morpheddetailingstudio';
export const DETAILERS_IN =
  'https://www.detailers.in/listing/morphed-detailing-studio/';

export const ADDRESS_LINES = [
  '31 Ground Floor',
  'Pipeline Road',
  'KHBS Layout',
  'Bengaluru, Karnataka 560086',
  'India',
];

/** Built from the verified public name + address. No invented coordinates. */
export const DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `Morphed Detailing Studio, 31 Ground Floor, Pipeline Road, KHBS Layout, Bengaluru, Karnataka 560086`
)}`;

/**
 * The studio's own public self-description, as published on its Instagram
 * profile.
 *
 * This is the business's claim about itself, and the page presents it that way:
 * visibly attributed, linked to the profile it came from, and never dressed up
 * as an independent review, a rating, or a verified figure. The previous
 * third-party rating was removed on 2026-09-08 — see docs/VERIFIED-FACTS.md.
 */
export const SELF_CLAIMS = {
  handle: '@morphedetailingstudio',
  href: INSTAGRAM,
  items: [
    { n: '01', text: 'Certified car detailer' },
    { n: '02', text: 'PPF, ceramic coating, detailing, sunfilms' },
    { n: '03', text: '1000+ customers trusted us with PPF' },
  ],
  attribution:
    "Published by the studio on its own Instagram profile. This is how Morphed describes itself \u2014 not an independent review, rating or verified figure.",
};

export type Service = {
  n: string;
  title: string;
  short: string;
  body: string;
  image: string;
  /** Short technical descriptor of the rendered surface study. */
  surface: string;
};

export const SERVICES: Service[] = [
  {
    n: '01',
    title: 'Paint Protection Film',
    short: 'PPF',
    body: 'Transparent paint-protection options for cars and motorcycles. Contact the studio to discuss the vehicle and available film options.',
    image: 'svc-ppf',
    surface: 'CLEARCOAT / CREASE',
  },
  {
    n: '02',
    title: 'Ceramic Coating',
    short: 'Coating',
    body: 'Coating services for customers looking to preserve and maintain the exterior finish of their vehicle.',
    image: 'svc-coating',
    surface: 'GLOSS / DOME',
  },
  {
    n: '03',
    title: 'Automotive Detailing',
    short: 'Detailing',
    body: 'Detailing focused on the appearance and care of cars and motorcycles.',
    image: 'svc-detailing',
    surface: 'PANEL / SHUT LINE',
  },
  {
    n: '04',
    title: 'Vehicle Wraps',
    short: 'Wraps',
    body: 'Vehicle wrapping options for drivers exploring a different visual treatment. Ask about current materials and availability.',
    image: 'svc-wraps',
    surface: 'SATIN / EDGE',
  },
];

/**
 * Gallery frames.
 *
 * Morphed's own photography could not be retrieved: instagram.com,
 * facebook.com, youtube.com, detailers.in and magicpin.in are all blocked by
 * this environment's network egress policy, as is every stock-photography
 * host. Substituting unrelated vehicles would misrepresent the studio's work,
 * so each frame is a rendered surface study occupying a reserved slot, and
 * names the Morphed post that belongs in it. See docs/ASSET-MANIFEST.md.
 */
export type Slot = {
  id: string;
  image: string;
  /** Technical descriptor of what the rendered study actually shows. */
  surface: string;
  /** The Morphed post intended for this slot. */
  intended: string;
  source: string;
  /** Layout weight in the gallery rhythm. */
  size: 'wide' | 'tall';
};

export const SLOTS: Slot[] = [
  {
    id: '01',
    image: 'study-01',
    surface: 'MIDNIGHT / CREASE LINE',
    intended: 'BMW iX1 — PPF work',
    source: 'https://www.instagram.com/morphedetailingstudio/reel/DcDrVYQPPti/',
    size: 'wide',
  },
  {
    id: '02',
    image: 'study-02',
    surface: 'SILVER / SOFT DOME',
    intended: 'BMW X1 — paint protection',
    source: 'https://www.instagram.com/reel/DVOQ3eEk1_R/',
    size: 'tall',
  },
  {
    id: '03',
    image: 'study-03',
    surface: 'INK / SHUT LINE',
    intended: 'MG Hector Plus — studio work',
    source: 'https://www.instagram.com/reel/DUsyippEV4v/',
    size: 'wide',
  },
  {
    id: '04',
    image: 'study-04',
    surface: 'STEEL BLUE / SWAGE',
    intended: 'Tata Sierra — paint protection',
    source: 'https://www.instagram.com/reel/DcAIyd4vpzW/',
    size: 'tall',
  },
  {
    id: '05',
    image: 'study-05',
    surface: 'BRONZE / LOW CURVATURE',
    intended: 'Mahindra Thar — studio work',
    source: 'https://www.instagram.com/p/DPe8I9liTtF/',
    size: 'wide',
  },
  {
    id: '06',
    image: 'study-06',
    surface: 'GRAPHITE / PANEL EDGE',
    intended: 'Further work from the studio feed',
    source: INSTAGRAM,
    size: 'tall',
  },
];

export const NAV = [
  { href: '#protection', label: 'Protection' },
  { href: '#services', label: 'Services' },
  { href: '#work', label: 'Work' },
  { href: '#studio', label: 'Studio' },
  { href: '#contact', label: 'Contact' },
];

export const DISCLAIMER_MAIN =
  'Unofficial website concept created independently for presentation purposes. Morphed Detailing Studio did not commission or approve this concept.';

export const DISCLAIMER_ASSETS =
  'Public imagery is used only within this private speculative presentation. Permission and final asset approval are required before any official launch.';
