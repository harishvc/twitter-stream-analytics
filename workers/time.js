var moment = require('moment');
var moment2 = require('moment-timezone');

exports.t = function(when,format){
	if ((when == "now") && (format != "valueof")){
		return (moment().zone(+8).format(format));
	}
	else if ((when == "now") && (format == "valueof")){
		return (moment().valueOf());
	}
	else if ((when != "now") && (format == "valueof")){
		return (moment(parseInt(when)).valueOf());
	}
	else if ((when != "now") && (format != "valueof")){
		return (moment(parseInt(when)).zone(+8).format(format));
	}
};

exports.twitter = function(when){
	return (moment.utc(when).valueOf());
};

exports.f = function(start,end){
	return (moment(parseInt(start)).from(parseInt(end)));
};

exports.tz = function(when,format,tz){	
	if ((when == "now") && (format != "valueof")){
		return (moment2().tz(tz).format(format));
	}
};
