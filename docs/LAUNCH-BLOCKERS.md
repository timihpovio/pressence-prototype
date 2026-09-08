# Launch blockers

Found while auditing the live pressence.si on 2026-09-08. The first three affect the
**live site right now**, not just the redesign.

## 1. Unrendered template placeholders are live in production

Seventeen `{{TOKEN}}` strings are visible to visitors today:

`{{ODZIVNI_CAS}}` · `{{CENA_PLACEHOLDER}}` · `{{TRAJANJE}}` · `{{TRAJANJE_SREČANJA}}` ·
`{{LOKACIJA_PLACEHOLDER}}` · `{{CERTIFIKAT_PLACEHOLDER}}` · `{{METODOLOGIJA_PLACEHOLDER}}` ·
`{{PROGRAM_COACHINGA}}` · `{{CERTIFIKACIJSKI_ORGAN_IN_RAVEN}}` · `{{PREJŠNJE_VLOGE_IN_LETA}}` ·
`{{DODATNA_USPOSABLJANJA}}` · `{{STROKOVNA_ČLANSTVA}}` · `{{UREDITEV_SUPERVIZIJE}}` ·
`{{ŠTEVILO_SREČANJ}}` · `{{RITEM}}` · `{{POLITIKA_ODPOVEDI}}` · `{{INTERVAL_PREGLEDA}}`

The copy doc calls for removing all of them. **No certification or methodology should be
named until there is an exact official designation.** The prototype's checker
(`tests/check_site.py`, `check_no_unrendered_placeholders`) fails the build if any
reappear.

**Needs from the client:** nothing, if we simply omit these claims. A real certification
name, if she wants one stated.

## 2. Contact details are fake

Live on the site: `hello@pressence.example` and `+386 (0) 00 000 000`. The mockup shows
`info@pressence.si`, which the prototype uses. No phone number appears in the prototype
because we do not have a real one.

**Needs from the client:** confirmation that `info@pressence.si` is correct and live, and a
phone number if one should be published at all.

## 3. Gender forms are inconsistent

The live site uses neutral underscore forms — `povedal_a`, `bil_a`, `usmeril_a`,
`pozoren_na`. The new copy uses female forms throughout — `naslovila`, `verjamem`,
`pozorna sem`. The new copy is correct. Every neutral form must go.

**Needs from the client:** nothing. This is ours to fix.

## 4. Novamira cannot run against production

It deactivates on live URLs by design, regardless of tier. The Elementor build happens on a
staging or local install, then goes live as a separate step.

**Needs from the client:** a staging site, or hosting access to create one.

## 5. Legal pages have no content

All three are structural scaffolds in the prototype. Google Site Kit is installed, so
analytics cookies are in use and the cookie policy cannot ship empty.

**Needs from the client:** privacy policy, cookie policy and legal notice text, from her or
her legal adviser. The prototype supplies the required GDPR headings as a checklist.
