
var THREE = require( 'three' );
var _ = require( 'underscore' );

exports.createFeMesh = function( feModel, options ) {
  return new FeBlockView( feModel, options );
};

var gcellTypes = [
  {
    type: 'P', nn: 1
  },
  {
    type: 'L2', nn: 2,
    lines: [
      [ 0, 1 ]
    ]
  },
  {
    type: 'T3', nn: 3,
    lines: [
      [ 0, 1 ], [ 1, 2 ], [ 2, 0 ]
    ],
    triangles: [
      [ 0, 1, 2 ]
    ]
  },
  {
    type: 'Q4', nn: 4,
    lines: [
      [ 0, 1 ], [ 1, 2 ], [ 2, 3 ], [ 3, 0 ]
    ],
    triangles: [
      [ 0, 1, 2 ], [ 0, 2, 3 ]
    ]
  },
  {
    type: 'H8', nn: 8,
    lines: [
      [ 0, 1 ], [ 1, 2 ], [ 2, 3 ], [ 3, 0 ],
      [ 0, 4 ], [ 1, 5 ], [ 2, 6 ], [ 3, 7 ],
      [ 4, 5 ], [ 5, 6 ], [ 6, 7 ], [ 7, 4 ]
    ],
    triangles: [
      [ 0, 2, 1 ], [ 0, 3, 2 ],
      [ 4, 5, 7 ], [ 5, 6, 7 ],
      [ 0, 4, 7 ], [ 3, 0, 7 ],
      [ 2, 5, 1 ], [ 2, 6, 5 ],
      [ 3, 7, 6 ], [ 2, 3, 6 ],
      [ 4, 0, 5 ], [ 1, 5, 0 ]
    ]
  },
];

var elementTypes = [
  { type: 'truss', gcell: 'L2' },
  { type: 'elasticBeamColumn', gcell: 'L2' },
  { type: 'nonlinearBeamColumn', gcell: 'L2' },
  { type: 'quad', gcell: 'Q4' },
  { type: 'tri31', gcell: 'T3' },
  { type: 'stdBrick', gcell: 'H8' }
];

var visualMaterials = [
  {
    id: 'pb-red',
    type: 'ParticleBasicMaterial',
    color: 'red',
    size: 4,
    sizeAttenuation: false
  },
  {
    id: 'lb-blue',
    type: 'LineBasicMaterial',
    color: 'blue',
    lineWidth: 1
  },
  {
    id: 'mb-grey',
    type: 'MeshBasicMaterial',
    color: 'grey'
  }
];

visualMaterials = visualMaterials
  .map( function( m ) {
    return [ m.id, new THREE[ m.type ]( _.omit( m, 'id', 'type' ) ) ];
  } )
  .reduce( function( o, m ) {
    o[ m[ 0 ] ] = m[ 1 ];
    return o;
  }, {} );

function FeBlockView( feb, options ) {
  THREE.Object3D.call( this );
  options || ( options = {} );

  this.model = feb;
  this.build( options );
  return this;
}
FeBlockView.prototype = Object.create( THREE.Object3D.prototype );
FeBlockView.prototype.constructor = FeBlockView;

FeBlockView.prototype.build = function( options ) {
  options || ( options = {} );
  delete this.particles;
  delete this.wireframe;
  delete this.surface;

  var vertexMaterial = options.vertexMaterial || visualMaterials[ 'pb-red' ];
  var particles = new THREE.ParticleSystem( new THREE.Geometry, vertexMaterial );
  var nodes = this.model.nodes;
  var nidMap = {};
  var vertices = nodes.map( function( n, ind ) {
    var pos = n.position;
    var vec = new THREE.Vector3( pos.x || 0.0, pos.y || 0.0, pos.z || 0.0 );
    nidMap[ n.id ] = { vector: vec, index: ind };
    return vec;
  } );

  var lineMaterial = options.lineMaterial || visualMaterials[ 'lb-blue' ];
  var surfaceMaterial = options.surfaceMaterial || visualMaterials[ 'mb-grey' ];
  var wire = new THREE.Line( new THREE.Geometry, lineMaterial, THREE.LinePieces );
  var surface = new THREE.Mesh( new THREE.Geometry, surfaceMaterial );
  var wireVertices = [];
  var faces = [];
  var elements = this.model.elements;

  elements.forEach( function( el ) {
    var nodes = el.nodes_id.map( function( nid ) {
      return nidMap[ nid ];
    } );
    var gcellType = _.findWhere( elementTypes, { type: el.type } ).gcell;
    var gcell = _.findWhere( gcellTypes, { type: gcellType } );
    var lines = gcell.lines;
    var triangles = gcell.triangles;

    if ( Array.isArray( lines ) ) {
      lines.forEach( function( l ) {
        wireVertices.push(
          nodes[ l[ 0 ] ].vector,
          nodes[ l[ 1 ] ].vector
        );
      } );
    }

    if ( Array.isArray( triangles ) ) {
      triangles.forEach( function( t ) {
        faces.push(
          new THREE.Face3(
            nodes[ t[ 0 ] ].index,
            nodes[ t[ 1 ] ].index,
            nodes[ t[ 2 ] ].index
          )
        );
      } );
    }
  } );

  this.vertices = vertices;
  particles.geometry.vertices = vertices;
  this.particles = particles;
  this.add( particles );

  wire.geometry.vertices = wireVertices;
  this.wireframe = wire;
  this.add( wire );

  surface.geometry.vertices = vertices;
  surface.geometry.faces = faces;
  this.surface = surface;
  this.add( surface );
}
