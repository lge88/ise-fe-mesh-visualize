
var ISEViewport = require( 'ise-viewport' );
var EditorControls = require( 'ise-editor-controls' );
var createFeMesh = require( 'ise-fe-mesh-visualize' ).createFeMesh;
var THREE = require( 'three' );
var viewport = ISEViewport();
var scene = viewport.scene;
var controls = EditorControls( viewport.camera, viewport.container );
var block = block;

var g1 = new THREE.Object3D();
scene.add( g1 );
var f1 = linearMap( [0,1], [0,Math.PI*2] );
var b1 = block( 30 )
      .applyTransform( function( p ) {
        p.y = Math.sin( f1( p.x ) );
        return p;
      } );

var fem1 = createFeMesh( b1.toJSON() );
fem1.scale.multiplyScalar( 100 );
fem1.translateY( 200 );
fem1.translateX( -100 );
g1.add( fem1 );

var b2 = block( 100, 10 )
      .applyTransform( function( p ) {
        var coord = {};
        theta = p.x * Math.PI * 2;
        r = 0.2 + 0.8 * p.y;
        coord.x = r * Math.cos( theta );
        coord.y = r * Math.sin( theta );
        coord.z = r;
        return coord;
      } );

var fem2 = createFeMesh( b2.toJSON() );
fem2.scale.multiplyScalar( 200 );
fem2.translateX( -200 );
fem2.translateY( -200 );
fem2.rotateX( Math.PI );
g1.add( fem2 );

var b3 = block( 10, 10, 10 );
var fem3 = createFeMesh( b3.toJSON() );
fem3.scale.multiplyScalar( 200 );
fem3.translateX( 300 );
fem3.translateY( -200 );
g1.add( fem3 );

// b3.applyTransform( function( p ) {
//   var coord = {};
//   theta = p.x * Math.PI * 2;
//   r = p.y;
//   coord.x = r * Math.cos( theta );
//   coord.y = r * Math.sin( theta );
//   coord.z = p.z;
//   return coord;
// } );

// var fem4 = createFeMesh( b3.toJSON() );
// fem4.scale.multiplyScalar( 200 );
// fem4.translateX( 300 );
// fem4.translateY( -200 );
// viewport.scene.add( fem4 );

function linearMap( range1, range2 ) {
  if ( !range2 ) {
    range2 = range1;
    range1 = [ 0, 1 ];
  }
  var a = range1[0];
  var b = range2[0];
  var d1 = range1[1] - range1[0];
  var d2 = range2[1] - range2[0];
  return function( x ) {
    return b + ( x - a ) * d2 / d1;
  }
}

var f1 = linearMap( [0,1], [-Math.PI/2, Math.PI/2] );
var f2 = linearMap( [0,1], [0,2*Math.PI] );
var f3 = linearMap( [0,1], [0.2,1] );

fem3.vertices.forEach( function( v ) {
  var r = f3( v.x ), theta = f1( v.y ), beta = f2( v.z );
  v.x = r * Math.cos( theta )*Math.cos( beta );
  v.y = r * Math.cos( theta )*Math.sin( beta );
  v.z = r * Math.sin( theta );
  return v;
} );

g1.translateX( -500 );
