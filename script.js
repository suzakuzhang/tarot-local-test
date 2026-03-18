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

  mobilePlaceholders: {
    "感情": "你更想看清关系里的什么？",
    "工作": "你现在最想确认哪件工作事？",
    "情绪": "你现在最难说出口的感受是？",
    "自我成长": "你现在最卡住的成长点是？"
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
const orientationHelpToggleDesktop = document.getElementById("orientationHelpToggleDesktop");
const orientationHelpBox = document.getElementById("orientationHelpBox");
const cardNameDesktop = document.getElementById("cardNameDesktop");
const cardOrientationDesktop = document.getElementById("cardOrientationDesktop");
const cardKeywordsDesktop = document.getElementById("cardKeywordsDesktop");
const subtitleEl = document.getElementById("subtitle") || document.querySelector(".subtitle");
const questionInputLabelEl = document.getElementById("question-input-label");
const questionInput = document.getElementById("question-input") || document.getElementById("questionText");
const helpToggle = document.getElementById("help-toggle") || document.getElementById("preHelpToggle");
const helpContent = document.getElementById("help-content") || document.getElementById("preHelpBox");
const preDrawTipEl = document.getElementById("pre-draw-tip");
const chooseCardTipEl = document.getElementById("choose-card-tip");
const resultLeadEl = document.getElementById("result-lead");

const MAX_DRAWS_PER_SESSION = 10;
const DRAW_COUNT_KEY = "tarot_draw_count";

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

function getDrawCount() {
  const raw = sessionStorage.getItem(DRAW_COUNT_KEY);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
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
  emptyState.textContent = "你已在本次打开中抽牌 10 次。古话说‘卜不过三’，今天先到这里吧。";
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
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (questionInput) {
    questionInput.placeholder =
      (isMobile ? COPY.mobilePlaceholders[mappedType] : COPY.placeholders[mappedType]) ||
      questionPlaceholderMap[questionType] ||
      "比如：我现在该注意什么？";
  }
}

function detectQuestionStyle(questionText, questionType) {
  const text = (questionText || "").trim();

  if (!text) return "general";

  if (/怎么看|为什么|感觉|不安|怪怪的|该如何理解|我是不是|我为什么/.test(text)) {
    return "intuitive";
  }

  if (/接下来|发展|之后|过程|阶段|走向|会怎么|未来会/.test(text)) {
    return "story";
  }

  if (/该不该|要不要|怎么办|怎么做|问题核心|调整什么|适不适合|值不值得/.test(text)) {
    return "analytical";
  }

  return "general";
}

async function fetchAIReading(card, questionType, questionText, questionStyle) {
  const style = questionStyle || detectQuestionStyle(questionText, questionType);

  const resp = await fetch("/api/reading", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      card_name: card.name_zh,
      orientation: card.orientation,
      question_type: questionTypeMap[questionType] || questionType,
      question_text: questionText || "",
      question_style: style
    })
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.detail || data.error || "API 请求失败");
  }
  return data;
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

function updateUI(card, aiReading) {
  const orientationLabel = card.orientation === "upright" ? "正位" : "逆位";

  document.getElementById("cardName").textContent = card.name_zh;
  document.getElementById("cardOrientation").textContent = orientationLabel;
  document.getElementById("cardKeywords").textContent = makeBriefLine(card);
  if (cardNameDesktop) cardNameDesktop.textContent = card.name_zh;
  if (cardOrientationDesktop) cardOrientationDesktop.textContent = orientationLabel;
  if (cardKeywordsDesktop) cardKeywordsDesktop.textContent = makeBriefLine(card);

  const llmMeaning = `【结合你的问题的解读】
核心提醒：${aiReading.core}

结合你的问题：${aiReading.context}

宇宙想对你说：${aiReading.advice}`;

  document.getElementById("cardReading").textContent =
    buildFixedMeaning(card) + "\n\n" + llmMeaning;

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
  resultCard.classList.remove("hidden");
  emptyState.classList.add("hidden");

  cardVisual.classList.add("shuffling");
  cardVisual.innerHTML = "正在翻牌…";

  document.getElementById("cardName").textContent = "—";
  document.getElementById("cardOrientation").textContent = "—";
  document.getElementById("cardKeywords").textContent = "—";
  if (cardNameDesktop) cardNameDesktop.textContent = "—";
  if (cardOrientationDesktop) cardOrientationDesktop.textContent = "—";
  if (cardKeywordsDesktop) cardKeywordsDesktop.textContent = "—";
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
  if (cardNameDesktop) cardNameDesktop.textContent = card.name_zh;
  if (cardOrientationDesktop) cardOrientationDesktop.textContent = card.orientation === "upright" ? "正位" : "逆位";
  if (cardKeywordsDesktop) cardKeywordsDesktop.textContent = makeBriefLine(card);
  document.getElementById("cardReading").textContent =
    buildFixedMeaning(card) + "\n\n【结合你的问题的解读】\n正在生成解读…";
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

if (orientationHelpToggleDesktop && orientationHelpBox) {
  orientationHelpToggleDesktop.addEventListener("click", () => {
    orientationHelpBox.classList.toggle("hidden");
  });
}

if (questionTypeSelect) {
  questionTypeSelect.addEventListener("change", updateQuestionPlaceholder);
}

window.addEventListener("resize", updateQuestionPlaceholder);

shuffleBtn.addEventListener("click", () => {
  const currentCount = getDrawCount();
  if (currentCount >= MAX_DRAWS_PER_SESSION) {
    lockDrawForSession();
    return;
  }

  if (!majorArcana.length) {
    emptyState.classList.remove("hidden");
    emptyState.textContent = "牌库尚未加载完成，请刷新页面后重试。";
    return;
  }

  pendingDrawCard = drawFromDeck().drawnCard;

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
    const questionStyle = detectQuestionStyle(questionText, questionType);

    shuffleBtn.disabled = true;
    shuffleBtn.textContent = "解读中…";

    drawArea.classList.add("hidden");
    if (chooseCardTipEl) chooseCardTipEl.hidden = true;
    resultCard.classList.remove("hidden");
    if (resultLeadEl) resultLeadEl.hidden = false;

    startShuffleAnimation();

    setTimeout(async () => {
      try {
        startThinkingAnimation(pendingDrawCard);
        const aiReading = await fetchAIReading(pendingDrawCard, questionType, questionText, questionStyle);
        updateUI(pendingDrawCard, aiReading);

        const nextCount = getDrawCount() + 1;
        setDrawCount(nextCount);
        if (nextCount >= MAX_DRAWS_PER_SESSION) {
          lockDrawForSession();
        }
      } catch (err) {
        document.getElementById("cardReading").textContent =
          buildFixedMeaning(pendingDrawCard) + "\n\n【结合你的问题的解读】\n解读生成失败：" + err.message;
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
updateQuestionPlaceholder();

if (getDrawCount() >= MAX_DRAWS_PER_SESSION) {
  lockDrawForSession();
}

loadCardsData().catch(err => {
  console.error(err);
  emptyState.classList.remove("hidden");
  emptyState.textContent = "牌库加载失败：" + err.message;
});
}