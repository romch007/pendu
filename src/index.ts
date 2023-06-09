import axios from 'axios'
import { pendus, surprise } from './skin'
const susTrack = require('url:./sus.mp3')

const frenchWordsUrl =
  'https://raw.githubusercontent.com/Taknok/French-Wordlist/master/francais.txt'

const englishWordsUrl = 'https://raw.githubusercontent.com/Xethron/Hangman/master/words.txt'

const game = document.querySelector('#game')!
const playButton = document.querySelector<HTMLButtonElement>('#play')!
const welcomeScreen = document.querySelector('#welcome')!
const gameScreen = document.querySelector('#game')!
const wordDisplay = document.querySelector('#word-display')!
const wrongLettersDiv = document.querySelector('#wrong-letters')!
const guyDisplay = document.querySelector<HTMLPreElement>('#guy')!

const letterInput = document.querySelector<HTMLInputElement>('#character-input')!
const tryLetterButton = document.querySelector<HTMLButtonElement>('#try')!

let gameStarted = false
let wordToGuess = ''
let guessedLetters: string[] = []
const guessedLettersDisplay = new Map<string, HTMLSpanElement[]>()
let wrongLetters: string[] = []
let wordList: string[] = []
const maxTries = pendus.length
let nbTries = 0

fetchDictionnary()

document.addEventListener('keypress', (event) => {
  if (event.key === '²') {
    guyDisplay.innerText = surprise
    const audio = new Audio(susTrack)
    audio.volume = 0.1
    audio.play()
  }
})

playButton.addEventListener('click', () => {
  startGame()
})

tryLetterButton.addEventListener('click', () => {
  if (gameStarted) {
    tryLetter()
  } else {
    startGame()
  }
})

letterInput.addEventListener('input', () => {
  if (!gameStarted) return

  const pressedKey = letterInput.value
  if (pressedKey === '') {
    changeInputCorrectness(true)
    return
  }
  if (isLetter(pressedKey)) {
    hintInput(pressedKey)
  } else {
    changeInputCorrectness(false)
  }
})

letterInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter' && gameStarted) tryLetter()
})

/**
 * Fetch dictionnary on page load
 */
async function fetchDictionnary() {
  wordList = (await axios.get(englishWordsUrl)).data
    .split('\n')
    .map((w: string) => w.replace(/[\n\r]+/g, '').toLowerCase())
}

/**
 * Start the game
 */
async function startGame() {
  welcomeScreen.classList.add('hidden')
  game.classList.remove('hidden')

  wordToGuess = randomInArray(wordList)

  guessedLetters = Array(wordToGuess.length).fill('')
  wrongLetters = []

  guessedLettersDisplay.forEach((value) => value.forEach((element) => element.remove()))
  Array.from(wrongLettersDiv.children).forEach((element) => element.remove())

  wordToGuess.split('').forEach((letter) => {
    const element = document.createElement('span')
    element.classList.add('guessed-letter')
    element.innerText = '_'
    wordDisplay.appendChild(element)
    if (guessedLettersDisplay.has(letter)) {
      guessedLettersDisplay.get(letter)!.push(element)
    } else {
      guessedLettersDisplay.set(letter, [element])
    }
  })
  letterInput.value = ''
  tryLetterButton.innerText = 'Essayer'
  nbTries = 0
  guyDisplay.innerText = ''
  gameStarted = true
  letterInput.focus()
}

/**
 * Animate the win
 */
function animateWin() {
  const childs = Array.from(wordDisplay.children) as HTMLElement[]
  const timeout = 100
  childs.forEach((element, i) => {
    setTimeout(() => {
      element.classList.add('win-animation')
      element.style.color = 'green'
      setTimeout(() => element.classList.remove('win-animation'), timeout)
    }, i * timeout)
  })
}

function animateLoss() {
  const childs = Array.from(wordDisplay.children) as HTMLElement[]
  childs.forEach((element) => {
    element.style.color = 'red'
  })
  wordDisplay.classList.add('loss-animation')
}

/**
 * Check if a given character is a alphabetical letter (note: accentuation does not count as a letter here)
 * @param str Given character
 * @returns Is the character a letter
 */
function isLetter(str: string) {
  return str.length === 1 && str.match(/[a-z]/i)
}

/**
 * Change the display of the letter input to valid or invalid
 * @param isValid Is the input currently valid?
 */
function changeInputCorrectness(isValid: boolean) {
  if (isValid) {
    tryLetterButton.disabled = false
    letterInput.classList.remove('invalid')
  } else {
    tryLetterButton.disabled = true
    letterInput.classList.add('invalid')
  }
}

/**
 * Display a guessed letter
 * @param letter Guessed letter
 */
function displayGuessedLetter(letter: string, animate = true) {
  const elements = guessedLettersDisplay.get(letter)!
  elements.forEach((element) => {
    element.innerText = letter
    if (animate) {
      element.classList.add('animated', 'not-empty')
      setTimeout(() => element.classList.remove('animated'), 400)
    }
  })
}

/**
 * Display a wrongly guessed letter
 * @param letter The wrong letter
 */
function displayWrongLetter(letter: string) {
  const cell = document.createElement('div')
  cell.innerText = letter
  cell.classList.add('wrong-letter', 'animated')
  wrongLettersDiv.appendChild(cell)
  setTimeout(() => cell.classList.remove('animated'), 400)
}

function displayGuy() {
  guyDisplay.innerText = pendus[nbTries - 1]
}

/**
 * Hint user about the validity of the input
 * @param letter The letter being currently typed
 */
function hintInput(letter: string) {
  // Check if letter is already guessed
  let correctInput = true

  if (guessedLetters.includes(letter)) {
    const letterElements = guessedLettersDisplay.get(letter)!
    letterElements.forEach((letterElement) => {
      letterElement.classList.add('animated')
      setTimeout(() => letterElement.classList.remove('animated'), 400)
    })
    correctInput = false
  }

  // Check if letter is already wrong
  if (wrongLetters.includes(letter)) {
    const letterElements = Array.from(wrongLettersDiv.children) as HTMLElement[]
    letterElements.forEach((letterElement) => {
      if (letterElement.innerText === letter) {
        letterElement.classList.add('animated')
        setTimeout(() => letterElement.classList.remove('animated'), 400)
      }
    })

    correctInput = false
  }

  changeInputCorrectness(correctInput)
}

/**
 * Check if all the letters have been guessed
 */
function checkWin() {
  let won = true
  guessedLetters.forEach((l) => {
    if (l === '') won = false
  })
  if (won) {
    animateWin()
    tryLetterButton.innerText = 'Rejouer'
    gameStarted = false
  }
}

function checkLoss() {
  if (nbTries >= maxTries) {
    animateLoss()
    tryLetterButton.innerText = 'Rejouer'
    showFullWord()
    gameStarted = false
  }
}

/**
 * Get a random integer in `[min; max]`
 * @param min The lower bound
 * @param max The upper bound
 * @returns The random number
 */
function randint(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Return a random element in an array
 * @param array The array
 * @returns The random element
 */
function randomInArray<T>(array: T[]): T {
  const i = randint(0, array.length)
  return array[i]
}

/**
 * Try to guess a letter
 */
function tryLetter() {
  const letter = letterInput.value.toLowerCase()
  if (!isLetter(letter)) {
    letterInput.value = ''
    return
  }

  if (wrongLetters.includes(letter) || letter in guessedLetters) return

  let wasGuessed = false
  for (let i = 0; i < wordToGuess.length; i++) {
    if (wordToGuess[i] == letter) {
      guessedLetters[i] = letter
      wasGuessed = true
    }
  }

  if (!wasGuessed) {
    wrongLetters.push(letter)
    displayWrongLetter(letter)
    nbTries++
    displayGuy()
    checkLoss()
  } else {
    displayGuessedLetter(letter)
    checkWin()
  }

  letterInput.value = ''
  letterInput.focus()
}

/**
 * Display full word
 */
function showFullWord() {
  const letters = [...wordToGuess]
  letters.forEach((letter) => displayGuessedLetter(letter, false))
}
