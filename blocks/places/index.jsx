import { Map, Marker, Popup, TileLayer } from 'react-leaflet'

import {__} from '@wordpress/i18n'
const {registerBlockType} = wp.blocks
const {InspectorControls} = wp.editor
const {CheckboxControl, PanelBody, TextControl} = wp.components
const {withState} = wp.compose
const {withSelect} = wp.data


registerBlockType( 'places/places', {
    title: __('Places', 'places-plugin'),
    description: __( 'Interactive maps in a block with multiple markers and their popups. Manage locations in the Places post type.', 'places-plugin' ),
	category: 'widgets',
	icon: 'location-alt',
	supports: {
        html: false,
        align: ['wide', 'full']
    },
		
	edit: withSelect( ( select ) => {
        return {
            posts: select( 'core' ).getEntityRecords( 'postType', 'places'),
        };
    } )( ( {posts, attributes, className, setAttributes} ) => {
        if ( ! posts ) {
            return __('Loading...', 'places-plugin');
        }
 
        if ( posts && posts.length === 0 ) {
            return __('No places found. Create some first.', 'places-plugin');
        }

        const posts_with_coords = posts.filter((post)=>(! (isNaN(post._places__latitude) || isNaN(post._places__longitude))))
        if(posts_with_coords.length === 0){
            return __('No places found. Create some first.', 'places-plugin');
        }
        
        const selected_posts = ('places' in attributes) ? new Set(attributes.places) : new Set()
        
        const posts_to_display = posts_with_coords.filter(post=>selected_posts.has(post.id))
 
        const selected_posts_coords = (posts_to_display.length > 0) ? posts_to_display.map(post => [post._places__latitude, post._places__longitude]) : [[0,0]]
        const PlacesMarkers = () => {
            return posts_to_display.map(post => (
                <Marker 
                    position={[post._places__latitude, post._places__longitude]}
                    >
                    <Popup><a href={post.link}>{post._places__address}</a></Popup>
                </Marker>
            ))
        }
	
        const map_style = {
            minHeight: attributes.minHeight + 'px'
        }

        const Places = withState({
            places_checked: new Set([...selected_posts]) // selected_posts
		})( ( { places_checked, setState } ) => (
			<>
				{posts_with_coords.map(post => (
					<CheckboxControl
						className="check_terms"
						label={post.title.raw}
						checked={places_checked.has(post.id)}
						onChange={(check) => {
							check ? places_checked.add(post.id) : places_checked.delete(post.id)
							setAttributes({places: Array.from(places_checked)}) 
							setState({places_checked})
						} }
					/>
				) )}
			</>
        ) )

        const settings_in_attrs = ('settings' in attributes) ? new Set(attributes.settings) : new Set()
        const settings = {
            'ajaxLoader': __('Asynchronous load', 'places-plugin'),
            'scrollWheelZoom': __('Scroll wheel zoom', 'places-plugin'),
            'zoomOnClick': __('Zoom on popup open', 'places-plugin'),
        } 
        const Settings = withState({
			settings_checked: new Set([...settings_in_attrs])
		})( ( { settings_checked, setState } ) => (
			<>
				{Object.keys(settings).map(setting_key => (
					<CheckboxControl
						className="check_terms"
						label={settings[setting_key]}
						checked={settings_checked.has(setting_key)}
						onChange={(check) => {
							check ? settings_checked.add(setting_key) : settings_checked.delete(setting_key)
							setAttributes({settings: Array.from(settings_checked)}) 
							setState({settings_checked})
						} }
					/>
				) )}
			</>
        ) )
        const scrollWheelZoom = 'settings' in attributes ? 'scrollWheelZoom' in attributes.settings ? true : false : false

		return [
			<InspectorControls key="1">
				<PanelBody title={ __( 'Places', 'places-plugin' ) }>
                    <Places></Places>
				</PanelBody>
				<PanelBody title={ __( 'Settings', 'places-plugin' ) }>
                    <Settings></Settings>
				</PanelBody>
				<PanelBody title={ __( 'Container settings', 'places-plugin' ) }>
                    <TextControl
                        label={ __( 'Minimum height in pixels', 'places-plugin' ) }
                        value={attributes.minHeight}
                        onChange={(minHeight) => setAttributes({minHeight})}
                        type="number"
                    />
				</PanelBody>
			</InspectorControls>,
			<div key="2" className={className}>
                <Map 
                    style={map_style} 
                    bounds={selected_posts_coords}
                    useFlyTo={true}
                    scrollWheelZoom={scrollWheelZoom}
                    >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    />
                    <PlacesMarkers></PlacesMarkers>
                </Map>
			</div>,
		];
	}),
	save(){
		return null;
	}
})