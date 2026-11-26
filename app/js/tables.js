// Nusantara Numbers — sortable + searchable tables.
// A table becomes sortable by clicking a header cell (click again to
// reverse). A search input filters rows live by any text in the row.
// Numbers sort numerically; everything else sorts alphabetically.
window.NNTables = (function () {
  function cellValue(cell) {
    var raw = cell.getAttribute("data-sort") || cell.textContent.trim();
    var num = parseFloat(raw.replace(/[^0-9.\-]/g, ""));
    return { raw: raw, num: isNaN(num) ? null : num };
  }

  function makeSortable(table) {
    var headers = table.querySelectorAll("thead th");
    var tbody = table.querySelector("tbody");
    var state = { col: -1, dir: 1 };
    headers.forEach(function (th, i) {
      th.setAttribute("tabindex", "0");
      th.setAttribute("role", "button");
      th.setAttribute("aria-sort", "none");
      function sort() {
        if (state.col === i) state.dir = -state.dir;
        else { state.col = i; state.dir = 1; }
        var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
        rows.sort(function (a, b) {
          var va = cellValue(a.children[i]);
          var vb = cellValue(b.children[i]);
          var cmp;
          if (va.num !== null && vb.num !== null) cmp = va.num - vb.num;
          else cmp = va.raw.localeCompare(vb.raw);
          return cmp * state.dir;
        });
        rows.forEach(function (r) { tbody.appendChild(r); });
        headers.forEach(function (h) { h.setAttribute("aria-sort", "none"); h.classList.remove("sorted-asc", "sorted-desc"); });
        th.setAttribute("aria-sort", state.dir === 1 ? "ascending" : "descending");
        th.classList.add(state.dir === 1 ? "sorted-asc" : "sorted-desc");
      }
      th.addEventListener("click", sort);
      th.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sort(); }
      });
    });
  }

  function makeSearchable(input, table) {
    var tbody = table.querySelector("tbody");
    var countEl = document.getElementById(input.getAttribute("data-count-for"));
    // Optional region filter select for the same table (provinces page):
    // filters by the Region column (4th column) as well as the search text.
    var regionSelect = document.querySelector(
      'select.region-filter[data-table="' + table.id + '"]');
    function apply() {
      var q = input.value.trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : "";
      var shown = 0, total = 0;
      tbody.querySelectorAll("tr").forEach(function (tr) {
        total++;
        var hitText = q === "" || tr.textContent.toLowerCase().indexOf(q) !== -1;
        var hitRegion = region === "" ||
          (tr.children[3] && tr.children[3].textContent.trim() === region);
        var hit = hitText && hitRegion;
        tr.style.display = hit ? "" : "none";
        if (hit) shown++;
      });
      if (countEl) countEl.textContent = shown + " of " + total + " shown";
    }
    input.addEventListener("input", apply);
    if (regionSelect) regionSelect.addEventListener("change", apply);
    apply();
  }

  function init() {
    document.querySelectorAll("table.sortable").forEach(makeSortable);
    document.querySelectorAll("input.table-search").forEach(function (input) {
      var table = document.getElementById(input.getAttribute("data-table"));
      if (table) makeSearchable(input, table);
    });
  }

  return { init: init, makeSortable: makeSortable, makeSearchable: makeSearchable };
})();
