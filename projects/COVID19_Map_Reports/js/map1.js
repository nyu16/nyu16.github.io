mapboxgl.accessToken = 
    'pk.eyJ1IjoiamFrb2J6aGFvIiwiYSI6ImNpcms2YWsyMzAwMmtmbG5icTFxZ3ZkdncifQ.P9MBej1xacybKcDN_jehvw';

let map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/light-v10', // style URL
        zoom: 3.6, // starting zoom
        minZoom: 3,
        center: [-100, 40],
        projection: 'albers'
    });

let grades;
let mUnit;
let ranges;

const colors = [
                '#FFEDA070',
                '#FED97670',
                '#FEB24C70',
                '#FD8D3C70',
                '#FC4E2A70',
                '#E31A1C70',
                '#BD002670',
                '#80002670'
                ];

const clegend = document.getElementById('clegend');
var clabels = ['<strong>Select</strong>'],
    vbreak;
clabels.push(
    '<p class="radios">\
        <input class="btns" type="radio" id="deaths" value="deaths" name="selection">\
        <label for="deaths">Death Rate</label>\
    </p>\
    <p class="radios">\
        <input class="btns" type="radio" id="rates" value="rates" name="selection" checked>\
        <label for="rates">Case Rate</label>\
    </p>'
);
clegend.innerHTML = clabels.join('');

document.querySelector('#clegend').addEventListener('input', function(e) {
    let btnChecked = e.target.value;

    map.removeLayer('covidRates-layer');

    if (btnChecked == 'rates') {
        grades = [20,40,60,80,100,200,300];
        ranges = ['0-20%', '20-40%', '40-60%',
        '60-80%', '80-100%', '100-200%',
        '200-300%'];
        mUnit = '(cases/people)';
    } else {
        grades = [1.0,2.0,3.0,4.0,5.0,6.0,7.0];
        ranges = ['0-1.0%', '1.0-2.0%', '2.0-3.0%',
        '3.0-4.0%', '4.0-5.0%', '5.0-6.0%',
        '6.0-7.0%'];
        mUnit = '(deaths/people)';
    }
    updateMap(btnChecked);
});

map.on('load', () => {
    grades = [20,40,60,80,100,200,300];
    mUnit = '(cases/people)';
    ranges = ['0-20%', '20-40%', '40-60%',
                '60-80%', '80-100%', '100-200%',
                '200-300%'];

    map.addSource('covidRates', {
        type: 'geojson',
        data: 'assets/us-covid-2020-rates.geojson'
    });
    updateMap('rates');
});

function updateMap(choice) {
    map.addLayer({
        'id': 'covidRates-layer',
        'type': 'fill',
        'source': 'covidRates',
        'paint': {
            'fill-color': [
                'step',      // use step expression to provide fill color based on values
                
                ['get', choice],  // get the density attribute from the data
                
                '#FFEDA0',   // use color #FFEDA0
                grades[0],          // if density < 10
                
                '#FED976',   // use color #FED976
                grades[1],          // if 10 <= density < 20
                
                '#FEB24C',   // use color #FEB24C
                grades[2],          // if 20 <= density < 50
                
                '#FD8D3C',   // use color #FD8D3C
                grades[3],         // if 50 <= density < 100
                
                '#FC4E2A',   // use color #FC4E2A
                grades[4],         // if 100 <= density < 200
                
                '#E31A1C',   // use color #E31A1C
                grades[5],         // if 200 <= density < 500
                
                '#BD0026',   // use color #BD0026
                grades[6],        // if 500 <= density < 1000
                
                "#800026"    // use color #800026 if 1000 <= density
            ],
            'fill-outline-color': '#BBBBBB',
            'fill-opacity': 0.7,
        }
    });
    const layers = [
        ranges[0], ranges[1], ranges[2],
        ranges[3], ranges[4], ranges[5],
        ranges[6]
    ];

    const legend = document.getElementById('legend');
    legend.innerHTML = "<b>COVID19 " + capitalize(choice) + "<br>" + mUnit + "</b><br><br>";

    layers.forEach((layer, i) => {
        const color = colors[i];
        const item = document.createElement('div');
        const key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = color;

        const value = document.createElement('span');
        value.innerHTML = `${layer}`;
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
    });

    const source =
        '<p style="text-align: left; font-size:10pt">\
        Source: <a href="https://data.census.gov/table?g=0100000US$050000&d=ACS+5-Year+Estimates+Data+Profiles&tid=ACSDP5Y2018.DP05&hidePreview=true">\
        <br>US Census Bureau</a></p>';
    legend.innerHTML += source; 

    map.on('mousemove', ({point}) => {
        const county = map.queryRenderedFeatures(point, {
            layers: ['covidRates-layer']
        });
        document.getElementById('text-description').innerHTML = county.length ?
            `<h3>${county[0].properties.county}</h3><p><strong>` + capitalize(choice) + 
            ": </strong>" + `${county[0].properties[choice].toFixed(2)}%` + 
            "<br><strong>Population: </strong>" + `${county[0].properties.pop18}</p>`:
            `<p>Hover over a county!</p>`;
    });
}

function capitalize(s)
{
    return s && s[0].toUpperCase() + s.slice(1);
}
