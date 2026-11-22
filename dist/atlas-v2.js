"use strict";

const $ = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
const menu = $("#switcher");
let opener;

function showMenu(open, button) {
  menu.hidden = !open;
  for (const trigger of all("[data-menu]")) trigger.setAttribute("aria-expanded", String(open));
  if (!open) return;
  opener = button;
  const bar = button.closest(".menubar");
  menu.style.bottom = bar ? "auto" : "42px";
  menu.style.top = bar
    ? Math.max(0, Math.min(innerHeight - menu.offsetHeight - 6, button.getBoundingClientRect().bottom)) + "px"
    : "auto";
  menu.style.left = bar
    ? Math.max(0, Math.min(innerWidth - menu.offsetWidth - 4, button.getBoundingClientRect().left)) + "px"
    : "6px";
  (menu.querySelector("[aria-current]") || menu.querySelector("a")).focus();
}

for (const trigger of all("[data-menu]"))
  trigger.addEventListener("click", () => showMenu(menu.hidden, trigger));
document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-menu], #switcher")) showMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) {
    showMenu(false);
    opener.focus();
  }
});
function clock() {
  $("#clock").textContent = new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
clock();
setInterval(clock, 15000);

function setChoice(buttons, selected) {
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
}

if ($("#atlas-cards")) {
  const filters = all("[data-group-filter]");
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      const group = button.textContent;
      setChoice(filters, button);
      for (const item of all("[data-group]")) item.hidden = group !== "全部" && item.dataset.group !== group;
      $("#result-count").textContent = all(".atlas-card:not([hidden])").length + " 种版式";
    }),
  );
  const toggle = $(".view-switch");
  function showComparison(showTable) {
    $("#atlas-cards").hidden = showTable;
    $("#comparison").hidden = !showTable;
    toggle.textContent = showTable ? "返回缩略图" : "特性对照表";
    toggle.setAttribute("aria-pressed", String(showTable));
  }
  function readView() {
    showComparison(location.hash === "#compare");
  }
  toggle.addEventListener("click", () => {
    const url = new URL(location.href);
    url.hash = $("#comparison").hidden ? "compare" : "";
    history.pushState(null, "", url);
    readView();
  });
  window.addEventListener("popstate", readView);
  window.addEventListener("hashchange", readView);
  readView();
}

const viewer = $("#viewer");
const stampNames = ["海岸邮路", "山地邮路", "城市邮路"];
let stampIndex = 0;
let cancelled = false;
let zoomSource;
function view(src, title) {
  $("#full").src = src;
  $("#full").alt = title;
  $("#viewer-title").textContent = title;
  $("#caption").textContent = title;
  if (!viewer.open) viewer.showModal();
}
function zoom(button) {
  zoomSource = button;
  $("#change-stamp").hidden = true;
  view(button.querySelector("img").src, button.closest("figure").querySelector("figcaption").textContent);
}
all("[data-zoom]").forEach((button) => button.addEventListener("click", () => zoom(button)));
viewer.addEventListener("keydown", (event) => {
  if (!zoomSource || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  const buttons = all("[data-zoom]");
  const index =
    (buttons.indexOf(zoomSource) + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
  zoom(buttons[index]);
});
$("#close").addEventListener("click", () => viewer.close());

function displayStamp() {
  zoomSource = null;
  const button = $("#change-stamp");
  button.hidden = false;
  button.textContent = cancelled ? "查看新票" : "盖上邮戳";
  view(
    "assets/post-" + stampIndex + (cancelled ? "-alt" : "") + ".webp",
    stampNames[stampIndex - 1] + (cancelled ? " · 盖销票" : " · 新票"),
  );
}
all("[data-stamp]").forEach((button) =>
  button.addEventListener("click", () => {
    stampIndex = Number(button.dataset.stamp);
    cancelled = button.dataset.condition === "2";
    displayStamp();
  }),
);
$("#change-stamp").addEventListener("click", () => {
  cancelled = !cancelled;
  displayStamp();
});
const stampFilters = all("[data-stamp-filter]");
stampFilters.forEach((button) =>
  button.addEventListener("click", () => {
    setChoice(stampFilters, button);
    for (const card of all("[data-condition]"))
      card.hidden =
        button.dataset.stampFilter !== "0" && button.dataset.stampFilter !== card.dataset.condition;
    $("#stamp-count").textContent = all("[data-condition]:not([hidden])").length + " 枚票样";
  }),
);

$("#plan-picker")?.addEventListener("change", (event) => {
  const select = event.target;
  const name = select.selectedOptions[0].textContent;
  const path = "assets/plan-" + select.value;
  $(".axa").src = path + ".webp";
  $(".flat").src = path + "-alt.webp";
  $(".axa").alt = name + "轴测图";
  $(".flat").alt = name + "平面图";
  $("#plan-note").textContent = [
    "短翼贴在主屋侧面。左图能看出两翼等高，右图则能看清入口为什么藏在转角处。",
    "左右两翼伸向庭院。先在平面图上找到开口，再回到轴测图看两翼的高度。",
    "三层体量逐层退后。平面图上套叠的矩形，在轴测图里变成三道台地。",
  ][select.selectedIndex];
});
$("#glaze")?.addEventListener("change", (event) => {
  $("#test-glazes").hidden = !event.target.checked;
});

const tracks = all(".track");
tracks.forEach((button, index) =>
  button.addEventListener("click", () => {
    const audio = $("audio");
    if (button.getAttribute("aria-pressed") === "true") return;
    const playing = !audio.paused;
    setChoice(tracks, button);
    const title = ["Echo Buffer", "Sync Drift", "Dawn Carrier"][index];
    $("#song").textContent = title;
    $("#tempo").textContent = [96, 114, 80][index] + " BPM";
    $(".disc").src = "assets/disc" + (index + 1) + ".png";
    $(".disc").alt = title + " 虹彩光盘";
    $("#listen-note").textContent = [
      "留意低音后的空拍。高处的八音循环再绕回来时，像给同一段街灯换了一个角度。",
      "一层细碎的琶音紧贴鼓点，低音偶尔错开半步。试着只听下面那条线。",
      "旋律放慢后，每粒音的尾巴都听得更清楚。等最后一个和弦消散，再倒回开头。",
    ][index];
    audio.src = "assets/track" + (index + 1) + ".mp3";
    if (playing)
      audio.play().catch(() => {
        /* Native controls remain available. */
      });
  }),
);

if ($("#sky-picker")) {
  const charts = [
    {
      xy: [
        [222, 180],
        [277, 259],
        [345, 177],
        [403, 256],
        [476, 164],
      ],
      notes: [
        "从折线左端起步。视线顺着第一段向右下方移动，到达第一个转折。",
        "低处的转折把视线送往中央的峰顶。",
        "中央高点连接左右两段折线。遮住连线，试着向两边各找到一颗邻星。",
        "第二个低谷。与 B 点并置时，双折线的节奏最明显。",
        "折线右端。从这里倒着走一遍，仍能认出五点的轮廓。",
      ],
    },
    {
      xy: [
        [279, 175],
        [352, 222],
        [437, 280],
        [391, 147],
        [301, 300],
      ],
      notes: [
        "从这端沿长轴寻找交会点。",
        "十字骨架在这里相交，可以选择继续直行或转向侧翼。",
        "长轴的另一端与中央点保持对角关系。",
        "一侧翼尖从中心向右上方伸出。",
        "另一侧翼尖落在中心的左下方。",
      ],
    },
    {
      xy: [
        [282, 151],
        [334, 213],
        [391, 192],
        [440, 273],
        [377, 292],
      ],
      notes: [
        "单独伸出的亮点，是进入小四边形的起点。",
        "外伸的亮点在这里接上四边形。",
        "循着四边形的上边找到第二个角。",
        "右侧转角把视线引回较低的一条边。",
        "沿最后一条边回到 B 点，轮廓就闭合了。",
      ],
    },
  ];
  let selected = 0;
  const pins = all(".pin");
  function chart() {
    const picker = $("#sky-picker");
    const current = charts[picker.selectedIndex];
    const lines = $("#lines").checked;
    $(".sky-img").src = "assets/night-" + picker.value + (lines ? "" : "-alt") + ".webp";
    $(".sky-img").alt = picker.selectedOptions[0].textContent + (lines ? "连线示意图" : "裸星示意图");
    pins.forEach((pin, i) => {
      pin.style.left = (current.xy[i][0] / 720) * 100 + "%";
      pin.style.top = (current.xy[i][1] / 480) * 100 + "%";
    });
    setChoice(pins, pins[selected]);
    $("#pin-name").textContent = "星点 " + pins[selected].textContent;
    $("#pin-note").textContent = current.notes[selected];
  }
  pins.forEach((pin, i) =>
    pin.addEventListener("click", () => {
      selected = i;
      chart();
    }),
  );
  $("#sky-picker").addEventListener("change", () => {
    selected = 0;
    chart();
  });
  $("#lines").addEventListener("change", chart);
}
