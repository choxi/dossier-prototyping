import React from "react"
import Note from "./Note"
import Hammer from "react-hammerjs"
import { List } from "immutable"

export default class Board extends React.Component {
  constructor() {
    super()

    this.state = { 
      notes: List([
        { id: 1, x: 0, y: 0, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/MRpLVCa.png" },
        { id: 2, x: 100, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/Ja2emXY.png" }
      ]) 
    }
  }

  handlePan(note, event) {
    event.preventDefault()
    event.srcEvent.preventDefault()

    let notes = this.state.notes

    let index = notes.findIndex(n => n.id === note.id)
    let newNote = Object.assign({}, note, { deltaX: event.deltaX, deltaY: event.deltaY })
    let newNotes = notes.set(index, newNote)

    this.setState({ notes: newNotes })
  }

  handlePanEnd(note, event) {
    let notes = this.state.notes
    let index = notes.findIndex(n => n.id === note.id)

    let newX = note.x + note.deltaX
    let newY = note.y + note.deltaY
    let newNote = Object.assign({}, note, { x: newX, y: newY, deltaX: 0, deltaY: 0 })
    let newNotes = notes.set(index, newNote)

    this.setState({ notes: newNotes })
  }

  render() {
    let notes = this.state.notes.map(note => {
      let options = { preventDefault: true }

      let style = { 
        left: note.x + note.deltaX,
        top: note.y + note.deltaY
      }

      return <Hammer options={ options } key={ note.id } onPan={ event => this.handlePan(note, event) } onPanEnd={ event => this.handlePanEnd(note, event) }>
        <div className="Note" style={ style }>
          <img src={ note.imgSrc } />
        </div>
      </Hammer>
    })

    return <div className="Board">
      { notes }
    </div>
  }
}
