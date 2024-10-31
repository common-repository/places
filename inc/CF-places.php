<?php 
class CF_places{
    function __construct(){
        add_action('add_meta_boxes', [$this, 'init_metabox']);
        add_action('save_post', [$this, 'save_metabox']);
        add_action('rest_api_init', [$this, 'add_custom_field'] );
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('admin_head', [$this, 'admin_head']);
    }    
    /**
     * add_custom_field will register_rest_field to access post meta in editor
     *
     * @return void
     */
    function add_custom_field() {
        register_rest_field( 'places',
            '_places__address',
            array(
                'get_callback'  => [$this, 'rest_get_post_field'],
                'update_callback'   => null,
                'schema'            => null,
            )
        );
        register_rest_field( 'places',
            '_places__latitude',
            array(
                'get_callback'  => [$this, 'rest_get_post_field'],
                'update_callback'   => null,
                'schema'            => null,
            )
        );
        register_rest_field( 'places',
            '_places__longitude',
            array(
                'get_callback'  => [$this, 'rest_get_post_field'],
                'update_callback'   => null,
                'schema'            => null,
            )
        );
    }
        
    /**
     * rest_get_post_field called back by the editor
     *
     * @param  mixed $post
     * @param  mixed $field_name
     * @param  mixed $request
     * @return void
     */
    function rest_get_post_field( $post, $field_name, $request ) {
        return get_post_meta( $post['id'], $field_name, true );
    }
        
    /**
     * init_metabox defines the meta box
     *
     * @return void
     */
    function init_metabox(){
        add_meta_box('places_MB', __('You can enter a place address in the text area below ; then, to display it, use the Places block anywhere, for exemple in this post', 'places-plugin'), [$this, 'meta_CB'], 'places', 'normal', 'high');
    }
    
    /**
     * admin_head adds some style the preview
     *
     * @return void
     */
    function admin_head() {
        ?>
        <style>
        #places__preview-box{width: 100%; height: 480px; display: block; resize: both; background: url(/wp-admin/images/spinner-2x.gif) center center no-repeat; }
        #places__address-loader{margin-left: 1ex; background: url(/wp-admin/images/spinner.gif) center center no-repeat transparent; width: 1em; display: inline-block; height: 1em; border-radius: 50%; opacity: 0; transition: 100ms}
        </style>
        <?php
    }
        
    /**
     * meta_CB the fields and the preview
     *
     * @param  mixed $post
     * @return void
     */
    function meta_CB($post){
        $address = get_post_meta($post->ID,'_places__address', true);
        $latitude = get_post_meta($post->ID,'_places__latitude', true);
        $longitude = get_post_meta($post->ID,'_places__longitude', true);
        $updates_ad = get_post_meta($post->ID,'_places__updates_address', true);
        echo __('Address to display', 'places-plugin').'<span id="places__address-loader"></span> <textarea id="places__address-field" name="place_address" class="widefat">'.esc_textarea($address).'</textarea>';
        echo '<p>';
        $url = 'https://www.openstreetmap.org';
        echo sprintf( wp_kses( __( 'If your place is not registered already, add it using your <a href="%s">openstreetmap.org</a> account.', 'places-plugin' ), array(  'a' => array( 'href' => array() ) ) ), esc_url( $url ) );
        echo ' | ';
        echo ' <input type="checkbox" id="places__updates-address" name="place_updates_address" '.checked($updates_ad,true,false).' /> ';
        echo '<label for="places__updates-address">'.__('Moving the marker or changing coordinates values do not update the address to display.', 'places-plugin').'</label>';
        echo '</p>';
        echo '<div id="places__preview-box"></div>';
        echo '<p>'.__('GPS coordinates', 'places-plugin') . '</p>';
        echo __('Latitude', 'places-plugin').' <input type="number" step="0.00001" id="places__latitude-field" name="place_latitude" value='.esc_attr($latitude).' ></input> ° ';
        echo ' | ';
        echo __('Longitude', 'places-plugin').' <input type="number" step="0.00001" id="places__longitude-field" name="place_longitude" value='.esc_attr($longitude).' ></input> ° ';
    }
    
    /**
     * save_metabox sanitize fields data
     *
     * @param  mixed $post_id
     * @return void
     */
    function save_metabox($post_id){
        if(isset($_POST['place_address']))
        update_post_meta($post_id, '_places__address', sanitize_textarea_field($_POST['place_address']));
        if(isset($_POST['place_latitude']))
        update_post_meta($post_id, '_places__latitude', floatval($_POST['place_latitude']));
        if(isset($_POST['place_longitude']))
        update_post_meta($post_id, '_places__longitude', floatval($_POST['place_longitude']));
        update_post_meta($post_id, '_places__updates_address', rest_sanitize_boolean($_POST['place_updates_address']));
    }
    
    /**
     * enqueue_scripts will use leaflet API in Places posts and in front-end
     *
     * @return void
     */
    function enqueue_scripts(){
        $dir = dirname( __FILE__ );
        $css = 'leaflet/leaflet.css';
        $js = 'leaflet/leaflet.js';
        wp_enqueue_style('leaflet', plugins_url( $css, __FILE__ ), '1.6.0');
        wp_enqueue_script('leaflet', plugins_url( $js, __FILE__ ), [], '1.6.0');
    }
}