// Nusantara Numbers — page wiring: nav active state, charts, toggles.
// Charts are drawn from window.NN_DATA (js/data.js) with the hand-drawn
// canvas helpers in window.NNCharts (js/charts.js).
(function () {
  var D = window.NN_DATA;
  var C = window.NNCharts;

  function markNav() {
    var page = document.body.getAttribute("data-page") || "index";
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      if (a.getAttribute("data-page") === page) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  // GDP growth 2020–2024 as bars; toggle switches between the growth
  // rate (%) and the change in percentage points vs the previous year.
  function wireGrowthToggle(canvasId, toggleId) {
    var canvas = document.getElementById(canvasId);
    var toggle = document.getElementById(toggleId);
    if (!canvas || !toggle) return;
    var years = D.growthHistory.map(function (d) { return d.year; });
    var pct = D.growthHistory.map(function (d) { return d.growth; });
    // Percentage-point change vs the previous year; 2020 has no prior
    // year, so it is shown as 0 with an "n/a" note in the caption.
    var pp = D.growthHistory.map(function (d, i) {
      return i === 0 ? null : +(d.growth - D.growthHistory[i - 1].growth).toFixed(2);
    });
    var mode = "pct";
    function draw() {
      if (mode === "pct") {
        C.barChart(canvas, years, pct, { unit: "%", decimals: 2 });
      } else {
        var vals = pp.map(function (v) { return v === null ? 0 : v; });
        C.barChart(canvas, years, vals, { unit: " pp", decimals: 2 });
      }
      toggle.setAttribute("aria-pressed", mode === "pp" ? "true" : "false");
      toggle.textContent = mode === "pct"
        ? "Show change in percentage points"
        : "Show growth rate (%)";
    }
    toggle.addEventListener("click", function () {
      mode = mode === "pct" ? "pp" : "pct";
      draw();
    });
    draw();
    window.addEventListener("resize", draw);
  }

  function drawPageCharts() {
    var page = document.body.getAttribute("data-page");
    var years = D.growthHistory.map(function (d) { return d.year; });
    var growth = D.growthHistory.map(function (d) { return d.growth; });
    var inflYears = D.inflationHistory.map(function (d) { return d.year; });
    var infl = D.inflationHistory.map(function (d) { return d.inflation; });
    var popYears = D.populationHistory.map(function (d) { return d.year; });
    var pop = D.populationHistory.map(function (d) { return d.population; });

    if (page === "index") {
      wireGrowthToggle("growth-chart", "growth-toggle");
    }
    if (page === "economy") {
      var gc = document.getElementById("growth-chart");
      if (gc) C.barChart(gc, years, growth, { unit: "%", decimals: 2 });
      var ic = document.getElementById("inflation-chart");
      if (ic) C.lineChart(ic, inflYears, infl, { unit: "%", decimals: 2 });
      var sc = document.getElementById("sector-chart");
      if (sc) C.hbarChart(sc,
        D.sectors.map(function (s) { return s.name; }),
        D.sectors.map(function (s) { return s.share; }),
        { unit: "%", decimals: 0 });
    }
    if (page === "people") {
      var pc = document.getElementById("population-chart");
      if (pc) C.lineChart(pc, popYears, pop, { unit: "M", decimals: 1 });
    }
    if (page === "provinces") {
      var top5 = D.provinces.slice(0, 5);
      var bc = document.getElementById("province-chart");
      if (bc) C.hbarChart(bc,
        top5.map(function (p) { return p.name; }),
        top5.map(function (p) { return p.population; }),
        { unit: "M", decimals: 1 });
    }
  }

  function fillProvinceTables() {
    // People page: top-10 provinces table, built from the data file.
    var top10 = document.getElementById("top10-body");
    if (top10) {
      D.provinces.slice(0, 10).forEach(function (p, i) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td data-sort=\"" + (i + 1) + "\">" + (i + 1) + "</td>" +
          "<td>" + p.name + "</td>" +
          "<td>" + p.capital + "</td>" +
          "<td>" + p.region + "</td>" +
          "<td data-sort=\"" + p.population + "\">" + p.population.toFixed(1) + "</td>" +
          "<td data-sort=\"" + (p.population / D.meta.nationalTotal * 100).toFixed(2) + "\">" +
          (p.population / D.meta.nationalTotal * 100).toFixed(1) + "%</td>";
        top10.appendChild(tr);
      });
    }
    // Provinces page: full 18-province table, built from the data file.
    var full = document.getElementById("provinces-body");
    if (full) {
      D.provinces.forEach(function (p, i) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td data-sort=\"" + (i + 1) + "\">" + (i + 1) + "</td>" +
          "<td>" + p.name + "</td>" +
          "<td>" + p.capital + "</td>" +
          "<td>" + p.region + "</td>" +
          "<td data-sort=\"" + p.population + "\">" + p.population.toFixed(1) + "</td>" +
          "<td data-sort=\"" + (p.population / D.meta.nationalTotal * 100).toFixed(2) + "\">" +
          (p.population / D.meta.nationalTotal * 100).toFixed(1) + "%</td>";
        full.appendChild(tr);
      });
    }
  }

  function fillSourcesList() {
    var list = document.getElementById("sources-list");
    if (!list) return;
    D.sources.forEach(function (s) {
      var li = document.createElement("li");
      li.className = "source-item";
      var h = document.createElement("h3");
      h.textContent = s.figure;
      var meta = document.createElement("p");
      meta.className = "source-meta";
      meta.textContent = s.source + " · " + s.year;
      var note = document.createElement("p");
      note.textContent = s.note;
      li.appendChild(h); li.appendChild(meta); li.appendChild(note);
      list.appendChild(li);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    markNav();
    fillProvinceTables();
    fillSourcesList();
    window.NNTables.init();
    drawPageCharts();
    // Redraw charts when the viewport changes (phone rotation, resize).
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(drawPageCharts, 150);
    });
  });
})();
