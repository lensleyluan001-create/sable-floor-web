const SEED = [];

const store = globalThis.__sableLeads || { leads: [] };
globalThis.__sableLeads = store;
if (!store.leads.length && SEED.length) {
  store.leads = SEED.slice();
}

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function id() {
  return "ld-" + Math.random().toString(36).slice(2, 10);
}

function matchSellerLite(name) {
  const q = String(name || "").trim().toLowerCase();
  if (!q) return null;
  if (q === "wian" || q.indexOf("wian") === 0) return "wian";
  if (q === "luan" || q.indexOf("luan") === 0) return "luan";
  if (q === "dylan" || q.indexOf("dylan") === 0) return "dylan";
  return null;
}

function deskReady(b, newId) {
  const now = Date.now();
  const salesman = String(b.salesman || "").trim();
  const own = String(b.owner || "").trim().toLowerCase();
  const owner = own === "wian" || own === "luan" || own === "dylan" ? own : matchSellerLite(salesman);
  const src = String(b.source || "website").trim() || "website";
  const lead = Object.assign({}, b, {
    id: newId,
    name: String(b.name || "").trim(),
    phone: String(b.phone || "").trim(),
    source: src,
    status: b.status || "new",
    paid: !!b.paid,
    salesman: salesman,
    owner: owner || null,
    nextAction: String(b.nextAction || "").trim() || (String(b.status || "new") === "new" ? "Send the first WhatsApp" : ""),
    nextActionAt: b.nextActionAt == null ? null : b.nextActionAt,
    sitAt: b.sitAt || now,
    createdAt: b.createdAt || now,
    updatedAt: b.updatedAt || now,
    delivery: b.delivery || "collect",
    deliveryFee: Number(b.deliveryFee || 0) || 0,
    proofUrl: b.proofUrl || "",
    proofAt: b.proofAt || null,
    proofBy: String(b.proofBy || ""),
    proofStatus: String(b.proofStatus || ""),
    trackStage: (function () {
      const t = String(b.trackStage || "").trim().toLowerCase();
      return t === "ready" || t === "dispatch" ? t : "";
    })()
  });
  if (Array.isArray(b.items) && b.items.length) lead.items = b.items;
  return lead;
}

function queryOf(req) {
  if (req.query && typeof req.query === "object") return req.query;
  const u = String(req.url || "");
  const i = u.indexOf("?");
  if (i < 0) return {};
  const out = {};
  String(u.slice(i + 1)).split("&").forEach(function (p) {
    const kv = p.split("=");
    const k = decodeURIComponent((kv[0] || "").replace(/\+/g, " "));
    if (!k) return;
    out[k] = decodeURIComponent((kv[1] || "").replace(/\+/g, " "));
  });
  return out;
}

function findLead(token) {
  const t = String(token || "").trim();
  if (!t) return null;
  const low = t.toLowerCase();
  return (store.leads || []).find(function (l) {
    if (!l) return false;
    if (String(l.id) === t || String(l.id).toLowerCase() === low) return true;
    const ref = String(l.invRef || "");
    return !!ref && ref.toLowerCase() === low;
  }) || null;
}

function itemsLite(l) {
  if (Array.isArray(l.items) && l.items.length) return l.items;
  return [{ sku: l.sku, look: l.look, size: l.size, qty: l.qty || 1 }];
}

function needsSizeLite(l) {
  return itemsLite(l).some(function (it) { return !String(it.size || ""); });
}

function hasProofLite(l) {
  if (String(l.proofStatus || "") === "rejected") return false;
  return !!String(l.proofUrl || "").trim();
}

function publicOrder(l) {
  if (!l || !l.id) return null;
  const items = itemsLite(l).map(function (it) {
    return {
      sku: String(it.sku || ""),
      look: String(it.look || ""),
      size: String(it.size || ""),
      qty: Math.max(1, Number(it.qty || 1) || 1)
    };
  }).filter(function (it) { return it.sku || it.look; });
  const qty = items.reduce(function (n, it) { return n + it.qty; }, 0) || 1;
  const send = l.delivery === "local" || l.delivery === "int";
  const raw = String(l.trackStage || "").trim().toLowerCase();
  let flag = raw === "ready" || raw === "collect" ? "ready" : raw === "dispatch" || raw === "sent" || raw === "delivery" ? "dispatch" : "";
  const na = String(l.nextAction || "");
  if (!flag && /out for delivery|dispatched|on the way|sent with courier/i.test(na)) flag = "dispatch";
  if (!flag && /ready for collect|ready to collect|ready for collection/i.test(na)) flag = "ready";
  const lost = String(l.status || "") === "lost";
  const closedPaid = String(l.status || "") === "closed" && !!l.paid;
  const paid = !!l.paid;
  const st = String(l.status || "new");
  const fresh = st === "new" || st === "inbox";
  const sized = !needsSizeLite(l);
  const invoiced = !!String(l.invRef || "").trim() || hasProofLite(l) || /invoice|eft|pay/i.test(na);
  const received = ((fresh || (st === "contacted" && !sized)) && !invoiced && !paid && !flag && !closedPaid) ? "now" : "done";
  let making = "wait";
  if (received === "now") making = "wait";
  else if (closedPaid || paid || flag || invoiced) making = "done";
  else if (!fresh || sized) making = "now";
  let payment = "wait";
  const payNow = (invoiced || hasProofLite(l)) && !paid;
  if (paid) payment = "done";
  else if (payNow) payment = "now";
  if (making === "now" && !payNow && !paid) payment = "wait";
  let ready = "wait";
  if (closedPaid) ready = "done";
  else if (flag && paid) ready = "now";
  const finished = closedPaid ? "done" : "wait";
  const payLabel = paid ? "Payment received" : "Waiting for payment";
  const readyLabel = send ? "Out for delivery" : "Ready for collect";
  const steps = [
    { id: "received", label: "Order received", state: received },
    { id: "making", label: qty > 1 ? "Making your pairs" : "Making your pair", state: lost ? "wait" : making },
    { id: "payment", label: payLabel, state: lost ? "wait" : payment },
    { id: "ready", label: readyLabel, state: lost ? "wait" : ready },
    { id: "done", label: "Done", state: lost ? "wait" : finished }
  ];
  if (lost) steps[0].state = "done";
  let headline = "Your Sable order.";
  if (lost) headline = "This order is no longer going ahead.";
  else if (closedPaid) headline = "Done.";
  else if (ready === "now") headline = readyLabel + ".";
  else if (paid) headline = "Payment received. We will tell you when it is ready.";
  else if (payment === "now") headline = "Waiting for payment.";
  else if (making === "now") headline = qty > 1 ? "We are making your pairs." : "We are making your pair.";
  else headline = "We have your order.";
  return {
    name: String(l.name || "").trim().split(/\s+/)[0] || "Your order",
    items: items,
    delivery: send ? "send" : "collect",
    collect: !send,
    lost: lost,
    steps: steps,
    headline: headline
  };
}

const SB_URL = String(process.env.SUPABASE_URL || "https://aemzogcqxzomjcrrkscc.supabase.co").replace(/\/+$/, "");
const SB_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const skipCol = { leads: {}, meetings: {}, team_bank: {} };

function cloudOn() {
  return !!SB_KEY;
}

function toIso(v) {
  if (v == null || v === "") return null;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v;
  const n = Number(v);
  if (!n) return null;
  const d = new Date(n);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function toMs(v) {
  if (v == null || v === "") return Date.now();
  if (typeof v === "number" && isFinite(v)) return v;
  const t = Date.parse(String(v));
  return isNaN(t) ? Date.now() : t;
}

function sellerOf(v) {
  const q = String(v || "").trim().toLowerCase();
  return q === "luan" || q === "dylan" || q === "wian" ? q : null;
}

function slimProof(url, id) {
  const u = String(url || "");
  if (u.indexOf("data:") === 0) return id ? "proof:" + id : "";
  return u;
}

function leadToRow(l) {
  l = l && typeof l === "object" ? l : {};
  const id = String(l.id || "").trim();
  if (!id) return null;
  return {
    id: id,
    name: String(l.name || "").trim(),
    phone: String(l.phone || "").trim(),
    sku: String(l.sku || ""),
    look: String(l.look || ""),
    size: String(l.size || ""),
    qty: Math.max(1, Number(l.qty || 1) || 1),
    source: String(l.source || "whatsapp"),
    status: String(l.status || "new"),
    note: String(l.note || ""),
    owner: sellerOf(l.owner),
    salesman: String(l.salesman || ""),
    paid: !!l.paid,
    paid_amount: Number(l.paidAmount || 0) || 0,
    delivery: String(l.delivery || "collect"),
    delivery_fee: Number(l.deliveryFee || 0) || 0,
    colour: String(l.colour || "book"),
    listed_price: l.listedPrice == null || l.listedPrice === "" ? null : Number(l.listedPrice),
    inv_ref: String(l.invRef || ""),
    next_action: String(l.nextAction || ""),
    next_action_at: toIso(l.nextActionAt),
    proof_url: slimProof(l.proofUrl, id),
    proof_at: toIso(l.proofAt),
    proof_by: String(l.proofBy || ""),
    proof_status: String(l.proofStatus || ""),
    track_stage: String(l.trackStage || ""),
    items: Array.isArray(l.items) ? l.items : [],
    extras: l.extras && typeof l.extras === "object" ? l.extras : {},
    created_at: toIso(l.createdAt) || new Date().toISOString(),
    updated_at: toIso(l.updatedAt) || new Date().toISOString(),
    sit_at: toIso(l.sitAt)
  };
}

function leadFromRow(r) {
  r = r && typeof r === "object" ? r : {};
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    sku: r.sku,
    look: r.look,
    size: r.size,
    qty: r.qty,
    source: r.source,
    status: r.status,
    note: r.note,
    owner: r.owner,
    salesman: r.salesman,
    paid: !!r.paid,
    paidAmount: Number(r.paid_amount || r.paidAmount || 0) || 0,
    delivery: r.delivery,
    deliveryFee: Number(r.delivery_fee || r.deliveryFee || 0) || 0,
    colour: r.colour,
    listedPrice: r.listed_price == null ? r.listedPrice : r.listed_price,
    invRef: r.inv_ref || r.invRef || "",
    nextAction: r.next_action || r.nextAction || "",
    nextActionAt: r.next_action_at || r.nextActionAt || null,
    proofUrl: r.proof_url || r.proofUrl || "",
    proofAt: r.proof_at || r.proofAt || null,
    proofBy: r.proof_by || r.proofBy || "",
    proofStatus: r.proof_status || r.proofStatus || "",
    trackStage: r.track_stage || r.trackStage || "",
    items: r.items,
    extras: r.extras,
    createdAt: toMs(r.created_at || r.createdAt),
    updatedAt: toMs(r.updated_at || r.updatedAt),
    sitAt: toMs(r.sit_at || r.sitAt || r.updated_at || r.updatedAt)
  };
}

function meetToRow(m) {
  m = m && typeof m === "object" ? m : {};
  const id = String(m.id || "").trim();
  if (!id) return null;
  return {
    id: id,
    title: String(m.title || ""),
    with_name: String(m.withName || m.with_name || ""),
    at: m.at || new Date().toISOString(),
    note: String(m.note || ""),
    owner: sellerOf(m.owner)
  };
}

function meetFromRow(r) {
  r = r && typeof r === "object" ? r : {};
  return {
    id: r.id,
    title: r.title || "",
    withName: r.with_name || r.withName || "",
    at: r.at,
    note: r.note || "",
    owner: r.owner || ""
  };
}

function bankToRow(b) {
  b = b && typeof b === "object" ? b : {};
  return {
    id: "house",
    bank_name: String(b.bank || b.bank_name || ""),
    account_name: String(b.accountName || b.account_name || ""),
    account_number: String(b.accountNumber || b.account_number || ""),
    branch_code: String(b.branch || b.branch_code || ""),
    updated_at: toIso(b.updatedAt) || new Date().toISOString()
  };
}

function bankFromRow(r) {
  r = r && typeof r === "object" ? r : {};
  return {
    bank: r.bank_name || r.bank || "",
    accountName: r.account_name || r.accountName || "",
    accountNumber: r.account_number || r.accountNumber || "",
    branch: r.branch_code || r.branch || "",
    type: r.type || r.account_type || "Cheque",
    updatedAt: toMs(r.updated_at || r.updatedAt)
  };
}

function dropSkip(table, row) {
  const skip = skipCol[table] || {};
  const out = {};
  Object.keys(row || {}).forEach(function (k) {
    if (!skip[k]) out[k] = row[k];
  });
  return out;
}

async function sb(method, path, body) {
  if (!cloudOn()) return { __offline: true };
  const headers = {
    apikey: SB_KEY,
    Authorization: "Bearer " + SB_KEY,
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  if (method === "POST" || method === "PATCH") headers.Prefer = "resolution=merge-duplicates,return=representation";
  if (method === "GET") headers.Prefer = "count=exact";
  const opts = { method: method, headers: headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(SB_URL + "/rest/v1/" + path, opts);
  const text = await r.text();
  if (!text) return r.ok ? [] : { code: "http", message: "empty " + r.status };
  try { return JSON.parse(text); } catch (e) { return { code: "parse", message: text.slice(0, 200) }; }
}

async function upsertRows(table, rows) {
  const list = (rows || []).map(function (r) { return dropSkip(table, r); }).filter(Boolean);
  if (!list.length) return { ok: true, n: 0 };
  for (let i = 0; i < 20; i++) {
    const data = await sb("POST", table + "?on_conflict=id", list);
    if (data && data.__offline) return data;
    if (data && data.code === "PGRST204") {
      const m = String(data.message || "").match(/'([^']+)' column/);
      if (m && m[1]) {
        skipCol[table][m[1]] = true;
        list.forEach(function (row) { delete row[m[1]]; });
        continue;
      }
    }
    if (data && data.code) return { ok: false, error: data.message || data.code };
    return { ok: true, n: Array.isArray(data) ? data.length : list.length, rows: data };
  }
  return { ok: false, error: "column map failed" };
}

async function fetchTable(table) {
  const data = await sb("GET", table + "?select=*&limit=1000");
  if (data && data.__offline) return null;
  if (data && data.code) return [];
  return Array.isArray(data) ? data : [];
}

async function bookOf() {
  if (!cloudOn()) {
    return { cloud: false, leads: store.leads.slice(), meetings: [], bank: {}, imported: (store.leads || []).length > 0 };
  }
  const [leads, meetings, banks] = await Promise.all([
    fetchTable("leads"),
    fetchTable("meetings"),
    fetchTable("team_bank")
  ]);
  const bankRow = (banks || []).find(function (r) { return r && (r.id === "house" || r.id === "team"); }) || (banks || [])[0] || null;
  return {
    cloud: true,
    leads: (leads || []).map(leadFromRow),
    meetings: (meetings || []).map(meetFromRow),
    bank: bankRow ? bankFromRow(bankRow) : {},
    imported: (leads || []).length > 0
  };
}

async function findCloudLead(token) {
  const t = String(token || "").trim();
  if (!t || !cloudOn()) return null;
  const low = t.toLowerCase().replace(/'/g, "");
  let rows = await sb("GET", "leads?id=eq." + encodeURIComponent(t) + "&select=*&limit=1");
  if (Array.isArray(rows) && rows[0]) return leadFromRow(rows[0]);
  rows = await sb("GET", "leads?inv_ref=eq." + encodeURIComponent(t) + "&select=*&limit=1");
  if (Array.isArray(rows) && rows[0]) return leadFromRow(rows[0]);
  rows = await sb("GET", "leads?inv_ref=ilike." + encodeURIComponent(t) + "&select=*&limit=1");
  if (Array.isArray(rows) && rows[0]) return leadFromRow(rows[0]);
  const all = await fetchTable("leads");
  const hit = (all || []).find(function (r) {
    return String(r.id || "").toLowerCase() === low || String(r.inv_ref || "").toLowerCase() === low;
  });
  return hit ? leadFromRow(hit) : null;
}

async function upsertLeads(list) {
  const rows = (list || []).map(leadToRow).filter(Boolean);
  return upsertRows("leads", rows);
}

async function upsertMeetings(list) {
  const rows = (list || []).map(meetToRow).filter(Boolean);
  return upsertRows("meetings", rows);
}

async function upsertBank(bank) {
  if (!bank || typeof bank !== "object") return { ok: true };
  return upsertRows("team_bank", [bankToRow(bank)]);
}

async function deleteMeeting(id) {
  const mid = String(id || "").trim();
  if (!mid || !cloudOn()) return { ok: false };
  await sb("DELETE", "meetings?id=eq." + encodeURIComponent(mid));
  return { ok: true };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  try {
    if (req.method === "GET") {
      const q = queryOf(req);
      const token = String(q.t || q.track || "").trim();
      if (token) {
        let hit = null;
        if (cloudOn()) hit = await findCloudLead(token);
        if (!hit) hit = findLead(token);
        res.status(200).json({ ok: !!hit, order: hit ? publicOrder(hit) : null });
        return;
      }
      const id = String(q.id || q.proof || "").trim();
      const ref = String(q.ref || "").trim();
      const book = await bookOf();
      let leads = book.leads;
      if (!leads.length && !book.cloud) leads = store.leads;
      if (id) leads = leads.filter((l) => l && l.id === id);
      else if (ref) leads = leads.filter((l) => l && String(l.invRef || "") === ref);
      res.status(200).json({
        leads: leads,
        meetings: id || ref ? undefined : book.meetings,
        bank: id || ref ? undefined : book.bank,
        cloud: book.cloud,
        imported: book.imported
      });
      return;
    }
    if (req.method === "POST") {
      const b = readBody(req);
      const name = String(b.name || "").trim();
      const phone = String(b.phone || "").trim();
      if (!name || !phone) {
        res.status(400).json({ ok: false, error: "name and phone required" });
        return;
      }
      const lead = deskReady(Object.assign({}, b, { name, phone }), id());
      store.leads.unshift(lead);
      if (store.leads.length > 400) store.leads.length = 400;
      if (cloudOn()) await upsertLeads([lead]);
      res.status(201).json({ ok: true, lead: lead });
      return;
    }
    if (req.method === "PATCH") {
      const b = readBody(req);
      if (!b || !b.id) {
        res.status(400).json({ ok: false });
        return;
      }
      const i = store.leads.findIndex((l) => l.id === b.id);
      if (i >= 0) store.leads[i] = Object.assign({}, store.leads[i], b, { id: store.leads[i].id });
      const lead = i >= 0 ? store.leads[i] : b;
      if (cloudOn()) await upsertLeads([lead]);
      res.status(200).json({ ok: true, lead: lead });
      return;
    }
    if (req.method === "PUT") {
      const b = readBody(req);
      if (b && b.deleteMeeting) {
        const out = await deleteMeeting(b.deleteMeeting);
        res.status(200).json(out);
        return;
      }
      if (Array.isArray(b.leads) && b.leads.length) {
        const byId = new Map();
        store.leads.forEach((l) => { if (l && l.id) byId.set(l.id, l); });
        b.leads.forEach((raw) => {
          if (!raw || !raw.id) return;
          const prev = byId.get(raw.id);
          if (!prev) { byId.set(raw.id, raw); return; }
          const pt = Number(prev.updatedAt || prev.createdAt || 0);
          const nt = Number(raw.updatedAt || raw.createdAt || 0);
          byId.set(raw.id, nt >= pt ? Object.assign({}, prev, raw) : Object.assign({}, raw, prev));
        });
        store.leads = Array.from(byId.values());
        if (store.leads.length > 400) store.leads.length = 400;
        if (cloudOn()) {
          if (b.import) {
            const existing = await fetchTable("leads");
            if (existing && existing.length) {
              res.status(200).json({ ok: true, n: existing.length, imported: true, skipped: true });
              return;
            }
          }
          await upsertLeads(b.leads);
        }
      }
      if (Array.isArray(b.meetings) && cloudOn()) await upsertMeetings(b.meetings);
      if (b.bank && typeof b.bank === "object" && cloudOn()) await upsertBank(b.bank);
      res.status(200).json({ ok: true, n: (store.leads || []).length, cloud: cloudOn() });
      return;
    }
    if (req.method === "DELETE") {
      const q = queryOf(req);
      const mid = String(q.meet || q.meeting || "").trim();
      if (mid) {
        res.status(200).json(await deleteMeeting(mid));
        return;
      }
      res.status(400).json({ ok: false });
      return;
    }
    res.status(405).json({ ok: false });
  } catch (err) {
    res.status(500).json({ ok: false, error: "book error" });
  }
};

module.exports.leadToRow = leadToRow;
module.exports.leadFromRow = leadFromRow;
module.exports.meetToRow = meetToRow;
module.exports.bankToRow = bankToRow;
module.exports.bankFromRow = bankFromRow;
module.exports.publicOrder = publicOrder;
