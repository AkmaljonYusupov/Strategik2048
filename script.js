// 4x4 o'yin taxtasi massivi
const board = [
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
]
let score = 0 // Joriy ochko
let highScore = localStorage.getItem('highScore') || 0 // Eng yuqori natija
let gameOver = false // O'yin tugaganligi holati
// DOM elementlari
const gameBoard = document.getElementById('gameBoard')
const scoreElement = document.getElementById('score')
const highScoreElement = document.getElementById('highScore')
const gameOverDisplay = document.getElementById('gameOver')
const gameOverText = document.getElementById('gameOverText')
const finalScoreDisplay = document.getElementById('finalScore')
const ratingElement = document.getElementById('rating')
const restartBtn = document.getElementById('restartBtn')
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

// Eng yuqori natijani ko'rsatish
highScoreElement.textContent = highScore

// Real vaqtni yangilash funksiyasi
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
setInterval(updateTime, 1000) // Har soniyada yangilash
updateTime()

// O'yin taxtasini boshlash (sahifani yangilamasdan)
function initBoard() {
	gameBoard.innerHTML = '' // Taxtani tozalash
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			const tile = document.createElement('div')
			tile.classList.add('tile')
			tile.dataset.value = board[i][j]
			tile.textContent = board[i][j] !== 0 ? board[i][j] : ''
			gameBoard.appendChild(tile) // Plitkalarni qo'shish
		}
	}
	addRandomTile() // 2 ta tasodifiy plitka qo'shish
	addRandomTile()
	updateBoard()
}

// Tasodifiy plitka qo'shish (2 yoki 4)
function addRandomTile() {
	const emptyCells = []
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			if (board[i][j] === 0) emptyCells.push({ i, j })
		}
	}
	if (emptyCells.length > 0) {
		const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
		board[i][j] = Math.random() < 0.9 ? 2 : 4 // 90% 2, 10% 4
	}
}

// O'yin taxtasini yangilash
function updateBoard() {
	const tiles = document.querySelectorAll('.tile')
	tiles.forEach((tile, index) => {
		const i = Math.floor(index / 4)
		const j = index % 4
		tile.dataset.value = board[i][j]
		tile.textContent = board[i][j] !== 0 ? board[i][j] : ''
		tile.classList.remove('new', 'merged')
		if (board[i][j] !== 0) tile.classList.add('new') // Yangi plitka animatsiyasi
	})
	scoreElement.textContent = score // Ochko yangilash
	if (score > highScore) {
		highScore = score
		highScoreElement.textContent = highScore
		localStorage.setItem('highScore', highScore) // Eng yuqori natijani saqlash
	}
	// Yutish holatini tekshirish
	if (checkWin()) {
		gameOver = true
		gameOverText.textContent = 'Tabriklaymiz! Siz 2048 ga erishdingiz!'
		finalScoreDisplay.textContent = score
		ratingElement.textContent = `Reyting: ${calculateRating()}`
		gameOverDisplay.style.display = 'block'
		winSound.play().catch(() => {})
		// Yutqazish holatini tekshirish
	} else if (checkLose()) {
		gameOver = true
		gameOverText.textContent = "O'yin tugadi!"
		finalScoreDisplay.textContent = score
		ratingElement.textContent = `Reyting: ${calculateRating()}`
		gameOverDisplay.style.display = 'block'
		loseSound.play().catch(() => {})
	}
}

// Reytingni hisoblash
function calculateRating() {
	const maxScore = 2048 * 2
	const scorePercentage = (score / maxScore) * 100
	if (scorePercentage >= 80) return '★★★'
	if (scorePercentage >= 50) return '★★'
	return '★'
}

// Birlashish ovozini ijro etish
function playMergeSound(value) {
	if (value <= 4) smallMergeSound.play().catch(() => {})
	else if (value <= 32) mediumMergeSound.play().catch(() => {})
	else largeMergeSound.play().catch(() => {})
}

// Chapga harakat
function moveLeft() {
	let moved = false
	for (let i = 0; i < 4; i++) {
		let row = board[i].filter(val => val !== 0) // Bo'sh bo'lmagan plitkalar
		for (let j = 0; j < row.length - 1; j++) {
			if (row[j] === row[j + 1]) {
				const mergedValue = row[j] * 2
				row[j] = mergedValue
				score += mergedValue // Ochko qo'shish
				playMergeSound(mergedValue)
				row.splice(j + 1, 1)
				j--
			}
		}
		while (row.length < 4) row.push(0) // Bo'sh joylarni 0 bilan to'ldirish
		if (board[i].join() !== row.join()) moved = true
		board[i] = row
	}
	return moved
}

// O'ngga harakat
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

// Yuqoriga harakat
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

// Pastga harakat
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

// Yutish holatini tekshirish (2048 plitkasi)
function checkWin() {
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			if (board[i][j] === 2048) return true
		}
	}
	return false
}

// Yutqazish holatini tekshirish (harakat qolmasa)
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

// Klaviatura hodisalari
document.addEventListener('keydown', e => {
	if (gameOver) return
	let moved = false
	if (e.key === 'ArrowLeft') moved = moveLeft()
	else if (e.key === 'ArrowRight') moved = moveRight()
	else if (e.key === 'ArrowUp') moved = moveUp()
	else if (e.key === 'ArrowDown') moved = moveDown()
	if (moved) {
		addRandomTile() // Harakat bo'lsa yangi plitka qo'shish
		updateBoard()
	}
})

// Mobil surish hodisalari
let touchStartX = 0
let touchStartY = 0
document.addEventListener('touchstart', e => {
	touchStartX = e.touches[0].clientX
	touchStartY = e.touches[0].clientY
})
document.addEventListener('touchend', e => {
	if (gameOver) return
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
	}
})

// Qayta boshlash tugmasi (sahifani yangilamasdan)
restartBtn.addEventListener('click', () => {
	score = 0
	gameOver = false
	scoreElement.textContent = score
	gameOverDisplay.style.display = 'none'
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			board[i][j] = 0 // Taxtani tozalash
		}
	}
	initBoard() // O'yinni qayta boshlash
})

initBoard() // O'yinni boshlash (sahifani yangilamasdan)
