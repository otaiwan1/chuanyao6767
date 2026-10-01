// 傳耀的個人網站 — 純原生 JS，無依賴
(function () {
  "use strict";
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  // 年份
  $("#year").textContent = String(new Date().getFullYear());

  // 手機選單（含鍵盤 / Esc 關閉）
  var toggle = $(".nav-toggle");
  var nav = $("#site-nav");
  function setNav(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
  }
  toggle.addEventListener("click", function () { setNav(!nav.classList.contains("open")); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) { setNav(false); toggle.focus(); }
  });
  $$("#site-nav a").forEach(function (a) {
    a.addEventListener("click", function () { setNav(false); });
  });

  // 打字機（尊重減少動態）
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var words = ["whoami --show-off", "g++ -O2 main.cpp -o 67", "git push origin 67", "./demo --for 電神們"];
  var el = $("#typewriter"), wi = 0, ci = words[0].length, del = true;
  if (reduceMotion) {
    el.textContent = words[0];
  } else {
    setInterval(function () {
      var w = words[wi];
      if (del) { ci--; if (ci <= 0) { del = false; ci = 0; wi = (wi + 1) % words.length; } }
      else {
        var target = words[wi];
        ci++;
        el.textContent = target.slice(0, ci);
        if (ci >= target.length) { del = true; }
        return;
      }
      el.textContent = words[wi].slice(0, Math.max(ci, 0));
    }, 120);
  }

  // 程式碼頁籤（WAI-ARIA tabs + 左右鍵）
  var tabs = $$('[role="tab"]');
  var panels = { "tab-cpp": "panel-cpp", "tab-py": "panel-py", "tab-ts": "panel-ts" };
  var filenames = { "tab-cpp": "sixty_seven.cpp", "tab-py": "sixty_seven.py", "tab-ts": "sixtySeven.js" };
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(panels[t.id]).hidden = !on;
    });
    $("#code-filename").textContent = filenames[tab.id];
    $("#copy-status").textContent = "";
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t, false); });
    t.addEventListener("keydown", function (e) {
      var j = null;
      if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") j = (i + tabs.length - 1) % tabs.length;
      if (e.key === "Home") j = 0;
      if (e.key === "End") j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); selectTab(tabs[j], true); }
    });
  });

  function copyText(text, okMsg) {
    function done() {
      $("#copy-status").textContent = okMsg;
      toast(okMsg);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (e) { $("#copy-status").textContent = "複製失敗，請手動複製。"; }
      document.body.removeChild(ta);
    }
  }
  $("#copy-btn").addEventListener("click", function () {
    var active = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
    var code = document.getElementById(panels[active.id]).innerText;
    copyText(code, "已複製 " + filenames[active.id] + "！");
  });
  $("#copy-gh").addEventListener("click", function () {
    copyText("chuanyao67", "已複製 GitHub 帳號：chuanyao67");
  });

  // 67 連打器（localStorage）
  var KEY = "cy67-clicks";
  var count = parseInt(localStorage.getItem(KEY) || "0", 10) || 0;
  if (count > 6767) count = 6767;
  var countEl = $("#click-count"), clickMsg = $("#click-msg");
  function renderClick(msg) {
    countEl.textContent = String(Math.min(count, 67) === 67 && count > 67 ? 67 : count);
    if (count >= 67 && count < 6767) clickMsg.textContent = msg || "集滿 67！你是第 67 位電神。還可繼續挑戰 6767。";
    else if (count >= 6767) clickMsg.textContent = "6767 達成！可以去部署了。";
    else clickMsg.textContent = msg || "";
  }
  renderClick("");
  // 開場若已達標要顯示
  if (count >= 67) renderClick();
  $("#click-67").addEventListener("click", function () {
    count++;
    localStorage.setItem(KEY, String(count));
    renderClick(count === 67 ? "集滿 67！你是第 67 位電神。" : "");
  });
  $("#click-reset").addEventListener("click", function () {
    count = 0;
    localStorage.setItem(KEY, "0");
    renderClick("已歸零，67 等你回來。");
    $("#click-67").focus();
  });

  // 猜數字
  var answer = Math.floor(Math.random() * 100) + 1;
  var tries = 0;
  $("#guess-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = parseInt($("#guess-input").value, 10);
    var msg = $("#guess-msg");
    if (!(v >= 1 && v <= 100)) { msg.textContent = "請輸入 1–100 的整數。"; return; }
    tries++;
    if (v === answer) {
      msg.textContent = "答對了！答案就是 " + answer + "，共猜了 " + tries + " 次。" + (answer === 67 ? "（看吧，我就說是 67）" : "（這次居然不是 67，67 表示遺憾）");
    } else if (v < answer) {
      msg.textContent = "太小了（第 " + tries + " 猜）。再往 67 靠近一點？";
    } else {
      msg.textContent = "太大了（第 " + tries + " 猜）。往 67 回來一點？";
    }
  });

  // 假終端機
  var out = $("#term-out");
  function print(line) {
    var p = document.createElement("p");
    p.textContent = line;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
  }
  $("#term-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("#term-in");
    var cmd = input.value.trim().toLowerCase();
    print("$ " + input.value);
    if (!cmd) return;
    if (cmd === "help") print("可用指令：help / whoami / skills / 67 / clear");
    else if (cmd === "whoami") print("傳耀 — 67 號工程師，寫 code 給電神看。");
    else if (cmd === "skills") print("C++ 92 · Python 88 · TS 85 · Algo 90 · 系統 80 · a11y 87");
    else if (cmd === "67" || cmd === "sixty-seven") print("67 是質數。第 67 個質數是 331。很 67 吧。");
    else if (cmd === "clear") out.innerHTML = "";
    else print("未知指令：" + cmd + "（試試 help）");
    // 67 彩蛋計數
    var n = (parseInt(localStorage.getItem("cy67-shell") || "0", 10) || 0) + 1;
    localStorage.setItem("cy67-shell", String(n));
    input.value = "";
    input.focus();
  });

  // 快速留言 → mailto（無後端）
  $("#mail-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#m-name").value.trim();
    var message = $("#m-msg").value.trim();
    var subject = encodeURIComponent("來自個人網站的留言（" + name + "）");
    var body = encodeURIComponent(message + "\n\n— " + name);
    window.location.href = "mailto:hi@chuanyao67.dev?subject=" + subject + "&body=" + body;
    toast("已開啟郵件 App，記得按送出！");
  });

  // 連按 6 → 7 彩蛋
  var lastKey = "";
  document.addEventListener("keydown", function (e) {
    if (lastKey === "6" && e.key === "7") {
      toast("67！電神認證 +1");
      lastKey = "";
    } else {
      lastKey = e.key;
    }
  });

  // 本頁 67 計數（趣味統計）
  try {
    var html = document.documentElement.innerHTML;
    var hits = (html.match(/67/g) || []).length;
    $("#stat-67").textContent = hits + "+";
  } catch (e) { /* 忽略 */ }
})();
