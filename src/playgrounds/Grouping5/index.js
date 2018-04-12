import React from "react"
import Grouping5Board from "./Grouping5Board"
import "./styles.scss"

export default class Grouping5 extends React.Component {
  constructor() {
    super()
    this.touchOverride = function (event) { event.preventDefault() }.bind(this)
  }

  componentWillMount() {
    document.addEventListener("touchmove", this.touchOverride)
  }

  componentWillUnmount() {
    document.removeEventListener("touchmove", this.touchOverride)
  }

  render() {
    return <div className="Grouping">
      <Grouping5Board showTools={ this.props.showTools } />
    </div>
  }
}
