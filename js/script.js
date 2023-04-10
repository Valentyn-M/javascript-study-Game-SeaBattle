// Объект представления
let view = {
	// Метод displayMessage получает в аргумете текст сообщения и выводит его в поле messageArea
	displayMessage: function (msg) {
		let messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},
	// Метод displayHit получает в аргумете координаты выстрела и добавляет нужный класс ячейке с этим идентификатором
	displayHit: function (location) {
		let cell = document.getElementById(location);
		cell.classList.add("hit");
	},
	// Метод displayMiss получает в аргумете координаты выстрела и добавляет нужный класс ячейке с этим идентификатором
	displayMiss: function (location) {
		let cell = document.getElementById(location);
		cell.classList.add("miss");
	}
};


// Объект модели игры
let model = {
	boardSize: 7,														// размер игрового поля
	numShips: 3,														// количество кораблей в игре
	shipLength: 3,														// длина корабля в клетках
	shipsSunk: 0,														// содержит текущее количество кораблей, потопленных игроком
	ships: [																// массив, в котором будут храниться данные всех кораблей
		{ locations: [], hits: [] },
		{ locations: [], hits: [] },
		{ locations: [], hits: [] }],
	// Метод создает массив ships с количеством кораблей, определяемым свойством numShips
	generateShipLocations: function () {
		let locations;
		for (let i = 0; i < this.numShips; i++) {				// цикл для каждого корабля (генерируется набор позиций)
			do {															// цикл для каждой клетки кораля
				locations = this.generateShip();					// генерируем новый набор позиций (вызываем метод generateShip)
			} while (this.collision(locations));				// проверяем, перекрываются ли эти позиции с существующими кораблями на доске. Если есть перекрытия (if (this.collision(locations) === true)), нужна еще одна попытка (вызываем метод collision)
			this.ships[i].locations = locations;				// полученные позиции без перекрытий сохраняются в свойстве locations объекта корабля в массиве model.ships
		}
	},
	// Метод создает массив со случайными позициями корабля, учитывая длину кораблей shipLength
	generateShip: function () {
		let direction = Math.floor(Math.random() * 2);		// генерируем случайное число (0, 1). 0 - горизонтальное расположение, 1 - вертикальное
		let row, col;
		if (direction === 1) {
			// Сгенерировать начальную позицию для горизонтального корабля
			row = Math.floor(Math.random() * this.boardSize);									// любая позиция (строка)
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength));		// любая позиция (столбец) минус длина корабля
		} else {
			// Сгенерировать начальную позицию для вертикального корабля
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
			col = Math.floor(Math.random() * this.boardSize);
		}
		let newShipLocations = [];									// набор позиций нового корабля начинается с пустого массива, в который последовательно добавляются элементы
		for (let i = 0; i < this.shipLength; i++) {			// цикл вполняется до количества позиций в корабле (до длины корабля в клетках)
			if (direction === 1) {
				// Добавляем в массив для горизонтального корабля
				newShipLocations.push(row + "" + (col + i));		// кавычки "" применяются для первода чисел в итоговое ДВУХЗНАЧНОЕ строковое значение (при сложении строки с числом знак «+» выполняет конкатенацию)
			} else {
				// Добавляем в массив для вертикального корабля
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;									// когда все позиции сгенерированы, метод возвращает массив
	},
	// Метод collision получает данные корабля и проверяет, перекрывается ли хотя бы одна клетка с клетками других кораблей
	collision: function (locations) {
		for (let i = 0; i < this.numShips; i++) {				// цикл перебирает все корабли модели (в свойстве model.ships)
			let ship = model.ships[i];								// каждый корабль
			for (let j = 0; j < locations.length; j++) {					// цикл перебирает все позиции нового корабля в массиве locations
				if (ship.locations.indexOf(locations[j]) >= 0) {		// проверяет, не заняты ли какие-либо из этих клеток существующими кораблями на игровом поле
					return true;													// если есть совпадение, возвращаем true
				}
			}
		}
		return false;													// если совпадений нет, возвращаем false
	},
	// Метод fire получает аргумент с координатами выстрела, перебирает все корабли и проверяет, пришлось ли попадание в очередной корабль
	fire: function (guess) {
		for (let i = 0; i < this.numShips; i++) {
			let ship = this.ships[i];								// получаем корабль
			let index = ship.locations.indexOf(guess);		// метод indexOf ищет в массиве клеток, занимаемых кораблем, указанное значение и возвращает его индекс (или -1, если значение отсутствует в массиве)
			if (index >= 0) {											// если есть совпадение...
				ship.hits[index] = "hit";							// ставим отметку в массиве hits по тому же индексу
				view.displayHit(guess);								// оповещаем Объект представления о том, что в клетке guess (координаты встрела) следует вывести маркер попадания
				view.displayMessage("ПОПАДАНИЕ!");				// оповещаем Объект представления о том, что нужно вывести сообщение "ПОПАДАНИЕ!"
				if (this.isSunk(ship)) {							// вызываем метод isSunk для проверки потопления корабля (если this.isSunk(ship) === true). Если корабль потоплен, то...
					view.displayMessage("Корабль потоплен!");	// оповещаем Объект представления о том, что нужно вывести сообщение "Корабль потоплен!"
					this.shipsSunk++;									// увеличиваем счетчик потопленных кораблей в свойстве shipsSunk модели				
				}
				return true;											// если есть попадание возвращаем true и останавливаем дальнейший перебор кораблей
			}
		}
		view.displayMiss(guess);									// оповещаем Объект представления о том, что в клетке guess (координаты встрела) следует вывести маркер промаха
		view.displayMessage("Промах");							// оповещаем Объект представления о том, что нужно вывести сообщение "Промах!"
		return false;													// если же после перебора всех кораблей попадание так и не обнаружено метод возвращает false
	},
	// Метод isSunk получает объект корабля и возвращает true, если корабль потоплен, или false, если он еще держится на плаву
	isSunk: function (ship) {
		for (let i = 0; i < this.shipLength; i++) {
			if (ship.hits[i] !== "hit") {
				return false;											// если есть хотя бы одна клетка, в которую еще не попал игрок, то корабль еще жив
			}
		}
		// Если корабль потоплен
		ship.locations.forEach(element => {						// методом forEach перебираем все элементы массива
			const shipLotation = document.getElementById(element);
			shipLotation.classList.add("sunk");
		});
		return true;													// в противном случае - корабль потоплен
	}
};


// Объект контроллера
let controller = {
	guesses: 0,												// количество выстрелов
	// Метод processGuess получает координаты в формате "A0"
	processGuess: function (guess) {
		let location = parseGuess(guess);			// функция parseGuess будет использоваться для проверки введенных данных
		if (location) {									// если функция не возвращает null, значит, были получены действительные координаты выстрела (if (location !== null))
			const currentCell = document.getElementById(location);		// получаем текущую ячейку, куда сделан выстрел
			// Проверяем вводились ли ранее эти координаты
			if (currentCell.classList.contains('hit') || currentCell.classList.contains('miss')) {
				alert("Вы уже вводили эти координаты ранее");
			} else {
				this.guesses++;							// увеличиваем счетчик выстрелов
				let hit = model.fire(location);		// передаем методу fire комбинацию строки и столбца выстрела
				// Если выстрел попал в цель (if (hit === true)) и количество потопленных кораблей равно количеству кораблей в игре, то...
				if (hit && model.shipsSunk === model.numShips) {
					view.displayMessage("Выпотопили все мои корабли за " + this.guesses + " попыток");		// выводим сообщение о том, что все корабли потоплены
					const form = document.getElementById("form");
					form.classList.add("hide");		// скрываем форму для ввода координат
				}
			}
		}
	}
};

// Вспомагательная функция для контроллера. Здесь получаем координаты выстрела от игрока и проверить их на действительность
function parseGuess(guess) {
	let alphabet = ["A", "B", "C", "D", "E", "F", "G"];		// массив с буквами, которые могут присутствовать в действительных координатах
	if (guess === null || guess.length !== 2) {
		alert("Ой, пожалуйста, введите букву и цифру, указанные на доске");
	} else {
		firstChar = guess.charAt(0).toUpperCase();				// получаем 1-й символ введённых координат. если введена буква в нижнем регистре, то переводим ее в верхний регистр
		let row = alphabet.indexOf(firstChar);						// ищем этот символ в массиве с буквами. В перменную row попадет индекс (числовой тип) этой буквы (или -1 если такой буквы нет)
		let column = guess.charAt(1);									// получаем 2-й символ введённых координат (строковый тип)
		// Функция isNaN выявляет строки и столбцы, которые не являются ЦИФРАМИ (например, если введено две буквы). Эксперимент показал, что достаточно одного условия: isNaN(column)
		if (isNaN(row) || isNaN(column)) {
			alert("Ой, этого нет на доске");
			// Если строка или столбец выходят за пределы игрового поля
			// Здесь также применяется временное преобразование типов. Переменная column содержит строковое значение, и проверяя, что значение находится в диапазоне от 0 до 6, мы полагаемся на преобразование строки в число для выполнения сравнения
		} else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
			alert("Упс, это за пределами доски!");
			// В противном случае возвращается идентификатор из номеров строки и столбца
			// Здесь снова задействовано преобразование типа: row — число, а column — строка, поэтому результатом также является строка
		} else {
			return row + column;
		}
	}
	// Если управление передано в эту точку, значит, какая-то проверка не прошла, и метод возвращает null
	return null;
}


// Вызов метода, генерирующего позиции кораблей, который заполнит пустые массивы в объекте модели
model.generateShipLocations();


const fireButton = document.getElementById("fireButton");			// получаем кнопку
// Вешаем обработчик события на кнопку и вызываем функцию при каждом нажатии кнопки Fire!
fireButton.addEventListener("click", handleFireButton);
function handleFireButton() {
	const guessInput = document.getElementById("guessInput");		// получаем инпут
	const guess = guessInput.value;											// получаем значение инпута
	controller.processGuess(guess);											// передаем координаты выстрела контроллеру
	guessInput.value = "";														// очищаем инпут
	guessInput.focus();
}


// Если в поле для ввода координат выстрела нажат Enter
const guessInput = document.getElementById("guessInput");			// получаем инпут
guessInput.addEventListener("keydown", fireButtonActivate)
function fireButtonActivate(event) {
	if (event.code === 'Enter') {												// если нажата клавиша Enter
		event.preventDefault();													// отменяем обновление страницы
		fireButton.click();														// делаем клик по кнопеу Fire!
	}
}

console.log(model.ships);