import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"
import Swipeable from 'react-swipeable'
import SampleData from "../../sample-data"

const CELL_PADDING = 20

export default class Board extends React.Component {
  constructor(props) {
    super(props)

    this.state = this.initialState(props)
    this.boardRef = React.createRef()
    this.setNoteRefs(this.state)
  }

  initialState(props) {
    let sampleData = SampleData[props.sampleData]

    let state = { 
      notes: sampleData.notes.map(n => Object.assign({}, n, { cells: [], deltaHeight: 0, deltaWidth: 0 })),
      hoverCells: [],
      grid: [
        [ null, null, null, null, null ],
        [ null, null, null, null, null ],
        [ null, null, null, null, null ],
        [ null, null, null, null, null ],
        [ null, null, null, null, null ]
      ]
    }

    state.grid.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        state.grid[rowIndex][colIndex] = React.createRef()
      })
    })

    return state
  }

  setNoteRefs(state) {
    this.noteRefs = {}

    state.notes.forEach(note => {
      this.noteRefs[note.id] = React.createRef()
    })
  }

  setNoteDimensions() {
    let newNotes = this.state.notes.map((note, index) => {
      let ref = this.noteRefs[note.id]
      let height = ref.current.domElement.clientHeight
      let width = ref.current.domElement.clientWidth

      return Object.assign({}, note, { height: height, width: width })
    })

    this.setState({ notes: newNotes })
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.sampleData !== this.props.sampleData) {
      let newState = this.initialState(nextProps)
      this.setNoteRefs(newState)

      this.setState(newState, () => this.setNoteDimensions())
    }
  }

  componentDidMount() {
    this.setNoteDimensions()
  }

  getHoverDimensions(state, cells) {
    let topLeft = cells[0]
    let bottomRight = cells[cells.length - 1]
    let cellsHeight = bottomRight[0] - topLeft[0] + 1
    let cellsWidth = bottomRight[1] - topLeft[1] + 1

    return { cellsHeight: cellsHeight, cellsWidth: cellsWidth }
  }

  handleResize(note, event) {
    let newNote = Object.assign({}, note, { deltaHeight: event.deltaY, deltaWidth: event.deltaX })
    let index = this.state.notes.findIndex(n => n.id === note.id)
    let newNotes = this.state.notes.set(index, newNote)
    let cells = this.overGridCells(this.state, newNote)

    this.setState({ notes: newNotes, hoverCells: cells })
  }

  handleResizeEnd(note, event) {
    let cells = this.overGridCells(this.state, note)
    let { cellsWidth, cellsHeight } = this.getHoverDimensions(this.state, cells)

    let newNote = Object.assign({}, note, { 
      deltaHeight: 0, deltaWidth: 0, deltaX: 0, deltaY: 0, cells: cells
    })

    let index = this.state.notes.findIndex(n => n.id === note.id)
    let newNotes = this.state.notes.set(index, newNote)
    let newState = Object.assign({}, this.state, { notes: newNotes, hoverCells: [] })
    newState = this.displaceNotes(newState, newNote)

    this.setState(newState)
  }

  handlePan(note, event) {
    if(note.active) {
      if(event.target.className === "Note__handleTarget")
        this.handleResize(note, event)
    } else {
      let notes = this.state.notes
      let index = notes.findIndex(n => n.id === note.id)
      let newNote = Object.assign({}, note, { dragging: true, deltaX: event.deltaX, deltaY: event.deltaY })
      let newNotes = notes.set(index, newNote)

      let cells = this.overGridCells(this.state, newNote)

      this.setState({ notes: newNotes, hoverCells: cells })
    }
  }

  handlePanEnd(note, event) {
    if(note.active)
      this.handleResizeEnd(note, event)
    else {
      let notes = this.state.notes
      let index = notes.findIndex(n => n.id === note.id)
      let cells  = this.overGridCells(this.state, note)

      let newNote = Object.assign({}, note, { cells: cells, dragging: false, deltaX: 0, deltaY: 0 })
      let newNotes = notes.set(index, newNote)
      let newState = Object.assign({}, this.state, { notes: newNotes })

      newState = this.displaceNotes(newState, newNote)
      newState = Object.assign({}, newState, { hoverCells: [] })

      this.setState(newState)
    }
  }

  overlappingNotes(state, note) {
    let overlapping = []
    let noteRect = this.noteRefs[note.id].current.domElement.getBoundingClientRect()

    state.notes.forEach(n => {
      let noteBRect = this.noteRefs[n.id].current.domElement.getBoundingClientRect()

      if(n.id === note.id)
        return

      if (!((noteRect.right < noteBRect.left) ||
                (noteRect.left > noteBRect.right) ||
                (noteRect.bottom < noteBRect.top) ||
                (noteRect.top > noteBRect.bottom)))
        overlapping.push(n)
    })

    return overlapping
  }

  displaceNotes(state, note) {
    let overlapping = this.overlappingNotes(state, note)
    let newNotes = state.notes

    overlapping.forEach(overlapNote => {
      if(overlapNote.cells) {
        note.cells.forEach(cell => {
          let newCells = overlapNote.cells.filter(otherCell => {
            return !(cell[0] == otherCell[0] && cell[1] === otherCell[1])
          })


          overlapNote = Object.assign({}, overlapNote, { cells: newCells })
          let overlapNoteIndex = newNotes.findIndex(n => n.id === overlapNote.id)
          newNotes = newNotes.set(overlapNoteIndex, overlapNote)
        })
      }
    })

    return Object.assign({}, state, { notes: newNotes })
  }

  overGridCells(state, note) {
    let overlap = []

    state.grid.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        let cell = state.grid[rowIndex][colIndex]
        let cellRect = cell.current.getBoundingClientRect()
        let noteRect = this.noteRefs[note.id].current.domElement.getBoundingClientRect()

        if (!((noteRect.right < cellRect.left) ||
              (noteRect.left > cellRect.right) ||
              (noteRect.bottom < cellRect.top) ||
              (noteRect.top > cellRect.bottom)))
          overlap.push([ rowIndex, colIndex ])
      })
    })

    return overlap
  }

  isHoverCell(state, cellIndex) {
    if(state.hoverCells.length === 0)
      return false
    else {
      let isHover = false

      state.hoverCells.forEach(hoverCell => {
        if(hoverCell[0] === cellIndex[0] && hoverCell[1] === cellIndex[1])
          isHover = true
      })

      return isHover
    }
  }

  renderGrid(state) {
    let cells = []
    let grid = state.grid

    grid.forEach((row, rowIndex) => {
      let cellPartials = []

      row.forEach((col, colIndex) => {
        let cellClasses = "Board__cell"
        if(this.isHoverCell(this.state, [ rowIndex, colIndex]))
          cellClasses += " Board__cell--hover"

        let ref = grid[rowIndex][colIndex]
        let cell = <div ref={ ref } className={ cellClasses }></div>

        cellPartials.push(cell)
      })

      cells.push(<div className="Board__row">{ cellPartials }</div>)
    })

    return cells
  }

  handleTap(note) {
    let index = this.state.notes.findIndex(n => n.id === note.id)
    let newNote = Object.assign({}, note, { active: !note.active })
    let newNotes = this.state.notes.set(index, newNote)

    this.setState({ notes: newNotes })
  }

  render() {
    let notes = this.state.notes.map(note => {
      let style

      if(note.cells.length > 0) {
        let cell = note.cells[0]
        let cellRef = this.state.grid[cell[0]][cell[1]]
        let { cellsWidth, cellsHeight } = this.getHoverDimensions(this.state, note.cells)

        let height = cellRef.current.clientHeight * cellsHeight
        let width = cellRef.current.clientWidth * cellsWidth
        let { top, left } = cellRef.current.getBoundingClientRect()

        style = {
          top: top + note.deltaY + CELL_PADDING,
          left: left + note.deltaX + CELL_PADDING,
          height: height + note.deltaHeight - 2*CELL_PADDING,
          width: width + note.deltaWidth - 2*CELL_PADDING
        }
      } else {
        style = { 
          left: note.x + note.deltaX + CELL_PADDING,
          top: note.y + note.deltaY + CELL_PADDING
        }

        if(note.height)
          style.height = note.height + note.deltaHeight - 2*CELL_PADDING

        if(note.width)
          style.width = note.width + note.deltaWidth - 2*CELL_PADDING
      }

      let noteClasses = "Note" 
      if(note.dragging)
        noteClasses += " Note--dragging"

      let notePartial
      if(note.imgSrc)
        if(note.active)
          notePartial = <div className={ noteClasses + " Note--active Note--image" } style={ style }>
            <img src={ note.imgSrc } />
            <div className="Note__handle" />
            <div className="Note__handleTarget" />
          </div>
        else
          notePartial = <div className={ noteClasses + " Note--image" } style={ style }>
            <img src={ note.imgSrc } />
          </div>
      else
        if(note.active)
          notePartial = <div className={ noteClasses + " Note--active Note--text" } style={ style }>
            <h5>{ note.text }</h5>
            <div className="Note__handle" />
            <div className="Note__handleTarget" />
          </div>
        else
          notePartial = <div className={ noteClasses + " Note--text" } style={ style }>
            <h5>{ note.text }</h5>
          </div>

      return <Hammer 
        key={ note.id } 
        ref={ this.noteRefs[note.id] } 
        onPan={ event => this.handlePan(note, event) } 
        onPanEnd={ event => this.handlePanEnd(note, event) }
        onTap={ event => this.handleTap(note) }
      >
        { notePartial }
      </Hammer>
    })

    return <Swipeable preventDefaultTouchmoveEvent={ true } onSwipedUp={ () => {} } onSwipedDown={ () => {} }>
      <div className="Board" ref={ this.boardRef }>
        { this.renderGrid(this.state) }
        { notes }
      </div>
    </Swipeable>
  }
}
