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
  CLEAR: 'clear',
  TEXT: 'text'
}

let lastEdits = []
let actualEditing = 0

// elements
const $canvas = $('#canvas')
const $colorPicker = $('#color-picker')

const $drawBtn = $('#draw-btn')
const $eraseBtn = $('#erase-btn')
const $rectangleBtn = $('#rectangle-btn')
const $ellipseBtn = $('#ellipse-btn')
const $pickerBtn = $('#picker-btn')
const $clearBtn = $('#clear-btn')
const $TextBtn = $('#text-btn')
const $undoBtn = $('#undo-btn')
const $redoBtn = $('#redo-btn')

const ctx = $canvas.getContext('2d', { willReadFrequently: true })

// state
let isDrawing = false
let isShiftPressed = false
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
$TextBtn.addEventListener('click', () => {
  setMode(MODES.TEXT)
})

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

$colorPicker.addEventListener('change', handleColorPicker)

$undoBtn.addEventListener('click', undo)
$redoBtn.addEventListener('click', redo)

// methods

function setDisabled(element, disabled) {
  if (disabled) {
    element.removeAttribute('disabled')
  } else {
    element.setAttribute('disabled', true)
  }
}

function saveEdits() {
  console.log('save ' + actualEditing)
  if (actualEditing < lastEdits.length) {
    lastEdits = lastEdits.slice(0, actualEditing)
  }
  lastEdits[actualEditing] = imageData
  setDisabled($undoBtn, actualEditing === 0)
  console.log(lastEdits)
  actualEditing++
}
function undo() {
  actualEditing = Math.max(actualEditing - 1, 0)
  console.log('undo ' + actualEditing)
  if (actualEditing === 0) {
    clearRect()
    disabled($undoBtn)
    return
  }
  ctx.putImageData(lastEdits[actualEditing], 0, 0)
}
function redo() {
  actualEditing = Math.min(actualEditing + 1, lastEdits.length)
  console.log(actualEditing)
  if (actualEditing === lastEdits.length - 1) return
  ctx.putImageData(lastEdits[actualEditing - 1], 0, 0)
}
function startDrawing(event) {
  isDrawing = true

  const { offsetX, offsetY } = event
  ;[startX, startY] = [offsetX, offsetY]
  ;[lastX, lastY] = [offsetX, offsetY]

  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  saveEdits()
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
    let width = offsetX - startX
    let height = offsetY - startY

    if (isShiftPressed) {
      const sideLength = Math.min(Math.abs(width), Math.abs(height))

      width = width > 0 ? sideLength : -sideLength
      height = height > 0 ? sideLength : -sideLength
    }
    ctx.beginPath()
    ctx.rect(startX, startY, width, height)
    ctx.stroke()
    return
  }
  if (mode === MODES.ELLIPSE) {
    ctx.putImageData(imageData, 0, 0)
    ctx.beginPath()
    ctx.arc(100, 75, 50, 0, 2 * Math.PI)
    ctx.stroke()
  }
}
function stopDrawing() {
  isDrawing = false
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
}

function clearRect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function handleColorPicker() {
  const { value } = $colorPicker
  ctx.strokeStyle = value
}

function handleKeyDown({ key }) {
  if (key === 'Shift') {
    isShiftPressed = true
  }
}
function handleKeyUp({ key }) {
  if (key === 'Shift') {
    isShiftPressed = false
  }
}

async function setMode(newMode) {
  let previousMode = mode
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
    canvas.style.cursor = 'nw-resize'
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineWidth = 2
    return
  }
  if (mode === MODES.PICKER) {
    $pickerBtn.classList.add('active')
    const eyeDropper = new window.EyeDropper()

    try {
      const result = await eyeDropper.open()
      const { sRGBHex } = result
      ctx.strokeStyle = sRGBHex
      $colorPicker.value = sRGBHex
      setMode(previousMode)
    } catch (e) {
      // si ha habido un error o el usuario no ha recuperado ningún color
    }

    return
  }
  if (mode === MODES.TEXT) {
    $TextBtn.classList.add('active')
    canvas.style.cursor = 'text'
    ctx.globalCompositeOperation = 'source-over'

    return
  }
}
// Show Picker if browser has support
if (typeof window.EyeDropper !== 'undefined') {
  $pickerBtn.removeAttribute('disabled')
}

ctx.lineJoin = 'round'
ctx.lineCap = 'round'

setMode(MODES.DRAW)
