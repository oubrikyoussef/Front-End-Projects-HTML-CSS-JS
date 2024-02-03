// Constants
const tentatives = 2;
const minutes = 0;
const seconds = 50;

// Global Variables
let questionNum = 0;
let goodAnswers = 0;
let score = 0;
let currentTimerHandler = null;
let currentQuest = null;

// DOM Elements
const containerForm = document.querySelector(".container form");
const decision = document.querySelector(".decision");
const container = document.querySelector(".container");

// Initialize the game
initialize();

function initialize() {
  score = getScore();
  setScore(score);
  createBullets(tentatives);
  setBorder();
}

function getScore() {
  const score = localStorage.getItem("score");
  return score ? score : 0;
}

function setScore(score) {
  const scoreHolder = document.querySelector(".score-holder .value");
  scoreHolder.innerText = formatNums(score);
  localStorage.setItem("score", score);
}

function createBullets(tentatives) {
  const questionsNumber = document.querySelector(".questions-number");
  for (let i = 0; i < tentatives; i++) {
    const num = document.createElement("li");
    num.classList.add("bullet");
    questionsNumber.append(num);
  }
}

function setBorder() {
  containerForm.addEventListener("click", (e) => {
    if (e.target.tagName === "LABEL") {
      const label = e.target;
      const givenSuggestion = label.parentElement;
      const previouslyChecked = document.querySelector(".suggestion.checked");
      if (previouslyChecked) {
        previouslyChecked.classList.remove("checked");
      }
      givenSuggestion.classList.add("checked");
    }
  });
}

async function main() {
  const questions = await getQuestions();
  if(questions){
  currentQuest = newQuest(questions);
  nextOnSubmit(questions);
  }
}
main();

async function getQuestions() {
  try {
    const response = await fetch("questions.json");
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}
function getRandomNum(max){
  const randomNum = Math.floor(Math.random() * max);   
  return randomNum;
}
function getRandomQuestion(questions) {
  const remainingQuestions = questions.filter((q) => !q.alreadyDone);
  const randomNum = getRandomNum(remainingQuestions.length);
  const question = remainingQuestions[randomNum];
  question.alreadyDone = true;
  return question;
}

function setQuestion(question) {
    containerForm.innerHTML = "";
    const category = document.querySelector(".category .value");
    category.innerText = question.category;
  
    const theQuestion = document.createElement("h3");
    theQuestion.innerText = question.question;
    containerForm.append(theQuestion);
  
    const manipulatedSugg = shuffleArray(question.suggestions);
  
    for (let i = 0; i < manipulatedSugg.length; i++) {
      const givenSuggestion = document.createElement("div");
      givenSuggestion.classList.add("suggestion");
  
      const inputField = document.createElement("input");
      inputField.setAttribute("type", "radio");
      inputField.setAttribute("name", "sugg");
      inputField.setAttribute("id", `sugg-${i + 1}`);
      const associatedLabel = document.createElement("label");
      associatedLabel.setAttribute("for", `sugg-${i + 1}`);
      associatedLabel.innerText = manipulatedSugg[i];
  
      givenSuggestion.append(inputField, associatedLabel);
  
      if (i === 0) {
        inputField.setAttribute("checked", "");
        associatedLabel.parentElement.classList.add("checked");
      }
  
      containerForm.append(givenSuggestion);
    }
  
    const submitBtn = document.createElement("input");
    submitBtn.setAttribute("type", "submit");
    submitBtn.setAttribute("value", "Submit Answer");
    submitBtn.classList.add("submit-response");
    containerForm.append(submitBtn);
  }
  function shuffleArray(array) {
    const arrayClone = [...array];
    const length = arrayClone.length;

    for (let i = length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayClone[i], arrayClone[j]] = [arrayClone[j], arrayClone[i]];
    }

    return arrayClone;
}

function nextOnSubmit(questions) {
  containerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentQuest = newQuest(questions);
  });
}

function newQuest(questions, verify = true) {
  if (currentTimerHandler) {
    clearTimeout(currentTimerHandler);
  }

  if (verify) {
    verifyInput();
  }

  if (questionNum < tentatives) {
    setBullets(questionNum);
    questionNum++;

    currentQuest = getRandomQuestion(questions);
    setQuestion(currentQuest);

    setTime(minutes, seconds, questions);

    return currentQuest;
  }

  if (questionNum === tentatives) {
    clearTimeout(currentTimerHandler);
    showResult();
    decisionListener(questions);
  }
}

function setBullets(questionNum) {
  const bullets = [...document.querySelectorAll(".bullet")];
  for (let i = 0; i < questionNum; i++) {
    bullets[questionNum].classList.add("reached");
  }
  if(questionNum === 0){
    bullets[questionNum].classList.add("reached");
  }
}

function setTime(minutes, seconds, questions) {
  const timer = document.querySelector(".timer");

  let remainingSeconds = minutes * 60 + seconds;

  function updateTimer() {
    const formattedMinutes = Math.floor(remainingSeconds / 60);
    const formattedSeconds = remainingSeconds % 60;

    timer.innerText = `${formatNums(formattedMinutes)}:${formatNums(formattedSeconds)}`;

    if (remainingSeconds === 0) {
      clearTimeout(currentTimerHandler);
      currentQuest = newQuest(questions);
    } else {
      remainingSeconds--;
      currentTimerHandler = setTimeout(updateTimer, 1000);
    }
  }

  updateTimer();
}

function formatNums(num) {
  const formattedNum = num < 10 ? `0${num}` : num;
  return formattedNum;
}

function verifyInput() {
  const selectedInput = document.querySelector('input[name="sugg"]:checked');
  if (selectedInput) {
    const labelFor = selectedInput.getAttribute("id");
    const associatedLabel = document.querySelector(`label[for="${labelFor}"]`);
    const value = associatedLabel.innerText;
    const solution = currentQuest.correct_answer;

    if (goodAnswers < tentatives) {
      if(solution === value)
      {
      goodAnswers++;
      const correctSound = document.querySelector("audio.correct");
      stopAndPlayAudio(correctSound);
      }
     else {
      const wrongSound = document.querySelector("audio.wrong");
      stopAndPlayAudio(wrongSound);
    }
  }
}
}

function showResult() {
  showDecisionForm();
  interactWithUser();
  const correctAnswers = document.querySelector(".decision .correct");
  const totalQuest = document.querySelector(".decision .total");

  correctAnswers.innerText = goodAnswers;
  totalQuest.innerText = tentatives;
}

function showDecisionForm() {
  container.style.display = "none";
  decision.style.display = "block";
}
function interactWithUser() {
  if (goodAnswers === tentatives) {
    score++;
    setScore(score);
    const successSound = document.querySelector("audio.success");
    stopAndPlayAudio(successSound);
  } else if (goodAnswers === 0) {
    const loseSound = document.querySelector("audio.lose");
    stopAndPlayAudio(loseSound);
  }
}

function decisionListener(questions) {
  decision.addEventListener("submit", (e) => {
    e.preventDefault();
    hideDecisionForm();
    restartGame(questions);
  });
  decision.addEventListener("reset", (e) => {
    e.preventDefault();
    quitGame();
  });
}

function hideDecisionForm() {
  container.style.display = "block";
  decision.style.display = "none";
}

function restartGame(questions) {

  questionNum = 0;
  goodAnswers = 0;

  removeBullets();

  questions.forEach((q) => (q.alreadyDone ? (q.alreadyDone = false) : ""));
  
  currentQuest = newQuest(questions, false);
}


function quitGame() {
  decision.style.display = "none";
}

function removeBullets() {
  const bullets = [...document.querySelectorAll(".bullet")];
  for (let i = 0; i < tentatives; i++) {
    bullets[i].classList.remove("reached");
  }
}

function stopAndPlayAudio(audioElement) {
  const allAudioElements = document.getElementsByTagName("audio");

  for (let i = 0; i < allAudioElements.length; i++) {
    const audio = allAudioElements[i];
    if (audio !== audioElement) {
      audio.pause();
    }
  }

  audioElement.play();
}
