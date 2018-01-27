/**
 *@method randi
 *@param {Number} val1 Max generated value or min value if val2 defined
 *@param {Number} val2 Max generated value or undefined
 *@return {Number} Nonfractional [0, val1] or [val1, val2]
 */
function randi(val1, val2) {
	if(val2 == undefined)
		return Math.round(Math.random() * val1);
	else
		return randiRange(val1, val2)
}

function randiRange(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}
/**
 *@method randf
 *@param {Number} max Max generated value
 *@return {Number} Fractional [0, max]
 */
function randf(max) {
	return Math.random() * max;
}

function randfRange(min, max) {
	return Math.random() * (max - min) + min;
}

/**
 * @brief random element from array
 *
 * @Param array inpu array
 *
 * @Returns empty array if input array empty or not array; or rand element if not
 */
function randElem(array) {
	if (array && array.length && Array.isArray(array))
		return array[randi(array.length - 1)];
	else
		return null;
}

Math.lerp = function(from, to, weight) {
	var mu2;

	mu2 = (1 - Math.cos(weight * Math.PI)) / 2;
	return (from * (1 - mu2) + to * mu2);
}

Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
};

function CosineInterpolate(y1, y2, mu)
{
   var mu2;
   mu2 = (1-Math.cos(mu*Math.PI))/2;
   return(y1*(1-mu2)+y2*mu2);
}
function LinearInterpolate(y1, y2, mu)
{
   return(y1*(1-mu)+y2*mu);
}
