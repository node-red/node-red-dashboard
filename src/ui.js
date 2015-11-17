var inited = false;

module.exports = function(RED) {
	if (!inited) {
		inited = true;
		init(RED.server, RED.httpAdmin, RED.log, RED.settings);
	}
	
	return { add: add, emit: emit };
};

var serveStatic = require('serve-static'),
	socketio = require('socket.io'),
	path = require('path'),
	events = require('events'),
	config = require('../config');

config.path = config.path || "/ui";
	
var tabs = [];

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

function add(node, tab, group, control, converter) {
	converter = converter || dummyConverter;
	var remove = addControl(tab, group, control);
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
	};
}

//from: http://stackoverflow.com/a/28592528/3016654
function join() {
	var trimRegex = new RegExp('^\\/|\\/$','g'),
	paths = Array.prototype.slice.call(arguments);
	return '/'+paths.map(function(e){return e.replace(trimRegex,"");}).filter(function(e){return e;}).join('/');
}

function init(server, app, log, settings) {
	var fullPath = join(settings.httpAdminRoot, config.path);
	var socketIoPath = join(fullPath, 'socket.io');
	
	io = socketio(server, {path: socketIoPath});
	app.use(config.path, serveStatic(path.join(__dirname, "public")));

	var vendor_packages = [
		'angular', 'angular-sanitize', 
		'angular-animate', 'angular-aria', 
		'angular-material', 'angular-material-icons'
	];
	
	vendor_packages.forEach(function (packageName) {
		app.use(config.path + '/vendor/' + packageName, serveStatic(path.join(__dirname, '../node_modules/', packageName)));
	});

	log.info("UI started at " + fullPath);

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
			tabs: tabs
		});
		updateUiPending = false;
	});
}

function find(array, predicate) {
	for (var i=0; i<array.length; i++) {
		if (predicate(array[i]))
			return array[i];
	}
}

function addControl(tab, groupHeader, control) {
	if (typeof control.type !== 'string') return;
	groupHeader = groupHeader || config.defaultGroupHeader;
	
	var foundTab = find(tabs, function (t) {return t.id === tab.id });
	if (!foundTab) {
		foundTab = {
			id: tab.id,
			header: tab.config.name,
			order: tab.config.order,
			icon: tab.config.icon,
			items: []
		};
		tabs.push(foundTab);
		tabs.sort(function (t1, t2) {return t1.order - t2.order;});
	}
	
	var foundGroup = find(foundTab.items, function (g) {return g.header === groupHeader;});
	if (!foundGroup) {
		foundGroup = {
			header: groupHeader,
			items: []
		};
		foundTab.items.push(foundGroup);
	}
	foundGroup.items.push(control);
	
	updateUi();
	
	return function() {
		var index = foundGroup.items.indexOf(control);
		if (index >= 0) {
			foundGroup.items.splice(index, 1);
			
			if (foundGroup.items.length === 0) {
				index = foundTab.items.indexOf(foundGroup);
				if (index >= 0) {
					foundTab.items.splice(index, 1);
					
					if (foundTab.items.length === 0) {
						index = tabs.indexOf(foundTab);
						if (index >= 0) {
							tabs.splice(index, 1);
						}
					}
				}
			}
			
			updateUi();
		}
	}
}
