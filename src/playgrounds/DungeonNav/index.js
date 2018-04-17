import React from "react"
import { default as Immutable, List, Map } from "immutable"
import Hammer from "react-hammerjs"
import uuid from "uuid/v4"

import DungeonNavBoard from "./DungeonNavBoard"
import "./styles.scss"

const MAX_ROWS = 5
const MAX_COLS = 5
const VIEWPORT_PADDING = 100
const ZOOM_OUT_SCALE = 0.25

export default class DungeonNav extends React.Component {
  constructor() {
    super()

    let initialNotes = List([
      { id: 1, x: 600, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/MRpLVCa.png" },
      { id: 2, x: 700, y: 140, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/Ja2emXY.png" },
      { id: 3, x: 640, y: 240, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/bGrGdiO.png" },
      { id: 4, x: 800, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/GGc7lyo.png" },
      { id: 5, x: 730, y: 110, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/CyNRme7.png" },
      { id: 6, x: 790, y: 100, deltaX: 0, deltaY: 0, text: "Mayhaw Cocktail" },
      { id: 7, x: 830, y: 216, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/1m0iz7e.png" },
      { id: 8, x: 900, y: 100, deltaX: 0, deltaY: 0, text: "Alaska Cocktail" },
      { id: 9, x: 800, y: 220, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/rlVzV5o.png" },
      { id: 10, x: 900, y: 100, deltaX: 0, deltaY: 0, text: "Gold Cold Blackberry Smash" },
      { id: 11, x: 820, y: 190, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/3piuYAz.png" },
      { id: 12, x: 910, y: 175, deltaX: 0, deltaY: 0, text: "Twisted Thistle" },
      { id: 13, x: 870, y: 221, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/qU4GDxC.png" }
    ]) 

    let initialBoard = { id: uuid(), notes: initialNotes }

    let grid = [ 
      [ null, null, null,         null, null ],
      [ null, null, null,         null, null ],
      [ null, null, initialBoard, null, null ],
      [ null, null, null,         null, null ],
      [ null, null, null,         null, null ],
    ]

    this.state = { 
      grid: Immutable.fromJS(grid), 
      currentBoardIndex: [2, 2], 
      viewportDimensions: { width: 0, height: 0 },
      zoomOut: false
    }

    this.viewport = React.createRef()
    this.updateViewportDimensions = this.updateViewportDimensions.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateViewportDimensions)
    setTimeout(this.updateViewportDimensions, 100)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewportDimensions)
  }

  updateViewportDimensions() {
    let { clientWidth, clientHeight } = this.viewport.current
    this.setState({ viewportDimensions: { width: clientWidth, height: clientHeight }})
  }

  getAdjacentBoards(grid, index) {
    let row = index[0]
    let column = index[1]
    let top, bottom, left, right
    let indices = {}
    let adjacent = {}

    // top
    if((row - 1) >= 0) {
      adjacent.top = grid.get(row - 1).get(column)
      indices.top = [ row - 1,  column ]
    }

    // bottom
    if((row + 1) <= (MAX_ROWS - 1)) {
      adjacent.bottom = grid.get(row + 1).get(column)
      indices.bottom = [ row + 1,  column ]
    }

    // left
    if((column - 1) >= 0) {
      adjacent.left = grid.get(row).get(column - 1)
      indices.left = [ row,  column - 1 ]
    }

    // right
    if((column + 1) <= (MAX_COLS - 1)) {
      adjacent.right = grid.get(row).get(column + 1)
      indices.right = [ row,  column + 1 ]
    }

    return { adjacent: adjacent, indices: indices }
  }

  addBoard(index, direction) {
    let row = index[0]
    let column = index[1]
    let newBoard = Map({ id: uuid(), notes: List([]) })

    if(direction === "top")
      row = row - 1 

    if(direction === "bottom")
      row = row + 1

    if(direction === "left")
      column = column - 1

    if(direction === "right")
      column = column + 1

    let newRow = this.state.grid.get(row).set(column, newBoard)
    let newGrid = this.state.grid.set(row, newRow)

    this.setState({ grid: newGrid, currentBoardIndex: [row, column] })
  }

  moveToBoard(index) {
    let board = this.state.grid.get(index[0]).get(index[1])

    if(board)
      this.setState({ currentBoardIndex: index }) 
  }

  handleSwipe(event) {
    let row = this.state.currentBoardIndex[0]
    let column = this.state.currentBoardIndex[1]

    if(event.direction === "up")
      this.moveToBoard([ row + 1, column ])
    else if(event.direction === "down")
      this.moveToBoard([ row - 1, column ])
    else if(event.direction === "left")
      this.moveToBoard([ row, column + 1 ])
    else if(event.direction === "right")
      this.moveToBoard([ row, column - 1 ])
  }

  handlePinchIn(event) {
    this.setState({ zoomOut: true })
  }

  handleCellTap(event, index) {
    let board = this.state.grid.get(index[0]).get(index[1])
    if(this.state.zoomOut && board) {
      this.setState({ zoomOut: false, currentBoardIndex: index })
    }
  }

  handleNoteUpdate(index, notes) {
    let board = this.state.grid.get(index[0]).get(index[1])
    let newBoard = board.set("notes", notes)
    let newRow = this.state.grid.get(index[0]).set(index[1], newBoard)
    let newGrid = this.state.grid.set(index[0], newRow)

    this.setState({ grid: newGrid })
  }

  renderBoards({ grid, currentBoardIndex }) {
    let { width, height } = this.state.viewportDimensions
    width = width - 2*VIEWPORT_PADDING
    height = height - 2*VIEWPORT_PADDING

    let boards = grid.map((row, rowIndex) => {
      return row.map((board, colIndex) => {
        let notes = board ? board.get("notes") : List([])
        let top = height * rowIndex +  "px"
        let left = width * colIndex + "px"
        let style = { width: width + "px", height: height + "px", top: top, left: left }
        style.opacity = board ? 1.0 : 0.0
        let index = [ rowIndex, colIndex ]

        return <Hammer onTap={ event => this.handleCellTap(event, index) }>
          <div className="DungeonNav__gridCell" style={ style }>
            <DungeonNavBoard 
              notes={ notes } 
              onPinchIn={ event => this.handlePinchIn(event) } 
              onSwipe={ event => this.handleSwipe(event) } 
              onNoteUpdate={ ({ notes }) => this.handleNoteUpdate(index, notes) }
              key={ index } 
            /> 
          </div>
        </Hammer>
      })
    })

    let style 
    if(this.state.zoomOut)
      style = {
        top: -(currentBoardIndex[0] * height - VIEWPORT_PADDING) * ZOOM_OUT_SCALE,
        left: -(currentBoardIndex[1] * width - VIEWPORT_PADDING) * ZOOM_OUT_SCALE,
        zoom: ZOOM_OUT_SCALE,
        transition: "none"
      }
    else
      style = {
        top: -(currentBoardIndex[0] * height - VIEWPORT_PADDING),
        left: -(currentBoardIndex[1] * width - VIEWPORT_PADDING)
      }

    return <div className="DungeonNav__boards" style={ style }>{ boards }</div>
  }

  render() {
    let index = this.state.currentBoardIndex
    let currentBoard = this.state.grid.get(index[0]).get(index[1])
    let { adjacent, indices } = this.getAdjacentBoards(this.state.grid, index)
    let adjacentPartials = []

    Object.keys(adjacent).forEach(key => {
      let partial, board = adjacent[key]
      let classNames = `DungeonNav__addBoard DungeonNav__addBoard--${ key }` 

      if(board === null)
        partial = <Hammer key={ key } onTap={ () => this.addBoard(index, key) }>
          <div className={ classNames }><span style={{ verticalAlign: "middle" }}><i className="fa fa-plus-circle"></i></span></div>
        </Hammer>
      else if(board === undefined)
        partial = <div key={ key } className={ classNames }>Edge</div>
      else if(board.get && board.get("id"))
        partial = <Hammer key={ key } onTap={ () => this.moveToBoard(indices[key]) }>
          <div className={ classNames + " DungeonNav__addBoard--moveToBoard" }>{ " " }</div>
        </Hammer>

      adjacentPartials.push(partial)
    })

    return <div className="DungeonNav">
      <div className="DungeonNav__viewport" ref={ this.viewport }> 
        { adjacentPartials }
        { this.renderBoards(this.state) } 
      </div>
    </div>
  }
}
