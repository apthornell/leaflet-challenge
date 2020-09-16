var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
d3.json(queryUrl, function(data) {

    createFeatures(data.features);
    console.log(data.features)
  });
  
  function createFeatures(earthquakeData) {
  
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
  
    function radiusSize(magnitude) {
      return magnitude * 10000;
    }
  
  
    function circleColor(magnitude) {
      if (magnitude < 1) {
        return "#009c0d"
      }
      else if (magnitude < 2) {
        return "#b4e000"
      }
      else if (magnitude < 3) {
        return "#ffc800"
      }
      else if (magnitude < 4) {
        return "#ff8000"
      }
      else if (magnitude < 5) {
        return "#ff0800"
      }
      else {
        return "#ba047a"
      }
    }
  
  
    var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(earthquakeData, latlng) {
        return L.circle(latlng, {
          radius: radiusSize(earthquakeData.properties.mag),
          color: circleColor(earthquakeData.properties.mag),
          fillOpacity: .7
        });
      },
      onEachFeature: onEachFeature
    });
  
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
  
  
    var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });
  
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });
  
    var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.grayscale",
      accessToken: API_KEY
    });
  
    var faultLine = new L.LayerGroup();
    
    var baseMaps = {
      "Street Map": outdoorsmap,
      "Greyscale Map": grayscalemap,
      "Satellite Map": satellitemap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      FaultLines: faultLine
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        39.8283, -98.5795
      ],
      zoom: 5,
      layers: [outdoorsmap, earthquakes, faultLine]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    // Query to retrieve the faultline data
    var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
    
    // Create the faultlines and add them to the faultline layer
    d3.json(faultlinequery, function(data) {
      L.geoJSON(data, {
        style: function() {
          return {color: "orange", fillOpacity: 0}
        }
      }).addTo(faultLine)
    })
  
    // color function to be used when creating the legend
    function getColor(i) {
      return i < 5 ? '#ff0800' :
             i < 4  ? '#ff8000' :
             i < 3  ? '#ffc800' :
             i < 2  ? '#b4e000' :
             i < 1  ? '#009c0d' :
                      '#ba047a';
    }
  
  // Add legend to the map
  var info = L.control({
    position: "bottomright"
  });

  info.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
      labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
      colors = ['#ba047a', '#009c0d', '#b4e000', '#ffc800', '#ff8000','#ff0800'];

    for (var i = 0; i < labels.length; i++) {
      div.innerHTML += '<i style="background-color:'+colors[i]+'"></i> ' +
              labels[i] + '<br>';
    }
    return div;
  };
  // Add the info legend to the map
  info.addTo(myMap);
}; 