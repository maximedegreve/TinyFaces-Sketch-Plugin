class Helpers {
  static requestWithURL(url) {
    let request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
    return NSURLConnection.sendSynchronousRequest_returningResponse_error(
      request,
      null,
      null
    );
  }

  static imageData(url) {
    let response = Helpers.requestWithURL(url);
    let nsimage = NSImage.alloc().initWithData(response);
    let imageData = MSImageData.alloc().initWithImage(nsimage);
    return imageData;
  }

  static overrideableLayers(layers) {
    return layers.filter(function(layer) {
      if (layer.type == "Text") {
        return true;
      }

      if (layer.type == "ShapePath") {
        return true;
      }

      return false;
    });
  }

  static symbolMasters(layers) {
    var masters = [];

    layers.forEach(layer => {
      if (layer.type !== "SymbolInstance") {
        return;
      }
      const alreadyIncluded = masters
        .map(master => master.symbolId)
        .includes(layer.symbolId);

      if (alreadyIncluded === false) {
        masters.push(layer.master);
      }
    });

    return masters;
  }
}

export default Helpers;
