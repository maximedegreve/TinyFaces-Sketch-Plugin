import API from "./api";
import sketch from "sketch";

// documentation: https://developer.sketchapp.com/reference/api/

export default function(context) {
  const doc = sketch.getSelectedDocument();

  if (doc.selectedLayers.length == 0) {
    sketch.UI.message(`Select at least one layer first...`);
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

  API.random(gender, minQuality)
    .then(response => {
      fillSelectionWith(response);
    })
    .catch(function(err) {
      sketch.UI.message(
        "⚠️ TinyFaces can't be contacted. Check your internet..."
      );
      console.log(err);
    });
}

function fillSelectionWith(data) {
  if (data === undefined) {
    sketch.UI.message(
      `Something went wrong getting data from tinyfac.es. Try again later?`
    );
    return;
  }

  var imagesArray = [];
  var namesArray = [];

  data.forEach(item => {
    var imageURL = item.avatars[2].url;
    imagesArray.push(imageURL);
    var name = item.first_name + " " + item.last_name;
    namesArray.push(name);
  });

  const doc = sketch.getSelectedDocument();
  const selection = doc.selectedLayers;

  if (hasDifferentSymbols(selection)) {
    sketch.UI.alert(
      "You can't have different types of symbols selected when using this.",
      "Make sure you only have one type of symbol and try again."
    );
    return;
  }

  var firstSymbolMaster = getFirstSymbolMaster(selection);
  var layerOverride;
  if (firstSymbolMaster) {
    var layer = askForLayerToReplaceInSymbol(firstSymbolMaster, context);
    layerOverride = layer;
  }

  selection.forEach(function(layer) {
    fillLayer(layer, imagesArray, namesArray, layerOverride);
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

function getFirstSymbolMaster(layers) {
  layers.forEach(layer => {
    if (layer.type == "MSSymbolInstance") {
      let master = layer.symbolMaster();
      return master;
    }
  });

  return false;
}

function getRandomData(gender, min_quality) {
  var genderQuery = "";
  if (gender == "male") {
    genderQuery = "&gender=male";
  } else if (gender == "female") {
    genderQuery = "&gender=female";
  }
  var url =
    "https://tinyfac.es/api/users/?min_quality=" + min_quality + genderQuery;

  return fetch(url, {
    method: "GET"
  })
    .then(response => response.text())
    .then(text => {
      var json = JSON.parse(text);
      return json;
    });
}

function getFirstAndRemoveFromArray(array) {
  var value = array.splice(0, 1)[0];
  return value;
}

function hasDifferentSymbols(layers) {
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

function filterLayersToOverrideable(layers) {
  var possible = [];

  layers.forEach(function(layer) {
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

function fillLayer(layer, imagesArray, namesArray, layerOverride) {
  if (layer.type == "Text") {
    var name = getFirstAndRemoveFromArray(namesArray);
    layer.stringValue = name;
  } else if (layer.type == "SymbolInstance") {
    if (layerOverride) {
      // update the mutable dictionary

      if (layerOverride.type == "ShapePath") {
        var imageURLString = getFirstAndRemoveFromArray(imagesArray);
        var imageData = imageData(imageURLString);

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
      } else if (layerOverride.type == "Text") {
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
  } else if (layer.type == "ShapePath") {
    var imageURLString = getFirstAndRemoveFromArray(imagesArray);
    let fill = layer.sketchObject
      .style()
      .fills()
      .firstObject();
    fill.setFillType(4);
    fill.setImage(imageData(imageURLString));
    fill.setPatternFillType(1);
  } else if (layer.type == "Group") {
    layer.layers().forEach(function(layer) {
      fillLayer(layer, imagesArray, namesArray);
    });
  }

  // Helpers

  function requestWithURL(url) {
    let request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
    return NSURLConnection.sendSynchronousRequest_returningResponse_error(
      request,
      null,
      null
    );
  }

  function imageData(url) {
    let response = requestWithURL(url);
    let nsimage = NSImage.alloc().initWithData(response);
    let imageData = MSImageData.alloc().initWithImage(nsimage);
    return imageData;
  }
}
