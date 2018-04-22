import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"
import ShapeDetector from "shape-detector"
import Swipeable from "react-swipeable"
import SampleData from "../../sample-data"

export default class Board extends React.Component {
  constructor(props) {
    super(props)

    this.state = this.getInitialState(props)
    this.canvas = React.createRef()
    this.boardRef = React.createRef()
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.sampleData !== nextProps.sampleData) {
      let newState = this.getInitialState(nextProps)
      this.setState(newState, () => this.updateViewportDimensions())
    }
  }

  getInitialState(props) {
    let sd = SampleData
    let notes = SampleData[props.sampleData].notes
    let inbox = notes.slice(1)
    notes = notes.slice(0, 1)

    let state = { 
      notes: notes,
      inbox: inbox,
      viewportDimensions: { width: 100, height: 100 },
      gestures: [],
      currentGesture: null
    }

    state.notes.forEach(note => note.ref = React.createRef())
    state.inbox.forEach(note => note.ref = React.createRef())

    return state
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateViewportDimensions)
    this.updateViewportDimensions()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateViewportDimensions)
  }

  updateViewportDimensions() {
    let { clientWidth, clientHeight } = this.boardRef.current
    this.setState({ viewportDimensions: { width: clientWidth, height: clientHeight }})
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

  isStylus(event) {
    return !(
      event.target.className !== "Board" || (event.touches[0] && event.touches[0].touchType !== "stylus")
    )
  }

  handlePointer(event) {
    if(this.isStylus(event))
      event.preventDefault()
    else
      return

    let ctx = this.canvas.current.getContext("2d")
    let x = event.touches[0].clientX
    let y = event.touches[0].clientY

    let currentGesture = this.state.currentGesture
    currentGesture = [ ...currentGesture, event.touches[0] ]
    this.setState({ currentGesture: currentGesture })

    ctx.fillStyle = "#3498db"
    ctx.fillRect(x, y, 5, 5)
  }

  handlePointerStart(event) {
    if(this.isStylus(event))
      event.preventDefault()
    else
      return

    if(!this.state.currentGesture) {
      let currentGesture = []
      currentGesture.push(event.touches[0])
      this.setState({ currentGesture: currentGesture })
    }
  }

  handlePointerEnd(event) {
    if(this.isStylus(event))
      event.preventDefault()
    else
      return

    let { currentGesture, gestures } = this.state
    if(currentGesture) {
      currentGesture = [ ...currentGesture, event.changedTouches[0] ]
      gestures = [ ...gestures, currentGesture ]
      this.setState({ gestures: gestures, currentGesture: null }, () => this.detectGestures(this.state))
    }
  }

  detectGestures(state) {
    let detector = new ShapeDetector(ShapeDetector.defaultShapes)
    let lastGesture = state.gestures[state.gestures.length - 1]
    let stroke = lastGesture.map(touch => ({ x: touch.clientX, y: touch.clientY }))
    let gesture = detector.spot(stroke)
    let lastPoint = stroke[stroke.length - 1]

    if(gesture.pattern && gesture.score > 0.6) {
      let targetNotes = this.findNotesAtCoord(state, lastPoint)

      if(gesture.pattern === "triangle") {
        let newNotes = state.notes.filter(n => !targetNotes.some(tn => tn.id === n.id))
        this.setState({ notes: newNotes }, () => this.clearCanvas())
      } else if(gesture.pattern === "square") {
        let newNote = state.inbox.get(0)
        newNote = Object.assign({}, newNote, { x: lastPoint.x, y: lastPoint.y })

        let newInbox = state.inbox.remove(0)
        let newNotes = state.notes.push(newNote)

        this.setState({ notes: newNotes, inbox: newInbox }, () => this.clearCanvas())
      }
    }
  }

  clearCanvas() {
    let ctx = this.canvas.current.getContext("2d")
    ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height)
  }

  findNotesAtCoord(state, { x, y }) {
    let notes = []

    state.notes.forEach(note => {
      let { clientWidth, clientHeight } = note.ref.current.domElement
      let minX = note.x
      let maxX = note.x + clientWidth
      let minY = note.y
      let maxY = note.y + clientHeight

      if(x > minX && x < maxX && y > minY && y < maxY)
        notes.push(note)
    })

    return notes
  }

  noteInBounds(note) {
    let width = note.ref.current.domElement.clientWidth
    let height = note.ref.current.domElement.clientHeight
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

      return <Hammer ref={ note.ref } options={ options } key={ note.id } onPan={ event => this.handlePan(note, event) } onPanEnd={ event => this.handlePanEnd(note, event) }>
        { notePartial }
      </Hammer>
    })

    let { width, height } = this.state.viewportDimensions

    return <Swipeable preventDefaultTouchmoveEvent={ true } onSwipedUp={ () => {} } onSwipedDown={ () => {} }>
      <canvas className="Gestures__canvas" ref={ this.canvas } width={ width } height={ height } />
      <div className="Board" 
        ref={ this.boardRef }
        onTouchStart={ event => this.handlePointerStart(event) }
        onTouchMove={ event => this.handlePointer(event) }
        onTouchEnd={ event => this.handlePointerEnd(event) }
      >
        { notes }
      </div>
    </Swipeable>
  }
}
