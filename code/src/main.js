// documentation: https://developer.sketchapp.com/reference/api/

import API from "./api";
import Helpers from "./helpers";
import sketch from "sketch";

class Main {
  constructer(gender, minQuality) {
    this.gender = gender;
    this.minQuality = minQuality;
  }

  fill(selectedLayers) {
    const doc = sketch.getSelectedDocument();

    if (selectedLayers.length == 0) {
      sketch.UI.message(`Select at least one layer first...`);
      return;
    }

    API.random(this.gender, this.minQuality)
      .then(json => {
        this.fillSelectionWith(json);
      })
      .catch(function(err) {
        sketch.UI.message(
          "⚠️ TinyFaces can't be contacted. Check your internet..."
        );
        console.log(err);
      });
  }

  fillSelectionWith(json) {
    if (json === undefined) {
      sketch.UI.message(
        `Something went wrong getting data from tinyfac.es. Try again later?`
      );
      return;
    }

    var imagesArray = [];
    var namesArray = [];

    json.forEach(item => {
      var imageURL = item.avatars[2].url;
      imagesArray.push(imageURL);
      var name = item.first_name + " " + item.last_name;
      namesArray.push(name);
    });

    const doc = sketch.getSelectedDocument();
    const selection = doc.selectedLayers;

    if (this.hasDifferentSymbols(selection)) {
      sketch.UI.alert(
        "You can't have different types of symbols selected when using this.",
        "Make sure you only have one type of symbol and try again."
      );
      return;
    }

    var firstSymbolMaster = this.getFirstSymbolMaster(selection);
    var layerOverride;
    if (firstSymbolMaster) {
      var layer = this.askForLayerToReplaceInSymbol(firstSymbolMaster, context);
      layerOverride = layer;
    }

    selection.forEach(layer => {
      this.fillLayer(layer, imagesArray, namesArray, layerOverride);
    });
  }

  askForLayerToReplaceInSymbol(master) {
    let layersInMaster = master.children();
    let filtered = filterLayersToOverrideable(layersInMaster);
    let names = [];
    for (var i = 0; i < filtered.length; i++) {
      let name = filtered[i].name();
      names.push(name);
    }

    var selection = sketch.UI.getSelectionFromUser(
      "What layer would you like to fill with random data?",
      names
    );

    var ok = selection[2];
    var value = options[selection[1]];
    if (ok) {
      // do something
    }
  }

  getFirstSymbolMaster(layers) {
    layers.forEach(layer => {
      if (layer.type == "SymbolInstance") {
        let master = layer.symbolMaster();
        return master;
      }
    });

    return false;
  }

  getFirstAndRemoveFromArray(array) {
    var value = array.splice(0, 1)[0];
    return value;
  }

  hasDifferentSymbols(layers) {
    var seenUUIDs = [];

    layers.forEach(layer => {
      if (layer.type == "SymbolInstance") {
        let uuid = layer.symbolMaster().objectID();
        if (seenUUIDs.indexOf(uuid) === -1) {
          seenUUIDs.push(uuid);
        }
      }
    });

    if (seenUUIDs.length > 1) {
      return true;
    }
    return false;
  }

  filterLayersToOverrideable(layers) {
    var possible = [];

    layers.forEach(layer => {
      if (layer.type == "Text") {
        possible.push(layer);
      } else if (layer.type == "ShapePath") {
        var fills = layer.style().fills();
        if (fills[0].image()) {
          possible.push(layer);
        }
      }
    });

    return possible;
  }

  fillLayer(layer, imagesArray, namesArray, layerOverride) {
    if (layer.type == "Text") {
      var name = this.getFirstAndRemoveFromArray(namesArray);
      layer.stringValue = name;
    } else if (layer.type == "SymbolInstance") {
      if (layerOverride) {
        // update the mutable dictionary

        if (layerOverride.type == "ShapePath") {
          var imageURLString = this.getFirstAndRemoveFromArray(imagesArray);
          var imageData = Helpers.imageData(imageURLString);

          // Get existing overrides or make one if none exists
          var newOverrides = layer.overrides();
          if (newOverrides == null) {
            newOverrides = {};
          }

          // Create mutable copy
          var mutableOverrides = NSMutableDictionary.dictionaryWithDictionary(
            newOverrides
          );
          mutableOverrides.setObject_forKey(
            NSMutableDictionary.dictionaryWithDictionary(
              newOverrides.objectForKey(0)
            ),
            0
          );

          // Change item in the overrides
          mutableOverrides.setObject_forKey(
            imageData,
            layerOverride.objectID()
          );

          // Change overrides
          layer.overrides = mutableOverrides;
        } else if (layerOverride.type == "Text") {
          var name = this.getFirstAndRemoveFromArray(namesArray);

          // Get existing overrides or make one if none exists
          var newOverrides = layer.overrides();
          if (newOverrides == null) {
            newOverrides = {};
          }

          // Create mutable copy
          var mutableOverrides = NSMutableDictionary.dictionaryWithDictionary(
            newOverrides
          );
          mutableOverrides.setObject_forKey(
            NSMutableDictionary.dictionaryWithDictionary(
              newOverrides.objectForKey(0)
            ),
            0
          );

          // Change item in the overrides
          mutableOverrides.setObject_forKey(name, layerOverride.objectID());

          // Change overrides
          layer.overrides = mutableOverrides;
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
}

export default Main;
