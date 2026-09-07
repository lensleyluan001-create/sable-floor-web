const PIN = {
  "catalog.js": "https://raw.githubusercontent.com/lensleyluan001-create/sable-floor-web/main/catalog.js",
  "golf-tone.js": "https://raw.githubusercontent.com/lensleyluan001-create/sable-floor-web/main/golf-tone.js",
  "want-app.js": "https://raw.githubusercontent.com/lensleyluan001-create/sable-floor-web/main/want-app.js",
  "want-patch.js": "https://raw.githubusercontent.com/lensleyluan001-create/sable-floor-web/main/want-patch.js",
  "want.css": "https://raw.githubusercontent.com/lensleyluan001-create/sable-floor-web/main/want.css",
  "sentry.js": "https://raw.githubusercontent.com/lensleyluan001-create/sable-floor-web/main/sentry.js"
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  const raw = String((req.query && (req.query.f || req.query.file)) || "");
  const f = raw.split("/").pop().replace(/[^a-z0-9._-]/gi, "");
  const src = PIN[f];
  if (!src) {
    res.statusCode = 404;
    res.end("missing");
    return;
  }
  const r = await fetch(src, { cache: "no-store" });
  const body = await r.text();
  if (!r.ok || body.length < 40) {
    res.statusCode = 502;
    res.end("upstream");
    return;
  }
  res.setHeader(
    "content-type",
    (f.endsWith(".css") ? "text/css" : "application/javascript") + "; charset=utf-8"
  );
  res.setHeader("cache-control", "public, max-age=300");
  res.end(body);
};
