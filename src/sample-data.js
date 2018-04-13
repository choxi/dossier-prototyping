import { List } from "immutable"

export default class SampleData {
  static cocktails = {
    decelerationFactor: 0.1,
    sensitivity: 10,
    activeNote: null,
    activeGroup: null,
    notes: List([
      // title cards
      { groupId: null, id: 1, x: 200, y: 10, deltaX: 0, deltaY: 0, text: "Whisky-based" },
      { groupId: null, id: 2, x: 700, y: 10, deltaX: 0, deltaY: 0, text: "Gin-based" },
      // drink images
      { groupId: 1, id: 3, x: 20, y: 60, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/sYmDxKW.jpg" },
      { groupId: null, id: 4, x: 380, y: 480, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/9AXtNyM.jpg" },
      { groupId: 2, id: 5, x: 300, y: 60, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/3F1nPsq.jpg" },
      // recipe images
      { groupId: 1, id: 6, x: 20, y: 220, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/04AqCJC.png" },
      { groupId: 2, id: 7, x: 300, y: 310, deltaX: 0, deltaY: 0, imgSrc: "https://i.imgur.com/CtpZwlp.png" },
      { groupId: null, id: 8, x: 520, y: 590, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/3tFOAGl.png" },
      // notes
      { groupId: 1, id: 9, x: 5, y: 320, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/c0AZd5y.png" },
      { groupId: null, id: 10, x: 700, y: 400, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/0KKetF0.png" },
      { groupId: null, id: 11, x: 70, y: 460, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/8dlhV3K.png" }
    ])
  }

  static chicago = {
    decelerationFactor: 0.1,
    sensitivity: 10,
    activeNote: null,
    activeGroup: null,
    notes: List([
      // title cards
      { groupId: null, id: 1, x: 500, y: 10, deltaX: 0, deltaY: 0, text: "Chicago Summit" },
      { groupId: null, id: 2, x: 650, y: 360, deltaX: 0, deltaY: 0, text: "Culture/fun activities" },
      { groupId: null, id: 3, x: 200, y: 50, deltaX: 0, deltaY: 0, text: "Logistics" },
      // airbnb
      { groupId: null, id: 4, x: 10, y: 90, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/spX2U3H.png" },
      // address
      { groupId: null, id: 5, x: 270, y: 260, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/1Wc0aBY.png" },
      // arrivals
      { groupId: null, id: 6, x: 270, y: 90, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/IOQNXKi.png" },
      // list of activities
      { groupId: null, id: 7, x: 740, y: 410, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/cuTetd1.png" },
      // rookery building
      { groupId: null, id: 8, x: 480, y: 420, deltaX: 0, deltaY: 0, imgSrc: "https://imgur.com/PNLYCzf.png" }
    ])
  }
}
