import React from "react"
import Immutable from "immutable"
import Hammer from "react-hammerjs"
import uuid from "uuid/v4"

import DungeonNavBoard from "./DungeonNavBoard"
import "./styles.scss"

const MAX_ROWS = 5
const MAX_COLS = 5

export default class DungeonNav extends React.Component {
  constructor() {
    super()

    let initialBoard = { id: uuid() }
    let grid = [ 
      [ null, null, null,         null, null ],
      [ null, null, null,         null, null ],
      [ null, null, initialBoard, null, null ],
      [ null, null, null,         null, null ],
      [ null, null, null,         null, null ],
    ]

    this.state = { grid: Immutable.fromJS(grid), currentBoardIndex: [2, 2] }
  }

  getAdjacentBoards(grid, index) {
    let row = index[0]
    let column = index[1]
    let top, bottom, left, right

    // top
    if((row - 1) >= 0)
      top = grid.get(row - 1).get(column)

    // bottom
    if((row + 1) <= (MAX_ROWS - 1))
      bottom = grid.get(row + 1).get(column)

    // left
    if((column - 1) >= 0)
      left = grid.get(row).get(column - 1)

    // right
    if((column + 1) <= (MAX_COLS - 1))
      right = grid.get(row).get(column + 1)

    return { top: top, bottom: bottom, left: left, right: right }
  }

  addBoard(board, direction) {
    console.log("add board")
  }

  render() {
    let index = this.state.currentBoardIndex
    let currentBoard = this.state.grid.get(index[0]).get(index[1])
    let adjacent = this.getAdjacentBoards(this.state.grid, index)
    let adjacentPartials = []

    Object.keys(adjacent).forEach(key => {
      let partial, board = adjacent[key]
      let classNames = `DungeonNav__addBoard DungeonNav__addBoard--${ key }` 

      if(board === null)
        partial = <Hammer key={ key } onTap={ () => this.addBoard(currentBoard, key) }>
          <div className={ classNames }>+</div>
        </Hammer>
      else if(board.id)
        partial = <div className={ classNames }>{ board.id }</div>
      else
        partial = <div className={ classNames }>Edge</div>

      adjacentPartials.push(partial)
    })

    return <div className="DungeonNav">
      { adjacentPartials }
      <DungeonNavBoard showTools={ this.props.showTools } />
    </div>
  }
}
