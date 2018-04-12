import React from "react"
import { BrowserRouter, Route, Link } from "react-router-dom"
import Hammer from "react-hammerjs"

import Zoom from "./playgrounds/Zoom"
import Momentum from "./playgrounds/Momentum"
import Grouping from "./playgrounds/Grouping"
import Grouping2 from "./playgrounds/Grouping2"
import Grouping3 from "./playgrounds/Grouping3"
import Grouping4 from "./playgrounds/Grouping4"
import Grouping5 from "./playgrounds/Grouping5"
import WhiskyAndGin from "./playgrounds/WhiskyAndGin"
import WhiskyAndGin2 from "./playgrounds/WhiskyAndGin2"
import WhiskyAndGin3 from "./playgrounds/WhiskyAndGin3"

import "./App.scss"
import 'font-awesome/css/font-awesome.min.css'

export default class App extends React.Component {
  constructor() {
    super()
    this.state = { showTools: false }
  }

  render() {
    let navigation
    if(this.state.showTools)
      navigation = <div className="App__navigation">
        <ul>
          <div style={{ display: "none" }}>
            <li><Link to="/momentum">Momentum</Link></li>
            <li><Link to="/zoom">Zoom</Link></li>
            <li><Link to="/grouping">Group with DTap</Link></li>
            <li><Link to="/grouping2">Group with MultiSelect</Link></li>
            <li><Link to="/grouping3">Remember Groups</Link></li>
            <li><Link to="/grouping4">Remember Groups (DTap)</Link></li>
            <li><Link to="/grouping5">Remember Groups (Long Press)</Link></li>
          </div>

          <li><Link to="/whiskyandgin">Whisky and Gin - A</Link></li>
          <li><Link to="/whiskyandgin-proximity">Whisky and Gin - B</Link></li>
          <li><Link to="/whiskyandgin-press">Whisky and Gin - C</Link></li>
        </ul>
      </div>


    return <BrowserRouter>
      <div className="App">
        { navigation }
        <div className="App__body">
          <Route path="/momentum" render={ () => <Momentum showTools={ this.state.showTools } /> } />
          <Route path="/zoom" component={ Zoom } />
          <Route path="/grouping" component={ Grouping } />
          <Route path="/grouping2" component={ Grouping2 } />
          <Route path="/grouping3" component={ Grouping3 } />
          <Route path="/grouping4" component={ Grouping4 } />
          <Route path="/grouping5" component={ Grouping5 } />
          <Route path="/whiskyandgin" component={ WhiskyAndGin } />
          <Route path="/whiskyandgin-proximity" render={ () => <WhiskyAndGin2 showTools={ this.state.showTools }/> } />
          <Route path="/whiskyandgin-press" render={ () => <WhiskyAndGin3 showTools={ this.state.showTools }/> } />

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
