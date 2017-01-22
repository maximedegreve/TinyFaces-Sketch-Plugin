
function onRun(context) {

  var selection = context.selection;
  var doc = context.document;
  var command = context.command;
  var identifier = [command identifier];

 if (selection.length > 0) {

NSLog("identifier : " + identifier)

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
   NSLog(queryString)
   [request setURL:[NSURL URLWithString:queryString]];

   var error = [[NSError alloc] init];
   var responseCode = null;

   var oResponseData = [NSURLConnection sendSynchronousRequest:request returningResponse:responseCode error:error];

   var dataString = [[NSString alloc] initWithData:oResponseData
   encoding:NSUTF8StringEncoding];

   var pattern = new RegExp("\\\\'", "g");
   var validJSONString = dataString.replace(pattern, "'");

   var data = JSON.parse(validJSONString);

   if (data.length > 0) {
     for (var i=0; i <= selection.length; i++) {

      var layer = [selection objectAtIndex:i];

      if (layer.className() == "MSTextLayer")){

              layer.stringValue = data[i].first_name + " " + data[i].last_name;

      } else if (layer.className() == "MSShapeGroup")){

              var imageURLString = data[i].avatars[2].url;
               var url = [[NSURL alloc] initWithString: imageURLString];

               var newImage = [[NSImage alloc] initByReferencingURL:url];

               var fill = layer.style().fills().firstObject();
               fill.setFillType(4);
               fill.setImage(MSImageData.alloc().initWithImage_convertColorSpace(newImage, false));
               fill.setPatternFillType(1);
      }



     }
   } else {
     var message = "No images found tagged with: " + tag;
     [doc showMessage: message];
   }
 } else {
   [doc showMessage:"No layer is selected."];
 }

}
