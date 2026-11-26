// Nusantara Numbers — sortable + searchable tables. Tables opt in with
// data-sortable; headers carry data-type ("text" or "number") and a button.
// Search inputs carry data-search-for="<table id>" and filter live.

function parseCell(cell, type) {
  const text = cell.textContent.trim();
  if (type === "number") {
    const n = parseFloat(text.replace(/[^0-9.\-]/g, ""));
    return Number.isNaN(n) ? -Infinity : n;
  }
  return text.toLowerCase();
}

function sortTable(table, columnIndex, type, ascending) {
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  rows.sort((a, b) => {
    const va = parseCell(a.cells[columnIndex], type);
    const vb = parseCell(b.cells[columnIndex], type);
    if (va < vb) return ascending ? -1 : 1;
    if (va > vb) return ascending ? 1 : -1;
    return 0;
  });
  rows.forEach((row) => tbody.appendChild(row));
}

function wireSortable(table) {
  const headers = table.querySelectorAll("thead th");
  headers.forEach((th, index) => {
    const button = th.querySelector("button");
    if (!button) return;
    const type = th.dataset.type || "text";
    let ascending = true;
    button.addEventListener("click", () => {
      // A second click on the same column reverses the order.
      if (table.dataset.sortedColumn === String(index)) {
        ascending = table.dataset.sortedAsc !== "true";
      } else {
        ascending = true;
      }
      table.dataset.sortedColumn = String(index);
      table.dataset.sortedAsc = String(ascending);
      headers.forEach((other) => {
        const otherButton = other.querySelector("button");
        if (otherButton) otherButton.textContent = otherButton.dataset.label;
      });
      button.textContent = button.dataset.label + (ascending ? " \u25B2" : " \u25BC");
      sortTable(table, index, type, ascending);
    });
  });
}

function wireSearch(input) {
  const table = document.getElementById(input.dataset.searchFor);
  if (!table) return;
  const tbody = table.tBodies[0];
  const emptyNote = document.getElementById(input.dataset.searchFor + "-empty");
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    Array.from(tbody.rows).forEach((row) => {
      const match = query === "" || row.textContent.toLowerCase().includes(query);
      row.style.display = match ? "" : "none";
      if (match) visible += 1;
    });
    if (emptyNote) emptyNote.hidden = visible !== 0;
  });
}

export function initTables() {
  document.querySelectorAll("table[data-sortable]").forEach(wireSortable);
  document.querySelectorAll("input[data-search-for]").forEach(wireSearch);
}
