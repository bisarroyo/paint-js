// utilities
const $ = (id) => document.querySelector(id)
const $$ = (id) => document.querySelector(id)

// constants
const COLORS = [
  '#000000',
  '#0000FF',
  '#00FFFF',
  '#00FF00',
  '#FFFF00',
  '#FF0000',
  '#FF00FF',
  '#FFFFFF'
]

const MODES = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  PICKER: 'picker',
  CLEAR: 'clear'
}

// elements
const $canvas = $('#canvas')
const $colorPicker = $('#color-picker')

const $drawBtn = $('#draw-btn')
const $eraseBtn = $('#erase-btn')
const $rectangleBtn = $('#rectangle-btn')
const $ellipseBtn = $('#ellipse-btn')
const $pickerBtn = $('#picker-btn')
const $clearBtn = $('#clear-btn')

const ctx = $canvas.getContext('2d')

// state
let isDrawing = false
let isShiftDown = false
let startX, startY
let lastX,
  lastY = 0
let mode = MODES.DRAW
let imageData

// events
$canvas.addEventListener('mousedown', startDrawing)
$canvas.addEventListener('mousemove', draw)
$canvas.addEventListener('mouseup', stopDrawing)
$canvas.addEventListener('mouseleave', stopDrawing)

$drawBtn.addEventListener('click', () => {
  setMode(MODES.DRAW)
})
$eraseBtn.addEventListener('click', () => {
  setMode(MODES.ERASE)
})
$rectangleBtn.addEventListener('click', () => {
  setMode(MODES.RECTANGLE)
})
$ellipseBtn.addEventListener('click', () => {
  setMode(MODES.ELLIPSE)
})
$pickerBtn.addEventListener('click', () => {
  setMode(MODES.PICKER)
})
$clearBtn.addEventListener('click', clearRect)

// methods
function startDrawing(event) {
  isDrawing = true

  const { offsetX, offsetY } = event
  ;[startX, startY] = [offsetX, offsetY]
  ;[lastX, lastY] = [offsetX, offsetY]

  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
}

function draw(event) {
  if (!isDrawing) return
  const { offsetX, offsetY } = event

  if (mode === MODES.DRAW || mode === MODES.ERASE) {
    ctx.beginPath()

    ctx.moveTo(lastX, lastY)
    ctx.lineTo(offsetX, offsetY)

    ctx.stroke()
    ;[lastX, lastY] = [offsetX, offsetY]
  }
  if (mode === MODES.RECTANGLE) {
    ctx.putImageData(imageData, 0, 0)
  }
  if (mode === MODES.ELLIPSE) {
  }
}
function stopDrawing() {
  isDrawing = false
}
function clearRect() {
  ctx.clearRect(0, 0, canvas.width, canvas.heigth)
  console.log('test')
}

function setMode(newMode) {
  mode = newMode
  // remove the actual active
  $('button.active')?.classList.remove('active')

  if (mode === MODES.DRAW) {
    $drawBtn.classList.add('active')
    canvas.style.cursor = 'crosshair'
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineWidth = 2
    return
  }
  if (mode === MODES.ERASE) {
    $eraseBtn.classList.add('active')
    canvas.style.cursor = "url('./icons/circle.png') 0 24, auto"
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = 20
    return
  }
  if (mode === MODES.RECTANGLE) {
    $rectangleBtn.classList.add('active')
    canvas.style.cursor = 'nw-resize'
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineWidth = 2
    return
  }
  if (mode === MODES.ELLIPSE) {
    $ellipseBtn.classList.add('active')
  }
  if (mode === MODES.PICKER) {
    $pickerBtn.classList.add('active')
  }
}

setMode(MODES.DRAW)
