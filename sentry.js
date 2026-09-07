(function (w) {
  if (w.__sableSentryBoot) return;
  w.__sableSentryBoot = true;
  var page = "staff";
  var queue = [];
  var started = false;
  var sdk = null;

  function scrubText(s) {
    s = String(s == null ? "" : s);
    s = s.replace(/(password|passwd|passcode|pin)\s*[:=]\s*\S+/gi, "$1=[redacted]");
    s = s.replace(/\b(?:\+?27|0)\s*\d[\d\s-]{7,12}\d\b/g, "[phone]");
    s = s.replace(/\b\d{9,16}\b/g, "[number]");
    return s.length > 400 ? s.slice(0, 400) : s;
  }

  function scrubObj(obj, depth) {
    if (!obj || typeof obj !== "object" || depth > 3) return obj;
    if (Array.isArray(obj)) {
      return obj.slice(0, 12).map(function (x) {
        return typeof x === "string" ? scrubText(x) : scrubObj(x, depth + 1);
      });
    }
    var out = {};
    Object.keys(obj).forEach(function (k) {
      var lk = String(k).toLowerCase();
      if (/pass|secret|token|auth|account|phone|bank|branch|card|pin|proof/.test(lk)) {
        out[k] = "[redacted]";
        return;
      }
      var v = obj[k];
      if (typeof v === "string") out[k] = scrubText(v);
      else if (v && typeof v === "object") out[k] = scrubObj(v, depth + 1);
      else out[k] = v;
    });
    return out;
  }

  function pageOf(explicit) {
    if (explicit === "staff" || explicit === "want" || explicit === "track") return explicit;
    var p = String((w.location && w.location.pathname) || "").toLowerCase();
    if (/want|enquire|lookbook|book|client|ask|order/.test(p)) return "want";
    if (p.indexOf("track") >= 0) return "track";
    return "staff";
  }

  function releaseOf() {
    try {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        var src = String(scripts[i].src || "");
        var m = src.match(/sable-desk-js@([0-9a-f]{7,40})/i);
        if (m) return "sable-desk@" + m[1].slice(0, 7);
      }
    } catch (e) {}
    return "sable-desk";
  }

  function onError(ev) {
    try { queue.push({ kind: "error", ev: ev }); } catch (e) {}
    flush();
  }
  function onRej(ev) {
    try { queue.push({ kind: "unhandledrejection", ev: ev }); } catch (e) {}
    flush();
  }

  try {
    w.addEventListener("error", onError);
    w.addEventListener("unhandledrejection", onRej);
  } catch (e) {}

  function send(item) {
    if (!sdk) return;
    try {
      if (item.kind === "error") {
        var ev = item.ev || {};
        var err = ev.error instanceof Error ? ev.error : new Error(scrubText(ev.message || "Script error"));
        sdk.captureException(err, { tags: { page: page } });
      } else if (item.kind === "unhandledrejection") {
        var r = item.ev && item.ev.reason;
        sdk.captureException(r instanceof Error ? r : new Error(scrubText(r)), { tags: { page: page } });
      }
    } catch (e) {}
  }

  function flush() {
    if (!sdk) return;
    var items = queue.splice(0, queue.length);
    items.forEach(send);
  }

  function loadSdk(done) {
    if (w.Sentry && w.Sentry.init) { done(w.Sentry); return; }
    var s = document.createElement("script");
    s.src = "https://browser.sentry-cdn.com/8.55.1/bundle.min.js";
    s.crossOrigin = "anonymous";
    s.onload = function () { done(w.Sentry || null); };
    s.onerror = function () { done(null); };
    (document.head || document.documentElement).appendChild(s);
  }

  function start() {
    fetch("/api/sentry", { credentials: "omit" })
      .then(function (r) { return r.json(); })
      .then(function (cfg) {
        var dsn = cfg && String(cfg.dsn || "").trim();
        if (!dsn) { queue.length = 0; return; }
        loadSdk(function (S) {
          if (!S || !S.init) { queue.length = 0; return; }
          try {
            S.init({
              dsn: dsn,
              release: releaseOf(),
              environment: "production",
              sendDefaultPii: false,
              tracesSampleRate: 0,
              beforeSend: function (event) {
                try {
                  if (event.message) event.message = scrubText(event.message);
                  if (event.exception && event.exception.values) {
                    event.exception.values.forEach(function (v) {
                      if (v && v.value) v.value = scrubText(v.value);
                    });
                  }
                  if (event.request) {
                    event.request.headers = {};
                    event.request.cookies = {};
                    event.request.data = undefined;
                    event.request.query_string = "";
                  }
                  event.user = undefined;
                  if (event.extra) event.extra = scrubObj(event.extra, 0);
                  if (!event.tags) event.tags = {};
                  event.tags.page = page;
                } catch (e) {}
                return event;
              },
              beforeBreadcrumb: function (crumb) {
                try {
                  if (!crumb) return null;
                  if (crumb.category === "console") return null;
                  if (crumb.message) crumb.message = scrubText(crumb.message);
                  if (crumb.data) crumb.data = scrubObj(crumb.data, 0);
                  if (crumb.category === "xhr" || crumb.category === "fetch" || crumb.category === "http") {
                    if (crumb.data && crumb.data.url) crumb.data.url = String(crumb.data.url).split("?")[0];
                  }
                  return crumb;
                } catch (e) { return null; }
              }
            });
            S.setTag("page", page);
            sdk = S;
            try {
              w.removeEventListener("error", onError);
              w.removeEventListener("unhandledrejection", onRej);
            } catch (e) {}
            flush();
          } catch (e) { queue.length = 0; }
        });
      })
      .catch(function () { queue.length = 0; });
  }

  w.sableSentry = function (p) {
    try {
      page = pageOf(p);
      if (sdk) {
        try { sdk.setTag("page", page); } catch (e) {}
        return;
      }
      if (started) return;
      started = true;
      start();
    } catch (e) {}
  };
})(window);
