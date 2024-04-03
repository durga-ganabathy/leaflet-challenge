let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(queryUrl).then(function(data) {
    console.log("data:",data)
    // console.log(data.features.length)
    console.log("data features:",data.features)
    generateFeatures(data.features)
});

 // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.

function generateFeatures(earthquakeData){
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr>
                    <p>${"Magnitude "+feature.properties.mag}<hr> <p>${"Depth of earthquake "+feature.geometry.coordinates[2]}`);
                   
  }

// Assigning colors for each condition based on Depth of the earthquake 
function generateColor(depth){
    if (depth >= 90) return "red";
    else if (depth >= 70  && depth <= 90) return "orange";
    else if (depth >= 50  && depth <= 70) return "gold";
    else if (depth >= 30  && depth <= 50) return "yellow";
    else if (depth >= 10  && depth <= 30) return "greenyellow";
    else if (depth >= -10  && depth <= 10) return "lime";

}

// To create datamarkers whose size reflect the magnitude of earthquake and color reflect the depth of earthquake
function generateCircleMarker(feature,magnitudeSize){
    let stylingOptions= {
    radius: Math.sqrt(Math.abs(feature.properties.mag)) * 5,
    fillColor: generateColor(feature.geometry.coordinates[2]),
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
 }
 return L.circleMarker(magnitudeSize,stylingOptions);
}


  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: generateCircleMarker
  });
generateMap(earthquakes)
}

function generateMap(earthquakes) {

    // Create the base layers.
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topomap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": streetmap,
      "Topographic Map": topomap
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });
  
    // To create a layer control and pass baseMaps,overlayMaps. Finally add it to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  
  // Set up the legend.
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let depth = [">-10 & <10",">10 & <30","<30 & >50","<50 & >70","<70 & >90",">90"]
    let colors = ["lime", "greenyellow", "yellow", "gold", "orange", "red"];
    let labels = [];

    // Add the minimum and maximum values.
    let legendInfo = "<h1>Depth of earthquake</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + "Minimum value is: " + depth[0] + "</div>" +
        "<div class=\"max\">" +"Maximum value is: " + depth[depth.length - 1] + "</div>" +
      "</div>";


    div.innerHTML = legendInfo;

    // Adding color and earthquake depth value labels
    depth.forEach(function(depth, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\">" + depth+ "</li>");
          });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
 };
 // Adding the legend to the map
legend.addTo(myMap);
}

