import React from "react"
import Board from "./Board"

export default class Zoom extends React.Component {
  render() {
    return <div>
      <h3>Continuous Zoom</h3>
      <Board />
      <h3>Discrete Zoom</h3>
      <Board zoomSnap={ 2 } />
      <h3>Discrete Zoom (Larger Steps)</h3>
      <Board zoomSnap={ 5 } />
    </div>
  }
}

