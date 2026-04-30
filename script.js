
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
  map.getCanvas().style.cursor = 'pointer';
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
      
      'fill-opacity': 0,
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
  });

  // adding rs units to map
  map.addSource('rs_units', {
    'type': 'geojson',
    'data': 'data/rent_stab.geojson'
  });

  map.addLayer({
    'id': 'rs_units',
    'type': 'circle',
    'source': 'rs_units',
    //'visibility': false,

    // set dot color based on RS program
    //'paint': {
      /*
      'circle-color': [
        'match',
        ['get', 'rs_bucket'],
        "Legacy (Pre-1974)", "#5C0f00",
        "Programatic Rent Stabilization", "#c92200",
        "Government-Subsidized", "#f66d04",
        "Mixed Income Rent-Stabilized", "#f0654a",
        "Other Rent Stabilization", "#b06c2c",
        "#000000"
      ] //TODO: Color by bucket/j51/421a
      
       */
    //}

    // set dot color based on number of units lost since 2019
  });

  map.setPaintProperty('rs_units', 'circle-color',[
        'interpolate',
        ['linear'],
        ['get', 'rs_change_19_24'],
        -750, "#5c0f00",
        -500, "#b9361c",
        -50, "#ea4c2d",
        -0.5, "#ffd3d0",
        0, "white",
        0.5, "#c1efbf",
        10, "#64c73a",
        50, "#16a320",
        100, "#005c00",
      ]

  );
})

const color_scale = {
  '-750': "#5c0f00",
  '-500': "#b9361c",
  '-50': "#ea4c2d",
  '-1': "#ffd3d0",
  '0': "white",
  '+1': "#c1efbf",
  '+10': "#64c73a",
  '+50': "#16a320",
  '+100': "#005c00",
}

// add legend
const legend = document.createElement('div');
legend.className = 'legend';
legend.innerHTML = `<h4>Change in Rent-Stabilized <br>Units Since 2019</h4>`;

Object.entries(color_scale).forEach(([rs_change, color]) => {
  const color_step = document.createElement('div');

  color_step.className = 'legend-item';
  color_step.innerHTML = `
        <span class="legend-circle" style="background-color: ${color}"></span>
        <span class="legend-label">${rs_change}</span>
    `;
    legend.appendChild(color_step);
});

document.body.appendChild(legend);


// interactivity zone

// tooltip
const tooltip = document.getElementById('tooltip');

map.on('click', 'rs_units', (e) => {
  const props = e.features[0].properties;
  console.log(props);
  console.log(props.rs_change_19_24);
});

// bring up address/bbl and unit change in tooltip
map.on('mousemove', 'rs_units', (e) => {
  const props = e.features[0].properties;
  const unit_change = props.rs_change_19_24;
  tooltip.style.left = e.point.x + 15 + 'px';
  tooltip.style.top = e.point.y + 15 + 'px';
  
  if(unit_change < 0) {
    tooltip.innerHTML = `${props.address}<h2>${unit_change} RS Units</h2>`;
  }
  else {
    tooltip.innerHTML = `${props.address}<h2>+${unit_change} RS Units</h2>`;
  }

});

map.on('mouseenter', 'rs_units', (e) => {
  tooltip.style.display = 'block';
  
});

map.on('mouseleave', 'rs_units', (e) => {
  tooltip.style.display = 'none';
  
});

const cd_box = document.getElementById('cd_box');


// clickin' districts
map.on('click', 'community_districts', (e) => {
  const boro_cd = e.features[0].properties.BoroCD;
  const cdta_name = e.features[0].properties.CDTAName;
  console.log(e.features[0].properties);
});

