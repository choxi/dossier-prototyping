export function updateNote(notes, note, attributes) {
  let index = notes.findIndex(n => n.id === note.id)
  let newNote = Object.assign({}, note, attributes)
  let newNotes = notes.set(index, newNote)

  return newNotes
}

export default { updateNote }

