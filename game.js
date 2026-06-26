const mapScreen = document.getElementById("mapScreen");
const levelScreen = document.getElementById("levelScreen");
const completeScreen = document.getElementById("completeScreen");

const levelMap = document.getElementById("levelMap");
const progressText = document.getElementById("progressText");
const resetBtn = document.getElementById("resetBtn");

const backToMapBtn = document.getElementById("backToMapBtn");
const levelNumber = document.getElementById("levelNumber");
const levelTitle = document.getElementById("levelTitle");
const levelIntro = document.getElementById("levelIntro");
const rewardText = document.getElementById("rewardText");
const levelImage = document.getElementById("levelImage");
const speakBtn = document.getElementById("speakBtn");
const storyText = document.getElementById("storyText");
const wordList = document.getElementById("wordList");

const questionProgress = document.getElementById("questionProgress");
const questionText = document.getElementById("questionText");
const choicesBox = document.getElementById("choicesBox");
const feedbackText = document.getElementById("feedbackText");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");

const completeMessage = document.getElementById("completeMessage");
const completeReward = document.getElementById("completeReward");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const mapBtnFromComplete = document.getElementById("mapBtnFromComplete");

let currentLevelIndex = 0;
let currentQuestionIndex = 0;

const STORAGE_KEY = "taiwanTransformGameCompleted";

function getCompletedLevels() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveCompletedLevels(completed) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
}

function markLevelCompleted(levelId) {
  const completed = getCompletedLevels();
  if (!completed.includes(levelId)) {
    completed.push(levelId);
    saveCompletedLevels(completed);
  }
}

function showScreen(screen) {
  mapScreen.classList.remove("active");
  levelScreen.classList.remove("active");
  completeScreen.classList.remove("active");
  screen.classList.add("active");
}

function updateProgress() {
  const completed = getCompletedLevels();
  progressText.textContent = `完成 ${completed.length} / ${LEVELS.length} 關`;
}

function renderMap() {
  levelMap.innerHTML = "";
  const completed = getCompletedLevels();

  LEVELS.forEach((level, index) => {
    const card = document.createElement("button");
    card.className = "level-card";
    if (completed.includes(level.id)) {
      card.classList.add("completed");
    }

    card.innerHTML = `
      <img src="${level.image}" alt="${level.title}" onerror="this.style.display='none'">
      <div class="level-card-body">
        <small>第 ${level.id} 關</small>
        <h3>${level.title}</h3>
        <p>${level.intro}</p>
        <span class="badge ${completed.includes(level.id) ? "done" : ""}">
          ${completed.includes(level.id) ? "已通關" : "開始挑戰"}
        </span>
      </div>
    `;

    card.addEventListener("click", () => startLevel(index));
    levelMap.appendChild(card);
  });

  updateProgress();
}

function startLevel(index) {
  currentLevelIndex = index;
  currentQuestionIndex = 0;

  const level = LEVELS[currentLevelIndex];

  levelNumber.textContent = `第 ${level.id} 關`;
  levelTitle.textContent = level.title;
  levelIntro.textContent = level.intro;
  rewardText.textContent = level.reward;
  levelImage.src = level.image;
  levelImage.alt = level.title;

  storyText.innerHTML = highlightWords(level.story, level.words);

  wordList.innerHTML = "";
  level.words.forEach(word => {
    const chip = document.createElement("span");
    chip.className = "word-chip";
    chip.textContent = word;
    wordList.appendChild(chip);
  });

  renderQuestion();
  showScreen(levelScreen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlightWords(story, words) {
  let safeStory = escapeHTML(story);

  words.forEach(word => {
    const safeWord = escapeHTML(word);
    const regex = new RegExp(safeWord, "g");
    safeStory = safeStory.replace(regex, `<span class="highlight-word">${safeWord}</span>`);
  });

  return safeStory;
}

function renderQuestion() {
  const level = LEVELS[currentLevelIndex];
  const question = level.questions[currentQuestionIndex];

  questionProgress.textContent = `第 ${currentQuestionIndex + 1} 題 / 共 ${level.questions.length} 題`;
  questionText.textContent = question.text;
  choicesBox.innerHTML = "";
  feedbackText.textContent = "";
  nextQuestionBtn.classList.add("hidden");

  question.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = `${letter(index)}. ${choice}`;

    btn.addEventListener("click", () => checkAnswer(btn, index, question));
    choicesBox.appendChild(btn);
  });
}

function letter(index) {
  return ["A", "B", "C", "D"][index] || "";
}

function checkAnswer(button, selectedIndex, question) {
  const allButtons = choicesBox.querySelectorAll(".choice-btn");

  if (selectedIndex === question.answer) {
    button.classList.add("correct");
    feedbackText.textContent = "答對了！你有從文章中找到線索。";

    allButtons.forEach(btn => {
      btn.disabled = true;
    });

    nextQuestionBtn.classList.remove("hidden");
  } else {
    button.classList.add("wrong");
    feedbackText.textContent = `再讀一次看看。提示：${question.hint}`;

    setTimeout(() => {
      button.classList.remove("wrong");
    }, 800);
  }
}

function goNextQuestion() {
  const level = LEVELS[currentLevelIndex];

  if (currentQuestionIndex < level.questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
    document.querySelector(".question-box").scrollIntoView({ behavior: "smooth" });
  } else {
    completeLevel();
  }
}

function completeLevel() {
  const level = LEVELS[currentLevelIndex];
  markLevelCompleted(level.id);

  completeMessage.textContent = level.completeMessage;
  completeReward.textContent = `獲得獎勵：${level.reward}`;

  if (currentLevelIndex >= LEVELS.length - 1) {
    nextLevelBtn.textContent = "全部完成，回到地圖";
  } else {
    nextLevelBtn.textContent = "前往下一關";
  }

  updateProgress();
  showScreen(completeScreen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function speakStory() {
  const level = LEVELS[currentLevelIndex];

  if (!("speechSynthesis" in window)) {
    feedbackText.textContent = "這個瀏覽器不支援語音朗讀，可以請老師或同學帶讀。";
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(level.story);
  utterance.lang = "zh-TW";
  utterance.rate = 0.9;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

function backToMap() {
  window.speechSynthesis?.cancel();
  renderMap();
  showScreen(mapScreen);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextLevelOrMap() {
  if (currentLevelIndex >= LEVELS.length - 1) {
    backToMap();
  } else {
    startLevel(currentLevelIndex + 1);
  }
}

function resetGame() {
  const ok = confirm("確定要清除通關紀錄，重新開始嗎？");
  if (!ok) return;

  localStorage.removeItem(STORAGE_KEY);
  renderMap();
}

nextQuestionBtn.addEventListener("click", goNextQuestion);
speakBtn.addEventListener("click", speakStory);
backToMapBtn.addEventListener("click", backToMap);
mapBtnFromComplete.addEventListener("click", backToMap);
nextLevelBtn.addEventListener("click", nextLevelOrMap);
resetBtn.addEventListener("click", resetGame);

renderMap();