
var parser = require( 'uglify-js' ).parser,
    uglify = require( 'uglify-js' ).uglify,
    fs     = require( 'fs' ),
    src    = '../src/backbone-eventbroker.js',
    built  = '../backbone-eventbroker-min.js';

var _build = function()
{
	console.log( 'Loading  ' + src );
	
	fs.readFile( src, 'utf8', function ( error, data )
	{
	    if ( error ) {
		    return console.log( 'Error' + error );
	    } 
	    _write( _minify( data ) ); 
	});
};

var _minify = function( source )
{
	var ast = uglify.ast_squeeze( uglify.ast_mangle( parser.parse( source ) ) );
	return uglify.gen_code( ast );
};

var _write = function( min )
{
	fs.writeFile( built, min, function( error ) {
		if ( error ) {
	    	return console.log( 'Error' + error );
		}
		console.log( 'Minified ' + built + '\nDone' );
	});
};
_build();