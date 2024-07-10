var map;

let messagesContainer = document.getElementById("messages_container");

function addMap() {

    mapboxgl.accessToken = 'pk.eyJ1IjoidGh1bmRlcmFyZWEiLCJhIjoiY2tsamlxM2ZiMjltZTJzbWc1cGhvMjU0bCJ9.4sp3moR9KYYka1J1G-6IvA';
    if (!mapboxgl.supported()) {
        alert('Your browser does not support Mapbox GL');
    } else {
        map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/satellite-streets-v11', // style URL
            center: [21.97, 40.216], // starting position [lng, lat]
            zoom: 10 // starting zoom
        });
        map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new mapboxgl.FullscreenControl());
        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            })
        );

        var layerList = document.getElementById('style_menu');
        var inputs = layerList.getElementsByTagName('input');

        function switchLayer(layer) {
            var layerId = layer.target.id;
            // map.getStyle().layers.forEach(element => {
            //     console.log(element);
            // });
            document.querySelectorAll(".img_checkbox").forEach(el => {
                el.checked = false;
            });
            document.querySelectorAll(".specific_metadata").forEach(el => {
                el.dataset.visible = false;
            });
            map.setStyle('mapbox://styles/mapbox/' + layerId);
        }

        for (var i = 0; i < inputs.length; i++) {
            inputs[i].onclick = switchLayer;
        }

        map.on('load', function () {
            map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512,
                'maxzoom': 14
            });
            // add the DEM source as a terrain layer with exaggerated height
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
                
            // add a sky layer that will show when the map is highly pitched
            map.addLayer({
                'id': 'sky',
                'type': 'sky',
                'paint': {
                    'sky-type': 'atmosphere',
                    'sky-atmosphere-sun': [0.0, 0.0],
                    'sky-atmosphere-sun-intensity': 15
                }
            });


            // Thanks to https://stackoverflow.com/questions/63158744/display-lat-lng-coordinates-on-click-on-mapbox-gl-js
            map.on('click', function(e) {
                var coordinates = e.lngLat;
                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(getHTMLContent(coordinates, map.getZoom()))
                  .addTo(map);
              } );
            });
            document.body.addEventListener("click", e => {
                if (e.target.classList.contains("copy-button")) {
                    let copyText = e.target.parentNode.querySelector(".value");
                    copyText.select();
                    copyText.setSelectionRange(0, 99999); /* For mobile devices */
                    navigator.clipboard.writeText(copyText.value);
                    let el_1 = `<div class="copied-message">The value was copied</div>`;
                    el_1 = new DOMParser().parseFromString(el_1, "text/html").body.firstElementChild;
                    messagesContainer.appendChild(el_1);
                    setTimeout(() => {
                        messagesContainer.removeChild(el_1);
                    }, 2000);
                }
            });
    }
}

function getHTMLContent(coordinates, zoom) {
    return `
    <div>
        <span class="title">Latitude: </span>
        <input type="text" class="value" value="${coordinates.lat}">
        <span class="iconify left copy-button" data-icon="bi:clipboard"></span>
    </div>
    <div>
        <span class="title">Longitude: </span>
        <input type="text" class="value" value="${coordinates.lng}">
        <span class="iconify left copy-button" data-icon="bi:clipboard"></span>
    </div>
    <div>
        <span class="title">Zoom: </span>
        <input type="text" class="value" value="${zoom}">
        <span class="iconify left copy-button" data-icon="bi:clipboard"></span>
    </div>
    `;
}

addMap();