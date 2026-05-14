
mapboxgl.accessToken = "pk.eyJ1IjoiYnJhbnQxIiwiYSI6ImNtbmkydXgyMjA5Y2oycHE1cGh3dXpoNGQifQ.L0mt6vFXI9udGY2BO1XFUA"


// boilerplate map stuff
const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/standard', // Use the standard style for the map
    config: {
        basemap: {
          lightPreset: 'night',
          showPointOfInterestLabels: false,
          showRoadLabels: false,
          show3dTrees: false,
          show3dLandmarks: false,
          showLandmarkIconLabels: false,
          theme: "faded"
        }
  },
    projection: 'globe', // display the map as a globe
    zoom: 10, // initial zoom level, 0 is the world view, higher values zoom in
    minZoom: 8,
    maxBounds: [
    [-74.786, 40.49], 
    [-73.29, 41.02]
],
    center: [-74.04558, 40.70525] // center the map on this longitude and latitude
});

map.addControl(new mapboxgl.NavigationControl());

// add CDs
map.on('style.load', () => {
  map.getCanvas().style.cursor = 'pointer';

  //setting toggle buttons initial state
  document.getElementById('building_btn').checked = true;
  document.getElementById('rs_all_btn').checked = true;


  map.addSource('cds', {
    type: 'geojson',
    data: 'data/cds_with_info_final.geojson'
  });

  //cd fill
  
  map.addLayer({
    id: 'community_districts',
    type: 'fill',
    source: 'cds',
    paint: {
      'fill-opacity': 0,
      'fill-emissive-strength': 1,
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'cd_net_unit_change'],
        -500, "#4e0404",
        -100, "#a01414",
        -10, "#ad3e3e",
        0, "#ffffff",
        1, "#75c348",
        10, "#1e7416",
        100, "#004509",
      ]
    }

  });
  
  //map.setLayoutProperty('community_districts', 'visibility', 'none');

 

  // cd highlights
  map.addLayer({
    id: 'cd-highlight',
    type:'line',
    source:'cds',
    layout:{},
    paint:{
      'line-color': "#ea00ff",
      'line-width': 4,
      'line-opacity': 1,
      'line-emissive-strength': .8,
      
      
    },
    filter: ['==', 'cd', '']
  });

  // adding rs units to map
  map.addSource('rs_units', {
    type: 'geojson',
    data: 'data/rent_stab.geojson'
  });

  map.addLayer({
    id: 'rs_units',
    type: 'circle',
    source: 'rs_units',
    //'visibility': false,

    // set dot color based on RS program
    'paint': {
      'circle-emissive-strength': 2,
      'circle-radius': [
                    'interpolate',
                    ['exponential', 2.72],
                    ['zoom'],
                    8,
                    2,
                    19,
                    120
                ],
    }
  });

  // set dot color based on number of units lost since 2019
  map.setPaintProperty('rs_units', 'circle-color',[
        'interpolate',
        ['linear'],
        ['get', 'rs_change_19_24'],
        -100, "#4e0404",
        -10, "#a01414",
        -1, "#ad3e3e",
        0, "#ffffff",
        1, "#75c348",
        10, "#1e7416",
        100, "#004509",
      ]

  );
})

const color_scale = {
  '-100 or more': "#4e0404",
  '-10': "#a01414",
  '-1': "#ad3e3e",
  '+1': "#75c348",
  '+10': "#1e7416",
  '+100 or more': "#004509",
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

//-------------------------------------rs units---------------------------
// tooltip
const tooltip = document.getElementById('tooltip');

map.on('click', 'rs_units', (e) => {
  const props = e.features[0].properties;
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
//------------------------------------------------CD LOGIC------------------------------------

// clickin' districts
map.on('click', 'community_districts', (e) => {
    
  //pull up cd info box
  const props = e.features[0].properties;
  
  // unpack content for cd box and format numbers
  const cdta_name = props.CDTAName;
  const rs_unit_count = props.rs_unit_count.toLocaleString('en');
  const net_change = props.cd_net_unit_change.toLocaleString('en');
  
  const centroid_lat = props.center_lat;
  const centroid_lon = props.center_lon;

  //set html
  cd_box.innerHTML = `<h3>${cdta_name}</h3>
                      <hr>
                      Total Rent-Stabilized Units: ${rs_unit_count}<br>
                      Net Rent-Stabilized Unit Change Since 2019: ${net_change}<br>
  `
  // highlight it 
  map.setFilter('cd-highlight', ['==', 'cd', props.cd]);
  map.flyTo({
    center: [centroid_lon, centroid_lat],
    zoom: 13,
  });

  

});

// ------------------------- toggle listeners ---------------
// toggle cd fill and turn off rs units
document.getElementById('cd_btn').addEventListener('click', (e) => {
  
  const opacity = e.target.checked ? 0.8 : 0;

  map.setPaintProperty('community_districts', 'fill-opacity', opacity);
  map.setLayoutProperty('rs_units', 'visibility', 'none');
});

// toggle rs building visibility and turn off cd fill
document.getElementById('building_btn').addEventListener('click', (e) => {
  const visibility = e.target.checked ? 'visible' : 'none';

  map.setLayoutProperty('rs_units', 'visibility', visibility);
  map.setPaintProperty('community_districts', 'fill-opacity', 0);
});

// filter to all rs units
document.getElementById('rs_all_btn').addEventListener('click', (e) => {
  if(e.target.checked) {
    map.setFilter('rs_units', true)
  }
});

// filter to just programmatic units
document.getElementById('rs_prog_btn').addEventListener('click', (e) => {
  if(e.target.checked) {
    map.setFilter('rs_units', ['==', 'programmatic_properties', 1])
  }
});

//filter to just non-programmatic units
document.getElementById('rs_non_prog_btn').addEventListener('click', (e) => {
  if(e.target.checked) {
    map.setFilter('rs_units', ['==', 'programmatic_properties', 0])
  }
});

// -----info splash screen modal fucntionality -----------------
// get modal and close button
var modal = document.getElementById("splash-panel");
var span = document.getElementsByClassName("close")[0];

// close modal and overlay on click
span.onclick = function() {
  modal.style.display = "none";
  document.getElementById('splash-overlay').style.display = 'none';
}