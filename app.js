// ######### Initialize important variables
// Select Elements
const grid = document.querySelector('.board')
const scoreEl = document.getElementById('score')
const playBtn = document.querySelector('.play-btn')
const submitBtn = document.querySelector('.submit-btn')
const nameInp = document.getElementById('name')
const layer = document.querySelector('.layer')
const SoundEl = document.querySelector('audio')

// Specific vars
let score = 0
let leap = 10
const blockWidth = 100
const blockHeight = 20
const boardWidth = 560
const boardHeight = 300
const ballDiameter = 25

// ##### ball and user positions
const userStart = [230, 10]
let currentPosition = userStart
const ballStart = [265, 40]
let currentBallPosition = ballStart
// Variables for moved distance by ball
let xDirection = 2
let yDirection = 2
let timerId

// ## remove layer and get userName
let userName = ''

if (window.localStorage.getItem('userName')) {
  layer.classList.add('d-none')
  document.querySelector('.user-name').innerText =
    window.localStorage.getItem('userName')
} else {
  submitBtn.addEventListener('click', removeLayerAndAddName)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      removeLayerAndAddName()
    }
  })
}

function removeLayerAndAddName() {
  if (nameInp.value.length >= 3) {
    layer.classList.add('d-none')
    userName = nameInp.value
    window.localStorage.setItem('userName', userName)
    document.querySelector('.user-name').innerText = userName
  }
}

// create a block class
class Block {
  constructor(xAxis, yAxis) {
    this.bottomLeft = [xAxis, yAxis]
    this.bottomRight = [xAxis + blockWidth, yAxis]
    this.topLeft = [xAxis, yAxis + blockHeight]
    this.topRight = [xAxis + blockWidth, yAxis + blockHeight]
  }
}

// levels object with time intervals
const levelsObj = {
  1: 32,
  2: 28,
  3: 23,
  4: 19,
  5: 17,
  6: 13,
  7: 9,
  8: 8,
  9: 7,
  10: 5,
  11: 4.5,
  12: 4,
}

// Create Block Elements
let blocks = [
  new Block(10, 270),
  new Block(120, 270),
  new Block(230, 270),
  new Block(340, 270),
  new Block(450, 270),

  new Block(10, 240),
  new Block(120, 240),
  new Block(230, 240),
  new Block(340, 240),
  new Block(450, 240),

  new Block(10, 210),
  new Block(120, 210),
  new Block(230, 210),
  new Block(340, 210),
  new Block(450, 210),
]

function addBlocks() {
  for (let i = 0; i < blocks.length; i++) {
    const block = document.createElement('div')
    block.classList.add('block')
    block.style.left = blocks[i].bottomLeft[0] + 'px'
    block.style.bottom = blocks[i].bottomLeft[1] + 'px'
    grid.appendChild(block)
  }
}

addBlocks()

// Add user
const user = document.createElement('div')
user.classList.add('user')
drawUser()
grid.appendChild(user)

// Add ball
const ballEl = document.createElement('div')
ballEl.classList.add('ball')
drawBall()
grid.appendChild(ballEl)

// Draw ball
function drawBall() {
  ballEl.style.left = currentBallPosition[0] + 'px'
  ballEl.style.bottom = currentBallPosition[1] + 'px'
}

// Draw user
function drawUser() {
  user.style.left = currentPosition[0] + 'px'
  user.style.bottom = currentPosition[1] + 'px'
}

document.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    playBtn.click()
  }
})

// Move user
function moveUser(e) {
  switch (e.key) {
    case 'ArrowLeft':
      if (currentPosition[0] > leap - 10) {
        currentPosition[0] -= leap
        drawUser()
      }
      break
    case 'ArrowRight':
      if (currentPosition[0] < boardWidth - blockWidth - leap + 1) {
        currentPosition[0] += leap
        drawUser()
      }
      break
  }
}

// move ball
function moveBall() {
  currentBallPosition[0] += xDirection
  currentBallPosition[1] += yDirection
  drawBall()
}

// check for collisions
function checkCollisions() {
  // Check for block collisions
  for (let i = 0; i < blocks.length; i++) {
    if (
      currentBallPosition[0] > blocks[i].bottomLeft[0] &&
      currentBallPosition[0] < blocks[i].bottomRight[0] &&
      currentBallPosition[1] + ballDiameter > blocks[i].bottomLeft[1] &&
      currentBallPosition[1] + ballDiameter < blocks[i].topLeft[1]
    ) {
      const allBlocks = Array.from(document.querySelectorAll('.block'))
      allBlocks[i].classList.remove('block')
      blocks.splice(i, 1)
      score++
      if (blocks.length === 0) {
        scoreEl.firstElementChild.textContent = 'You Win !'
        clearInterval(timerId)
        document.removeEventListener('keydown', moveUser)
        score = 0
      } else {
        scoreEl.firstElementChild.textContent = score.toString()
      }
      changeDirection('y')
    }
  }
  // check for user collision
  if (
    currentBallPosition[0] > currentPosition[0] &&
    currentBallPosition[0] < currentPosition[0] + blockWidth &&
    currentBallPosition[1] > currentPosition[1] &&
    currentBallPosition[1] < currentPosition[1] + blockHeight
  ) {
    changeDirection('y')
    playSound()
  }

  if (
    currentBallPosition[0] >= boardWidth - ballDiameter ||
    currentBallPosition[0] <= 0
  ) {
    changeDirection('x')
  } else if (currentBallPosition[1] >= boardHeight - ballDiameter) {
    changeDirection('y')
  }

  // check for game over
  if (currentBallPosition[1] <= 0) {
    clearInterval(timerId)
    scoreEl.firstElementChild.textContent = 'You Lose !'
    document.removeEventListener('keydown', moveUser)
  }
}
// Change direction(when collision)
function changeDirection(dir) {
  if (dir === 'x') {
    xDirection = -xDirection
  } else if (dir === 'y') {
    yDirection = -yDirection
  }
}

// Playing game when clicking button

playBtn.addEventListener('click', playGame)

function playGame() {
  score = 0
  scoreEl.firstElementChild.textContent = '0'
  const levelEl = document.getElementById('level')
  const level = +levelEl.value
  if (blocks.length < 15) {
    const blockElements = document.querySelectorAll('.block')
    blockElements.forEach((ele) => {
      ele.remove()
    })
    blocks = [
      new Block(10, 270),
      new Block(120, 270),
      new Block(230, 270),
      new Block(340, 270),
      new Block(450, 270),

      new Block(10, 240),
      new Block(120, 240),
      new Block(230, 240),
      new Block(340, 240),
      new Block(450, 240),

      new Block(10, 210),
      new Block(120, 210),
      new Block(230, 210),
      new Block(340, 210),
      new Block(450, 210),
    ]

    addBlocks()
  }
  currentBallPosition = [265, 40]
  xDirection = 2
  yDirection = 2

  // update leap according the level
  updateLevel(level)

  drawBall()
  clearInterval(timerId)
  document.addEventListener('keydown', moveUser)
  timerId = setInterval(() => {
    moveBall()
    checkCollisions()
  }, levelsObj[level])
}

// play Sound When user collision
function playSound() {
  setTimeout(() => {
    SoundEl.play()
  }, 100)
}

function updateLevel(l) {
  switch (l) {
    case 9:
      leap = 15
      break
    case 10:
      leap = 20
      break
    case 11:
      leap = 25
      break
    case 12:
      leap = 30
      break
    default:
      leap = 10
  }
}
