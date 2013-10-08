
var ISEViewport = require( 'ise-viewport' );
var EditorControls = require( 'ise-editor-controls' );
var createFeMesh = require( 'ise-fe-mesh-visualize' ).createFeMesh;

var viewport = ISEViewport();
var controls = EditorControls( viewport.camera, viewport.container );

var ex2 = block2d(
  { x: -400, y: -200 },
  { x: 100, y: -250 },
  { x: 200, y: 300 },
  { x: -300, y: 150 },
  30,
  30
);

var fem2 = createFeMesh( ex2 );
viewport.scene.add( fem2 );

function block2d( p1, p2, p3, p4, nx, ny ) {
  var arrgen = require( 'arr-gen' );
  var flatten = require( 'flatten' );
  function lerp( p1, p2, r ) {
    var x1= p1.x, x2 = p2.x, y1 = p1.y, y2 = p2.y;
    return { x: x1+(x2-x1)*r, y: y1+(y2-y1)*r };
  }

  nx || ( nx = 10 ), ny || ( ny = 10 );

  var id = 1;
  var nodes = arrgen( nx + 1, ny + 1, function( i, j ) {
    var a = lerp( p1, p4, j/ny );
    var b = lerp( p2, p3, j/ny );
    return { id: id++, position: lerp( a, b, i/nx ) };
  } );

  var id = 1;
  var elements = arrgen( nx, ny, function( i, j ) {
    var n1 = nodes[ i ][ j ].id, n2 = nodes[ i+1 ][ j ].id;
    var n3 = nodes[ i+1 ][ j+1 ].id, n4 = nodes[ i ][ j+1 ].id;
    return { id: id++, type: 'quad', nodes_id: [ n1, n2, n3, n4 ] };
  } );

  return { nodes: flatten( nodes ), elements: flatten( elements ) };
}
