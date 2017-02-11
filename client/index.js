import './index.css'
window.onload = onload

let isGameOver = false

function onload () {
  createBoard()
  assignMines(mines())
  assignNumbers()
  document.addEventListener('click', onClick)
  document.addEventListener('keypress', onKeypress)
  document.addEventListener('submit', onSubmit)
  document.addEventListener('change', onInputChange)
}

function restart () {
  if (rows() < 1) {
    global.alert('Nice try smartypants!\nrows must be greater than 0')
    return
  }
  if (columns() < 1) {
    global.alert('Think u r clever eh?\ncolumns must be greater than 0')
    return
  }
  if (mines() < 1) {
    global.alert('Oh aren\'t we smart ... \n At least one mine wiseass ...')
    return
  }

  createBoard()
  assignMines(mines())
  assignNumbers()
  isGameOver = false
}

function createBoard () {
  const boardNode = document.querySelector('.js-board')
  boardNode.innerHTML = ''
  for (let rowIdx = 0; rowIdx < rows(); rowIdx++) {
    const rowNode = document.createElement('div')
    rowNode.className = 'row'
    for (let columnIdx = 0; columnIdx < columns(); columnIdx++) {
      const tileNode = document.createElement('div')
      tileNode.className = 'js-tile tile'
      tileNode.id = 'tile' + String(rowIdx) + String(columnIdx)
      rowNode.appendChild(tileNode)
    }
    boardNode.appendChild(rowNode)
  }
}

function onClick ({ srcElement, ctrlKey }) {
  if (isGameOver && !srcElement.className.includes('js-restart')) {
    return
  }
  if (srcElement.className.includes('js-restart')) {
    restart()
    return
  }
  if (!srcElement.className.includes('js-tile')) {
    return
  }
  if (ctrlKey) {
    onTileRightClick(srcElement.id)
    return
  }
  onTileLeftClick(srcElement.id)
}

function assignMines (mines) {
  while (mines > 0) {
    randomTileWithoutMines().dataset.mine = true
    mines--
  }
}

function assignNumbers () {
  for (let rowIdx = 0; rowIdx < rows(); rowIdx++) {
    for (let columnIdx = 0; columnIdx < columns(); columnIdx++) {
      const tileNode = el('tile' + rowIdx + columnIdx)
      if (tileNode.dataset.mine) continue
      const mines = getTileEdgesIds(rowIdx, columnIdx).map(el)
        .filter(edge => edge.dataset.mine)
        .length
      tileNode.dataset.number = mines
      if (mines === 0) {
        continue
      }
      tileNode.textContent = String(mines)
    }
  }
}

function randomTileWithoutMines () {
  // use filter.call since document.querySelectorAll returns an object like array
  const tilesNodesWithoutMines = [].filter.call(document.querySelectorAll('.tile'), tile => !tile.dataset.mine)
  return tilesNodesWithoutMines[Math.floor(Math.random() * tilesNodesWithoutMines.length)]
}

function onTileRightClick (id) {
  const tileNode = el(id)
  if (tileNode.dataset.revealed) {
    return
  }
  tileNode.classList.toggle('flagged')
  tileNode.dataset.flag
    ? tileNode.removeAttribute('data-flag')
    : tileNode.dataset.flag = true
}

function onTileLeftClick (id) {
  const tileNode = el(id)
  if (tileNode.dataset.flag || tileNode.dataset.revealed) {
    return
  }
  if (tileNode.dataset.mine) {
    onLoseGame(id)
    return
  }
  revealTilesFrom(id)
  if (!allRevealed()) {
    return
  }
  // setTimeout to let dom render updates
  setTimeout(onWinGame, 0)
}

function onLoseGame (tileId) {
  el(tileId).classList.add('active-mine')
  isGameOver = true
  revealMines()
  // don't know why, without setTimeout the confirm get's triggered BEFORE the adding of the class
  // probably the rendering changes in the dom gets pushed to the end of the queue
  setTimeout(() => {
    if (global.confirm('game over!\nFancy another one?\n\nMaybe you wont lose so shamefully this time ... LOL!')) {
      restart()
    }
  }, 0)
}

function revealTilesFrom (id) {
  const idsToReveal = [id]
  while (idsToReveal.length) {
    const revealingId = idsToReveal.pop()
    revealTile(revealingId)
    if (el(revealingId).dataset.number !== '0') {
      continue
    }
    idsToReveal.push(
      ...getTileEdgesIds(...revealingId.replace('tile', '').split('').map(Number))
        .filter(id => !el(id).dataset.revealed)
    )
  }
}

function revealTile (id) {
  const tileNode = el(id)
  tileNode.dataset.revealed = true
  tileNode.classList.add('revealed')
}

function getTileEdgesIds (rowIdx, columnIdx) {
  const edgesIds = []
  // get sides
  if (rowIdx > 0) edgesIds.push(`tile${rowIdx - 1}${columnIdx}`)
  if (rowIdx < rows() - 1) edgesIds.push(`tile${rowIdx + 1}${columnIdx}`)
  if (columnIdx > 0) edgesIds.push(`tile${rowIdx}${columnIdx - 1}`)
  if (columnIdx < columns() - 1) edgesIds.push(`tile${rowIdx}${columnIdx + 1}`)
  // get corners
  if (rowIdx > 0 && columnIdx > 0) edgesIds.push(`tile${rowIdx - 1}${columnIdx - 1}`)
  if (rowIdx > 0 && columnIdx < columns() - 1) edgesIds.push(`tile${rowIdx - 1}${columnIdx + 1}`)
  if (rowIdx < rows() - 1 && columnIdx < columns() - 1) edgesIds.push(`tile${rowIdx + 1}${columnIdx + 1}`)
  if (rowIdx < rows() - 1 && columnIdx > 0) edgesIds.push(`tile${rowIdx + 1}${columnIdx - 1}`)
  return edgesIds
}

function onWinGame () {
  isGameOver = true
  if (!global.confirm('you win!\nOne more round for goold o\'l times sake?')) {
    return
  }
  restart()
}

function allRevealed () {
  return [].filter.call(
    document.querySelector('.js-tile:not([data-revealed])'),
    tile => !tile.getAttribute('data-mine')
  ).length === 0
}

function el (id) {
  return document.getElementById(id)
}

function onKeypress ({ keyCode }) {
  if (keyCode === 114) { // r
    restart()
    return
  }
}

function revealMines () {
  document.querySelectorAll('[data-mine]')
    .forEach(tileNode => tileNode.classList.add('active-mine'))
}

function onSubmit (evt) {
  evt.preventDefault()
  restart()
}

function onInputChange ({ srcElement, target }) {
  if (!srcElement.className.includes('js-mines-input')) {
    return
  }
  target.value = Math.min(target.value, rows() * columns() - 1)
}

function rows () {
  return document.querySelector('.js-rows-input').value
}

function columns () {
  return document.querySelector('.js-columns-input').value
}

function mines () {
  return document.querySelector('.js-mines-input').value
}
