import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"
import Slider from "react-rangeslider"
import "react-rangeslider/lib/index.css"

export default class Board extends React.Component {
  constructor() {
    super()

    this.state = { 
      decelerationFactor: 0.1,
      sensitivity: 5,
      notes: List([
        { id: 1, x: 0, y: 0, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/MRpLVCa.png" },
        { id: 2, x: 100, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/Ja2emXY.png" },
        { id: 3, x: 100, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/bGrGdiO.png" },
        { id: 4, x: 100, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/GGc7lyo.png" },
        { id: 5, x: 100, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/CyNRme7.png" }
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

    this.setState({ notes: newNotes }, () => this.handleMomentum(note, event.velocityX, event.velocityY))
  }

  handleMomentum(note, velocityX, velocityY, deceleration=1.0) {
    if(deceleration <= 0.1)
      return
   
    let notes = this.state.notes
    note = notes.find(n => n.id === note.id)
    let index = notes.findIndex(n => n.id === note.id)

    let newX = note.x + velocityX * this.state.sensitivity
    let newY = note.y + velocityY * this.state.sensitivity

    let newNote = Object.assign({}, note, { x: newX, y: newY, deltaX: 0, deltaY: 0 })
    let newNotes = notes.set(index, newNote)

    this.setState({ notes: newNotes }, () => {
      deceleration = deceleration * (1 - this.state.decelerationFactor)
      setTimeout(() => this.handleMomentum(note, velocityX, velocityY, deceleration), 1)
    })
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

    return <div>
      <div className="Board__variables">
        <h5>Momentum Sensitivity</h5>
        <Slider min={ 0 } max={ 10 } step={ 0.1 } value={ this.state.sensitivity } onChange={ value => this.setState({ sensitivity: value }) } />
        <h5>Momentum Deceleration</h5>
        <Slider min={ 0.01 } max={ 0.5 } step={ 0.01 } value={ this.state.decelerationFactor } onChange={ value => this.setState({ decelerationFactor: value }) } />
      </div>

      <div className="Board">
        { notes }
      </div>
    </div>
  }
}
