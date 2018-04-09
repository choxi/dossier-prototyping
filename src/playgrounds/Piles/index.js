import React from "react"
import Board from "./Board"
import "./styles.scss"

export default class Piles extends React.Component {
  render() {
    return <div className="Piles">
      <Board />
    </div>
  }
}
