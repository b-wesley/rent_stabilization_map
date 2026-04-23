mapboxgl.accessToken = "pk.eyJ1IjoiYnJhbnQxIiwiYSI6ImNtbmkydXgyMjA5Y2oycHE1cGh3dXpoNGQifQ.L0mt6vFXI9udGY2BO1XFUA"


// boilerplate map stuff


const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/standard', // Use the standard style for the map
    config: {
        basemap: {
        lightPreset: 'day',
        showPointOfInterestLabels: false,
        showRoadLabels: false,
        show3dTrees: false,
        show3dLandmarks: false,
        showLandmarkIconLabels: false,
        theme: "faded"
        }
  },
    projection: 'globe', // display the map as a globe
    zoom: 12, // initial zoom level, 0 is the world view, higher values zoom in
    center: [-73.98839, 40.73639] // center the map on this longitude and latitude
});

map.addControl(new mapboxgl.NavigationControl());

// add CDs
map.on('style.load', () => {

  map.addSource('cds', {
    'type': 'geojson',
    'data': 'data/nycd.geojson'
  });

  //cd fill
  map.addLayer({
    'id': 'community_districts',
    'type': 'fill',
    'source': 'cds',
    'paint': {
      //"fill-color": ["step",["get","rs_unit_count"],"#ffeda0",10,"#ffeda0",20,"#fed976",50,"#feb24c",100,"#fd8d3c",200,"#fc4e2a",500,"#e31a1c",750,"hsl(348, 100%, 37%)",1000,"#bd0026"]
      'fill-color': "#a987dc",
      'fill-opacity': 0.1,
      'fill-outline-color': 'black'

    }
  });

  map.addLayer({
    'id': 'cd_outlines',
    'type': 'line',
    'source': 'cds',
    'paint': {
      'line-color': "#000000",
      'line-opacity': 1

    }
  })
})


// adding the rent stab data
/*
const Papa = require("papaparse");
const rent_stab_data = File("/data/rent_stab_waterfall.csv")
const_rent_stab_json = Papa.parse(rent_stab_data)
*/

