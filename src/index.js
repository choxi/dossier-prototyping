import React from "react"
import ReactDOM from "react-dom"
import App from "./App"
import TouchEmulator from "hammer-touchemulator"

document.addEventListener("touchmove", function(event){ event.preventDefault(); });

TouchEmulator()

ReactDOM.render(<App />, document.getElementById("App"))

// Hot Module Replacement
if (module.hot)
  module.hot.accept()

