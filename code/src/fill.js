import sketch from "sketch";
// documentation: https://developer.sketchapp.com/reference/api/

export default function(context) {
  const doc = sketch.getSelectedDocument();

  if (doc.selectedLayers.length == 0) {
    sketch.UI.message(
      `Something went wrong while contacting tinyfac.es. Try again later?`
    );
    return;
  }

  var minQuality = 0;
  if (context.identifier == "fillhigh") {
    minQuality = 6;
  }

  var gender = "";
  if (context.identifier == "fillmale") {
    gender = "male";
  }
  if (context.identifier == "fillfemale") {
    gender = "female";
  }

  getRandomData(gender, minQuality, function(data) {
    fillSelectionWith(data.json());
  });
}

function fillSelectionWith(data) {
  console.log(data);

  if (data.length === 0) {
    sketch.UI.message(
      `Something went wrong getting data from tinyfac.es. Try again later?`
    );
    return;
  }

  var imagesArray = [];
  var namesArray = [];

  return;

  data.forEach(item => {
    var imageURL = item.avatars[2].url;
    imagesArray.push(imageURL);
    var name = item.first_name + " " + item.last_name;
    namesArray.push(name);
  });

  if (hasDifferentSymbols(selection)) {
    UI.alert(
      "You can't have different types of symbols selected when using this.",
      "Make sure you only have one type of symbol and try again."
    );
    return;
  }

  const doc = sketch.getSelectedDocument();
  const selection = doc.selectedLayers;

  var firstSymbolMaster = getFirstSymbolMaster(selection);
  var layerOverride;
  if (firstSymbolMaster) {
    var layer = askForLayerToReplaceInSymbol(firstSymbolMaster, context);
    layerOverride = layer;
  }

  selection.forEach(function(layer) {
    fillLayer(layer, imagesArray, namesArray, context, layerOverride);
  });
}

function askForLayerToReplaceInSymbol(master) {
  let layersInMaster = master.children();
  let filtered = filterLayersToOverrideable(layersInMaster);
  let names = [];
  for (var i = 0; i < filtered.length; i++) {
    let name = filtered[i].name();
    names.push(name);
  }

  var selection = UI.getSelectionFromUser(
    "What layer would you like to fill with random data?",
    names
  );

  var ok = selection[2];
  var value = options[selection[1]];
  if (ok) {
    // do something
  }
}

function getFirstSymbolMaster(layers) {
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].className() == "MSSymbolInstance") {
      let master = layers[i].symbolMaster();
      return master;
    }
  }

  return false;
}

function getRandomData(gender, min_quality, callback) {
  var genderQuery = "";
  if (gender == "male") {
    genderQuery = "&gender=male";
  } else if (gender == "female") {
    genderQuery = "&gender=female";
  }
  var url =
    "https://tinyfac.es/api/users/?min_quality=" + min_quality + genderQuery;

  fetch(url, {
    method: "get"
  })
    .then(function(response) {
      callback(response);
    })
    .catch(function(err) {
      UI.message("⚠️ TinyFaces can't be contacted. Check your internet...");
    });
}

function getFirstAndRemoveFromArray(array) {
  var value = array.splice(0, 1)[0];
  return value;
}

function hasDifferentSymbols(layers) {
  var seenUUIDs = [];
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].className() == "MSSymbolInstance") {
      let uuid = layers[i].symbolMaster().objectID();
      if (seenUUIDs.indexOf(uuid) === -1) {
        seenUUIDs.push(uuid);
      }
    }
  }
  if (seenUUIDs.length > 1) {
    return true;
  }
  return false;
}

function filterLayersToOverrideable(layers) {
  var possible = [];

  layers.forEach(function(layer) {
    if (layer.className() == "MSTextLayer") {
      possible.push(layer);
    } else if (layer.className() == "MSShapeGroup") {
      var fills = layer.style().fills();
      if (fills[0].image()) {
        possible.push(layer);
      }
    }
  });

  return possible;
}

function fillLayer(layer, imagesArray, namesArray, context, layerOverride) {
  if (layer.className() == "MSTextLayer") {
    var name = getFirstAndRemoveFromArray(namesArray);
    layer.stringValue = name;
  } else if (layer.className() == "MSSymbolInstance") {
    if (layerOverride) {
      // update the mutable dictionary

      if (layerOverride.className() == "MSShapeGroup") {
        var imageURLString = getFirstAndRemoveFromArray(imagesArray);
        var imageData = generateImageData(imageURLString);

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
        mutableOverrides.setObject_forKey(imageData, layerOverride.objectID());

        // Change overrides
        layer.overrides = mutableOverrides;
      } else if (layerOverride.className() == "MSTextLayer") {
        var name = getFirstAndRemoveFromArray(namesArray);

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
  } else if (layer.className() == "MSShapeGroup") {
    var imageURLString = getFirstAndRemoveFromArray(imagesArray);
    var fill = layer
      .style()
      .fills()
      .firstObject();
    fill.setFillType(4);
    fill.setImage(generateImageData(imageURLString));
    fill.setPatternFillType(1);
  } else if (layer.className() == "MSLayerGroup") {
    layer.layers().forEach(function(layer) {
      fillLayer(layer, imagesArray, namesArray, context);
    });
  }
}
