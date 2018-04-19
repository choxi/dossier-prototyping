import React from "react"
import { default as Immutable, List, Map } from "immutable"
import Hammer from "react-hammerjs"
import uuid from "uuid/v4"
import Pointable from "react-pointable"

import SampleData from "../../sample-data"
import AnnotationsBoard from "./AnnotationsBoard"
import "./styles.scss"

const MAX_ROWS = 2
const MAX_COLS = 2
const VIEWPORT_PADDING = 100
const ZOOM_OUT_SCALE = 0.25

export default class DungeonNav extends React.Component {
  constructor(props) {
    super(props)

    this.state = this.initialState(this.props)
    this.viewport = React.createRef()
    this.canvas = React.createRef()
    this.updateViewportDimensions = this.updateViewportDimensions.bind(this)
  }

  log(text) {
    this.setState({ logs: [ ...this.state.logs, text ] })
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateViewportDimensions)
    this.updateViewportDimensions()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewportDimensions)
  }

  initialState(props) {
    let initialNotes = SampleData[props.sampleData].notes
    let initialBoard = { id: uuid(), notes: initialNotes }

    let grid = [ 
      [ null, null ],
      [ null, initialBoard ]
    ]

    return { 
      grid: Immutable.fromJS(grid), 
      currentBoardIndex: [1, 1], 
      viewportDimensions: { width: 0, height: 0 },
      zoomOut: false,
      logs: []
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.sampleData !== this.props.sampleData)
      this.setState(this.initialState(nextProps), () => this.updateViewportDimensions())
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
        style.background = this.state.zoomOut ? "#EEE" : ""
        let index = [ rowIndex, colIndex ]

        return <Hammer onTap={ event => this.handleCellTap(event, index) }>
          <div className="DungeonNav__gridCell" style={ style }>
            <AnnotationsBoard 
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
        left: -(currentBoardIndex[1] * width - VIEWPORT_PADDING),
      }

    let dim = this.state.viewportDimensions
    let canvasWidth = dim.width * MAX_COLS
    let canvasHeight = dim.height * MAX_ROWS

    return <div onTouchMove={ event => this.handlePointer(event) }> 
      <div className="DungeonNav__boards" style={ style }>
        <canvas ref={ this.canvas } className="Annotations__canvas" width={ canvasWidth } height={ canvasHeight } > </canvas>
        { boards }
      </div>
    </div>
  }

  handlePointer(event) {
    if(event.target.className !== "Board" || (event.touches[0] && event.touches[0].touchType !== "stylus"))
      return
    else
      event.preventDefault()

    let { width, height } = this.state.viewportDimensions
    let ctx = this.canvas.current.getContext("2d")
    let x = (event.touches[0].clientX - VIEWPORT_PADDING) + this.state.currentBoardIndex[1] * (width - 2*VIEWPORT_PADDING)
    let y = (event.touches[0].clientY - VIEWPORT_PADDING) + this.state.currentBoardIndex[0] * (height - 2*VIEWPORT_PADDING)

    ctx.fillRect(x, y, 5, 5)
  }

  render() {
    let index = this.state.currentBoardIndex
    let currentBoard = this.state.grid.get(index[0]).get(index[1])
    let { adjacent, indices } = this.getAdjacentBoards(this.state.grid, index)
    let adjacentPartials = []

    if(!this.state.zoomOut) {
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
    }

    let consolePartial = <div className="Console">
      { this.state.logs.map(log => <p>{ log }</p>) }
    </div>

    return <div className="Annotations">
      <div className="DungeonNav__viewport" ref={ this.viewport }> 
        { adjacentPartials }
        { this.renderBoards(this.state) } 
      </div>
    </div>
  }
}

