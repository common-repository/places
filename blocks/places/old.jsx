import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import React, { Component } from 'react'
import { useContext } from 'react/cjs/react.development'

const {__} = wp.i18n
const {Fragment} = wp.element
const {registerBlockType} = wp.blocks
const {InspectorControls, MediaUpload} = wp.editor
const {CheckboxControl, IconButton, TextControl, Button, Panel, PanelBody, PanelRow, SelectControl } = wp.components
const {withState} = wp.compose
const {withSelect} = wp.data
const {serverSideRender: ServerSideRender} = wp


registerBlockType( 'places/places', {
	title: 'Places',
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
            return 'Loading...';
        }
 
        if ( posts && posts.length === 0 ) {
            return 'No posts';
        }

        const withCoords = posts.filter(function(value, index, arr){
            return ! (isNaN(value._places_coords.lat) || isNaN(value._places_coords.long))
        })

        const places = [{
            label: 'Aucun',
            value: null,
        }].concat(withCoords.map(function(post){
            return{
                label: post.title.raw,
                value: post.id,
            }
        }))
        const locations = attributes.locations.filter(function(loc, index, arr){
            return loc.id
        })
        const locations_map_filter = locations.map(loc => {
            return posts.filter(function(value, index, arr){
                return value.id == loc.id
            })[0]
        })

        const PlacesMarkers = () => {
            return locations_map_filter.map(value => (
                <Marker position={[value._places_coords.lat, value._places_coords.long]}>
                    <Popup><h4><a href={value.link}>{value.title.raw}</a></h4></Popup>
                </Marker>
            ))
        }
        const selectedCoords = {
            lats: locations_map_filter.map(value => value._places_coords.lat),
            lngs: locations_map_filter.map(value => value._places_coords.long),
        }
        
        const middle = [
            (Math.min(...selectedCoords.lats) + Math.max(...selectedCoords.lats)) / 2,
            (Math.min(...selectedCoords.lngs) + Math.max(...selectedCoords.lngs)) / 2,
        ]

		const handleAddLocation = () => {
			const locations = [ ...attributes.locations ];
			locations.push( {
				id: '',
			} );
			setAttributes( { locations } );
		};
	
		const handleRemoveLocation = ( index ) => {
			const locations = [ ...attributes.locations ];
			locations.splice( index, 1 );
			setAttributes( { locations } );
		};
	
		const handleLocationChange = ( id, index ) => {
			const locations = [ ...attributes.locations ];
			locations[ index ].id = id;
			setAttributes( { locations } );
		};
	
		let locationFields,
			locationDisplay;
	
		if ( attributes.locations.length ) {
			locationFields = attributes.locations.map( ( location, index ) => {
				return <Fragment key={ index }>
                    <IconButton
                        className="grf__remove-location-address"
                        icon="no-alt"
                        label="Delete location"
                        onClick={ () => handleRemoveLocation( index ) }
                    />
                    <SelectControl
                        label="Marqueur"
                        className="places__title-field"
                        options={ places }
						value={ attributes.locations[ index ].id }
						onChange={ ( id ) => handleLocationChange( id, index ) }
                    ></SelectControl>
				</Fragment>;
			} );
	
			locationDisplay = attributes.locations.map( ( location, index ) => {
				return <p key={ index }>{ location.id }</p>;
			} );
        }

        const map_style = {
            height: '500px'
        }
        
		const places_in_attrs = ('places' in attributes) ? attributes.places : new Object
        console.log(posts, places_in_attrs)
        const Places = withState({
			places_checked: Object.assign(new Object, places_in_attrs)
		})( ( { places_checked, setState } ) => (
			<ul>
				{posts.map(post => (
					 <li><CheckboxControl
						className="check_terms"
						label={post.title.raw}
						checked={places_checked[post.id]}
						onChange={( check ) => {
                            console.log(post.id)
							check ? places_checked[post.id] = true : delete places_checked[post.id]
							setAttributes({places: places_checked}) 
							setState({places_checked})
						} }
					/></li>
				) )}
			</ul>
		) )

	
		return [
			<InspectorControls key="1">
				<PanelBody title={ __( 'Places' ) }>
                    <Places></Places>
				</PanelBody>
				<PanelBody title={ __( 'Adresses' ) }>
					{ locationFields }
					<Button
						isDefault
						onClick={ handleAddLocation.bind( this ) }
					>
                    { __( 'Ajouter un marqueur' ) }
					</Button>
				</PanelBody>
			</InspectorControls>,
			<div key="2" className={ className }>
                <Map style={map_style} center={middle} zoom={9}>
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