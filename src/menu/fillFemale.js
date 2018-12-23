import FillCurrentSelection from "../fillCurrentSelection";
import sketch from "sketch";

export default function() {
  const fill = new FillCurrentSelection("female", 0);
  fill.fill();
}
