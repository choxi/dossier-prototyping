import React from "react"
import GroupingBoard from "./GroupingBoard"
import "./styles.scss"

export default class Grouping extends React.Component {
  render() {
    return <div className="Piles">
      <GroupingBoard showTools={ this.props.showTools } />
    </div>
  }
}
