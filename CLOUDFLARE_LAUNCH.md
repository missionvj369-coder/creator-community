# Creator Community Cloudflare launch

The source patch targets `missionvj369-coder/creator-community` main at `a2cabb4e314f8038cae38dd81db1b28bd0a37d87`. The public catalogue has 18 experiences. Music is feature 16, Video is feature 17 and Podcast is feature 18. Administration remains available at `/admin/`. The old Wonder Engine and Unseen links lead to Music and Video. Creation Field links lead to Podcast. Retired artwork and progress remain in local backup data.

## Music, video and books

- Video.js 10.5.0 provides the audio and video controls, bundled from the pinned npm package and served from the app's origin. The music room has a playlist, previous/next and automatic advancement. The video room has a film queue, timeline, fullscreen, speed and optional WebVTT captions. The native media controls are the fallback if the enhancement cannot load.
- D1 seeds three existing scores, the original welcome film and three short spoken introductions. Publish longer episodes through the media catalogue. Supply final release media in the admin catalogue. The console publishes titles, descriptions, posters, WebVTT caption URLs, order and visibility. Source files can be included in the static build or uploaded through the Cloudflare R2 dashboard and served using an approved HTTPS media origin. For cross-origin captions, set a CORS policy that allows the site origin on the media host. Operators still manage source-file uploads, replacement and removal in the storage service.
- The six ebook entries and original downloadable packs remain byte-for-byte unchanged. The app's original progress, bookmarks, offline reader packs and the 99-entry body atlas remain intact. The admin can hide the reading room or individual books and the Worker will deny matching book and download paths while disabled. Previously downloaded files remain readable.
- The dashboard administers publication, content availability, media entries and contribution settings. Personal reader progress, backup data and existing notes are browser-local. There is no central user-account database. Payment refunds, wallet configuration and payout operations stay in the BTCPay dashboard.

## Local checks

Use Node 24 and Python 3. From a clean checkout of the reviewed commit:

```sh
git apply --check /path/to/Creator_Community_Cloudflare.patch
git apply /path/to/Creator_Community_Cloudflare.patch
npm ci
npm test
npm run build
npm run test:release
npm run check:budget
npm run verify:books
npm run check:cloud
npx wrangler d1 migrations apply DB --local
npm run dev:cloud
```

`check:cloud` runs Wrangler in dry-run mode. Until Access is configured, the admin page and API return 403. The Worker integration tests run the migration SQL in a disposable SQLite database and exercise signed Access test tokens, same-origin writes, stale revision protection, the audit trail, ebook visibility, media CRUD, invoice creation, checkout throttling and signed webhook settlement.

## Cloudflare setup

1. Create a D1 database named `creator-community` and replace the all-zero `database_id` in `wrangler.toml` with its ID. Keep the binding name `DB`. Apply both migrations with `npx wrangler d1 migrations apply DB --remote` only after provisioning and release approval.
2. Assign the Worker a dedicated HTTPS domain at the origin root. Serve the generated `dist` via the `ASSETS` binding. The current GitHub Pages project subpath serves broken root-relative JS/CSS references. Production should use the Worker domain.
3. In Cloudflare Zero Trust create one self-hosted Access application with both paths `/admin/*` and `/api/admin*`. Include the bare `/admin` path explicitly if the dashboard's path pattern excludes it. Use an allow policy for the named admins with MFA. Leave public pages and the payment webhook outside the Access policy. Keep `workers_dev` and preview URLs disabled for production.
4. Supply `ACCESS_TEAM` as the Cloudflare Access team domain such as `team.cloudflareaccess.com`, `ACCESS_AUD` as that app's audience, and `ADMIN_EMAILS` as a comma-separated allowed email list. The Worker checks the signed JWT's issuer, audience, expiry and email allowlist before serving admin or accepting mutations.
5. If hosting external media, set `MEDIA_ORIGIN` to its exact HTTPS origin. Use progressive MP4/H.264/AAC and MP3/AAC versions for broad playback. Verify large assets accept byte range requests. Keep public programme media separate from restricted uploads.
6. Preview the built Worker against staging D1, Access and media. Verify an allowed administrator can update settings and the public library reflects them on reload. Verify an unauthenticated client and a disallowed account cannot read admin data. Run the acceptance checks below before any production promotion.

## Payment setup

BTCPay Server is a self-hosted, open-source **Bitcoin** payment gateway. INR, USD and EUR here configure the invoice denomination. Users still pay with the cryptocurrency methods configured in BTCPay. This integration does not process UPI, cards or direct INR settlement. If the desired launch payment methods are UPI or cards, keep checkout disabled until a provider for those methods is selected and separately integrated.

Configure `BTCPAY_URL`, `BTCPAY_STORE_ID`, `BTCPAY_API_KEY`, and `BTCPAY_WEBHOOK_SECRET`. Put the API key and webhook secret in encrypted Worker secrets. Use a Greenfield API key scoped to invoice creation for the designated store. Register an automatically redelivered webhook at `https://YOUR_DOMAIN/api/payments/webhook` for `InvoiceSettled`, `InvoiceExpired`, and `InvoiceInvalid`. Keep contributions off while testing.

The Worker prices invoices from D1, writes invoice/order records, and exposes only order status through a random receipt identifier. Settlement uses the signed webhook body and stored invoice mapping. Duplicate delivery or late expiry cannot reverse a settled order. Check the receipt and D1 status after a staging payment, replay its webhook and exercise an expired invoice. Then publish the support switch and price once the gateway, supported methods and jurisdiction requirements are confirmed. BTCPay hosting and transaction fees are separate from the software license.

## Production acceptance

- Public boot, welcome skip, Home/Media navigation, audio playback, video seeking, subtitles, fullscreen, and mute on desktop and mobile Safari/Chrome.
- Open all six ebook readers and verify bookmarks and each offline pack's download. Disable one title, verify its card and direct download both disappear, and re-enable it.
- Test unauthorized admin access, an authorized save, stale-write rejection, media ordering and audit records.
- Keep the previous Worker release and D1 backup available before publishing. Monitor asset errors, D1 failures and webhook processing during launch.

No production database, Access app, payment store, branch or deployment is created by applying the local patch.
