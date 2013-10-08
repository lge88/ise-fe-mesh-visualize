
var CSG = CSG;
var block = block;
var scene = scene;
var createFeMesh = createFeMesh;
var THREE = require( 'three' );

var g2 = new THREE.Object3D();
scene.add( g2 );
g2.translateX( 200 );

var plate = function() {

  var fx = linearMap( [ 0, 200 ] );
  var fy = linearMap( [ 0, 200 ] );
  var fz = linearMap( [ 0, 20 ] );

  var p = block( 20, 20, 20 )
    .applyTransform( function( v ) {
      var x = fx( v.x ), y = fy( v.y ), z = fz( v.z );
      return {
        x: x,
        y: y,
        z: z
      };
    } );

  return p;
}();

var plateView = createFeMesh( plate.toJSON() );
console.log( plate.toJSON() );

g2.add( plateView );

var cylinder = function() {

  var fr = linearMap( [ 0, 100 ] );
  var ftheta = linearMap( [ 0, Math.PI * 2 ] );
  var fh = linearMap( [ -100, 100 ] );

  var c = block( 20, 20, 20 )
    .applyTransform( function( v ) {
      var r = fr( v.x ), theta = ftheta( v.y ), h = fh( v.z );
      return {
        x: Math.cos( theta ) * r,
        y: Math.sin( theta ) * r,
        z: h
      };
    } );

  return c;
}();

var cylinderView = createFeMesh( cylinder.toJSON() );
g2.add( cylinderView );

var sub = subtract( plate, cylinder );
var sv = createFeMesh( sub.toJSON() );
sv.translateY( -400 );
g2.add( sv );
console.log( sub.toJSON() );


function subtract( a, b ) {
  var csga = CSG.fromPolygons( blockToPolygons( a ) );
  var csgb = CSG.fromPolygons( blockToPolygons( b ) );

  var polys = csga.union( csgb ).toPolygons();
  var elements = [], seen = {};

  polys.forEach( function( p ) {
    var el = p.shared.element;
    if ( !seen[ el.id ] ) {
      seen[ el.id ] = el;
      elements.push( el );
    }
  } );

  return blockFromElements( elements );
}

function blockToPolygons( b ) {
  var nodes = flatten( b.nodes ), elements = flatten( b.elements ), dim = b.dim;
  if ( dim < 2 ) { return []; }

  var polygons = [], triangles;
  if ( dim === 2 ) {
    triangles = [
      [ 0, 1, 2 ],
      [ 0, 2, 3 ]
    ];
  } else if ( dim === 3 ) {
    triangles = [
      [ 0, 2, 1 ], [ 0, 3, 2 ],
      [ 4, 5, 7 ], [ 5, 6, 7 ],
      [ 0, 4, 7 ], [ 3, 0, 7 ],
      [ 2, 5, 1 ], [ 2, 6, 5 ],
      [ 3, 7, 6 ], [ 2, 3, 6 ],
      [ 4, 0, 5 ], [ 1, 5, 0 ]
    ];
  }

  elements
    .forEach( function( el ) {
      var vertices = el.nodes.map( function( n ) {
        var pos = new CSG.Vector( n.position );
        typeof pos.z === 'undefined' && ( pos.z = 0 );
        return new CSG.Vertex( pos, [ 0, 0, 0 ] );
      } );
      triangles.forEach( function( t ) {
        var p = new CSG.Polygon( [
          vertices[ t[ 0 ] ],
          vertices[ t[ 1 ] ],
          vertices[ t[ 2 ] ]
        ], { element: el } );
        polygons.push( p );
      } );
    } );

  return polygons;
}

function blockFromElements( elements ) {
  var nodes = [], seen = {};

  elements.forEach( function( el ) {
    el.nodes.forEach( function( n ) {
      if ( !seen[ n.id ] ) {
        seen[ n.id ] = n;
        nodes.push( n );
      }
    } );
  } );

  return new block.FeBlock( nodes, elements );
}

function flatten( tree, shallow, list ) {
  list || ( list = [] );
  tree.forEach( function( el ) {
    if ( Array.isArray( el ) ) {
      shallow ?
        el.forEach( function( x ) { list.push( x ); } ) :
      flatten( el, false, list );
    } else {
      list.push( el );
    }
  } );
  return list;
}
