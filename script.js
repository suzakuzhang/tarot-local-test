let majorArcana = [];

const COPY = {
  subtitle: "借助塔罗的象征图像，陪你把心里那点说不清的东西理一理。",
  inputLabel: "写一句你现在最想问的",

  placeholders: {
    "感情": "你想知道的是对方怎么想，还是你自己还想不想继续？",
    "工作": "你真正舍不得放开的，是这份工作，还是那点稳定感？",
    "情绪": "你是累了，还是只是一直没停下来承认自己很累？",
    "自我成长": "是不知道怎么开始，还是迟迟不肯开始？"
  },

  helpSections: {
    ask: {
      title: "怎么问会更有用？",
      body: "牌最不擅长替你做决定，倒很擅长指出：你到底在意什么、回避什么、又为什么迟迟没动。问得越具体，回来的东西通常越有意思。"
    },
    repeat: {
      title: "为什么别反复追问同一件事？",
      body: "很多时候不是牌不清楚，是你心里那句没说出口的话还没准备好承认。同一个问题追太紧，反而容易把自己绕进去。"
    },
    orientation: {
      title: "正位 / 逆位怎么理解？",
      body: "别把正位当成“好”，逆位当成“坏”。逆位更像是在说：有些东西已经在动了，只是动得别扭、过头，或者还没走到明面上。"
    }
  },

  preDrawTips: [
    "扎人的通常不是牌，是你心里那句没说出口的话。",
    "别急着找答案，先看看你到底在回避什么。",
    "想好了就抽。直觉有时候比体面诚实。"
  ],

  chooseCardTip: "凭直觉选一张就好。",
  resultLead: "有些东西，牌比你先看见了。"
};

const questionTypeMap = {
  love: "感情",
  work: "工作",
  emotion: "情绪",
  growth: "自我成长"
};

const questionPlaceholderMap = {
  love: "比如：我现在该怎么改善这段关系的沟通？",
  work: "比如：我现在该怎么判断这个工作机会是否适合我？",
  emotion: "比如：我最近反复焦虑的核心原因是什么？",
  growth: "比如：我现在最需要调整的方向是什么？"
};

const shuffleBtn = document.getElementById("shuffleBtn");
const drawArea = document.getElementById("drawArea");
const cardBackButtons = document.querySelectorAll(".card-back");
const cardVisual = document.getElementById("cardVisual");
const emptyState = document.getElementById("emptyState");
const resultCard = document.getElementById("resultCard");
const orientationHelpToggle = document.getElementById("orientationHelpToggle");
const orientationHelpBox = document.getElementById("orientationHelpBox");
const subtitleEl = document.getElementById("subtitle") || document.querySelector(".subtitle");
const questionInputLabelEl = document.getElementById("question-input-label");
const questionInput = document.getElementById("question-input") || document.getElementById("questionText");
const helpToggle = document.getElementById("help-toggle") || document.getElementById("preHelpToggle");
const helpContent = document.getElementById("help-content") || document.getElementById("preHelpBox");
const preDrawTipEl = document.getElementById("pre-draw-tip");
const chooseCardTipEl = document.getElementById("choose-card-tip");
const resultLeadEl = document.getElementById("result-lead");
const loadingBoxEl = document.getElementById("loadingBox");
const loadingStateEl = document.getElementById("loadingState");
const loadingFactEl = document.getElementById("loadingFact");
const spiritEntryEl = document.getElementById("spiritEntry");
const spiritEnterBtn = document.getElementById("spiritEnterBtn");
const spiritPanelEl = document.getElementById("spiritPanel");
const spiritMessagesEl = document.getElementById("spiritMessages");
const spiritInputEl = document.getElementById("spiritInput");
const spiritSendBtn = document.getElementById("spiritSendBtn");
const spiritEndBtn = document.getElementById("spiritEndBtn");
const spiritTimerEl = document.getElementById("spiritTimer");
const spiritRoundsEl = document.getElementById("spiritRounds");
const spiritEntryHintEl = document.getElementById("spiritEntryHint");
const accessStatusTextEl = document.getElementById("accessStatusText");
const pilotEntryBtn = document.getElementById("pilotEntryBtn");
const accessModalEl = document.getElementById("accessModal");
const accessModalCloseBtn = document.getElementById("accessModalClose");
const accessModalMsgEl = document.getElementById("accessModalMsg");
const whitelistNameInputEl = document.getElementById("whitelistNameInput");
const whitelistBirthInputEl = document.getElementById("whitelistBirthInput");
const whitelistActivateBtn = document.getElementById("whitelistActivateBtn");
const accessInviteInputEl = document.getElementById("accessInviteInput");
const accessInviteActivateBtn = document.getElementById("accessInviteActivateBtn");
const adminCodeInputEl = document.getElementById("adminCodeInput");
const adminBirthInputEl = document.getElementById("adminBirthInput");
const adminActivateBtn = document.getElementById("adminActivateBtn");
const advancedPanelEl = document.getElementById("advancedPanel");
const stylePanelEl = document.getElementById("stylePanel");
const stylePresetSelectEl = document.getElementById("stylePresetSelect");
const saveStylePresetBtn = document.getElementById("saveStylePresetBtn");
const historyPanelEl = document.getElementById("historyPanel");
const lockedHistoryListEl = document.getElementById("lockedHistoryList");
const recentHistoryListEl = document.getElementById("recentHistoryList");
const adminPanelEl = document.getElementById("adminPanel");
const refreshWhitelistBtn = document.getElementById("refreshWhitelistBtn");
const adminWhitelistListEl = document.getElementById("adminWhitelistList");
const newInviteCodeInputEl = document.getElementById("newInviteCodeInput");
const createInviteCodeBtn = document.getElementById("createInviteCodeBtn");
const adminInviteListEl = document.getElementById("adminInviteList");

const MAX_DRAWS_PER_SESSION = 10;
const DRAW_COUNT_KEY = "tarot_draw_count";
const ACCESS_STATE_KEY = "tarot_access_state_v1";
const LOADING_STATES = [
  "正在整理牌面的线索……",
  "正在把你的问题放回这张牌里……",
  "正在生成解读……"
];
const LOADING_FACTS = {
  common: [
    "大阿卡纳更像阶段性的课题，不只是结果判断。",
    "塔罗不一定替你决定，但常会先照见卡点。",
    "同一张牌，放进不同问题里，重点会不一样。",
    "有些牌说的不是答案，而是你怎么看问题。",
    "很多时候，牌先照见的是你提问的方式。"
  ],

  reversed: [
    "逆位不等于坏，更像一种变化或转折。",
    "有些逆位不是否定，而是提醒你换个角度看。",
    "逆位常提示：过度、不足，或还没走顺。",
    "有些力量不是消失了，只是暂时卡住了。",
    "逆位更像线索，不必急着把它判成吉或凶。"
  ],

  byCard: {
    "愚者": [
      "愚者更像出发，不只是莽撞。",
      "这张牌和未知有关，也和轻盈有关。",
      "有时候，真正的新开始本来就没有完整地图。"
    ],
    "魔术师": [
      "魔术师常和主动性、调动资源有关。",
      "这张牌提醒的是：你手里未必什么都没有。",
      "魔术师更像把已有的东西真正用起来。"
    ],
    "女祭司": [
      "女祭司常和未说出口的直觉有关。",
      "有些答案不是没出现，只是还没被说成语言。",
      "这张牌往往偏内在，不急着往外推动。"
    ],
    "女皇": [
      "女皇不只讲丰盛，也讲滋养和承接。",
      "这张牌常和生长、照料、感受力有关。",
      "有些东西先被好好承接，才会慢慢长出来。"
    ],
    "皇帝": [
      "皇帝常和秩序、边界、掌控感有关。",
      "这张牌不只讲权威，也讲结构。",
      "有时候问题不在力量不够，而在边界没立稳。"
    ],
    "教皇": [
      "教皇常和规则、传统、共同认可有关。",
      "这张牌有时会提醒你：你参考的是谁的标准。",
      "它不只讲指导，也讲已有秩序的影响。"
    ],
    "恋人": [
      "恋人不只讲感情，也讲选择与一致。",
      "这张牌常会碰到价值观和真正想要什么。",
      "有些选择，看起来像二选一，其实是在问你更站哪边。"
    ],
    "战车": [
      "战车和推进有关，也和控制方向有关。",
      "这张牌不只是快，更重要的是不乱。",
      "有时候，真正的推进来自把分散的力收回来。"
    ],
    "力量": [
      "力量强调的通常不是压制，而是驾驭。",
      "这张牌和勇气有关，也和自制有关。",
      "有些真正的力量，看起来并不张扬。"
    ],
    "隐者": [
      "隐者不只是孤独，也和审慎有关。",
      "有些清楚，是拉开距离后才看见的。",
      "这张牌常常比起行动，更先强调看清。"
    ],
    "命运之轮": [
      "命运之轮常在提醒：变化已经开始。",
      "这张牌不只讲运气，也讲时机。",
      "有些局面不是你推不动，而是它本来就在转。"
    ],
    "正义": [
      "正义常和判断、对等、后果有关。",
      "这张牌会把情绪拉回更清楚的衡量里。",
      "有些问题最后要看的，不只是感受，还有是否合乎你心里的尺。"
    ],
    "倒吊人": [
      "倒吊人常和暂停、换角度、暂不推进有关。",
      "这张牌未必是在阻拦你，也可能是在逼你换个看法。",
      "有时候，停住不是浪费，而是为了看见之前看不到的东西。"
    ],
    "死神": [
      "死神多数时候指结束与转换，不是真的死亡。",
      "这张牌常常在说：有些阶段该过去了。",
      "不是所有失去都只是失去，有些也是腾位置。"
    ],
    "节制": [
      "节制和调和、适应、慢慢放回平衡有关。",
      "这张牌不急，重点常常在慢慢调准。",
      "有些问题不是立刻解决，而是先让失衡别继续扩大。"
    ],
    "恶魔": [
      "恶魔常和执念、束缚、上瘾式循环有关。",
      "这张牌有时会照见：你是怎么被某种东西牵住的。",
      "它不只是黑暗，也常和欲望、依附、难以抽身有关。"
    ],
    "高塔": [
      "高塔常和突发、崩塌、旧结构被打断有关。",
      "这张牌不是只讲坏事，也讲假的稳定撑不住了。",
      "有些震动不是为了摧毁，而是为了让你看见裂缝。"
    ],
    "星星": [
      "星星常和希望、修复、重新相信有关。",
      "这张牌比起热烈，更像一种安静的恢复。",
      "有些力量不是马上把你拉起来，而是先让你愿意继续。"
    ],
    "月亮": [
      "月亮常和不安、投射、模糊感有关。",
      "这张牌提醒的未必是危险，而是看不清时很容易自己补完。",
      "有些害怕来自外面，也有些来自心里还没说清的东西。"
    ],
    "太阳": [
      "太阳常和明朗、生命力、被看见有关。",
      "这张牌的重点往往是坦率，而不是复杂。",
      "有些事一旦被照亮，就不必再靠猜。"
    ],
    "审判": [
      "审判常和觉醒、召唤、重新面对有关。",
      "这张牌有时像一个提醒：该回头看清旧问题了。",
      "它不只是评判，也常和一次真正的回应有关。"
    ],
    "世界": [
      "世界常和完成、整合、阶段圆满有关。",
      "这张牌不只讲结束，也讲终于能把很多东西放回整体里。",
      "有些完成不是没有遗憾，而是终于走到了能收束的位置。"
    ]
  }
};

if (!shuffleBtn || !drawArea || !cardVisual || !emptyState || !resultCard) {
  console.warn("页面关键节点未找到：", {
    shuffleBtn,
    drawArea,
    cardVisual,
    emptyState,
    resultCard
  });
} else {

let pendingDrawCard = null;
let factTimer = null;
let loadingStateTimer1 = null;
let loadingStateTimer2 = null;
let loadingFactsPool = [...LOADING_FACTS.common];
let currentReadingContext = null;
let spiritSessionId = "";
let spiritExpiresAt = "";
let spiritRemainingRounds = 8;
let spiritActive = false;
let spiritTimerTask = null;

function defaultAccessState() {
  return {
    role: "normal",
    accessType: "normal",
    activated: false,
    userName: "",
    birthYearMonth: "",
    styleProfile: "旧版作者风格",
    accessToken: ""
  };
}

let accessState = defaultAccessState();

function loadAccessState() {
  try {
    const raw = localStorage.getItem(ACCESS_STATE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    accessState = {
      ...defaultAccessState(),
      ...parsed
    };
  } catch (_err) {
    accessState = defaultAccessState();
  }
}

function saveAccessState() {
  localStorage.setItem(ACCESS_STATE_KEY, JSON.stringify(accessState));
}

function canUseSpiritByRole(role) {
  return ["invite", "pilot", "admin"].includes(role);
}

function canUseStyleByRole(role) {
  return ["pilot", "admin"].includes(role);
}

function canUseHistoryByRole(role) {
  return ["pilot", "admin"].includes(role);
}

function applyAccessStateUI() {
  const role = accessState.role || "normal";
  if (accessStatusTextEl) {
    const textMap = {
      normal: "普通体验",
      invite: "邀请码体验",
      pilot: "先行者",
      admin: "管理员"
    };
    accessStatusTextEl.textContent = textMap[role] || "普通体验";
  }

  if (spiritEntryHintEl) {
    if (canUseSpiritByRole(role)) {
      spiritEntryHintEl.textContent = "这张牌还有话没有说完。你可直接开启 10 分钟延伸追问。";
    } else {
      spiritEntryHintEl.textContent = "这张牌还有话没有说完。需要先激活先行版，或填写邀请码体验完整流程。";
    }
  }

  if (advancedPanelEl) {
    const show = canUseStyleByRole(role) || canUseHistoryByRole(role) || role === "admin";
    advancedPanelEl.classList.toggle("hidden", !show);
  }
  if (stylePanelEl) {
    stylePanelEl.classList.toggle("hidden", !canUseStyleByRole(role));
  }
  if (historyPanelEl) {
    historyPanelEl.classList.toggle("hidden", !canUseHistoryByRole(role));
  }
  if (adminPanelEl) {
    adminPanelEl.classList.toggle("hidden", role !== "admin");
  }

  refreshDrawLimitUI();
}

function showAccessModalMsg(msg, isError = true) {
  if (!accessModalMsgEl) return;
  accessModalMsgEl.textContent = msg;
  accessModalMsgEl.classList.remove("hidden");
  accessModalMsgEl.style.color = isError ? "#b03131" : "#2e7d32";
}

function clearAccessModalMsg() {
  if (!accessModalMsgEl) return;
  accessModalMsgEl.textContent = "";
  accessModalMsgEl.classList.add("hidden");
}

async function activateAccess(mode, payload) {
  const resp = await fetch("/api/access/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, ...payload })
  });
  return parseApiJson(resp, "/api/access/activate");
}

async function refreshAccessStatus() {
  const token = (accessState.accessToken || "").trim();
  const url = token ? `/api/access/status?access_token=${encodeURIComponent(token)}` : "/api/access/status";
  const resp = await fetch(url, { method: "GET" });
  const data = await parseApiJson(resp, "/api/access/status");

  accessState = {
    ...accessState,
    role: data.role || "normal",
    accessType: data.accessType || "normal",
    activated: Boolean(data.activated),
    userName: data.userName || "",
    birthYearMonth: data.birthYearMonth || ""
  };

  if (!data.accessToken && !data.activated) {
    if (accessState.role === "normal") {
      accessState.accessToken = token || "";
    }
  }

  saveAccessState();
  applyAccessStateUI();
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (accessState.accessToken) {
    headers["X-Access-Token"] = accessState.accessToken;
  }
  return headers;
}

async function loadStyleProfile() {
  if (!canUseStyleByRole(accessState.role)) return;
  const resp = await fetch("/api/style-profile", { method: "GET", headers: authHeaders() });
  const data = await parseApiJson(resp, "/api/style-profile");
  accessState.styleProfile = data.preset || accessState.styleProfile;
  saveAccessState();
  if (stylePresetSelectEl) {
    stylePresetSelectEl.value = accessState.styleProfile;
  }
}

async function saveStyleProfilePreset(preset) {
  const resp = await fetch("/api/style-profile", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      preset,
      access_token: accessState.accessToken || ""
    })
  });
  return parseApiJson(resp, "/api/style-profile");
}

function renderHistoryList(targetEl, rows, lockLabel) {
  if (!targetEl) return;
  if (!rows || !rows.length) {
    targetEl.innerHTML = "<p class='meta'>暂无记录</p>";
    return;
  }

  targetEl.innerHTML = rows.map(item => {
    const question = (item.question || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const direction = (item.direction || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `
      <div class="history-item" data-reading-id="${item.reading_id}">
        <div class="meta">${direction} · ${item.created_at || ""}</div>
        <div>${question}</div>
        <button type="button" class="history-lock-btn" data-reading-id="${item.reading_id}" data-lock="${lockLabel === "上锁" ? "1" : "0"}">${lockLabel}</button>
      </div>
    `;
  }).join("");
}

async function loadHistory() {
  if (!canUseHistoryByRole(accessState.role)) return;
  const resp = await fetch("/api/history", { method: "GET", headers: authHeaders() });
  const data = await parseApiJson(resp, "/api/history");
  renderHistoryList(lockedHistoryListEl, data.locked || [], "解锁");
  renderHistoryList(recentHistoryListEl, data.recent || [], "上锁");
}

async function updateHistoryLock(readingId, isLocked) {
  const resp = await fetch("/api/history/lock", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      reading_id: readingId,
      is_locked: isLocked,
      access_token: accessState.accessToken || ""
    })
  });
  return parseApiJson(resp, "/api/history/lock");
}

async function loadAdminInviteCodes() {
  if (accessState.role !== "admin" || !adminInviteListEl) return;
  const resp = await fetch("/api/admin/invite-codes", { method: "GET", headers: authHeaders() });
  const data = await parseApiJson(resp, "/api/admin/invite-codes");
  const rows = data.items || [];
  if (!rows.length) {
    adminInviteListEl.innerHTML = "<p class='meta'>暂无邀请码</p>";
    return;
  }
  adminInviteListEl.innerHTML = rows.map(item => {
    const active = item.is_active ? "启用中" : "已停用";
    const nextState = item.is_active ? "停用" : "启用";
    return `
      <div class="history-item">
        <div class="meta">${item.code} · ${active}</div>
        <div>已用 ${item.used_count}/${item.max_uses}</div>
        <button type="button" class="invite-toggle-btn" data-code="${item.code}" data-next="${item.is_active ? "0" : "1"}">${nextState}</button>
      </div>
    `;
  }).join("");
}

async function loadAdminWhitelist() {
  if (accessState.role !== "admin" || !adminWhitelistListEl) return;
  const resp = await fetch("/api/admin/whitelist", { method: "GET", headers: authHeaders() });
  const data = await parseApiJson(resp, "/api/admin/whitelist");
  const rows = data.items || [];
  if (!rows.length) {
    adminWhitelistListEl.innerHTML = "<p class='meta'>暂无白名单配置</p>";
    return;
  }

  adminWhitelistListEl.innerHTML = rows.map(item => {
    const active = item.is_active ? "启用中" : "已停用";
    return `<div class="history-item"><div class="meta">${item.name_pinyin} · ${item.birth_year_month} · ${active}</div></div>`;
  }).join("");
}

function clearProgressTimers() {
  stopLoadingFactsRotation();
  stopLoadingStateRotation();
}

function showLoadingBox() {
  if (loadingBoxEl) loadingBoxEl.classList.remove("hidden");
}

function hideLoadingBox() {
  if (loadingBoxEl) loadingBoxEl.classList.add("hidden");
}

function resetLoadingUI() {
  clearProgressTimers();
  hideLoadingBox();
  if (loadingStateEl) loadingStateEl.textContent = "";
  if (loadingFactEl) loadingFactEl.textContent = "";
}

function toMicroFact(text) {
  if (!text) return "";
  let cleaned = String(text)
    .replace(/\s+/g, " ")
    .replace(/[“”"【】]/g, "")
    .trim();
  if (!cleaned) return "";
  cleaned = cleaned.split(/[。！？!?；;]/)[0].trim();
  if (cleaned.length > 24) cleaned = `${cleaned.slice(0, 24)}…`;
  if (cleaned.length < 6) return "";
  return cleaned;
}

function shuffleArray(arr) {
  const copied = [...arr];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function pickRange(arr, minCount, maxCount) {
  if (!arr || !arr.length) return [];
  const maxAllowed = Math.min(maxCount, arr.length);
  const minAllowed = Math.min(minCount, maxAllowed);
  const count = minAllowed + Math.floor(Math.random() * (maxAllowed - minAllowed + 1));
  return shuffleArray(arr).slice(0, count);
}

function startLoadingFactsRotation(facts) {
  if (!loadingFactEl || !facts || !facts.length) return;

  let index = 0;
  loadingFactEl.textContent = facts[index];

  stopLoadingFactsRotation();

  factTimer = setInterval(() => {
    index = (index + 1) % facts.length;
    loadingFactEl.textContent = facts[index];
  }, 2600);
}

function stopLoadingFactsRotation() {
  if (factTimer) {
    clearInterval(factTimer);
    factTimer = null;
  }
}

function startLoadingStateRotation() {
  if (!loadingStateEl) return;

  loadingStateEl.textContent = LOADING_STATES[0];

  stopLoadingStateRotation();

  loadingStateTimer1 = setTimeout(() => {
    if (!loadingStateEl) return;
    loadingStateEl.textContent = LOADING_STATES[1];
  }, 1800);

  loadingStateTimer2 = setTimeout(() => {
    if (!loadingStateEl) return;
    loadingStateEl.textContent = "正在生成这次解读……";
  }, 3800);
}

function stopLoadingStateRotation() {
  if (loadingStateTimer1) {
    clearTimeout(loadingStateTimer1);
    loadingStateTimer1 = null;
  }
  if (loadingStateTimer2) {
    clearTimeout(loadingStateTimer2);
    loadingStateTimer2 = null;
  }
}

function pickLoadingFacts(card) {
  const cardName = card && card.name_zh ? String(card.name_zh).trim() : "";
  const cardFacts = LOADING_FACTS.byCard[cardName] || [];

  if (card && card.orientation === "reversed") {
    const reversedFacts = pickRange(LOADING_FACTS.reversed, 1, 2);
    const commonFact = pickRange(LOADING_FACTS.common, 1, 1);
    return shuffleArray([...cardFacts, ...reversedFacts, ...commonFact]).slice(0, 4);
  }

  const commonFacts = pickRange(LOADING_FACTS.common, 1, 2);
  return shuffleArray([...cardFacts, ...commonFacts]).slice(0, 4);
}

function getDrawCount() {
  const raw = sessionStorage.getItem(DRAW_COUNT_KEY);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function maxDrawsForCurrentRole() {
  return accessState.role === "normal" ? 1 : MAX_DRAWS_PER_SESSION;
}

function setDrawCount(nextCount) {
  sessionStorage.setItem(DRAW_COUNT_KEY, String(nextCount));
}

function lockDrawForSession() {
  shuffleBtn.disabled = true;
  shuffleBtn.textContent = "今日封盘";
  drawArea.classList.add("hidden");
  if (chooseCardTipEl) chooseCardTipEl.hidden = true;
  emptyState.classList.remove("hidden");
  if (accessState.role === "normal") {
    emptyState.textContent = "普通体验已完成 1 次抽牌。激活先行版或填写邀请码，可继续完整体验。";
  } else {
    emptyState.textContent = "你已在本次打开中抽牌 10 次。古话说‘卜不过三’，今天先到这里吧。";
  }
}

function refreshDrawLimitUI() {
  const limited = getDrawCount() >= maxDrawsForCurrentRole();
  if (limited) {
    lockDrawForSession();
    return;
  }

  if (shuffleBtn && shuffleBtn.textContent === "今日封盘") {
    shuffleBtn.disabled = false;
    shuffleBtn.textContent = "开始洗牌";
    if (emptyState) {
      emptyState.textContent = "点击上方按钮，先抽一张牌。";
    }
  }
}

async function loadCardsData() {
  const resp = await fetch("./cards_data.json");
  if (!resp.ok) {
    throw new Error("无法读取 cards_data.json");
  }
  majorArcana = await resp.json();
}

function createDeck() {
  return majorArcana.map(card => {
    const orientation = Math.random() < 0.5 ? "upright" : "reversed";
    return { ...card, orientation };
  });
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function drawFromDeck() {
  const deck = createDeck();
  const shuffledDeck = shuffleDeck(deck);
  const drawnCard = shuffledDeck[0];
  return { drawnCard, deck: shuffledDeck };
}

function updateQuestionPlaceholder() {
  const questionType = document.getElementById("questionType").value;
  const mappedType = questionTypeMap[questionType] || questionType;
  if (questionInput) {
    questionInput.placeholder =
      COPY.placeholders[mappedType] || questionPlaceholderMap[questionType] || "比如：我现在该注意什么？";
  }
}

function detectQuestionStyle(questionText, questionType) {
  const text = (questionText || "").trim();

  if (!text) return "点破流";

  if (/怎么看|为什么|感觉|不安|怪怪的|该如何理解|我是不是|我为什么/.test(text)) {
    return "感受流";
  }

  if (/接下来|发展|之后|过程|阶段|走向|会怎么|未来会/.test(text)) {
    return "剧情流";
  }

  if (/该不该|要不要|怎么办|怎么做|问题核心|调整什么|适不适合|值不值得/.test(text)) {
    return "拆解流";
  }

  return "点破流";
}

async function fetchAIReading(card, questionType, questionText) {
  const questionStyle = detectQuestionStyle(questionText, questionType);
  const mappedType = questionTypeMap[questionType] || questionType;

  const resp = await fetch("/api/reading", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      card_name: card.name_zh,
      orientation: card.orientation,
      question_type: mappedType,
      question_text: questionText || "",
      question_style: questionStyle,
      direction: mappedType,
      access_token: accessState.accessToken || ""
    })
  });

  return parseApiJson(resp, "/api/reading");
}

async function parseApiJson(resp, apiPath) {
  const raw = await resp.text();
  let data = null;
  try {
    data = JSON.parse(raw);
  } catch (_err) {
    const head = (raw || "").slice(0, 120).replace(/\s+/g, " ");
    const isHtml = /^\s*<!doctype\s+html|^\s*<html/i.test(raw || "");
    if (isHtml) {
      throw new Error(
        `后端返回了 HTML（HTTP ${resp.status}），通常是接口未命中或后端未启动。请确认通过 Flask 服务地址访问页面，并检查 ${apiPath} 路由。`
      );
    }
    throw new Error(`后端返回了非 JSON 响应（HTTP ${resp.status}）：${head || "<empty>"}`);
  }

  if (!resp.ok) {
    throw new Error(data.detail || data.error || `API 请求失败（HTTP ${resp.status}）`);
  }
  return data;
}

async function startCardSpirit(readingId, accessToken) {
  const resp = await fetch("/api/card-spirit/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reading_id: readingId,
      access_token: accessToken || ""
    })
  });
  return parseApiJson(resp, "/api/card-spirit/start");
}

async function sendCardSpiritMessage(sessionId, message) {
  const resp = await fetch("/api/card-spirit/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      message
    })
  });
  return parseApiJson(resp, "/api/card-spirit/message");
}

async function endCardSpirit(sessionId) {
  const resp = await fetch("/api/card-spirit/end", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId })
  });
  return parseApiJson(resp, "/api/card-spirit/end");
}

function formatCountdown(expiresAt) {
  const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const mm = String(Math.floor(diff / 60)).padStart(2, "0");
  const ss = String(diff % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function updateSpiritMeta() {
  if (spiritTimerEl) {
    spiritTimerEl.textContent = spiritExpiresAt ? formatCountdown(spiritExpiresAt) : "00:00";
  }
  if (spiritRoundsEl) {
    spiritRoundsEl.textContent = `剩余 ${Math.max(0, spiritRemainingRounds)} 轮`;
  }
}

function appendSpiritMessage(role, content) {
  if (!spiritMessagesEl) return;
  const node = document.createElement("div");
  node.className = `spirit-msg ${role}`;
  node.textContent = content;
  spiritMessagesEl.appendChild(node);
  spiritMessagesEl.scrollTop = spiritMessagesEl.scrollHeight;
}

function setSpiritInputEnabled(enabled) {
  if (spiritInputEl) spiritInputEl.disabled = !enabled;
  if (spiritSendBtn) spiritSendBtn.disabled = !enabled;
}

function stopSpiritTimer() {
  if (spiritTimerTask) {
    clearInterval(spiritTimerTask);
    spiritTimerTask = null;
  }
}

function endSpiritUI(message) {
  spiritActive = false;
  setSpiritInputEnabled(false);
  stopSpiritTimer();
  if (message) appendSpiritMessage("assistant", message);
  updateSpiritMeta();
}

function resetSpiritUI() {
  stopSpiritTimer();
  spiritSessionId = "";
  spiritExpiresAt = "";
  spiritRemainingRounds = 8;
  spiritActive = false;
  if (spiritMessagesEl) spiritMessagesEl.innerHTML = "";
  if (spiritInputEl) spiritInputEl.value = "";
  if (spiritPanelEl) spiritPanelEl.classList.add("hidden");
  if (spiritEntryEl) spiritEntryEl.classList.add("hidden");
  setSpiritInputEnabled(false);
  updateSpiritMeta();
}

function startSpiritTimerWatcher() {
  stopSpiritTimer();
  spiritTimerTask = setInterval(() => {
    updateSpiritMeta();
    if (!spiritExpiresAt) return;
    if (Date.now() >= new Date(spiritExpiresAt).getTime()) {
      endSpiritUI("这张牌今天先陪你到这里。这一轮对话先停在这里。");
    }
  }, 1000);
}

function applyStaticCopy() {
  if (subtitleEl) subtitleEl.textContent = COPY.subtitle;
  if (questionInputLabelEl) questionInputLabelEl.textContent = COPY.inputLabel;

  if (helpContent) {
    helpContent.innerHTML = `
      <p><strong>${COPY.helpSections.ask.title}</strong> ${COPY.helpSections.ask.body}</p>
      <p><strong>${COPY.helpSections.repeat.title}</strong> ${COPY.helpSections.repeat.body}</p>
      <p><strong>${COPY.helpSections.orientation.title}</strong> ${COPY.helpSections.orientation.body}</p>
    `;
  }

  if (preDrawTipEl) {
    const randomTip = COPY.preDrawTips[Math.floor(Math.random() * COPY.preDrawTips.length)];
    preDrawTipEl.textContent = randomTip;
  }

  if (chooseCardTipEl) chooseCardTipEl.textContent = COPY.chooseCardTip;
  if (resultLeadEl) resultLeadEl.textContent = COPY.resultLead;
}

function makeBriefLine(card) {
  const raw = card.orientation === "upright" ? card.upright_meaning : card.reversed_meaning;
  let text = raw || "";

  text = text
    .replace(/^代表/, "")
    .replace(/^象征/, "")
    .replace(/^意味着/, "")
    .replace(/^通常表示/, "")
    .replace(/^多半表示/, "")
    .trim();

  const firstClause = text.split("。")[0].split("；")[0].split("，")[0].trim();

  return firstClause || "牌意已加载";
}

function buildFixedMeaning(card) {
  const orientationLabel = card.orientation === "upright" ? "正位" : "逆位";
  const orientationMeaning =
    card.orientation === "upright" ? card.upright_meaning : card.reversed_meaning;

  return `【牌面视觉】
${card.visual_description}

【这张牌的基本意思】
${card.summary_meaning}

【${orientationLabel}含义】
${orientationMeaning}`;
}

function updateUI(card, aiReading, questionText, questionType) {
  const orientationLabel = card.orientation === "upright" ? "正位" : "逆位";

  document.getElementById("cardName").textContent = card.name_zh;
  document.getElementById("cardOrientation").textContent = orientationLabel;
  document.getElementById("cardKeywords").textContent = makeBriefLine(card);

  const llmMeaning = `【这张牌照见了什么】
核心提醒：${aiReading.core}

放回你的问题里：${aiReading.context}

宇宙想对你说：${aiReading.advice}`;

  document.getElementById("cardReading").textContent =
    buildFixedMeaning(card) + "\n\n" + llmMeaning;

  currentReadingContext = {
    readingId: aiReading.reading_id || "",
    cardName: card.name_zh,
    orientation: card.orientation,
    question: questionText || "",
    direction: questionTypeMap[questionType] || questionType || ""
  };

  if (spiritEntryEl) {
    if (currentReadingContext.readingId) {
      spiritEntryEl.classList.remove("hidden");
    } else {
      spiritEntryEl.classList.add("hidden");
    }
  }
  applyAccessStateUI();
  if (spiritPanelEl) spiritPanelEl.classList.add("hidden");

  const rotateStyle = card.orientation === "reversed" ? "transform: rotate(180deg);" : "";
  cardVisual.innerHTML = `
    <img
      src="${card.image}"
      alt="${card.name_zh}"
      style="${rotateStyle}"
    />
  `;
}

function startShuffleAnimation() {
  resetLoadingUI();
  resultCard.classList.remove("hidden");
  emptyState.classList.add("hidden");

  cardVisual.classList.add("shuffling");
  cardVisual.innerHTML = "正在翻牌…";

  document.getElementById("cardName").textContent = "—";
  document.getElementById("cardOrientation").textContent = "—";
  document.getElementById("cardKeywords").textContent = "—";
  document.getElementById("cardReading").textContent = "牌阵正在重新整理，请稍候片刻。";
}

function startThinkingAnimation(card) {
  cardVisual.classList.remove("shuffling");
  const rotateStyle = card.orientation === "reversed" ? "transform: rotate(180deg);" : "";
  cardVisual.innerHTML = `
    <img
      src="${card.image}"
      alt="${card.name_zh}"
      style="${rotateStyle}; opacity: 0.55;"
    />
  `;

  document.getElementById("cardName").textContent = card.name_zh;
  document.getElementById("cardOrientation").textContent =
    card.orientation === "upright" ? "正位" : "逆位";
  document.getElementById("cardKeywords").textContent = makeBriefLine(card);
  document.getElementById("cardReading").textContent =
    buildFixedMeaning(card) + "\n\n【这张牌照见了什么】\n正在生成解读…";

  showLoadingBox();
}

const questionTypeSelect = document.getElementById("questionType");

if (helpToggle && helpContent) {
  helpToggle.addEventListener("click", () => {
    const isHidden = helpContent.hasAttribute("hidden") || helpContent.classList.contains("hidden");
    if (isHidden) {
      helpContent.removeAttribute("hidden");
      helpContent.classList.remove("hidden");
      helpToggle.setAttribute("aria-expanded", "true");
    } else {
      helpContent.setAttribute("hidden", "");
      helpContent.classList.add("hidden");
      helpToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (orientationHelpToggle && orientationHelpBox) {
  orientationHelpToggle.addEventListener("click", () => {
    orientationHelpBox.classList.toggle("hidden");
  });
}

if (questionTypeSelect) {
  questionTypeSelect.addEventListener("change", updateQuestionPlaceholder);
}

async function openSpiritSession() {
  if (!currentReadingContext || !currentReadingContext.readingId) {
    throw new Error("当前抽牌结果不可用，请先完成一次单抽。");
  }

  const data = await startCardSpirit(currentReadingContext.readingId, accessState.accessToken || "");
  if (spiritPanelEl) spiritPanelEl.classList.remove("hidden");
  if (spiritMessagesEl) spiritMessagesEl.innerHTML = "";

  spiritSessionId = data.session.session_id;
  spiritExpiresAt = data.session.expires_at;
  spiritRemainingRounds = data.session.remaining_rounds;
  spiritActive = data.session.status === "active";

  appendSpiritMessage("assistant", data.opening_message || "这张牌想先听你说一句真话。");
  setSpiritInputEnabled(true);
  updateSpiritMeta();
  startSpiritTimerWatcher();
}

if (spiritEnterBtn) {
  spiritEnterBtn.addEventListener("click", async () => {
    if (!currentReadingContext || !currentReadingContext.readingId) {
      return;
    }

    if (!canUseSpiritByRole(accessState.role)) {
      if (accessModalEl) {
        clearAccessModalMsg();
        showAccessModalMsg("需要先激活先行版，或填写邀请码体验完整流程。", true);
        accessModalEl.classList.remove("hidden");
      }
      return;
    }

    try {
      spiritEnterBtn.disabled = true;
      await openSpiritSession();
    } catch (err) {
      appendSpiritMessage("assistant", `开启牌灵失败：${err.message || "未知错误"}`);
    } finally {
      spiritEnterBtn.disabled = false;
    }
  });
}

if (pilotEntryBtn && accessModalEl) {
  pilotEntryBtn.addEventListener("click", () => {
    clearAccessModalMsg();
    accessModalEl.classList.remove("hidden");
  });
}

if (accessModalCloseBtn && accessModalEl) {
  accessModalCloseBtn.addEventListener("click", () => {
    accessModalEl.classList.add("hidden");
  });
}

if (whitelistActivateBtn) {
  whitelistActivateBtn.addEventListener("click", async () => {
    try {
      whitelistActivateBtn.disabled = true;
      const name = whitelistNameInputEl ? whitelistNameInputEl.value.trim().toLowerCase().replace(/\s+/g, "") : "";
      const birth = whitelistBirthInputEl ? whitelistBirthInputEl.value.trim() : "";
      const data = await activateAccess("whitelist", {
        name_pinyin: name,
        birth_year_month: birth
      });
      accessState = {
        ...accessState,
        role: data.role,
        accessType: data.accessType,
        activated: Boolean(data.activated),
        userName: data.userName || "",
        birthYearMonth: data.birthYearMonth || "",
        accessToken: data.accessToken || "",
      };
      saveAccessState();
      applyAccessStateUI();
      loadStyleProfile().catch(() => {});
      loadHistory().catch(() => {});
      loadAdminInviteCodes().catch(() => {});
      loadAdminWhitelist().catch(() => {});
      showAccessModalMsg("白名单认证成功，已进入先行者模式。", false);
    } catch (err) {
      showAccessModalMsg(err.message || "白名单认证失败。", true);
    } finally {
      whitelistActivateBtn.disabled = false;
    }
  });
}

if (accessInviteActivateBtn) {
  accessInviteActivateBtn.addEventListener("click", async () => {
    try {
      accessInviteActivateBtn.disabled = true;
      const code = accessInviteInputEl ? accessInviteInputEl.value.trim() : "";
      const data = await activateAccess("invite", { invite_code: code });
      accessState = {
        ...accessState,
        role: data.role,
        accessType: data.accessType,
        activated: Boolean(data.activated),
        userName: data.userName || "",
        birthYearMonth: data.birthYearMonth || "",
        accessToken: data.accessToken || "",
      };
      saveAccessState();
      applyAccessStateUI();
      loadStyleProfile().catch(() => {});
      loadHistory().catch(() => {});
      loadAdminInviteCodes().catch(() => {});
      loadAdminWhitelist().catch(() => {});
      showAccessModalMsg("邀请码验证成功，已进入完整体验模式。", false);
    } catch (err) {
      showAccessModalMsg(err.message || "邀请码验证失败。", true);
    } finally {
      accessInviteActivateBtn.disabled = false;
    }
  });
}

if (adminActivateBtn) {
  adminActivateBtn.addEventListener("click", async () => {
    try {
      adminActivateBtn.disabled = true;
      const code = adminCodeInputEl ? adminCodeInputEl.value.trim() : "";
      const birth = adminBirthInputEl ? adminBirthInputEl.value.trim() : "";
      const data = await activateAccess("admin", {
        admin_code: code,
        birth_date: birth
      });
      accessState = {
        ...accessState,
        role: data.role,
        accessType: data.accessType,
        activated: Boolean(data.activated),
        userName: data.userName || "",
        birthYearMonth: data.birthYearMonth || "",
        accessToken: data.accessToken || "",
      };
      saveAccessState();
      applyAccessStateUI();
      loadStyleProfile().catch(() => {});
      loadHistory().catch(() => {});
      loadAdminInviteCodes().catch(() => {});
      loadAdminWhitelist().catch(() => {});
      showAccessModalMsg("管理员模式已启用。", false);
    } catch (err) {
      showAccessModalMsg(err.message || "管理员认证失败。", true);
    } finally {
      adminActivateBtn.disabled = false;
    }
  });
}

if (saveStylePresetBtn && stylePresetSelectEl) {
  saveStylePresetBtn.addEventListener("click", async () => {
    if (!canUseStyleByRole(accessState.role)) return;
    try {
      saveStylePresetBtn.disabled = true;
      const preset = stylePresetSelectEl.value;
      const data = await saveStyleProfilePreset(preset);
      accessState.styleProfile = data.preset || preset;
      saveAccessState();
      showAccessModalMsg("风格预设已保存。", false);
    } catch (err) {
      showAccessModalMsg(err.message || "保存风格失败。", true);
    } finally {
      saveStylePresetBtn.disabled = false;
    }
  });
}

async function handleHistoryLockClick(event) {
  const btn = event.target.closest(".history-lock-btn");
  if (!btn) return;
  const readingId = btn.getAttribute("data-reading-id") || "";
  const lockFlag = btn.getAttribute("data-lock") === "1";
  if (!readingId) return;
  try {
    await updateHistoryLock(readingId, lockFlag);
    await loadHistory();
  } catch (err) {
    showAccessModalMsg(err.message || "更新历史状态失败。", true);
  }
}

if (lockedHistoryListEl) {
  lockedHistoryListEl.addEventListener("click", handleHistoryLockClick);
}
if (recentHistoryListEl) {
  recentHistoryListEl.addEventListener("click", handleHistoryLockClick);
}

if (createInviteCodeBtn) {
  createInviteCodeBtn.addEventListener("click", async () => {
    if (accessState.role !== "admin") return;
    try {
      createInviteCodeBtn.disabled = true;
      const code = newInviteCodeInputEl ? newInviteCodeInputEl.value.trim() : "";
      const resp = await fetch("/api/admin/invite-codes", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          code,
          max_uses: 10,
          access_token: accessState.accessToken || ""
        })
      });
      await parseApiJson(resp, "/api/admin/invite-codes");
      if (newInviteCodeInputEl) newInviteCodeInputEl.value = "";
      await loadAdminInviteCodes();
      showAccessModalMsg("邀请码已新增。", false);
    } catch (err) {
      showAccessModalMsg(err.message || "新增邀请码失败。", true);
    } finally {
      createInviteCodeBtn.disabled = false;
    }
  });
}

if (adminInviteListEl) {
  adminInviteListEl.addEventListener("click", async event => {
    const btn = event.target.closest(".invite-toggle-btn");
    if (!btn) return;
    const code = btn.getAttribute("data-code") || "";
    const nextFlag = btn.getAttribute("data-next") === "1";
    if (!code) return;
    try {
      const resp = await fetch(`/api/admin/invite-codes/${encodeURIComponent(code)}/active`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          is_active: nextFlag,
          access_token: accessState.accessToken || ""
        })
      });
      await parseApiJson(resp, "/api/admin/invite-codes/<code>/active");
      await loadAdminInviteCodes();
    } catch (err) {
      showAccessModalMsg(err.message || "更新邀请码状态失败。", true);
    }
  });
}

if (refreshWhitelistBtn) {
  refreshWhitelistBtn.addEventListener("click", () => {
    loadAdminWhitelist().catch(err => {
      showAccessModalMsg(err.message || "加载白名单失败。", true);
    });
  });
}

if (spiritSendBtn && spiritInputEl) {
  spiritSendBtn.addEventListener("click", async () => {
    const text = spiritInputEl.value.trim();
    if (!text) return;
    if (!spiritActive || !spiritSessionId) return;
    if (spiritRemainingRounds <= 0) {
      endSpiritUI("这张牌今天先陪你到这里。这一轮对话先停在这里。");
      return;
    }

    appendSpiritMessage("user", text);
    spiritInputEl.value = "";

    try {
      spiritSendBtn.disabled = true;
      const data = await sendCardSpiritMessage(spiritSessionId, text);
      appendSpiritMessage("assistant", data.reply || "我听到了，我们继续围绕这张牌看。")
      spiritRemainingRounds = Number(data.remaining_rounds || spiritRemainingRounds);
      spiritActive = data.status === "active";
      updateSpiritMeta();

      if (!spiritActive || spiritRemainingRounds <= 0) {
        endSpiritUI("这张牌今天先陪你到这里。真正要做决定的，仍然是你。")
      }
    } catch (err) {
      appendSpiritMessage("assistant", `当前追问失败：${err.message || "未知错误"}`)
    } finally {
      spiritSendBtn.disabled = false;
    }
  });
}

if (spiritInputEl) {
  spiritInputEl.addEventListener("keydown", ev => {
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      if (spiritSendBtn) spiritSendBtn.click();
    }
  });
}

if (spiritEndBtn) {
  spiritEndBtn.addEventListener("click", async () => {
    if (!spiritSessionId) {
      endSpiritUI("这张牌今天先陪你到这里。")
      return;
    }
    try {
      await endCardSpirit(spiritSessionId);
    } catch (_err) {
      // Ignore network errors on manual end; local UI still closes this round.
    }
    endSpiritUI("这张牌今天先陪你到这里。真正要做决定的，仍然是你。")
  });
}

shuffleBtn.addEventListener("click", () => {
  const currentCount = getDrawCount();
  if (currentCount >= maxDrawsForCurrentRole()) {
    lockDrawForSession();
    return;
  }

  if (!majorArcana.length) {
    emptyState.classList.remove("hidden");
    emptyState.textContent = "牌库尚未加载完成，请刷新页面后重试。";
    return;
  }

  resetSpiritUI();
  currentReadingContext = null;

  pendingDrawCard = drawFromDeck().drawnCard;
  resetLoadingUI();

  resultCard.classList.add("hidden");
  emptyState.classList.add("hidden");
  drawArea.classList.remove("hidden");
  if (chooseCardTipEl) chooseCardTipEl.hidden = false;
  if (resultLeadEl) resultLeadEl.hidden = true;
  document.getElementById("cardName").textContent = "—";
  document.getElementById("cardOrientation").textContent = "—";
  document.getElementById("cardKeywords").textContent = "—";
  document.getElementById("cardReading").textContent = "牌阵正在重新整理，请从三张牌中选择一张。";
});

cardBackButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    if (!pendingDrawCard) return;

    cardBackButtons.forEach(button => {
      button.disabled = true;
    });

    const questionType = document.getElementById("questionType").value;
    const questionText = questionInput ? questionInput.value : "";

    shuffleBtn.disabled = true;
    shuffleBtn.textContent = "解读中…";

    drawArea.classList.add("hidden");
    if (chooseCardTipEl) chooseCardTipEl.hidden = true;
    resultCard.classList.remove("hidden");
    if (resultLeadEl) resultLeadEl.hidden = false;

    startShuffleAnimation();

    setTimeout(async () => {
      try {
        loadingFactsPool = pickLoadingFacts(pendingDrawCard)
          .map(toMicroFact)
          .filter(Boolean);
        loadingFactsPool = [...new Set(loadingFactsPool)];
        if (!loadingFactsPool.length) {
          loadingFactsPool = [...LOADING_FACTS.common].map(toMicroFact).filter(Boolean);
        }

        startThinkingAnimation(pendingDrawCard);
        startLoadingStateRotation();
        startLoadingFactsRotation(loadingFactsPool);

        const aiReading = await fetchAIReading(pendingDrawCard, questionType, questionText);
        resetLoadingUI();
        updateUI(pendingDrawCard, aiReading, questionText, questionType);

        const nextCount = getDrawCount() + 1;
        setDrawCount(nextCount);
        if (nextCount >= maxDrawsForCurrentRole()) {
          lockDrawForSession();
        }
      } catch (err) {
        resetLoadingUI();
        document.getElementById("cardReading").textContent =
          buildFixedMeaning(pendingDrawCard) + "\n\n【这张牌照见了什么】\n解读生成失败：" + err.message;
        resetSpiritUI();
        currentReadingContext = null;
      } finally {
        pendingDrawCard = null;
        shuffleBtn.disabled = false;
        shuffleBtn.textContent = "开始洗牌";

        cardBackButtons.forEach(button => {
          button.disabled = false;
        });
      }
    }, 800);
  });
});

applyStaticCopy();
loadAccessState();
applyAccessStateUI();
refreshAccessStatus().catch(() => {
  // Keep local access state when network check fails.
});
loadStyleProfile().catch(() => {});
loadHistory().catch(() => {});
loadAdminInviteCodes().catch(() => {});
loadAdminWhitelist().catch(() => {});
updateQuestionPlaceholder();
resetLoadingUI();
resetSpiritUI();

refreshDrawLimitUI();

loadCardsData().catch(err => {
  console.error(err);
  emptyState.classList.remove("hidden");
  emptyState.textContent = "牌库加载失败：" + err.message;
});
}