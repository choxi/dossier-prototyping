import React from "react"
import { BrowserRouter, Route, Link } from "react-router-dom"
import Hammer from "react-hammerjs"

import Zoom from "./playgrounds/Zoom"
import Momentum from "./playgrounds/Momentum"
import Grouping from "./playgrounds/Grouping"
import Grouping2 from "./playgrounds/Grouping2"
import Grouping3 from "./playgrounds/Grouping3"

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
          <li><Link to="/grouping">Group with DTap</Link></li>
          <li><Link to="/grouping2">Group with MultiSelect</Link></li>
          <li><Link to="/grouping3">Remember Groups</Link></li>
        </ul>
      </div>


    return <BrowserRouter>
      <div className="App">
        { navigation }
        <div className="App__body">
          <Route path="/momentum" render={ () => <Momentum showTools={ this.state.showTools } /> } />
          <Route path="/zoom" component={ Zoom } />
          <Route path="/grouping" component={ Grouping } />
          <Route path="/grouping3" component={ Grouping3 } />

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
