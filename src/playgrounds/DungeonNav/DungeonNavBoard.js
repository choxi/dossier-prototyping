import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"
import Swipeable from 'react-swipeable'

export default class Board extends React.Component {
  static defaultProps = {
    onSwipe: () => {},
    onPinchIn: () => {}
  }

  constructor(props) {
    super(props)
    this.boardRef = React.createRef()
    this.state = { notes: this.props.notes }

    this.noteRefs = {}
    this.state.notes.forEach(note => this.noteRefs[note.id] = React.createRef())
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ notes: nextProps.notes }, () => {
      this.noteRefs = {}
      this.state.notes.forEach(note => this.noteRefs[note.id] = React.createRef())
    })
  }

  handlePan(note, event) {
    let notes = this.state.notes
    let index = notes.findIndex(n => n.id === note.id)
    let newNote = Object.assign({}, note, { deltaX: event.deltaX, deltaY: event.deltaY })
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

  handleSwipe(event, direction) {
    let newEvent = Object.assign({}, event, { direction: direction })
    if(event.target.className === "Board")
      this.props.onSwipe(newEvent)
  }

  handlePinchEnd(event) {
    if(event.scale < 1.0)
      this.props.onPinchIn(event)
  }

  render() {
    let notes = this.state.notes.map(note => {
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

      return <Hammer ref={ this.noteRefs[note.id] } key={ note.id } onPan={ event => this.handlePan(note, event) } onPanEnd={ event => this.handlePanEnd(note, event) }>
        { notePartial }
      </Hammer>
    })

    let pinchOptions = {
      recognizers: {
        pinch: { enable: true }
      }
    }

    return <Swipeable 
      preventDefaultTouchmoveEvent={ true } 
      onSwipedUp={ event => this.handleSwipe(event, "up") }
      onSwipedDown={ event => this.handleSwipe(event, "down") }
      onSwipedLeft={ event => this.handleSwipe(event, "left") }
      onSwipedRight={ event => this.handleSwipe(event, "right") }
    >
      <Hammer options={ pinchOptions } onPinchEnd={ event => this.handlePinchEnd(event) }>
        <div className="Board" ref={ this.boardRef }>
          { notes }
        </div>
      </Hammer>
    </Swipeable>
  }
}
