<?php
/**
 * Plugin Name:     Places
 * Plugin URI:      http://places.blgg.fr
 * Description:     Interactive maps in a block with multiple markers and their popups. Manage locations in the Places post type.
 * Author:          Romain GUILLAUME
 * Author URI:      http://blgg.fr
 * Text Domain:     places-plugin
 * Domain Path:     /languages
 * Version:         0.1.4
 *
 * @package         Places
 */

/**
 * places_plugin_loaded load_plugin_textdomain
 *
 * @return void
 */
function places_plugin_loaded() {
    load_plugin_textdomain( 'places-plugin', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'places_plugin_loaded' );

class CPT_places{
    
    function __construct(){
        add_action( 'init', [$this, 'init'], 10);
        
        register_activation_hook( __FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook( __FILE__, [$this, 'register_deactivation_hook'] );
    }

    
    function register_deactivation_hook() {
        flush_rewrite_rules();
    }

    function register_activation_hook() {
        $this->init();
        flush_rewrite_rules();
    }
    
    function init() {
        $labels = array(
            'name'                => _x( 'Places', 'Post Type General Name', 'places-plugin'),
            'singular_name'       => _x( 'Place', 'Post Type Singular Name', 'places-plugin'),
        );
        
        $args = array(
            'label'               => __( 'Places', 'places-plugin'),
            'description'         => __( 'Add places to use with Places blocks', 'places-plugin'),
            'labels'              => $labels,
            'supports'            => array( 'title', 'editor', 'excerpt', 'author', 'thumbnail', 'comments', 'revisions', 'custom-fields', ),
            'show_in_rest'        => true,
            'hierarchical'        => false,
            'public'              => true,
            'has_archive'         => true,
            'menu_icon'           => 'dashicons-location-alt',
        );
        
        register_post_type( 'places', $args );
    }
}

// require_once('inc/CPT-places.php');
new CPT_places;

require_once('inc/CF-places.php');
new CF_places;

require_once('inc/CF-geocoding-places.php');
new geo_coding_places;

require_once('blocks/places.php');
new places_block;