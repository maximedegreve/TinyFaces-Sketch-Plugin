
function onRun(context) {

  var selection = context.selection;
  var doc = context.document;
  var command = context.command;
  var identifier = [command identifier];
  var sketch = context.api()

  if (selection.length == 0) {
    sketch.alert("Woops did you forget to select a layer first?", "First select one or more layers and then try again.")
    return;
  }

  var minQuality = 0
  if (identifier == "fillhigh"){ minQuality = 6 }

  var gender = ""
  if (identifier == "fillmale"){ gender = "female"}
  if (identifier == "fillfemale"){ gender = "male"}

  var data = getRandomData(gender, minQuality)

  if (data.length == 0) {
    var message = "Something went wrong getting data from tinyfac.es. Try again later?";
    [doc showMessage: message];
    return;
  }

  var imagesArray = [];
  var namesArray = [];

  data.forEach(function(item){
    var imageURL = item.avatars[2].url;
    imagesArray.push(imageURL);
    var name = item.first_name + " " + item.last_name;
    namesArray.push(name);
  });

  if(hasDifferentSymbols(selection)){
    sketch.alert("You can't have different types of symbols selected when using this.", "Make sure you only have one type of symbol and try again.")
    return
  }

  selection.forEach(function(layer){
    fillLayer(layer, imagesArray, namesArray);
  });

}

function getRandomData(gender, min_quality){

  var genderQuery = ""
  if (gender == "male"){
    genderQuery = "&gender=male"
  } else if (gender == "female"){
    genderQuery = "&gender=female"
  }

  var request = [[NSMutableURLRequest alloc] init];
  [request setHTTPMethod:@"GET"];
  var queryString = "https://tinyfac.es/api/users/?min_quality=" + min_quality + genderQuery;
  [request setURL:[NSURL URLWithString:queryString]];

  var error = [[NSError alloc] init];
  var responseCode = null;

  var oResponseData = [NSURLConnection sendSynchronousRequest:request returningResponse:responseCode error:error];

  var dataString = [[NSString alloc] initWithData:oResponseData
  encoding:NSUTF8StringEncoding];

  var pattern = new RegExp("\\\\'", "g");
  var validJSONString = dataString.replace(pattern, "'");

  var data = JSON.parse(validJSONString);

  return data;
}

function generateImageData(url){
  var url = [[NSURL alloc] initWithString: url];
  var newImage = [[NSImage alloc] initByReferencingURL:url];
  return MSImageData.alloc().initWithImage_convertColorSpace(newImage, false)
}

function getFirstAndRemoveFromArray(array){
  var value = array.splice(0,1)[0];
  return value
}

function hasDifferentSymbols(layers){
  var seenUUIDs = [];
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].className() == "MSSymbolInstance"){
      let uuid = layers[i].symbolMaster().objectID()
      if (seenUUIDs.indexOf(uuid) === -1) {
          seenUUIDs.push(uuid)
      }
    }
  }
  if (seenUUIDs.length > 1){
    return true
  }
  return false
}

function filterLayersToOverrideable(layers){

  var possible = [];

  layers.forEach(function(layer){
    if (layer.className() == "MSTextLayer" || layer.className() == "MSShapeGroup"){
      possible.push(layer);
    }
  });

  return possible;

}

function fillLayer(layer, imagesArray, namesArray){

  if (layer.className() == "MSTextLayer"){

    var name = getFirstAndRemoveFromArray(namesArray)
    layer.stringValue = names;

  } else if (layer.className() == "MSSymbolInstance"){

    let layersInMaster = layer.symbolMaster().layers()
    let filtered = filterLayersToOverrideable(layersInMaster)

    var inputs = ["Turn on", "Turn off"];

    var gotInput = sketch.getSelectionFromUser("Turn something on?", inputs, 0);
    var chosenIndex = gotInput[1]

//  e.addOverrides_forCellAtIndex_ancestorIDs(t, 0, n), s += 1


    //let layersInSymbol = layer.symbolMaster().layers()
    //log("count")
    //log(layersInSymbol.length);
    /*
    for (var i=0; i <= layersInSymbol.length; i++) {

      if (layer.className() == "MSShapeGroup")){



      } else if (layer.className() == "MSShapeGroup")){

        // turn the overrides mutable
        //var mutableOverrides = NSMutableDictionary.dictionaryWithDictionary(existingOverrides);

        // get the first one
        //var firstOverride = NSMutableDictionary.dictionaryWithDictionary(existingOverrides.objectForKey(0));

        // set the first override to the imageData
        //var overrideId = [firstOverride allKeys][0];
        //firstOverride.setObject_forKey(imageData,overrideId)

      }

    }
    */

  } else if (layer.className() == "MSShapeGroup")){

      var imageURLString = getFirstAndRemoveFromArray(imagesArray)
      var fill = layer.style().fills().firstObject();
      fill.setFillType(4);
      fill.setImage(generateImageData(imageURLString));
      fill.setPatternFillType(1);

  } else if (layer.className() == "MSLayerGroup")){

    layer.layers().forEach(function(layer){
      fillLayer(layer, imagesArray, namesArray)
    });

  }

}
