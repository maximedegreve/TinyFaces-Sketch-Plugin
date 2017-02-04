
function onRun(context) {

  var selection = context.selection;
  var doc = context.document;
  var command = context.command;
  var identifier = [command identifier];

  if (selection.length == 0) {
    [doc showMessage:"No layer is selected."];
    return;
  }

  var minQuality = 0
  var gender = ""

  if (identifier == "fillhigh"){
    minQuality = 6
  }

  if (identifier == "fillmale"){
    gender = "&gender=male"
  }

  if (identifier == "fillfemale"){
    gender = "&gender=female"
  }

  var request = [[NSMutableURLRequest alloc] init];
  [request setHTTPMethod:@"GET"];
  var queryString = "https://tinyfac.es/api/users/?min_quality=" + minQuality + gender;
  [request setURL:[NSURL URLWithString:queryString]];

  var error = [[NSError alloc] init];
  var responseCode = null;

  var oResponseData = [NSURLConnection sendSynchronousRequest:request returningResponse:responseCode error:error];

  var dataString = [[NSString alloc] initWithData:oResponseData
  encoding:NSUTF8StringEncoding];

  var pattern = new RegExp("\\\\'", "g");
  var validJSONString = dataString.replace(pattern, "'");

  var data = JSON.parse(validJSONString);

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

  selection.forEach(function(layer){
    fillLayer(layer, imagesArray, namesArray);
  });

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

function fillLayer(layer, imagesArray, namesArray){

  if (layer.className() == "MSTextLayer")){

    var name = getFirstAndRemoveFromArray(namesArray)
    layer.stringValue = names;

  } else if (layer.className() == "MSSymbolInstance"){

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
