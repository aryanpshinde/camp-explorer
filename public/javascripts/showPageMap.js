// 1. Set the API key
maptilersdk.config.apiKey = maptilerApiKey;

// 2. Initialize the map using the new 'coordinates' variable
const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.BRIGHT,
  center: coordinates,
  zoom: 10,
});

// 3. Add the marker using the new variables
new maptilersdk.Marker()
  .setLngLat(coordinates)
  .setPopup(new maptilersdk.Popup({ offset: 25 }).setHTML(`<h3>${title}</h3>`))
  .addTo(map);
