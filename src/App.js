import React from "react"
import Hammer from "react-hammerjs"
import "./App.css"

class Note extends React.Component {
  render() {
    return <h1>Note</h1>
  }
}

export default class App extends React.Component {
  constructor() {
    super()
    this.state = { zoom: 1.0, log: [] }
  }

  handlePinch(event) {
    this.print(event)
    this.setState({ zoom: event.scale })
  }

  handleTap(event) {
    this.print(event)
  }

  print(object) {
    this.setState({ log: [...this.state.log, Object.assign({}, object)] })
  }

  renderLog() {
    return <ul> 
      { this.state.log.map(event => this.renderEvent(event)) }
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

    return <div className="App">
      <Hammer 
        options={ options } 
        onPinch={ (...args) => this.handlePinch(...args) }
        onTap={ (...args) => this.handleTap(...args) }
      >
        <div className="Board" style={{ zoom: this.state.zoom }}>
          <Note />
        </div>
      </Hammer>

      <div>Log: { this.renderLog() }</div>
    </div>
  }
}
