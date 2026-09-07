module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  const dsn = String(process.env.SENTRY_DSN || "").trim();
  res.status(200).json({ on: !!dsn, dsn: dsn || "" });
};
