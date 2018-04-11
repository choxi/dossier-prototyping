import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"
import Slider from "react-rangeslider"
import "react-rangeslider/lib/index.css"

export default class GroupingBoard extends React.Component {
  constructor() {
    super()

    this.state = {
      decelerationFactor: 0.1,
      sensitivity: 10,
      notes: List([
        { grouped: false, id: 1, x: 600, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/MRpLVCa.png" },
        { grouped: false, id: 2, x: 700, y: 140, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/Ja2emXY.png" },
        { grouped: false, id: 3, x: 640, y: 240, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/bGrGdiO.png" },
        { grouped: false, id: 4, x: 800, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/GGc7lyo.png" },
        { grouped: false, id: 5, x: 730, y: 110, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/CyNRme7.png" },
        { grouped: false, id: 6, x: 790, y: 100, deltaX: 0, deltaY: 0, text: "Mayhaw Cocktail" },
        { grouped: false, id: 7, x: 830, y: 216, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/1m0iz7e.png" },
        { grouped: false, id: 8, x: 900, y: 100, deltaX: 0, deltaY: 0, text: "Alaska Cocktail" },
        { grouped: false, id: 9, x: 800, y: 220, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/rlVzV5o.png" },
        { grouped: false, id: 10, x: 900, y: 100, deltaX: 0, deltaY: 0, text: "Gold Cold Blackberry Smash" },
        { grouped: false, id: 11, x: 820, y: 190, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/3piuYAz.png" },
        { grouped: false, id: 12, x: 910, y: 175, deltaX: 0, deltaY: 0, text: "Twisted Thistle" },
        { grouped: false, id: 13, x: 870, y: 221, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/qU4GDxC.png" }
      ])
    }

    this.noteRefs = {}
    this.boardRef = React.createRef()
    this.state.notes.forEach(note => {
      this.noteRefs[note.id] = React.createRef()
    })
  }

  handlePan(note, event) {
    event.preventDefault()
    event.srcEvent.preventDefault()

    let noteGroup = this.noteGroup(note)
    let notes = this.state.notes
    let newNotes = this.state.notes

    noteGroup.forEach(groupedNote => {
      let index = notes.findIndex(n => n.id === groupedNote.id)
      let newNote = Object.assign({}, groupedNote, { grouped: true, deltaX: event.deltaX, deltaY: event.deltaY })

      newNotes = newNotes.set(index, newNote)
    })

    this.setState({ notes: newNotes })
  }

  noteGroup(note) {
    if(note.grouped)
      return this.state.notes.filter(note => note.grouped)
    else
      return [ note ]
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
    let noteGroup = this.noteGroup(note)
    let newNotes = this.state.notes

    noteGroup.forEach(groupedNote => {
      let index = notes.findIndex(n => n.id === groupedNote.id)
      let newX = groupedNote.x + groupedNote.deltaX
      let newY = groupedNote.y + groupedNote.deltaY
      let newNote = Object.assign({}, groupedNote, { grouped: false, x: newX, y: newY, deltaX: 0, deltaY: 0 })

      newNotes = newNotes.set(index, newNote)
    })

    this.setState({ notes: newNotes }, () => this.handleMomentum(note, event.velocityX, event.velocityY))
  }

  handleMomentum(note, velocityX, velocityY, deceleration=1.0) {
    if(deceleration <= 0.1)
      return

    let notes = this.state.notes
    note = notes.find(n => n.id === note.id)
    let newNotes = this.state.notes

    let noteGroup = this.noteGroup(note)
    noteGroup.forEach(groupedNote => {
      let index = notes.findIndex(n => n.id === groupedNote.id)
      let newX = groupedNote.x + velocityX * this.state.sensitivity
      let newY = groupedNote.y + velocityY * this.state.sensitivity
      let newNote = Object.assign({}, groupedNote, { x: newX, y: newY, deltaX: 0, deltaY: 0 })

      newNotes = newNotes.set(index, newNote)
    })


    this.setState({ notes: newNotes }, () => {
      deceleration = deceleration * (1 - this.state.decelerationFactor)
      setTimeout(() => this.handleMomentum(note, velocityX, velocityY, deceleration), 5)
    })
  }

  handleTap(note, event) {
    let groupedNotes = this.state.notes.filter(n => n.grouped)

    if(groupedNotes.size > 0) {
      let notes = this.state.notes
      let index = notes.findIndex(n => n.id === note.id)
      let newNote = Object.assign({}, note, { grouped: !note.grouped })
      let newNotes = notes.set(index, newNote)

      this.setState({ notes: newNotes })
    }
  }

  cancelGroup(event) {
    if(event.srcEvent.target.className === "Board") {
      let newNotes = this.state.notes
      let groupedNotes = this.state.notes.filter(n => n.grouped)

      groupedNotes.forEach(note => {
        let index = newNotes.findIndex(n => n.id === note.id)
        let newNote = Object.assign({}, note, { grouped: false })

        newNotes = newNotes.set(index, newNote)
      })

      this.setState({ notes: newNotes })
    }
  }

  render() {
    let notes = this.state.notes.map(note => {
      let style = {
        left: note.x + note.deltaX,
        top: note.y + note.deltaY
      }

      let groupedClasses = note.grouped ? "Note--grouped" : ""
      let notePartial
      if(note.imgSrc)
        notePartial = <div className={ "Note Note--image " + groupedClasses } style={ style }>
          <img src={ note.imgSrc } />
        </div>
       else
        notePartial = <div className={ "Note Note--text " + groupedClasses }  style={ style }>
          <h5>{ note.text }</h5>
        </div>

          return <Hammer
            ref={ this.noteRefs[note.id] }
            key={ note.id }
            onPan={ event => this.handlePan(note, event) }
            onPanEnd={ event => this.handlePanEnd(note, event) }
            onTap={ event => this.handleTap(note, event) }
          >
        { notePartial }
      </Hammer>
    })

    let tools
    if(this.props.showTools)
      tools = <div className="Board__variables">
        <h5>Momentum Sensitivity</h5>
        <Slider min={ 5 } max={ 20 } step={ 0.1 } value={ this.state.sensitivity } onChange={ value => this.setState({ sensitivity: value }) } />
        <h5>Momentum Deceleration</h5>
        <Slider min={ 0.001 } max={ 1.0 } step={ 0.001 } value={ this.state.decelerationFactor } onChange={ value => this.setState({ decelerationFactor: value }) } />
      </div>


    return <div>
      { tools }
      <div className="Board" ref={ this.boardRef }>
        { notes }
      </div>
    </div>
  }
}
