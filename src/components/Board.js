import React from "react"
import Hammer from "react-hammerjs"

export default class Board extends React.Component {
  static defaultProps = {
    zoomSnap: false
  }

  constructor(props) {
    super(props)
    this.state = { zoom: 1.0, zoomFactor: 1.0, log: [] }
  }

  handlePinch(event) {
    let scale = this.props.zoomSnap ? this.roundPoint5(event.scale) : event.scale
    this.setState({ zoomFactor: scale })
  }

  roundPoint5(number) {
    number = number * 10
    number = Math.ceil(number / 5) * 5
    return number / 10
  }

  handlePinchEnd(event) {
    this.setState({ zoom: this.state.zoom * this.state.zoomFactor, zoomFactor: 1 })
  }

  handleTap(event) {
    this.print(event)
  }

  print(object) {
    this.setState({ log: [...this.state.log, object] })
  }

  renderLog() {
    return <ul>
      { 
        this.state.log.map(event => {
          return <li>{ event }</li>
        }) 
      }
    </ul>
  }

  renderEvent(event) {
    let parsedEvent = {
      type: event.type,
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      scale: event.scale
    }

    return <li> { JSON.stringify(parsedEvent, null, 4) } </li>
  }

  render() {
    let options = {
      recognizers: {
        pinch: { enable: true }
      }
    }

    return <div>
      <Hammer
        options={ options }
        onPinch={ (...args) => this.handlePinch(...args) }
        onPinchEnd={ event => this.handlePinchEnd(event) }
        onTap={ (...args) => this.handleTap(...args) }
      >
        <div className="Board" style={{ zoom: this.state.zoom * this.state.zoomFactor }}>
        </div>
      </Hammer>

      <div>Log: { this.renderLog() }</div>
    </div>
  }
}
