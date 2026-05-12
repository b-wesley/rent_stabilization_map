
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
    center: [-74.04558, 40.70525] // center the map on this longitude and latitude
});

map.addControl(new mapboxgl.NavigationControl());

// add CDs
map.on('style.load', () => {
  map.getCanvas().style.cursor = 'pointer';

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
      'fill-emissive-strength': 0.6,
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'cd_net_unit_change'],
        -750, "#d01c8b",
        -100, "#e9a3c9",
        -50, "#f1b6da",
        -0.5, "#fde0ef",
        0, "white",
        0.5, "#e6f5d0",
        10, "#b8e186",
        50, "#7fbc41",
        100, "#4d9221",
      ]
    }

  });
  
  //map.setLayoutProperty('community_districts', 'visibility', 'none');

  map.addLayer({
    id: 'cd_outlines',
    type: 'line',
    source: 'cds',
    paint: {
      'line-color': "#000000",
      'line-opacity': 0
    }
  });

  // cd highlights
  map.addLayer({
    id: 'cd-highlight',
    type:'line',
    source:'cds',
    layout:{},
    paint:{
      'line-color': "#ea00ff",
      'line-width': 5,
      'line-opacity': 1,
      'line-emissive-strength': .7,
      'line-gap-width': 1
      
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
      'circle-emissive-strength': 1,
      'circle-radius': [
                    'interpolate',
                    ['exponential', 2.72],
                    ['zoom'],
                    12,
                    2,
                    22,
                    180
                ],
    }

    // set dot color based on number of units lost since 2019
  });

  map.setPaintProperty('rs_units', 'circle-color',[
        'interpolate',
        ['linear'],
        ['get', 'rs_change_19_24'],
        -750, "#d01c8b",
        -100, "#e9a3c9",
        -1, "#f1b6da",
        0, "#ffffff",
        1, "#b8e186",
        50, "#7fbc41",
        100, "#4d9221",
      ]

  );
})

const color_scale = {
  '-750': "#d01c8b",
  '-100': "#e9a3c9",
  '-1': "#f1b6da",
  '0': "white",
  '+1': "#b8e186",
  '+50': "#7fbc41",
  '+100': "#4d9221",
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
//------------------------------------------------CD LOGIC------------------------------------

// clickin' districts
map.on('click', 'community_districts', (e) => {
    
  //pull up cd info box
  const props = e.features[0].properties;
  
  const cdta_name = props.CDTAName;
  const rs_unit_count = props.rs_unit_count.toLocaleString('en');
  const net_change = props.cd_net_unit_change.toLocaleString('en');
  
  const centroid_lat = props.center_lat;
  const centroid_lon = props.center_lon;


  console.log(e.features[0].properties);

  cd_box.innerHTML = `${cdta_name}
                      <hr>
                      Total RS Units: ${rs_unit_count}<br>
                      Net RS Unit Change Since 2019: ${net_change}<br>
  `
  // highlight it 
  map.setFilter('cd-highlight', ['==', 'cd', props.cd]);
  map.flyTo({
    center: [centroid_lon, centroid_lat],
    zoom: 13,
  });

  

});

// ------------------------- toggle listeners ---------------
document.getElementById('cd-toggle').addEventListener('change', (e) => {
  console.log('toggle time');
  const opacity = e.target.checked ? 0.8 : 0;
  const vis = e.target.checked ? 'visible' : 'none';

  map.setPaintProperty('community_districts', 'fill-opacity', opacity);
  map.setPaintProperty('cd_outlines', 'line-opacity', opacity);

});

document.getElementById('building-toggle').addEventListener('change', (e) => {
  const visibility = e.target.checked ? 'visible' : 'none';

  map.setLayoutProperty('rs_units', 'visibility', visibility);
});

// -----info splash screen modal fucntionality -----------------
var modal = document.getElementById("info-panel");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 