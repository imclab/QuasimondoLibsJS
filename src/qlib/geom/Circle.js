/*
* Circle
*
* Copyright (c) 2013 Mario Klingemann
* 
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
* 
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

// namespace:
this.qlib = this.qlib||{};

(function() {


	var Circle = function() {
	  this.initialize(arguments);
	}

	var p = Circle.prototype = new qlib.GeometricShape();
	
// public properties:
    p.type = "Circle";
	
	// constructor:
	/** 
	 * Initialization method.
	 * @method initialize
	 * @protected
	*/
	p.initialize = function( args ) {
		this.drawingSegments = 6;
		this.startAngle = 0;
		this.endAngle = 0;
	
		if ( typeof args[0] == "number" )
		{		
			//arguments: center x, center y, r
			this.c = new qlib.Vector2( args[0], args[1] );
			this.r 	 = (args[2] == null ? 0 : args[2]);
		} else {
			//arguments: center,r
			this.c = args[0];
			this.r = (args[1] == null ? 0 : args[1]);
		}
	}
	
// public methods:


	p.translate = function( p )
	{
		this.c.plus( p );
		return this;
	}
	
	p.scale = function( factor, center )
	{
		if ( center == null ) center = this.c.getClone();
		this.c.minus( center ).multiply( factor ).plus( center );
		this.r *= factor;
		return this;
	}
	
	p.rotate = function( angle, center )
	{
		if ( center == null ) center = this.c.getClone();
		this.c.rotateAround( angle, center );
		return this;
	}
	
	p.touches = function( circle )
	{
		return Math.abs(this.c.distanceToVector(circle.c) - (this.r + circle.r)) < 0.0000001;
	}

	/**
	 * Returns a clone of the Circle instance.
	 * @method clone
	 * @return {Circle} a clone of the Circle instance.
	 **/
	p.clone = function( deepClone ) {
		if ( deepClone == true )
			return new Circle( this.x, this.y, this.r );
		else 
			return new Circle( this.c, this.r );
	}
	
	p.draw = function( canvas )
	{
		if ( isNaN(this.r) || this.r < 0 ) return;
			
		var x1, y1, grad, segm;
		var s1 = this.startAngle;
		var s2 = this.endAngle;
		var sgm = this.drawingSegments;
		var rad =  Math.PI / 180;
		
		if (s1 == s2) 
		{
			canvas.moveTo( this.c.x + this.r, this.c.y);
			canvas.drawCircle( this.c.x, this.c.y, this.r );
			return;
		} else 
		{
			s1>s2 ? s1 -= 360 : "";
			x1 = this.r * Math.cos(s1*rad)+this.c.x;
			y1 = this.r * Math.sin(s1*rad)+this.c.y;
			grad = s2-s1;
			segm = grad / sgm;
			canvas.moveTo(this.c.x, this.c.y);
			canvas.lineTo(x1, y1);
		}
		
		for (var s = segm+s1; s<grad+.1+s1; s += segm) 
		{
			var x2 = this.r*Math.cos((s-segm/2)*rad) + this.c.x;
			var y2 = this.r*Math.sin((s-segm/2)*rad) + this.c.y;
			var x3 = this.r*Math.cos(s*rad)+this.c.x;
			var y3 = this.r*Math.sin(s*rad)+this.c.y;
			// begin tnx 2 Robert Penner
			var cx = 2*x2-.5*(x1+x3);
			var cy = 2*y2-.5*(y1+y3);
			canvas.curveTo(cx, cy, x3, y3);
			// end tnx 2 Robert Penner :)
			x1 = x3;
			y1 = y3;
		}
		if (grad != 360) {
			canvas.lineTo(this.c.x, this.c.y);
		}
	}
	
	p.getBoundingRect = function()
	{
		return new qlib.Rectangle( this.c.x - this.r, this.c.y - this.r,this.r*2,this.r*2);
	}

	p.isInside = function( point, includeVertices )
	{
		includeVertices = ( includeVertices == null ? true : includeVertices);
		return includeVertices ? point.squaredDistanceToVector(this.c)<= this.r*this.r : point.squaredDistanceToVector(this.c)< this.r*this.r;
	}
	
	p.circleIsInsideOrIntersects = function( circle )
	{
		return circle.c.squaredDistanceToVector(this.c)<(circle.r+this.r)*(circle.r+this.r);
	}
	
	//http://mathworld.wolfram.com/Polar.html
	/**
	 * returns the inverse Vector2 of the orthoProjection of the center of the circle onto the pole
	 * @param	p0
	 * @param	p1
	 * @return
	 */
	p.inversionPointFromPole = function( p0, p1 )
	{
		
		var ip = this.c.getProject( p0, p1 );
		if ( this.containsPoint( ip ) )return ip;
		return this.inversionPoint( ip );
	}
	
	
	//http://mathworld.wolfram.com/Inversion.html
	/**
	 * find the inverse Vector2 of a Vector2 onto the circle
	 * @param	p
	 * @return
	 */
	p.inversionPoint = function( p )
	{
		var s = this.c.distanceToVector( p );
		var a = this.c.getAngleTo( p );
		var radius = ( this.r * this.r ) / s;
		
		return new qlib.Vector2( this.c.x + Math.cos( a ) * radius,
								 this.c.y + Math.sin( a ) * radius	);
	}
	
	/**
	 * returns a true if the Vector2 is incside the circle, false otherwise
	 * @param	p	
	 * @return
	 */
	p.containsPoint = function( p )
	{
		return this.c.squaredDistanceToVector( p ) < this.r * this.r;
	}
		
	
	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[Circle (c="+this.c.toString()+" r="+this.r+")]";
	}
	
qlib.Circle = Circle;
}());