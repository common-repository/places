/**
 * 
 * Front script for Places plugin
 * 
 * Renders a map from a block, and
 * markers and popups are meta data from CPT Places
 * 
 */

$ = jQuery;

function add_marker(map, datas, settings, selector_id){
    let latlong;
    datas.map(meta_data => {
        L.marker([ meta_data._places__latitude,  meta_data._places__longitude])
        .addTo(map)
        .bindPopup('<a class="places__popup" href="'+meta_data._post_permalink+'">'
        +meta_data._the_post_thumbnail+meta_data._places__address + '</a><br>'
		// +'<button class="places__zoom">ZOOM</button>'
		)
        .on('popupopen', function(popup){
            console.log(popup.popup.getLatLng());
            latlong = popup.popup.getLatLng();
            // const zoom = settings.has('zoomOnClick') ? settings.has('zoomOnClick') : settings.has('defaultZoom');
            // settings.has("zoomOnClick") ? $('#' + selector_id).addClass('places__zoom-in') : null;
            // map.setView([latlong.lat, latlong.lng], zoom);
        });
    });
    $('body').on('click', '.places__zoom', function(){
        if($('#' + selector_id).hasClass('places__zoom-in')){
            set_view(map, datas);
            $('#' + selector_id).removeClass('places__zoom-in');
        } else {
            $('#' + selector_id).addClass('places__zoom-in');
            console.log( '.places__zoom latlong', latlong);
            map.setView([latlong.lat, latlong.lng], settings.has('zoomOnClick'));
        }
    })
}

function set_view(map, datas, settings){
    const selectedCoords = datas.map(value => {
        return [value._places__latitude, value._places__longitude]
    } );
    map.invalidateSize();
    map.fitBounds(selectedCoords);
}

function init_map(selector_id, settings){
    const map = L.map(selector_id, {scrollWheelZoom: settings.has('scrollWheelZoom')});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);
    return map;
}

function places_resize(map, data, selector_id){
    const resizeObserver = new ResizeObserver(() => {
        set_view(map, data);
    });
    const mapDiv = document.getElementById(selector_id);
    resizeObserver.observe(mapDiv);
}
  
function places_render(selector_id, data, settings_array){
    const settings = new Set(settings_array);
    const map = init_map(selector_id, settings);
    add_marker(map, data, settings, selector_id);
    set_view(map, data);
    places_resize(map, data, selector_id);
}

function places_render_in_ajax(selector_id, data, settings_array){
    const settings = new Set(settings_array);
    const map = init_map(selector_id, settings);
    $.ajax({
        url: adminAjax,
        method: 'POST',
        data: {
            action: 'places_ids_data',
            places_ids: data,
        }, 
        success : function( data ) {
            add_marker(map, data.data, settings, selector_id);
            set_view(map, data.data);
            places_resize(map, data, selector_id);
        },
        error : function( data ) { 
            console.log( 'Places AJAX error…' );
        }
    });
}