# Netlify media administration

The Netlify deployment supports sign-in and a persistent catalogue for music, videos, and podcasts. The Cloudflare deployment retains its existing Access and D1 integration.

In the Netlify project's environment variables, create `CREATOR_ADMIN_PASSWORD` with a unique, randomly generated password of at least 24 characters. Mark it as secret and use the Functions scope and Production context. The default username is `admin`. To set another username, add `CREATOR_ADMIN_USERNAME` with the same scope and context. Deploy after changing the variables. Changing the password invalidates existing sessions.

Open [Administration](https://creatorcommunity.space/admin/) and sign in. Under **Media catalogue**, select Music, Video, or Podcast. Enter an ID, title, description, and a direct HTTPS link to the audio or video file, then select **Add to catalogue**. Poster and WebVTT caption links are optional. Media files are hosted separately. The catalogue stores their URLs and publication settings in Netlify Blobs.

This temporary Netlify administration supports the media catalogue only. The Cloudflare dashboard provides site settings, payments, and audit history.
