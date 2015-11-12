var inited = false;

module.exports = function(RED) {
	if (!inited) {
		inited = true;
		init(RED.server, RED.httpAdmin, RED.log);
	}
	
	return { add: add, emit: emit }
};

var serveStatic = require('serve-static'),
	socketio = require('socket.io'),
	path = require('path'),
	events = require('events'),
	config = require('../config');

config.path = config.path || "/ui";
	
var homeTab = {
	header: config.defaultTabHeader,
	icon: config.defaultTabIcon,
	items: []
};

var updateValueEventName = 'update-value';

var io = undefined;
var controlValues = {};
var ev = new events.EventEmitter();

function emit(event, data) {
	io.emit(event, data);
}

function dummyConverter(value) {
	return value;
}

function add(node, group, control, converter) {
	converter = converter || dummyConverter;
	var remove = addControl(group, control);
	control.id = node.id;
	
	node.on("input", function(msg) {
		var converted = converter(msg.payload);
		controlValues[node.id] = converted;
		
		io.emit(updateValueEventName, {
			id: node.id,
			value: converted
		});
	});
	
	var handler = function (msg) {
		if (msg.id !== node.id) return;
		
		node.send({payload: msg.value});
		controlValues[msg.id] = msg.value;
		
		//fwd event
		io.emit(updateValueEventName, msg);
	};
	
	ev.on(updateValueEventName, handler);
	
	return function() {
		ev.removeListener(updateValueEventName, handler);
		remove();
	}
}

function init(server, app, log) {	
	io = socketio(server, {path: config.path + '/socket.io'});
	app.use(config.path, serveStatic(path.join(__dirname, "public")));

	var vendor_packages = ['angular', 'angular-animate', 'angular-aria', 'angular-material', 'angular-material-icons'];
	vendor_packages.forEach(function (packageName) {
		app.use(config.path + '/vendor/' + packageName, serveStatic(path.join(__dirname, '../node_modules/', packageName)));
	});

	log.info("UI started at " + config.path);

	io.on('connection', function(socket) {
		updateUi(socket);
		
		socket.on(updateValueEventName, 
			ev.emit.bind(ev, updateValueEventName));
		
		socket.on('ui-replay-state', function() {
			var ids = Object.getOwnPropertyNames(controlValues);
			ids.forEach(function (id) {
				socket.emit(updateValueEventName, {
					id: id,
					value: controlValues[id]
				})
			});
			
			socket.emit('ui-replay-done');
		});
	});
}

var updateUiPending = false;
function updateUi(to) {
	if (!to) {
		if (updateUiPending) return; 
		updateUiPending = true;
		to = io;
	}

	process.nextTick(function() {
		to.emit('ui-controls', {
			title: config.title,
			tabs: [homeTab]
		});
		updateUiPending = false;
	});
}

function findGroup(header) {
	for (var j=0; j<homeTab.items.length; j++) {
		var group = homeTab.items[j];
		if (group.header === header) 
			return group;
	}
}

function addControl(groupHeader, control) {
	if (typeof control.type !== 'string') return;
	groupHeader = groupHeader || config.defaultGroupHeader;
	
	var group = findGroup(groupHeader);
	if (!group) {
		group = {
			header: groupHeader,
			items: []
		}
		homeTab.items.push(group);
	}
	group.items.push(control);
	
	updateUi();
	
	return function() {
		var index = group.items.indexOf(control);
		if (index >= 0) {
			group.items.splice(index, 1);
			
			if (group.items.length === 0) {
				index = homeTab.items.indexOf(group);
				if (index >= 0) {
					homeTab.items.splice(index, 1);
				}
			}
			
			updateUi();
		}
	}
}
