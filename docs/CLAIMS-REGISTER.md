# CLAIMS-REGISTER

Every factual or potentially commercial statement rendered on the page, with its
source. Verified against the built page by `tools/qa/functional.mjs`, which
fails if prohibited claim language appears outside the attributed self-claims
block, if any numeric third-party rating reappears anywhere in the rendered
markup (including one split across elements), or if the self-claims lose their
attribution or their link.

## Identity and location

| Claim on page | Source | Notes |
| --- | --- | --- |
| "Morphed Detailing Studio" | Verified public business name | — |
| "Detailing Studio" (nav sub-mark) | Verified category | — |
| "Bengaluru / Paint Protection + Detailing" | Verified city + verified services | — |
| Full postal address | Verified public address | Rendered verbatim, twice |
| "KHBS Layout — Bengaluru 560086" | Verified public address | Label on the location plot |
| "Cars / Motorcycles" | Verified services reference cars and motorcycles | — |

## Contact

| Claim on page | Source |
| --- | --- |
| "+91 76248 33840" and `tel:+917624833840` | Verified phone |
| "morpheddetailing@gmail.com" and `mailto:` | Verified email |
| "@morphedetailingstudio" → Instagram | Verified profile |
| Facebook link | Verified profile |
| WhatsApp CTAs → prefilled `wa.me` URL | Supplied in the brief, used verbatim |
| "Get Directions" → Google Maps search | Generated from the verified name + address; no coordinates |

## Services

Each description is a near-verbatim restatement of the brief's safe wording, and
every one routes specifics to the studio.

| Service | Statement | Notes |
| --- | --- | --- |
| 01 Paint Protection Film | "Transparent paint-protection options for cars and motorcycles. Contact the studio to discuss the vehicle and available film options." | No thickness, durability, self-healing or warranty |
| 02 Ceramic Coating | "Coating services for customers looking to preserve and maintain the exterior finish of their vehicle." | No performance or hydrophobic figures |
| 03 Automotive Detailing | "Detailing focused on the appearance and care of cars and motorcycles." | No turnaround times |
| 04 Vehicle Wraps | "Vehicle wrapping options for drivers exploring a different visual treatment. Ask about current materials and availability." | No material or colour claims |

Section heading "Four ways the studio works on a surface" states only the number
of listed service categories.

## The studio's own self-description

The page carries no third-party rating. The Magicpin 4.7 / 598 figure was
**removed on 2026-09-08** because it could not be re-verified — see
`docs/VERIFIED-FACTS.md`, "Removed / unverified". What follows is the business's
own public wording, presented as its claim.

| Claim on page | Source | Handling |
| --- | --- | --- |
| "Certified car detailer" | The studio's own Instagram profile | Quoted self-description; no certifying body is named or implied |
| "PPF, ceramic coating, detailing, sunfilms" | The studio's own Instagram profile | Quoted self-description; "sunfilms" is not added to the four service categories |
| "1000+ customers trusted us with PPF" | The studio's own Instagram profile | Quoted self-description; the studio's figure, not an independently verified one |
| "@morphedetailingstudio" (linked) | The studio's Instagram profile | The visible attribution, linked to the profile the claims come from |
| "Published by the studio on its own Instagram profile. This is how Morphed describes itself — not an independent review, rating or verified figure." | Our own qualification | Rendered at 0.82rem in `--ink-dim`, directly beneath the claims |
| Eyebrow: "04 / In the studio's own words" | — | Frames the section as self-description before the claims are read |

Handling notes:

- The claims are set in body-scale display type on a ruled index, **not** in the
  large-numeral treatment the rating used. That styling reads as an independent
  credential, which is exactly what these are not.
- "Certified" is the studio's word, exempted from the banned-language scan only
  inside this attributed block. The same word anywhere else on the page fails
  the QA suite.
- No individual review is quoted. No rating, score, star count or review total
  appears anywhere.

## Gallery

| Claim on page | Notes |
| --- | --- |
| "Recent work — asset slots" (eyebrow) | Names the section for what it is |
| "The frames are built. The work goes here." | Statement about this concept, not about the business |
| "Every frame below is a finished slot with its crop and treatment already set. The surfaces shown are rendered studies standing in for Morphed's own photography, which drops straight into place." | Discloses the placeholders in plain language, in the section itself |
| "Slot 01"…"Slot 06", "Reserved for: <vehicle> — <work type>" | States the intent of the slot; does not claim the image shows that vehicle |
| Surface descriptors ("Midnight / crease line", etc.) | Describe what the rendered study actually shows |
| "See the studio's own work on Instagram." → Instagram | Points at the studio's real feed |

No image is captioned as a specific product, film brand, thickness, warranty or
technical result. No two images are paired as a before-and-after.

## PPF visualisation

| Claim on page | Notes |
| --- | --- |
| "Interactive PPF visualisation" | Describes the interaction |
| "A layer you notice by what it preserves." | Descriptive headline; asserts no measurable performance |
| "Explore an illustrative view of paint protection film across the vehicle surface." | Explicitly illustrative |
| **"Illustrative digital visualisation. Not an actual before-and-after result."** | Required disclosure, visible beside the interaction at every breakpoint |
| Technical labels "01 Paint surface", "02 Transparent protection layer" | Name the two states of the visualisation only |

Both states are sampled from the **same** source image, so the interaction cannot
be read as a before/after comparison. The protected side changes gloss and local
contrast only — never hue — so it cannot read as different paint. Nothing implies
scratch removal, repair or a treatment outcome.

## Calls to action and closing

| Claim on page | Notes |
| --- | --- |
| "Protect My Vehicle", "Discuss My Vehicle", "Message Morphed on WhatsApp", "Call the Studio", "Follow on Instagram", "View More on Instagram", "View Recent Work" | Actions only |
| "Your vehicle. The right protection conversation." | No performance claim |
| "Tell Morphed what you drive and what you want to protect. The studio can discuss the available service options for your vehicle." | Directs to a conversation; promises no outcome |
| "Ready to protect what you drive?" | Question, no claim |

## Disclosures rendered on the page

- "Unofficial website concept created independently for presentation purposes.
  Morphed Detailing Studio did not commission or approve this concept."
- "Public imagery is used only within this private speculative presentation.
  Permission and final asset approval are required before any official launch."
- "Illustrative digital visualisation. Not an actual before-and-after result."
- "Third-party rating observed during concept research. Verify current listing
  before official launch."

`<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">` is set.
The title and description both say "Unofficial Website Concept". There is no
structured data and no sitemap, so nothing represents this as the business's
official website.

## Explicit confirmation

This build contains **no invented**:

- prices, discounts or packages
- partnerships, authorised-dealer status or manufacturer/insurance approvals
- warranties, guarantees, lifetime claims, self-healing or scratch-proof claims
- film thickness, durability, or hydrophobic-performance statistics
- testimonials, review quotations, client names or customer identities
- third-party ratings, scores, star counts or review totals
- before-and-after claims or imagery
- awards or certifications
- owner, founder, team-member, technician or spokesperson identity or biography
- business history, years in operation, or opening hours
- statistics of our own, including vehicles completed or customer totals
  (the "1000+ customers" figure is the studio's own attributed claim, quoted
  from its Instagram profile, and is presented as such)
- Google ratings
- service turnaround times, free extras or complimentary services

The developer's name, age, studio name, price, portfolio link and any offer are
**absent** from the business-facing concept.
