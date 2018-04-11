import React from "react"
import GroupingBoard from "./GroupingBoard"
import "./styles.scss"

export default class Grouping extends React.Component {
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
      <GroupingBoard showTools={ this.props.showTools } />
    </div>
  }
}
