// Nusantara Numbers — tiny static server for local testing and screenshots only.
// Serves app/ at http://localhost:8080 (use --port <n> for another port).
// Not part of the entry: the site itself needs no server beyond any static host.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("./app", import.meta.url)));
const port = Number(process.argv.find((a) => a.startsWith("--port="))?.split("=")[1] ?? 8080);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  const file = normalize(join(root, urlPath === "/" ? "index.html" : urlPath));
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found\n");
    return;
  }
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Nusantara Numbers serving app/ at http://localhost:${port}`);
});
