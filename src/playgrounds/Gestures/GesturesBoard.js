import React from "react"
import Hammer from "react-hammerjs"
import { List } from "immutable"

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

    let gestureA = state.gestures[0]
    let gestureB = state.gestures[1]

    let x1 = gestureA[0].clientX
    let y1 = gestureA[0].clientY

    let x2 = gestureA[gestureA.length - 1].clientX
    let y2 = gestureA[gestureA.length - 1].clientY

    let x3 = gestureB[0].clientX
    let y3 = gestureB[0].clientY

    let x4 = gestureB[gestureB.length - 1].clientX
    let y4 = gestureB[gestureB.length - 1].clientY

    if(this.intersect(x1, y1, x2, y2, x3, y3, x4, y4))
      console.log("intersect")
  }

  // https://gist.github.com/lengstrom/8499382
  intersect(x1, y1, x2, y2, x3, y3, x4, y4){
    var a1, a2, b1, b2, c1, c2;
    var r1, r2 , r3, r4;
    var denom, offset, num;

    // Compute a1, b1, c1, where line joining points 1 and 2
    // is "a1 x + b1 y + c1 = 0".
    a1 = y2 - y1;
    b1 = x1 - x2;
    c1 = (x2 * y1) - (x1 * y2);

    // Compute r3 and r4.
    r3 = ((a1 * x3) + (b1 * y3) + c1);
    r4 = ((a1 * x4) + (b1 * y4) + c1);

    // Check signs of r3 and r4. If both point 3 and point 4 lie on
    // same side of line 1, the line segments do not intersect.
    if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)){
      return 0; //return that they do not intersect
    }

    // Compute a2, b2, c2
    a2 = y4 - y3;
    b2 = x3 - x4;
    c2 = (x4 * y3) - (x3 * y4);

    // Compute r1 and r2
    r1 = (a2 * x1) + (b2 * y1) + c2;
    r2 = (a2 * x2) + (b2 * y2) + c2;

    // Check signs of r1 and r2. If both point 1 and point 2 lie
    // on same side of second line segment, the line segments do
    // not intersect.
    if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))){
      return 0; //return that they do not intersect
    }

    //Line segments intersect: compute intersection point.
    denom = (a1 * b2) - (a2 * b1);

    if (denom === 0) {
      return 1; //collinear
    }

    // lines_intersect
    return 1; //lines intersect, return true
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
