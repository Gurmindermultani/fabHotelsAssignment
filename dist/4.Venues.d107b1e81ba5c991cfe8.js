webpackJsonp([4],{

/***/ 618:
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(619), __esModule: true };

/***/ },

/***/ 619:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(338);
	__webpack_require__(310);
	__webpack_require__(322);
	__webpack_require__(620);
	module.exports = __webpack_require__(263).Promise;

/***/ },

/***/ 620:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY            = __webpack_require__(313)
	  , global             = __webpack_require__(262)
	  , ctx                = __webpack_require__(264)
	  , classof            = __webpack_require__(621)
	  , $export            = __webpack_require__(261)
	  , isObject           = __webpack_require__(269)
	  , aFunction          = __webpack_require__(265)
	  , anInstance         = __webpack_require__(622)
	  , forOf              = __webpack_require__(623)
	  , speciesConstructor = __webpack_require__(627)
	  , task               = __webpack_require__(628).set
	  , microtask          = __webpack_require__(630)()
	  , PROMISE            = 'Promise'
	  , TypeError          = global.TypeError
	  , process            = global.process
	  , $Promise           = global[PROMISE]
	  , process            = global.process
	  , isNode             = classof(process) == 'process'
	  , empty              = function(){ /* empty */ }
	  , Internal, GenericPromiseCapability, Wrapper;
	
	var USE_NATIVE = !!function(){
	  try {
	    // correct subclassing with @@species support
	    var promise     = $Promise.resolve(1)
	      , FakePromise = (promise.constructor = {})[__webpack_require__(321)('species')] = function(exec){ exec(empty, empty); };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch(e){ /* empty */ }
	}();
	
	// helpers
	var sameConstructor = function(a, b){
	  // with library wrapper special case
	  return a === b || a === $Promise && b === Wrapper;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var newPromiseCapability = function(C){
	  return sameConstructor($Promise, C)
	    ? new PromiseCapability(C)
	    : new GenericPromiseCapability(C);
	};
	var PromiseCapability = GenericPromiseCapability = function(C){
	  var resolve, reject;
	  this.promise = new C(function($$resolve, $$reject){
	    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject  = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject  = aFunction(reject);
	};
	var perform = function(exec){
	  try {
	    exec();
	  } catch(e){
	    return {error: e};
	  }
	};
	var notify = function(promise, isReject){
	  if(promise._n)return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function(){
	    var value = promise._v
	      , ok    = promise._s == 1
	      , i     = 0;
	    var run = function(reaction){
	      var handler = ok ? reaction.ok : reaction.fail
	        , resolve = reaction.resolve
	        , reject  = reaction.reject
	        , domain  = reaction.domain
	        , result, then;
	      try {
	        if(handler){
	          if(!ok){
	            if(promise._h == 2)onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if(handler === true)result = value;
	          else {
	            if(domain)domain.enter();
	            result = handler(value);
	            if(domain)domain.exit();
	          }
	          if(result === reaction.promise){
	            reject(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(result)){
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch(e){
	        reject(e);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if(isReject && !promise._h)onUnhandled(promise);
	  });
	};
	var onUnhandled = function(promise){
	  task.call(global, function(){
	    var value = promise._v
	      , abrupt, handler, console;
	    if(isUnhandled(promise)){
	      abrupt = perform(function(){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if(abrupt)throw abrupt.error;
	  });
	};
	var isUnhandled = function(promise){
	  if(promise._h == 1)return false;
	  var chain = promise._a || promise._c
	    , i     = 0
	    , reaction;
	  while(chain.length > i){
	    reaction = chain[i++];
	    if(reaction.fail || !isUnhandled(reaction.promise))return false;
	  } return true;
	};
	var onHandleUnhandled = function(promise){
	  task.call(global, function(){
	    var handler;
	    if(isNode){
	      process.emit('rejectionHandled', promise);
	    } else if(handler = global.onrejectionhandled){
	      handler({promise: promise, reason: promise._v});
	    }
	  });
	};
	var $reject = function(value){
	  var promise = this;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if(!promise._a)promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function(value){
	  var promise = this
	    , then;
	  if(promise._d)return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if(promise === value)throw TypeError("Promise can't be resolved itself");
	    if(then = isThenable(value)){
	      microtask(function(){
	        var wrapper = {_w: promise, _d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch(e){
	    $reject.call({_w: promise, _d: false}, e); // wrap
	  }
	};
	
	// constructor polyfill
	if(!USE_NATIVE){
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor){
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch(err){
	      $reject.call(this, err);
	    }
	  };
	  Internal = function Promise(executor){
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(631)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail   = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if(this._a)this._a.push(reaction);
	      if(this._s)notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	  PromiseCapability = function(){
	    var promise  = new Internal;
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject  = ctx($reject, promise, 1);
	  };
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
	__webpack_require__(320)($Promise, PROMISE);
	__webpack_require__(632)(PROMISE);
	Wrapper = __webpack_require__(263)[PROMISE];
	
	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    var capability = newPromiseCapability(this)
	      , $$reject   = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
	    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
	    var capability = newPromiseCapability(this)
	      , $$resolve  = capability.resolve;
	    $$resolve(x);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(633)(function(iter){
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , resolve    = capability.resolve
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      var values    = []
	        , index     = 0
	        , remaining = 1;
	      forOf(iterable, false, function(promise){
	        var $index        = index++
	          , alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function(value){
	          if(alreadyCalled)return;
	          alreadyCalled  = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C          = this
	      , capability = newPromiseCapability(C)
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  }
	});

/***/ },

/***/ 621:
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(282)
	  , TAG = __webpack_require__(321)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';
	
	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};
	
	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },

/***/ 622:
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ },

/***/ 623:
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(264)
	  , call        = __webpack_require__(624)
	  , isArrayIter = __webpack_require__(625)
	  , anObject    = __webpack_require__(268)
	  , toLength    = __webpack_require__(285)
	  , getIterFn   = __webpack_require__(626)
	  , BREAK       = {}
	  , RETURN      = {};
	var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator, result;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if(result === BREAK || result === RETURN)return result;
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    result = call(iterator, f, step.value, entries);
	    if(result === BREAK || result === RETURN)return result;
	  }
	};
	exports.BREAK  = BREAK;
	exports.RETURN = RETURN;

/***/ },

/***/ 624:
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(268);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },

/***/ 625:
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(315)
	  , ITERATOR   = __webpack_require__(321)('iterator')
	  , ArrayProto = Array.prototype;
	
	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },

/***/ 626:
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(621)
	  , ITERATOR  = __webpack_require__(321)('iterator')
	  , Iterators = __webpack_require__(315);
	module.exports = __webpack_require__(263).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },

/***/ 627:
/***/ function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(268)
	  , aFunction = __webpack_require__(265)
	  , SPECIES   = __webpack_require__(321)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ },

/***/ 628:
/***/ function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(264)
	  , invoke             = __webpack_require__(629)
	  , html               = __webpack_require__(319)
	  , cel                = __webpack_require__(273)
	  , global             = __webpack_require__(262)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(282)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ },

/***/ 629:
/***/ function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ },

/***/ 630:
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(262)
	  , macrotask = __webpack_require__(628).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(282)(process) == 'process';
	
	module.exports = function(){
	  var head, last, notify;
	
	  var flush = function(){
	    var parent, fn;
	    if(isNode && (parent = process.domain))parent.exit();
	    while(head){
	      fn   = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch(e){
	        if(head)notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if(parent)parent.enter();
	  };
	
	  // Node.js
	  if(isNode){
	    notify = function(){
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver
	  } else if(Observer){
	    var toggle = true
	      , node   = document.createTextNode('');
	    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	    notify = function(){
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if(Promise && Promise.resolve){
	    var promise = Promise.resolve();
	    notify = function(){
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function(){
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }
	
	  return function(fn){
	    var task = {fn: fn, next: undefined};
	    if(last)last.next = task;
	    if(!head){
	      head = task;
	      notify();
	    } last = task;
	  };
	};

/***/ },

/***/ 631:
/***/ function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(266);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ },

/***/ 632:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(262)
	  , core        = __webpack_require__(263)
	  , dP          = __webpack_require__(267)
	  , DESCRIPTORS = __webpack_require__(271)
	  , SPECIES     = __webpack_require__(321)('species');
	
	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },

/***/ 633:
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(321)('iterator')
	  , SAFE_CLOSING = false;
	
	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }
	
	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },

/***/ 637:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _StudioTile = __webpack_require__(638);
	
	var _StudioTile2 = _interopRequireDefault(_StudioTile);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _StudioTile2.default;

/***/ },

/***/ 638:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _StudioTile = __webpack_require__(639);
	
	var _StudioTile2 = _interopRequireDefault(_StudioTile);
	
	var _Divider = __webpack_require__(641);
	
	var _Divider2 = _interopRequireDefault(_Divider);
	
	var _Card = __webpack_require__(643);
	
	var _FlatButton = __webpack_require__(655);
	
	var _FlatButton2 = _interopRequireDefault(_FlatButton);
	
	var _reactRouter = __webpack_require__(190);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var styles = {
	  card: {
	    margin: '30px',
	    cursor: 'pointer',
	    maxWidth: '350px',
	    display: 'inline-block'
	  },
	  cardMediaContainer: {
	    overflow: "hidden",
	    minHeight: '350px',
	    maxHeight: '350px'
	  }
	};
	var StudioTile = function StudioTile(props) {
	  return _react2.default.createElement(
	    'div',
	    null,
	    props.list.map(function (tile, index) {
	      return _react2.default.createElement(
	        _reactRouter.Link,
	        { key: index, to: '/studio/' + index },
	        _react2.default.createElement(
	          _Card.Card,
	          {
	            style: styles.card,
	            className: _StudioTile2.default.cardContainer
	          },
	          _react2.default.createElement(
	            _Card.CardMedia,
	            {
	              style: styles.cardMediaContainer
	            },
	            _react2.default.createElement('img', { src: tile.img, className: _StudioTile2.default.imghover })
	          ),
	          _react2.default.createElement(_Card.CardTitle, { title: tile.title, subtitle: tile.author }),
	          _react2.default.createElement(_Divider2.default, null),
	          _react2.default.createElement(_Card.CardHeader, {
	            title: tile.title,
	            avatar: 'jsa-128.jpg'
	          })
	        )
	      );
	    })
	  );
	};
	
	StudioTile.propTypes = {
	  list: _react2.default.PropTypes.array.isRequired
	};
	
	exports.default = StudioTile;

/***/ },

/***/ 639:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(640);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(576)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(640, function() {
				var newContent = __webpack_require__(640);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 640:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(575)();
	// imports
	
	
	// module
	exports.push([module.id, ".StudioTile__cardContainer___15hPd:hover{box-shadow:0 1px 16px rgba(0,0,0,.117647),0 10px 14px rgba(0,0,0,.117647)!important}.StudioTile__cardContainer___15hPd:hover img{transform:scale(1.05)!important}.StudioTile__cardContainer___15hPd img{transition:all .3s ease-out!important}", "", {"version":3,"sources":["/./src/components/StudioTile/src/components/StudioTile/StudioTile.scss"],"names":[],"mappings":"AAAA,yCACI,mFAAkG,CADtG,6CAGK,+BAAiC,CACjC,uCAIA,qCAAyC,CACzC","file":"StudioTile.scss","sourcesContent":[".cardContainer:hover{\n    box-shadow: rgba(0, 0, 0, 0.117647) 0px 1px 16px, rgba(0, 0, 0, 0.117647) 0px 10px 14px !important;\n    img{\n\t    transform: scale(1.05) !important;\n    }\n}\n.cardContainer{\n    img{\n\t    transition: all 0.3s ease-out !important;\n    }\n}"],"sourceRoot":"webpack://"}]);
	
	// exports
	exports.locals = {
		"cardContainer": "StudioTile__cardContainer___15hPd"
	};

/***/ },

/***/ 641:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;
	
	var _Divider = __webpack_require__(642);
	
	var _Divider2 = _interopRequireDefault(_Divider);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = _Divider2.default;

/***/ },

/***/ 642:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var propTypes = {
	  /**
	   * The css class name of the root element.
	   */
	  className: _react.PropTypes.string,
	  /**
	   * If true, the `Divider` will be indented `72px`.
	   */
	  inset: _react.PropTypes.bool,
	  /**
	   * Override the inline-styles of the root element.
	   */
	  style: _react.PropTypes.object
	};
	
	var defaultProps = {
	  inset: false
	};
	
	var contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	
	var Divider = function Divider(props, context) {
	  var inset = props.inset;
	  var style = props.style;
	
	  var other = _objectWithoutProperties(props, ['inset', 'style']);
	
	  var muiTheme = context.muiTheme;
	  var prepareStyles = muiTheme.prepareStyles;
	
	
	  var styles = {
	    root: {
	      margin: 0,
	      marginTop: -1,
	      marginLeft: inset ? 72 : 0,
	      height: 1,
	      border: 'none',
	      backgroundColor: muiTheme.baseTheme.palette.borderColor
	    }
	  };
	
	  return _react2.default.createElement('hr', _extends({}, other, { style: prepareStyles((0, _simpleAssign2.default)({}, styles.root, style)) }));
	};
	
	Divider.muiName = 'Divider';
	Divider.propTypes = propTypes;
	Divider.defaultProps = defaultProps;
	Divider.contextTypes = contextTypes;
	
	exports.default = Divider;

/***/ },

/***/ 643:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = exports.CardExpandable = exports.CardActions = exports.CardText = exports.CardMedia = exports.CardTitle = exports.CardHeader = exports.Card = undefined;
	
	var _Card2 = __webpack_require__(644);
	
	var _Card3 = _interopRequireDefault(_Card2);
	
	var _CardHeader2 = __webpack_require__(648);
	
	var _CardHeader3 = _interopRequireDefault(_CardHeader2);
	
	var _CardTitle2 = __webpack_require__(651);
	
	var _CardTitle3 = _interopRequireDefault(_CardTitle2);
	
	var _CardMedia2 = __webpack_require__(652);
	
	var _CardMedia3 = _interopRequireDefault(_CardMedia2);
	
	var _CardText2 = __webpack_require__(653);
	
	var _CardText3 = _interopRequireDefault(_CardText2);
	
	var _CardActions2 = __webpack_require__(654);
	
	var _CardActions3 = _interopRequireDefault(_CardActions2);
	
	var _CardExpandable2 = __webpack_require__(645);
	
	var _CardExpandable3 = _interopRequireDefault(_CardExpandable2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.Card = _Card3.default;
	exports.CardHeader = _CardHeader3.default;
	exports.CardTitle = _CardTitle3.default;
	exports.CardMedia = _CardMedia3.default;
	exports.CardText = _CardText3.default;
	exports.CardActions = _CardActions3.default;
	exports.CardExpandable = _CardExpandable3.default;
	exports.default = _Card3.default;

/***/ },

/***/ 644:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _Paper = __webpack_require__(569);
	
	var _Paper2 = _interopRequireDefault(_Paper);
	
	var _CardExpandable = __webpack_require__(645);
	
	var _CardExpandable2 = _interopRequireDefault(_CardExpandable);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Card = function (_Component) {
	  _inherits(Card, _Component);
	
	  function Card() {
	    var _Object$getPrototypeO;
	
	    var _temp, _this, _ret;
	
	    _classCallCheck(this, Card);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Card)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
	      expanded: null
	    }, _this.handleExpanding = function (event) {
	      event.preventDefault();
	      var newExpandedState = !_this.state.expanded;
	      // no automatic state update when the component is controlled
	      if (_this.props.expanded === null) {
	        _this.setState({ expanded: newExpandedState });
	      }
	      if (_this.props.onExpandChange) {
	        _this.props.onExpandChange(newExpandedState);
	      }
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }
	
	  _createClass(Card, [{
	    key: 'componentWillMount',
	    value: function componentWillMount() {
	      this.setState({
	        expanded: this.props.expanded === null ? this.props.initiallyExpanded === true : this.props.expanded
	      });
	    }
	  }, {
	    key: 'componentWillReceiveProps',
	    value: function componentWillReceiveProps(nextProps) {
	      // update the state when the component is controlled.
	      if (nextProps.expanded !== null) this.setState({ expanded: nextProps.expanded });
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var _this2 = this;
	
	      var _props = this.props;
	      var style = _props.style;
	      var containerStyle = _props.containerStyle;
	      var children = _props.children;
	      var expandable = _props.expandable;
	      var expandedProp = _props.expanded;
	      var initiallyExpanded = _props.initiallyExpanded;
	      var onExpandChange = _props.onExpandChange;
	
	      var other = _objectWithoutProperties(_props, ['style', 'containerStyle', 'children', 'expandable', 'expanded', 'initiallyExpanded', 'onExpandChange']);
	
	      var lastElement = void 0;
	      var expanded = this.state.expanded;
	      var newChildren = _react2.default.Children.map(children, function (currentChild) {
	        var doClone = false;
	        var newChild = undefined;
	        var newProps = {};
	        var element = currentChild;
	        if (!currentChild || !currentChild.props) {
	          return null;
	        }
	        if (expanded === false && currentChild.props.expandable === true) return;
	        if (currentChild.props.actAsExpander === true) {
	          doClone = true;
	          newProps.onTouchTap = _this2.handleExpanding;
	          newProps.style = (0, _simpleAssign2.default)({ cursor: 'pointer' }, currentChild.props.style);
	        }
	        if (currentChild.props.showExpandableButton === true) {
	          doClone = true;
	          newChild = _react2.default.createElement(_CardExpandable2.default, { expanded: expanded, onExpanding: _this2.handleExpanding });
	        }
	        if (doClone) {
	          element = _react2.default.cloneElement(currentChild, newProps, currentChild.props.children, newChild);
	        }
	        lastElement = element;
	        return element;
	      }, this);
	
	      // If the last element is text or a title we should add
	      // 8px padding to the bottom of the card
	      var addBottomPadding = lastElement && (lastElement.type.muiName === 'CardText' || lastElement.type.muiName === 'CardTitle');
	
	      var mergedStyles = (0, _simpleAssign2.default)({
	        zIndex: 1
	      }, style);
	      var containerMergedStyles = (0, _simpleAssign2.default)({
	        paddingBottom: addBottomPadding ? 8 : 0
	      }, containerStyle);
	
	      return _react2.default.createElement(
	        _Paper2.default,
	        _extends({}, other, { style: mergedStyles }),
	        _react2.default.createElement(
	          'div',
	          { style: containerMergedStyles },
	          newChildren
	        )
	      );
	    }
	  }]);
	
	  return Card;
	}(_react.Component);
	
	Card.propTypes = {
	  /**
	   * Can be used to render elements inside the Card.
	   */
	  children: _react.PropTypes.node,
	  /**
	   * Override the inline-styles of the container element.
	   */
	  containerStyle: _react.PropTypes.object,
	  /**
	   * If true, this card component is expandable. Can be set on any child of the `Card` component.
	   */
	  expandable: _react.PropTypes.bool,
	  /**
	   * Whether this card is expanded.
	   * If `true` or `false` the component is controlled.
	   * if `null` the component is uncontrolled.
	   */
	  expanded: _react.PropTypes.bool,
	  /**
	   * Whether this card is initially expanded.
	   */
	  initiallyExpanded: _react.PropTypes.bool,
	  /**
	   * Callback function fired when the `expandable` state of the card has changed.
	   *
	   * @param {boolean} newExpandedState Represents the new `expanded` state of the card.
	   */
	  onExpandChange: _react.PropTypes.func,
	  /**
	   * If true, this card component will include a button to expand the card. `CardTitle`,
	   * `CardHeader` and `CardActions` implement `showExpandableButton`. Any child component
	   * of `Card` can implements `showExpandableButton` or forwards the property to a child
	   * component supporting it.
	   */
	  showExpandableButton: _react.PropTypes.bool,
	  /**
	   * Override the inline-styles of the root element.
	   */
	  style: _react.PropTypes.object
	};
	Card.defaultProps = {
	  expandable: false,
	  expanded: null,
	  initiallyExpanded: false
	};
	exports.default = Card;

/***/ },

/***/ 645:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _keyboardArrowUp = __webpack_require__(646);
	
	var _keyboardArrowUp2 = _interopRequireDefault(_keyboardArrowUp);
	
	var _keyboardArrowDown = __webpack_require__(647);
	
	var _keyboardArrowDown2 = _interopRequireDefault(_keyboardArrowDown);
	
	var _IconButton = __webpack_require__(531);
	
	var _IconButton2 = _interopRequireDefault(_IconButton);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function getStyles() {
	  return {
	    root: {
	      top: 0,
	      bottom: 0,
	      right: 4,
	      margin: 'auto',
	      position: 'absolute'
	    }
	  };
	}
	
	var CardExpandable = function (_Component) {
	  _inherits(CardExpandable, _Component);
	
	  function CardExpandable() {
	    _classCallCheck(this, CardExpandable);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(CardExpandable).apply(this, arguments));
	  }
	
	  _createClass(CardExpandable, [{
	    key: 'render',
	    value: function render() {
	      var styles = getStyles(this.props, this.context);
	
	      return _react2.default.createElement(
	        _IconButton2.default,
	        {
	          style: (0, _simpleAssign2.default)(styles.root, this.props.style),
	          onTouchTap: this.props.onExpanding
	        },
	        this.props.expanded ? _react2.default.createElement(_keyboardArrowUp2.default, null) : _react2.default.createElement(_keyboardArrowDown2.default, null)
	      );
	    }
	  }]);
	
	  return CardExpandable;
	}(_react.Component);
	
	CardExpandable.propTypes = {
	  expanded: _react.PropTypes.bool,
	  onExpanding: _react.PropTypes.func.isRequired,
	  style: _react.PropTypes.object
	};
	CardExpandable.contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	exports.default = CardExpandable;

/***/ },

/***/ 646:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _pure = __webpack_require__(558);
	
	var _pure2 = _interopRequireDefault(_pure);
	
	var _SvgIcon = __webpack_require__(567);
	
	var _SvgIcon2 = _interopRequireDefault(_SvgIcon);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var HardwareKeyboardArrowUp = function HardwareKeyboardArrowUp(props) {
	  return _react2.default.createElement(
	    _SvgIcon2.default,
	    props,
	    _react2.default.createElement('path', { d: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z' })
	  );
	};
	HardwareKeyboardArrowUp = (0, _pure2.default)(HardwareKeyboardArrowUp);
	HardwareKeyboardArrowUp.displayName = 'HardwareKeyboardArrowUp';
	HardwareKeyboardArrowUp.muiName = 'SvgIcon';
	
	exports.default = HardwareKeyboardArrowUp;

/***/ },

/***/ 647:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _pure = __webpack_require__(558);
	
	var _pure2 = _interopRequireDefault(_pure);
	
	var _SvgIcon = __webpack_require__(567);
	
	var _SvgIcon2 = _interopRequireDefault(_SvgIcon);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var HardwareKeyboardArrowDown = function HardwareKeyboardArrowDown(props) {
	  return _react2.default.createElement(
	    _SvgIcon2.default,
	    props,
	    _react2.default.createElement('path', { d: 'M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z' })
	  );
	};
	HardwareKeyboardArrowDown = (0, _pure2.default)(HardwareKeyboardArrowDown);
	HardwareKeyboardArrowDown.displayName = 'HardwareKeyboardArrowDown';
	HardwareKeyboardArrowDown.muiName = 'SvgIcon';
	
	exports.default = HardwareKeyboardArrowDown;

/***/ },

/***/ 648:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _Avatar = __webpack_require__(649);
	
	var _Avatar2 = _interopRequireDefault(_Avatar);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function getStyles(props, context) {
	  var card = context.muiTheme.card;
	
	
	  return {
	    root: {
	      padding: 16,
	      fontWeight: card.fontWeight,
	      boxSizing: 'border-box',
	      position: 'relative',
	      whiteSpace: 'nowrap'
	    },
	    text: {
	      display: 'inline-block',
	      verticalAlign: 'top',
	      whiteSpace: 'normal',
	      paddingRight: '90px'
	    },
	    avatar: {
	      marginRight: 16
	    },
	    title: {
	      color: props.titleColor || card.titleColor,
	      display: 'block',
	      fontSize: 15
	    },
	    subtitle: {
	      color: props.subtitleColor || card.subtitleColor,
	      display: 'block',
	      fontSize: 14
	    }
	  };
	}
	
	var CardHeader = function (_Component) {
	  _inherits(CardHeader, _Component);
	
	  function CardHeader() {
	    _classCallCheck(this, CardHeader);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(CardHeader).apply(this, arguments));
	  }
	
	  _createClass(CardHeader, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var actAsExpander = _props.actAsExpander;
	      var avatarProp = _props.avatar;
	      var children = _props.children;
	      var expandable = _props.expandable;
	      var showExpandableButton = _props.showExpandableButton;
	      var style = _props.style;
	      var subtitle = _props.subtitle;
	      var subtitleStyle = _props.subtitleStyle;
	      var textStyle = _props.textStyle;
	      var title = _props.title;
	      var titleStyle = _props.titleStyle;
	
	      var other = _objectWithoutProperties(_props, ['actAsExpander', 'avatar', 'children', 'expandable', 'showExpandableButton', 'style', 'subtitle', 'subtitleStyle', 'textStyle', 'title', 'titleStyle']);
	
	      var prepareStyles = this.context.muiTheme.prepareStyles;
	
	      var styles = getStyles(this.props, this.context);
	
	      var avatar = avatarProp;
	
	      if ((0, _react.isValidElement)(avatarProp)) {
	        avatar = _react2.default.cloneElement(avatar, {
	          style: (0, _simpleAssign2.default)(styles.avatar, avatar.props.style)
	        });
	      } else if (avatar !== null) {
	        avatar = _react2.default.createElement(_Avatar2.default, { src: avatarProp, style: styles.avatar });
	      }
	
	      return _react2.default.createElement(
	        'div',
	        _extends({}, other, { style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)) }),
	        avatar,
	        _react2.default.createElement(
	          'div',
	          { style: prepareStyles((0, _simpleAssign2.default)(styles.text, textStyle)) },
	          _react2.default.createElement(
	            'span',
	            { style: prepareStyles((0, _simpleAssign2.default)(styles.title, titleStyle)) },
	            title
	          ),
	          _react2.default.createElement(
	            'span',
	            { style: prepareStyles((0, _simpleAssign2.default)(styles.subtitle, subtitleStyle)) },
	            subtitle
	          )
	        ),
	        children
	      );
	    }
	  }]);
	
	  return CardHeader;
	}(_react.Component);
	
	CardHeader.muiName = 'CardHeader';
	CardHeader.propTypes = {
	  /**
	   * If true, a click on this card component expands the card.
	   */
	  actAsExpander: _react.PropTypes.bool,
	  /**
	   * This is the [Avatar](/#/components/avatar) element to be displayed on the Card Header.
	   * If `avatar` is an `Avatar` or other element, it will be rendered.
	   * If `avatar` is a string, it will be used as the image `src` for an `Avatar`.
	   */
	  avatar: _react.PropTypes.node,
	  /**
	   * Can be used to render elements inside the Card Header.
	   */
	  children: _react.PropTypes.node,
	  /**
	   * If true, this card component is expandable.
	   */
	  expandable: _react.PropTypes.bool,
	  /**
	   * If true, this card component will include a button to expand the card.
	   */
	  showExpandableButton: _react.PropTypes.bool,
	  /**
	   * Override the inline-styles of the root element.
	   */
	  style: _react.PropTypes.object,
	  /**
	   * Can be used to render a subtitle in Card Header.
	   */
	  subtitle: _react.PropTypes.node,
	  /**
	   * Override the subtitle color.
	   */
	  subtitleColor: _react.PropTypes.string,
	  /**
	   * Override the inline-styles of the subtitle.
	   */
	  subtitleStyle: _react.PropTypes.object,
	  /**
	   * Override the inline-styles of the text.
	   */
	  textStyle: _react.PropTypes.object,
	  /**
	   * Can be used to render a title in Card Header.
	   */
	  title: _react.PropTypes.node,
	  /**
	   * Override the title color.
	   */
	  titleColor: _react.PropTypes.string,
	  /**
	   * Override the inline-styles of the title.
	   */
	  titleStyle: _react.PropTypes.object
	};
	CardHeader.defaultProps = {
	  avatar: null
	};
	CardHeader.contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	exports.default = CardHeader;

/***/ },

/***/ 649:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;
	
	var _Avatar = __webpack_require__(650);
	
	var _Avatar2 = _interopRequireDefault(_Avatar);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = _Avatar2.default;

/***/ },

/***/ 650:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function getStyles(props, context) {
	  var backgroundColor = props.backgroundColor;
	  var color = props.color;
	  var size = props.size;
	  var avatar = context.muiTheme.avatar;
	
	
	  var styles = {
	    root: {
	      color: color || avatar.color,
	      backgroundColor: backgroundColor || avatar.backgroundColor,
	      userSelect: 'none',
	      display: 'inline-flex',
	      alignItems: 'center',
	      justifyContent: 'center',
	      fontSize: size / 2,
	      borderRadius: '50%',
	      height: size,
	      width: size
	    },
	    icon: {
	      color: color || avatar.color,
	      width: size * 0.6,
	      height: size * 0.6,
	      fontSize: size * 0.6,
	      margin: size * 0.2
	    }
	  };
	
	  return styles;
	}
	
	var Avatar = function (_Component) {
	  _inherits(Avatar, _Component);
	
	  function Avatar() {
	    _classCallCheck(this, Avatar);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(Avatar).apply(this, arguments));
	  }
	
	  _createClass(Avatar, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var backgroundColor = _props.backgroundColor;
	      var icon = _props.icon;
	      var src = _props.src;
	      var style = _props.style;
	      var className = _props.className;
	
	      var other = _objectWithoutProperties(_props, ['backgroundColor', 'icon', 'src', 'style', 'className']);
	
	      var prepareStyles = this.context.muiTheme.prepareStyles;
	
	      var styles = getStyles(this.props, this.context);
	
	      if (src) {
	        return _react2.default.createElement('img', _extends({
	          style: prepareStyles((0, _simpleAssign2.default)(styles.root, style))
	        }, other, {
	          src: src,
	          className: className
	        }));
	      } else {
	        return _react2.default.createElement(
	          'div',
	          _extends({}, other, {
	            style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)),
	            className: className
	          }),
	          icon && _react2.default.cloneElement(icon, {
	            color: styles.icon.color,
	            style: (0, _simpleAssign2.default)(styles.icon, icon.props.style)
	          }),
	          this.props.children
	        );
	      }
	    }
	  }]);
	
	  return Avatar;
	}(_react.Component);
	
	Avatar.muiName = 'Avatar';
	Avatar.propTypes = {
	  /**
	   * The backgroundColor of the avatar. Does not apply to image avatars.
	   */
	  backgroundColor: _react.PropTypes.string,
	  /**
	   * Can be used, for instance, to render a letter inside the avatar.
	   */
	  children: _react.PropTypes.node,
	  /**
	   * The css class name of the root `div` or `img` element.
	   */
	  className: _react.PropTypes.string,
	  /**
	   * The icon or letter's color.
	   */
	  color: _react.PropTypes.string,
	  /**
	   * This is the SvgIcon or FontIcon to be used inside the avatar.
	   */
	  icon: _react.PropTypes.element,
	  /**
	   * This is the size of the avatar in pixels.
	   */
	  size: _react.PropTypes.number,
	  /**
	   * If passed in, this component will render an img element. Otherwise, a div will be rendered.
	   */
	  src: _react.PropTypes.string,
	  /**
	   * Override the inline-styles of the root element.
	   */
	  style: _react.PropTypes.object
	};
	Avatar.defaultProps = {
	  size: 40
	};
	Avatar.contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	exports.default = Avatar;

/***/ },

/***/ 651:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function getStyles(props, context) {
	  var card = context.muiTheme.card;
	
	
	  return {
	    root: {
	      padding: 16,
	      position: 'relative'
	    },
	    title: {
	      fontSize: 24,
	      color: props.titleColor || card.titleColor,
	      display: 'block',
	      lineHeight: '36px'
	    },
	    subtitle: {
	      fontSize: 14,
	      color: props.subtitleColor || card.subtitleColor,
	      display: 'block'
	    }
	  };
	}
	
	var CardTitle = function (_Component) {
	  _inherits(CardTitle, _Component);
	
	  function CardTitle() {
	    _classCallCheck(this, CardTitle);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(CardTitle).apply(this, arguments));
	  }
	
	  _createClass(CardTitle, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var actAsExpander = _props.actAsExpander;
	      var children = _props.children;
	      var expandable = _props.expandable;
	      var showExpandableButton = _props.showExpandableButton;
	      var style = _props.style;
	      var subtitle = _props.subtitle;
	      var subtitleColor = _props.subtitleColor;
	      var subtitleStyle = _props.subtitleStyle;
	      var title = _props.title;
	      var titleColor = _props.titleColor;
	      var titleStyle = _props.titleStyle;
	
	      var other = _objectWithoutProperties(_props, ['actAsExpander', 'children', 'expandable', 'showExpandableButton', 'style', 'subtitle', 'subtitleColor', 'subtitleStyle', 'title', 'titleColor', 'titleStyle']);
	
	      var prepareStyles = this.context.muiTheme.prepareStyles;
	
	      var styles = getStyles(this.props, this.context);
	      var rootStyle = (0, _simpleAssign2.default)({}, styles.root, style);
	      var extendedTitleStyle = (0, _simpleAssign2.default)({}, styles.title, titleStyle);
	      var extendedSubtitleStyle = (0, _simpleAssign2.default)({}, styles.subtitle, subtitleStyle);
	
	      return _react2.default.createElement(
	        'div',
	        _extends({}, other, { style: prepareStyles(rootStyle) }),
	        _react2.default.createElement(
	          'span',
	          { style: prepareStyles(extendedTitleStyle) },
	          title
	        ),
	        _react2.default.createElement(
	          'span',
	          { style: prepareStyles(extendedSubtitleStyle) },
	          subtitle
	        ),
	        children
	      );
	    }
	  }]);
	
	  return CardTitle;
	}(_react.Component);
	
	CardTitle.muiName = 'CardTitle';
	CardTitle.propTypes = {
	  /**
	   * If true, a click on this card component expands the card.
	   */
	  actAsExpander: _react.PropTypes.bool,
	  /**
	   * Can be used to render elements inside the Card Title.
	   */
	  children: _react.PropTypes.node,
	  /**
	   * If true, this card component is expandable.
	   */
	  expandable: _react.PropTypes.bool,
	  /**
	   * If true, this card component will include a button to expand the card.
	   */
	  showExpandableButton: _react.PropTypes.bool,
	  /**
	   * Override the inline-styles of the root element.
	   */
	  style: _react.PropTypes.object,
	  /**
	   * Can be used to render a subtitle in the Card Title.
	   */
	  subtitle: _react.PropTypes.node,
	  /**
	   * Override the subtitle color.
	   */
	  subtitleColor: _react.PropTypes.string,
	  /**
	   * Override the inline-styles of the subtitle.
	   */
	  subtitleStyle: _react.PropTypes.object,
	  /**
	   * Can be used to render a title in the Card Title.
	   */
	  title: _react.PropTypes.node,
	  /**
	   * Override the title color.
	   */
	  titleColor: _react.PropTypes.string,
	  /**
	   * Override the inline-styles of the title.
	   */
	  titleStyle: _react.PropTypes.object
	};
	CardTitle.contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	exports.default = CardTitle;

/***/ },

/***/ 652:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function getStyles(props, context) {
	  var cardMedia = context.muiTheme.cardMedia;
	
	
	  return {
	    root: {
	      position: 'relative'
	    },
	    overlayContainer: {
	      position: 'absolute',
	      top: 0,
	      bottom: 0,
	      right: 0,
	      left: 0
	    },
	    overlay: {
	      height: '100%',
	      position: 'relative'
	    },
	    overlayContent: {
	      position: 'absolute',
	      bottom: 0,
	      right: 0,
	      left: 0,
	      paddingTop: 8,
	      background: cardMedia.overlayContentBackground
	    },
	    media: {},
	    mediaChild: {
	      verticalAlign: 'top',
	      maxWidth: '100%',
	      minWidth: '100%',
	      width: '100%'
	    }
	  };
	}
	
	var CardMedia = function (_Component) {
	  _inherits(CardMedia, _Component);
	
	  function CardMedia() {
	    _classCallCheck(this, CardMedia);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(CardMedia).apply(this, arguments));
	  }
	
	  _createClass(CardMedia, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var actAsExpander = _props.actAsExpander;
	      var children = _props.children;
	      var expandable = _props.expandable;
	      var mediaStyle = _props.mediaStyle;
	      var overlay = _props.overlay;
	      var overlayContainerStyle = _props.overlayContainerStyle;
	      var overlayContentStyle = _props.overlayContentStyle;
	      var overlayStyle = _props.overlayStyle;
	      var style = _props.style;
	
	      var other = _objectWithoutProperties(_props, ['actAsExpander', 'children', 'expandable', 'mediaStyle', 'overlay', 'overlayContainerStyle', 'overlayContentStyle', 'overlayStyle', 'style']);
	
	      var prepareStyles = this.context.muiTheme.prepareStyles;
	
	      var styles = getStyles(this.props, this.context);
	      var rootStyle = (0, _simpleAssign2.default)(styles.root, style);
	      var extendedMediaStyle = (0, _simpleAssign2.default)(styles.media, mediaStyle);
	      var extendedOverlayContainerStyle = (0, _simpleAssign2.default)(styles.overlayContainer, overlayContainerStyle);
	      var extendedOverlayContentStyle = (0, _simpleAssign2.default)(styles.overlayContent, overlayContentStyle);
	      var extendedOverlayStyle = (0, _simpleAssign2.default)(styles.overlay, overlayStyle);
	      var titleColor = this.context.muiTheme.cardMedia.titleColor;
	      var subtitleColor = this.context.muiTheme.cardMedia.subtitleColor;
	      var color = this.context.muiTheme.cardMedia.color;
	
	      var styledChildren = _react2.default.Children.map(children, function (child) {
	        return _react2.default.cloneElement(child, {
	          style: prepareStyles((0, _simpleAssign2.default)({}, styles.mediaChild, child.props.style))
	        });
	      });
	
	      var overlayChildren = _react2.default.Children.map(overlay, function (child) {
	        if (child.type.muiName === 'CardHeader' || child.type.muiName === 'CardTitle') {
	          return _react2.default.cloneElement(child, {
	            titleColor: titleColor,
	            subtitleColor: subtitleColor
	          });
	        } else if (child.type.muiName === 'CardText') {
	          return _react2.default.cloneElement(child, {
	            color: color
	          });
	        } else {
	          return child;
	        }
	      });
	
	      return _react2.default.createElement(
	        'div',
	        _extends({}, other, { style: prepareStyles(rootStyle) }),
	        _react2.default.createElement(
	          'div',
	          { style: prepareStyles(extendedMediaStyle) },
	          styledChildren
	        ),
	        overlay ? _react2.default.createElement(
	          'div',
	          { style: prepareStyles(extendedOverlayContainerStyle) },
	          _react2.default.createElement(
	            'div',
	            { style: prepareStyles(extendedOverlayStyle) },
	            _react2.default.createElement(
	              'div',
	              { style: prepareStyles(extendedOverlayContentStyle) },
	              overlayChildren
	            )
	          )
	        ) : ''
	      );
	    }
	  }]);
	
	  return CardMedia;
	}(_react.Component);
	
	CardMedia.propTypes = {
	  /**
	   * If true, a click on this card component expands the card.
	   */
	  actAsExpander: _react.PropTypes.bool,
	  /**
	   * Can be used to render elements inside the Card Media.
	   */
	  children: _react.PropTypes.node,
	  /**
	   * If true, this card component is expandable.
	   */
	  expandable: _react.PropTypes.bool,
	  /**
	   * Override the inline-styles of the Card Media.
	   */
	  mediaStyle: _react.PropTypes.object,
	  /**
	   * Can be used to render overlay element in Card Media.
	   */
	  overlay: _react.PropTypes.node,
	  /**
	   * Override the inline-styles of the overlay container.
	   */
	  overlayContainerStyle: _react.PropTypes.object,
	  /**
	   * Override the inline-styles of the overlay content.
	   */
	  overlayContentStyle: _react.PropTypes.object,
	  /**
	   * Override the inline-styles of the overlay element.
	   */
	  overlayStyle: _react.PropTypes.object,
	  /**
	   * Override the inline-styles of the root element.
	   */
	  style: _react.PropTypes.object
	};
	CardMedia.contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	exports.default = CardMedia;

/***/ },

/***/ 653:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function getStyles(props, context) {
	  var cardText = context.muiTheme.cardText;
	
	
	  return {
	    root: {
	      padding: 16,
	      fontSize: 14,
	      color: props.color || cardText.textColor
	    }
	  };
	}
	
	var CardText = function (_Component) {
	  _inherits(CardText, _Component);
	
	  function CardText() {
	    _classCallCheck(this, CardText);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(CardText).apply(this, arguments));
	  }
	
	  _createClass(CardText, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var actAsExpander = _props.actAsExpander;
	      var children = _props.children;
	      var color = _props.color;
	      var expandable = _props.expandable;
	      var style = _props.style;
	
	      var other = _objectWithoutProperties(_props, ['actAsExpander', 'children', 'color', 'expandable', 'style']);
	
	      var prepareStyles = this.context.muiTheme.prepareStyles;
	
	      var styles = getStyles(this.props, this.context);
	      var rootStyle = (0, _simpleAssign2.default)(styles.root, style);
	
	      return _react2.default.createElement(
	        'div',
	        _extends({}, other, { style: prepareStyles(rootStyle) }),
	        children
	      );
	    }
	  }]);
	
	  return CardText;
	}(_react.Component);
	
	CardText.muiName = 'CardText';
	CardText.propTypes = {
	  /**
	   * If true, a click on this card component expands the card.
	   */
	  actAsExpander: _react.PropTypes.bool,
	  /**
	   * Can be used to render elements inside the Card Text.
	   */
	  children: _react.PropTypes.node,
	  /**
	   * Override the CardText color.
	   */
	  color: _react.PropTypes.string,
	  /**
	   * If true, this card component is expandable.
	   */
	  expandable: _react.PropTypes.bool,
	  /**
	   * Override the inline-styles of the root element.
	   */
	  style: _react.PropTypes.object
	};
	CardText.contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	exports.default = CardText;

/***/ },

/***/ 654:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function getStyles() {
	  return {
	    root: {
	      padding: 8,
	      position: 'relative'
	    },
	    action: {
	      marginRight: 8
	    }
	  };
	}
	
	var CardActions = function (_Component) {
	  _inherits(CardActions, _Component);
	
	  function CardActions() {
	    _classCallCheck(this, CardActions);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(CardActions).apply(this, arguments));
	  }
	
	  _createClass(CardActions, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var actAsExpander = _props.actAsExpander;
	      var children = _props.children;
	      var expandable = _props.expandable;
	      var style = _props.style;
	
	      var other = _objectWithoutProperties(_props, ['actAsExpander', 'children', 'expandable', 'style']);
	
	      var prepareStyles = this.context.muiTheme.prepareStyles;
	
	      var styles = getStyles(this.props, this.context);
	
	      var styledChildren = _react2.default.Children.map(children, function (child) {
	        if (_react2.default.isValidElement(child)) {
	          return _react2.default.cloneElement(child, {
	            style: (0, _simpleAssign2.default)({}, styles.action, child.props.style)
	          });
	        }
	      });
	
	      return _react2.default.createElement(
	        'div',
	        _extends({}, other, { style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)) }),
	        styledChildren
	      );
	    }
	  }]);
	
	  return CardActions;
	}(_react.Component);
	
	CardActions.propTypes = {
	  /**
	   * If true, a click on this card component expands the card.
	   */
	  actAsExpander: _react.PropTypes.bool,
	  /**
	   * Can be used to render elements inside the Card Action.
	   */
	  children: _react.PropTypes.node,
	  /**
	   * If true, this card component is expandable.
	   */
	  expandable: _react.PropTypes.bool,
	  /**
	   * If true, this card component will include a button to expand the card.
	   */
	  showExpandableButton: _react.PropTypes.bool,
	  /**
	   * Override the inline-styles of the root element.
	   */
	  style: _react.PropTypes.object
	};
	CardActions.contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	exports.default = CardActions;

/***/ },

/***/ 655:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;
	
	var _FlatButton = __webpack_require__(656);
	
	var _FlatButton2 = _interopRequireDefault(_FlatButton);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = _FlatButton2.default;

/***/ },

/***/ 656:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _transitions = __webpack_require__(533);
	
	var _transitions2 = _interopRequireDefault(_transitions);
	
	var _childUtils = __webpack_require__(536);
	
	var _colorManipulator = __webpack_require__(358);
	
	var _EnhancedButton = __webpack_require__(535);
	
	var _EnhancedButton2 = _interopRequireDefault(_EnhancedButton);
	
	var _FlatButtonLabel = __webpack_require__(657);
	
	var _FlatButtonLabel2 = _interopRequireDefault(_FlatButtonLabel);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function validateLabel(props, propName, componentName) {
	  if (true) {
	    if (!props.children && props.label !== 0 && !props.label && !props.icon) {
	      return new Error('Required prop label or children or icon was not specified in ' + componentName + '.');
	    }
	  }
	}
	
	var FlatButton = function (_Component) {
	  _inherits(FlatButton, _Component);
	
	  function FlatButton() {
	    var _Object$getPrototypeO;
	
	    var _temp, _this, _ret;
	
	    _classCallCheck(this, FlatButton);
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(FlatButton)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = {
	      hovered: false,
	      isKeyboardFocused: false,
	      touch: false
	    }, _this.handleKeyboardFocus = function (event, isKeyboardFocused) {
	      _this.setState({ isKeyboardFocused: isKeyboardFocused });
	      _this.props.onKeyboardFocus(event, isKeyboardFocused);
	    }, _this.handleMouseEnter = function (event) {
	      // Cancel hover styles for touch devices
	      if (!_this.state.touch) _this.setState({ hovered: true });
	      _this.props.onMouseEnter(event);
	    }, _this.handleMouseLeave = function (event) {
	      _this.setState({ hovered: false });
	      _this.props.onMouseLeave(event);
	    }, _this.handleTouchStart = function (event) {
	      _this.setState({ touch: true });
	      _this.props.onTouchStart(event);
	    }, _temp), _possibleConstructorReturn(_this, _ret);
	  }
	
	  _createClass(FlatButton, [{
	    key: 'componentWillReceiveProps',
	    value: function componentWillReceiveProps(nextProps) {
	      if (nextProps.disabled && this.state.hovered) {
	        this.setState({
	          hovered: false
	        });
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var children = _props.children;
	      var disabled = _props.disabled;
	      var hoverColor = _props.hoverColor;
	      var backgroundColor = _props.backgroundColor;
	      var icon = _props.icon;
	      var label = _props.label;
	      var labelStyle = _props.labelStyle;
	      var labelPosition = _props.labelPosition;
	      var primary = _props.primary;
	      var rippleColor = _props.rippleColor;
	      var secondary = _props.secondary;
	      var style = _props.style;
	
	      var other = _objectWithoutProperties(_props, ['children', 'disabled', 'hoverColor', 'backgroundColor', 'icon', 'label', 'labelStyle', 'labelPosition', 'primary', 'rippleColor', 'secondary', 'style']);
	
	      var _context$muiTheme = this.context.muiTheme;
	      var _context$muiTheme$but = _context$muiTheme.button;
	      var buttonHeight = _context$muiTheme$but.height;
	      var buttonMinWidth = _context$muiTheme$but.minWidth;
	      var buttonTextTransform = _context$muiTheme$but.textTransform;
	      var _context$muiTheme$fla = _context$muiTheme.flatButton;
	      var buttonFilterColor = _context$muiTheme$fla.buttonFilterColor;
	      var buttonColor = _context$muiTheme$fla.color;
	      var disabledTextColor = _context$muiTheme$fla.disabledTextColor;
	      var fontSize = _context$muiTheme$fla.fontSize;
	      var fontWeight = _context$muiTheme$fla.fontWeight;
	      var primaryTextColor = _context$muiTheme$fla.primaryTextColor;
	      var secondaryTextColor = _context$muiTheme$fla.secondaryTextColor;
	      var textColor = _context$muiTheme$fla.textColor;
	      var _context$muiTheme$fla2 = _context$muiTheme$fla.textTransform;
	      var textTransform = _context$muiTheme$fla2 === undefined ? buttonTextTransform || 'uppercase' : _context$muiTheme$fla2;
	
	      var defaultTextColor = disabled ? disabledTextColor : primary ? primaryTextColor : secondary ? secondaryTextColor : textColor;
	
	      var defaultHoverColor = (0, _colorManipulator.fade)(buttonFilterColor, 0.2);
	      var defaultRippleColor = buttonFilterColor;
	      var buttonHoverColor = hoverColor || defaultHoverColor;
	      var buttonRippleColor = rippleColor || defaultRippleColor;
	      var buttonBackgroundColor = backgroundColor || buttonColor;
	      var hovered = (this.state.hovered || this.state.isKeyboardFocused) && !disabled;
	
	      var mergedRootStyles = (0, _simpleAssign2.default)({}, {
	        height: buttonHeight,
	        lineHeight: buttonHeight + 'px',
	        minWidth: buttonMinWidth,
	        color: defaultTextColor,
	        transition: _transitions2.default.easeOut(),
	        borderRadius: 2,
	        userSelect: 'none',
	        position: 'relative',
	        overflow: 'hidden',
	        backgroundColor: hovered ? buttonHoverColor : buttonBackgroundColor,
	        padding: 0,
	        margin: 0,
	        textAlign: 'center'
	      }, style);
	
	      var iconCloned = void 0;
	      var labelStyleIcon = {};
	
	      if (icon) {
	        var iconStyles = (0, _simpleAssign2.default)({
	          verticalAlign: 'middle',
	          marginLeft: label && labelPosition !== 'before' ? 12 : 0,
	          marginRight: label && labelPosition === 'before' ? 12 : 0
	        }, icon.props.style);
	        iconCloned = _react2.default.cloneElement(icon, {
	          color: icon.props.color || mergedRootStyles.color,
	          style: iconStyles
	        });
	
	        if (labelPosition === 'before') {
	          labelStyleIcon.paddingRight = 8;
	        } else {
	          labelStyleIcon.paddingLeft = 8;
	        }
	      }
	
	      var mergedLabelStyles = (0, _simpleAssign2.default)({
	        letterSpacing: 0,
	        textTransform: textTransform,
	        fontWeight: fontWeight,
	        fontSize: fontSize
	      }, labelStyleIcon, labelStyle);
	
	      var labelElement = label ? _react2.default.createElement(_FlatButtonLabel2.default, { label: label, style: mergedLabelStyles }) : undefined;
	
	      // Place label before or after children.
	      var childrenFragment = labelPosition === 'before' ? {
	        labelElement: labelElement,
	        iconCloned: iconCloned,
	        children: children
	      } : {
	        children: children,
	        iconCloned: iconCloned,
	        labelElement: labelElement
	      };
	
	      var enhancedButtonChildren = (0, _childUtils.createChildFragment)(childrenFragment);
	
	      return _react2.default.createElement(
	        _EnhancedButton2.default,
	        _extends({}, other, {
	          disabled: disabled,
	          focusRippleColor: buttonRippleColor,
	          focusRippleOpacity: 0.3,
	          onKeyboardFocus: this.handleKeyboardFocus,
	          onMouseLeave: this.handleMouseLeave,
	          onMouseEnter: this.handleMouseEnter,
	          onTouchStart: this.handleTouchStart,
	          style: mergedRootStyles,
	          touchRippleColor: buttonRippleColor,
	          touchRippleOpacity: 0.3
	        }),
	        enhancedButtonChildren
	      );
	    }
	  }]);
	
	  return FlatButton;
	}(_react.Component);
	
	FlatButton.muiName = 'FlatButton';
	FlatButton.propTypes = {
	  /**
	   * Color of button when mouse is not hovering over it.
	   */
	  backgroundColor: _react.PropTypes.string,
	  /**
	   * This is what will be displayed inside the button.
	   * If a label is specified, the text within the label prop will
	   * be displayed. Otherwise, the component will expect children
	   * which will then be displayed. (In our example,
	   * we are nesting an `<input type="file" />` and a `span`
	   * that acts as our label to be displayed.) This only
	   * applies to flat and raised buttons.
	   */
	  children: _react.PropTypes.node,
	  /**
	   * Disables the button if set to true.
	   */
	  disabled: _react.PropTypes.bool,
	  /**
	   * Color of button when mouse hovers over.
	   */
	  hoverColor: _react.PropTypes.string,
	  /**
	   * The URL to link to when the button is clicked.
	   */
	  href: _react.PropTypes.string,
	  /**
	   * Use this property to display an icon.
	   */
	  icon: _react.PropTypes.node,
	  /**
	   * Label for the button.
	   */
	  label: validateLabel,
	  /**
	   * Place label before or after the passed children.
	   */
	  labelPosition: _react.PropTypes.oneOf(['before', 'after']),
	  /**
	   * Override the inline-styles of the button's label element.
	   */
	  labelStyle: _react.PropTypes.object,
	  /**
	   * Callback function fired when the element is focused or blurred by the keyboard.
	   *
	   * @param {object} event `focus` or `blur` event targeting the element.
	   * @param {boolean} isKeyboardFocused Indicates whether the element is focused.
	   */
	  onKeyboardFocus: _react.PropTypes.func,
	  /** @ignore */
	  onMouseEnter: _react.PropTypes.func,
	  /** @ignore */
	  onMouseLeave: _react.PropTypes.func,
	  /** @ignore */
	  onTouchStart: _react.PropTypes.func,
	  /**
	   * If true, colors button according to
	   * primaryTextColor from the Theme.
	   */
	  primary: _react.PropTypes.bool,
	  /**
	   * Color for the ripple after button is clicked.
	   */
	  rippleColor: _react.PropTypes.string,
	  /**
	   * If true, colors button according to secondaryTextColor from the theme.
	   * The primary prop has precendent if set to true.
	   */
	  secondary: _react.PropTypes.bool,
	  /**
	   * Override the inline-styles of the root element.
	   */
	  style: _react.PropTypes.object
	};
	FlatButton.defaultProps = {
	  disabled: false,
	  labelStyle: {},
	  labelPosition: 'after',
	  onKeyboardFocus: function onKeyboardFocus() {},
	  onMouseEnter: function onMouseEnter() {},
	  onMouseLeave: function onMouseLeave() {},
	  onTouchStart: function onTouchStart() {},
	  primary: false,
	  secondary: false
	};
	FlatButton.contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	exports.default = FlatButton;

/***/ },

/***/ 657:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _simpleAssign = __webpack_require__(530);
	
	var _simpleAssign2 = _interopRequireDefault(_simpleAssign);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function getStyles(props, context) {
	  var baseTheme = context.muiTheme.baseTheme;
	
	
	  return {
	    root: {
	      position: 'relative',
	      paddingLeft: baseTheme.spacing.desktopGutterLess,
	      paddingRight: baseTheme.spacing.desktopGutterLess,
	      verticalAlign: 'middle'
	    }
	  };
	}
	
	var FlatButtonLabel = function (_Component) {
	  _inherits(FlatButtonLabel, _Component);
	
	  function FlatButtonLabel() {
	    _classCallCheck(this, FlatButtonLabel);
	
	    return _possibleConstructorReturn(this, Object.getPrototypeOf(FlatButtonLabel).apply(this, arguments));
	  }
	
	  _createClass(FlatButtonLabel, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var label = _props.label;
	      var style = _props.style;
	      var prepareStyles = this.context.muiTheme.prepareStyles;
	
	      var styles = getStyles(this.props, this.context);
	
	      return _react2.default.createElement(
	        'span',
	        { style: prepareStyles((0, _simpleAssign2.default)(styles.root, style)) },
	        label
	      );
	    }
	  }]);
	
	  return FlatButtonLabel;
	}(_react.Component);
	
	FlatButtonLabel.propTypes = {
	  label: _react.PropTypes.node,
	  style: _react.PropTypes.object
	};
	FlatButtonLabel.contextTypes = {
	  muiTheme: _react.PropTypes.object.isRequired
	};
	exports.default = FlatButtonLabel;

/***/ },

/***/ 780:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _reactRedux = __webpack_require__(349);
	
	var _Venues = __webpack_require__(781);
	
	var _VenuesView = __webpack_require__(782);
	
	var _VenuesView2 = _interopRequireDefault(_VenuesView);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/*  Object of action creators (can also be function that returns object).
	    Keys will be passed as props to presentational components. Here we are
	    implementing our wrapper around increment; the component doesn't care   */
	
	var mapActionCreators = {
	    increment: function increment() {
	        return (0, _Venues.increment)(1);
	    },
	    fetchVenuesList: _Venues.fetchVenuesList
	};
	
	/*  This is a container component. Notice it does not contain any JSX,
	    nor does it import React. This component is **only** responsible for
	    wiring in the actions and state necessary to render a presentational
	    component - in this case, the counter:   */
	
	var mapStateToProps = function mapStateToProps(state) {
	    return {
	        list: state.Venues.list
	    };
	};
	
	/*  Note: mapStateToProps is where you should use `reselect` to create selectors, ie:
	
	    import { createSelector } from 'reselect'
	    const counter = (state) => state.counter
	    const tripleCount = createSelector(counter, (count) => count * 3)
	    const mapStateToProps = (state) => ({
	      counter: tripleCount(state)
	    })
	
	    Selectors can compute derived data, allowing Redux to store the minimal possible state.
	    Selectors are efficient. A selector is not recomputed unless one of its arguments change.
	    Selectors are composable. They can be used as input to other selectors.
	    https://github.com/reactjs/reselect    */
	
	exports.default = (0, _reactRedux.connect)(mapStateToProps, mapActionCreators)(_VenuesView2.default);

/***/ },

/***/ 781:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.actions = exports.fetchVenuesList = exports.VENUES_LIST_FETCHED = exports.VENUES_COUNTER_INCREMENT = undefined;
	
	var _defineProperty2 = __webpack_require__(525);
	
	var _defineProperty3 = _interopRequireDefault(_defineProperty2);
	
	var _assign = __webpack_require__(258);
	
	var _assign2 = _interopRequireDefault(_assign);
	
	var _promise = __webpack_require__(618);
	
	var _promise2 = _interopRequireDefault(_promise);
	
	var _ACTION_HANDLERS;
	
	exports.increment = increment;
	exports.default = studioReducer;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// ------------------------------------
	// Constants
	// ------------------------------------
	var VENUES_COUNTER_INCREMENT = exports.VENUES_COUNTER_INCREMENT = 'VENUES_COUNTER_INCREMENT';
	var VENUES_LIST_FETCHED = exports.VENUES_LIST_FETCHED = 'VENUES_LIST_FETCHED';
	
	// ------------------------------------
	// Actions
	// ------------------------------------
	function increment() {
	  var value = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	  return {
	    type: VENUES_COUNTER_INCREMENT,
	    payload: value
	  };
	}
	
	/*  This is a thunk, meaning it is a function that immediately
	    returns a function for lazy evaluation. It is incredibly useful for
	    creating async actions, especially when combined with redux-thunk!
	
	    NOTE: This is solely for demonstration purposes. In a real application,
	    you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
	    reducer take care of this logic.  */
	
	var fetchVenuesList = exports.fetchVenuesList = function fetchVenuesList() {
	  return function (dispatch, getState) {
	    return new _promise2.default(function (resolve) {
	      setTimeout(function () {
	        dispatch({
	          type: VENUES_LIST_FETCHED,
	          payload: [{
	            img: 'http://localhost:3000/recordingStudio1.jpg',
	            title: 'Gurminder Stasdasudio',
	            author: 'jill111',
	            featured: true
	          }, {
	            img: 'http://localhost:3000/recordingStudio3.jpg',
	            title: 'Sparsh Records Ltd',
	            author: 'pashminu'
	          }, {
	            img: 'http://localhost:3000/recordingStudio2.jpg',
	            title: 'Nanda Recording Sessions',
	            author: 'Danson67'
	          }, {
	            img: 'http://localhost:3000/recordingStudio.png',
	            title: 'Jogi Brothel',
	            author: 'fancycrave1',
	            featured: true
	          }]
	        });
	        resolve();
	      }, 2000);
	    });
	  };
	};
	
	var actions = exports.actions = {
	  increment: increment,
	  fetchVenuesList: fetchVenuesList
	};
	
	// ------------------------------------
	// Action Handlers
	// ------------------------------------
	var ACTION_HANDLERS = (_ACTION_HANDLERS = {}, (0, _defineProperty3.default)(_ACTION_HANDLERS, VENUES_COUNTER_INCREMENT, function (state, action) {
	  return (0, _assign2.default)({}, state.Venues, {
	    list: state.list,
	    fetched: true
	  });
	}), (0, _defineProperty3.default)(_ACTION_HANDLERS, VENUES_LIST_FETCHED, function (state, action) {
	  return (0, _assign2.default)({}, state.Venues, {
	    list: action.payload
	  });
	}), _ACTION_HANDLERS);
	
	// ------------------------------------
	// Reducer
	// ------------------------------------
	var initialState = {
	  fetched: false,
	  list: []
	};
	function studioReducer() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];
	
	  var handler = ACTION_HANDLERS[action.type];
	  return handler ? handler(state, action) : state;
	}

/***/ },

/***/ 782:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.VenuesView = undefined;
	
	var _getPrototypeOf = __webpack_require__(296);
	
	var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);
	
	var _classCallCheck2 = __webpack_require__(301);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(302);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = __webpack_require__(306);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(341);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _VenuesView = __webpack_require__(783);
	
	var _VenuesView2 = _interopRequireDefault(_VenuesView);
	
	var _StudioTile = __webpack_require__(637);
	
	var _StudioTile2 = _interopRequireDefault(_StudioTile);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var VenuesView = exports.VenuesView = function (_React$Component) {
	    (0, _inherits3.default)(VenuesView, _React$Component);
	
	    function VenuesView() {
	        (0, _classCallCheck3.default)(this, VenuesView);
	
	        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(VenuesView).call(this));
	
	        _this.getVenues = _this.getVenues.bind(_this);
	
	        return _this;
	    }
	    //fires only on first render of component
	
	
	    (0, _createClass3.default)(VenuesView, [{
	        key: 'componentWillMount',
	        value: function componentWillMount() {
	            this.getVenues();
	        }
	        //imp for memry leaks
	
	    }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {}
	    }, {
	        key: 'getVenues',
	        value: function getVenues() {
	            this.props.fetchVenuesList();
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	
	            return _react2.default.createElement(
	                'div',
	                { className: _VenuesView2.default.homeContainer },
	                _react2.default.createElement(
	                    'h3',
	                    null,
	                    ' List Of Venues :  '
	                ),
	                _react2.default.createElement(_StudioTile2.default, { list: this.props.list })
	            );
	        }
	    }]);
	    return VenuesView;
	}(_react2.default.Component);
	
	VenuesView.propTypes = {
	    list: _react2.default.PropTypes.array.isRequired,
	    increment: _react2.default.PropTypes.func.isRequired,
	    fetchVenuesList: _react2.default.PropTypes.func.isRequired
	
	};
	exports.default = VenuesView;

/***/ },

/***/ 783:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(784);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(576)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(784, function() {
				var newContent = __webpack_require__(784);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 784:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(575)();
	// imports
	
	
	// module
	exports.push([module.id, "", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"VenuesView.scss","sourceRoot":"webpack://"}]);
	
	// exports


/***/ }

});
//# sourceMappingURL=4.Venues.d107b1e81ba5c991cfe8.js.map