const board = [
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
]
let score = 0
let highScore = localStorage.getItem('highScore') || 0
let gameOver = false
let previousBoard = []
let previousScore = 0

// DOM elementlari
const gameBoard = document.getElementById('gameBoard')
const scoreElement = document.getElementById('score')
const highScoreElement = document.getElementById('highScore')
const gameOverDisplay = document.getElementById('gameOver')
const gameOverText = document.getElementById('gameOverText')
const finalScoreDisplay = document.getElementById('finalScore')
const ratingElement = document.getElementById('rating')
const restartBtn = document.getElementById('restartBtn')
const undoBtn = document.getElementById('undoBtn')
const currentTimeElement = document.getElementById('currentTime')

// Ovoz effektlari
const smallMergeSound = new Audio(
	'https://www.soundjay.com/buttons/sounds/button-09.mp3'
)
const mediumMergeSound = new Audio(
	'https://www.soundjay.com/buttons/sounds/button-10.mp3'
)
const largeMergeSound = new Audio(
	'https://www.soundjay.com/buttons/sounds/button-11.mp3'
)
const winSound = new Audio('https://www.soundjay.com/misc/sounds/success-1.mp3')
const loseSound = new Audio('https://www.soundjay.com/misc/sounds/fail-1.mp3')

highScoreElement.textContent = highScore

function updateTime() {
	const now = new Date()
	const day = String(now.getDate()).padStart(2, '0')
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const year = now.getFullYear()
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	const seconds = String(now.getSeconds()).padStart(2, '0')
	currentTimeElement.textContent = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
}
setInterval(updateTime, 1000)
updateTime()

document.addEventListener(
	'touchmove',
	e => {
		if (e.target.closest('#gameContainer')) return
		e.preventDefault()
	},
	{ passive: false }
)

function saveState() {
	previousBoard = board.map(row => [...row])
	previousScore = score
}

function undoMove() {
	if (!previousBoard.length) return
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			board[i][j] = previousBoard[i][j]
		}
	}
	score = previousScore
	updateBoard()
	previousBoard = []
	undoBtn.disabled = true
}

function initBoard() {
	gameBoard.innerHTML = ''
	score = 0
	scoreElement.textContent = score
	gameOver = false
	gameOverDisplay.style.display = 'none'
	previousBoard = []
	undoBtn.disabled = true
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			board[i][j] = 0
			const tile = document.createElement('div')
			tile.classList.add('tile')
			tile.dataset.value = board[i][j]
			tile.textContent = board[i][j] !== 0 ? board[i][j] : ''
			gameBoard.appendChild(tile)
		}
	}
	addRandomTile()
	addRandomTile()
	updateBoard()
}

function addRandomTile() {
	const emptyCells = []
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			if (board[i][j] === 0) emptyCells.push({ i, j })
		}
	}
	if (emptyCells.length > 0) {
		const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
		board[i][j] = Math.random() < 0.9 ? 2 : 4
	}
}

function updateBoard() {
	const tiles = document.querySelectorAll('.tile')
	tiles.forEach((tile, index) => {
		const i = Math.floor(index / 4)
		const j = index % 4
		tile.dataset.value = board[i][j]
		tile.textContent = board[i][j] !== 0 ? board[i][j] : ''
		tile.classList.remove('new', 'merged')
		if (board[i][j] !== 0) tile.classList.add('new')
	})
	scoreElement.textContent = score
	if (score > highScore) {
		highScore = score
		highScoreElement.textContent = highScore
		localStorage.setItem('highScore', highScore)
	}
	if (checkWin()) {
		gameOver = true
		gameOverText.textContent = 'Tabriklaymiz! Siz 2048 ga erishdingiz!'
		finalScoreDisplay.textContent = score
		ratingElement.textContent = `Reyting: ${calculateRating()}`
		gameOverDisplay.style.display = 'block'
		winSound.play().catch(() => {})
	} else if (checkLose()) {
		gameOver = true
		gameOverText.textContent = "O'yin tugadi!"
		finalScoreDisplay.textContent = score
		ratingElement.textContent = `Reyting: ${calculateRating()}`
		gameOverDisplay.style.display = 'block'
		loseSound.play().catch(() => {})
	}
}

function calculateRating() {
	const maxScore = 2048 * 2
	const scorePercentage = (score / maxScore) * 100
	if (scorePercentage >= 80) return '★★★'
	if (scorePercentage >= 50) return '★★'
	return '★'
}

function playMergeSound(value) {
	if (value <= 4) smallMergeSound.play().catch(() => {})
	else if (value <= 32) mediumMergeSound.play().catch(() => {})
	else largeMergeSound.play().catch(() => {})
}

function moveLeft() {
	let moved = false
	for (let i = 0; i < 4; i++) {
		let row = board[i].filter(val => val !== 0)
		for (let j = 0; j < row.length - 1; j++) {
			if (row[j] === row[j + 1]) {
				const mergedValue = row[j] * 2
				row[j] = mergedValue
				score += mergedValue
				playMergeSound(mergedValue)
				row.splice(j + 1, 1)
				j--
			}
		}
		while (row.length < 4) row.push(0)
		if (board[i].join() !== row.join()) moved = true
		board[i] = row
	}
	return moved
}

function moveRight() {
	let moved = false
	for (let i = 0; i < 4; i++) {
		let row = board[i].filter(val => val !== 0)
		for (let j = row.length - 1; j > 0; j--) {
			if (row[j] === row[j - 1]) {
				const mergedValue = row[j] * 2
				row[j] = mergedValue
				score += mergedValue
				playMergeSound(mergedValue)
				row.splice(j - 1, 1)
				j++
			}
		}
		while (row.length < 4) row.unshift(0)
		if (board[i].join() !== row.join()) moved = true
		board[i] = row
	}
	return moved
}

function moveUp() {
	let moved = false
	for (let j = 0; j < 4; j++) {
		let col = [board[0][j], board[1][j], board[2][j], board[3][j]].filter(
			val => val !== 0
		)
		for (let i = 0; i < col.length - 1; i++) {
			if (col[i] === col[i + 1]) {
				const mergedValue = col[i] * 2
				col[i] = mergedValue
				score += mergedValue
				playMergeSound(mergedValue)
				col.splice(i + 1, 1)
				i--
			}
		}
		while (col.length < 4) col.push(0)
		for (let i = 0; i < 4; i++) {
			if (board[i][j] !== col[i]) moved = true
			board[i][j] = col[i]
		}
	}
	return moved
}

function moveDown() {
	let moved = false
	for (let j = 0; j < 4; j++) {
		let col = [board[0][j], board[1][j], board[2][j], board[3][j]].filter(
			val => val !== 0
		)
		for (let i = col.length - 1; i > 0; i--) {
			if (col[i] === col[i - 1]) {
				const mergedValue = col[i] * 2
				col[i] = mergedValue
				score += mergedValue
				playMergeSound(mergedValue)
				col.splice(i - 1, 1)
				i++
			}
		}
		while (col.length < 4) col.unshift(0)
		for (let i = 0; i < 4; i++) {
			if (board[i][j] !== col[i]) moved = true
			board[i][j] = col[i]
		}
	}
	return moved
}

function checkWin() {
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			if (board[i][j] === 2048) return true
		}
	}
	return false
}

function checkLose() {
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			if (board[i][j] === 0) return false
			if (i < 3 && board[i][j] === board[i + 1][j]) return false
			if (j < 3 && board[i][j] === board[i][j + 1]) return false
		}
	}
	return true
}

document.addEventListener('keydown', e => {
	if (gameOver) return
	saveState()
	let moved = false
	if (e.key === 'ArrowLeft') moved = moveLeft()
	else if (e.key === 'ArrowRight') moved = moveRight()
	else if (e.key === 'ArrowUp') moved = moveUp()
	else if (e.key === 'ArrowDown') moved = moveDown()
	if (moved) {
		addRandomTile()
		updateBoard()
		undoBtn.disabled = false
	}
})

let touchStartX = 0
let touchStartY = 0
document.addEventListener('touchstart', e => {
	touchStartX = e.touches[0].clientX
	touchStartY = e.touches[0].clientY
})
document.addEventListener('touchend', e => {
	if (gameOver) return
	saveState()
	const touchEndX = e.changedTouches[0].clientX
	const touchEndY = e.changedTouches[0].clientY
	const dx = touchEndX - touchStartX
	const dy = touchEndY - touchStartY
	let moved = false
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx > 30) moved = moveRight()
		else if (dx < -30) moved = moveLeft()
	} else {
		if (dy > 30) moved = moveDown()
		else if (dy < -30) moved = moveUp()
	}
	if (moved) {
		addRandomTile()
		updateBoard()
		undoBtn.disabled = false
	}
})

restartBtn.addEventListener('click', () => {
	initBoard()
})

undoBtn.addEventListener('click', () => {
	undoMove()
})

initBoard()
