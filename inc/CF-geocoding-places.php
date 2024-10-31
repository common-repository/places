<?php
class geo_coding_places{
    function __construct(){
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);
        add_action('wp_ajax_nominatim', [$this, 'search_nominatim']);
        add_action('wp_ajax_reverse', [$this, 'reverse_nominatim']);
    }

    function admin_enqueue_scripts(){
        $dir = dirname( __FILE__ );
        $nominatim = 'js/CF-geocoding-places.js';
        wp_register_script('nominatim-AJAX', plugins_url( $nominatim, __FILE__ ), ['jquery', 'leaflet'], filemtime( "$dir/$index_js" ), true);
        wp_localize_script('nominatim-AJAX', 'adminAjax', admin_url( 'admin-ajax.php' ) );
        wp_enqueue_script('nominatim-AJAX');
    }

    function search_nominatim(){
        if (! isset($_POST['text']))
            return;

        $address = rawurlencode( $_POST['text'] );
        $coord   = get_transient( 'geocode_' . $address );
        if( empty( $coord ) ) {
            $url  = 'http://nominatim.openstreetmap.org/?format=json&addressdetails=1&q=' . $address . '&format=json&limit=1';
            $json = wp_remote_get( $url );
            if ( 200 === (int) wp_remote_retrieve_response_code( $json ) ) {
                $body = wp_remote_retrieve_body( $json );
                $json = json_decode( $body, true );
            }

            $coord['lat'] = $json[0]['lat'];
            $coord['lng'] = $json[0]['lon'];
            set_transient( 'geocode_' . $address, $coord, DAY_IN_SECONDS * 90 );
        }
        if($coord['lat'] && $coord['lng']){
            wp_send_json_success( $coord );
        }else{
            wp_send_json_error();
        }
    }

    function reverse_nominatim(){
        if (! isset($_POST['lat']) || ! isset($_POST['lng']))
            return;

        $lat = rawurlencode( $_POST['lat'] );
        $lon = rawurlencode( $_POST['lng'] );
        $latlon   = get_transient( 'geocode_' . $lat . ',' . $lon );
        if( empty( $latlon ) ) {
            $url  = 'http://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=' . $lat . '&lon=' . $lon . '&format=json&limit=1';
            $json = wp_remote_get( $url );
            if ( 200 === (int) wp_remote_retrieve_response_code( $json ) ) {
                $body = wp_remote_retrieve_body( $json );
                $json = json_decode( $body, true );
            }

            $display_name = $json['display_name'];
            set_transient( 'geocode_' . $lat . ',' . $lon, $json, DAY_IN_SECONDS * 90 );
        }
        if($display_name){
            wp_send_json_success( $json );
        }else{
            wp_send_json_error($latlon);
        }
    }
}