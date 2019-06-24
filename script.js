const canvas = document.getElementById('canvas');
canvas.width  = 400;
canvas.height = 600;

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
    constructor(x, y, color, status) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.status = status;
    }
};

function randomFromArr(arr) {
 return arr[Math.floor(Math.random() * arr.length)];
}

const rowLength = 8;
const columnLength = 12;
const row = new Array(rowLength).fill(null);
const field = new Array(columnLength).fill(null).map(i => row.slice());


const cellSize = 50;
function redraw() {
  ctx.fillStyle = '#000'
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  field.forEach(row =>  {
    row.filter(square => square)
      .forEach(square => {
        ctx.fillStyle = square.color;
        ctx.fillRect(cellSize * square.x, cellSize * square.y, cellSize, cellSize);
    })
  })
}

function redrawFigure(figure) {
  figure.forEach(square => field[square.y][square.x] = new Square(square.x, square.y, square.color, 'moving'));
  redraw();
}

figures = [
  [{x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 4, y: 1}],
  [{x: 4, y: 0}, {x: 4, y: 1}, {x: 4, y: 2}, {x: 4, y: 3}],
  [{x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 5, y: 1}],
  [{x: 3, y: 0}, {x: 3, y: 1}, {x: 4, y: 0}, {x: 5, y: 0}],
  [{x: 3, y: 0}, {x: 4, y: 0}, {x: 4, y: 1}, {x: 5, y: 1}],
  [{x: 3, y: 1}, {x: 4, y: 0}, {x: 4, y: 1}, {x: 5, y: 0}],
  [{x: 3, y: 0}, {x: 3, y: 1}, {x: 4, y: 0}, {x: 4, y: 1}],
]

function spawnFigure() {
  const figure = randomFromArr(figures);
  const color = randomFromArr(colors)
  figure.forEach(coord => field[coord.y][coord.x] = new Square(coord.x, coord.y, color, 'moving'));
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
        .forEach(square => square.status = 'static')
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

  if (!newCoords.some(i => i.x > 7 || i.x < 0)) {
    move()
  }
}

document.addEventListener('keydown', key => {
  if (key.code === 'KeyA') {
    moveFigure(0, -1);
  } else if (key.code === 'KeyD') {
    moveFigure(0, 1)
  } else if (key.code === 'KeyS') {
    moveFigure(1, 0)
  }
});


// rotate
const reverse = array => [...array].reverse();
const compose = (a, b) => x => a(b(x));

const flipMatrix = matrix => (
  matrix[0].map((column, index) => (
    matrix.map(row => row[index])
  ))
);

const rotateMatrix = compose(flipMatrix, reverse);
const flipMatrixCounterClockwise = compose(reverse, rotateMatrix);
const rotateMatrixCounterClockwise = compose(reverse, flipMatrix);
// ===========

spawnFigure();

// setInterval(() => moveFigure(1, 0), 1000);
