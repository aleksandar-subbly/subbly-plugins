---
name: web3forms
description: Build or connect website forms that send submissions through Web3Forms. Use when the user asks to create a contact, quote, booking, inquiry or any custom form; to connect existing forms to Web3Forms or make a form send emails; or when a form does not submit or its emails do not arrive.
---

# Web3Forms forms

Goal: every form the user asks for posts from the visitor's browser to Web3Forms with the shop's access key. Each form validates its input, blocks duplicate sends, shows loading, success and error states, carries the `botcheck` honeypot, and keeps the site's design. The user never sees or handles the key or any code.

## Steps

### 1. Confirm the key is configured

Run `node scripts/check-access-key.js --wait`. It prints `configured: <NAME>`, where `<NAME>` is the environment variable that holds the key. If it prints anything else, stop and follow steps 3a and 3b of the `install` skill. Do not ask for the key in chat, and do not hardcode or invent one.

Done when the script prints `configured: <NAME>`.

### 2. Install the shared integration once

Check for `lib/web3forms.ts` and `components/web3forms/use-web3forms.tsx`. If either is missing or differs from `references/integration-code.md`, write both files from that reference. Adjust only the import aliases to the project's convention, and use the `<NAME>` from step 1 as the variable in `lib/web3forms.ts` if it differs from the one shown. Every form in the project uses these two files. Never copy submission logic into a single form.

Done when both files exist and match the reference.

### 3. Find the forms in scope

- **New form:** decide the page and section from the request. Create the page if asked, in the site's existing layout, typography, colors and spacing.
- **Existing form(s):** search the codebase for `<form`, form components and submit handlers. Include every form that collects visitor input for a person to read: contact, inquiry, quote, booking, feedback, newsletter, custom. Exclude search, cart, checkout, login and account forms, and Subbly-managed commerce flows. For "all forms", list the forms you found (page and purpose) to the user before you change them.

Done when you have the exact list of form components to build or change.

### 4. Build or connect each form

Apply the form contract below to every form on the list.

- **Server side:** the page or server component that renders the form calls `getWeb3FormsAccessKey()` and passes the result to the form as `accessKey`. If the form is already a client component rendered by a client parent, pass the key from the nearest server component above it.
- **Client side:** the form is a client component that calls `useWeb3Forms` and sets `onSubmit={handleSubmit}`.
- **Existing forms:** keep the markup, classes, field order, labels and styling. Add or fix only what the contract requires: `name` attributes, validation attributes, the honeypot, the submit handler, and the status message. Replace the old submit handler, `action` attribute or third-party form service. Remove dead code it leaves behind. Redesign only when the user asks.

Done when every form on the list meets the contract.

### 5. Verify

For each form: the project type-checks and builds, the page renders without console errors, and the form has the honeypot, a `name` on every field and the status region. Empty required fields and a bad email are blocked before any request. The layout works at mobile width.

A real submission sends a real email to the shop owner. Send one only when the user agrees, and tell them to check their inbox, including spam and Promotions. Report an email as delivered only after the user confirms it arrived. If you did not run a test, say so.

Done when every check above passes and the user knows whether a live test was sent.

## Form contract

- **Field names.** Every input has a `name`. Use `name` for the visitor's name, `email` for their email (Web3Forms uses it as the reply-to address), `phone`, `subject` for a subject the visitor types, and `message` for the main text. Name any other field in plain snake_case words that read well in an email, such as `service_type`, `preferred_date` or `project_details`, because Web3Forms forwards each field name as-is. Give radio and checkbox groups one shared `name`.
- **Subject and sender.** Pass `subject` to `useWeb3Forms` as the form's purpose plus the site name, such as "New quote request from <site name>", and `fromName` as the site name. A visitor-typed `subject` field wins over the default.
- **Validation.** Mark required fields with `required`. Use `type="email"` with `pattern="[^@\s]+@[^@\s]+\.[^@\s]+"` for email, `type="tel"` for phone, `type="date"` for dates, and `minLength`/`maxLength` where they make sense. Each field has a visible `<label>` tied to it with `htmlFor`/`id`. The hook calls `reportValidity()`, so the browser shows the messages accessibly.
- **States.** Disable the submit button while `isSubmitting` is true and change its text to show progress, such as "Sending…". Render `message` in one element with `role="status"` and `aria-live="polite"`, styled as success or error from `status`. The hook resets the form after a success.
- **Honeypot.** Render `<Web3FormsHoneypot />` inside every form. It is hidden from everyone, including keyboard and screen reader users. Never style it to be visible.
- **No extras.** Use no backend route, server action or proxy for the submission, no `redirect` field, and no new npm dependency. Web3Forms rejects server-side submissions on its free plan. File uploads, `ccemail`, webhooks and captchas need a paid Web3Forms plan, so add them only when the user asks and confirms they have one.

## Reference

- `references/integration-code.md`: the two shared files. Write them exactly.
- `references/troubleshooting.md`: open it when the key check fails, a submission errors, or emails do not arrive. It maps each symptom to its cause and fix.
- `references/customer-guide.md`: plain-language guide and ready-to-use prompts. Open it when the user asks how the integration works, how to test it, or what to ask for.
