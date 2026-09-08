# VERIFIED-FACTS

Every business fact that appears on the concept, and its source. Nothing on the
page may go beyond this file. The single code-level source of truth is
`src/data/site.ts`.

## Business identity

| Field | Value |
| --- | --- |
| Official name | Morphed Detailing Studio |
| Category | Automotive detailing and vehicle paint protection |
| City | Bengaluru, Karnataka, India |

## Address

```
31 Ground Floor
Pipeline Road
KHBS Layout
Bengaluru, Karnataka 560086
India
```

## Contact

| Field | Value |
| --- | --- |
| Phone / WhatsApp | +91 76248 33840 |
| Telephone link | `tel:+917624833840` |
| Email | morpheddetailing@gmail.com |
| Email link | `mailto:morpheddetailing@gmail.com` |

Primary conversion route (used verbatim, unchanged):

```
https://wa.me/917624833840?text=Hi%20Morphed%20Detailing%20Studio%2C%20I%27d%20like%20to%20discuss%20protecting%20my%20vehicle.
```

## Public profiles and listings

| Source | URL |
| --- | --- |
| Instagram (primary) | https://www.instagram.com/morphedetailingstudio/ |
| Facebook | https://www.facebook.com/MorphedDetailingStudio/ |
| YouTube | https://www.youtube.com/@morpheddetailingstudio |
| Detailers India listing | https://www.detailers.in/listing/morphed-detailing-studio/ |

Instagram, Facebook and YouTube are linked from the page. Detailers India is
recorded here for provenance but is not linked from the page. The Magicpin
listing is no longer treated as a source — see **Removed / unverified** below.

## Directions link

Built at runtime from the verified name and address, as a Google Maps **search**
URL. No latitude/longitude is used anywhere, invented or otherwise:

```
https://www.google.com/maps/search/?api=1&query=<name + address, URL-encoded>
```

## Verified services

Supported by the public business profiles. Descriptions are deliberately short
and route the visitor to WhatsApp for anything specific.

1. **Paint Protection Film (PPF)** — transparent paint-protection options for
   cars and motorcycles.
2. **Ceramic coating** — coating services for preserving and maintaining a
   vehicle's exterior finish.
3. **Automotive detailing** — appearance and care of cars and motorcycles.
4. **Vehicle wraps** — wrapping as an available styling category.

The page does not claim every service is available for every vehicle.

## The studio's own self-description

Published by Morphed on its own Instagram profile. This is the **business's
claim about itself**, not independent verification, and the page presents it
that way: visibly attributed, linked to the profile, and set in body-scale type
rather than a display numeral, so it cannot read as a third-party credential.

| Claim | Source |
| --- | --- |
| "Certified car detailer" | Instagram profile — the studio's own wording |
| "PPF, ceramic coating, detailing, sunfilms" | Instagram profile |
| "1000+ customers trusted us with PPF" | Instagram profile |

Attribution rendered on the page: *"Published by the studio on its own Instagram
profile. This is how Morphed describes itself — not an independent review,
rating or verified figure."* Linked to
https://www.instagram.com/morphedetailingstudio/.

Notes for launch:

- **"Certified"** is the studio's word. No certifying body, standard or
  credential is named anywhere, and none should be added without documentation.
- **"Sunfilms"** appears only inside this quoted self-description. It is
  deliberately **not** added to the four service categories in the services
  section, which stay as the profiles support them.
- **"1000+ customers"** is the studio's own figure. It is not independently
  verified and is not presented as though it were.

## Removed / unverified

### Magicpin rating — removed 2026-09-08

| Field | Former value |
| --- | --- |
| Value | 4.7 |
| Count | 598 online ratings |
| Claimed source | Magicpin |
| Former listing URL | https://magicpin.in/Bangalore/Kurubarahalli/Autocare/Morphed-Detailing-Studio-Paint-Protection-Film-Ppf-and-Ceramic-Coating-Studio./store/26a3a82 |

**Reason for removal:** the figure could not be re-verified. A fresh search did
not surface the Magicpin listing at all, so neither the rating nor the listing's
continued existence could be confirmed.

**Decision:** removed outright — the number, the attribution line, the source
link and the re-verify note. It was not softened, dated, or moved to smaller
type. An unverifiable third-party number on a page the owner shows customers is
a liability for him, not a credential.

`tools/qa/functional.mjs` now fails if any numeric third-party rating reappears
anywhere in the rendered page, in any wording — including a score split across
elements — and fails if the Instagram self-claims lose their attribution or
their link.

Do not reinstate this rating unless the live Magicpin listing is found again and
the figures are read directly off it on the day of launch.

## Unresolved

**Owner / founder identity is not publicly verified.** No owner, founder, team
member, technician or spokesperson is named, depicted, quoted or implied
anywhere on the page.

## Facts intentionally omitted

None of the following could be safely established, so none appear: prices,
discounts, packages, warranty periods, lifetime protection, guarantees,
self-healing or scratch-proof performance, film thickness, durability figures,
hydrophobic statistics, product partnerships, authorised-dealer status,
certifications, awards, years in business, vehicles completed, customer totals,
client names, testimonials or review quotations, Google ratings, any
third-party rating, before-and-after results, business history, service
turnaround times, free extras, complimentary services, insurance or
manufacturer approvals, and opening hours.

The only figure on the page is "1000+ customers", which is the studio's own
attributed claim rather than one we assert — see the self-description section
above.

Branded materials, products or vehicles appearing in the studio's social posts
were **not** treated as evidence of any official partnership.
