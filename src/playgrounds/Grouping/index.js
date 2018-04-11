import React from "react"
import Board from "./Board"
import "./styles.scss"

export default class Grouping extends React.Component {
  render() {
    return <div className="Piles">
      <Board showTools={ this.props.showTools } />
    </div>
  }
}
