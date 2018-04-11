import React from "react"
import { BrowserRouter, Route, Link } from "react-router-dom"
import Hammer from "react-hammerjs"

import Zoom from "./playgrounds/Zoom"
import Momentum from "./playgrounds/Momentum"
import Grouping from "./playgrounds/Grouping"

import "./App.scss"
import 'font-awesome/css/font-awesome.min.css'

export default class App extends React.Component {
  constructor() {
    super()
    this.state = { showTools: true }
  }

  render() {
    let navigation
    if(this.state.showTools)
      navigation = <div className="App__navigation">
        <ul>
          <li><Link to="/momentum">Momentum</Link></li>
          <li><Link to="/zoom">Zoom</Link></li>
          <li><Link to="/grouping">Grouping</Link></li>
        </ul>
      </div>


    return <BrowserRouter>
      <div className="App">
        { navigation }
        <div className="App__body">
          <Route path="/momentum" render={ () => <Momentum showTools={ this.state.showTools } /> } />
          <Route path="/zoom" component={ Zoom } />
          <Route path="/grouping" component={ Grouping } />

          <Hammer onTap={ () => this.setState({ showTools: !this.state.showTools }) }>
            <div className="App__toolsToggle">
              <i className={ this.state.showTools ? "fa fa-expand" : "fa fa-compress" } />
            </div>
          </Hammer>
        </div>
      </div>
    </BrowserRouter>
  }
}
