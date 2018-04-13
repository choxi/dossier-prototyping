import React from "react"
import Hammer from "react-hammerjs"
import Slider from "react-rangeslider"
import "react-rangeslider/lib/index.css"
import uuid from "uuid/v4"
import SampleData from "../../sample-data"
import { updateNote } from "../../lib/helpers"

export default class WhiskyAndGinBoard extends React.Component {
  constructor() {
    super()

    this.state = Object.assign({}, SampleData.cocktails, { proximityPadding: 10 })
    this.noteRefs = {}
    this.boardRef = React.createRef()
    this.state.notes.forEach(note => {
      this.noteRefs[note.id] = React.createRef()
    })
  }

  componentWillMount() {
    let newState = SampleData[this.props.sampleData]
    newState.notes.forEach(n => n.anchor = false)
    this.setState(newState)

    this.noteRefs = {}
    newState.notes.forEach(note => {
      this.noteRefs[note.id] = React.createRef()
    })
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.sampleData !== this.props.sampleData) {
      let newState = SampleData[nextProps.sampleData]
      newState.notes.forEach(n => n.anchor = false)
      this.setState(newState)

      this.noteRefs = {}
      newState.notes.forEach(note => {
        this.noteRefs[note.id] = React.createRef()
      })
    }
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

  noteGroup(note, notes) {
    if(!notes)
      notes = this.state.notes

    if(note.groupId)
      return notes.filter(n => n.groupId === note.groupId)
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

  notesOverlap(notes, noteA, noteB) {
    let overlap = false

    this.noteGroup(noteB, notes).forEach(n => {
      let noteARect = this.noteRefs[noteA.id].current.domElement.getBoundingClientRect()
      let noteBRect = this.noteRefs[n.id].current.domElement.getBoundingClientRect()

      if (!((noteARect.right < noteBRect.left) ||
                (noteARect.left > noteBRect.right) ||
                (noteARect.bottom < noteBRect.top) ||
                (noteARect.top > noteBRect.bottom)))
        overlap = true
    })

    return overlap
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

    note = newNotes.find(n => n.id === note.id)
    let pregrouped = newNotes

    pregrouped.forEach(n => {
      if(n.id === note.id)
        return

      if(this.notesOverlap(pregrouped, n, note)) {
        newNotes = this.groupNotes(newNotes, n, note)
      }
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

  groupNotes(notes, noteA, noteB) {
    let newNotes = notes

    if(noteA.groupId && noteB.groupId && noteA.groupId === noteB.groupId)
      return newNotes

    if(noteA.groupId)
      if(noteB.groupId)
        this.noteGroup(noteB, newNotes).forEach(n => {
          newNotes = updateNote(newNotes, n, { groupId: noteA.groupId })
        })
      else
        newNotes = updateNote(newNotes, noteB, { groupId: noteA.groupId })
    else if(noteB.groupId)
      newNotes = updateNote(newNotes, noteA, { groupId: noteB.groupId })
    else {
      let groupId = uuid()
      newNotes = updateNote(newNotes, noteA, { groupId: groupId })
      newNotes = updateNote(newNotes, noteB, { groupId: groupId })
    }

    return newNotes
  }

  handlePress(note, event) {
    let newNotes = updateNote(this.state.notes, note, { groupId: null })
    this.setState({ notes: newNotes, activeNote: note })
  }

  cancelGroup(event) {
    if(event.srcEvent.target.className === "Board") {
      this.setState({ activeGroup: null })
    }
  }

  render() {
    let pressOptions = {
      recognizers: {
        press: {
          threshold: 10,
          time: 300
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
          top: note.y + note.deltaY,
          padding: this.state.proximityPadding
        }

      let groupedClasses
      if(this.state.activeNote && this.state.activeNote.groupId && this.state.activeNote.groupId === note.groupId)
        groupedClasses = "Note--grouped"
      else if(this.state.activeNote && !(this.state.activeNote.groupId && this.state.activeNote.groupId === note.groupId))
        groupedClasses = "Note--groupable"

      let notePartial
      if(note.imgSrc)
        notePartial = <div className={ "Note Note--image " + groupedClasses } style={ style }>
          <div className="Note__body">
            <img src={ note.imgSrc } />
          </div>
        </div>
       else
        notePartial = <div className={ "Note Note--text " + groupedClasses }  style={ style }>
          <div className="Note__body">
            <h5>{ note.text }</h5>
          </div>
        </div>

          return <Hammer
            ref={ this.noteRefs[note.id] }
            key={ note.id }
            options={ pressOptions }
            onPan={ event => this.handlePan(note, event) }
            onPanEnd={ event => this.handlePanEnd(note, event) }
            onPress={ event => this.handlePress(note, event) }
          >
        { notePartial }
      </Hammer>
    })

    let tools
    if(this.props.showTools)
      tools = <div className="Board__variables">
        <h5>Proximity Padding</h5>
        <Slider min={ 0 } max={ 50 } step={ 10 } value={ this.state.proximityPadding } onChange={ value => this.setState({ proximityPadding: value }) } />
      </div>


    return <div>
      { tools }
      <div className="Board" ref={ this.boardRef }>
        { notes }
      </div>
    </div>
  }
}
