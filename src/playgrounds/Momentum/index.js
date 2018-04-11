import React from "react"
import MomentumBoard from "./MomentumBoard"
import "./styles.scss"

export default class Momentum extends React.Component {
  render() {
    return <div className="Momentum">
      <MomentumBoard showTools={ this.props.showTools } />
    </div>
  }
}
