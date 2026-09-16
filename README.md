# moneyman

An app to keep track of your bank-account expenses, see what percentage of your
income you spend each month, and how much you need to save to reach a goal in
1 month, 3 months, 6 months, or 1 year. Everything is stored only on your
device; nothing goes out to the internet. It is intended to be installed as a
PWA on your phone.

## What it does

- Records each expense and income by hand or by importing the bank's CSV.
- Calculates the month's spending budget from your income minus the savings
  you need for your goal.
- Shows the percentage of your income and budget that you have spent so far.
- Breaks spending down by category, with its percentage of your income and
  budget.
- Keeps track of your accumulated savings and estimates whether you will reach
  your goal at your current pace.

## How to get it running locally

You need Node 20.19 or newer (or Node 22.12 or newer).

```
npm install
npm run dev
```

Open the address shown in the terminal (by default http://localhost:5173).

## How to create the mobile version (PWA)

```
npm run build
npm run preview
```

`npm run preview` starts the compiled app. To install it on your phone as an
app, you need to serve it over HTTPS. Two straightforward options:

1. Upload the `dist` folder to free static hosting such as Netlify, Vercel, or
   GitHub Pages. Open the website on your phone and use "Add to Home Screen".
2. Locally, use `npm run preview -- --host` and access it from your phone through
   your computer's IP address. To install it as an app, HTTPS is required, so
   hosting is the easiest route.

## How to import the bank statement

Export your account movements in CSV format from your bank's website. In the
Import tab, choose the file, check which columns contain the date, description,
and amount, and confirm. Negative amounts are saved as expenses and positive
ones as income. There is a sample file in `ejemplo-banco.csv`.

## Recommended first use

1. Go to the Goal tab and enter your monthly income, current savings, the amount
   you want to reach, and how long you want to take.
2. Import your bank's CSV or add expenses by hand in the Expenses tab.
3. Check the Dashboard to see percentages, categories, and goal progress.

## Technical details

- React 19 with TypeScript and Vite.
- Native iOS-style interface, animated with Motion.
- Hand-built SVG charts, with no charting library.
- Reicon icons.
- CSV reading with PapaParse.
- PWA with vite-plugin-pwa (works offline once installed).
- Data stored in the browser's localStorage.
