function initializeSetupController() {
    const form = document.getElementById("setup-form");
    const formSection = document.getElementById("form");
    const gridSizeSection = document.getElementById("display");
    const modeSection = document.getElementById("Mode");
    const playerOneInput = document.getElementById("player-one");
    const playerTwoInput = document.getElementById("player-two");
    const gridSizeSelect = document.getElementById("grid-size");
    const message = document.getElementById("setup-message");
    const gridMessage = document.getElementById("grid-message");
    const usernameOne = document.querySelector("#username1 output");
    const usernameTwo = document.querySelector("#username2 output");
    const scoreOne = document.querySelector("#score1 output");
    const scoreTwo = document.querySelector("#score2 output");
    const turnStatus = document.getElementById("turn-status");
    const roundResult = document.getElementById("round-result");
    const playAgainButton = document.getElementById("play-again");
    const modeButtons = Array.from(document.querySelectorAll("[data-mode]"));
    const scoreSection = document.getElementById("score");
    const board = document.getElementById("tic-tac-toe-board");

    if (
        !form ||
        !formSection ||
        !gridSizeSection ||
        !modeSection ||
        !playerOneInput ||
        !playerTwoInput ||
        !gridSizeSelect ||
        !message ||
        !gridMessage ||
        !usernameOne ||
        !usernameTwo ||
        !scoreOne ||
        !scoreTwo ||
        !turnStatus ||
        !roundResult ||
        !playAgainButton ||
        !scoreSection ||
        !board
    ) {
        console.error("Game controller could not start because required elements are missing.");
        return;
    }

    const setupState = {
        playerOne: "",
        playerTwo: "",
        gridSize: Number.parseInt(gridSizeSelect.value, 10),
        mode: "",
        board: [],
        currentPlayer: "playerOne",
        currentMarker: "X",
        isGameOver: false,
        scores: {
            playerOne: 0,
            playerTwo: 0,
        },
    };

    const screens = {
        form: formSection,
        "grid-size": gridSizeSection,
        mode: modeSection,
        game: scoreSection,
    };

    function showScreen(activeScreen) {
        Object.entries(screens).forEach(([screenName, element]) => {
            element.style.display = screenName === activeScreen ? "block" : "none";
        });
    }

    function showMessage(text, isError = true) {
        message.textContent = text;
        message.classList.toggle("success", !isError);
    }

    function showGridMessage(text, isError = true) {
        gridMessage.textContent = text;
        gridMessage.classList.toggle("success", !isError);
    }

    function getPlayerLabel(playerKey) {
        if (playerKey === "playerOne") {
            return setupState.playerOne;
        }

        if (setupState.mode === "pvc") {
            return "Computer";
        }

        return setupState.playerTwo;
    }

    function updateScoreDisplay() {
        scoreOne.textContent = String(setupState.scores.playerOne);
        scoreTwo.textContent = String(setupState.scores.playerTwo);
    }

    function updatePlayerDisplay() {
        usernameOne.textContent = `${setupState.playerOne} (X)`;
        usernameTwo.textContent = setupState.mode === "pvc"
            ? "Computer (O)"
            : `${setupState.playerTwo} (O)`;
    }

    function updateTurnStatus() {
        if (setupState.isGameOver) {
            return;
        }

        turnStatus.textContent = `${getPlayerLabel(setupState.currentPlayer)}'s turn (${setupState.currentMarker})`;
    }

    function updateRuntimeSnapshot() {
        window.gameSetup = {
            playerOne: setupState.playerOne,
            playerTwo: setupState.playerTwo,
            gridSize: setupState.gridSize,
            mode: setupState.mode,
            board: [...setupState.board],
            currentPlayer: setupState.currentPlayer,
            currentMarker: setupState.currentMarker,
            scores: { ...setupState.scores },
            isGameOver: setupState.isGameOver,
        };
    }

    function getWinningLines(size) {
        const lines = [];

        for (let row = 0; row < size; row += 1) {
            const rowLine = [];
            const columnLine = [];

            for (let column = 0; column < size; column += 1) {
                rowLine.push((row * size) + column);
                columnLine.push((column * size) + row);
            }

            lines.push(rowLine, columnLine);
        }

        const leftDiagonal = [];
        const rightDiagonal = [];

        for (let index = 0; index < size; index += 1) {
            leftDiagonal.push((index * size) + index);
            rightDiagonal.push((index * size) + (size - 1 - index));
        }

        lines.push(leftDiagonal, rightDiagonal);
        return lines;
    }

    function getWinnerMarker() {
        const lines = getWinningLines(setupState.gridSize);

        for (const line of lines) {
            const firstMarker = setupState.board[line[0]];

            if (!firstMarker) {
                continue;
            }

            const isWinningLine = line.every((cellIndex) => setupState.board[cellIndex] === firstMarker);
            if (isWinningLine) {
                return firstMarker;
            }
        }

        return null;
    }

    function resetRoundState() {
        setupState.board = Array(setupState.gridSize * setupState.gridSize).fill("");
        setupState.currentPlayer = "playerOne";
        setupState.currentMarker = "X";
        setupState.isGameOver = false;
        roundResult.textContent = "";
        playAgainButton.style.display = "none";
    }

    function renderBoard() {
        board.innerHTML = "";
        board.style.gridTemplateColumns = `repeat(${setupState.gridSize}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${setupState.gridSize}, 1fr)`;
        board.style.backgroundImage = "none";

        setupState.board.forEach((marker, index) => {
            const cell = document.createElement("button");
            cell.type = "button";
            cell.className = "board-cell";
            cell.dataset.index = String(index);
            cell.textContent = marker;
            cell.disabled = Boolean(marker) || setupState.isGameOver;

            if (cell.disabled) {
                cell.classList.add("is-disabled");
            }

            cell.addEventListener("click", () => {
                handleMove(index);
            });

            board.appendChild(cell);
        });
    }

    function finishRound(resultText, winnerPlayerKey = null) {
        setupState.isGameOver = true;
        roundResult.textContent = resultText;
        turnStatus.textContent = resultText;

        if (winnerPlayerKey) {
            setupState.scores[winnerPlayerKey] += 1;
            updateScoreDisplay();
        }

        playAgainButton.style.display = "block";
        renderBoard();
        updateRuntimeSnapshot();
    }

    function switchTurn() {
        if (setupState.currentPlayer === "playerOne") {
            setupState.currentPlayer = "playerTwo";
            setupState.currentMarker = "O";
        } else {
            setupState.currentPlayer = "playerOne";
            setupState.currentMarker = "X";
        }
    }

    function completeMove() {
        const winnerMarker = getWinnerMarker();

        if (winnerMarker) {
            const winnerPlayerKey = winnerMarker === "X" ? "playerOne" : "playerTwo";
            finishRound(`${getPlayerLabel(winnerPlayerKey)} wins this round!`, winnerPlayerKey);
            return;
        }

        const isDraw = setupState.board.every((cell) => cell !== "");
        if (isDraw) {
            finishRound("It's a draw.");
            return;
        }

        switchTurn();
        updateTurnStatus();
        renderBoard();
        updateRuntimeSnapshot();

        if (setupState.mode === "pvc" && setupState.currentPlayer === "playerTwo") {
            window.setTimeout(() => {
                if (!setupState.isGameOver) {
                    playComputerTurn();
                }
            }, 350);
        }
    }

    function handleMove(index) {
        if (setupState.isGameOver || setupState.board[index]) {
            return;
        }

        if (setupState.mode === "pvc" && setupState.currentPlayer === "playerTwo") {
            return;
        }

        setupState.board[index] = setupState.currentMarker;
        completeMove();
    }

    function playComputerTurn() {
        const emptyCells = setupState.board
            .map((value, index) => (value === "" ? index : -1))
            .filter((index) => index !== -1);

        if (emptyCells.length === 0) {
            return;
        }

        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const cellIndex = emptyCells[randomIndex];

        setupState.board[cellIndex] = setupState.currentMarker;
        completeMove();
    }

    function startRound() {
        updatePlayerDisplay();
        resetRoundState();
        renderBoard();
        updateScoreDisplay();
        updateTurnStatus();
        showScreen("game");
        updateRuntimeSnapshot();
    }

    function selectMode(mode) {
        setupState.mode = mode;

        modeButtons.forEach((button) => {
            const isSelected = button.dataset.mode === mode;
            button.classList.toggle("is-selected", isSelected);
            button.setAttribute("aria-pressed", String(isSelected));
        });
    }

    modeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const mode = button.dataset.mode || "";
            if (!mode) {
                return;
            }

            selectMode(mode);
            startRound();
        });
    });

    playAgainButton.addEventListener("click", () => {
        startRound();
    });

    gridSizeSelect.addEventListener("change", () => {
        const nextSize = Number.parseInt(gridSizeSelect.value, 10);

        if (nextSize < 3) {
            showGridMessage("Choose a board size before continuing.");
            return;
        }

        setupState.gridSize = nextSize;
        showGridMessage("");
        showScreen("mode");
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const playerOne = playerOneInput.value.trim();
        const playerTwo = playerTwoInput.value.trim();

        if (!playerOne || !playerTwo) {
            showMessage("Enter both player names before starting.");
            return;
        }

        setupState.playerOne = playerOne;
        setupState.playerTwo = playerTwo;
        showMessage("", false);
        showGridMessage("");
        selectMode("");
        gridSizeSelect.value = "1";
        showScreen("grid-size");
    });

    updateScoreDisplay();
    showScreen("form");
    updateRuntimeSnapshot();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSetupController);
} else {
    initializeSetupController();
}
