import React from "react"
import Zoom from "./components/Zoom"
import Piles from "./components/Piles"
import "./App.css"

export default class App extends React.Component {
  render() {
    return <div className="App">
      <Piles />
    </div>
  }
}
