import FillCurrentSelection from "../fillCurrentSelection";
import sketch from "sketch";

export default function() {
  const fill = new FillCurrentSelection(undefined, 6);
  fill.fill();
}
