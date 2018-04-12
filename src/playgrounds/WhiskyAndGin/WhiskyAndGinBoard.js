import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"
import Slider from "react-rangeslider"
import "react-rangeslider/lib/index.css"
import uuid from "uuid/v4"

export default class WhiskyAndGinBoard extends React.Component {
  constructor() {
    super()

    this.state = {
      decelerationFactor: 0.1,
      sensitivity: 10,
      activeNote: null,
      activeGroup: null,
      notes: List([
        // title cards
        { groupId: null, id: 1, x: 200, y: 10, deltaX: 0, deltaY: 0, text: "Whisky-based" },
        { groupId: null, id: 2, x: 700, y: 10, deltaX: 0, deltaY: 0, text: "Gin-based" },
        // drink images
        { groupId: 1, id: 3, x: 20, y: 60, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/sYmDxKW.jpg" },
        { groupId: null, id: 4, x: 200, y: 480, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/9AXtNyM.jpg" },
        { groupId: 2, id: 5, x: 300, y: 60, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/3F1nPsq.jpg" },
        // recipe images
        { groupId: 1, id: 6, x: 20, y: 220, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/04AqCJC.png" },
        { groupId: 2, id: 7, x: 300, y: 310, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/CtpZwlp.png" },
        { groupId: null, id: 8, x: 400, y: 550, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/3tFOAGl.png" },
        // notes
        { groupId: 1, id: 9, x: 5, y: 320, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/c0AZd5y.png" },
        { groupId: null, id: 10, x: 700, y: 500, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/0KKetF0.png" }
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

    this.setState({ activeNote: note }, () => {
      let noteGroup = this.noteGroup(note)
      let notes = this.state.notes
      let newNotes = this.state.notes

      noteGroup.forEach(groupedNote => {
        let index = notes.findIndex(n => n.id === groupedNote.id)
        let newNote = Object.assign({}, groupedNote, { deltaX: event.deltaX, deltaY: event.deltaY })

        newNotes = newNotes.set(index, newNote)
      })

      this.setState({ notes: newNotes })
    })
  }

  noteGroup(note) {
    if(note.groupId)
      return this.state.notes.filter(n => n.groupId === note.groupId)
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

      let newX, newY
      if(groupedNote.panOffset) {
        newX = groupedNote.x + groupedNote.deltaX - groupedNote.panOffset.x
        newY = groupedNote.y + groupedNote.deltaY - groupedNote.panOffset.y
      } else {
        newX = groupedNote.x + groupedNote.deltaX
        newY = groupedNote.y + groupedNote.deltaY
      }

      let newNote = Object.assign({}, groupedNote, { panOffset: null, x: newX, y: newY, deltaX: 0, deltaY: 0 })

      newNotes = newNotes.set(index, newNote)
    })

    this.setState({ activeNote: null, notes: newNotes }, () => this.handleMomentum(note, event.velocityX, event.velocityY))
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
    if(this.state.activeGroup && note.groupId !== this.state.activeGroup) {
      let index = this.state.notes.findIndex(n => n.id === note.id)
      let newNote = Object.assign({}, note, { groupId: this.state.activeGroup })
      let newNotes = this.state.notes.set(index, newNote)
      this.setState({ notes: newNotes, activeGroup: newNote.groupId })
    } else if(this.state.activeGroup && note.groupId === this.state.activeGroup) {
      let index = this.state.notes.findIndex(n => n.id === note.id)
      let newNote = Object.assign({}, note, { groupId: null })
      let newNotes = this.state.notes.set(index, newNote)
      this.setState({ notes: newNotes })
    } else if(note.groupId) {
      this.setState({ activeGroup: note.groupId })
    } else {
      let index = this.state.notes.findIndex(n => n.id === note.id)
      let newNote = Object.assign({}, note, { groupId: uuid() })
      let newNotes = this.state.notes.set(index, newNote)
      this.setState({ notes: newNotes, activeGroup: newNote.groupId })
    }
  }

  cancelGroup(event) {
    if(event.srcEvent.target.className === "Board") {
      this.setState({ activeGroup: null })
    }
  }

  render() {
    let doubleTapOptions = {
      recognizers: {
        tap: {
          taps: 2,
          threshold: 10,
          posThreshold: 20
        }
      }
    }

    let notes = this.state.notes.map(note => {
      let style
      if(note.panOffset)
        style  = {
          left: note.x + note.deltaX - note.panOffset.x,
          top: note.y + note.deltaY - note.panOffset.y
        }
      else
        style  = {
          left: note.x + note.deltaX,
          top: note.y + note.deltaY
        }

      let groupedClasses
      if(this.state.activeGroup && this.state.activeGroup === note.groupId)
        groupedClasses = "Note--grouped"

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
            options={ doubleTapOptions }
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
      <Hammer options={ doubleTapOptions } onTap={ event => this.cancelGroup(event) }>
        <div className="Board" ref={ this.boardRef }>
          { notes }
        </div>
      </Hammer>
    </div>
  }
}
