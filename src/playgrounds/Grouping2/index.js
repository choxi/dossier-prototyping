import React from "react"
import Grouping2Board from "./Grouping2Board"
import "./styles.scss"

export default class Grouping2 extends React.Component {
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
      <Grouping2Board showTools={ this.props.showTools } />
    </div>
  }
}
