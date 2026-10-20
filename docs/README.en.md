# Survei Sekolah

**A school that fits starts with questions.**

An independent school-visit guide for parents and carers in Indonesia. Ask relevant questions, request real examples, and compare the evidence with your child’s needs.

[Open the English site](https://surveisekolah.rezaprama.com/en/) · [Bahasa Indonesia](../README.md) · [All 36 questions](questions.md)

![Survei Sekolah website preview](preview.webp)

## Use it during your visit

1. Start with the 12 core questions, then select additional topics.
2. Name your school notes. Expand each question for context and evidence to request.
3. Mark answers as *Not discussed*, *Clear*, *Follow up*, or *Not relevant*. Add notes where useful.
4. Create up to three school records and compare information by topic.
5. Print your active selection, download Markdown notes, or save a JSON backup that can be opened on another device.

A count of clear answers is not a school quality score. This guide does not rank or endorse schools.

## Where the questions came from

All 25 original topics in the [two source photographs](../sumber/) are retained and linked to their source numbers. Eleven editorial additions cover fees, school identity, inclusion, disaster preparation, allergies, privacy, technology, behaviour, admissions, teacher development, and accessibility.

Questions were edited for neutral language. Participation in MBG, Indonesia’s free nutritious meals programme, does not establish school quality. Curriculum labels, air conditioning, CCTV, and accreditation should also be considered alongside actual practice.

This is an independent guide by Reza Prama, not a validated research instrument, accreditation, statistical survey, or government publication. Adapt it to the child’s age, support needs, and school context. External reading links do not imply institutional endorsement.

## Privacy

Notes are stored in this browser’s `localStorage` and are not sent to a project database. There are no accounts, advertising trackers, or project-added analytics. Hosting providers still process requests and connection data to deliver the site.

Language versions share notes on the same browser and domain. Other devices do not sync automatically. Keep JSON backups private and avoid children’s names, detailed diagnoses, or identity numbers. Shared-device users may access local notes. Clear site data to remove them and delete downloaded copies separately. If storage is unavailable, download a backup before leaving.

## Development and deployment

Requires Node.js 22+. Run `npm ci`, then `npm run dev`. Preview: `http://127.0.0.1:8787`.

- `npm run check`: content and backup validation, then static build.
- `npm run test:browser`: interaction, language, layout, theme, printing, and no-JavaScript checks.
- `npm run audit`: Lighthouse in both languages on mobile and desktop.
- `npm run deploy`: validation, build, and Cloudflare deployment.

Set `CHROME_PATH` for your Chrome installation. Set `TEST_URL` or `AUDIT_URL` to test a public deployment. The [latest audit summary](../reports/summary.json) records its actual URL, tool version, date, and scores.

Cloudflare Workers Static Assets serves the public site. A small Worker compresses HTML while retaining the `no-transform` privacy header; images and other assets bypass this handler. HTML requests use the hosting account’s Worker quota. There is no notes API or database. GitHub Actions checks every push and pull request. A manual Deploy workflow requires a dedicated `CLOUDFLARE_API_TOKEN` secret in the `production` environment. Pushes do not automatically deploy. See [the main README](../README.md) for configuration.

## Search and AI readability

Both languages render complete HTML with canonical URLs, hreflang, metadata, and `WebSite` / `CollectionPage` structured data. Sitemap, robots.txt, Markdown, JSON, and llms.txt make the content accessible in standard formats.

Lighthouse scores are laboratory measurements, not a guarantee of future PageSpeed results. There is no universal official GEO score of 100/100. Readability, source traceability, and accurate claims are the priorities.

Generated illustrations do not depict a particular school. DM Sans and Phosphor licences are included with the deployed assets. New code and content use MIT; supplied source photographs are excluded from that reuse permission.
