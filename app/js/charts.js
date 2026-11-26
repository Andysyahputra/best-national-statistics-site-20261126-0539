// Nusantara Numbers — hand-drawn canvas charts. No chart library.
// Every chart is drawn with plain Canvas 2D calls, scaled for the
// device pixel ratio so lines stay crisp on desktop and phone screens.
window.NNCharts = (function () {
  var TEAL = "#006D6F";
  var SEAFOAM = "#4EC9B0";
  var CORAL = "#E85D4A";
  var CHARCOAL = "#1A1A2E";
  var GRID = "#D8CDB8";
  var MUTED = "#6B6355";

  function setup(canvas, heightCss) {
    var dpr = window.devicePixelRatio || 1;
    var width = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
    var height = heightCss || 260;
    canvas.style.height = height + "px";
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.font = "12px -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    return { ctx: ctx, width: width, height: height };
  }

  function niceMax(values) {
    var max = Math.max.apply(null, values.map(Math.abs));
    if (max <= 0) return 1;
    var step = Math.pow(10, Math.floor(Math.log10(max)));
    var scaled = max / step;
    var nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
    return nice * step;
  }

  // Vertical bars. Values may be negative (2020 growth was -2.07%).
  // opts: { unit, decimals, zeroLabel }
  function barChart(canvas, labels, values, opts) {
    opts = opts || {};
    var g = setup(canvas, opts.height || 260);
    var ctx = g.ctx, W = g.width, H = g.height;
    var padL = 44, padR = 10, padT = 24, padB = 28;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = niceMax(values);
    var min = Math.min(0, Math.min.apply(null, values));
    var range = max - min;
    var zeroY = padT + (max / range) * plotH;
    var decimals = opts.decimals == null ? 2 : opts.decimals;
    var unit = opts.unit || "%";

    // gridlines + y labels
    ctx.strokeStyle = GRID; ctx.fillStyle = MUTED; ctx.lineWidth = 1;
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    var ticks = 4;
    for (var i = 0; i <= ticks; i++) {
      var v = min + (range * i) / ticks;
      var y = padT + plotH - ((v - min) / range) * plotH;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      ctx.fillText(v.toFixed(0) + unit, padL - 6, y);
    }
    // zero line
    ctx.strokeStyle = CHARCOAL;
    ctx.beginPath(); ctx.moveTo(padL, zeroY); ctx.lineTo(W - padR, zeroY); ctx.stroke();

    var slot = plotW / values.length;
    var barW = Math.min(56, slot * 0.62);
    for (var j = 0; j < values.length; j++) {
      var val = values[j];
      var x = padL + slot * j + (slot - barW) / 2;
      var yTop, h;
      if (val >= 0) { yTop = zeroY - (val / range) * plotH; h = (val / range) * plotH; }
      else { yTop = zeroY; h = (-val / range) * plotH; }
      ctx.fillStyle = val >= 0 ? TEAL : CORAL;
      ctx.fillRect(x, yTop, barW, Math.max(h, 1));
      var label = (val == null ? "—" : val.toFixed(decimals) + unit);
      // Value label: above a positive bar; inside a negative bar (white),
      // so it can never fall off the bottom of the canvas.
      if (val >= 0) {
        ctx.fillStyle = CHARCOAL; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillText(label, x + barW / 2, yTop - 4);
      } else {
        ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(label, x + barW / 2, yTop + h / 2);
      }
      // x label
      ctx.fillStyle = MUTED; ctx.textBaseline = "top";
      ctx.fillText(String(labels[j]), x + barW / 2, H - padB + 8);
    }
  }

  // Line chart with dots and value labels.
  // opts: { unit, decimals }
  function lineChart(canvas, labels, values, opts) {
    opts = opts || {};
    var g = setup(canvas, opts.height || 260);
    var ctx = g.ctx, W = g.width, H = g.height;
    var padL = 44, padR = 16, padT = 24, padB = 28;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var pad = (max - min) * 0.15 || 1;
    min -= pad; max += pad;
    var range = max - min;
    var decimals = opts.decimals == null ? 2 : opts.decimals;
    var unit = opts.unit || "%";

    ctx.strokeStyle = GRID; ctx.fillStyle = MUTED; ctx.lineWidth = 1;
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (var i = 0; i <= 4; i++) {
      var v = min + (range * i) / 4;
      var y = padT + plotH - ((v - min) / range) * plotH;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      ctx.fillText(v.toFixed(decimals) + unit, padL - 6, y);
    }

    function px(j) { return padL + (plotW * j) / (values.length - 1); }
    function py(v) { return padT + plotH - ((v - min) / range) * plotH; }

    ctx.strokeStyle = TEAL; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.beginPath();
    for (var j = 0; j < values.length; j++) {
      if (j === 0) ctx.moveTo(px(j), py(values[j]));
      else ctx.lineTo(px(j), py(values[j]));
    }
    ctx.stroke();

    for (var k = 0; k < values.length; k++) {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(px(k), py(values[k]), 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = TEAL; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(px(k), py(values[k]), 5, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = CHARCOAL; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText(values[k].toFixed(decimals) + unit, px(k), py(values[k]) - 9);
      ctx.fillStyle = MUTED; ctx.textBaseline = "top";
      ctx.fillText(String(labels[k]), px(k), H - padB + 8);
    }
  }

  // Horizontal bars, longest first. opts: { unit, decimals, color }
  function hbarChart(canvas, labels, values, opts) {
    opts = opts || {};
    var rowH = 34;
    var height = Math.max(120, values.length * rowH + 30);
    var g = setup(canvas, height);
    var ctx = g.ctx, W = g.width, H = g.height;
    var padL = 150, padR = 56, padT = 8, padB = 8;
    var plotW = W - padL - padR;
    var max = niceMax(values);
    var decimals = opts.decimals == null ? 0 : opts.decimals;
    var unit = opts.unit || "%";
    ctx.font = "12px -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    for (var j = 0; j < values.length; j++) {
      var y = padT + j * rowH + 6;
      var w = (values[j] / max) * plotW;
      ctx.fillStyle = CHARCOAL; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(String(labels[j]), padL - 8, y + 9);
      ctx.fillStyle = j === 0 ? TEAL : SEAFOAM;
      ctx.fillRect(padL, y, Math.max(w, 1), 18);
      ctx.fillStyle = CHARCOAL; ctx.textAlign = "left";
      ctx.fillText(values[j].toFixed(decimals) + unit, padL + w + 6, y + 9);
    }
  }

  return { barChart: barChart, lineChart: lineChart, hbarChart: hbarChart };
})();
