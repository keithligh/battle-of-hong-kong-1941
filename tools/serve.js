// Minimal static file server for running the Battle of Hong Kong app locally.
// Real map tiles must be loaded over http (same-origin); file:// will not work.
// Usage: node tools/serve.js   then open http://localhost:5050
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const port = process.env.PORT || 5050;
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8",
  ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".mp3":"audio/mpeg" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const fp = path.join(root, p);
  const rel = path.relative(root, fp); if (rel.startsWith("..") || path.isAbsolute(rel)) { res.writeHead(403); res.end("forbidden"); return; }
  fs.readFile(fp, (e, data) => {
    if (e) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": types[path.extname(fp)] || "application/octet-stream",
      "cache-control": "no-store, must-revalidate" });
    res.end(data);
  });
}).listen(port, () => console.log("serving " + root + " on http://localhost:" + port));
