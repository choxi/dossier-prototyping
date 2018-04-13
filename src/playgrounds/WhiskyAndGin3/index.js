import React from "react"
import WhiskyAndGinBoard3 from "./WhiskyAndGinBoard3"
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
      <WhiskyAndGinBoard3 { ...this.props } />
    </div>
  }
}
