// Testing attributes
var sw = new Skylink();
var apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';

//sw.setLogLevel(sw.LOG_LEVEL.DEBUG);

// Testing attributes
var valid_apikey = '5f874168-0079-46fc-ab9d-13931c2baa39';
var fake_apikey = 'YES-I-AM-FAKE';
var fake_secret = 'xxxxxxxxxxx';
var default_room = 'DEFAULT';
var fake_roomserver = 'http://test.com';

console.log('API: Tests the provided init() options if results are parsed correctly');
console.log('===============================================================================================');

describe("Test API", function() {

	it('init(): Testing ready state error states', function(done) {
	  
	  this.timeout(5000);

	  var array = [];

	  var io2 = window.io;
	  var adapter2 = RTCPeerConnection;
	  var temp_xhr = XMLHttpRequest;

	  window.io = null;
	  RTCPeerConnection = null;
	  XMLHttpRequest = null;

	  sw.on('readyStateChange', function(state, error) {
	    if (error) {
	      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_SOCKET_IO) {
	        array.push(1);
	        window.io = io2;
	        sw.init(fake_apikey);
	      }
	      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_XMLHTTPREQUEST_SUPPORT) {
	        array.push(2);	        
	        XMLHttpRequest = temp_xhr;
	        sw.init(fake_apikey);
	      }
	      if (error.errorCode === sw.READY_STATE_CHANGE_ERROR.NO_WEBRTC_SUPPORT) {
	        array.push(3);
	        //adapter = require('./../node_modules/adapterjs/source/adapter.js');
	        RTCPeerConnection = adapter2;
	        sw.init(fake_apikey);
	      }
	      if (error.errorCode > 4) {
	        array.push(4);
	      }
	    }
	  });

	  sw.init(fake_apikey, function () {
	    assert.deepEqual(array, [1, 2, 3, 4], 'Ready state errors triggers as it should');
	    sw.off('readyStateChange');
	    done();
	  });
	});

	it('init(): Testing ready state changes when valid API Key is provided', function(done) {
	  this.timeout(15000);

	  var array = [];

	  sw.on('readyStateChange', function(state) {
	    array.push(state);

	    if (state === sw.READY_STATE_CHANGE.COMPLETED) {
	      assert.deepEqual(array, [
	        sw.READY_STATE_CHANGE.INIT,
	        sw.READY_STATE_CHANGE.LOADING,
	        sw.READY_STATE_CHANGE.COMPLETED
	      ], 'Ready state changes are trigged correctly');
	      done();
	    }
	  });

	  sw.init(valid_apikey);

	});

	it('init(): Testing init parsing options', function(done) {

	  this.timeout(10000);

	  var start_date = (new Date()).toISOString();
	  var credentials = 'TEST';

	  var options = {
	    apiKey: fake_apikey,
	    defaultRoom: default_room,
	    roomServer: fake_roomserver,
	    region: sw.REGIONAL_SERVER.APAC1,
	    enableIceTrickle: false,
	    enableDataChannel: false,
	    enableTURNServer: false,
	    enableSTUNServer: false,
	    TURNServerTransport: sw.TURN_TRANSPORT.TCP,
	    credentials: {
	      startDateTime: start_date,
	      duration: 500,
	      credentials: credentials
	    },
	    audioFallback: true,
	    forceSSL: true,
	    socketTimeout: 5500,
	  };

	  sw.init(options);

	  setTimeout(function() {
	    // test options
	    var test_options = {
	      apiKey: sw._apiKey,
	      defaultRoom: sw._defaultRoom,
	      roomServer: sw._roomServer,
	      region: sw._serverRegion,
	      enableIceTrickle: sw._enableIceTrickle,
	      enableDataChannel: sw._enableDataChannel,
	      enableTURNServer: sw._enableTURN,
	      enableSTUNServer: sw._enableSTUN,
	      TURNServerTransport: sw._TURNTransport,
	      credentials: {
	        startDateTime: sw._roomStart,
	        duration: sw._roomDuration,
	        credentials: sw._roomCredentials
	      },
	      audioFallback: sw._audioFallback,
	      forceSSL: sw._forceSSL,
	      socketTimeout: sw._socketTimeout,
	    };
	    // check if matches
	    assert.deepEqual(test_options, options, 'Selected init selected options matches parsed options stored');

	    var pathItems = sw._path.split('?');
	    var url = pathItems[0];
	    var items = pathItems[1].split('&');
	    var checker = {
	      path: fake_roomserver + '/api/' + fake_apikey + '/' + default_room + '/' + start_date + '/' + 500,
	      cred: credentials,
	      rg: sw.REGIONAL_SERVER.APAC1
	    };
	    var passes = {
	      path: false,
	      cred: false,
	      rg: false,
	      rand: false
	    }

	    var i;

	    for (i = 1; i < items.length; i += 1) {
	      var subItems = items[i].split('=');

	      if (subItems[0] === 'rand') {
	        passes.rand = !!subItems[1];

	      } else {
	        passes[subItems[0]] = subItems[1] === checker[subItems[0]];
	      }
	    }

	    // check path
	    passes.path = checker.path === url;

	    assert.deepEqual(passes, {
	      path: true,
	      cred: true,
	      rg: true,
	      rand: true
	    }, 'API path string is formatted correctly');
	    done();
	  }, 1000);
	});

	it('init(): Testing to a fallback default room when it is not provided', function(done) {
	  this.timeout(5000);

	  sw.init(fake_apikey);

	  setTimeout(function() {
	    // check if matches
	    assert.deepEqual(sw._defaultRoom, fake_apikey, 'Fallbacks to the API Key as defaultRoom when it is not provided');
	    done();
	  }, 1000);
	});

});







