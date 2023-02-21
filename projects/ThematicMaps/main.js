mapboxgl.accessToken =
    'pk.eyJ1IjoiYWhtdW9sYSIsImEiOiJjbGRtbnZ0eXcwYXl3M290YmlxOW8zNTNxIn0.Aja1Mw1tbNlgcZiX6s9vWw';
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ahmuola/cldmomtwz000n01qtk7filz9r',
        zoom: 12,
        minZoom: 9.8,
        center: [-122.634303, 47.630491]
    }
);

map.on('load', () => {
    showPopup();
    map.addSource('basemap-tiles', {
        'type': 'raster',
        'tiles': [
            'assets/basemap/{z}/{x}/{y}.png'
        ],
        'tileSize': 256,
        'attribution': 'Map tiles designed by Nicholas Yu</a>'
    });

    map.addSource('moonlight_wet-tiles', {
        'type': 'raster',
        'tiles': [
            'assets/moonlight_wet/{z}/{x}/{y}.png'
        ],
        'tileSize': 256,
        'attribution': 'Map tiles designed by Nicholas Yu'
    });

    map.addSource('basemap_wet-tiles', {
        'type': 'raster',
        'tiles': [
            'assets/basemap_wet/{z}/{x}/{y}.png'
        ],
        'tileSize': 256,
        'attribution': 'Map tiles designed by Nicholas Yu'
    });

    map.addSource('nature-tiles', {
        'type': 'raster',
        'tiles': [
            'assets/nature/{z}/{x}/{y}.png'
        ],
        'tileSize': 256,
        'attribution': 'Map tiles designed by Nicholas Yu'
    });

    map.addLayer({
        'id': 'basemap',
        'type': 'raster',
        'layout': {
            'visibility': 'none'
        },
        'source': 'basemap-tiles'
    });

    map.addLayer({
        'id': 'moonlight_wet',
        'type': 'raster',
        'layout': {
            'visibility': 'none'
        },
        'source': 'moonlight_wet-tiles'
    });

    map.addLayer({
        'id': 'basemap_wet',
        'type': 'raster',
        'layout': {
            'visibility': 'none'
        },
        'source': 'basemap_wet-tiles'
    });

    map.addLayer({
        'id': 'nature',
        'type': 'raster',
        'layout': {
            'visibility': 'none'
        },
        'source': 'nature-tiles'
    });
});


map.on('idle', () => {
    if (!map.getLayer('basemap') || !map.getLayer('moonlight_wet') || !map.getLayer('basemap_wet') || !map.getLayer('nature')) {
        return;
    }

    // Enumerate ids of the layers.
    const toggleableLayerIds = ['basemap', 'moonlight_wet', 'basemap_wet', 'nature'];

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
            continue;
        }

        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = id;
        link.className = 'inactive';

        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
            const clickedLayer = this.textContent;
            // preventDefault() tells the user agent that if the event does not get explicitly handled, 
            // its default action should not be taken as it normally would be.
            e.preventDefault();
            // The stopPropagation() method prevents further propagation of the current event in the capturing 
            // and bubbling phases. It does not, however, prevent any default behaviors from occurring; 
            // for instance, clicks on links are still processed. If you want to stop those behaviors, 
            // see the preventDefault() method.
            e.stopPropagation();

            const visibility = map.getLayoutProperty(
                clickedLayer,
                'visibility'
            );

            // Toggle layer visibility by changing the layout object's visibility property.
            // if it is currently visible, after the clicking, it will be turned off.
            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                this.className = '';
            } else { //otherise, it will be turned on.
                this.className = 'active';
                map.setLayoutProperty(
                    clickedLayer,
                    'visibility',
                    'visible'
                );
            }
        };

        // in the menu place holder, insert the layer links.
        const layers = document.getElementById('menu');
        layers.appendChild(link);
    }
});

function showPopup() {
    console.log(document.querySelector("#popo"));
    document.querySelector("#popo").classList.add('open');
}
function hidePopup() {
    document.querySelector("#popo").classList.remove('open');
}