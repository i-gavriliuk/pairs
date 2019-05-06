let gameData = null;
const startGameMsg = 'Чтобы начать нажмите кнопку "Старт".';
const restartGameMsg = 'Начать сначала?';
const field = document.querySelector('#field');
const cells = field.querySelectorAll('.play-field__square');
const startButton = document.querySelector('#start-btn');
const modal = document.querySelector('#modal');

// function generates the specified number of pairs of
// very different random hues and returns them as array
const getRandomHues = function getSomeNumberPairsRandomHues(huesCount = 8) {
  let colorWheelRandomPoint = Math.floor(Math.random() * 360);
  const hues = [];
  // hues generation
  for (let i = 0; i < huesCount; i += 1) {
    const validValue = colorWheelRandomPoint % 360;
    hues.push(validValue, validValue);
    colorWheelRandomPoint += Math.trunc(360 / huesCount);
  }
  // hues random distribution
  for (let i = hues.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [hues[i], hues[j]] = [hues[j], hues[i]];
  }
  return hues;
};

// the function creates an internal representation of the game
// and initializes it with initial data and the cells with hues from the array
const getGameData = function initializegameDataRepresentationAndOtherData(hues) {
  gameData = {};
  for (let i = 0; i < hues.length; i += 1) {
    // initialization of the color and state of each cell
    gameData[`cell${i + 1}`] = { bgColor: `hsl(${hues[i]} 100% 50%)`, hue: hues[i], isOpened: false };
  }
  // initialization of additional properties
  gameData.requiredMatchs = hues.length / 2;
  gameData.firstElemOfPair = null;
  gameData.secondElemOfPair = null;
  gameData.closeWaiting = false;
  return gameData;
};

// function to paint the cell in the corresponding color
const showColor = function changeColorCellToCorrespondingValue(elem, dataId) {
  const targetElement = elem;
  targetElement.style.backgroundColor = gameData[dataId].bgColor;
  gameData[dataId].isOpened = true;
};

// the function close a pair of cells in case of a mismatch
const closePair = function closePairCellsUnderColorsNotMatching() {
  field.querySelector(`#${gameData.firstElemOfPair}`).style.backgroundColor = '';
  field.querySelector(`#${gameData.secondElemOfPair}`).style.backgroundColor = '';
  gameData[gameData.firstElemOfPair].isOpened = false;
  gameData[gameData.secondElemOfPair].isOpened = false;
  gameData.firstElemOfPair = null;
  gameData.secondElemOfPair = null;
  gameData.closeWaiting = false;
};

// the function displays a pop-up window with the corresponding message and buttons
const showModal = function displayPopupWithMessageToUser(msg) {
  const modalMsg = modal.querySelector('#modal-msg');
  modalMsg.innerHTML = msg;
  if (gameData === null) {
    // if the game object is not yet initialized
    modal.querySelector('#cancel').innerText = 'Закрыть';
    modal.querySelector('#yes').classList.add('hide');
  } else if (!gameData.requiredMatchs) {
    // if all cells are open
    modal.querySelector('#cancel').innerText = 'Закрыть';
    modal.querySelector('#yes').classList.add('hide');
  } else {
    // otherwise a window with two buttons `yes` and `no`
    modal.querySelector('#cancel').innerText = 'Нет';
    modal.querySelector('#yes').classList.remove('hide');
  }
  modal.classList.add('show');
};

// the function compares the two cells and processing the match and mismatch
const compareCells = function compareTwoOpenCellsColors(firstCell, secondCell) {
  if (firstCell.hue === secondCell.hue) {
    gameData.requiredMatchs -= 1;
    gameData.firstElemOfPair = null;
    gameData.secondElemOfPair = null;
    if (gameData.requiredMatchs === 0) {
      showModal('Вы выиграли!<br>Затраченное время: 02:56.294');
    }
  } else {
    gameData.closeWaiting = true;
    setTimeout(closePair, 500);
  }
};

// the function returns the initial color to all cells
const clearField = function clearAllCellsOfPlayingFieldFromColors(elems) {
  const allCells = elems;
  for (let i = 0; i < allCells.length; i += 1) {
    allCells[i].style.backgroundColor = '';
  }
};

// the function recursively paints each cell in the color assigned to it with some delay
const doVisualInit = function performVisualInitialization(elems) {
  const allCells = elems;
  (function loop(i) {
    let j = i;
    setTimeout(() => {
      allCells[j - 1].style.backgroundColor = gameData[`cell${j}`].bgColor;
      j += 1;
      if (j <= allCells.length) {
        loop(j);
      } else {
        setTimeout(() => {
          clearField(allCells);
        }, 1000);
      }
    }, 50);
  }(1));
};

// the function creates and returns an object representing the internal state of the game
const initPlayingField = function performInitializationPlayingField() {
  const randomHues = getRandomHues();
  const internalData = getGameData(randomHues);
  return internalData;
};

// listen to clicks on the playing field and determine which cell is clicked
field.addEventListener('click', (evt) => {
  // the object representing the game has not yet been initialized - display a message
  if (gameData === null) {
    showModal(startGameMsg);
  } else if (evt.target.id !== 'field' && !gameData.closeWaiting) {
    // the cell is not clicked at the time of closing the unmatched pair
    const clickedBox = evt.target;
    const clickedBoxId = clickedBox.id;
    if (!gameData[clickedBoxId].isOpened) {
      // if the cell is not open
      showColor(clickedBox, clickedBoxId);
      if (!gameData.firstElemOfPair) {
        // and it is the first of the pair
        gameData.firstElemOfPair = clickedBoxId;
      } else {
        // if the second of a pair
        gameData.secondElemOfPair = clickedBoxId;
        compareCells(gameData[gameData.firstElemOfPair], gameData[gameData.secondElemOfPair]);
      }
    }
  }
});

// listen click on start button
startButton.addEventListener('click', () => {
  // if the game object is not yet initialized
  if (gameData === null) {
    // clear cells and with some delay initialize game object
    clearField(cells);
    setTimeout(() => {
      gameData = initPlayingField();
      doVisualInit(cells);
    }, 500);
  } else {
    // otherwise, display a request to re-initialize the game or its continuation
    showModal(restartGameMsg);
  }
});

// listen to clicks in a pop-up window
modal.addEventListener('click', (evt) => {
  const clickedItemId = evt.target.id;
  // if the "close" button is clicked
  if (clickedItemId === 'cancel') {
    // the game is initialized and already completed
    if (gameData !== null && !gameData.requiredMatchs) {
      // resetting the game object
      gameData = null;
    }
    modal.classList.remove('show');
    // if the "yes" button is clicked
  } else if (clickedItemId === 'yes') {
    // reinitialize the game
    clearField(cells);
    gameData = null;
    modal.classList.remove('show');
    gameData = initPlayingField();
    doVisualInit(cells);
  }
});
