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
}

export default Helpers;
