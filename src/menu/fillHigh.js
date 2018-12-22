import Main from "../main";
import sketch from "sketch";

export default function() {
  const doc = sketch.getSelectedDocument();
  const selection = doc.selectedLayers;

  const main = new Main(selection, undefined, 6);
  main.fill();
}
