var view = {
  //Представление (визуализация)
  displayMessage: function (msg) {
    var messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = msg;
  },
  displayHit: function (location) {
    var cell = document.getElementById(location);
    cell.setAttribute('class', 'hit');
  },
  displayMiss: function (location) {
    var cell = document.getElementById(location);
    cell.setAttribute('class', 'miss');
  },
};

var model = {
  //Модель поведения
  boardSize: 7,
  numShips: 3,
  shipLength: 3,
  shipsSunk: 0,

  ships: [
    { locations: [0, 0, 0], hits: ['', '', ''] },
    { locations: [0, 0, 0], hits: ['', '', ''] },
    { locations: [0, 0, 0], hits: ['', '', ''] },
  ],

  fire: function (guess) {
    for (var i = 0; i < this.numShips; i++) {
      var ship = this.ships[i];
      var index = ship.locations.indexOf(guess);
      if (ship.hits[index] === 'hit') {
        //повторное попадание по кораблю
        view.displayMessage('Але! Сюда уже шмалял же!');
        return true;
      } else if (index >= 0) {
        ship.hits[index] = 'hit';
        view.displayHit(guess);
        view.displayMessage('Бдышь!!! Попадание!');

        if (this.isSunk(ship)) {
          view.displayMessage('Милорд, корабль потоплен!');
          this.shipsSunk++;
        }
        return true;
      }
    }
    view.displayMiss(guess);
    view.displayMessage('Не попал, не попал - мазила!');
    return false;
  },

  isSunk: function (ship) {
    for (var i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== 'hit') {
        return false;
      }
    }
    return true;
  },

  generateShipLocations: function () {
    var locations;
    for (var i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip();
      } while (this.collision(locations));
      this.ships[i].locations = locations;
    }
    console.log('Корабли, массив: ');
    console.log(this.ships);
  },

  generateShip: function () {
    var direction = Math.floor(Math.random() * 2);
    var row, col;
    if (direction === 1) {
      //Горизонтальный корабль
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
    } else {
      //Вертикальный корабль
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
      col = Math.floor(Math.random() * this.boardSize);
    }

    var newShipLocations = [];
    for (var i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + '' + (col + i)); //Генерация столбцов добавления массива пример: '01', '02', '03'
      } else {
        newShipLocations.push(row + i + '' + col); //Генерация строк добавления массива пример: "41", "51", "61"
      }
    }
    return newShipLocations;
  },

  collision: function (locations) {
    for (var i = 0; i < this.numShips; i++) {
      var ship = model.ships[i];
      for (var j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }
    return false;
  },
};

function parseGuess(guess) {
  var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  if (guess === null || guess.length !== 2) {
    alert('У нас тут не сухопутный бой, стреляй по координатам!');
  } else {
    firstChar = guess.charAt(0);
    var row = alphabet.indexOf(firstChar);
    var column = guess.charAt(1);

    if (isNaN(row) || isNaN(column)) {
      //выявление строк и столбцов, которые не являются цифрами
      alert('Бро, это вне игры, совсем не туда шмальнул');
    } else if (
      row < 0 ||
      row >= model.boardSize ||
      column < 0 ||
      column >= model.boardSize
    ) {
      //Проверка диапозона от 0 до 6, запрос из model и преобразование строки в число
      alert('Соберись, стреляй по доске!');
    } else {
      return row + column;
    }
  }
  return null;
}

var controller = {
  guesses: 0,

  processGuess: function (guess) {
    var location = parseGuess(guess);
    if (location) {
      this.guesses++;
      var hit = model.fire(location);
      if (hit && model.shipsSunk === model.numShips) {
        view.displayMessage(
          'Поздравляю с победой! Тебе потребовалось ' +
            this.guesses +
            ' выстрелов и точность составила: ' +
            9 / this.guesses
        ); //Добавил точность, при изменении количества кораблей, поменять 9
      }
    }
  },
};

function init() {
  var fireButton = document.getElementById('fireButton');
  fireButton.onclick = handleFireButton;
  var guessInput = document.getElementById('guessInput');
  guessInput.onkeypress = handleKeyPress;

  model.generateShipLocations(); //Вызываем до начала игры
}

function handleFireButton() {
  var guessInput = document.getElementById('guessInput');
  var guess = guessInput.value.toUpperCase(); //Добавляю верхний регситр т.к. с нижним не будет работать
  controller.processGuess(guess);

  guessInput.value = '';
}

function handleKeyPress(e) {
  var fireButton = document.getElementById('fireButton');
  if (e.keyCode === 13 || e.keyCode === 32) {
    //KeyCode 13 это нажатие клавиши enter 32 пробел
    fireButton.click();
    return false;
  }
}

const tab = document.querySelector('tbody');
tab.addEventListener('click', (e) => {
  var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const area = e.target.closest('td').getAttribute('id');
  const firstChar = area.charAt(0);
  const secondChar = area.charAt(1);
  const guess = alphabet[firstChar] + secondChar;
  controller.processGuess(guess);
  guessInput.value = '';
});

window.onload = init;
