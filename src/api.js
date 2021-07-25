class API {
  static random(gender, min_quality) {
    const apiURL = "https://tinyfac.es/api/data/";
    var query = "?quality=" + min_quality;

    if (gender) {
      query = query + "&gender=" + gender;
    }

    return fetch(apiURL + query, {
      method: "GET"
    })
      .then(response => response.text())
      .then(text => {
        var json = JSON.parse(text);
        return json;
      });
  }
}

export default API;
