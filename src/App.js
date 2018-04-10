import React from "react"
import { BrowserRouter, Route, Link } from "react-router-dom"

import Zoom from "./playgrounds/Zoom"
import Piles from "./playgrounds/Piles"

import "./App.scss"

export default class App extends React.Component {
  render() {
    return <BrowserRouter>
      <div className="App">
        <div className="App__navigation">
          <ul>
            <li><Link to="/piles">Piles</Link></li>
            <li><Link to="/zoom">Zoom</Link></li>
          </ul>
        </div>

        <div className="App__body">
          <Route path="/piles" component={ Piles } />
          <Route path="/zoom" component={ Zoom } />
        </div>
      </div>
    </BrowserRouter>
  }
}
