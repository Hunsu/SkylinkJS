/*! skylinkjs - v1.0.0 - Thu Oct 15 2015 13:13:10 GMT+0800 (SGT) */

var DataChannel = function(channel){
	'use strict';
	var self = this;
	var id = channel.label;
	var reliable = false;
	var readyState = 'connecting';
	var channelType = 'generic';
	var objectRef = channel;

	Event.mixin(this);

	objectRef.onopen = function(event){
		this._trigger('connected', event);
	};

	objectRef.onmessage = function(event){
		this._trigger('message', event);
	};

	objectRef.onclose = function(event){
		this._trigger('disconnected', event);
	};

	objectRef.onerror = function(event){
		this._trigger('error', event);
	};
};

DataChannel.prototype.disconnect = function(){
	var self = this;
	objectRef.close();
}
var Event = {

	on: function(event, callback){
		this.listeners.on[event] = this.listeners.on[event] || [];
    	this.listeners.on[event].push(callback);
		return this;
	},

	off: function(event, callback){

		//Remove all listeners if event is not provided
		if (typeof event === 'undefined'){
			this.listeners.on = {};
			this.listeners.once = {};
		}

		//Remove all callbacks of the specified events if callback is not provided
		if (typeof callback === 'undefined'){
			this.listeners.on[event]=[];
			this.listeners.once[event]=[];
		}

		else{

			//Remove single on callback
			if (this.listeners.on[event]){				
				this._removeListener(this.listeners.on[event], callback);
			}
		
			//Remove single once callback
			if (this.listeners.once[event]){
				this._removeListener(this.listeners.once[event], callback);
			}
		}
		return this;
	},

	once: function(event, callback){
		this.listeners.once[event] = this.listeners.once[event] || [];
    	this.listeners.once[event].push(callback);
		return this;
	},

	_trigger: function(event){
		var args = Array.prototype.slice.call(arguments,1);

		if (this.listeners.on[event]){
			for (var i=0; i<this.listeners.on[event].length; i++) {
		    	this.listeners.on[event][i].apply(this, args);
		    }
		}

		if (this.listeners.once[event]){
			for (var i=0; i<this.listeners.once[event].length; i++){
		    	this.listeners.once[event][i].apply(this, args);
		    	this.listeners.once[event].splice(i,1);
		    	i--;
		    }
		}

		return this;
	},

	_removeListener: function(listeners, listener){
		for (var i=0; i<listeners.length; i++){
			if (listeners[i]===listener){
				listeners.splice(i,1);
				return;
			}
		}
	},

	_mixin: function(object){
		var methods = ['on','off','once','_trigger','_removeListener'];
		for (var i=0; i<methods.length; i++){
			if (Event.hasOwnProperty(methods[i]) ){
				if (typeof object === 'function'){
					object.prototype[methods[i]]=Event[methods[i]];	
				}
				else{
					object[methods[i]]=Event[methods[i]];
				}
			}
		}

		object.listeners = {
			on: {},
			once: {}
		}

		return object;
	}
};
var log = {};

// Parse if debug is not defined
if (typeof window.console.debug !== 'function') {
  window.console.newDebug = window.console.log;

} else {
  window.console.newDebug = window.console.debug;
}

// Parse if trace is not defined
if (typeof window.console.trace !== 'function') {
  window.console.newTrace = window.console.log;

} else {
  window.console.newTrace = window.console.trace;
}

/**
 * The log key
 * @attribute LogKey
 * @type String
 * @readOnly
 * @for Debugger
 * @since 0.5.4
 */
var LogKey = 'Skylink - ';

var Debugger = {
  /**
   * The current log level of Skylink.
   * @property level
   * @type Integer
   * @for Debugger
   * @since 0.5.4
   */
  level: 2,

  trace: false,

  /**
   * The flag that indicates if Skylink should store the debug logs.
   * @property store
   * @type Boolean
   * @for Debugger
   * @since 0.5.4
   */
  store: false,

  logs: [],

  console: {
    log: window.console.log.bind(window.console, LogKey + '%s> %s'),

    error: window.console.error.bind(window.console, LogKey + '%s> %s'),

    info: window.console.info.bind(window.console,
      (window.webrtcDetectedBrowser === 'safari' ? 'INFO: ' : '') + LogKey + '%s> %s'),

    warn: window.console.warn.bind(window.console, LogKey + '%s> %s'),

    debug: window.console.newDebug.bind(window.console,
      (typeof window.console.debug !== 'function' ? 'DEBUG: ' : '') + LogKey + '%s> %s')
  },

  traceTemplate: {
    log: '==LOG== ' + LogKey + '%s',
    error: '==ERROR== ' + LogKey + '%s',
    info: '==INFO== ' + LogKey + '%s',
    warn: '==WARN== ' + LogKey + '%s',
    debug: '==DEBUG== ' + LogKey + '%s'
  },

  applyConsole: function (type) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();

    if (this.store) {
      logs.push(type, args, (new Date()));
    }

    if (this.trace) {
      return window.console.newTrace.bind(window.console, this.traceTemplate[type]);
    }
    return this.console[type];
  },

  setLevel: function (inputLevel) {
    // Debug level
    if (inputLevel > 3) {
      log.debug = this.applyConsole('debug');

    } else {
      log.debug = function () { };
    }

    // Log level
    if (inputLevel > 2) {
      log.log = this.applyConsole('log');

    } else {
      log.log = function () { };
    }

    // Info level
    if (inputLevel > 1) {
      log.info = this.applyConsole('info');

    } else {
      log.info = function () { };
    }

    // Warn level
    if (inputLevel > 0) {
      log.warn = this.applyConsole('warn');

    } else {
      log.warn = function () { };
    }

    // Error level
    if (inputLevel > -1) {
      log.error = this.applyConsole('error');

    } else {
      log.error = function () { };
    }

    this.level = inputLevel;
  },

  configure: function (options) {
    options = options || {};

    // Set if should store logs
    Debugger.store = !!options.store;

    // Set if should trace
    Debugger.trace = !!options.trace;

    // Set log level
    Debugger.setLevel( typeof options.level === 'number' ? options.level : 2 );
  }
};

Debugger.setLevel(4);
var Peer = function (config) {

  /**
   * The Peer ID.
   * @attribute id
   * @type String
   * @readOnly
   * @for Peer
   * @since 1.0.0
   */
  this.id = null;

  /**
   * The Peer custom user data information.
   * @attribute userData
   * @type JSON|String
   * @default null
   * @readOnly
   * @for Peer
   * @since 1.0.0
   */
  this.userData = null;

  /**
   * The Peer privileged status.
   * @attribute privileged
   * @type Boolean
   * @default false
   * @readOnly
   * @for Peer
   * @since 1.0.0
   */
  this.privileged = false;

  /**
   * The Peer agent information.
   * @attribute agent
   * @param agent.name The Peer agent name.
   * @param agent.version The Peer agent version.
   * @param agent.os The Peer agent platform.
   * @type JSON
   * @readOnly
   * @for Peer
   * @since 1.0.0
   */
  this.agent = {
    name: window.webrtcDetectedBrowser,
    version: window.webrtcDetectedVersion,
    os: window.navigator.platform
  };

  /**
   * The Peer RTCPeerConnection object reference.
   * @attribute _connection
   * @type RTCPeerConnection
   * @default null
   * @private
   * @for Peer
   * @since 1.0.0
   */
  this._connection = null;

  /**
   * The list of ICE servers that the RTCPeerConnection should use.
   * @attribute _iceServers
   * @type Array
   * @default null
   * @private
   * @for Peer
   * @since 1.0.0
   */
  this._iceServers = [];


  // Check the passed configuration if they are valid
  if (typeof config !== 'object') {
    throw new Error('Passed Peer configuration is not an object');
  }

  if (typeof config.id !== 'string') {
    throw new Error('Passed Peer ID is not a valid ID (string)');
  }

  // Define object based on passed configuration data
  // The Peer ID - Peer.id
  this.id = config.id;

  // The Peer custom userData - Peer.userData
  this.userData = config.userData || this.userData;

  // The Peer privileged status - Peer.privileged
  if (config.isPrivileged) {
    this.privileged = config.isPrivileged;
  }

  // The Peer ICE servers to use and connect with
  if (config.iceServers) {
    this._iceServers = config.iceServers;
  }

  Event._mixin(this);
};

Peer.prototype._doOffer = function () {
  var self = this;
  self._connection.createOffer(function (offer) {

  }, function (error) {
    throw error;
  });
};

Peer.prototype._doAnswer = function () {

};


Peer.prototype.addStream = function (stream) {

};

Peer.prototype.removeStream = function (streamId) {

};

/**
 * Connects with the Peer and begins and
 * @method _onIceCandidate
 * @param {String} targetMid The Peer ID associated with the ICE
 *   candidate object received.
 * @param {Event} event The event object received in the <code>RTCPeerConnection.
 *   onicecandidate</code> to parse the ICE candidate and determine
 *   if gathering has completed.
 * @trigger candidateGenerationState
 * @private
 * @since 0.1.0
 * @component ICE
 * @for Skylink
 */
Peer.prototype.connect = function () {
  var self = this;
  var peer = new RTCPeerConnection({
    iceServers: self._iceServers
  });


};
var Socket = function () {

  'use strict';

  var self = this;

  // This stream constraints
  self._constraints = null;

  // This stream readyState
  self.readyState = 'constructed';

  // This stream native MediaStream reference
  self._objectRef = null;

  // This stream audio tracks list
  self._audioTracks = [];

  // This stream video tracks list
  self._videoTracks = [];

  // Append events settings in here
  Event.mixin(self);
};
var Stream = function () {

  'use strict';

  var self = this;

  // This stream constraints
  self._constraints = null;

  // This stream readyState
  self.readyState = 'constructed';

  // This stream native MediaStream reference
  self._objectRef = null;

  // This stream audio tracks list
  self._audioTracks = [];

  // This stream video tracks list
  self._videoTracks = [];

  // Append events settings in here
  Event._mixin(self);
};


// getAudioTracks function. Returns AudioStreamTrack objects.
Stream.prototype.getAudioTracks = function () {
  var self = this;

  return self._audioTracks;
};

// getVideoTracks function. Returns VideoStreamTrack objects.
Stream.prototype.getVideoTracks = function () {
  var self = this;

  return self._videoTracks;
};

// stop the stream itself.
Stream.prototype.stop = function () {
  var self = this;

  try {
    self._objectRef.stop();

  } catch (error) {
    // MediaStream.stop is not implemented.
    // Stop all MediaStreamTracks

    var i, j;

    for (i = 0; i < self._audioTracks.length; i += 1) {
      self._audioTracks[i].stop();
    }

    for (j = 0; j < self._videoTracks.length; j += 1) {
      self._videoTracks[j].stop();
    }
  }

  self.readyState = 'stopped';
  self.trigger('stopped', {});
};

// attach the video element with the stream
Stream.prototype.attachStream = function (dom) {
  var self = this;

  // check if IE or Safari
  // muted / autoplay is not supported in the object element
  if (window.webrtcDetectedBrowser === 'safari' ||
    window.webrtcDetectedBrowser === 'IE') {

    // NOTE: hasAttribute is only supported from IE 8 onwards
    if (dom.hasAttribute('muted')) {
      dom.removeAttribute('muted');
    }

    if (dom.hasAttribute('autoplay')) {
      dom.removeAttribute('autoplay');
    }
  }

  window.attachMediaStream(dom, self._objectRef);
};

// append listeners
Stream.prototype._appendListeners = function (mstream) {
  var self = this;

  self._objectRef = mstream;

  var i, j;

  var audioTracks = mstream.getAudioTracks();
  var videoTracks = mstream.getVideoTracks();

  for (i = 0; i < audioTracks.length; i += 1) {
    self._audioTracks[i] = new StreamTrack(audioTracks[i]);
  }

  for (j = 0; j < videoTracks.length; j += 1) {
    self._videoTracks[j] = new StreamTrack(videoTracks[j]);
  }

  self.readyState = 'streaming';
  self.trigger('streaming', {});
};

// initialise the stream object and subscription of events
Stream.prototype.start = function (constraints, mstream) {
  var self = this;

  // we don't manage the parsing of the stream.
  // just your own rtc getUserMedia stuff here :)
  self._constraints = constraints;

  // reset to null if undefined to have a fixed null if empty
  if (typeof self._constraints === 'undefined') {
    self._constraints = null;
  }

  if (typeof mstream === 'object' && mstream !== null) {

    if (typeof mstream.getAudioTracks === 'function' &&
      typeof mstream.getVideoTracks === 'function') {
      self._appendListeners(mstream);
      return;

    } else {
      return Util.throw(new Error('Provided mstream object is not a MediaStream object'));
    }

  } else {

    window.navigator.getUserMedia(self._constraints, function (mstreamrecv) {
      self._appendListeners(mstreamrecv);
    }, function (error) {
      // NOTE: throw is not support for older IEs (ouch)
      return Util.throw(error);
    });
  }
};
var StreamTrack = function (mstrack) {

  'use strict';

  var self = this;

  // The type of track "audio" / "video"
  self.type = mstrack.kind;

  // This track readyState
  self.readyState = 'streaming';

  // This track muted state
  self.muted = !mstrack.enabled;

  // This track native MediaStreamTrack reference
  self._objectRef = null;

  // Append events settings in here
  Event.mixin(self);

  if (typeof mstrack === 'object' && mstrack !== null) {
    self._appendListeners(mstrack);

  } else {
    return Util.throw(new Error('Provided track object is not a MediaStreamTrack object'));
  }
};

// append listeners
StreamTrack.prototype._appendListeners = function (mstrack) {
  var self = this;

  self._objectRef = mstrack;

  setTimeout(function () {
    self.trigger('streaming', {});
  }, 1000);
};

// mute track (enabled)
StreamTrack.prototype.mute = function () {
  var self = this;

  self._objectRef.enabled = false;

  self.muted = true;

  self.trigger('mute', {});
};

// unmute track (enabled)
StreamTrack.prototype.unmute = function () {
  var self = this;

  self._objectRef.enabled = true;

  self.muted = false;

  self.trigger('unmute', {});
};

// stop track
StreamTrack.prototype.stop = function () {
  var self = this;

  try {
    self._objectRef.stop();

  } catch (error) {
    return Util.throw(new Error('The current browser implementation does not ' +
      'support MediaStreamTrack.stop()'));
  }

  self.readyState = 'stopped';
  self.trigger('stopped', {});
};
var Util = {};

// Generates unique ID
Util.generateUUID = function () {
  /* jshint ignore:start */
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0; d = Math.floor(d/16); return (c=='x' ? r : (r&0x7|0x8)).toString(16); }
  );
  return uuid;
  /* jshint ignore:end */
};

// Helps to polyfill IE's unsupported throw.
// If supported throw, if not console error
Util.throwError = function (error) {
  if (window.webrtcDetectedBrowser === 'IE') {
    console.error(error);
    return;
  }
  throw error;
};

