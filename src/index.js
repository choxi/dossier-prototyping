import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import TouchEmulator from "hammer-touchemulator"

TouchEmulator()

ReactDOM.render(<App />, document.getElementById("App"))

// Hot Module Replacement
if (module.hot)
  module.hot.accept()

