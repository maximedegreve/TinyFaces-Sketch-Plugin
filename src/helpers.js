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

  static symbolMasters(layers) {
    var masters = [];

    layers.forEach(layer => {
      if (layer.type == "SymbolInstance") {
        const master = layer.master;
        if (masters.indexOf(master) === -1) {
          masters.push(master);
        }
      }
    });

    return masters;
  }
}

export default Helpers;
