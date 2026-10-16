# Direct campaign enquiries

The redesign uses a same-origin `/api/enquiry` Vercel Node function and Zoho SMTP. No FormSubmit service or browser-side SMTP credential is used.

## Deployment

This branch keeps the redesign in its separate folder and keeps the existing Vercel Root Directory at `./`. The repository-root `vercel.json` builds `reachup-audience-first/dist`, while the repository-root `api/enquiry.mjs` exposes the Zoho function. The existing top-level HTML files remain in Git. Deploy this branch as a Preview before merging it: merging the root deployment configuration into the production branch will switch the live site to the redesign.

For a standalone Vercel project rooted directly at `reachup-audience-first`, the nested `vercel.json` and package manifest provide the equivalent configuration. Do not set the project root to `dist/`, because that excludes the backend.

For preview testing, scope the `CONTACT_SMTP_*` variables to Preview for `codex/direct-zoho-enquiries` in addition to the Production values already entered. A Preview build does not inherit Production-only variables. Never expose the password in Git or chat. Redeploy that preview after changing its environment variables.

The existing ChatGPT Sites publication is static and cannot execute this Node/SMTP function. The UI deliberately shows the email/WhatsApp alternatives when its own `/api/enquiry` service is unavailable. A successful UI preview is not confirmation of live email delivery.

## Zoho configuration

In Vercel Project Settings > Environment Variables, enter:

- `CONTACT_SMTP_HOST`: `smtp.zoho.in`, confirmed from this mailbox's Zoho Server Configuration Details.
- `CONTACT_SMTP_PORT`: `465` with SSL, selected from the mailbox's supported settings. The function also supports `587` with mandatory STARTTLS.
- `CONTACT_SMTP_USER`: the authenticated mailbox, normally `letstalk@reachupmedia.in`.
- `CONTACT_SMTP_PASSWORD`: a Zoho application-specific password if required by the account. Enter it directly in Vercel; do not send it in chat or commit it.
- `CONTACT_SITE_ORIGIN`: `https://reachupmedia.in`, or the exact origin of a separately hosted preview while testing.

See https://www.zoho.com/mail/help/zoho-smtp.html for the account-specific SMTP settings. The destination is fixed in server code as `letstalk@reachupmedia.in`; the visitor email is only used as Reply-To. The server supports the active Vercel deployment/branch hostname as well as the primary domain. No cross-origin submission endpoint is enabled.

Redeploy after entering the environment variables. Confirm the mailbox permits SMTP authentication; its receiving mail alone does not prove sending access is enabled.

## Verification before launch

1. Open `/api/enquiry` on the Vercel deployment: it should report `{"available":true}`. This only confirms settings are present, not that authentication works.
2. Submit a clearly labelled test enquiry on that deployment and confirm its arrival in Zoho Inbox or Spam. Check that Reply targets the submitted visitor email. No actual email was sent during local tests.
3. Check that delivery errors retain the form details and offer email/WhatsApp. Only an accepted SMTP recipient produces success.
4. Add production rate limits for `/api/enquiry` in Vercel's firewall. The included bounded per-instance limit and honeypot are additional protection, not a durable global rate limiter.

No website database stores enquiries. Platform request logs and the business mailbox may retain their normal records. Keep the privacy wording aligned with any additional analytics or storage introduced later.

## Local checks

Run `npm install`, `npm run build`, and `npm test`. Backend tests use a fake transport and never contact Zoho or send mail.
