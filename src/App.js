import React from "react"
import Zoom from "./playgrounds/Zoom"
import Piles from "./playgrounds/Piles"
import "./App.css"

export default class App extends React.Component {
  render() {
    return <div className="App">
      <Piles />
    </div>
  }
}
