import axios from "axios";

const wordsUrl =
  "https://raw.githubusercontent.com/Taknok/French-Wordlist/master/francais.txt";

const game = document.querySelector("#game")!;
const playButton = document.querySelector<HTMLButtonElement>("#play")!;
const welcomeScreen = document.querySelector("#welcome")!;
const gameScreen = document.querySelector("#game")!;
const wordDisplay = document.querySelector("#word-display")!;
const wrongLettersDiv = document.querySelector("#wrong-letters")!;

const letterInput =
  document.querySelector<HTMLInputElement>("#character-input")!;
const tryLetterButton = document.querySelector<HTMLButtonElement>("#try")!;

let gameStarted = false;
let wordToGuess = "";
let guessedLetters: string[] = [];
let guessedLettersDisplay = new Map<string, HTMLSpanElement[]>();
const wrongLetters: string[] = [];

playButton.addEventListener("click", () => {
  startGame();
});

tryLetterButton.addEventListener("click", () => {
  tryLetter();
});

letterInput.addEventListener("input", () => {
  const pressedKey = letterInput.value;
  if (pressedKey === "") {
    changeInputCorrectness(true);
    return;
  }
  if (isLetter(pressedKey)) {
    hintInput(pressedKey);
  } else {
    changeInputCorrectness(false);
  }
});

letterInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") tryLetter();
});

async function startGame() {
  welcomeScreen.classList.add("hidden");
  game.classList.remove("hidden");

  const wordList = (await axios.get(wordsUrl)).data
    .split("\n")
    .map((w: string) => w.replace(/[\n\r]+/g, "").toLowerCase());

  const i = randint(0, wordList.length - 1);
  wordToGuess = wordList[i];

  guessedLetters = Array(wordToGuess.length).fill("");
  wordToGuess.split("").forEach((letter) => {
    const element = document.createElement("span");
    element.classList.add("guessed-letter");
    element.innerText = "_";
    wordDisplay.appendChild(element);
    if (guessedLettersDisplay.has(letter)) {
      guessedLettersDisplay.get(letter)!.push(element);
    } else {
      guessedLettersDisplay.set(letter, [element]);
    }
  });
  letterInput.value = "";
  gameStarted = true;
}

function isLetter(str: string) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function changeInputCorrectness(isValid: boolean) {
  if (isValid) {
    tryLetterButton.disabled = false;
    letterInput.classList.remove("invalid");
  } else {
    tryLetterButton.disabled = true;
    letterInput.classList.add("invalid");
  }
}

function displayGuessedLetter(letter: string) {
  const elements = guessedLettersDisplay.get(letter)!;
  elements.forEach((element) => {
    element.innerText = letter;
    element.classList.add("animated");
    setTimeout(() => element.classList.remove("animated"), 400);
  });
}

function displayWrongLetter(letter: string) {
  const cell = document.createElement("div");
  cell.innerText = letter;
  cell.classList.add("wrong-letter", "animated");
  wrongLettersDiv.appendChild(cell);
  setTimeout(() => cell.classList.remove("animated"), 400);
}

function hintInput(letter: string) {
  // Check if letter is already guessed
  let correctInput = true;

  if (guessedLetters.includes(letter)) {
    const letterElements = guessedLettersDisplay.get(letter)!;
    letterElements.forEach((letterElement) => {
      letterElement.classList.add("animated");
      setTimeout(() => letterElement.classList.remove("animated"), 400);
    });
    correctInput = false;
  }

  // Check if letter is already wrong
  if (wrongLetters.includes(letter)) {
    const letterElements = Array.from(
      wrongLettersDiv.children
    ) as HTMLElement[];
    letterElements.forEach((letterElement) => {
      if (letterElement.innerText === letter) {
        letterElement.classList.add("animated");
        setTimeout(() => letterElement.classList.remove("animated"), 400);
      }
    });

    correctInput = false;
  }

  changeInputCorrectness(correctInput);
}

function checkWin() {
  let won = true;
  guessedLetters.forEach((l) => {
    if (l === "") won = false;
  });
  if (won) alert("You won!");
}

function randint(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tryLetter() {
  const letter = letterInput.value.toLowerCase();
  if (!isLetter(letter)) {
    letterInput.value = "";
    return;
  }

  if (wrongLetters.includes(letter) || letter in guessedLetters) return;

  let wasGuessed = false;
  for (let i = 0; i < wordToGuess.length; i++) {
    if (wordToGuess[i] == letter) {
      guessedLetters[i] = letter;
      wasGuessed = true;
    }
  }

  if (!wasGuessed) {
    wrongLetters.push(letter);
    displayWrongLetter(letter);
  } else {
    displayGuessedLetter(letter);
    checkWin();
  }

  letterInput.value = "";
}