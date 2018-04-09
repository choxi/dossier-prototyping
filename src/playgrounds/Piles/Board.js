import React from "react"
import Note from "./Note"
import Hammer from "react-hammerjs"
import "./styles.css"

export default class Board extends React.Component {
  constructor() {
    super()

    this.state = { 
      notes: [
        { id: 1, x: 0, y: 0, deltaX: 0, deltaY: 0 }
      ] 
    }
  }

  handlePan(note, event) {
    console.log("handlePan")

    let newNote = Object.assign({}, note, { deltaX: event.deltaX, deltaY: event.deltaY })
    this.setState({ notes: [ newNote ]})
  }

  handlePanEnd(note, event) {
    console.log("handlePanEnd")

    let newX = note.x + note.deltaX
    let newY = note.y + note.deltaY

    let newNote = Object.assign({}, note, { x: newX, y: newY, deltaX: 0, deltaY: 0 })
    this.setState({ notes: [ newNote ] })
  }

  render() {
    let notes = this.state.notes.map(note => {
      let style = { 
        left: note.x + note.deltaX,
        top: note.y + note.deltaY
      }

      return <Hammer key={ note.id } onPan={ event => this.handlePan(note, event) } onPanEnd={ event => this.handlePanEnd(note, event) }>
        <div className="Note" style={ style }>
        </div>
      </Hammer>
    })

    return <div className="Board">
      { notes }
    </div>
  }
}
