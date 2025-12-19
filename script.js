// Game state
let gameState = {
    phrase: '',
    board: [],
    guessedLetters: new Set(),
    revealedCells: new Set(),
    isSetup: false
};

// Constants
const ROWS = 5;
const COLS = 14;
const MAX_CELLS = ROWS * COLS;

// DOM Elements
const gameBoard = document.getElementById('game-board');
const phraseInput = document.getElementById('phrase-input');
const setupButton = document.getElementById('setup-button');
const letterInput = document.getElementById('letter-input');
const guessButton = document.getElementById('guess-button');
const resetButton = document.getElementById('reset-button');
const player1Section = document.getElementById('player1-section');
const player2Section = document.getElementById('player2-section');
const statusMessage = document.getElementById('status-message');
const guessedList = document.getElementById('guessed-list');

// Initialize the game board
function initializeBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < MAX_CELLS; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell empty';
        cell.dataset.index = i;
        gameBoard.appendChild(cell);
    }
}

// Setup the phrase from Player 1
function setupPhrase() {
    const phrase = phraseInput.value.trim().toUpperCase();
    
    if (!phrase) {
        showStatus('Inserisci una frase valida!', 'error');
        return;
    }
    
    if (phrase.length > MAX_CELLS) {
        showStatus('La frase è troppo lunga! Massimo 70 caratteri.', 'error');
        return;
    }
    
    // Reset game state
    gameState = {
        phrase: phrase,
        board: [],
        guessedLetters: new Set(),
        revealedCells: new Set(),
        isSetup: true
    };
    
    // Populate the board array
    for (let i = 0; i < phrase.length; i++) {
        const char = phrase[i];
        gameState.board[i] = {
            char: char,
            isLetter: /[A-Z]/.test(char)
        };
    }
    
    // Fill remaining cells as empty
    for (let i = phrase.length; i < MAX_CELLS; i++) {
        gameState.board[i] = {
            char: '',
            isLetter: false
        };
    }
    
    // Update the visual board
    updateBoard();
    
    // Switch to Player 2 interface
    player1Section.classList.add('hidden');
    player2Section.classList.remove('hidden');
    
    showStatus('Frase impostata! Giocatore 2, inizia a indovinare le lettere!', 'success');
    
    // Clear inputs
    phraseInput.value = '';
    letterInput.focus();
}

// Update the visual board
function updateBoard() {
    const cells = gameBoard.querySelectorAll('.cell');
    
    cells.forEach((cell, index) => {
        const cellData = gameState.board[index];
        
        if (!cellData || !cellData.isLetter) {
            // Empty cell (space, punctuation, or beyond phrase)
            cell.className = 'cell empty';
            cell.textContent = '';
        } else {
            // Letter cell
            if (gameState.revealedCells.has(index)) {
                // Revealed letter
                cell.className = 'cell revealed';
                cell.textContent = cellData.char;
            } else {
                // Hidden letter
                cell.className = 'cell letter';
                cell.textContent = '';
            }
        }
    });
}

// Handle letter guess from Player 2
function guessLetter() {
    const letter = letterInput.value.trim().toUpperCase();
    
    if (!letter || !/[A-Z]/.test(letter)) {
        showStatus('Inserisci una lettera valida (A-Z)!', 'error');
        return;
    }
    
    if (gameState.guessedLetters.has(letter)) {
        showStatus('Hai già provato questa lettera!', 'error');
        return;
    }
    
    // Add to guessed letters
    gameState.guessedLetters.add(letter);
    
    // Find all occurrences of the letter
    let found = false;
    gameState.board.forEach((cellData, index) => {
        if (cellData.isLetter && cellData.char === letter) {
            gameState.revealedCells.add(index);
            found = true;
        }
    });
    
    // Update guessed letters display
    updateGuessedLetters(letter, found);
    
    // Update the board
    updateBoard();
    
    // Show status
    if (found) {
        showStatus(`Ottimo! La lettera "${letter}" è presente!`, 'success');
    } else {
        showStatus(`La lettera "${letter}" non è presente.`, 'info');
    }
    
    // Check if the puzzle is solved
    checkWin();
    
    // Clear input
    letterInput.value = '';
    letterInput.focus();
}

// Update the guessed letters display
function updateGuessedLetters(letter, isCorrect) {
    const letterSpan = document.createElement('span');
    letterSpan.className = `guessed-letter ${isCorrect ? 'correct' : 'incorrect'}`;
    letterSpan.textContent = letter;
    guessedList.appendChild(letterSpan);
}

// Check if all letters are revealed
function checkWin() {
    const totalLetters = gameState.board.filter(cell => cell.isLetter).length;
    
    if (gameState.revealedCells.size === totalLetters && totalLetters > 0) {
        showStatus('🎉 Complimenti! Hai indovinato tutta la frase! 🎉', 'success');
        guessButton.disabled = true;
        letterInput.disabled = true;
    }
}

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    // Auto-hide after 3 seconds for non-success messages
    if (type !== 'success' || !message.includes('🎉')) {
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 3000);
    }
}

// Reset the game
function resetGame() {
    gameState = {
        phrase: '',
        board: [],
        guessedLetters: new Set(),
        revealedCells: new Set(),
        isSetup: false
    };
    
    initializeBoard();
    player1Section.classList.remove('hidden');
    player2Section.classList.add('hidden');
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
    guessedList.innerHTML = '';
    phraseInput.value = '';
    letterInput.value = '';
    guessButton.disabled = false;
    letterInput.disabled = false;
    phraseInput.focus();
}

// Event Listeners
setupButton.addEventListener('click', setupPhrase);
guessButton.addEventListener('click', guessLetter);
resetButton.addEventListener('click', resetGame);

// Allow Enter key to submit
phraseInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        setupPhrase();
    }
});

letterInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        guessLetter();
    }
});

// Initialize on load
initializeBoard();
phraseInput.focus();
