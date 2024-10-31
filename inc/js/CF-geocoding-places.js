jQuery( document ).ready( function($) {
    
    if(!$('#places__preview-box').length > 0){
        return;
    }
    const latlng = [
        $('#places__latitude-field').attr('value').length ? parseFloat($('#places__latitude-field').attr('value'),10) : 0, 
        $('#places__longitude-field').attr('value').length ? parseFloat($('#places__longitude-field').attr('value'),10) : 0,
    ]
    console.log($('#places__longitude-field').attr('value').length);
    // if(latlng[0] && latlng[1]){
    const map = L.map('places__preview-box', {scrollWheelZoom: false}).setView(latlng, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    setTimeout(map.invalidateSize.bind(map));
    const marker = L.marker(latlng, {draggable: true}).addTo(map);
    let delayTimer;

    function do_simple_reverse_Nominatim(coords){
        delayTimer = setTimeout(function() {
            $.ajax({
                url: adminAjax,
                method: 'POST',
                data: {
                    action: 'reverse',
                    lat: coords[0],
                    lng: coords[1],
                }, 
                success : function( data ) {
                    console.log('do_simple_reverse_Nominatim',data);
                },
                error : function( data ) {
                    console.log( 'Place request error…', data );
                }
            });
        }, 1000); // Will do the request after 1000 ms, or 1 s
    }

    function do_search_Nominatim(text) {
        clearTimeout(delayTimer);
        $('#places__address-loader').css('opacity', 1);
        delayTimer = setTimeout(function() {
            $.ajax({
                url: adminAjax,
                method: 'POST',
                data: {
                    action: 'nominatim',
                    text: text,
                }, 
                success : function( response ) {
                    $('#places__address-loader').css('opacity', 0);
                    console.log(response);
                    // city, municipality, county, state, country, 
                    if('data' in response){
                        if(! 'lat' in response.data || ! 'lon' in response.data){
                            return;
                        }
                        const lat = parseFloat(response.data.lat, 10);
                        const lng = parseFloat(response.data.lng, 10)
                        $('#places__latitude-field').val(lat);
                        $('#places__longitude-field').val(lng);
                        marker.setLatLng([lat, lng]);
                        map.setView([lat, lng], map.getZoom());
                        do_reverse_Nominatim([response.data.lat, response.data.lng]);
                    } else {
                        $('#places__latitude-field').attr('value', '');
                        $('#places__longitude-field').attr('value', '');
                    }
                },
                error : function( data ) { 
                    $('#places__address-loader').css('opacity', 0);
                    console.log( 'Place request error…', data );
                }
            });
        }, 1000); // Will do the request after 1000 ms, or 1 s
    }
    
    $('#places__address-field').on('input', function(event) {
        do_search_Nominatim($(this).val());
    });

    function do_reverse_Nominatim(coords){
        if($('#places__updates-address').attr('checked'))
        return;
        clearTimeout(delayTimer);
        $('#places__address-loader').css('opacity', 1);
        delayTimer = setTimeout(function() {
            $.ajax({
                url: adminAjax,
                method: 'POST',
                data: {
                    action: 'reverse',
                    lat: coords[0],
                    lng: coords[1],
                }, 
                success : function( response ) {
                    console.log(response);
                    // 'building', '​​country','​​country_code', '​​county','​​hamlet','​​municipality','​​neighbourhood','​​pedestrian','​​postcode','​​state','​​town',
                    $('#places__address-loader').css('opacity', 0);
                    if('data' in response){
                        if(! 'display_name' in response.data)
                        return;
                        $('#places__address-field').val(response.data.display_name);
                    }
                },
                error : function( data ) { 
                    $('#places__address-loader').css('opacity', 0);
                    console.log( 'Place request error…', data );
                }
            });
        }, 1000); // Will do the request after 1000 ms, or 1 s
    }
    function set_marker_coords(){
        const coords = [
            parseFloat($('#places__latitude-field').attr('value'), 10),
            parseFloat($('#places__longitude-field').attr('value'), 10),
        ]
        marker.setLatLng(coords);
        map.setView(coords, map.getZoom());
        do_reverse_Nominatim(coords);
    }

    marker.on('move', obj => {
        $('#places__latitude-field').attr('value', obj.latlng.lat);
        $('#places__longitude-field').attr('value', obj.latlng.lng);
        do_reverse_Nominatim([obj.latlng.lat, obj.latlng.lng]);
    })
    
    $('#places__latitude-field').on( 'input', function(event) {
        if (event.currentTarget.value)
            set_marker_coords();
    });
    
    $('#places__longitude-field').on( 'input', function(event) {
        if (event.currentTarget.value)
            set_marker_coords();
    });

});