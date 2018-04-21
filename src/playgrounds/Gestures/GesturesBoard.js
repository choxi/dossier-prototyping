import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"
import { findIntersection, findSegmentIntersection } from "line-intersection"

const sameSign = (a, b) => (a * b) > 0;

export default class Board extends React.Component {
  constructor() {
    super()

    this.state = { 
      notes: List([
        { id: 1, x: 600, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/MRpLVCa.png" }
      ]),
      viewportDimensions: { width: 100, height: 100 },
      gestures: [],
      currentGesture: null
    }

    this.noteRefs = {}
    this.boardRef = React.createRef()
    this.state.notes.forEach(note => {
      this.noteRefs[note.id] = React.createRef()
    })

    this.canvas = React.createRef()
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
      event.target.className !== "Gestures__canvas" || (false && event.touches[0] && event.touches[0].touchType !== "stylus")
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
      this.setState({ gestures: gestures, currentGesture: null }, () => {
        this.detectGestures(this.state)
      })
    }

    console.log("stylus end")
  }

  detectGestures(state) {
    if(state.gestures.length < 2)
      return

    let gestureA = state.gestures[state.gestures.length - 2]
    let gestureB = state.gestures[state.gestures.length - 1]

    let x1 = gestureA[0].clientX
    let y1 = gestureA[0].clientY

    let x2 = gestureA[gestureA.length - 1].clientX
    let y2 = gestureA[gestureA.length - 1].clientY

    let x3 = gestureB[0].clientX
    let y3 = gestureB[0].clientY

    let x4 = gestureB[gestureB.length - 1].clientX
    let y4 = gestureB[gestureB.length - 1].clientY

    let coordinates = [
      { x: x1, y: y1 }, 
      { x: x2, y: y2 }, 
      { x: x3, y: y3 },
      { x: x4, y: y4 }
    ]

    if(findSegmentIntersection(coordinates)) {
      let intersection = findIntersection(coordinates)
      let targetNotes = this.findNotesAtCoord(state, intersection)
      let newNotes = state.notes.filter(n => !targetNotes.some(tn => tn.id === n.id))
      this.setState({ notes: newNotes }, () => {
        let ctx = this.canvas.current.getContext("2d")
        ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height)
      })
    }
  }

  findNotesAtCoord(state, { x, y }) {
    let notes = []

    state.notes.forEach(note => {
      let { clientWidth, clientHeight } = this.noteRefs[note.id].current.domElement
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

    let { width, height } = this.state.viewportDimensions

    return <div 
      onTouchStart={ event => this.handlePointerStart(event) }
      onTouchMove={ event => this.handlePointer(event) }
      onTouchEnd={ event => this.handlePointerEnd(event) }
    > 
      <div className="Board" ref={ this.boardRef }>
        <canvas className="Gestures__canvas" ref={ this.canvas } width={ width } height={ height } />
        { notes }
      </div>
    </div>
  }
}
