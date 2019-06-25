const canvas = document.getElementById('canvas');
canvas.width  = 400;
canvas.height = 800;

var ctx = canvas.getContext("2d");
const colors = [
  '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

class Square {
    constructor(x, y, color, status, center) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.status = status;
      this.center = center
    }
};

function randomFromArr(arr) {
 return arr[Math.floor(Math.random() * arr.length)];
}

figures = [
  [{x: 4, y: 0}, {x: 5, y: 0, center: 3}, {x: 6, y: 0}, {x: 5, y: 1}],
  [{x: 5, y: 0, center: 'bar'}, {x: 5, y: 1}, {x: 5, y: 2}, {x: 5, y: 3}],
  [{x: 4, y: 0}, {x: 5, y: 0, center: 3}, {x: 6, y: 0}, {x: 6, y: 1}],
  [{x: 4, y: 0}, {x: 4, y: 1}, {x: 5, y: 0, center: 3}, {x: 6, y: 0}],
  [{x: 4, y: 0}, {x: 5, y: 0, center: 3}, {x: 5, y: 1}, {x: 6, y: 1}],
  [{x: 4, y: 1}, {x: 5, y: 0, center: 3}, {x: 5, y: 1}, {x: 6, y: 0}],
  [{x: 4, y: 0}, {x: 4, y: 1}, {x: 5, y: 0}, {x: 5, y: 1}],
];

const rowLength = 10;
const columnLength = 20;
const cellSize = 40;
let field
let timer;

function init() {
  const newRow = new Array(rowLength).fill(null);
  field = new Array(columnLength).fill(null).map(i => newRow.slice());
  spawnFigure();
  clearInterval(timer);
  timer = setInterval(() => moveFigure(1, 0), 500);
}

init();

document.addEventListener('keydown', key => {
  if (key.code === 'KeyA') {
    moveFigure(0, -1);
  } else if (key.code === 'KeyD') {
    moveFigure(0, 1);
  } else if (key.code === 'KeyS') {
    moveFigure(1, 0);
  } else if (key.code === 'KeyE') {
    rotate();
  } else if (key.code === 'KeyR') {
    init();
  }
});

function redraw() {
  ctx.fillStyle = '#000'
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  field.forEach(row =>  {
    row.filter(square => square)
      .forEach(square => {
        ctx.fillStyle = square.color;
        ctx.fillRect(cellSize * square.x, cellSize * square.y, cellSize, cellSize);
        ctx.strokeRect(cellSize * square.x, cellSize * square.y, cellSize, cellSize);
    })
  })
}

function redrawFigure(figure) {
  figure.forEach(square => field[square.y][square.x] = new Square(square.x, square.y, square.color, 'moving', square.center));
  redraw();
}


function spawnFigure() {
  const figure = randomFromArr(figures);
  const color = randomFromArr(colors)
  this.canvas.style.borderColor = color;
  figure.forEach(coord => field[coord.y][coord.x] = new Square(coord.x, coord.y, color, 'moving', coord.center));
  redraw();
  
}

function moveFigure(yShift, xShift) {
  const figure = [];
  field.forEach(row =>  {
    figure.push(...row.filter(square => square && square.status === 'moving'))
  })

  const newCoords = figure
    .slice()
    .map(i => {
      let newSquare = Object.assign({}, i)
      newSquare.y = newSquare.y + yShift;
      newSquare.x = newSquare.x + xShift;
      return newSquare;
    });

  let place = () => {
    field.forEach(row =>  {
      row.filter(square => square && square.status === 'moving')
        .forEach(square => {
          square.status = 'static';
          square.center = null;
        });
    })

    field.forEach((row, rowIndex) => {
      if (row.every(square => square && square.status === 'static')) {
        field.splice(rowIndex, 1);
        for (let i = 0; i < rowIndex; i++) {
          field[i].forEach(square => square && square.y++)
        }
        field.unshift(new Array(rowLength).fill(null));
      }
    })

    spawnFigure();
  }

  let move = () => {
    figure.forEach(square => field[square.y][square.x] = null);
    redrawFigure(newCoords);
  }

  if (yShift && !newCoords.some(i => i.y >= columnLength) && newCoords.some(i => field[i.y][i.x] && field[i.y][i.x].status === 'static')) {
    place();
    return;
  }

  if (xShift && newCoords.some(i => field[i.y][i.x] && field[i.y][i.x].status === 'static')) {
    return;
  }

  if (newCoords.some(i => i.y >= columnLength)) {
    place();
    return;
  }

  if (!newCoords.some(i => i.x >= rowLength || i.x < 0)) {
    move()
  }
}

function rotate() {
  let centerSquare;
  field.forEach(row => {
    const found = row.find(square => square && square.center);
    if (found) {
      centerSquare = found;
    }
  })
  if (!centerSquare) {
    return;
  }

  if (centerSquare.center === 'bar') {
    rotateBar(centerSquare);
    return;
  }

  let centerX = centerSquare.x;
  let centerY = centerSquare.y;

  if (centerY < 1 || centerY + 1 >= columnLength
    || centerX < 1 || centerX + 1 >= rowLength) {
    return;
  }

  const matrix = [];
  index = 0;
  for (let i = centerY - 1; i < centerY + 2; i++) {
    matrix[index] = field[i]
      .filter((square, i) => i >= centerX -1 && i <= centerX + 1)
      .map(square => square && square.status === 'static' ? null : square);
    index++;
  }

  newCoords = [];

  for (let i = 0; i < centerSquare.center; ++i) {
    for (let j = 0; j < centerSquare.center; ++j) {
      let item;
      const found = matrix[i][j]
      if (found) {
        item = Object.assign({}, found);

        let shiftX;
        if (j >= 1) {
          shiftX = 2 - i - j;
        } else {
          shiftX = i - j;
          if (i > 1) {
            shiftX = 0;
          } else if (i === 0) {
            shiftX = 2;
          }
        }

        const shiftY = j - i;

        if (!item.center) {
          item.y = item.y + shiftY;
          item.x = item.x + shiftX;
        }
        newCoords.push(item);
      }
    }
  }

  if (newCoords.some(i => field[i.y][i.x] && field[i.y][i.x].status === 'static')) {
    return;
  }

  matrix.forEach(row => row.forEach(square => {
    if (square) {
      field[square.y][square.x] = null;
    }
  }))
  redrawFigure(newCoords);
}

function rotateBar(barStart) {
}
