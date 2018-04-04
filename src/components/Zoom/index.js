import React from "react"
import Board from "./Board"

export default class App extends React.Component {
  render() {
    return <div>
      <h3>Continuous Zoom</h3>
      <Board />
      <h3>Discrete Zoom</h3>
      <Board zoomSnap={ true } />
    </div>
  }
}

