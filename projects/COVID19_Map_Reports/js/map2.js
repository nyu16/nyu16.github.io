mapboxgl.accessToken =
    'pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw';
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 3.6, // starting zoom
    minZoom: 3, // minimum zoom level of the map
    center: [-96, 40], // starting center,
    projection: 'albers'
});
const colors = ['rgb(255,255,178)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)',
                'rgb(240,59,32)', 'rgb(189,0,38)'],
    radii = [4, 9, 13, 17, 21, 30];

let grades;

const clegend = document.getElementById('clegend');
var clabels = ['<strong>Select</strong>'],
    vbreak;
clabels.push(
    '<p class="radios">\
        <input class="btns" type="radio" id="deaths" value="deaths" name="selection">\
        <label for="deaths">Deaths</label>\
    </p>\
    <p class="radios">\
        <input class="btns" type="radio" id="cases" value="cases" name="selection" checked>\
        <label for="cases">Cases</label>\
    </p>'
);
clegend.innerHTML = clabels.join('');

document.querySelector('#clegend').addEventListener('input', function(e) {
    let btnChecked = e.target.value;

    map.removeLayer('covid19-point');

    if (btnChecked == 'cases') {
        grades = [1000, 5000, 10000, 50000, 100000, 756412];
    } else {
        grades = [50,100,500,1000,5000,10056];
    }
    updateMap(btnChecked);
    updateLegend(btnChecked);
});

//map.on('load', function loadingData() {
map.on('load', () => { //simplifying the function statement: arrow with brackets to define a function
    // when loading a geojson, there are two steps
    // add a source of the data and then add the layer out of the source
    grades = [1000, 5000, 10000, 50000, 100000, 756412];
    map.addSource('covid19', {
        type: 'geojson',
        data: 'assets/us-covid-2020-counts.geojson'
    });
    updateMap('cases');
    updateLegend('cases');
});

function updateMap(choice) {
    map.addLayer({
            'id': 'covid19-point',
            'type': 'circle',
            'source': 'covid19',
            'paint': {
                // increase the radii of the circle as the zoom level and dbh value increases
                'circle-radius': {
                    'property': choice,
                    'stops': [
                        [grades[0], radii[0]],
                        [grades[1], radii[1]],
                        [grades[2], radii[2]],
                        [grades[3], radii[3]],
                        [grades[4], radii[4]],
                        [grades[5], radii[5]]
                    ]
                },
                'circle-color': {
                    'property': choice,
                    'stops': [
                        [grades[0], colors[0]],
                        [grades[1], colors[1]],
                        [grades[2], colors[2]],
                        [grades[3], colors[3]],
                        [grades[4], colors[4]],
                        [grades[5], colors[5]]
                    ]
                },
                'circle-stroke-color': 'white',
                'circle-stroke-width': 0.3,
                'circle-opacity': 0.6
            }
        }
    );
    // click on tree to view magnitude in a popup
    map.on('click', 'covid19-point', (event) => {
        new mapboxgl.Popup()
            .setLngLat(event.features[0].geometry.coordinates)
            .setHTML(`<strong>` + capitalize(choice) + `:</strong> ${event.features[0].properties[choice]} <br> 
            <strong>County:</strong> ${event.features[0].properties.county}`)
            .addTo(map);
    });
    map.on('click', 'clegend', (chosen) => {
        choice = chosen;
        console.log(document.querySelector('input[name="selection"]:checked').value);
    });
}

function updateLegend(feature) {
    const legend = document.getElementById('legend');
    var labels = ['<strong>Number of ' + capitalize(feature) + '</strong>'],
        vbreak;

    for (var i = 0; i < grades.length; i++) {
        if (i > 0) {
            let to = grades[i]
            let from = grades[i-1]
            if (grades[i] >= 4999) {
                from = Math.trunc(grades[i-1]/1000) + "K";
                to = Math.trunc(grades[i]/1000) + "K";
            }
            vbreak = from + " to " + to;
        }
        else {
            vbreak = "1 to " + grades[i];
        }
        
        dot_radii = 2 * radii[i];
        labels.push(
            '<p class="break">\
                <i class="dot" style="background:' + colors[i] + '; width: ' + dot_radii + 'px; height: ' +
                dot_radii + 'px; margin-left: ' + (40 - radii[i]) + 'px; "></i>\
                <span class="dot-label" style="top: ' + dot_radii / 2 + 'px;">' + vbreak + '</span>\
            </p>');
    }
    const source =
        '<p style="text-align: right; font-size:10pt">\
        Source: <a href="https://github.com/nytimes/covid-19-data/blob/43d32dde2f87bd4dafbb7d23f5d9e878124018b8/live/us-counties.csv">\
        NY Times</a></p>';
    legend.innerHTML = labels.join('') + source;
}

function capitalize(s)
{
    return s && s[0].toUpperCase() + s.slice(1);
}