let majorArcana = [];

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

const drawBtn = document.getElementById("drawBtn");
const cardVisual = document.getElementById("cardVisual");
const emptyState = document.getElementById("emptyState");
const resultCard = document.getElementById("resultCard");

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
  const questionText = document.getElementById("questionText");
  questionText.placeholder =
    questionPlaceholderMap[questionType] || "比如：我现在该注意什么？";
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

async function fetchAIReading(card, questionType, questionText) {
  const questionStyle = detectQuestionStyle(questionText, questionType);

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
      question_style: questionStyle
    })
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.detail || data.error || "API 请求失败");
  }
  return data;
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

  const llmMeaning = `【结合你的问题的解读】
核心提醒：${aiReading.core}

结合你的问题：${aiReading.context}

一句建议：${aiReading.advice}`;

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
  cardVisual.innerHTML = "正在洗牌…";

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
    buildFixedMeaning(card) + "\n\n【结合你的问题的解读】\n正在生成解读…";
}

const preHelpToggle = document.getElementById("preHelpToggle");
const preHelpBox = document.getElementById("preHelpBox");
const questionTypeSelect = document.getElementById("questionType");

if (preHelpToggle && preHelpBox) {
  preHelpToggle.addEventListener("click", () => {
    preHelpBox.classList.toggle("hidden");
  });
}

if (questionTypeSelect) {
  questionTypeSelect.addEventListener("change", updateQuestionPlaceholder);
}

drawBtn.addEventListener("click", async () => {
  const questionType = document.getElementById("questionType").value;
  const questionText = document.getElementById("questionText").value;

  if (!majorArcana.length) {
    document.getElementById("cardReading").textContent = "牌库尚未加载完成，请稍后重试。";
    return;
  }

  drawBtn.disabled = true;
  drawBtn.textContent = "洗牌中…";

  startShuffleAnimation();

  const { drawnCard } = drawFromDeck();

  setTimeout(async () => {
    try {
      drawBtn.textContent = "解读中…";
      startThinkingAnimation(drawnCard);

      const aiReading = await fetchAIReading(drawnCard, questionType, questionText);
      updateUI(drawnCard, aiReading);
    } catch (err) {
      document.getElementById("cardReading").textContent =
        buildFixedMeaning(drawnCard) + "\n\n【结合你的问题的解读】\n解读生成失败：" + err.message;
    } finally {
      drawBtn.disabled = false;
      drawBtn.textContent = "洗牌并抽牌";
    }
  }, 1200);
});

updateQuestionPlaceholder();

loadCardsData().catch(err => {
  console.error(err);
  document.getElementById("cardReading").textContent = "牌库加载失败：" + err.message;
});