// Define API URL and API Key
const apiUrl = 'https://api.jsonbin.io/v3/b/65032892e4033326cbd791c3';
const apiKey = '$2b$10$pAsYDr/KEAUrJkFc6VLYQ.cOzqC8GJV7k.2xznhRbIRm6NvrLeTQu';

// UI elements & Track Variables
const questPlaceHolder = document.querySelector('.infos__question span');
const hintPlaceHolder = document.querySelector('.infos__hint span');
const categoryPlaceHolder = document.querySelector('.infos__category span');
const scoreHolder = document.querySelector('.hangman__score');
const keyboardTouches = Array.from(document.querySelectorAll('.interaction__keyboard div'));
const keyboard = document.querySelector('.interaction__keyboard');
const designParts = Array.from(document.querySelectorAll('.part'));
const entriesHolder = document.querySelector('.main__entries');

// Initialize game variables
let questInfo = [];
let score = getStoredScore() || 0; // Use 0 as the default score if nothing is stored
scoreHolder.innerText = score;
const tentativesNumber = designParts.length;
let revealedParts = 0;
let goodResponsesNum = 0;

//sounds
const wrong = document.getElementById('wrong');
const lose = document.getElementById('lose');
const correct = document.getElementById('correct');
const succes = document.getElementById('succes');
// Fetching Data From API
async function initializeGame() {
  try {
    const fetchedData = await fetch(apiUrl, {
      headers: {
        'X-Master-Key': apiKey,
      },
    });

    if (!fetchedData.ok) {
      throw new Error('Failed to fetch data from the API');
    }

    questInfo = (await fetchedData.json()).record;
    localStorage.setItem("questInfo",JSON.stringify(questInfo));
    startGame();
  } catch (error) {
    console.error(error);
    alert('Failed to initialize the game. Please try again later.');
  }
}
const storedQuestions = localStorage.getItem("questInfo");
if(!storedQuestions){
  initializeGame();
}
else{
  questInfo = JSON.parse(storedQuestions);
  startGame();
}

// Start new Game
function startGame() {
  const randomQuestIndex = getRandomIndex(questInfo.length);
  const randomQuest = questInfo[randomQuestIndex];
  const solution = randomQuest.solution.toUpperCase();

  questPlaceHolder.innerText = randomQuest.question;
  categoryPlaceHolder.innerText = randomQuest.category;
  hintPlaceHolder.innerText = createHint(solution);

  const entryFields = createEntryFields(solution);

  const handler = (event)=>{
    if(event.target.className === "keyboard__touch")
    {
      keyTouchHandler(event.target,solution,handler,entryFields)
    }
  }
  keyboard.addEventListener("click",handler)
}

function keyTouchHandler(key,solution,handler,entryFields) {
  key.classList.add('active');
  const solutionWithNoSpace = solution.replace(/\s/g, '').toUpperCase();
  if (solution.includes(key.innerText)) {
      correct.currentTime = 0;
      correct.play();
      const allIndexes = getAllIndexes(solution, key.innerText);
      goodResponsesNum += allIndexes.length;
      for (let i = 0; i < allIndexes.length; i++) {
          entryFields[allIndexes[i]].innerText = key.innerText;
      }
    if (goodResponsesNum === solutionWithNoSpace.length) {
        score++;
        scoreHolder.innerText = score;
        localStorage.setItem('score', score);
        keyboard.removeEventListener("click", handler);

        // Add an event listener to wait for the success sound to finish
        succes.addEventListener('ended', function () {
          if (confirm('You won! Do you want to start a new game.')) {
              window.location.reload();
          }
      });
      correct.pause();
      succes.play(); // Start playing the success sound
    }
}
else {
    if (revealedParts < tentativesNumber) {
      designParts[revealedParts].style.display = 'block';
      revealedParts++;
        wrong.currentTime=0;
        wrong.play();
    } 
     if(revealedParts === tentativesNumber) {
      keyboard.removeEventListener("click", handler);
      lose.addEventListener('ended', function () {
        if (confirm(`You lost! The Solution Is ${solution} , Do you want to start a new game.`)) {
            window.location.reload();
        }
    });
    wrong.pause();
    lose.play();
    }
  }
}

function getStoredScore() {
  const localStorageScore = localStorage.getItem('score');
  return localStorageScore ? parseInt(localStorageScore) : 0;
}

function getRandomIndex(max) {
  return Math.floor(Math.random() * max);
}

function createHint(aSolution) {
  const solutionLength = aSolution.length;

  if (solutionLength > 2) {
    const solutionFirstChar = aSolution.charAt(0);
    const solutionLastChar = aSolution.charAt(solutionLength - 1);
    const hint = solutionFirstChar + '*'.repeat(solutionLength - 2) + solutionLastChar;
    return hint;
  } else {
    return 'No hint ^_^';
  }
}

function createEntryFields(solution) {
  const entryFields = [];
  for (let i = 0; i < solution.length; i++) {
    const entryField = document.createElement('div');
    entryField.classList.add('entries__field');
    if (solution[i] === ' ') {
      entryField.classList.add('has-space');
    } 
    entryFields.push(entryField);
    entriesHolder.append(entryField);
  }
  return entryFields;
}

function getAllIndexes(string, character) {
  const allIndexes = [];

  for (let i = 0; i < string.length; i++) {
    if (string[i] === character) {
      allIndexes.push(i);
    }
  }

  return allIndexes;
}

