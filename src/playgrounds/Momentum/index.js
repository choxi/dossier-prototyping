import React from "react"
import MomentumBoard from "./MomentumBoard"
import "./styles.scss"

export default class Momentum extends React.Component {
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
    return <div className="Momentum">
      <MomentumBoard showTools={ this.props.showTools } />
    </div>
  }
}
