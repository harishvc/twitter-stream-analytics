	var socket = io.connect(window.location.hostname);
	socket.on("time", function(data) {
		$("#" + data.key).html(data.count);
	});
       socket.emit('chart', { type: 'NONE' });
