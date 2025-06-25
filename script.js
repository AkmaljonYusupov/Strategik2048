// 4x4 o'yin taxtasi massivi, boshlang'ich holatda nollar bilan to'ldirilgan
const board = [
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
]
// Joriy ochko, o'yin boshida 0
let score = 0
// Eng yuqori natija, LocalStorage'dan olinadi yoki 0
let highScore = localStorage.getItem('highScore') || 0
// O'yin tugaganligi holati, boshlang'ichda false
let gameOver = false
// Oldingi holatlarni saqlash uchun stack, cheksiz undo uchun
let undoStack = []

// DOM elementlari
const gameBoard = document.getElementById('gameBoard') // O'yin taxtasi
const scoreElement = document.getElementById('score') // Joriy ochko ko'rsatkichi
const highScoreElement = document.getElementById('highScore') // Eng yuqori natija ko'rsatkichi
const gameOverDisplay = document.getElementById('gameOver') // O'yin tugash oynasi
const gameOverText = document.getElementById('gameOverText') // O'yin tugash xabari
const finalScoreDisplay = document.getElementById('finalScore') // Yakuniy ochko ko'rsatkichi
const ratingElement = document.getElementById('rating') // Reyting ko'rsatkichi
const restartBtn = document.getElementById('restartBtn') // Qayta boshlash tugmasi
const undoBtn = document.getElementById('undoBtn') // Orqaga qaytarish tugmasi
const currentTimeElement = document.getElementById('currentTime') // Joriy vaqt ko'rsatkichi

// Ovoz effektlari (CDN orqali yuklanadi)
const smallMergeSound = new Audio(
	'https://www.soundjay.com/buttons/sounds/button-09.mp3'
) // Kichik birlashish (2, 4)
const mediumMergeSound = new Audio(
	'https://www.soundjay.com/buttons/sounds/button-10.mp3'
) // O'rta birlashish (8-32)
const largeMergeSound = new Audio(
	'https://www.soundjay.com/buttons/sounds/button-11.mp3'
) // Katta birlashish (64+)
const winSound = new Audio('https://www.soundjay.com/misc/sounds/success-1.mp3') // Yutish ovozi
const loseSound = new Audio('https://www.soundjay.com/misc/sounds/fail-1.mp3') // Yutqazish ovozi

// Eng yuqori natijani dastlabki ko'rsatish
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
// Har soniyada vaqtni yangilash
setInterval(updateTime, 1000)
updateTime()

// Mobil scroll yangilanishini bloklash
document.addEventListener(
	'touchmove',
	e => {
		if (e.target.closest('#gameContainer')) return // O'yin maydonida surishga ruxsat
		e.preventDefault() // Sahifa yangilanishini oldini olish
	},
	{ passive: false }
)

// Joriy taxta va ochko holatini saqlash
function saveState() {
	undoStack.push({
		board: board.map(row => [...row]), // Taxtaning nusxasi
		score: score, // Ochko nusxasi
	})
	undoBtn.disabled = false // Orqaga qaytarish tugmasini faollashtirish
}

// Oxirgi harakatni qaytarish
function undoMove() {
	if (!undoStack.length) return // Stack bo'sh bo'lsa hech narsa qilmaydi
	const lastState = undoStack.pop() // Oxirgi holatni olish
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			board[i][j] = lastState.board[i][j] // Taxtani tiklash
		}
	}
	score = lastState.score // Ochkoni tiklash
	updateBoard() // Taxtani yangilash
	undoBtn.disabled = undoStack.length === 0 // Stack bo'sh bo'lsa tugmani o'chirish
}

// O'yin taxtasini boshlash (sahifani yangilamasdan)
function initBoard() {
	gameBoard.innerHTML = '' // Taxtani tozalash
	score = 0 // Ochkoni nollash
	scoreElement.textContent = score
	gameOver = false // O'yin holatini tiklash
	gameOverDisplay.style.display = 'none' // Tugash oynasini yashirish
	undoStack = [] // Undo stackni tozalash
	undoBtn.disabled = true // Orqaga qaytarish tugmasini o'chirish
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			board[i][j] = 0 // Taxtani nollar bilan to'ldirish
			const tile = document.createElement('div')
			tile.classList.add('tile') // Plitka uchun CSS klassi
			tile.dataset.value = board[i][j] // Plitka qiymati
			tile.textContent = board[i][j] !== 0 ? board[i][j] : '' // Qiymatni ko'rsatish
			gameBoard.appendChild(tile) // Plitkani taxtaga qo'shish
		}
	}
	addRandomTile() // Birinchi tasodifiy plitka
	addRandomTile() // Ikkinchi tasodifiy plitka
	updateBoard() // Taxtani yangilash
}

// Tasodifiy plitka qo'shish (2 yoki 4)
function addRandomTile() {
	const emptyCells = []
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			if (board[i][j] === 0) emptyCells.push({ i, j }) // Bo'sh kataklarni yig'ish
		}
	}
	if (emptyCells.length > 0) {
		const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)] // Tasodifiy katak tanlash
		board[i][j] = Math.random() < 0.9 ? 2 : 4 // 90% 2, 10% 4
	}
}

// O'yin taxtasini yangilash
function updateBoard() {
	const tiles = document.querySelectorAll('.tile')
	tiles.forEach((tile, index) => {
		const i = Math.floor(index / 4)
		const j = index % 4
		tile.dataset.value = board[i][j] // Plitka qiymatini yangilash
		tile.textContent = board[i][j] !== 0 ? board[i][j] : '' // Matnni yangilash
		tile.classList.remove('new', 'merged') // Animatsiya klasslarini olib tashlash
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
	const maxScore = 2048 * 2 // Maksimal ochko hisoblanadi
	const scorePercentage = (score / maxScore) * 100 // Foiz hisoblash
	if (scorePercentage >= 80) return '★★★' // 80%+ uchun 3 yulduz
	if (scorePercentage >= 50) return '★★' // 50%+ uchun 2 yulduz
	return '★' // Boshqa holatlar uchun 1 yulduz
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
				const mergedValue = row[j] * 2 // Birlashish
				row[j] = mergedValue
				score += mergedValue // Ochko qo'shish
				playMergeSound(mergedValue) // Ovoz ijro etish
				row.splice(j + 1, 1) // Birlashgan plitkani olib tashlash
				j--
			}
		}
		while (row.length < 4) row.push(0) // Bo'sh joylarni to'ldirish
		if (board[i].join() !== row.join()) moved = true // Harakat bo'lganligini tekshirish
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

// Yutish holatini tekshirish (2048 plitkasi mavjudligi)
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
			if (board[i][j] === 0) return false // Bo'sh katak bo'lsa
			if (i < 3 && board[i][j] === board[i + 1][j]) return false // Vertikal birlashish mumkin
			if (j < 3 && board[i][j] === board[i][j + 1]) return false // Gorizontal birlashish mumkin
		}
	}
	return true // Hech qanday harakat qolmagan
}

// Klaviatura hodisalari
document.addEventListener('keydown', e => {
	if (gameOver) return // O'yin tugagan bo'lsa hech narsa qilmaydi
	saveState() // Harakatdan oldin holatni saqlash
	let moved = false
	if (e.key === 'ArrowLeft') moved = moveLeft()
	else if (e.key === 'ArrowRight') moved = moveRight()
	else if (e.key === 'ArrowUp') moved = moveUp()
	else if (e.key === 'ArrowDown') moved = moveDown()
	if (moved) {
		addRandomTile() // Harakat bo'lsa yangi plitka qo'shish
		updateBoard() // Taxtani yangilash
	}
})

// Mobil surish hodisalari
let touchStartX = 0
let touchStartY = 0
document.addEventListener('touchstart', e => {
	touchStartX = e.touches[0].clientX // Surish boshlangan nuqta X
	touchStartY = e.touches[0].clientY // Surish boshlangan nuqta Y
})
document.addEventListener('touchend', e => {
	if (gameOver) return
	saveState() // Harakatdan oldin holatni saqlash
	const touchEndX = e.changedTouches[0].clientX // Surish tugagan nuqta X
	const touchEndY = e.changedTouches[0].clientY // Surish tugagan nuqta Y
	const dx = touchEndX - touchStartX // X farqi
	const dy = touchEndY - touchStartY // Y farqi
	let moved = false
	if (Math.abs(dx) > Math.abs(dy)) {
		// Gorizontal surish ustunlik qiladi
		if (dx > 30) moved = moveRight()
		else if (dx < -30) moved = moveLeft()
	} else {
		// Vertikal surish
		if (dy > 30) moved = moveDown()
		else if (dy < -30) moved = moveUp()
	}
	if (moved) {
		addRandomTile()
		updateBoard()
	}
})

// Qayta boshlash tugmasi hodisasi
restartBtn.addEventListener('click', () => {
	initBoard() // O'yinni qayta boshlash
})

// Orqaga qaytarish tugmasi hodisasi
undoBtn.addEventListener('click', () => {
	undoMove() // Oxirgi harakatni qaytarish
})

// O'yinni boshlash
initBoard()
