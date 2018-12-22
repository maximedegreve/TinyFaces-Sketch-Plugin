import Main from "../main";
import sketch from "sketch";

export default function() {
  const doc = sketch.getSelectedDocument();
  const selection = doc.selectedLayers;

  let main = new Main(selection, undefined, 0);
  main.fill();
}
