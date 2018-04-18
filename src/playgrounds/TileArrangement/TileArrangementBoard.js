import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"

export default class Board extends React.Component {
  constructor() {
    super()

    this.state = { 
      notes: List([
        { id: 1, x: 600, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/MRpLVCa.png" }
      ]),

      grid: [
        [ null, null, null ],
        [ null, null, null ],
        [ null, null, null ]
      ],

      hoverCell: null,
    }

    this.state.grid.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        this.state.grid[rowIndex][colIndex] = React.createRef()
      })
    })

    this.noteRefs = {}
    this.boardRef = React.createRef()
    this.state.notes.forEach(note => {
      this.noteRefs[note.id] = React.createRef()
    })
  }

  handlePan(note, event) {
    let notes = this.state.notes
    let index = notes.findIndex(n => n.id === note.id)
    let newNote = Object.assign({}, note, { deltaX: event.deltaX, deltaY: event.deltaY })
    let newNotes = notes.set(index, newNote)

    let cell = this.overGridCells(this.state, newNote)[0]

    this.setState({ notes: newNotes, hoverCell: cell })
  }

  handlePanEnd(note, event) {
    let notes = this.state.notes
    let index = notes.findIndex(n => n.id === note.id)
    let cell  = this.overGridCells(this.state, note)[0]
    let cellRef = this.state.grid[cell[0]][cell[1]]
    let height = cellRef.current.clientHeight
    let width = cellRef.current.clientWidth
    let { top, left } = cellRef.current.getBoundingClientRect()

    let newY = top
    let newX = left

    let newNote = Object.assign({}, note, { x: newX, y: newY, deltaX: 0, deltaY: 0, height: height, width: width })
    let newNotes = notes.set(index, newNote)

    this.setState({ notes: newNotes, hoverCell: null })
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

  renderGrid(state) {
    let cells = []
    let grid = state.grid

    grid.forEach((row, rowIndex) => {
      let cellPartials = []

      row.forEach((col, colIndex) => {
        let cellClasses = "Board__cell"
        if(state.hoverCell && state.hoverCell[0] === rowIndex && state.hoverCell[1] === colIndex)
          cellClasses += " Board__cell--hover"

        let ref = grid[rowIndex][colIndex]
        let cell = <div ref={ ref } className={ cellClasses }></div>

        cellPartials.push(cell)
      })

      cells.push(<div className="Board__row">{ cellPartials }</div>)
    })

    return cells
  }

  render() {
    let notes = this.state.notes.map(note => {
      let options = { preventDefault: true }

      let style = { 
        left: note.x + note.deltaX,
        top: note.y + note.deltaY,
        height: note.height - 20,
        width: note.width - 20
      }

      let notePartial
      if(note.imgSrc)
        notePartial = <div className="Note Note--image" style={ style }>
          <img src={ note.imgSrc } />
        </div>
       else
        notePartial = <div className="Note Note--text" style={ style }>
          <h5>{ note.text }</h5>
        </div>

      return <Hammer ref={ this.noteRefs[note.id] } options={ options } key={ note.id } onPan={ event => this.handlePan(note, event) } onPanEnd={ event => this.handlePanEnd(note, event) }>
        { notePartial }
      </Hammer>
    })

    return <div className="Board" ref={ this.boardRef }>
      { this.renderGrid(this.state) }
      { notes }
    </div>
  }
}
