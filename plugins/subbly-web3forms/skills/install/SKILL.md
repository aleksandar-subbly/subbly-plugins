---
name: install
description: Finish setting up the Web3Forms plugin after install. Use in the Web3Forms setup chat, or when the user asks whether their Web3Forms integration is configured.
---

# Web3Forms setup

Goal: the shop's Form Access Key is configured, the user knows where submissions go, and they know how to ask for forms. Speak to a non-technical shop owner: short sentences, no code, no API terms.

## 1. Introduce

Tell the user, in these words or close to them: "Connect your website forms to Web3Forms and receive form submissions directly in your email inbox. Web3Forms handles the form submission process, so you don't need to configure your own backend." Link https://web3forms.com/.

Done when the user has seen the explanation and the link.

## 2. Check the key

The user entered the Form Access Key in the install dialog, since the field is required there. Assume they have a key and already saved it once.

Tell the user you are checking that their key reached the project. Then run `node scripts/check-access-key.js --wait`. It keeps checking for up to a minute while the install value syncs. It prints a status line and never prints the key.

- `configured: <NAME>`: remember `<NAME>` for the `web3forms` skill. Go to step 4.
- `missing`: go to step 3a.
- `malformed`: go to step 3b.

Done when you have the script's status.

## 3a. The saved key has not reached the project

Do not explain how to get a key, and do not ask the user to create one. Tell them the key they entered at install has not reached the website project yet. Ask them to open this plugin's settings, check that **Form Access Key** shows as saved, and press save once more. Then run the script with `--wait` again as a new command, because a new command picks up synced values. Run it up to three times.

If it still prints `missing`, report it as a configuration problem, not a user mistake. Name the variable names the script listed, which are safe to show, and say the plugin expects `PLUGIN_SUBBLY_WEB3FORMS__WEB3FORMS_ACCESS_KEY`. Suggest reinstalling the plugin or contacting Subbly support. Stop here, and do not continue to step 4.

Only if the user says they do not have a key yet, give the steps in 3b.

## 3b. The key is wrong, or the user has none

Give these steps as a numbered list:

1. Visit https://web3forms.com/.
2. Create a free account and generate a new form to get an Access Key.
3. Complete the email verification Web3Forms sends.
4. Copy the Form Access Key. It looks like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.
5. Paste it into the **Form Access Key** field in this plugin's settings, and save.

Say that Web3Forms only ever needs this key. Their Web3Forms password stays with them, and you never need it. If they paste a key into the chat, tell them to put it in the settings field instead, and do not repeat it or write it into any file.

When the user says they saved it, run the script with `--wait` again. Done when it prints `configured`. Otherwise follow 3a.

## 4. Explain where submissions go

Tell the user that Web3Forms sends submissions to the email address linked to their access key, which they manage in their Web3Forms account, not in Subbly. To change the recipient, they change it in Web3Forms. Mention the spam and Promotions folders for the first few messages.

## 5. Confirm

Say: "Your Web3Forms integration is configured. You can now ask Subbly Builder to create new website forms or connect existing forms to your Web3Forms account."

This confirms the configuration only. Say that no test submission has been sent yet. Claim a delivered email only after the user confirms one arrived.

## 6. Offer next steps

Offer two or three of the ready-to-use prompts from `../web3forms/references/customer-guide.md`, chosen to fit the site: one to create a form, one to connect existing forms. If the site already has forms, offer to connect them now. That work follows the `web3forms` skill.

Offer an optional test: once a form exists, the user submits it once from the preview or the live site and checks their inbox. Each test sends a real email.
