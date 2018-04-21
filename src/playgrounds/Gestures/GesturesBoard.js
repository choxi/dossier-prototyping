import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"
import Slider from "react-rangeslider"
import "react-rangeslider/lib/index.css"

export default class Board extends React.Component {
  constructor() {
    super()

    this.state = { 
      notes: List([
        { id: 1, x: 600, y: 100, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/MRpLVCa.png" }
      ]),
      viewportDimensions: { width: 100, height: 100 }
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

  handlePointer(event) {
    if(event.target.className !== "Gestures__canvas" || (false && event.touches[0] && event.touches[0].touchType !== "stylus"))
      return
    else
      event.preventDefault()

    let ctx = this.canvas.current.getContext("2d")
    let x = event.touches[0].clientX
    let y = event.touches[0].clientY

    ctx.fillStyle = "#3498db"
    ctx.fillRect(x, y, 5, 5)
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

    return <div onTouchMove={ event => this.handlePointer(event) }> 
      <div className="Board" ref={ this.boardRef }>
        <canvas className="Gestures__canvas" ref={ this.canvas } width={ width } height={ height } />
        { notes }
      </div>
    </div>
  }
}
