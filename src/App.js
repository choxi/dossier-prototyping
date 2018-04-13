import React from "react"
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom"
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

    this.state = { 
      sampleData: "cocktails",
      showTools: false 
    }
  }

  linkClass(path) {
  }

  render() {
    let navigation
    let sampleData = this.state.sampleData
    let linkClass = "App__navigation__link"

    if(this.state.showTools)
      navigation = <div className="App__navigation">
        <ul>
          <div style={{ display: "none" }}>
            <li><Link activeClassName="App__navigation__link--active" to="/momentum">Momentum</Link></li>
            <li><Link activeClassName="App__navigation__link--active" to="/zoom">Zoom</Link></li>
            <li><Link activeClassName="App__navigation__link--active" to="/grouping">Group with DTap</Link></li>
            <li><Link activeClassName="App__navigation__link--active" to="/grouping2">Group with MultiSelect</Link></li>
            <li><Link activeClassName="App__navigation__link--active" to="/grouping3">Remember Groups</Link></li>
            <li><Link activeClassName="App__navigation__link--active" to="/grouping4">Remember Groups (DTap)</Link></li>
            <li><Link activeClassName="App__navigation__link--active" to="/grouping5">Remember Groups (Long Press)</Link></li>
          </div>

          <h3>Clusters</h3>

          <li><NavLink className={ linkClass } activeClassName="App__navigation__link--active" to="/whiskyandgin">
            <p>(A) explicit control</p>
            <p className="App__navigation__caption">double-tap to add/remove from cluster</p>
          </NavLink></li>
          <li><NavLink className={ linkClass } activeClassName="App__navigation__link--active" to="/whiskyandgin-proximity">
            <p>(B) proximity-based</p>
            <p className="App__navigation__caption">long press to detach an item</p>
          </NavLink></li>
          <li><NavLink className={ linkClass } activeClassName="App__navigation__link--active" to="/whiskyandgin-press">
            <p>(C) cluster coloring</p>
            <p className="App__navigation__caption">double-tap to add/remove from cluster</p>
          </NavLink></li>

          <h3>Sample Data</h3>
          <li>
            <a className={ sampleData === "cocktails" ? "App__navigation__link--active" : linkClass } onClick={ () => this.setState({ sampleData: "cocktails" }) }>Cocktails</a>
          </li>
          <li>
            <a className={ sampleData === "chicago" ? "App__navigation__link--active" : linkClass } onClick={ () => this.setState({ sampleData: "chicago" }) }>Chicago Team Summit</a>
          </li>
        </ul>
      </div>

   let globalOptions = {
     showTools: this.state.showTools,
     sampleData: this.state.sampleData
   }

    return <BrowserRouter>
      <div className="App">
        { navigation }
        <div className="App__body">
          <Route path="/momentum" render={ () => <Momentum { ...globalOptions }/> } />
          <Route path="/zoom" component={ Zoom } />
          <Route path="/grouping" component={ Grouping } />
          <Route path="/grouping2" component={ Grouping2 } />
          <Route path="/grouping3" component={ Grouping3 } />
          <Route path="/grouping4" component={ Grouping4 } />
          <Route path="/grouping5" component={ Grouping5 } />
          <Route path="/whiskyandgin" render={ () => <WhiskyAndGin { ...globalOptions } /> } />
          <Route path="/whiskyandgin-proximity" render={ () => <WhiskyAndGin2 { ...globalOptions } /> } />
          <Route path="/whiskyandgin-press" render={ () => <WhiskyAndGin3 { ...globalOptions } /> } />

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
