import React from "react"
import WhiskyAndGinBoard from "./WhiskyAndGinBoard"
import "./styles.scss"

export default class WhiskyAndGin extends React.Component {
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
      <WhiskyAndGinBoard showTools={ this.props.showTools } />
    </div>
  }
}
