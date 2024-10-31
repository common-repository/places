<?php
/**
 * Functions to register client-side assets (scripts and stylesheets) for the
 * Gutenberg block.
 *
 * @package places
 */

/**
 * Registers all block assets so that they can be enqueued through Gutenberg in
 * the corresponding context.
 *
 * @see https://wordpress.org/gutenberg/handbook/designers-developers/developers/tutorials/block-tutorial/applying-styles-with-stylesheets/
 */
class places_block{
	function __construct(){
		$this->block_index = 0;
		add_action('init', [$this, 'places_block_init']);
        add_action('wp_ajax_nopriv_places_ids_data', [$this, 'places_ids_data']);
        add_action('wp_ajax_places_ids_data', [$this, 'places_ids_data']);
        add_action('wp_enqueue_scripts', [$this, 'wp_enqueue_scripts']);
	}
	function wp_enqueue_scripts(){
		$dir = dirname( __FILE__ );
		$front_js = 'places/front.js';
		wp_register_script(
			'places-block-front',
			plugins_url( $front_js, __FILE__ ),
			array('leaflet', 'jquery'),
			filemtime( "$dir/$front_js" ),
			false
		);
		wp_enqueue_script('places-block-front');
        wp_localize_script('places-block-front', 'adminAjax', admin_url( 'admin-ajax.php' ) );
	}
	function places_block_init() {
		// Skip block registration if Gutenberg is not enabled/merged.
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		$dir = dirname( __FILE__ );

		$index_js = 'places/index.js';
		wp_register_script(
			'places-block-editor',
			plugins_url( $index_js, __FILE__ ),
			array(
				'wp-data',
				'wp-i18n',
				'wp-blocks',
				'wp-editor',
				'wp-element',
				'wp-components',
			),
			filemtime( "$dir/$index_js" )
		);
		if ( function_exists('wp_set_script_translations') ) {
			wp_set_script_translations( 'places-block-editor', 'places-plugin', plugin_dir_path( $dir ) . 'languages' );
		}

		$editor_css = 'places/editor.css';
		wp_register_style(
			'places-block-editor',
			plugins_url( $editor_css, __FILE__ ),
			array('leaflet'),
			filemtime( "$dir/$editor_css" )
		);

		$style_css = 'places/style.css';
		wp_register_style(
			'places-block',
			plugins_url( $style_css, __FILE__ ),
			array(),
			filemtime( "$dir/$style_css" )
		);

		register_block_type( 'places/places', array(
			'editor_script' => 'places-block-editor',
			'editor_style'  => 'places-block-editor',
			'style'         => 'places-block',
			'attributes' => [
				'places'			 => ['type' => 'array'],
				'settings'			 => ['type' => 'array'],
				'minHeight'			 => ['type' => 'number', 'default' => 580],
			],
			'render_callback' => [$this, 'render'],
		) );

	}	
	/**
	 * render is the server side rendering
	 *
	 * @param  mixed $attributes
	 * @return void
	 */
	function render( array $attributes ){
		$render = "";
		$render .= "";
		// $render .= print_r( $attributes, true );

		$container_style = "min-height: {$attributes['minHeight']}px;";
		
		$render .= "<div id='mapDiv_{$this->block_index}' class='places__box' style='width: 100%; $container_style'></div>" . PHP_EOL;
		
		$places = $attributes['places'];

		if($places){
			$ajax = $attributes['settings']['ajaxLoader'];
			if($ajax){
				$data = json_encode($places);
				$callback = 'places_render_in_ajax';
			}else{
				$data = json_encode($this->places_ids_data_array($places));
				$callback = 'places_render';
			}
		}

		$settings = json_encode($attributes['settings']);

		$function = "$callback('mapDiv_{$this->block_index}', $data, $settings)";
		
		if($places){
			$render .= "<script>$function </script>" . PHP_EOL;
		}

		$this->block_index++;
		return $render;
	}
    
    /**
     * places_ids_data AJAX callback to load and send data to front
     *
     * @return void
     */
    function places_ids_data(){
		if(!$_POST['places_ids'] || ! is_array($_POST['places_ids']))
			return;

		$meta_data = $this->places_ids_data_array($_POST['places_ids']);
		wp_send_json_success($meta_data);
	}
	
	/**
	 * places_ids_data_array maps data, called directly if not loading with AJAX
	 *
	 * @param  mixed $places_ids
	 * @return void
	 */
	function places_ids_data_array(array $places_ids){			
		$meta_data = array_map(function(int $post_id){
			return [
				'_places__latitude'		 => get_post_meta($post_id, '_places__latitude', true),
				'_places__longitude'	 => get_post_meta($post_id, '_places__longitude', true),
				'_places__address'		 => get_post_meta($post_id, '_places__address', true),
				'_the_post_thumbnail'	 => get_the_post_thumbnail($post_id, 'medium'),
				'_post_permalink'		 => get_post_permalink($post_id),
			];
		}, $places_ids);
		return $meta_data;
    }
}
