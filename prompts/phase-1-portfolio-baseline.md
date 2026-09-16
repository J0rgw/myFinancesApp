# Prompt — Phase 1: Portfolio baseline

Read `CODEX_PROJECT_BRIEF.md` first. Inspect the current repository before
changing anything and preserve all unrelated user work.

## Project context

MoneyMan is a public React + TypeScript + Vite privacy-first personal finance
PWA. The repository already exists publicly on GitHub:

https://github.com/J0rgw/myFinancesApp

Do not initialize a new repository, rename the project, remove the existing
Git history, or replace the current architecture.

The existing favicon/brand image is already available at:

`public/images/moneyman.jpg`

Reuse this asset for the favicon and relevant PWA metadata. Do not generate or
download a replacement asset unless the existing file is technically unusable.

## Objective

Make the current version portfolio-ready as Phase 1 of the MoneyMan fintech
portfolio roadmap. Focus on polish, discoverability, safe demo usage and
documentation. Do not implement new financial features yet.

## In scope

### 1. Public portfolio documentation

Update the existing README documentation without deleting useful information.
Create or improve the English and Spanish versions so that both explain:

- What MoneyMan is.
- The user problem it solves.
- Privacy-by-design and local-only data storage.
- Current features.
- Technical stack.
- How to run it locally.
- How to build and preview the PWA.
- How to use the synthetic CSV example.
- The public GitHub repository.
- A placeholder or clearly marked location for the live demo URL.
- Current limitations and future roadmap.

Use English as the primary portfolio language and provide Spanish alongside it.
Do not claim features that are not implemented.

### 2. Demo data

Add a safe demo-data flow using synthetic financial data only. It should allow
a reviewer to understand the dashboard without importing personal data or
manually entering many transactions.

Requirements:

- Clearly label the data as demo/sample data.
- Make it possible to reset or replace demo data safely.
- Do not commit real personal financial data.
- Reuse the existing domain model and storage abstractions.
- Keep the existing manual-entry and CSV-import flows working.
- Add English and Spanish copy for all new visible UI.

Prefer a small, deterministic dataset that demonstrates income, expenses,
categories, savings and at least one month of dashboard data.

### 3. Favicon and PWA metadata

Inspect `public/images/moneyman.jpg` and use it wherever appropriate for:

- HTML favicon metadata.
- Apple touch icon metadata if technically appropriate.
- PWA manifest branding if the current asset format and dimensions support it.

If the image needs derived icon sizes for the current PWA setup, create only the
minimum local derived assets required by the project. Keep the original image
untouched. Make sure the final build does not reference missing icon files.

Review the document title, description, theme color, app name, language and
Open Graph metadata. Use accurate bilingual or English-first portfolio copy.

### 4. Responsive portfolio polish

Review the current interface at mobile, tablet and desktop widths. Preserve the
mobile-first visual direction and existing product identity.

Fix only clear Phase 1 issues such as:

- Broken or awkward desktop layout.
- Content overflowing horizontally.
- Unreadable labels or chart values.
- Missing empty states.
- Buttons or controls that are difficult to discover.
- Incorrect safe-area or bottom navigation behavior.
- Visible layout problems caused by long English copy.

Do not redesign the entire app or introduce a new UI framework.

### 5. Portfolio screenshots or documentation assets

If the repository already has a suitable location for screenshots, document
where screenshots should be added. Do not use real financial data in images.
If screenshots cannot be generated safely in the current environment, leave a
clear README placeholder and explain what remains to be captured manually.

## Out of scope for this prompt

- Backend, authentication or real bank integrations.
- New budgeting, recurring-payment or duplicate-detection features.
- Full internationalization architecture for every existing string.
- Unit, component or end-to-end testing infrastructure.
- CI/CD setup.
- Applying to Revolut or sending any external communication.
- Pushing commits to GitHub.

## Technical constraints

- Keep React, TypeScript, Vite, CSS Modules, Motion and the current structure.
- Keep the local-only privacy promise.
- Do not use real financial information.
- Do not commit `.env` files, credentials, personal exports or local backups.
- Keep `ejemplo-banco.csv` as synthetic demo material unless inspection proves
  otherwise.
- Preserve accessibility and `prefers-reduced-motion` behavior.
- Use existing components and tokens before creating new abstractions.

## Acceptance criteria

- The public repository URL is accurately referenced in the README.
- English and Spanish project documentation are both useful and consistent.
- A reviewer can load deterministic demo data and understand the core product.
- Demo data is clearly synthetic and can be reset without deleting unrelated
  user data unexpectedly.
- `public/images/moneyman.jpg` is used correctly for branding/favicon metadata.
- The production build does not report missing referenced assets.
- The main screens remain usable at mobile, tablet and desktop widths.
- No real financial data, credentials or secrets are added.
- Existing manual entry, CSV import, navigation and local persistence continue
  to work.
- No unrelated architecture rewrite is introduced.

## Verification

Run the relevant checks after implementation:

```bash
npm run typecheck
npm run build
```

If the project has no automated browser test setup yet, manually verify the
demo-data flow and the main routes in the local app at mobile and desktop
viewport sizes.

At the end, report:

1. Files changed.
2. Features completed.
3. Commands executed and their results.
4. Any limitations or manual steps remaining.
5. Suggested next prompt for Phase 2.
