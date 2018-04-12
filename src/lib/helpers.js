export function updateNote(notes, note, attributes) {
  let index = notes.findIndex(n => n.id === note.id)
  let newNote = Object.assign({}, note, attributes)
  let newNotes = notes.set(index, newNote)

  return newNotes
}

export function idToHex(id) {
  if(typeof id === "string")
    id = id.toUpperCase()[0]
  else
    id = id.toString()

  let colors = {}

  colors["0"] = "#1abc9c"
  colors["1"] = "#2ecc71"
  colors["2"] = "#3498db"
  colors["3"] = "#9b59b6"
  colors["4"] = "#34495e"
  colors["5"] = "#16a085"
  colors["6"] = "#27ae60"
  colors["7"] = "#2980b9"
  colors["8"] = "#8e44ad"
  colors["9"] = "#2c3e50"
  colors["A"] = "#f1c40f"
  colors["B"] = "#e67e22"
  colors["C"] = "#f39c12"
  colors["D"] = "#d35400"
  colors["E"] = "#c0392b"
  colors["F"] = "#3498db"

  return colors[id]
}

export default { updateNote, idToHex }

