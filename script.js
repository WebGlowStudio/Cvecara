(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  var toggleLabel = toggle ? toggle.querySelector(".sr-only") : null;

  function syncHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
    header.classList.toggle("is-stuck", window.scrollY > 4);
  }

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (toggleLabel) toggleLabel.textContent = open ? "Zatvori meni" : "Otvori meni";
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 981) setMenu(false);
      syncHeaderHeight();
    });
  }

  syncHeaderHeight();
  window.addEventListener("scroll", syncHeaderHeight, { passive: true });

  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  var FLOWERS = [
    { id: "ruza", name: "ruže", one: "ruža", price: 280 },
    { id: "tulipan", name: "tulipani", one: "tulipan", price: 190 },
    { id: "bozur", name: "božuri", one: "božur", price: 520 },
    { id: "gerber", name: "gerberi", one: "gerber", price: 220 },
    { id: "lala", name: "lale", one: "lala", price: 210 }
  ];
  var WRAP_FEE = 450;
  var WRAPS = {
    krem: { fill: "#f3ead8", ribbon: "#6e8664" },
    zalfija: { fill: "#b7c7aa", ribbon: "#2c4536" },
    bozur: { fill: "#f0d2cd", ribbon: "#8d4e55" },
    suma: { fill: "#2f4a3c", ribbon: "#e7d7c3" },
    lila: { fill: "#ddd0e6", ribbon: "#6d5a82" }
  };
  var SLOTS = [
    { x: 160, y: 86, s: 1.05 },
    { x: 116, y: 112, s: 0.92 },
    { x: 206, y: 108, s: 0.96 },
    { x: 78, y: 158, s: 0.8 },
    { x: 244, y: 154, s: 0.82 },
    { x: 132, y: 154, s: 0.9 },
    { x: 190, y: 160, s: 0.9 },
    { x: 160, y: 128, s: 0.76 },
    { x: 104, y: 196, s: 0.78 },
    { x: 218, y: 194, s: 0.78 }
  ];
  var LEAVES = [
    { x: 92, y: 196, r: -50, s: 1 },
    { x: 232, y: 188, r: 140, s: 1.05 },
    { x: 68, y: 236, r: -80, s: 0.85 },
    { x: 252, y: 230, r: 110, s: 0.9 },
    { x: 122, y: 292, r: -18, s: 0.72 },
    { x: 204, y: 298, r: 196, s: 0.7 }
  ];

  var qty = { ruza: 3, tulipan: 0, bozur: 2, gerber: 0, lala: 2 };
  var wrapId = "krem";
  var svgNS = "http://www.w3.org/2000/svg";
  var leavesLayer = document.getElementById("bouquetLeaves");
  var leavesFront = document.getElementById("bouquetLeavesFront");
  var stemsLayer = document.getElementById("bouquetStems");
  var bloomsLayer = document.getElementById("bouquetBlooms");
  var wrapShape = document.getElementById("wrapShape");
  var wrapRibbon = document.getElementById("wrapRibbon");
  var bouquetTitle = document.getElementById("bouquetTitle");
  var sumFlowers = document.querySelector("[data-sum-flowers]");
  var sumWrap = document.querySelector("[data-sum-wrap]");
  var sumTotal = document.querySelector("[data-sum-total]");
  var emptyNote = document.querySelector("[data-empty]");
  var capNote = document.querySelector("[data-cap]");
  var live = document.getElementById("builder-live");
  var status = document.querySelector("[data-builder-status]");

  function rsd(amount) {
    var text = String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return text + " RSD";
  }

  function flowerById(id) {
    return FLOWERS.filter(function (flower) {
      return flower.id === id;
    })[0];
  }

  function stemCount() {
    return FLOWERS.reduce(function (sum, flower) {
      return sum + (qty[flower.id] || 0);
    }, 0);
  }

  function money() {
    var flowers = FLOWERS.reduce(function (sum, flower) {
      return sum + (qty[flower.id] || 0) * flower.price;
    }, 0);
    var wrap = stemCount() > 0 ? WRAP_FEE : 0;
    return { flowers: flowers, wrap: wrap, total: flowers + wrap };
  }

  function visualIds() {
    var entries = FLOWERS.map(function (flower) {
      return { id: flower.id, n: qty[flower.id] || 0 };
    }).filter(function (entry) {
      return entry.n > 0;
    });
    var total = entries.reduce(function (sum, entry) {
      return sum + entry.n;
    }, 0);
    if (!total) return [];
    var cap = Math.min(total, SLOTS.length);
    var parts = entries.map(function (entry) {
      var exact = (entry.n / total) * cap;
      return { id: entry.id, n: Math.floor(exact), frac: exact - Math.floor(exact), raw: entry.n };
    });
    var used = parts.reduce(function (sum, part) {
      return sum + part.n;
    }, 0);
    var order = parts.slice().sort(function (a, b) {
      return b.frac - a.frac || b.raw - a.raw;
    });
    var index = 0;
    while (used < cap && order.length) {
      order[index % order.length].n += 1;
      used += 1;
      index += 1;
    }
    var groups = {};
    parts.forEach(function (part) {
      groups[part.id] = part.n;
    });
    var keys = parts.map(function (part) {
      return part.id;
    });
    var mixed = [];
    var added = true;
    while (added) {
      added = false;
      keys.forEach(function (key) {
        if (groups[key] > 0) {
          mixed.push(key);
          groups[key] -= 1;
          added = true;
        }
      });
    }
    return mixed;
  }

  function clearGroup(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function addUse(parent, id, transform) {
    var group = document.createElementNS(svgNS, "g");
    group.setAttribute("transform", transform);
    var use = document.createElementNS(svgNS, "use");
    use.setAttribute("href", "#" + id);
    group.appendChild(use);
    parent.appendChild(group);
  }

  function summaryLine() {
    var bits = FLOWERS.filter(function (flower) {
      return qty[flower.id] > 0;
    }).map(function (flower) {
      return qty[flower.id] + "× " + flower.name;
    });
    var wrapName = document.querySelector('input[name="papir"]:checked');
    var paper = wrapName ? wrapName.getAttribute("data-name") : "krem";
    if (!bits.length) return "";
    return "Primer buketa: " + bits.join(", ") + ". Papir: " + paper + ". Primer cene: " + rsd(money().total) + ".";
  }

  function renderBouquet() {
    if (!bloomsLayer) return;
    var ids = visualIds();
    var count = stemCount();
    clearGroup(leavesLayer);
    clearGroup(leavesFront);
    clearGroup(stemsLayer);
    clearGroup(bloomsLayer);

    var colors = WRAPS[wrapId] || WRAPS.krem;
    if (wrapShape) wrapShape.setAttribute("fill", colors.fill);
    if (wrapRibbon) wrapRibbon.setAttribute("fill", colors.ribbon);

    if (emptyNote) emptyNote.hidden = count > 0;
    if (capNote) capNote.hidden = count <= SLOTS.length;

    if (count > 0) {
      LEAVES.forEach(function (leaf, index) {
        addUse(
          index < 4 ? leavesLayer : leavesFront,
          "bloom-list",
          "translate(" + leaf.x + " " + leaf.y + ") rotate(" + leaf.r + ") scale(" + leaf.s + ")"
        );
      });
      ids.forEach(function (id, index) {
        var slot = SLOTS[index];
        var rot = ((index * 47) % 36) - 18;
        var line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", slot.x);
        line.setAttribute("y1", slot.y + 10);
        line.setAttribute("x2", 160);
        line.setAttribute("y2", 292);
        line.setAttribute("stroke", "#3e5c46");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-linecap", "round");
        stemsLayer.appendChild(line);
        addUse(
          bloomsLayer,
          "bloom-" + id,
          "translate(" + slot.x + " " + slot.y + ") rotate(" + rot + ") scale(" + slot.s + ")"
        );
      });
      if (count >= 3) {
        [[148, 146], [176, 138], [138, 176], [188, 168], [154, 186]].forEach(function (dot) {
          var circle = document.createElementNS(svgNS, "circle");
          circle.setAttribute("cx", dot[0]);
          circle.setAttribute("cy", dot[1]);
          circle.setAttribute("r", "2.2");
          circle.setAttribute("fill", "#f7f4ee");
          circle.setAttribute("stroke", "#d9d3c6");
          circle.setAttribute("stroke-width", "0.6");
          bloomsLayer.appendChild(circle);
        });
      }
    }

    var bill = money();
    if (sumFlowers) sumFlowers.textContent = rsd(bill.flowers);
    if (sumWrap) sumWrap.textContent = rsd(bill.wrap);
    if (sumTotal) sumTotal.textContent = rsd(bill.total);

    document.querySelectorAll("[data-flower]").forEach(function (row) {
      var id = row.getAttribute("data-flower");
      var countNode = row.querySelector("[data-count]");
      var flower = flowerById(id);
      var n = qty[id] || 0;
      if (countNode) countNode.textContent = String(n);
      var minus = row.querySelector('[data-dir="-1"]');
      var plus = row.querySelector('[data-dir="1"]');
      if (minus) minus.disabled = n <= 0;
      if (plus) plus.disabled = n >= 12;
      var stepper = row.querySelector(".stepper");
      if (stepper && flower) stepper.setAttribute("aria-label", flower.name + ", trenutno " + n);
    });

    if (bouquetTitle) {
      bouquetTitle.textContent = count
        ? "Ilustrovani buket. " + summaryLine()
        : "Prazan ilustrovani buket. Dodajte cveće.";
    }
    if (live) {
      live.textContent = count
        ? summaryLine() + " Cene su primer."
        : "Buket je prazan. Cene su primer.";
    }
  }

  document.querySelectorAll("[data-flower]").forEach(function (row) {
    var id = row.getAttribute("data-flower");
    row.querySelectorAll("button").forEach(function (button) {
      button.addEventListener("click", function () {
        var dir = Number(button.getAttribute("data-dir"));
        var next = (qty[id] || 0) + dir;
        if (next < 0 || next > 12) return;
        qty[id] = next;
        if (status) status.textContent = "";
        renderBouquet();
      });
    });
  });

  document.querySelectorAll('input[name="papir"]').forEach(function (input) {
    input.addEventListener("change", function () {
      if (!input.checked) return;
      wrapId = input.value;
      if (status) status.textContent = "";
      renderBouquet();
    });
  });

  var useBouquet = document.getElementById("use-bouquet");
  var noteField = document.getElementById("napomena");
  if (useBouquet && noteField) {
    useBouquet.addEventListener("click", function () {
      var line = summaryLine();
      if (!line) {
        if (status) status.textContent = "Prvo dodajte bar jedno cveće.";
        return;
      }
      noteField.value = line;
      if (status) status.textContent = "Upisano u porudžbinu ispod.";
      var form = document.getElementById("porudzbina");
      if (form) {
        form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    });
  }

  renderBouquet();

  var form = document.getElementById("order-form");
  var confirmBox = document.getElementById("order-confirm");
  var confirmText = document.querySelector("[data-confirm-text]");
  var resetBtn = document.getElementById("confirm-reset");

  function showError(name, message) {
    var field = document.getElementById(name);
    var error = document.querySelector('[data-error-for="' + name + '"]');
    if (field) field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) {
      error.hidden = !message;
      error.textContent = message || "";
    }
  }

  if (form && confirmBox) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.ime.value.trim();
      var phone = form.telefon.value.trim();
      var digits = phone.replace(/\D/g, "");
      var valid = true;

      if (name.length < 2) {
        showError("ime", "Unesite ime, molimo.");
        valid = false;
      } else {
        showError("ime", "");
      }

      if (digits.length < 6 || digits.length > 15) {
        showError("telefon", "Unesite broj telefona, da znamo kome da se javimo.");
        valid = false;
      } else {
        showError("telefon", "");
      }

      if (!valid) {
        var firstInvalid = form.querySelector("[aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (confirmText) {
        confirmText.textContent =
          "Hvala vam, " +
          name +
          ". Ovo je demo potvrda — porudžbina nije poslata i podaci nisu sačuvani.";
      }
      form.hidden = true;
      confirmBox.hidden = false;
      confirmBox.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  }

  if (resetBtn && form && confirmBox) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      showError("ime", "");
      showError("telefon", "");
      if (noteField && summaryLine()) noteField.value = summaryLine();
      confirmBox.hidden = true;
      form.hidden = false;
      var nameInput = document.getElementById("ime");
      if (nameInput) nameInput.focus();
    });
  }
})();
