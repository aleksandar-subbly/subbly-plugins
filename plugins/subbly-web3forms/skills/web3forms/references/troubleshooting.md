# Troubleshooting

Each item gives the symptom, the cause, and what to do or tell the user. Explain causes to the user in plain words. Visitors only ever see the hook's friendly messages.

## Configuration

- **`check-access-key.js` prints `missing`.** The Form Access Key field is empty, or a fresh value has not synced to the sandbox yet. Ask the user to fill **Form Access Key** in the Web3Forms plugin settings, wait a moment, then run the script again.
- **It prints `malformed`.** The field holds something other than a UUID, often an email address or a partial copy. Ask the user to copy the Access Key again from their Web3Forms email or dashboard.
- **The form shows "temporarily unavailable" and the console says the key is not configured.** `getWeb3FormsAccessKey()` returned null where the page rendered. Check that a server component reads it and passes `accessKey` down. A page rendered at build time keeps the key it had at build, so rebuild or republish after the user changes the key.

## Submission errors

The hook logs the HTTP status and Web3Forms' message to the browser console as `[web3forms] Submission rejected <status> <message>`.

- **400 with a message about the access key.** The key is wrong, or its form was deleted in Web3Forms. Ask the user to check the key in their Web3Forms account and update the plugin field.
- **400, other messages.** Usually a malformed payload. Check that every field has a `name` and that you did not add a field Web3Forms reserves for paid plans.
- **403 "This method is not allowed".** The request did not come from a browser. Web3Forms rejects server-side and proxied submissions unless the account has a paid plan with a safelisted server IP. Move the submission back into `useWeb3Forms` in the browser.
- **403 or failure only on the live domain while the preview works.** Two causes:
  - Domain restriction is a paid Web3Forms feature. If the user enabled it, the live domain must be listed in their Web3Forms settings, with no `https://`.
  - Web3Forms blocks some free-platform subdomains by default. A custom domain avoids this, or the user can contact Web3Forms support at https://web3forms.com/help?contact=true.
- **429.** Too many submissions from one IP address. Web3Forms lifts the block automatically after about one hour. Tell the user not to repeat test submissions quickly.
- **500.** A Web3Forms-side failure. Retry later. If it persists, the user contacts Web3Forms support.
- **Network error.** The visitor is offline, or an ad or privacy blocker blocked `api.web3forms.com`. Test with blockers off.

## Emails not arriving

The submission succeeded, so the form says "sent", but nothing reaches the inbox:

1. Wait 1–2 minutes. Delivery is usually instant.
2. Check the Spam/Junk folder, and in Gmail the Promotions and Updates tabs. Mark the message "not spam" so later ones land in the inbox.
3. Check that the email address on the Web3Forms account is the one the user expects. The recipient is set in Web3Forms, not in Subbly.
4. Outlook or Hotmail: add `notify@web3forms.com` to contacts and `web3forms.com` to safe senders. Google Workspace: check the admin spam, phishing and malware settings allow `web3forms.com`.
5. A custom-domain mailbox needs valid MX records. Check them with a DNS lookup tool.
6. If the address once bounced, for example because the key was created before the mailbox existed, Web3Forms suppresses it. The user contacts Web3Forms support to remove it from the suppression list.
7. **An email arrives with empty fields.** A field is missing its `name` attribute.
