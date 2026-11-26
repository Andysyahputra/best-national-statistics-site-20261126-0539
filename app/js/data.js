// Nusantara Numbers — the figures, with source + year. Only the figures the
// site's spec lists; nothing here is invented. All population figures are in
// millions of people unless stated otherwise.

export const NATIONAL = {
  population: { value: 283.5, display: "283.5", unit: "million", source: "World Bank", year: 2024 },
  gdp: { value: 1.40, display: "$1.40", unit: "trillion", source: "World Bank", year: 2024 },
  gdpPerCapita: { value: 4925, display: "$4,925", unit: "", source: "World Bank", year: 2024 },
  growth: { value: 5.03, display: "5.03%", unit: "", source: "BPS", year: 2024 },
  inflation: { value: 1.57, display: "1.57%", unit: "", source: "BPS", year: 2024, note: "CPI, year-on-year, December" },
  unemployment: { value: 4.76, display: "4.76%", unit: "", source: "BPS", year: 2025, note: "February" },
  poverty: { value: 8.47, display: "8.47%", unit: "", source: "BPS", year: 2025, note: "March" },
  lifeExpectancy: { value: 74.2, display: "74.2", unit: "years", source: "BPS", year: 2024 },
};

// GDP growth, percent per year (BPS). 2020 is the pandemic contraction.
export const GROWTH_HISTORY = [
  { year: 2020, growth: -2.07 },
  { year: 2021, growth: 3.70 },
  { year: 2022, growth: 5.31 },
  { year: 2023, growth: 5.05 },
  { year: 2024, growth: 5.03 },
];

// Inflation, December year-on-year, percent (BPS).
export const INFLATION_HISTORY = [
  { year: 2020, inflation: 1.68 },
  { year: 2021, inflation: 1.87 },
  { year: 2022, inflation: 5.51 },
  { year: 2023, inflation: 2.61 },
  { year: 2024, inflation: 1.57 },
];

// Population, millions (World Bank).
export const POPULATION_HISTORY = [
  { year: 2010, population: 244.5 },
  { year: 2015, population: 264.0 },
  { year: 2020, population: 274.0 },
  { year: 2024, population: 283.5 },
];

// GDP by sector, approximate shares of GDP (BPS, 2024). Labelled "approx." everywhere shown.
export const SECTORS = [
  { sector: "Manufacturing", share: 19 },
  { sector: "Wholesale & retail trade", share: 13 },
  { sector: "Agriculture", share: 12 },
  { sector: "Construction", share: 10 },
  { sector: "Mining", share: 8 },
  { sector: "Other", share: 38 },
];

// 18 most populous provinces (BPS, 2024). Population in millions; capital and
// region (island group) as listed. Share is computed from the 283.5M national total.
export const PROVINCES = [
  { province: "West Java", capital: "Bandung", region: "Java", population: 49.3 },
  { province: "East Java", capital: "Surabaya", region: "Java", population: 41.8 },
  { province: "Central Java", capital: "Semarang", region: "Java", population: 37.9 },
  { province: "North Sumatra", capital: "Medan", region: "Sumatra", population: 15.6 },
  { province: "Banten", capital: "Serang", region: "Java", population: 12.4 },
  { province: "Jakarta", capital: "Jakarta", region: "Java", population: 10.6 },
  { province: "South Sulawesi", capital: "Makassar", region: "Sulawesi", population: 9.4 },
  { province: "Lampung", capital: "Bandar Lampung", region: "Sumatra", population: 9.2 },
  { province: "South Sumatra", capital: "Palembang", region: "Sumatra", population: 8.8 },
  { province: "Riau", capital: "Pekanbaru", region: "Sumatra", population: 6.9 },
  { province: "West Sumatra", capital: "Padang", region: "Sumatra", population: 5.9 },
  { province: "West Kalimantan", capital: "Pontianak", region: "Kalimantan", population: 5.8 },
  { province: "Aceh", capital: "Banda Aceh", region: "Sumatra", population: 5.5 },
  { province: "Bali", capital: "Denpasar", region: "Bali", population: 4.4 },
  { province: "South Kalimantan", capital: "Banjarmasin", region: "Kalimantan", population: 4.3 },
  { province: "East Kalimantan", capital: "Samarinda", region: "Kalimantan", population: 3.9 },
  { province: "Yogyakarta", capital: "Yogyakarta", region: "Java", population: 3.8 },
  { province: "North Sulawesi", capital: "Manado", region: "Sulawesi", population: 2.7 },
];

export const NATIONAL_POPULATION = 283.5; // million, World Bank 2024

// Share of the national population, in percent, computed from 283.5M.
export function provinceShare(p) {
  return (p.population / NATIONAL_POPULATION) * 100;
}

// Percentage-point change in GDP growth versus the previous year.
// Returns null for the first year (no previous year to compare with).
export function growthPointChange(index) {
  if (index === 0) return null;
  return GROWTH_HISTORY[index].growth - GROWTH_HISTORY[index - 1].growth;
}
