import React from "react"
import DungeonNavBoard from "./DungeonNavBoard"
import "./styles.scss"

export default class DungeonNav extends React.Component {
  render() {
    return <div className="DungeonNav">
      <DungeonNavBoard showTools={ this.props.showTools } />
    </div>
  }
}
