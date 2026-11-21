# Netlify media administration

The Netlify deployment supports sign-in and a persistent catalogue for music, videos, and podcasts. The Cloudflare deployment retains its existing Access and D1 integration.

In the Netlify project's environment variables, create `CREATOR_ADMIN_PASSWORD` with a unique, randomly generated password of at least 24 characters. Mark it as secret and use the Functions scope and Production context. The default username is `admin`. To set another username, add `CREATOR_ADMIN_USERNAME` with the same scope and context. Deploy after changing the variables. Changing the password invalidates existing sessions.

Open [Administration](https://creatorcommunity.space/admin/) and sign in. Under **Media catalogue**, select Music, Video, or Podcast. Enter an ID, title, description, and a direct HTTPS link to the audio or video file, then select **Add to catalogue**. Poster and WebVTT caption links are optional. Media files are hosted separately. The catalogue stores their URLs and publication settings in Netlify Blobs.


## Full administration

Use **Overview** to open Features, Media, Users, and Payments. Features controls the public catalogue, welcome screens, ebook visibility, title, notice, and contribution amount. Netlify's visibility switches control the app interface. Previously published static files remain directly accessible by their file URLs.

In **Users**, create or disable a member and rotate their access key when needed. Copy the new key when issued and share it privately with that member. Member sign-in is at `/account/`. Legacy readers use local device storage. Member accounts do not import or sync that local reading history.

Payments is disabled on a fresh deployment. Set `BTCPAY_URL`, `BTCPAY_STORE_ID`, `BTCPAY_API_KEY`, and `BTCPAY_WEBHOOK_SECRET` in Netlify's Functions scope, then redeploy. Register a webhook at `https://creatorcommunity.space/api/payments/webhook`, with redelivery and the InvoiceSettled, InvoiceExpired, and InvoiceInvalid events. Enable Support checkout and set the contribution amount in Site & features. Review the latest 50 invoices in Payments. Checkout uses the payment methods enabled on the configured BTCPay store.
