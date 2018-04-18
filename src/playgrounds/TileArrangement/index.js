import React from "react"
import TileArrangementBoard from "./TileArrangementBoard"
import "./styles.scss"

export default class TileArrangement extends React.Component {
  render() {
    return <div className="TileArrangement">
      <TileArrangementBoard showTools={ this.props.showTools } />
    </div>
  }
}
