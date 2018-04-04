import React from "react"
import Board from "./components/Board"
import "./App.css"

export default class App extends React.Component {
  render() {
    return <div className="App">
      <Board />
      <Board zoomSnap={ true } />
    </div>
  }
}
