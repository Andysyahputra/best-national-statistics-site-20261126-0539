// Nusantara Numbers — page wiring: nav active state, chart drawing per page,
// the growth chart's "% / percentage-point change" toggle, and table controls.
import {
  GROWTH_HISTORY,
  INFLATION_HISTORY,
  POPULATION_HISTORY,
  PROVINCES,
  SECTORS,
  growthPointChange,
} from "./data.js";
import { drawBarChart, drawHBarChart, drawLineChart } from "./charts.js";
import { initTables } from "./tables.js";

const pct = (v) => v.toFixed(2) + "%";
const pp = (v) => (v > 0 ? "+" : "") + v.toFixed(2) + " pp";

// Mark the current page's link in the top nav.
function markActiveNav() {
  const page = document.body.dataset.page || "index";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    if (link.dataset.nav === page) link.classList.add("active");
  });
}

// GDP growth bar chart, with a toggle between growth % and the
// percentage-point change on the previous year.
function wireGrowthChart(canvasId, toggleId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const toggle = document.getElementById(toggleId);
  let mode = "pct";

  function draw() {
    if (mode === "pct") {
      drawBarChart(canvas, {
        labels: GROWTH_HISTORY.map((d) => d.year),
        values: GROWTH_HISTORY.map((d) => d.growth),
        format: pct,
        colorFor: (v) => (v < 0 ? "#e85d4a" : "#006d6f"),
      });
    } else {
      // 2020 has no previous year, so it is shown as a flat grey "n/a" bar.
      const changes = GROWTH_HISTORY.map((d, i) => growthPointChange(i));
      drawBarChart(canvas, {
        labels: GROWTH_HISTORY.map((d) => d.year),
        values: changes.map((c) => (c === null ? 0 : c)),
        format: (v, i) => (changes[i] === null ? "n/a" : pp(v)),
        colorFor: (v, i) => (changes[i] === null ? "#b9b3a4" : v < 0 ? "#e85d4a" : "#4ec9b0"),
      });
    }
  }

  if (toggle) {
    toggle.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.mode;
        toggle.querySelectorAll("button").forEach((b) => {
          b.setAttribute("aria-pressed", String(b === button));
        });
        draw();
      });
    });
  }
  draw();
}

function wirePageCharts() {
  const page = document.body.dataset.page || "index";

  if (page === "index") {
    wireGrowthChart("growth-chart", "growth-toggle");
  }

  if (page === "economy") {
    const growth = document.getElementById("growth-chart");
    if (growth) {
      drawBarChart(growth, {
        labels: GROWTH_HISTORY.map((d) => d.year),
        values: GROWTH_HISTORY.map((d) => d.growth),
        format: pct,
        colorFor: (v) => (v < 0 ? "#e85d4a" : "#006d6f"),
      });
    }
    const inflation = document.getElementById("inflation-chart");
    if (inflation) {
      drawLineChart(inflation, {
        labels: INFLATION_HISTORY.map((d) => d.year),
        values: INFLATION_HISTORY.map((d) => d.inflation),
        format: pct,
      });
    }
    const sectors = document.getElementById("sector-chart");
    if (sectors) {
      drawHBarChart(sectors, {
        labels: SECTORS.map((s) => s.sector),
        values: SECTORS.map((s) => s.share),
        format: (v) => "~" + v + "%",
        maxValue: 40,
      });
    }
  }

  if (page === "people") {
    const population = document.getElementById("population-chart");
    if (population) {
      drawLineChart(population, {
        labels: POPULATION_HISTORY.map((d) => d.year),
        values: POPULATION_HISTORY.map((d) => d.population),
        format: (v) => v.toFixed(1) + "M",
      });
    }
  }

  if (page === "provinces") {
    const top = document.getElementById("top-provinces-chart");
    if (top) {
      const five = PROVINCES.slice(0, 5);
      drawHBarChart(top, {
        labels: five.map((p) => p.province),
        values: five.map((p) => p.population),
        format: (v) => v.toFixed(1) + "M",
        maxValue: 50,
      });
    }
  }
}

// Redraw canvas charts when the window is resized (canvas backing size
// follows its CSS box, so a redraw keeps lines crisp).
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(wirePageCharts, 150);
});

markActiveNav();
wirePageCharts();
initTables();
