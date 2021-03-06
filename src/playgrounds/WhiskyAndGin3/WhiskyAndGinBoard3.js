import React from "react"
import Hammer from "react-hammerjs"
import Slider from "react-rangeslider"
import "react-rangeslider/lib/index.css"
import uuid from "uuid/v4"
import SampleData from "../../sample-data"
import { updateNote, idToHex } from "../../lib/helpers"

export default class WhiskyAndGinBoard3 extends React.Component {
  constructor(props) {
    super(props)

    this.state = SampleData[this.props.sampleData]
    this.state.notes.forEach(n => n.anchor = false)

    this.boardRef = React.createRef()
    this.noteRefs = {}
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

  handlePress(note, event) {
    let newNotes = updateNote(this.state.notes, note, { groupId: null, anchor: !note.anchor })
    this.setState({ notes: newNotes })
  }

  handlePan(note, event) {
    event.preventDefault()
    event.srcEvent.preventDefault()

    if(note.anchor)
      return

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
    if(note.anchor)
      return

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
    if(note.anchor)
      return

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
    let pressOptions = {
      threshold: 10,
      time: 300
    }

    let doubleTapOptions = {
      taps: 2,
      threshold: 10,
      posThreshold: 20
    }

    let noteGestureOptions = {
      recognizers: {
        press: pressOptions,
        tap: doubleTapOptions
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

      if(note.groupId)
        style["borderTop"] = `6px solid ${ idToHex(note.groupId) }`

      let groupedClasses = ""
      if(this.state.activeGroup && this.state.activeGroup === note.groupId)
        groupedClasses = "Note--grouped"

      if(note.anchor)
        groupedClasses = "Note--anchored"

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
            options={ noteGestureOptions }
            onPan={ event => this.handlePan(note, event) }
            onPanEnd={ event => this.handlePanEnd(note, event) }
            onPress={ event => this.handlePress(note, event) }
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
      <Hammer options={{ recognizers: { tap: doubleTapOptions } }} onTap={ event => this.cancelGroup(event) }>
        <div className="Board" ref={ this.boardRef }>
          { notes }
        </div>
      </Hammer>
    </div>
  }
}
