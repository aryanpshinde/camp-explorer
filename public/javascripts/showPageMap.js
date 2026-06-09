// Initialize map with Outdoor style and encapsulated API key
const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.OUTDOOR,
  apiKey: maptilerApiKey,
  center: coordinates,
  zoom: 10,
});

// Add a custom green marker that matches your Bootstrap theme
new maptilersdk.Marker({ color: "#198754", scale: 1.2 })
  .setLngLat(coordinates)
  .setPopup(
    new maptilersdk.Popup({
      offset: 25,
      className: "campground-popup",
    }).setHTML(
      `<div class="p-2">
         <h5 class="mb-1 fw-bold">${title}</h5>
         <small class="text-muted">Campground Location</small>
       </div>`,
    ),
  )
  .addTo(map);
