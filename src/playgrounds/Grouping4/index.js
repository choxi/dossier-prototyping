import React from "react"
import Grouping4Board from "./Grouping4Board"
import "./styles.scss"

export default class Grouping4 extends React.Component {
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
      <Grouping4Board showTools={ this.props.showTools } />
    </div>
  }
}
