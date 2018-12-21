import Main from "../main";
import sketch from "sketch";

export default function() {
  const doc = sketch.getSelectedDocument();
  const selection = doc.selectedLayers;

  let main = new Main(undefined, 0);
  main.fill(selection);
}
