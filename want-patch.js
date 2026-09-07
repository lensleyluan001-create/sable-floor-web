(function () {
  if (typeof extraFix !== "function" || typeof drawExtras !== "function") return;

  const KINDS = ["Initials", "Name", "Logo"];
  const PLACES = ["Heel", "Quarter", "Vamp"];
  const PLACE_STYLE = {
    Heel: "bottom:12%;left:50%;transform:translateX(-50%)",
    Quarter: "top:48%;right:12%",
    Vamp: "top:52%;left:50%;transform:translateX(-50%)"
  };

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
    if (kind === "logo") return "Laser: logo on " + place + " (outside, quoted)";
    if (!text) return "Laser: " + kind + " on " + place + " (outside, quoted)";
    return "Laser: " + kind + ' "' + text + '" on ' + place + " (outside, quoted)";
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
      '<p class="meta">Laser — outside only</p>' +
      '<p class="hint">Heel, quarter, or vamp. We confirm the mark, then the beam writes it into the grain. Quoted.</p>' +
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
      btn.textContent = "Laser · quoted";
      btn.onclick = function () {
        extras.laser = !extras.laser;
        if (typeof drawHero === "function") drawHero();
        drawExtras();
      };
      row.appendChild(btn);
    } else if (row) {
      const btn = row.querySelector('[data-ex="laser"]');
      if (btn) btn.classList.toggle("on", !!extras.laser);
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
    if (hint) hint.textContent = "Laces and stitching are R50 each. Laser is quoted, outside only. Custom depends on the work. Written on the order, not drawn on the listed rand.";
  };

  const _drawGrid = drawGrid;
  drawGrid = function () {
    _drawGrid();
    document.querySelectorAll("#grid .cat").forEach(function (sec) {
      if (!sec.querySelector(".swipe-hint")) {
        const h = sec.querySelector("h2");
        if (h) {
          const s = document.createElement("p");
          s.className = "swipe-hint";
          s.textContent = "Swipe";
          h.insertAdjacentElement("afterend", s);
        }
      }
      const shelf = sec.querySelector(".shelf");
      if (shelf) bindDrag(shelf);
    });
  };

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
      if (Math.abs(dx) > 6) moved = true;
      el.scrollLeft = left - dx;
    });
    function end() {
      if (!on) return;
      on = false;
      const kids = Array.prototype.slice.call(el.children);
      if (!kids.length) return;
      const target = kids.reduce(function (best, node) {
        return Math.abs(node.offsetLeft - el.scrollLeft) < Math.abs(best - el.scrollLeft) ? node.offsetLeft : best;
      }, kids[0].offsetLeft);
      el.scrollTo({ left: target, behavior: "smooth" });
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("click", function (e) {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
    }, true);
  }

  const sub = document.querySelector("header .sub");
  if (sub) {
    sub.textContent = "Ninety-two pairs, cut and lasted by us. Swipe the photos. Open a pair, spin it, pick UK size and hide, extras if you want them. Laser sits on the outside if you want a mark. Add it to the order — then another last, or the same one again. Name and WhatsApp at the end. We reply on WhatsApp with the listed rand. No card on this page.";
  }

  if (typeof draw === "function") draw(false);
})();
