// DOM elements
const elements = {
    paragraphContainer: document.querySelector(".container__paragraph"),
    leftTimeContainer: document.querySelector(".time-left span"),
    replayButtons: document.querySelectorAll("button.replay"),
    scoreContainer: document.querySelector(".score span"),
    mistakesContainer: document.querySelector(".mistakes span"),
    container: document.querySelector(".container"),
    dialog: document.querySelector(".dialog"),
    correctNumContainer: document.querySelector(".dialog__paragraph .correct"),
    totalNumContainer: document.querySelector(".dialog__paragraph .total"),
    elapsedTimeContainer: document.querySelector(".dialog__paragraph .time"),
    playBtn: document.querySelector(".play"),
  };
  
  // Game state variables
  let pressHandler = null;
  let timeHandler = null;
  let charIndex = null;
  let nodeChars = null;
  let pLength = null;
  let mistakes = null;
  let score = null;
  let leftTime = null;
  const DURATION = 60;
  
  // Initialize a new game
  newGame();
  
  // Get a random paragraph
  function getRandomParagraph() {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    const paragraph = paragraphs[randomIndex];
    pLength = paragraph.length;
    return paragraph;
  }
  
  // Populate the paragraph container with the selected paragraph
  function setParagraph(paragraph) {
    elements.paragraphContainer.innerHTML = paragraph.split('').map(char => `<span>${char}</span>`).join('');
    nodeChars = elements.paragraphContainer.children;
  }
  
  // Countdown timer
  function countDown() {
    timeHandler = setInterval(() => {
      updateLeftTime(leftTime);
      if (leftTime) {
        leftTime--;
      } else {
        clearInterval(timeHandler);
        setDialog();
        showDialog();
      }
    }, 1000);
  }
  
  // Start a new game
  function newGame() {
    clearInterval(timeHandler);
    leftTime = DURATION;
    mistakes = 0;
    score = 0;
    updateLeftTime(leftTime);
    updateScore(0);
    updateMistakes(0);
    charIndex = 0;
    elements.paragraphContainer.innerHTML = '';
    const para = getRandomParagraph();
    setParagraph(para);
  }
  
  // Event listeners for replay buttons
  elements.replayButtons.forEach((replayBtn, index) => {
    replayBtn.addEventListener("click", () => {
      if (index === 1) {
        hideDialog();
      }
      newGame();
      countDown();
    });
  });
  
  // Event listener for the "Play" button and keyboard input
  elements.playBtn.addEventListener("click", function () {
    this.style.display = "none";
    elements.replayButtons[0].style.display = "block";
    countDown();
    let increased = false;
  
    pressHandler = document.addEventListener("keydown", (e) => {
      const entry = e.key;
  
      if (entry.length === 1 && /[A-Za-z\s.,]/.test(entry)) {
        const nodeChar = nodeChars[charIndex];
        const checkResult = entry === nodeChar.innerText;
  
        if (checkResult) {
          nodeChar.classList.add("correct");
          score++;
          updateScore(score);
        } else {
          nodeChar.classList.add("wrong");
          mistakes++;
          updateMistakes(mistakes);
        }
        charIndex++;
        increased = true;
  
        if (charIndex === pLength) {
          removeEventListener("keydown", pressHandler);
          setDialog();
          showDialog();
        }
      } else if (["ArrowLeft", "Backspace"].includes(entry)) {
        if (charIndex > 0) {
          charIndex--;
          const nodeChar = nodeChars[charIndex];
          nodeChar.classList.remove("correct", "wrong");
        }
      }
    });
  });
  
  // Format numbers with leading zeros
  function formatNums(num) {
    return num < 10 ? '0' + num : num.toString();
  }
  
  // Update the displayed remaining time
  function updateLeftTime(leftTime) {
    elements.leftTimeContainer.innerText = `${formatNums(leftTime)} s`;
  }
  
  // Update the displayed score
  function updateScore(score) {
    elements.scoreContainer.innerText = formatNums(score);
  }
  
  // Update the displayed mistake count
  function updateMistakes(mistakes) {
    elements.mistakesContainer.innerText = formatNums(mistakes);
  }
  
  // Update the dialog with game statistics
  function setDialog() {
    elements.elapsedTimeContainer.innerText = `${formatNums(DURATION - leftTime)}s`;
    elements.correctNumContainer.innerText = score;
    elements.totalNumContainer.innerText = pLength;
  }
  
  // Display the game dialog
  function showDialog() {
    elements.container.style.display = "none";
    elements.dialog.style.display = "block";
  }
  
  // Hide the game dialog
  function hideDialog() {
    elements.container.style.display = "block";
    elements.dialog.style.display = "none";
  }
  