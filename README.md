# Nusantara Numbers — Make the best national statistics site

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/Andysyahputra/best-national-statistics-site-20261126-0539/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/Andysyahputra/best-national-statistics-site-20261126-0539/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)

**Nusantara Numbers** — *Indonesia in figures, sourced and dated.* An original national statistics site built for the [make.fun](https://make.fun/bounty/best-national-statistics-site-20261126-0539) "Make the best national statistics site" bounty. Static files, no build step, no network: open `app/index.html` in a browser (or serve `app/` with any static HTTP server).

## What it covers

- **Overview** — 6 key indicators (population, GDP, GDP per capita, growth, inflation, unemployment) with source + year on every figure, and a GDP-growth bar chart.
- **Economy** — GDP, growth and inflation trends, GDP by sector, and a sortable 2020–2024 table.
- **People** — population trend 2010–2024, unemployment, poverty and life expectancy cards, searchable top-10 provinces table.
- **Provinces** — top-5 population bar chart and the full 18-province table (sortable, live search, region filter).
- **Sources & Method** — every figure with its source, year and note, plus downloadable `data/all.json` and `data/provinces.csv`.

## Data

All figures are from the World Bank (2024) and BPS — Statistics Indonesia (2020–2025), each labelled with its source and year on the page. Charts are hand-drawn on canvas (no chart library); the whole site uses the system font stack, so the first load stays small.

## Tech

- `app/` — the site (5 pages, one stylesheet, `js/data.js`, `js/charts.js`, `js/tables.js`, `js/main.js`).
- `main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.
