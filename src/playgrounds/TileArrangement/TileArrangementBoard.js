import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"

export default class Board extends React.Component {
  constructor() {
    super()

    this.state = { 
      decelerationFactor: 0.1,
      sensitivity: 10,
      notes: List([
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
    }

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

    if(!this.noteInBounds(newNote))
      return

    let newNotes = notes.set(index, newNote)

    this.setState({ notes: newNotes })
  }

  noteInBounds(note) {
    let width = this.noteRefs[note.id].current.domElement.clientWidth
    let height = this.noteRefs[note.id].current.domElement.clientHeight
    let x = note.x + note.deltaX
    let y = note.y + note.deltaY

    if(x < 0 || (x + width) > this.boardRef.current.clientWidth) 
      return false

    if(y < 0 || (y + height) > this.boardRef.current.clientHeight)
      return false

    return true
  }

  handlePanEnd(note, event) {
    let notes = this.state.notes
    let index = notes.findIndex(n => n.id === note.id)

    let newX = note.x + note.deltaX
    let newY = note.y + note.deltaY

    let newNote = Object.assign({}, note, { x: newX, y: newY, deltaX: 0, deltaY: 0 })

    if(!this.noteInBounds(newNote))
      return

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

    return <div>
      <div className="Board" ref={ this.boardRef }>
        { notes }
      </div>
    </div>
  }
}
