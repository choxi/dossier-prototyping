import React from "react"
import Grouping3Board from "./Grouping3Board"
import "./styles.scss"

export default class Grouping3 extends React.Component {
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
      <Grouping3Board showTools={ this.props.showTools } />
    </div>
  }
}
