import React from "react"
import Board from "./components/Board"
import "./App.css"

export default class App extends React.Component {
  render() {
    return <div className="App">
      <h3>Continuous Zoom</h3>
      <Board />
      <h3>Discrete Zoom</h3>
      <Board zoomSnap={ true } />
    </div>
  }
}
