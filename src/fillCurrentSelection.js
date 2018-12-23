// documentation: https://developer.sketchapp.com/reference/api/

import API from "./api";
import Helpers from "./helpers";
import sketch from "sketch";

class FillCurrentSelection {
  constructor(gender, minQuality) {
    this.gender = gender;
    this.minQuality = minQuality;

    const document = sketch.getSelectedDocument();
    this.selectedLayers = document.selectedLayers;
    this.symbolMasters = Helpers.symbolMasters(this.selectedLayers);
    this.symbolLayer = undefined;
  }

  fill() {
    // Select at least one layer...
    if (this.selectedLayers.length == 0) {
      sketch.UI.message(`Select at least one layer first...`);
      return;
    }

    // Check if different types of symbols are selected
    if (this.symbolMasters.length > 1) {
      sketch.UI.alert(
        "You can't have different types of symbols selected when using this.",
        "Make sure you only have one type of symbol and try again."
      );
      return;
    }

    // Ask what layer in the symbol you want to replace
    if (this.symbolMasters.length == 1) {
      this.symbolLayer = this.askForLayerToReplace(this.symbolMasters[0]);

      if (this.symbolLayer === false) {
        return;
      }
    }

    // We're good to go...
    API.random(this.gender, this.minQuality)
      .then(json => {
        const arrays = this.namesAndImagesArrays(json);
        this.fillWith(arrays.images, arrays.names);
      })
      .catch(function(err) {
        sketch.UI.message(
          "⚠️ TinyFaces can't be contacted. Check your internet..."
        );
        console.log(err);
      });
  }

  fillWith(images, names) {
    this.selectedLayers.forEach(layer => {
      this.fillLayer(layer, images, names);
    });
  }

  fillLayer(layer, imagesArray, namesArray, layerOverride) {
    if (layer.type == "Text") {
      var name = this.getFirstAndRemoveFromArray(namesArray);
      layer.text = name;
    } else if (layer.type == "SymbolInstance") {
      if (this.symbolLayer) {
        if (layerOverride.type == "ShapePath") {
          var imageURLString = this.getFirstAndRemoveFromArray(imagesArray);
          var imageData = Helpers.imageData(imageURLString);
          layer.setOverrideValue(layerOverride, imageData);
        } else if (layerOverride.type == "Text") {
          var name = this.getFirstAndRemoveFromArray(namesArray);
          layer.setOverrideValue(layerOverride, name);
        }
      }
    } else if (layer.type == "ShapePath") {
      var imageURLString = this.getFirstAndRemoveFromArray(imagesArray);
      let fill = layer.sketchObject
        .style()
        .fills()
        .firstObject();
      fill.setFillType(4);
      fill.setImage(Helpers.imageData(imageURLString));
      fill.setPatternFillType(1);
    } else if (layer.type == "Group") {
      layer.layers().forEach(layer => {
        this.fillLayer(layer, imagesArray, namesArray);
      });
    }
  }

  // UI Actions

  askForLayerToReplace(master) {
    let overrideableLayers = Helpers.overrideableLayers(master.layers);
    const names = overrideableLayers.map(layer => layer.name);

    var selection = sketch.UI.getSelectionFromUser(
      "What layer would you like to fill with random data?",
      names
    );

    var ok = selection[2];
    if (ok) {
      return overrideableLayers[selection[1]];
    }
  }

  // Helpers

  getFirstAndRemoveFromArray(array) {
    var value = array.splice(0, 1)[0];
    return value;
  }

  namesAndImagesArrays(json) {
    var imagesArray = [];
    var namesArray = [];

    json.forEach(item => {
      var imageURL = item.avatars[2].url;
      imagesArray.push(imageURL);
      var name = item.first_name + " " + item.last_name;
      namesArray.push(name);
    });

    return { images: imagesArray, names: namesArray };
  }
}

export default FillCurrentSelection;
