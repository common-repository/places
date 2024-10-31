<?php
class CPT_places{
    
    function __construct(){
        add_action( 'init', [$this, 'init']);
        
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