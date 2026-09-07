(function () {
  if (typeof extraFix !== "function" || typeof drawExtras !== "function") return;

  const KINDS = ["Initials", "Name", "Logo"];
  const PLACES = ["Heel", "Quarter", "Vamp"];
  const PLACE_STYLE = {
    Heel: "bottom:12%;left:50%;transform:translateX(-50%)",
    Quarter: "top:48%;right:12%",
    Vamp: "top:52%;left:50%;transform:translateX(-50%)"
  };
  const UK_EU = { "3": "35.5", "4": "37", "5": "38", "6": "39", "7": "41", "8": "42", "9": "43", "10": "44.5", "11": "46", "12": "47", "13": "48.5" };
  const GROUPS = [
    { id: "", label: "All", looks: null },
    { id: "Vellies", label: "Vellies", looks: ["Vellie", "Wool-lined vellie"] },
    { id: "Golfers", label: "Golfers", looks: ["Golfer"] },
    { id: "Boots", label: "Boots", looks: ["Chelsea", "Hiking boot", "Combat boot", "Zip boot", "Wool-lined boot"] },
    { id: "Derbies", label: "Derbies", looks: ["Derby", "Loafer"] },
    { id: "Sandals", label: "Sandals", looks: ["Sandal", "Thong"] },
    { id: "Kids", label: "Kids", looks: ["Kids vellie", "Kids derby"] }
  ];
  window.__shopGroup = window.__shopGroup || "";

  function displayLook(look) {
    if (look === "Thong") return "Sandal";
    if (look === "Wool-lined boot") return "Wool boot";
    if (look === "Wool-lined slipper") return "Wool slipper";
    if (look === "Wool-lined vellie") return "Wool vellie";
    return look || "";
  }

  const _extraFix = extraFix;
  extraFix = function (e) {
    const src = e && typeof e === "object" ? e : {};
    const x = _extraFix(src);
    x.laserKind = KINDS.indexOf(src.laserKind) >= 0 ? src.laserKind : "Initials";
    x.laserText = String(src.laserText || "").slice(0, x.laserKind === "Initials" ? 4 : 16);
    x.laserPlace = PLACES.indexOf(src.laserPlace) >= 0 ? src.laserPlace : "Heel";
    return x;
  };

  extraSum = function (e, qty) {
    e = extraFix(e);
    qty = Number(qty || 1) || 1;
    let n = 0;
    if (e.laser) n += EXTRA_FEE;
    if (e.laces) n += EXTRA_FEE;
    if (e.stitch) n += EXTRA_FEE;
    n += e.customFee;
    return n * qty;
  };

  extraBits = function (e) {
    e = extraFix(e);
    const bits = [];
    if (e.laser) bits.push(laserLine(e));
    if (e.laces) bits.push("Laces " + ((LACE_COLS.find(function (x) { return x[0] === e.laceColour; }) || [e.laceColour, e.laceColour])[1]));
    if (e.stitch) bits.push("Stitch " + ((STITCH_COLS.find(function (x) { return x[0] === e.stitchColour; }) || [e.stitchColour, e.stitchColour])[1]));
    if (e.custom) bits.push("Custom");
    return bits;
  };

  extraLabel = function (e) {
    return extraBits(e).join(" · ");
  };

  function laserLine(e) {
    const place = String(e.laserPlace || "Heel").toLowerCase();
    const kind = String(e.laserKind || "Initials").toLowerCase();
    const text = String(e.laserText || "").trim();
    if (kind === "logo") return "Laser: logo on " + place + " (outside, R50)";
    if (!text) return "Laser: " + kind + " on " + place + " (outside, R50)";
    return "Laser: " + kind + ' "' + text + '" on ' + place + " (outside, R50)";
  }

  function laserPreview(e) {
    if (e.laserKind === "Logo") return "LOGO";
    const text = String(e.laserText || "").trim();
    if (text) return text.slice(0, 16);
    return e.laserKind === "Name" ? "NAME" : "LL";
  }

  const _extraPaint = typeof extraPaint === "function" ? extraPaint : function () { return ""; };
  extraPaint = function (p, extras, viewI) {
    extras = extraFix(extras);
    let html = _extraPaint(p, extras, viewI);
    if (!extras.laser) return html;
    const burn = laserPreview(extras);
    const place = PLACE_STYLE[extras.laserPlace] || PLACE_STYLE.Heel;
    html += '<span class="laser-scan" aria-hidden="true"></span>';
    html += '<p class="laser-burn" style="' + place + '" aria-hidden="true">' + burn + "</p>";
    return html;
  };

  const _packLine = packLine;
  packLine = function () {
    const keep = extraFix(extras);
    const line = _packLine();
    extras.laser = keep.laser;
    extras.laserKind = keep.laserKind;
    extras.laserText = keep.laserText;
    extras.laserPlace = keep.laserPlace;
    if (!line) return null;
    line.extras = extraFix(Object.assign({}, line.extras, keep));
    return line;
  };

  function ensureLaserPanel() {
    if (document.getElementById("ex-laser")) return;
    const host = document.getElementById("ex-custom");
    if (!host || !host.parentNode) return;
    const box = document.createElement("div");
    box.id = "ex-laser";
    box.hidden = true;
    box.innerHTML =
      '<p class="meta">Laser — R50, outside only</p>' +
      '<p class="hint">Heel, quarter, or vamp. Initials and a name are R50. A logo we confirm before we burn.</p>' +
      '<label>The mark</label><div class="chips" id="laser-kinds" style="padding:0;max-width:none"></div>' +
      '<div id="laser-text-wrap"><label id="laser-text-label">Initials</label>' +
      '<input id="laser-text" maxlength="4" placeholder="LL" autocomplete="off" /></div>' +
      '<p id="laser-logo-note" class="meta" hidden>Send the logo on WhatsApp after the order. Vector if you have it.</p>' +
      '<label>On the outside</label><div class="chips" id="laser-places" style="padding:0;max-width:none"></div>';
    host.insertAdjacentElement("afterend", box);
    const input = document.getElementById("laser-text");
    if (input) {
      input.addEventListener("input", function () {
        extras.laser = true;
        extras.laserKind = extras.laserKind || "Initials";
        extras.laserText = String(this.value || "").slice(0, extras.laserKind === "Initials" ? 4 : 16);
        if (typeof drawHero === "function") drawHero();
      });
    }
  }

  const _drawExtras = drawExtras;
  drawExtras = function () {
    _drawExtras();
    ensureLaserPanel();
    extras = extraFix(extras);
    const row = document.getElementById("exrow");
    if (row && !row.querySelector('[data-ex="laser"]')) {
      const btn = document.createElement("button");
      btn.className = "chip" + (extras.laser ? " on" : "");
      btn.type = "button";
      btn.setAttribute("data-ex", "laser");
      btn.textContent = "Laser · R50";
      btn.onclick = function () {
        extras.laser = !extras.laser;
        if (typeof drawHero === "function") drawHero();
        drawExtras();
      };
      row.appendChild(btn);
    } else if (row) {
      const btn = row.querySelector('[data-ex="laser"]');
      if (btn) {
        btn.classList.toggle("on", !!extras.laser);
        btn.textContent = "Laser · R50";
      }
    }
    const panel = document.getElementById("ex-laser");
    if (panel) panel.hidden = !extras.laser;
    const kinds = document.getElementById("laser-kinds");
    if (kinds) {
      kinds.innerHTML = KINDS.map(function (k) {
        return '<button class="chip ' + (extras.laserKind === k ? "on" : "") + '" type="button" data-lk="' + k + '">' + k + "</button>";
      }).join("");
      kinds.querySelectorAll("[data-lk]").forEach(function (b) {
        b.onclick = function () {
          extras.laser = true;
          extras.laserKind = b.getAttribute("data-lk") || "Initials";
          extras.laserText = String(extras.laserText || "").slice(0, extras.laserKind === "Initials" ? 4 : 16);
          const input = document.getElementById("laser-text");
          if (input) {
            input.maxLength = extras.laserKind === "Initials" ? 4 : 16;
            input.placeholder = extras.laserKind === "Initials" ? "LL" : "As you say it";
            input.value = extras.laserText;
          }
          if (typeof drawHero === "function") drawHero();
          drawExtras();
        };
      });
    }
    const wrap = document.getElementById("laser-text-wrap");
    const logoNote = document.getElementById("laser-logo-note");
    const label = document.getElementById("laser-text-label");
    if (wrap) wrap.hidden = extras.laserKind === "Logo";
    if (logoNote) logoNote.hidden = extras.laserKind !== "Logo";
    if (label) label.textContent = extras.laserKind === "Name" ? "Name" : "Initials";
    const places = document.getElementById("laser-places");
    if (places) {
      places.innerHTML = PLACES.map(function (p) {
        return '<button class="chip ' + (extras.laserPlace === p ? "on" : "") + '" type="button" data-lp="' + p + '">' + p + "</button>";
      }).join("");
      places.querySelectorAll("[data-lp]").forEach(function (b) {
        b.onclick = function () {
          extras.laser = true;
          extras.laserPlace = b.getAttribute("data-lp") || "Heel";
          if (typeof drawHero === "function") drawHero();
          drawExtras();
        };
      });
    }
    const hint = document.querySelector(".extra-hint");
    if (hint) hint.textContent = "Laser, laces and stitching are R50 each. Custom is quoted. Written on the order.";
  };

  if (typeof drawTypes === "function") {
    drawTypes = function () {
      const box = document.getElementById("types");
      if (!box) return;
      box.innerHTML = GROUPS.map(function (g) {
        return '<button class="chip ' + (window.__shopGroup === g.id ? "on" : "") + '" type="button" data-g="' + g.id + '">' + g.label + "</button>";
      }).join("");
      box.querySelectorAll("[data-g]").forEach(function (b) {
        b.onclick = function () {
          window.__shopGroup = b.getAttribute("data-g") || "";
          type = "";
          if (typeof draw === "function") draw();
        };
      });
    };
  }

  const _drawGrid = drawGrid;
  drawGrid = function () {
    _drawGrid();
    const group = GROUPS.find(function (g) { return g.id === window.__shopGroup; });
    const allow = group && group.looks;
    document.querySelectorAll("#grid .cat").forEach(function (sec) {
      const h = sec.querySelector("h2");
      const name = h ? String(h.textContent || "") : "";
      if (allow && allow.indexOf(name) < 0) sec.remove();
      else if (h) h.textContent = displayLook(name);
    });
    document.querySelectorAll("#grid .tile").forEach(function (tile) {
      const stock = tile.querySelector(".stock");
      const meta = tile.querySelector(".meta");
      if (!stock || !meta) return;
      const sku = String(stock.textContent || "").replace(/Custom|Two-tone/g, "").trim();
      const look = String(meta.textContent || "").split(" ·")[0];
      stock.textContent = displayLook(look);
      meta.textContent = "No. " + sku;
    });
    document.querySelectorAll("#grid .cat").forEach(function (sec) {
      if (!sec.querySelector(".swipe-hint")) {
        const h = sec.querySelector("h2");
        if (h) {
          const s = document.createElement("p");
          s.className = "swipe-hint";
          s.textContent = "Swipe the pairs";
          h.insertAdjacentElement("afterend", s);
        }
      }
      const shelf = sec.querySelector(".shelf");
      if (shelf) bindDrag(shelf);
    });
  };

  if (typeof drawHero === "function") {
    const _drawHero = drawHero;
    drawHero = function () {
      _drawHero();
      const img = document.querySelector("#hero .turn img");
      if (img) {
        img.classList.remove("hide-tan", "hide-brown", "hide-dark", "hide-black", "hide-olive");
        if (hide && hide !== "book" && String(hide).indexOf("tt:") !== 0) {
          const cls = hide === "dark" ? "hide-dark" : "hide-" + hide;
          img.classList.add(cls);
        }
      }
      const stock = document.querySelector("#hero .stock");
      const meta = document.querySelector("#hero .meta");
      if (stock && meta && typeof selected === "function") {
        const p = selected();
        if (p) {
          const tags = stock.querySelectorAll(".nametag");
          stock.textContent = displayLook(p.look) + " ";
          tags.forEach(function (t) { stock.appendChild(t); });
          meta.textContent = "No. " + p.sku + (size ? " · UK " + size + (UK_EU[size] ? " / EU " + UK_EU[size] : "") : " · size open") + (hide && hide !== "book" && String(hide).indexOf("tt:") !== 0 ? " · " + hideName(hide) : "") + (extraLabel(extras) ? " · " + extraLabel(extras) : "");
        }
      }
      const hint = document.querySelector("#hero .hint");
      if (hint) {
        if (hide && hide !== "book" && String(hide).indexOf("tt:") !== 0) {
          hint.textContent = "Preview only — the photo is tinted. Final hide depends on the tannery.";
        } else {
          hint.textContent = "As photographed. Other hides tint the photo so you can see the idea.";
        }
      }
      document.querySelectorAll("#hero .hides .hide, #hero [data-whide]").forEach(function (b) {
        const id = b.getAttribute("data-whide") || b.getAttribute("data-hide") || "";
        if (!id || String(id).indexOf("tt:") === 0) return;
        const lab = typeof hideName === "function" ? hideName(id) : id;
        const sw = b.querySelector(".sw, .sw.duo, span");
        const keep = sw ? sw.cloneNode(true) : null;
        b.textContent = "";
        if (keep) b.appendChild(keep);
        b.appendChild(document.createTextNode(lab === "Book" ? "As photographed" : lab));
      });
    };
  }

  if (typeof drawSizes === "function") {
    const _drawSizes = drawSizes;
    drawSizes = function () {
      _drawSizes();
      const box = document.getElementById("sizes");
      if (!box) return;
      box.querySelectorAll("[data-size]").forEach(function (b) {
        const s = b.getAttribute("data-size") || "";
        if (!s) b.textContent = "Later";
        else b.textContent = UK_EU[s] ? "UK " + s + " · EU " + UK_EU[s] : "UK " + s;
      });
      if (!document.getElementById("size-guide")) {
        const p = document.createElement("p");
        p.id = "size-guide";
        p.className = "hint";
        p.textContent = "Sizes are UK. EU is next to each one. Between sizes? Take the larger.";
        box.insertAdjacentElement("afterend", p);
      }
    };
  }

  function bindDrag(el) {
    if (el.getAttribute("data-drag") === "1") return;
    el.setAttribute("data-drag", "1");
    let on = false, x = 0, left = 0, moved = false;
    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      on = true; x = e.clientX; left = el.scrollLeft; moved = false;
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });
    el.addEventListener("pointermove", function (e) {
      if (!on) return;
      const dx = e.clientX - x;
      if (Math.abs(dx) > 16) moved = true;
      el.scrollLeft = left - dx;
    });
    function end() {
      if (!on) return;
      on = false;
      const elDx = Math.abs(el.scrollLeft - left);
      if (elDx < 16) moved = false;
      const kids = Array.prototype.slice.call(el.children);
      if (!kids.length) return;
      const target = kids.reduce(function (best, node) {
        return Math.abs(node.offsetLeft - el.scrollLeft) < Math.abs(best.offsetLeft - el.scrollLeft) ? node : best;
      }, kids[0]);
      el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("click", function (e) {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
    }, true);
  }

  const h1 = document.querySelector("header h1");
  if (h1) h1.textContent = "Leather shoes. Yours to pick.";
  const sub = document.querySelector("header .sub");
  if (sub) {
    sub.textContent = "Tap a pair. Choose size. We WhatsApp you — then you pay once we confirm it. Most pairs leave 10–14 working days after EFT. Collect is free. Send in SA is R100.";
  }
  const help = document.querySelector(".need-help");
  if (help) help.textContent = "How an order works";
  const how = document.querySelector("header .how");
  if (how) {
    how.innerHTML = "<p><span>1</span> Pick the pair</p><p><span>2</span> Add more if you want</p><p><span>3</span> Send. We WhatsApp you</p>";
  }
  const addBtn = document.getElementById("add");
  if (addBtn) addBtn.textContent = "Add this pair";
  const more = document.getElementById("more");
  if (more) more.textContent = "Add another pair";
  const submit = document.querySelector("#want button[type=submit]");
  if (submit) submit.textContent = "Send to Sable";

  if (typeof hideChips === "function") {
    const _hideChips = hideChips;
    hideChips = function (on, attr) {
      return _hideChips(on, attr, false);
    };
  }

  if (typeof drawDels === "function") {
    const _drawDels = drawDels;
    drawDels = function () {
      _drawDels();
      const box = document.getElementById("dels");
      if (!box) return;
      const labels = { collect: "Collect · free", local: "Send in SA · R100", int: "Send abroad · R300" };
      box.querySelectorAll("[data-del]").forEach(function (b) {
        const id = b.getAttribute("data-del") || "";
        if (labels[id]) b.textContent = labels[id];
      });
    };
  }

  const addEl = document.getElementById("add");
  if (addEl) {
    addEl.onclick = function () {
      const it = packLine();
      if (!it) return;
      addLine(it);
      thanks = "";
      if (added) {
        added.hidden = false;
        added.textContent = bagCount() === 1
          ? "On the order. Add another pair, or send when you are ready."
          : "On the order · " + bagCount() + " pairs.";
      }
      screen = "pair";
      draw(true);
    };
  }

  if (typeof draw === "function") draw(false);
})();
