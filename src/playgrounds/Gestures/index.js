import React from "react"
import GesturesBoard from "./GesturesBoard"
import "./styles.scss"

export default class Gestures extends React.Component {
  render() {
    return <div className="Gestures">
      <GesturesBoard showTools={ this.props.showTools } sampleData={ this.props.sampleData }/>
    </div>
  }
}
