webpackJsonp([5],{

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

/***/ 679:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(680);

/***/ },

/***/ 680:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _innerSlider = __webpack_require__(681);
	
	var _objectAssign = __webpack_require__(4);
	
	var _objectAssign2 = _interopRequireDefault(_objectAssign);
	
	var _json2mq = __webpack_require__(691);
	
	var _json2mq2 = _interopRequireDefault(_json2mq);
	
	var _reactResponsiveMixin = __webpack_require__(693);
	
	var _reactResponsiveMixin2 = _interopRequireDefault(_reactResponsiveMixin);
	
	var _defaultProps = __webpack_require__(686);
	
	var _defaultProps2 = _interopRequireDefault(_defaultProps);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Slider = _react2.default.createClass({
	  displayName: 'Slider',
	
	  mixins: [_reactResponsiveMixin2.default],
	  getInitialState: function getInitialState() {
	    return {
	      breakpoint: null
	    };
	  },
	  componentDidMount: function componentDidMount() {
	    var _this = this;
	
	    if (this.props.responsive) {
	      var breakpoints = this.props.responsive.map(function (breakpt) {
	        return breakpt.breakpoint;
	      });
	      breakpoints.sort(function (x, y) {
	        return x - y;
	      });
	
	      breakpoints.forEach(function (breakpoint, index) {
	        var bQuery;
	        if (index === 0) {
	          bQuery = (0, _json2mq2.default)({ minWidth: 0, maxWidth: breakpoint });
	        } else {
	          bQuery = (0, _json2mq2.default)({ minWidth: breakpoints[index - 1], maxWidth: breakpoint });
	        }
	        _this.media(bQuery, function () {
	          _this.setState({ breakpoint: breakpoint });
	        });
	      });
	
	      // Register media query for full screen. Need to support resize from small to large
	      var query = (0, _json2mq2.default)({ minWidth: breakpoints.slice(-1)[0] });
	
	      this.media(query, function () {
	        _this.setState({ breakpoint: null });
	      });
	    }
	  },
	
	  slickPrev: function slickPrev() {
	    this.refs.innerSlider.slickPrev();
	  },
	
	  slickNext: function slickNext() {
	    this.refs.innerSlider.slickNext();
	  },
	
	  slickGoTo: function slickGoTo(slide) {
	    this.refs.innerSlider.slickGoTo(slide);
	  },
	
	  render: function render() {
	    var _this2 = this;
	
	    var settings;
	    var newProps;
	    if (this.state.breakpoint) {
	      newProps = this.props.responsive.filter(function (resp) {
	        return resp.breakpoint === _this2.state.breakpoint;
	      });
	      settings = newProps[0].settings === 'unslick' ? 'unslick' : (0, _objectAssign2.default)({}, this.props, newProps[0].settings);
	    } else {
	      settings = (0, _objectAssign2.default)({}, _defaultProps2.default, this.props);
	    }
	
	    var children = this.props.children;
	    if (!Array.isArray(children)) {
	      children = [children];
	    }
	
	    // Children may contain false or null, so we should filter them
	    children = children.filter(function (child) {
	      return !!child;
	    });
	
	    if (settings === 'unslick') {
	      // if 'unslick' responsive breakpoint setting used, just return the <Slider> tag nested HTML
	      return _react2.default.createElement(
	        'div',
	        null,
	        children
	      );
	    } else {
	      return _react2.default.createElement(
	        _innerSlider.InnerSlider,
	        _extends({ ref: 'innerSlider' }, settings),
	        children
	      );
	    }
	  }
	});
	
	module.exports = Slider;

/***/ },

/***/ 681:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.InnerSlider = undefined;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _eventHandlers = __webpack_require__(682);
	
	var _eventHandlers2 = _interopRequireDefault(_eventHandlers);
	
	var _helpers = __webpack_require__(684);
	
	var _helpers2 = _interopRequireDefault(_helpers);
	
	var _initialState = __webpack_require__(685);
	
	var _initialState2 = _interopRequireDefault(_initialState);
	
	var _defaultProps = __webpack_require__(686);
	
	var _defaultProps2 = _interopRequireDefault(_defaultProps);
	
	var _classnames = __webpack_require__(687);
	
	var _classnames2 = _interopRequireDefault(_classnames);
	
	var _track = __webpack_require__(688);
	
	var _dots = __webpack_require__(689);
	
	var _arrows = __webpack_require__(690);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var InnerSlider = exports.InnerSlider = _react2.default.createClass({
	  displayName: 'InnerSlider',
	
	  mixins: [_helpers2.default, _eventHandlers2.default],
	  getInitialState: function getInitialState() {
	    return _extends({}, _initialState2.default, {
	      currentSlide: this.props.initialSlide
	    });
	  },
	  getDefaultProps: function getDefaultProps() {
	    return _defaultProps2.default;
	  },
	  componentWillMount: function componentWillMount() {
	    if (this.props.init) {
	      this.props.init();
	    }
	    this.setState({
	      mounted: true
	    });
	    var lazyLoadedList = [];
	    for (var i = 0; i < _react2.default.Children.count(this.props.children); i++) {
	      if (i >= this.state.currentSlide && i < this.state.currentSlide + this.props.slidesToShow) {
	        lazyLoadedList.push(i);
	      }
	    }
	
	    if (this.props.lazyLoad && this.state.lazyLoadedList.length === 0) {
	      this.setState({
	        lazyLoadedList: lazyLoadedList
	      });
	    }
	  },
	  componentDidMount: function componentDidMount() {
	    // Hack for autoplay -- Inspect Later
	    this.initialize(this.props);
	    this.adaptHeight();
	    if (window.addEventListener) {
	      window.addEventListener('resize', this.onWindowResized);
	    } else {
	      window.attachEvent('onresize', this.onWindowResized);
	    }
	  },
	  componentWillUnmount: function componentWillUnmount() {
	    if (this.animationEndCallback) {
	      clearTimeout(this.animationEndCallback);
	    }
	    if (window.addEventListener) {
	      window.removeEventListener('resize', this.onWindowResized);
	    } else {
	      window.detachEvent('onresize', this.onWindowResized);
	    }
	    if (this.state.autoPlayTimer) {
	      window.clearInterval(this.state.autoPlayTimer);
	    }
	  },
	  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	    if (this.props.slickGoTo != nextProps.slickGoTo) {
	      if (true) {
	        console.warn('react-slick deprecation warning: slickGoTo prop is deprecated and it will be removed in next release. Use slickGoTo method instead');
	      }
	      this.changeSlide({
	        message: 'index',
	        index: nextProps.slickGoTo,
	        currentSlide: this.state.currentSlide
	      });
	    } else if (this.state.currentSlide >= nextProps.children.length) {
	      this.update(nextProps);
	      this.changeSlide({
	        message: 'index',
	        index: nextProps.children.length - nextProps.slidesToShow,
	        currentSlide: this.state.currentSlide
	      });
	    } else {
	      this.update(nextProps);
	    }
	  },
	  componentDidUpdate: function componentDidUpdate() {
	    this.adaptHeight();
	  },
	  onWindowResized: function onWindowResized() {
	    this.update(this.props);
	    // animating state should be cleared while resizing, otherwise autoplay stops working
	    this.setState({
	      animating: false
	    });
	  },
	  slickPrev: function slickPrev() {
	    this.changeSlide({ message: 'previous' });
	  },
	  slickNext: function slickNext() {
	    this.changeSlide({ message: 'next' });
	  },
	  slickGoTo: function slickGoTo(slide) {
	    slide && this.changeSlide({
	      message: 'index',
	      index: slide,
	      currentSlide: this.state.currentSlide
	    });
	  },
	  render: function render() {
	    var className = (0, _classnames2.default)('slick-initialized', 'slick-slider', this.props.className);
	
	    var trackProps = {
	      fade: this.props.fade,
	      cssEase: this.props.cssEase,
	      speed: this.props.speed,
	      infinite: this.props.infinite,
	      centerMode: this.props.centerMode,
	      focusOnSelect: this.props.focusOnSelect ? this.selectHandler : new Function(),
	      currentSlide: this.state.currentSlide,
	      lazyLoad: this.props.lazyLoad,
	      lazyLoadedList: this.state.lazyLoadedList,
	      rtl: this.props.rtl,
	      slideWidth: this.state.slideWidth,
	      slidesToShow: this.props.slidesToShow,
	      slidesToScroll: this.props.slidesToScroll,
	      slideCount: this.state.slideCount,
	      trackStyle: this.state.trackStyle,
	      variableWidth: this.props.variableWidth
	    };
	
	    var dots;
	
	    if (this.props.dots === true && this.state.slideCount >= this.props.slidesToShow) {
	      var dotProps = {
	        dotsClass: this.props.dotsClass,
	        slideCount: this.state.slideCount,
	        slidesToShow: this.props.slidesToShow,
	        currentSlide: this.state.currentSlide,
	        slidesToScroll: this.props.slidesToScroll,
	        clickHandler: this.changeSlide
	      };
	
	      dots = _react2.default.createElement(_dots.Dots, dotProps);
	    }
	
	    var prevArrow, nextArrow;
	
	    var arrowProps = {
	      infinite: this.props.infinite,
	      centerMode: this.props.centerMode,
	      currentSlide: this.state.currentSlide,
	      slideCount: this.state.slideCount,
	      slidesToShow: this.props.slidesToShow,
	      prevArrow: this.props.prevArrow,
	      nextArrow: this.props.nextArrow,
	      clickHandler: this.changeSlide
	    };
	
	    if (this.props.arrows) {
	      prevArrow = _react2.default.createElement(_arrows.PrevArrow, arrowProps);
	      nextArrow = _react2.default.createElement(_arrows.NextArrow, arrowProps);
	    }
	
	    var centerPaddingStyle = null;
	
	    if (this.props.vertical === false) {
	      if (this.props.centerMode === true) {
	        centerPaddingStyle = {
	          padding: '0px ' + this.props.centerPadding
	        };
	      }
	    } else {
	      if (this.props.centerMode === true) {
	        centerPaddingStyle = {
	          padding: this.props.centerPadding + ' 0px'
	        };
	      }
	    }
	
	    return _react2.default.createElement(
	      'div',
	      { className: className, onMouseEnter: this.onInnerSliderEnter, onMouseLeave: this.onInnerSliderLeave },
	      prevArrow,
	      _react2.default.createElement(
	        'div',
	        {
	          ref: 'list',
	          className: 'slick-list',
	          style: centerPaddingStyle,
	          onMouseDown: this.swipeStart,
	          onMouseMove: this.state.dragging ? this.swipeMove : null,
	          onMouseUp: this.swipeEnd,
	          onMouseLeave: this.state.dragging ? this.swipeEnd : null,
	          onTouchStart: this.swipeStart,
	          onTouchMove: this.state.dragging ? this.swipeMove : null,
	          onTouchEnd: this.swipeEnd,
	          onTouchCancel: this.state.dragging ? this.swipeEnd : null,
	          onKeyDown: this.props.accessibility ? this.keyHandler : null },
	        _react2.default.createElement(
	          _track.Track,
	          _extends({ ref: 'track' }, trackProps),
	          this.props.children
	        )
	      ),
	      nextArrow,
	      dots
	    );
	  }
	});

/***/ },

/***/ 682:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _trackHelper = __webpack_require__(683);
	
	var _helpers = __webpack_require__(684);
	
	var _helpers2 = _interopRequireDefault(_helpers);
	
	var _objectAssign = __webpack_require__(4);
	
	var _objectAssign2 = _interopRequireDefault(_objectAssign);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var EventHandlers = {
	  // Event handler for previous and next
	  changeSlide: function changeSlide(options) {
	    var indexOffset, previousInt, slideOffset, unevenOffset, targetSlide;
	    var _props = this.props;
	    var slidesToScroll = _props.slidesToScroll;
	    var slidesToShow = _props.slidesToShow;
	    var _state = this.state;
	    var slideCount = _state.slideCount;
	    var currentSlide = _state.currentSlide;
	
	    unevenOffset = slideCount % slidesToScroll !== 0;
	    indexOffset = unevenOffset ? 0 : (slideCount - currentSlide) % slidesToScroll;
	
	    if (options.message === 'previous') {
	      slideOffset = indexOffset === 0 ? slidesToScroll : slidesToShow - indexOffset;
	      targetSlide = currentSlide - slideOffset;
	      if (this.props.lazyLoad) {
	        previousInt = currentSlide - slideOffset;
	        targetSlide = previousInt === -1 ? slideCount - 1 : previousInt;
	      }
	    } else if (options.message === 'next') {
	      slideOffset = indexOffset === 0 ? slidesToScroll : indexOffset;
	      targetSlide = currentSlide + slideOffset;
	      if (this.props.lazyLoad) {
	        targetSlide = (currentSlide + slidesToScroll) % slideCount + indexOffset;
	      }
	    } else if (options.message === 'dots' || options.message === 'children') {
	      // Click on dots
	      targetSlide = options.index * options.slidesToScroll;
	      if (targetSlide === options.currentSlide) {
	        return;
	      }
	    } else if (options.message === 'index') {
	      targetSlide = parseInt(options.index);
	      if (targetSlide === options.currentSlide) {
	        return;
	      }
	    }
	
	    this.slideHandler(targetSlide);
	  },
	
	  // Accessiblity handler for previous and next
	  keyHandler: function keyHandler(e) {
	    //Dont slide if the cursor is inside the form fields and arrow keys are pressed
	    if (!e.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
	      if (e.keyCode === 37 && this.props.accessibility === true) {
	        this.changeSlide({
	          message: this.props.rtl === true ? 'next' : 'previous'
	        });
	      } else if (e.keyCode === 39 && this.props.accessibility === true) {
	        this.changeSlide({
	          message: this.props.rtl === true ? 'previous' : 'next'
	        });
	      }
	    }
	  },
	  // Focus on selecting a slide (click handler on track)
	  selectHandler: function selectHandler(options) {
	    this.changeSlide(options);
	  },
	  swipeStart: function swipeStart(e) {
	    var touches, posX, posY;
	
	    if (this.props.swipe === false || 'ontouchend' in document && this.props.swipe === false) {
	      return;
	    } else if (this.props.draggable === false && e.type.indexOf('mouse') !== -1) {
	      return;
	    }
	    posX = e.touches !== undefined ? e.touches[0].pageX : e.clientX;
	    posY = e.touches !== undefined ? e.touches[0].pageY : e.clientY;
	    this.setState({
	      dragging: true,
	      touchObject: {
	        startX: posX,
	        startY: posY,
	        curX: posX,
	        curY: posY
	      }
	    });
	  },
	  swipeMove: function swipeMove(e) {
	    if (!this.state.dragging) {
	      e.preventDefault();
	      return;
	    }
	    if (this.state.animating) {
	      return;
	    }
	    var swipeLeft;
	    var curLeft, positionOffset;
	    var touchObject = this.state.touchObject;
	
	    curLeft = (0, _trackHelper.getTrackLeft)((0, _objectAssign2.default)({
	      slideIndex: this.state.currentSlide,
	      trackRef: this.refs.track
	    }, this.props, this.state));
	    touchObject.curX = e.touches ? e.touches[0].pageX : e.clientX;
	    touchObject.curY = e.touches ? e.touches[0].pageY : e.clientY;
	    touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(touchObject.curX - touchObject.startX, 2)));
	
	    positionOffset = (this.props.rtl === false ? 1 : -1) * (touchObject.curX > touchObject.startX ? 1 : -1);
	
	    var currentSlide = this.state.currentSlide;
	    var dotCount = Math.ceil(this.state.slideCount / this.props.slidesToScroll);
	    var swipeDirection = this.swipeDirection(this.state.touchObject);
	    var touchSwipeLength = touchObject.swipeLength;
	
	    if (this.props.infinite === false) {
	      if (currentSlide === 0 && swipeDirection === 'right' || currentSlide + 1 >= dotCount && swipeDirection === 'left') {
	        touchSwipeLength = touchObject.swipeLength * this.props.edgeFriction;
	
	        if (this.state.edgeDragged === false && this.props.edgeEvent) {
	          this.props.edgeEvent(swipeDirection);
	          this.setState({ edgeDragged: true });
	        }
	      }
	    }
	
	    if (this.state.swiped === false && this.props.swipeEvent) {
	      this.props.swipeEvent(swipeDirection);
	      this.setState({ swiped: true });
	    }
	
	    swipeLeft = curLeft + touchSwipeLength * positionOffset;
	    this.setState({
	      touchObject: touchObject,
	      swipeLeft: swipeLeft,
	      trackStyle: (0, _trackHelper.getTrackCSS)((0, _objectAssign2.default)({ left: swipeLeft }, this.props, this.state))
	    });
	
	    if (Math.abs(touchObject.curX - touchObject.startX) < Math.abs(touchObject.curY - touchObject.startY) * 0.8) {
	      return;
	    }
	    if (touchObject.swipeLength > 4) {
	      e.preventDefault();
	    }
	  },
	  swipeEnd: function swipeEnd(e) {
	    if (!this.state.dragging) {
	      e.preventDefault();
	      return;
	    }
	    var touchObject = this.state.touchObject;
	    var minSwipe = this.state.listWidth / this.props.touchThreshold;
	    var swipeDirection = this.swipeDirection(touchObject);
	
	    // reset the state of touch related state variables.
	    this.setState({
	      dragging: false,
	      edgeDragged: false,
	      swiped: false,
	      swipeLeft: null,
	      touchObject: {}
	    });
	    // Fix for #13
	    if (!touchObject.swipeLength) {
	      return;
	    }
	    if (touchObject.swipeLength > minSwipe) {
	      e.preventDefault();
	      if (swipeDirection === 'left') {
	        this.slideHandler(this.state.currentSlide + this.props.slidesToScroll);
	      } else if (swipeDirection === 'right') {
	        this.slideHandler(this.state.currentSlide - this.props.slidesToScroll);
	      } else {
	        this.slideHandler(this.state.currentSlide);
	      }
	    } else {
	      // Adjust the track back to it's original position.
	      var currentLeft = (0, _trackHelper.getTrackLeft)((0, _objectAssign2.default)({
	        slideIndex: this.state.currentSlide,
	        trackRef: this.refs.track
	      }, this.props, this.state));
	
	      this.setState({
	        trackStyle: (0, _trackHelper.getTrackAnimateCSS)((0, _objectAssign2.default)({ left: currentLeft }, this.props, this.state))
	      });
	    }
	  },
	  onInnerSliderEnter: function onInnerSliderEnter(e) {
	    if (this.props.autoplay && this.props.pauseOnHover) {
	      this.pause();
	    }
	  },
	  onInnerSliderLeave: function onInnerSliderLeave(e) {
	    if (this.props.autoplay && this.props.pauseOnHover) {
	      this.autoPlay();
	    }
	  }
	};
	
	exports.default = EventHandlers;

/***/ },

/***/ 683:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.getTrackLeft = exports.getTrackAnimateCSS = exports.getTrackCSS = undefined;
	
	var _reactDom = __webpack_require__(35);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var checkSpecKeys = function checkSpecKeys(spec, keysArray) {
	  return keysArray.reduce(function (value, key) {
	    return value && spec.hasOwnProperty(key);
	  }, true) ? null : console.error('Keys Missing', spec);
	};
	
	var getTrackCSS = exports.getTrackCSS = function getTrackCSS(spec) {
	  checkSpecKeys(spec, ['left', 'variableWidth', 'slideCount', 'slidesToShow', 'slideWidth']);
	
	  var trackWidth;
	
	  if (spec.variableWidth) {
	    trackWidth = (spec.slideCount + 2 * spec.slidesToShow) * spec.slideWidth;
	  } else if (spec.centerMode) {
	    trackWidth = (spec.slideCount + 2 * (spec.slidesToShow + 1)) * spec.slideWidth;
	  } else {
	    trackWidth = (spec.slideCount + 2 * spec.slidesToShow) * spec.slideWidth;
	  }
	
	  var style = {
	    opacity: 1,
	    width: trackWidth,
	    WebkitTransform: 'translate3d(' + spec.left + 'px, 0px, 0px)',
	    transform: 'translate3d(' + spec.left + 'px, 0px, 0px)',
	    transition: '',
	    WebkitTransition: '',
	    msTransform: 'translateX(' + spec.left + 'px)'
	  };
	
	  // Fallback for IE8
	  if (!window.addEventListener && window.attachEvent) {
	    style.marginLeft = spec.left + 'px';
	  }
	
	  return style;
	};
	
	var getTrackAnimateCSS = exports.getTrackAnimateCSS = function getTrackAnimateCSS(spec) {
	  checkSpecKeys(spec, ['left', 'variableWidth', 'slideCount', 'slidesToShow', 'slideWidth', 'speed', 'cssEase']);
	
	  var style = getTrackCSS(spec);
	  // useCSS is true by default so it can be undefined
	  style.WebkitTransition = '-webkit-transform ' + spec.speed + 'ms ' + spec.cssEase;
	  style.transition = 'transform ' + spec.speed + 'ms ' + spec.cssEase;
	  return style;
	};
	
	var getTrackLeft = exports.getTrackLeft = function getTrackLeft(spec) {
	
	  checkSpecKeys(spec, ['slideIndex', 'trackRef', 'infinite', 'centerMode', 'slideCount', 'slidesToShow', 'slidesToScroll', 'slideWidth', 'listWidth', 'variableWidth']);
	
	  var slideOffset = 0;
	  var targetLeft;
	  var targetSlide;
	
	  if (spec.fade) {
	    return 0;
	  }
	
	  if (spec.infinite) {
	    if (spec.slideCount > spec.slidesToShow) {
	      slideOffset = spec.slideWidth * spec.slidesToShow * -1;
	    }
	    if (spec.slideCount % spec.slidesToScroll !== 0) {
	      if (spec.slideIndex + spec.slidesToScroll > spec.slideCount && spec.slideCount > spec.slidesToShow) {
	        if (spec.slideIndex > spec.slideCount) {
	          slideOffset = (spec.slidesToShow - (spec.slideIndex - spec.slideCount)) * spec.slideWidth * -1;
	        } else {
	          slideOffset = spec.slideCount % spec.slidesToScroll * spec.slideWidth * -1;
	        }
	      }
	    }
	  } else {
	
	    if (spec.slideCount % spec.slidesToScroll !== 0) {
	      if (spec.slideIndex + spec.slidesToScroll > spec.slideCount && spec.slideCount > spec.slidesToShow) {
	        var slidesToOffset = spec.slidesToShow - spec.slideCount % spec.slidesToScroll;
	        slideOffset = slidesToOffset * spec.slideWidth;
	      }
	    }
	  }
	
	  if (spec.centerMode) {
	    if (spec.infinite) {
	      slideOffset += spec.slideWidth * Math.floor(spec.slidesToShow / 2);
	    } else {
	      slideOffset = spec.slideWidth * Math.floor(spec.slidesToShow / 2);
	    }
	  }
	
	  targetLeft = spec.slideIndex * spec.slideWidth * -1 + slideOffset;
	
	  if (spec.variableWidth === true) {
	    var targetSlideIndex;
	    if (spec.slideCount <= spec.slidesToShow || spec.infinite === false) {
	      targetSlide = _reactDom2.default.findDOMNode(spec.trackRef).childNodes[spec.slideIndex];
	    } else {
	      targetSlideIndex = spec.slideIndex + spec.slidesToShow;
	      targetSlide = _reactDom2.default.findDOMNode(spec.trackRef).childNodes[targetSlideIndex];
	    }
	    targetLeft = targetSlide ? targetSlide.offsetLeft * -1 : 0;
	    if (spec.centerMode === true) {
	      if (spec.infinite === false) {
	        targetSlide = _reactDom2.default.findDOMNode(spec.trackRef).children[spec.slideIndex];
	      } else {
	        targetSlide = _reactDom2.default.findDOMNode(spec.trackRef).children[spec.slideIndex + spec.slidesToShow + 1];
	      }
	
	      targetLeft = targetSlide ? targetSlide.offsetLeft * -1 : 0;
	      targetLeft += (spec.listWidth - targetSlide.offsetWidth) / 2;
	    }
	  }
	
	  return targetLeft;
	};

/***/ },

/***/ 684:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(35);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _trackHelper = __webpack_require__(683);
	
	var _objectAssign = __webpack_require__(4);
	
	var _objectAssign2 = _interopRequireDefault(_objectAssign);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var helpers = {
	  initialize: function initialize(props) {
	    var slideCount = _react2.default.Children.count(props.children);
	    var listWidth = this.getWidth(_reactDom2.default.findDOMNode(this.refs.list));
	    var trackWidth = this.getWidth(_reactDom2.default.findDOMNode(this.refs.track));
	    var slideWidth = trackWidth / props.slidesToShow;
	
	    var currentSlide = props.rtl ? slideCount - 1 - props.initialSlide : props.initialSlide;
	
	    this.setState({
	      slideCount: slideCount,
	      slideWidth: slideWidth,
	      listWidth: listWidth,
	      trackWidth: trackWidth,
	      currentSlide: currentSlide
	    }, function () {
	
	      var targetLeft = (0, _trackHelper.getTrackLeft)((0, _objectAssign2.default)({
	        slideIndex: this.state.currentSlide,
	        trackRef: this.refs.track
	      }, props, this.state));
	      // getCSS function needs previously set state
	      var trackStyle = (0, _trackHelper.getTrackCSS)((0, _objectAssign2.default)({ left: targetLeft }, props, this.state));
	
	      this.setState({ trackStyle: trackStyle });
	
	      this.autoPlay(); // once we're set up, trigger the initial autoplay.
	    });
	  },
	  update: function update(props) {
	    // This method has mostly same code as initialize method.
	    // Refactor it
	    var slideCount = _react2.default.Children.count(props.children);
	    var listWidth = this.getWidth(_reactDom2.default.findDOMNode(this.refs.list));
	    var trackWidth = this.getWidth(_reactDom2.default.findDOMNode(this.refs.track));
	    var slideWidth = this.getWidth(_reactDom2.default.findDOMNode(this)) / props.slidesToShow;
	
	    // pause slider if autoplay is set to false
	    if (!props.autoplay) this.pause();
	
	    this.setState({
	      slideCount: slideCount,
	      slideWidth: slideWidth,
	      listWidth: listWidth,
	      trackWidth: trackWidth
	    }, function () {
	
	      var targetLeft = (0, _trackHelper.getTrackLeft)((0, _objectAssign2.default)({
	        slideIndex: this.state.currentSlide,
	        trackRef: this.refs.track
	      }, props, this.state));
	      // getCSS function needs previously set state
	      var trackStyle = (0, _trackHelper.getTrackCSS)((0, _objectAssign2.default)({ left: targetLeft }, props, this.state));
	
	      this.setState({ trackStyle: trackStyle });
	    });
	  },
	  getWidth: function getWidth(elem) {
	    return elem.getBoundingClientRect().width || elem.offsetWidth;
	  },
	  adaptHeight: function adaptHeight() {
	    if (this.props.adaptiveHeight) {
	      var selector = '[data-index="' + this.state.currentSlide + '"]';
	      if (this.refs.list) {
	        var slickList = _reactDom2.default.findDOMNode(this.refs.list);
	        slickList.style.height = slickList.querySelector(selector).offsetHeight + 'px';
	      }
	    }
	  },
	  slideHandler: function slideHandler(index) {
	    var _this = this;
	
	    // Functionality of animateSlide and postSlide is merged into this function
	    // console.log('slideHandler', index);
	    var targetSlide, currentSlide;
	    var targetLeft, currentLeft;
	    var callback;
	
	    if (this.props.waitForAnimate && this.state.animating) {
	      return;
	    }
	
	    if (this.props.fade) {
	      currentSlide = this.state.currentSlide;
	
	      // Don't change slide if it's not infite and current slide is the first or last slide.
	      if (this.props.infinite === false && (index < 0 || index >= this.state.slideCount)) {
	        return;
	      }
	
	      //  Shifting targetSlide back into the range
	      if (index < 0) {
	        targetSlide = index + this.state.slideCount;
	      } else if (index >= this.state.slideCount) {
	        targetSlide = index - this.state.slideCount;
	      } else {
	        targetSlide = index;
	      }
	
	      if (this.props.lazyLoad && this.state.lazyLoadedList.indexOf(targetSlide) < 0) {
	        this.setState({
	          lazyLoadedList: this.state.lazyLoadedList.concat(targetSlide)
	        });
	      }
	
	      callback = function callback() {
	        _this.setState({
	          animating: false
	        });
	        if (_this.props.afterChange) {
	          _this.props.afterChange(targetSlide);
	        }
	        delete _this.animationEndCallback;
	      };
	
	      this.setState({
	        animating: true,
	        currentSlide: targetSlide
	      }, function () {
	        this.animationEndCallback = setTimeout(callback, this.props.speed);
	      });
	
	      if (this.props.beforeChange) {
	        this.props.beforeChange(this.state.currentSlide, targetSlide);
	      }
	
	      this.autoPlay();
	      return;
	    }
	
	    targetSlide = index;
	    if (targetSlide < 0) {
	      if (this.props.infinite === false) {
	        currentSlide = 0;
	      } else if (this.state.slideCount % this.props.slidesToScroll !== 0) {
	        currentSlide = this.state.slideCount - this.state.slideCount % this.props.slidesToScroll;
	      } else {
	        currentSlide = this.state.slideCount + targetSlide;
	      }
	    } else if (targetSlide >= this.state.slideCount) {
	      if (this.props.infinite === false) {
	        currentSlide = this.state.slideCount - this.props.slidesToShow;
	      } else if (this.state.slideCount % this.props.slidesToScroll !== 0) {
	        currentSlide = 0;
	      } else {
	        currentSlide = targetSlide - this.state.slideCount;
	      }
	    } else {
	      currentSlide = targetSlide;
	    }
	
	    // Don't change slide if it's not infite and current slide is the first or last slide page.
	    if (currentSlide === this.state.currentSlide && this.props.infinite === false) {
	      return;
	    }
	
	    targetLeft = (0, _trackHelper.getTrackLeft)((0, _objectAssign2.default)({
	      slideIndex: targetSlide,
	      trackRef: this.refs.track
	    }, this.props, this.state));
	
	    currentLeft = (0, _trackHelper.getTrackLeft)((0, _objectAssign2.default)({
	      slideIndex: currentSlide,
	      trackRef: this.refs.track
	    }, this.props, this.state));
	
	    if (this.props.infinite === false) {
	      targetLeft = currentLeft;
	    }
	
	    if (this.props.beforeChange) {
	      this.props.beforeChange(this.state.currentSlide, currentSlide);
	    }
	
	    if (this.props.lazyLoad) {
	      var loaded = true;
	      var slidesToLoad = [];
	      for (var i = targetSlide; i < targetSlide + this.props.slidesToShow; i++) {
	        loaded = loaded && this.state.lazyLoadedList.indexOf(i) >= 0;
	        if (!loaded) {
	          slidesToLoad.push(i);
	        }
	      }
	      if (!loaded) {
	        this.setState({
	          lazyLoadedList: this.state.lazyLoadedList.concat(slidesToLoad)
	        });
	      }
	    }
	
	    // Slide Transition happens here.
	    // animated transition happens to target Slide and
	    // non - animated transition happens to current Slide
	    // If CSS transitions are false, directly go the current slide.
	
	    if (this.props.useCSS === false) {
	
	      this.setState({
	        currentSlide: currentSlide,
	        trackStyle: (0, _trackHelper.getTrackCSS)((0, _objectAssign2.default)({ left: currentLeft }, this.props, this.state))
	      }, function () {
	        if (this.props.afterChange) {
	          this.props.afterChange(currentSlide);
	        }
	      });
	    } else {
	
	      var nextStateChanges = {
	        animating: false,
	        currentSlide: currentSlide,
	        trackStyle: (0, _trackHelper.getTrackCSS)((0, _objectAssign2.default)({ left: currentLeft }, this.props, this.state)),
	        swipeLeft: null
	      };
	
	      callback = function callback() {
	        _this.setState(nextStateChanges);
	        if (_this.props.afterChange) {
	          _this.props.afterChange(currentSlide);
	        }
	        delete _this.animationEndCallback;
	      };
	
	      this.setState({
	        animating: true,
	        currentSlide: currentSlide,
	        trackStyle: (0, _trackHelper.getTrackAnimateCSS)((0, _objectAssign2.default)({ left: targetLeft }, this.props, this.state))
	      }, function () {
	        this.animationEndCallback = setTimeout(callback, this.props.speed);
	      });
	    }
	
	    this.autoPlay();
	  },
	  swipeDirection: function swipeDirection(touchObject) {
	    var xDist, yDist, r, swipeAngle;
	
	    xDist = touchObject.startX - touchObject.curX;
	    yDist = touchObject.startY - touchObject.curY;
	    r = Math.atan2(yDist, xDist);
	
	    swipeAngle = Math.round(r * 180 / Math.PI);
	    if (swipeAngle < 0) {
	      swipeAngle = 360 - Math.abs(swipeAngle);
	    }
	    if (swipeAngle <= 45 && swipeAngle >= 0 || swipeAngle <= 360 && swipeAngle >= 315) {
	      return this.props.rtl === false ? 'left' : 'right';
	    }
	    if (swipeAngle >= 135 && swipeAngle <= 225) {
	      return this.props.rtl === false ? 'right' : 'left';
	    }
	
	    return 'vertical';
	  },
	  autoPlay: function autoPlay() {
	    var _this2 = this;
	
	    if (this.state.autoPlayTimer) {
	      return;
	    }
	    var play = function play() {
	      if (_this2.state.mounted) {
	        var nextIndex = _this2.props.rtl ? _this2.state.currentSlide - _this2.props.slidesToScroll : _this2.state.currentSlide + _this2.props.slidesToScroll;
	        _this2.slideHandler(nextIndex);
	      }
	    };
	    if (this.props.autoplay) {
	      this.setState({
	        autoPlayTimer: window.setInterval(play, this.props.autoplaySpeed)
	      });
	    }
	  },
	  pause: function pause() {
	    if (this.state.autoPlayTimer) {
	      window.clearInterval(this.state.autoPlayTimer);
	      this.setState({
	        autoPlayTimer: null
	      });
	    }
	  }
	};
	
	exports.default = helpers;

/***/ },

/***/ 685:
/***/ function(module, exports) {

	"use strict";
	
	var initialState = {
	    animating: false,
	    dragging: false,
	    autoPlayTimer: null,
	    currentDirection: 0,
	    currentLeft: null,
	    currentSlide: 0,
	    direction: 1,
	    // listWidth: null,
	    // listHeight: null,
	    // loadIndex: 0,
	    slideCount: null,
	    slideWidth: null,
	    // sliding: false,
	    // slideOffset: 0,
	    swipeLeft: null,
	    touchObject: {
	        startX: 0,
	        startY: 0,
	        curX: 0,
	        curY: 0
	    },
	
	    lazyLoadedList: [],
	
	    // added for react
	    initialized: false,
	    edgeDragged: false,
	    swiped: false, // used by swipeEvent. differentites between touch and swipe.
	    trackStyle: {},
	    trackWidth: 0
	
	    // Removed
	    // transformsEnabled: false,
	    // $nextArrow: null,
	    // $prevArrow: null,
	    // $dots: null,
	    // $list: null,
	    // $slideTrack: null,
	    // $slides: null,
	};
	
	module.exports = initialState;

/***/ },

/***/ 686:
/***/ function(module, exports) {

	'use strict';
	
	var defaultProps = {
	    className: '',
	    accessibility: true,
	    adaptiveHeight: false,
	    arrows: true,
	    autoplay: false,
	    autoplaySpeed: 3000,
	    centerMode: false,
	    centerPadding: '50px',
	    cssEase: 'ease',
	    dots: false,
	    dotsClass: 'slick-dots',
	    draggable: true,
	    easing: 'linear',
	    edgeFriction: 0.35,
	    fade: false,
	    focusOnSelect: false,
	    infinite: true,
	    initialSlide: 0,
	    lazyLoad: false,
	    pauseOnHover: false,
	    responsive: null,
	    rtl: false,
	    slide: 'div',
	    slidesToShow: 1,
	    slidesToScroll: 1,
	    speed: 500,
	    swipe: true,
	    swipeToSlide: false,
	    touchMove: true,
	    touchThreshold: 5,
	    useCSS: true,
	    variableWidth: false,
	    vertical: false,
	    waitForAnimate: true,
	    afterChange: null,
	    beforeChange: null,
	    edgeEvent: null,
	    init: null,
	    swipeEvent: null,
	    // nextArrow, prevArrow are react componets
	    nextArrow: null,
	    prevArrow: null
	};
	
	module.exports = defaultProps;

/***/ },

/***/ 687:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	  Copyright (c) 2016 Jed Watson.
	  Licensed under the MIT License (MIT), see
	  http://jedwatson.github.io/classnames
	*/
	/* global define */
	
	(function () {
		'use strict';
	
		var hasOwn = {}.hasOwnProperty;
	
		function classNames () {
			var classes = [];
	
			for (var i = 0; i < arguments.length; i++) {
				var arg = arguments[i];
				if (!arg) continue;
	
				var argType = typeof arg;
	
				if (argType === 'string' || argType === 'number') {
					classes.push(arg);
				} else if (Array.isArray(arg)) {
					classes.push(classNames.apply(null, arg));
				} else if (argType === 'object') {
					for (var key in arg) {
						if (hasOwn.call(arg, key) && arg[key]) {
							classes.push(key);
						}
					}
				}
			}
	
			return classes.join(' ');
		}
	
		if (typeof module !== 'undefined' && module.exports) {
			module.exports = classNames;
		} else if (true) {
			// register as 'classnames', consistent with npm package name
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
				return classNames;
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else {
			window.classNames = classNames;
		}
	}());


/***/ },

/***/ 688:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.Track = undefined;
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _objectAssign = __webpack_require__(4);
	
	var _objectAssign2 = _interopRequireDefault(_objectAssign);
	
	var _classnames = __webpack_require__(687);
	
	var _classnames2 = _interopRequireDefault(_classnames);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var getSlideClasses = function getSlideClasses(spec) {
	  var slickActive, slickCenter, slickCloned;
	  var centerOffset, index;
	
	  if (spec.rtl) {
	    index = spec.slideCount - 1 - spec.index;
	  } else {
	    index = spec.index;
	  }
	
	  slickCloned = index < 0 || index >= spec.slideCount;
	  if (spec.centerMode) {
	    centerOffset = Math.floor(spec.slidesToShow / 2);
	    slickCenter = (index - spec.currentSlide) % spec.slideCount === 0;
	    if (index > spec.currentSlide - centerOffset - 1 && index <= spec.currentSlide + centerOffset) {
	      slickActive = true;
	    }
	  } else {
	    slickActive = spec.currentSlide <= index && index < spec.currentSlide + spec.slidesToShow;
	  }
	  return (0, _classnames2.default)({
	    'slick-slide': true,
	    'slick-active': slickActive,
	    'slick-center': slickCenter,
	    'slick-cloned': slickCloned
	  });
	};
	
	var getSlideStyle = function getSlideStyle(spec) {
	  var style = {};
	
	  if (spec.variableWidth === undefined || spec.variableWidth === false) {
	    style.width = spec.slideWidth;
	  }
	
	  if (spec.fade) {
	    style.position = 'relative';
	    style.left = -spec.index * spec.slideWidth;
	    style.opacity = spec.currentSlide === spec.index ? 1 : 0;
	    style.transition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase;
	    style.WebkitTransition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase;
	  }
	
	  return style;
	};
	
	var getKey = function getKey(child, fallbackKey) {
	  // key could be a zero
	  return child.key === null || child.key === undefined ? fallbackKey : child.key;
	};
	
	var renderSlides = function renderSlides(spec) {
	  var _this = this;
	
	  var key;
	  var slides = [];
	  var preCloneSlides = [];
	  var postCloneSlides = [];
	  var count = _react2.default.Children.count(spec.children);
	  var child;
	
	  _react2.default.Children.forEach(spec.children, function (elem, index) {
	    var childOnClickOptions = {
	      message: 'children',
	      index: index,
	      slidesToScroll: spec.slidesToScroll,
	      currentSlide: spec.currentSlide
	    };
	
	    if (!spec.lazyLoad | (spec.lazyLoad && spec.lazyLoadedList.indexOf(index) >= 0)) {
	      child = elem;
	    } else {
	      child = _react2.default.createElement('div', null);
	    }
	    var childStyle = getSlideStyle((0, _objectAssign2.default)({}, spec, { index: index }));
	    var slickClasses = getSlideClasses((0, _objectAssign2.default)({ index: index }, spec));
	    var cssClasses;
	
	    if (child.props.className) {
	      cssClasses = (0, _classnames2.default)(slickClasses, child.props.className);
	    } else {
	      cssClasses = slickClasses;
	    }
	
	    slides.push(_react2.default.cloneElement(child, {
	      key: 'original' + getKey(child, index),
	      'data-index': index,
	      className: cssClasses,
	      tabIndex: '-1',
	      style: (0, _objectAssign2.default)({ outline: 'none' }, child.props.style || {}, childStyle),
	      onClick: spec.focusOnSelect.bind(null, childOnClickOptions)
	    }));
	
	    // variableWidth doesn't wrap properly.
	    if (spec.infinite && spec.fade === false) {
	      var infiniteCount = spec.variableWidth ? spec.slidesToShow + 1 : spec.slidesToShow;
	
	      if (index >= count - infiniteCount) {
	        key = -(count - index);
	        preCloneSlides.push(_react2.default.cloneElement(child, {
	          key: 'precloned' + getKey(child, key),
	          'data-index': key,
	          className: cssClasses,
	          style: (0, _objectAssign2.default)({}, child.props.style || {}, childStyle),
	          onClick: _this.props.focusOnSelect.bind(null, childOnClickOptions)
	        }));
	      }
	
	      if (index < infiniteCount) {
	        key = count + index;
	        postCloneSlides.push(_react2.default.cloneElement(child, {
	          key: 'postcloned' + getKey(child, key),
	          'data-index': key,
	          className: cssClasses,
	          style: (0, _objectAssign2.default)({}, child.props.style || {}, childStyle),
	          onClick: _this.props.focusOnSelect.bind(null, childOnClickOptions)
	        }));
	      }
	    }
	  });
	
	  if (spec.rtl) {
	    return preCloneSlides.concat(slides, postCloneSlides).reverse();
	  } else {
	    return preCloneSlides.concat(slides, postCloneSlides);
	  }
	};
	
	var Track = exports.Track = _react2.default.createClass({
	  displayName: 'Track',
	
	  render: function render() {
	    var slides = renderSlides.call(this, this.props);
	    return _react2.default.createElement(
	      'div',
	      { className: 'slick-track', style: this.props.trackStyle },
	      slides
	    );
	  }
	});

/***/ },

/***/ 689:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.Dots = undefined;
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _classnames = __webpack_require__(687);
	
	var _classnames2 = _interopRequireDefault(_classnames);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var getDotCount = function getDotCount(spec) {
	  var dots;
	  dots = Math.ceil(spec.slideCount / spec.slidesToScroll);
	  return dots;
	};
	
	var Dots = exports.Dots = _react2.default.createClass({
	  displayName: 'Dots',
	
	
	  clickHandler: function clickHandler(options, e) {
	    // In Autoplay the focus stays on clicked button even after transition
	    // to next slide. That only goes away by click somewhere outside
	    e.preventDefault();
	    this.props.clickHandler(options);
	  },
	  render: function render() {
	    var _this = this;
	
	    var dotCount = getDotCount({
	      slideCount: this.props.slideCount,
	      slidesToScroll: this.props.slidesToScroll
	    });
	
	    // Apply join & split to Array to pre-fill it for IE8
	    //
	    // Credit: http://stackoverflow.com/a/13735425/1849458
	    var dots = Array.apply(null, Array(dotCount + 1).join('0').split('')).map(function (x, i) {
	
	      var leftBound = i * _this.props.slidesToScroll;
	      var rightBound = i * _this.props.slidesToScroll + (_this.props.slidesToScroll - 1);
	      var className = (0, _classnames2.default)({
	        'slick-active': _this.props.currentSlide >= leftBound && _this.props.currentSlide <= rightBound
	      });
	
	      var dotOptions = {
	        message: 'dots',
	        index: i,
	        slidesToScroll: _this.props.slidesToScroll,
	        currentSlide: _this.props.currentSlide
	      };
	
	      return _react2.default.createElement(
	        'li',
	        { key: i, className: className },
	        _react2.default.createElement(
	          'button',
	          { onClick: _this.clickHandler.bind(_this, dotOptions) },
	          i + 1
	        )
	      );
	    });
	
	    return _react2.default.createElement(
	      'ul',
	      { className: this.props.dotsClass, style: { display: 'block' } },
	      dots
	    );
	  }
	});

/***/ },

/***/ 690:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.NextArrow = exports.PrevArrow = undefined;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _classnames = __webpack_require__(687);
	
	var _classnames2 = _interopRequireDefault(_classnames);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var PrevArrow = exports.PrevArrow = _react2.default.createClass({
	  displayName: 'PrevArrow',
	
	
	  clickHandler: function clickHandler(options, e) {
	    if (e) {
	      e.preventDefault();
	    }
	    this.props.clickHandler(options, e);
	  },
	  render: function render() {
	    var prevClasses = { 'slick-arrow': true, 'slick-prev': true };
	    var prevHandler = this.clickHandler.bind(this, { message: 'previous' });
	
	    if (!this.props.infinite && (this.props.currentSlide === 0 || this.props.slideCount <= this.props.slidesToShow)) {
	      prevClasses['slick-disabled'] = true;
	      prevHandler = null;
	    }
	
	    var prevArrowProps = {
	      key: '0',
	      'data-role': 'none',
	      className: (0, _classnames2.default)(prevClasses),
	      style: { display: 'block' },
	      onClick: prevHandler
	    };
	    var prevArrow;
	
	    if (this.props.prevArrow) {
	      prevArrow = _react2.default.cloneElement(this.props.prevArrow, prevArrowProps);
	    } else {
	      prevArrow = _react2.default.createElement(
	        'button',
	        _extends({ key: '0', type: 'button' }, prevArrowProps),
	        ' Previous'
	      );
	    }
	
	    return prevArrow;
	  }
	});
	
	var NextArrow = exports.NextArrow = _react2.default.createClass({
	  displayName: 'NextArrow',
	
	  clickHandler: function clickHandler(options, e) {
	    if (e) {
	      e.preventDefault();
	    }
	    this.props.clickHandler(options, e);
	  },
	  render: function render() {
	    var nextClasses = { 'slick-arrow': true, 'slick-next': true };
	    var nextHandler = this.clickHandler.bind(this, { message: 'next' });
	
	    if (!this.props.infinite) {
	      if (this.props.centerMode && this.props.currentSlide >= this.props.slideCount - 1) {
	        nextClasses['slick-disabled'] = true;
	        nextHandler = null;
	      } else {
	        if (this.props.currentSlide >= this.props.slideCount - this.props.slidesToShow) {
	          nextClasses['slick-disabled'] = true;
	          nextHandler = null;
	        }
	      }
	
	      if (this.props.slideCount <= this.props.slidesToShow) {
	        nextClasses['slick-disabled'] = true;
	        nextHandler = null;
	      }
	    }
	
	    var nextArrowProps = {
	      key: '1',
	      'data-role': 'none',
	      className: (0, _classnames2.default)(nextClasses),
	      style: { display: 'block' },
	      onClick: nextHandler
	    };
	
	    var nextArrow;
	
	    if (this.props.nextArrow) {
	      nextArrow = _react2.default.cloneElement(this.props.nextArrow, nextArrowProps);
	    } else {
	      nextArrow = _react2.default.createElement(
	        'button',
	        _extends({ key: '1', type: 'button' }, nextArrowProps),
	        ' Next'
	      );
	    }
	
	    return nextArrow;
	  }
	});

/***/ },

/***/ 691:
/***/ function(module, exports, __webpack_require__) {

	var camel2hyphen = __webpack_require__(692);
	
	var isDimension = function (feature) {
	  var re = /[height|width]$/;
	  return re.test(feature);
	};
	
	var obj2mq = function (obj) {
	  var mq = '';
	  var features = Object.keys(obj);
	  features.forEach(function (feature, index) {
	    var value = obj[feature];
	    feature = camel2hyphen(feature);
	    // Add px to dimension features
	    if (isDimension(feature) && typeof value === 'number') {
	      value = value + 'px';
	    }
	    if (value === true) {
	      mq += feature;
	    } else if (value === false) {
	      mq += 'not ' + feature;
	    } else {
	      mq += '(' + feature + ': ' + value + ')';
	    }
	    if (index < features.length-1) {
	      mq += ' and '
	    }
	  });
	  return mq;
	};
	
	var json2mq = function (query) {
	  var mq = '';
	  if (typeof query === 'string') {
	    return query;
	  }
	  // Handling array of media queries
	  if (query instanceof Array) {
	    query.forEach(function (q, index) {
	      mq += obj2mq(q);
	      if (index < query.length-1) {
	        mq += ', '
	      }
	    });
	    return mq;
	  }
	  // Handling single media query
	  return obj2mq(query);
	};
	
	module.exports = json2mq;

/***/ },

/***/ 692:
/***/ function(module, exports) {

	var camel2hyphen = function (str) {
	  return str
	          .replace(/[A-Z]/g, function (match) {
	            return '-' + match.toLowerCase();
	          })
	          .toLowerCase();
	};
	
	module.exports = camel2hyphen;

/***/ },

/***/ 693:
/***/ function(module, exports, __webpack_require__) {

	var canUseDOM = __webpack_require__(694);
	var enquire = canUseDOM && __webpack_require__(695);
	var json2mq = __webpack_require__(691);
	
	var ResponsiveMixin = {
	  media: function (query, handler) {
	    query = json2mq(query);
	    if (typeof handler === 'function') {
	      handler = {
	        match: handler
	      };
	    }
	    enquire.register(query, handler);
	
	    // Queue the handlers to unregister them at unmount  
	    if (! this._responsiveMediaHandlers) {
	      this._responsiveMediaHandlers = [];
	    }
	    this._responsiveMediaHandlers.push({query: query, handler: handler});
	  },
	  componentWillUnmount: function () {
	    if (this._responsiveMediaHandlers) {
	      this._responsiveMediaHandlers.forEach(function(obj) {
	        enquire.unregister(obj.query, obj.handler);
	      });
	    }
	  }
	};
	
	module.exports = ResponsiveMixin;

/***/ },

/***/ 694:
/***/ function(module, exports) {

	var canUseDOM = !!(
	  typeof window !== 'undefined' &&
	  window.document &&
	  window.document.createElement
	);
	
	module.exports = canUseDOM;

/***/ },

/***/ 695:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * enquire.js v2.1.1 - Awesome Media Queries in JavaScript
	 * Copyright (c) 2014 Nick Williams - http://wicky.nillia.ms/enquire.js
	 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
	 */
	
	;(function (name, context, factory) {
		var matchMedia = window.matchMedia;
	
		if (typeof module !== 'undefined' && module.exports) {
			module.exports = factory(matchMedia);
		}
		else if (true) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return (context[name] = factory(matchMedia));
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else {
			context[name] = factory(matchMedia);
		}
	}('enquire', this, function (matchMedia) {
	
		'use strict';
	
	    /*jshint unused:false */
	    /**
	     * Helper function for iterating over a collection
	     *
	     * @param collection
	     * @param fn
	     */
	    function each(collection, fn) {
	        var i      = 0,
	            length = collection.length,
	            cont;
	
	        for(i; i < length; i++) {
	            cont = fn(collection[i], i);
	            if(cont === false) {
	                break; //allow early exit
	            }
	        }
	    }
	
	    /**
	     * Helper function for determining whether target object is an array
	     *
	     * @param target the object under test
	     * @return {Boolean} true if array, false otherwise
	     */
	    function isArray(target) {
	        return Object.prototype.toString.apply(target) === '[object Array]';
	    }
	
	    /**
	     * Helper function for determining whether target object is a function
	     *
	     * @param target the object under test
	     * @return {Boolean} true if function, false otherwise
	     */
	    function isFunction(target) {
	        return typeof target === 'function';
	    }
	
	    /**
	     * Delegate to handle a media query being matched and unmatched.
	     *
	     * @param {object} options
	     * @param {function} options.match callback for when the media query is matched
	     * @param {function} [options.unmatch] callback for when the media query is unmatched
	     * @param {function} [options.setup] one-time callback triggered the first time a query is matched
	     * @param {boolean} [options.deferSetup=false] should the setup callback be run immediately, rather than first time query is matched?
	     * @constructor
	     */
	    function QueryHandler(options) {
	        this.options = options;
	        !options.deferSetup && this.setup();
	    }
	    QueryHandler.prototype = {
	
	        /**
	         * coordinates setup of the handler
	         *
	         * @function
	         */
	        setup : function() {
	            if(this.options.setup) {
	                this.options.setup();
	            }
	            this.initialised = true;
	        },
	
	        /**
	         * coordinates setup and triggering of the handler
	         *
	         * @function
	         */
	        on : function() {
	            !this.initialised && this.setup();
	            this.options.match && this.options.match();
	        },
	
	        /**
	         * coordinates the unmatch event for the handler
	         *
	         * @function
	         */
	        off : function() {
	            this.options.unmatch && this.options.unmatch();
	        },
	
	        /**
	         * called when a handler is to be destroyed.
	         * delegates to the destroy or unmatch callbacks, depending on availability.
	         *
	         * @function
	         */
	        destroy : function() {
	            this.options.destroy ? this.options.destroy() : this.off();
	        },
	
	        /**
	         * determines equality by reference.
	         * if object is supplied compare options, if function, compare match callback
	         *
	         * @function
	         * @param {object || function} [target] the target for comparison
	         */
	        equals : function(target) {
	            return this.options === target || this.options.match === target;
	        }
	
	    };
	    /**
	     * Represents a single media query, manages it's state and registered handlers for this query
	     *
	     * @constructor
	     * @param {string} query the media query string
	     * @param {boolean} [isUnconditional=false] whether the media query should run regardless of whether the conditions are met. Primarily for helping older browsers deal with mobile-first design
	     */
	    function MediaQuery(query, isUnconditional) {
	        this.query = query;
	        this.isUnconditional = isUnconditional;
	        this.handlers = [];
	        this.mql = matchMedia(query);
	
	        var self = this;
	        this.listener = function(mql) {
	            self.mql = mql;
	            self.assess();
	        };
	        this.mql.addListener(this.listener);
	    }
	    MediaQuery.prototype = {
	
	        /**
	         * add a handler for this query, triggering if already active
	         *
	         * @param {object} handler
	         * @param {function} handler.match callback for when query is activated
	         * @param {function} [handler.unmatch] callback for when query is deactivated
	         * @param {function} [handler.setup] callback for immediate execution when a query handler is registered
	         * @param {boolean} [handler.deferSetup=false] should the setup callback be deferred until the first time the handler is matched?
	         */
	        addHandler : function(handler) {
	            var qh = new QueryHandler(handler);
	            this.handlers.push(qh);
	
	            this.matches() && qh.on();
	        },
	
	        /**
	         * removes the given handler from the collection, and calls it's destroy methods
	         * 
	         * @param {object || function} handler the handler to remove
	         */
	        removeHandler : function(handler) {
	            var handlers = this.handlers;
	            each(handlers, function(h, i) {
	                if(h.equals(handler)) {
	                    h.destroy();
	                    return !handlers.splice(i,1); //remove from array and exit each early
	                }
	            });
	        },
	
	        /**
	         * Determine whether the media query should be considered a match
	         * 
	         * @return {Boolean} true if media query can be considered a match, false otherwise
	         */
	        matches : function() {
	            return this.mql.matches || this.isUnconditional;
	        },
	
	        /**
	         * Clears all handlers and unbinds events
	         */
	        clear : function() {
	            each(this.handlers, function(handler) {
	                handler.destroy();
	            });
	            this.mql.removeListener(this.listener);
	            this.handlers.length = 0; //clear array
	        },
	
	        /*
	         * Assesses the query, turning on all handlers if it matches, turning them off if it doesn't match
	         */
	        assess : function() {
	            var action = this.matches() ? 'on' : 'off';
	
	            each(this.handlers, function(handler) {
	                handler[action]();
	            });
	        }
	    };
	    /**
	     * Allows for registration of query handlers.
	     * Manages the query handler's state and is responsible for wiring up browser events
	     *
	     * @constructor
	     */
	    function MediaQueryDispatch () {
	        if(!matchMedia) {
	            throw new Error('matchMedia not present, legacy browsers require a polyfill');
	        }
	
	        this.queries = {};
	        this.browserIsIncapable = !matchMedia('only all').matches;
	    }
	
	    MediaQueryDispatch.prototype = {
	
	        /**
	         * Registers a handler for the given media query
	         *
	         * @param {string} q the media query
	         * @param {object || Array || Function} options either a single query handler object, a function, or an array of query handlers
	         * @param {function} options.match fired when query matched
	         * @param {function} [options.unmatch] fired when a query is no longer matched
	         * @param {function} [options.setup] fired when handler first triggered
	         * @param {boolean} [options.deferSetup=false] whether setup should be run immediately or deferred until query is first matched
	         * @param {boolean} [shouldDegrade=false] whether this particular media query should always run on incapable browsers
	         */
	        register : function(q, options, shouldDegrade) {
	            var queries         = this.queries,
	                isUnconditional = shouldDegrade && this.browserIsIncapable;
	
	            if(!queries[q]) {
	                queries[q] = new MediaQuery(q, isUnconditional);
	            }
	
	            //normalise to object in an array
	            if(isFunction(options)) {
	                options = { match : options };
	            }
	            if(!isArray(options)) {
	                options = [options];
	            }
	            each(options, function(handler) {
	                queries[q].addHandler(handler);
	            });
	
	            return this;
	        },
	
	        /**
	         * unregisters a query and all it's handlers, or a specific handler for a query
	         *
	         * @param {string} q the media query to target
	         * @param {object || function} [handler] specific handler to unregister
	         */
	        unregister : function(q, handler) {
	            var query = this.queries[q];
	
	            if(query) {
	                if(handler) {
	                    query.removeHandler(handler);
	                }
	                else {
	                    query.clear();
	                    delete this.queries[q];
	                }
	            }
	
	            return this;
	        }
	    };
	
		return new MediaQueryDispatch();
	
	}));

/***/ },

/***/ 786:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _reactRedux = __webpack_require__(349);
	
	var _studio = __webpack_require__(787);
	
	var _StudioView = __webpack_require__(788);
	
	var _StudioView2 = _interopRequireDefault(_StudioView);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/*  Object of action creators (can also be function that returns object).
	    Keys will be passed as props to presentational components. Here we are
	    implementing our wrapper around increment; the component doesn't care   */
	
	var mapActionCreators = {
	    increment: function increment() {
	        return (0, _studio.increment)(1);
	    },
	    fetchStudio: _studio.fetchStudio
	};
	
	/*  This is a container component. Notice it does not contain any JSX,
	    nor does it import React. This component is **only** responsible for
	    wiring in the actions and state necessary to render a presentational
	    component - in this case, the counter:   */
	
	var mapStateToProps = function mapStateToProps(state) {
	    return {
	        studio: state.studio.studio
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
	
	exports.default = (0, _reactRedux.connect)(mapStateToProps, mapActionCreators)(_StudioView2.default);

/***/ },

/***/ 787:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.actions = exports.fetchStudio = exports.STUDIO_FETCHED = exports.STUDIO_COUNTER_INCREMENT = undefined;
	
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
	var STUDIO_COUNTER_INCREMENT = exports.STUDIO_COUNTER_INCREMENT = 'STUDIO_COUNTER_INCREMENT';
	var STUDIO_FETCHED = exports.STUDIO_FETCHED = 'STUDIO_FETCHED';
	
	// ------------------------------------
	// Actions
	// ------------------------------------
	function increment() {
	  var value = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
	
	  return {
	    type: STUDIO_COUNTER_INCREMENT,
	    payload: value
	  };
	}
	
	/*  This is a thunk, meaning it is a function that immediately
	    returns a function for lazy evaluation. It is incredibly useful for
	    creating async actions, especially when combined with redux-thunk!
	
	    NOTE: This is solely for demonstration purposes. In a real application,
	    you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
	    reducer take care of this logic.  */
	
	var fetchStudio = exports.fetchStudio = function fetchStudio() {
	  return function (dispatch, getState) {
	    return new _promise2.default(function (resolve) {
	      console.log(getState().router.locationBeforeTransitions.pathname.split("/")[2]);
	      dispatch({
	        type: STUDIO_FETCHED,
	        payload: {
	          imageSrc: ['http://localhost:3000/recordingStudio1.jpg', 'http://localhost:3000/recordingStudio2.jpg', 'http://localhost:3000/recordingStudio3.jpg']
	        }
	      });
	      resolve();
	    });
	  };
	};
	
	var actions = exports.actions = {
	  increment: increment,
	  fetchStudio: fetchStudio
	};
	
	// ------------------------------------
	// Action Handlers
	// ------------------------------------
	var ACTION_HANDLERS = (_ACTION_HANDLERS = {}, (0, _defineProperty3.default)(_ACTION_HANDLERS, STUDIO_COUNTER_INCREMENT, function (state, action) {
	  return (0, _assign2.default)({}, state.studio, {
	    studio: state.studiosList,
	    fetched: true
	  });
	}), (0, _defineProperty3.default)(_ACTION_HANDLERS, STUDIO_FETCHED, function (state, action) {
	  return (0, _assign2.default)({}, state.studio, {
	    studio: action.payload,
	    fetched: true
	  });
	}), _ACTION_HANDLERS);
	
	// ------------------------------------
	// Reducer
	// ------------------------------------
	var initialState = {
	  fetched: false,
	  studio: {}
	};
	function studioReducer() {
	  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
	  var action = arguments[1];
	
	  var handler = ACTION_HANDLERS[action.type];
	  return handler ? handler(state, action) : state;
	}

/***/ },

/***/ 788:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.StudioView = undefined;
	
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
	
	var _StudioView = __webpack_require__(789);
	
	var _StudioView2 = _interopRequireDefault(_StudioView);
	
	var _Card = __webpack_require__(643);
	
	var _StudioTile = __webpack_require__(637);
	
	var _StudioTile2 = _interopRequireDefault(_StudioTile);
	
	var _Gallery = __webpack_require__(791);
	
	var _Gallery2 = _interopRequireDefault(_Gallery);
	
	var _ReviewCard = __webpack_require__(827);
	
	var _ReviewCard2 = _interopRequireDefault(_ReviewCard);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function makeUnsplashSrc(id) {
	    return 'https://images.unsplash.com/photo-' + id + '?dpr=2&auto=format&w=1024&h=1024';
	}
	function makeUnsplashSrcSet(id, size) {
	    return 'https://images.unsplash.com/photo-' + id + '?dpr=2&auto=format&w=' + size + ' ' + size + 'w';
	}
	function makeUnsplashThumbnail(id) {
	    var orientation = arguments.length <= 1 || arguments[1] === undefined ? 'landscape' : arguments[1];
	
	    var dimensions = orientation === 'square' ? 'w=300&h=300' : 'w=240&h=159';
	
	    return 'https://images.unsplash.com/photo-' + id + '?dpr=2&auto=format&crop=faces&fit=crop&' + dimensions;
	}
	
	// Unsplash images from the "Spirit Animals" collection
	// https://unsplash.com/collections/158825/spirit-animals
	
	var DEFAULT_IMAGES = [{ id: '1470619549108-b85c56fe5be8', caption: 'Photo by Alan Emery', orientation: 'square', useForDemo: true }, // https://unsplash.com/photos/SYzUF6XcWBY (Flamingo)
	{ id: '1471079502516-250c19af6928', caption: 'Photo by Jeremy Bishop', orientation: 'landscape', useForDemo: true }, // https://unsplash.com/photos/GIpGxe2_cT4 (Turtle)
	{ id: '1454023492550-5696f8ff10e1', caption: 'Photo by Jessica Weiller', orientation: 'landscape', useForDemo: true }, // https://unsplash.com/photos/LmVSKeDy6EA (Tiger)
	{ id: '1470854989922-5be2f7456d78', caption: 'Photo by Piotr Łaskawski', orientation: 'landscape', useForDemo: true }, // https://unsplash.com/photos/GXMr7BadXQo (Hedgehog)
	{ id: '1470317596697-cbdeda56f999', caption: 'Photo by Michel Bosma', orientation: 'landscape', useForDemo: true }];
	var THUMBNAIL_IMAGES = [{ id: '1454991727061-be514eae86f7', caption: 'Photo by Thomas Kelley', orientation: 'square', useForDemo: true }, // https://unsplash.com/photos/t20pc32VbrU (Hump Back Whale)
	{ id: '1455717974081-0436a066bb96', caption: 'Photo by Teddy Kelley', orientation: 'landscape', useForDemo: true }, // https://unsplash.com/photos/cmKPOUgdmWc (Deer)
	{ id: '1460899960812-f6ee1ecaf117', caption: 'Photo by Jay Ruzesky', orientation: 'landscape', useForDemo: true }, // https://unsplash.com/photos/h13Y8vyIXNU (Walrus)
	{ id: '1456926631375-92c8ce872def', caption: 'Photo by Gwen Weustink', orientation: 'landscape', useForDemo: true }, // https://unsplash.com/photos/I3C1sSXj1i8 (Leopard)
	{ id: '1452274381522-521513015433', caption: 'Photo by Adam Willoughby-Knox', orientation: 'landscape', useForDemo: true }, // https://unsplash.com/photos/_snqARKTgoc (Mother and Cubs)
	{ id: '1471145653077-54c6f0aae511', caption: 'Photo by Boris Smokrovic', orientation: 'landscape' }, // https://unsplash.com/photos/n0feC_PWFdk (Dragonfly)
	{ id: '1471005197911-88e9d4a7834d', caption: 'Photo by Gaetano Cessati', orientation: 'landscape' }, // https://unsplash.com/photos/YOX8ZMTo7hk (Baby Crocodile)
	{ id: '1470583190240-bd6bbde8a569', caption: 'Photo by Alan Emery', orientation: 'landscape' }, // https://unsplash.com/photos/emTCWiq2txk (Beetle)
	{ id: '1470688090067-6d429c0b2600', caption: 'Photo by Ján Jakub Naništa', orientation: 'landscape' }, // https://unsplash.com/photos/xqjO-lx39B4 (Scottish Highland Cow)
	{ id: '1470742292565-de43c4b02b57', caption: 'Photo by Eric Knoll', orientation: 'landscape' }];
	
	var styles = {
	    descriptionCard: {
	        margin: "20px"
	    },
	    facilities: {
	        width: '40%',
	        display: 'inline-block',
	        margin: '0 4%'
	    }
	};
	
	var StudioView = exports.StudioView = function (_React$Component) {
	    (0, _inherits3.default)(StudioView, _React$Component);
	
	    function StudioView() {
	        (0, _classCallCheck3.default)(this, StudioView);
	
	        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(StudioView).call(this));
	
	        _this.getStudio = _this.getStudio.bind(_this);
	
	        return _this;
	    }
	    //fires only on first render of component
	
	
	    (0, _createClass3.default)(StudioView, [{
	        key: 'componentWillMount',
	        value: function componentWillMount() {
	            this.getStudio();
	            if (!this.props.reviews) {
	                //mpve this logic to reducers
	                this.reviews = [{
	                    name: "Gurminder",
	                    date: "14-Jan-2016",
	                    thumbnail: 'http://localhost:3000/jsa-128.jpg',
	                    review: "This Studio is one of the best in class I have seen in my entire career. I would highly recommend this studio."
	                }, {
	                    name: "Juliano",
	                    date: "20-September-2016",
	                    thumbnail: 'http://localhost:3000/jsa-128.jpg',
	                    review: "This was okk! Go at your own risk."
	                }];
	            }
	        }
	        //imp for memry leaks
	
	    }, {
	        key: 'componentWillUnmount',
	        value: function componentWillUnmount() {}
	    }, {
	        key: 'getStudio',
	        value: function getStudio() {
	            this.props.fetchStudio();
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	
	            return _react2.default.createElement(
	                'div',
	                { className: _StudioView2.default.studioContainer },
	                _react2.default.createElement(_Gallery2.default, { images: THUMBNAIL_IMAGES.map(function (_ref) {
	                        var caption = _ref.caption;
	                        var id = _ref.id;
	                        var orientation = _ref.orientation;
	                        var useForDemo = _ref.useForDemo;
	                        return {
	                            src: makeUnsplashSrc(id),
	                            thumbnail: makeUnsplashThumbnail(id, orientation),
	                            srcset: [makeUnsplashSrcSet(id, 1024), makeUnsplashSrcSet(id, 800), makeUnsplashSrcSet(id, 500), makeUnsplashSrcSet(id, 320)],
	                            caption: caption,
	                            orientation: orientation,
	                            useForDemo: useForDemo
	                        };
	                    }), showThumbnails: true }),
	                _react2.default.createElement(
	                    'div',
	                    { style: styles.descriptionCard },
	                    _react2.default.createElement(
	                        'h4',
	                        null,
	                        'Description'
	                    ),
	                    _react2.default.createElement(
	                        'p',
	                        null,
	                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi. Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque. Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.'
	                    )
	                ),
	                _react2.default.createElement(
	                    'div',
	                    { style: styles.descriptionCard },
	                    _react2.default.createElement(
	                        'h4',
	                        null,
	                        'Facilities'
	                    ),
	                    _react2.default.createElement(
	                        'ul',
	                        null,
	                        _react2.default.createElement(
	                            'li',
	                            null,
	                            'Hi Fi Sound'
	                        ),
	                        _react2.default.createElement(
	                            'li',
	                            null,
	                            'Wireless Connectivity'
	                        ),
	                        _react2.default.createElement(
	                            'li',
	                            null,
	                            'Fully Sound Proof'
	                        )
	                    )
	                ),
	                _react2.default.createElement(
	                    'div',
	                    { style: styles.descriptionCard },
	                    _react2.default.createElement(
	                        'h4',
	                        null,
	                        'Reviews'
	                    ),
	                    _react2.default.createElement(_ReviewCard2.default, { reviews: this.reviews })
	                )
	            );
	        }
	    }]);
	    return StudioView;
	}(_react2.default.Component);
	
	StudioView.propTypes = {
	    studio: _react2.default.PropTypes.object.isRequired,
	    fetchStudio: _react2.default.PropTypes.func.isRequired
	
	};
	exports.default = StudioView;

/***/ },

/***/ 789:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(790);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(576)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(true) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept(790, function() {
				var newContent = __webpack_require__(790);
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 790:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(575)();
	// imports
	
	
	// module
	exports.push([module.id, "", "", {"version":3,"sources":[],"names":[],"mappings":"","file":"StudioView.scss","sourceRoot":"webpack://"}]);
	
	// exports


/***/ },

/***/ 791:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _Gallery = __webpack_require__(792);
	
	var _Gallery2 = _interopRequireDefault(_Gallery);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _Gallery2.default;

/***/ },

/***/ 792:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
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
	
	var _noImportant = __webpack_require__(793);
	
	var _reactImages = __webpack_require__(802);
	
	var _reactImages2 = _interopRequireDefault(_reactImages);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Gallery = function (_Component) {
	  (0, _inherits3.default)(Gallery, _Component);
	
	  function Gallery() {
	    (0, _classCallCheck3.default)(this, Gallery);
	
	    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Gallery).call(this));
	
	    _this.state = {
	      lightboxIsOpen: false,
	      currentImage: 0,
	      backdropClosesModal: true
	    };
	
	    _this.closeLightbox = _this.closeLightbox.bind(_this);
	    _this.gotoNext = _this.gotoNext.bind(_this);
	    _this.gotoPrevious = _this.gotoPrevious.bind(_this);
	    _this.gotoImage = _this.gotoImage.bind(_this);
	    _this.handleClickImage = _this.handleClickImage.bind(_this);
	    _this.openLightbox = _this.openLightbox.bind(_this);
	    return _this;
	  }
	
	  (0, _createClass3.default)(Gallery, [{
	    key: 'openLightbox',
	    value: function openLightbox(index, event) {
	      event.preventDefault();
	      this.setState({
	        currentImage: index,
	        lightboxIsOpen: true
	      });
	    }
	  }, {
	    key: 'closeLightbox',
	    value: function closeLightbox() {
	      this.setState({
	        currentImage: 0,
	        lightboxIsOpen: false
	      });
	    }
	  }, {
	    key: 'gotoPrevious',
	    value: function gotoPrevious() {
	      this.setState({
	        currentImage: this.state.currentImage - 1
	      });
	    }
	  }, {
	    key: 'gotoNext',
	    value: function gotoNext() {
	      this.setState({
	        currentImage: this.state.currentImage + 1
	      });
	    }
	  }, {
	    key: 'gotoImage',
	    value: function gotoImage(index) {
	      this.setState({
	        currentImage: index
	      });
	    }
	  }, {
	    key: 'handleClickImage',
	    value: function handleClickImage() {
	      if (this.state.currentImage === this.props.images.length - 1) return;
	
	      this.gotoNext();
	    }
	  }, {
	    key: 'renderGallery',
	    value: function renderGallery() {
	      var _this2 = this;
	
	      var images = this.props.images;
	
	
	      if (!images) return;
	
	      var gallery = images.filter(function (i) {
	        return i.useForDemo;
	      }).map(function (obj, i) {
	        return _react2.default.createElement(
	          'a',
	          {
	            href: obj.src,
	            className: (0, _noImportant.css)(classes.thumbnail, classes[obj.orientation]),
	            key: i,
	            onClick: function onClick(e) {
	              return _this2.openLightbox(i, e);
	            }
	          },
	          _react2.default.createElement('img', { src: obj.thumbnail, className: (0, _noImportant.css)(classes.source) })
	        );
	      });
	
	      return _react2.default.createElement(
	        'div',
	        { className: (0, _noImportant.css)(classes.gallery) },
	        gallery
	      );
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        { className: 'section' },
	        this.props.heading && _react2.default.createElement(
	          'h2',
	          null,
	          this.props.heading
	        ),
	        this.props.subheading && _react2.default.createElement(
	          'p',
	          null,
	          this.props.subheading
	        ),
	        this.renderGallery(),
	        _react2.default.createElement(_reactImages2.default, {
	          currentImage: this.state.currentImage,
	          backdropClosesModal: this.state.backdropClosesModal,
	          images: this.props.images,
	          isOpen: this.state.lightboxIsOpen,
	          onClickImage: this.handleClickImage,
	          onClickNext: this.gotoNext,
	          onClickPrev: this.gotoPrevious,
	          onClickThumbnail: this.gotoImage,
	          onClose: this.closeLightbox,
	          showThumbnails: this.props.showThumbnails,
	          theme: this.props.theme
	        })
	      );
	    }
	  }]);
	  return Gallery;
	}(_react.Component);
	
	;
	
	Gallery.displayName = 'Gallery';
	Gallery.propTypes = {
	  heading: _react.PropTypes.string,
	  images: _react.PropTypes.array,
	  showThumbnails: _react.PropTypes.bool,
	  subheading: _react.PropTypes.string
	};
	
	var gutter = {
	  small: 2,
	  large: 4
	};
	var classes = _noImportant.StyleSheet.create({
	  gallery: {
	    marginRight: -gutter.small,
	    overflow: 'hidden',
	
	    '@media (min-width: 500px)': {
	      marginRight: -gutter.large
	    }
	  },
	
	  // anchor
	  thumbnail: {
	    boxSizing: 'border-box',
	    display: 'block',
	    float: 'left',
	    lineHeight: 0,
	    paddingRight: gutter.small,
	    paddingBottom: gutter.small,
	    overflow: 'hidden',
	
	    '@media (min-width: 500px)': {
	      paddingRight: gutter.large,
	      paddingBottom: gutter.large
	    }
	  },
	
	  // orientation
	  landscape: {
	    width: '30%'
	  },
	  square: {
	    paddingBottom: 0,
	    width: '40%',
	
	    '@media (min-width: 500px)': {
	      paddingBottom: 0
	    }
	  },
	
	  // actual <img />
	  source: {
	    border: 0,
	    display: 'block',
	    height: 'auto',
	    maxWidth: '100%',
	    width: 'auto'
	  }
	});
	
	exports.default = Gallery;

/***/ },

/***/ 793:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(794);


/***/ },

/***/ 794:
/***/ function(module, exports, __webpack_require__) {

	// Module with the same interface as the core aphrodite module,
	// except that styles injected do not automatically have !important
	// appended to them.
	//
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _inject = __webpack_require__(795);
	
	var _indexJs = __webpack_require__(801);
	
	var css = function css() {
	    for (var _len = arguments.length, styleDefinitions = Array(_len), _key = 0; _key < _len; _key++) {
	        styleDefinitions[_key] = arguments[_key];
	    }
	
	    var useImportant = false; // Don't append !important to style definitions
	    return (0, _inject.injectAndGetClassName)(useImportant, styleDefinitions);
	};
	
	exports.StyleSheet = _indexJs.StyleSheet;
	exports.StyleSheetServer = _indexJs.StyleSheetServer;
	exports.StyleSheetTestUtils = _indexJs.StyleSheetTestUtils;
	exports.css = css;

/***/ },

/***/ 795:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _asap = __webpack_require__(796);
	
	var _asap2 = _interopRequireDefault(_asap);
	
	var _generate = __webpack_require__(798);
	
	var _util = __webpack_require__(800);
	
	// The current <style> tag we are inserting into, or null if we haven't
	// inserted anything yet. We could find this each time using
	// `document.querySelector("style[data-aphrodite"])`, but holding onto it is
	// faster.
	var styleTag = null;
	
	// Inject a string of styles into a <style> tag in the head of the document. This
	// will automatically create a style tag and then continue to use it for
	// multiple injections. It will also use a style tag with the `data-aphrodite`
	// tag on it if that exists in the DOM. This could be used for e.g. reusing the
	// same style tag that server-side rendering inserts.
	var injectStyleTag = function injectStyleTag(cssContents) {
	    if (styleTag == null) {
	        // Try to find a style tag with the `data-aphrodite` attribute first.
	        styleTag = document.querySelector("style[data-aphrodite]");
	
	        // If that doesn't work, generate a new style tag.
	        if (styleTag == null) {
	            // Taken from
	            // http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
	            var head = document.head || document.getElementsByTagName('head')[0];
	            styleTag = document.createElement('style');
	
	            styleTag.type = 'text/css';
	            styleTag.setAttribute("data-aphrodite", "");
	            head.appendChild(styleTag);
	        }
	    }
	
	    if (styleTag.styleSheet) {
	        styleTag.styleSheet.cssText += cssContents;
	    } else {
	        styleTag.appendChild(document.createTextNode(cssContents));
	    }
	};
	
	// Custom handlers for stringifying CSS values that have side effects
	// (such as fontFamily, which can cause @font-face rules to be injected)
	var stringHandlers = {
	    // With fontFamily we look for objects that are passed in and interpret
	    // them as @font-face rules that we need to inject. The value of fontFamily
	    // can either be a string (as normal), an object (a single font face), or
	    // an array of objects and strings.
	    fontFamily: function fontFamily(val) {
	        if (Array.isArray(val)) {
	            return val.map(fontFamily).join(",");
	        } else if (typeof val === "object") {
	            injectStyleOnce(val.fontFamily, "@font-face", [val], false);
	            return '"' + val.fontFamily + '"';
	        } else {
	            return val;
	        }
	    },
	
	    // With animationName we look for an object that contains keyframes and
	    // inject them as an `@keyframes` block, returning a uniquely generated
	    // name. The keyframes object should look like
	    //  animationName: {
	    //    from: {
	    //      left: 0,
	    //      top: 0,
	    //    },
	    //    '50%': {
	    //      left: 15,
	    //      top: 5,
	    //    },
	    //    to: {
	    //      left: 20,
	    //      top: 20,
	    //    }
	    //  }
	    // TODO(emily): `stringHandlers` doesn't let us rename the key, so I have
	    // to use `animationName` here. Improve that so we can call this
	    // `animation` instead of `animationName`.
	    animationName: function animationName(val) {
	        if (typeof val !== "object") {
	            return val;
	        }
	
	        // Generate a unique name based on the hash of the object. We can't
	        // just use the hash because the name can't start with a number.
	        // TODO(emily): this probably makes debugging hard, allow a custom
	        // name?
	        var name = 'keyframe_' + (0, _util.hashObject)(val);
	
	        // Since keyframes need 3 layers of nesting, we use `generateCSS` to
	        // build the inner layers and wrap it in `@keyframes` ourselves.
	        var finalVal = '@keyframes ' + name + '{';
	        Object.keys(val).forEach(function (key) {
	            finalVal += (0, _generate.generateCSS)(key, [val[key]], stringHandlers, false);
	        });
	        finalVal += '}';
	
	        injectGeneratedCSSOnce(name, finalVal);
	
	        return name;
	    }
	};
	
	// This is a map from Aphrodite's generated class names to `true` (acting as a
	// set of class names)
	var alreadyInjected = {};
	
	// This is the buffer of styles which have not yet been flushed.
	var injectionBuffer = "";
	
	// A flag to tell if we are already buffering styles. This could happen either
	// because we scheduled a flush call already, so newly added styles will
	// already be flushed, or because we are statically buffering on the server.
	var isBuffering = false;
	
	var injectGeneratedCSSOnce = function injectGeneratedCSSOnce(key, generatedCSS) {
	    if (!alreadyInjected[key]) {
	        if (!isBuffering) {
	            // We should never be automatically buffering on the server (or any
	            // place without a document), so guard against that.
	            if (typeof document === "undefined") {
	                throw new Error("Cannot automatically buffer without a document");
	            }
	
	            // If we're not already buffering, schedule a call to flush the
	            // current styles.
	            isBuffering = true;
	            (0, _asap2['default'])(flushToStyleTag);
	        }
	
	        injectionBuffer += generatedCSS;
	        alreadyInjected[key] = true;
	    }
	};
	
	var injectStyleOnce = function injectStyleOnce(key, selector, definitions, useImportant) {
	    if (!alreadyInjected[key]) {
	        var generated = (0, _generate.generateCSS)(selector, definitions, stringHandlers, useImportant);
	
	        injectGeneratedCSSOnce(key, generated);
	    }
	};
	
	exports.injectStyleOnce = injectStyleOnce;
	var reset = function reset() {
	    injectionBuffer = "";
	    alreadyInjected = {};
	    isBuffering = false;
	    styleTag = null;
	};
	
	exports.reset = reset;
	var startBuffering = function startBuffering() {
	    if (isBuffering) {
	        throw new Error("Cannot buffer while already buffering");
	    }
	    isBuffering = true;
	};
	
	exports.startBuffering = startBuffering;
	var flushToString = function flushToString() {
	    isBuffering = false;
	    var ret = injectionBuffer;
	    injectionBuffer = "";
	    return ret;
	};
	
	exports.flushToString = flushToString;
	var flushToStyleTag = function flushToStyleTag() {
	    var cssContent = flushToString();
	    if (cssContent.length > 0) {
	        injectStyleTag(cssContent);
	    }
	};
	
	exports.flushToStyleTag = flushToStyleTag;
	var getRenderedClassNames = function getRenderedClassNames() {
	    return Object.keys(alreadyInjected);
	};
	
	exports.getRenderedClassNames = getRenderedClassNames;
	var addRenderedClassNames = function addRenderedClassNames(classNames) {
	    classNames.forEach(function (className) {
	        alreadyInjected[className] = true;
	    });
	};
	
	exports.addRenderedClassNames = addRenderedClassNames;
	/**
	 * Inject styles associated with the passed style definition objects, and return
	 * an associated CSS class name.
	 *
	 * @param {boolean} useImportant If true, will append !important to generated
	 *     CSS output. e.g. {color: red} -> "color: red !important".
	 * @param {Object[]} styleDefinitions style definition objects as returned as
	 *     properties of the return value of StyleSheet.create().
	 */
	var injectAndGetClassName = function injectAndGetClassName(useImportant, styleDefinitions) {
	    // Filter out falsy values from the input, to allow for
	    // `css(a, test && c)`
	    var validDefinitions = styleDefinitions.filter(function (def) {
	        return def;
	    });
	
	    // Break if there aren't any valid styles.
	    if (validDefinitions.length === 0) {
	        return "";
	    }
	
	    var className = validDefinitions.map(function (s) {
	        return s._name;
	    }).join("-o_O-");
	    injectStyleOnce(className, '.' + className, validDefinitions.map(function (d) {
	        return d._definition;
	    }), useImportant);
	
	    return className;
	};
	exports.injectAndGetClassName = injectAndGetClassName;

/***/ },

/***/ 796:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	// rawAsap provides everything we need except exception management.
	var rawAsap = __webpack_require__(797);
	// RawTasks are recycled to reduce GC churn.
	var freeTasks = [];
	// We queue errors to ensure they are thrown in right order (FIFO).
	// Array-as-queue is good enough here, since we are just dealing with exceptions.
	var pendingErrors = [];
	var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);
	
	function throwFirstError() {
	    if (pendingErrors.length) {
	        throw pendingErrors.shift();
	    }
	}
	
	/**
	 * Calls a task as soon as possible after returning, in its own event, with priority
	 * over other events like animation, reflow, and repaint. An error thrown from an
	 * event will not interrupt, nor even substantially slow down the processing of
	 * other events, but will be rather postponed to a lower priority event.
	 * @param {{call}} task A callable object, typically a function that takes no
	 * arguments.
	 */
	module.exports = asap;
	function asap(task) {
	    var rawTask;
	    if (freeTasks.length) {
	        rawTask = freeTasks.pop();
	    } else {
	        rawTask = new RawTask();
	    }
	    rawTask.task = task;
	    rawAsap(rawTask);
	}
	
	// We wrap tasks with recyclable task objects.  A task object implements
	// `call`, just like a function.
	function RawTask() {
	    this.task = null;
	}
	
	// The sole purpose of wrapping the task is to catch the exception and recycle
	// the task object after its single use.
	RawTask.prototype.call = function () {
	    try {
	        this.task.call();
	    } catch (error) {
	        if (asap.onerror) {
	            // This hook exists purely for testing purposes.
	            // Its name will be periodically randomized to break any code that
	            // depends on its existence.
	            asap.onerror(error);
	        } else {
	            // In a web browser, exceptions are not fatal. However, to avoid
	            // slowing down the queue of pending tasks, we rethrow the error in a
	            // lower priority turn.
	            pendingErrors.push(error);
	            requestErrorThrow();
	        }
	    } finally {
	        this.task = null;
	        freeTasks[freeTasks.length] = this;
	    }
	};


/***/ },

/***/ 797:
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	
	// Use the fastest means possible to execute a task in its own turn, with
	// priority over other events including IO, animation, reflow, and redraw
	// events in browsers.
	//
	// An exception thrown by a task will permanently interrupt the processing of
	// subsequent tasks. The higher level `asap` function ensures that if an
	// exception is thrown by a task, that the task queue will continue flushing as
	// soon as possible, but if you use `rawAsap` directly, you are responsible to
	// either ensure that no exceptions are thrown from your task, or to manually
	// call `rawAsap.requestFlush` if an exception is thrown.
	module.exports = rawAsap;
	function rawAsap(task) {
	    if (!queue.length) {
	        requestFlush();
	        flushing = true;
	    }
	    // Equivalent to push, but avoids a function call.
	    queue[queue.length] = task;
	}
	
	var queue = [];
	// Once a flush has been requested, no further calls to `requestFlush` are
	// necessary until the next `flush` completes.
	var flushing = false;
	// `requestFlush` is an implementation-specific method that attempts to kick
	// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
	// the event queue before yielding to the browser's own event loop.
	var requestFlush;
	// The position of the next task to execute in the task queue. This is
	// preserved between calls to `flush` so that it can be resumed if
	// a task throws an exception.
	var index = 0;
	// If a task schedules additional tasks recursively, the task queue can grow
	// unbounded. To prevent memory exhaustion, the task queue will periodically
	// truncate already-completed tasks.
	var capacity = 1024;
	
	// The flush function processes all tasks that have been scheduled with
	// `rawAsap` unless and until one of those tasks throws an exception.
	// If a task throws an exception, `flush` ensures that its state will remain
	// consistent and will resume where it left off when called again.
	// However, `flush` does not make any arrangements to be called again if an
	// exception is thrown.
	function flush() {
	    while (index < queue.length) {
	        var currentIndex = index;
	        // Advance the index before calling the task. This ensures that we will
	        // begin flushing on the next task the task throws an error.
	        index = index + 1;
	        queue[currentIndex].call();
	        // Prevent leaking memory for long chains of recursive calls to `asap`.
	        // If we call `asap` within tasks scheduled by `asap`, the queue will
	        // grow, but to avoid an O(n) walk for every task we execute, we don't
	        // shift tasks off the queue after they have been executed.
	        // Instead, we periodically shift 1024 tasks off the queue.
	        if (index > capacity) {
	            // Manually shift all values starting at the index back to the
	            // beginning of the queue.
	            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
	                queue[scan] = queue[scan + index];
	            }
	            queue.length -= index;
	            index = 0;
	        }
	    }
	    queue.length = 0;
	    index = 0;
	    flushing = false;
	}
	
	// `requestFlush` is implemented using a strategy based on data collected from
	// every available SauceLabs Selenium web driver worker at time of writing.
	// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593
	
	// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
	// have WebKitMutationObserver but not un-prefixed MutationObserver.
	// Must use `global` instead of `window` to work in both frames and web
	// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
	var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;
	
	// MutationObservers are desirable because they have high priority and work
	// reliably everywhere they are implemented.
	// They are implemented in all modern browsers.
	//
	// - Android 4-4.3
	// - Chrome 26-34
	// - Firefox 14-29
	// - Internet Explorer 11
	// - iPad Safari 6-7.1
	// - iPhone Safari 7-7.1
	// - Safari 6-7
	if (typeof BrowserMutationObserver === "function") {
	    requestFlush = makeRequestCallFromMutationObserver(flush);
	
	// MessageChannels are desirable because they give direct access to the HTML
	// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
	// 11-12, and in web workers in many engines.
	// Although message channels yield to any queued rendering and IO tasks, they
	// would be better than imposing the 4ms delay of timers.
	// However, they do not work reliably in Internet Explorer or Safari.
	
	// Internet Explorer 10 is the only browser that has setImmediate but does
	// not have MutationObservers.
	// Although setImmediate yields to the browser's renderer, it would be
	// preferrable to falling back to setTimeout since it does not have
	// the minimum 4ms penalty.
	// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
	// Desktop to a lesser extent) that renders both setImmediate and
	// MessageChannel useless for the purposes of ASAP.
	// https://github.com/kriskowal/q/issues/396
	
	// Timers are implemented universally.
	// We fall back to timers in workers in most engines, and in foreground
	// contexts in the following browsers.
	// However, note that even this simple case requires nuances to operate in a
	// broad spectrum of browsers.
	//
	// - Firefox 3-13
	// - Internet Explorer 6-9
	// - iPad Safari 4.3
	// - Lynx 2.8.7
	} else {
	    requestFlush = makeRequestCallFromTimer(flush);
	}
	
	// `requestFlush` requests that the high priority event queue be flushed as
	// soon as possible.
	// This is useful to prevent an error thrown in a task from stalling the event
	// queue if the exception handled by Node.js’s
	// `process.on("uncaughtException")` or by a domain.
	rawAsap.requestFlush = requestFlush;
	
	// To request a high priority event, we induce a mutation observer by toggling
	// the text of a text node between "1" and "-1".
	function makeRequestCallFromMutationObserver(callback) {
	    var toggle = 1;
	    var observer = new BrowserMutationObserver(callback);
	    var node = document.createTextNode("");
	    observer.observe(node, {characterData: true});
	    return function requestCall() {
	        toggle = -toggle;
	        node.data = toggle;
	    };
	}
	
	// The message channel technique was discovered by Malte Ubl and was the
	// original foundation for this library.
	// http://www.nonblocking.io/2011/06/windownexttick.html
	
	// Safari 6.0.5 (at least) intermittently fails to create message ports on a
	// page's first load. Thankfully, this version of Safari supports
	// MutationObservers, so we don't need to fall back in that case.
	
	// function makeRequestCallFromMessageChannel(callback) {
	//     var channel = new MessageChannel();
	//     channel.port1.onmessage = callback;
	//     return function requestCall() {
	//         channel.port2.postMessage(0);
	//     };
	// }
	
	// For reasons explained above, we are also unable to use `setImmediate`
	// under any circumstances.
	// Even if we were, there is another bug in Internet Explorer 10.
	// It is not sufficient to assign `setImmediate` to `requestFlush` because
	// `setImmediate` must be called *by name* and therefore must be wrapped in a
	// closure.
	// Never forget.
	
	// function makeRequestCallFromSetImmediate(callback) {
	//     return function requestCall() {
	//         setImmediate(callback);
	//     };
	// }
	
	// Safari 6.0 has a problem where timers will get lost while the user is
	// scrolling. This problem does not impact ASAP because Safari 6.0 supports
	// mutation observers, so that implementation is used instead.
	// However, if we ever elect to use timers in Safari, the prevalent work-around
	// is to add a scroll event listener that calls for a flush.
	
	// `setTimeout` does not call the passed callback if the delay is less than
	// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
	// even then.
	
	function makeRequestCallFromTimer(callback) {
	    return function requestCall() {
	        // We dispatch a timeout with a specified delay of 0 for engines that
	        // can reliably accommodate that request. This will usually be snapped
	        // to a 4 milisecond delay, but once we're flushing, there's no delay
	        // between events.
	        var timeoutHandle = setTimeout(handleTimer, 0);
	        // However, since this timer gets frequently dropped in Firefox
	        // workers, we enlist an interval handle that will try to fire
	        // an event 20 times per second until it succeeds.
	        var intervalHandle = setInterval(handleTimer, 50);
	
	        function handleTimer() {
	            // Whichever timer succeeds will cancel both timers and
	            // execute the callback.
	            clearTimeout(timeoutHandle);
	            clearInterval(intervalHandle);
	            callback();
	        }
	    };
	}
	
	// This is for `asap.js` only.
	// Its name will be periodically randomized to break any code that depends on
	// its existence.
	rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;
	
	// ASAP was originally a nextTick shim included in Q. This was factored out
	// into this ASAP package. It was later adapted to RSVP which made further
	// amendments. These decisions, particularly to marginalize MessageChannel and
	// to capture the MutationObserver implementation in a closure, were integrated
	// back into ASAP proper.
	// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },

/***/ 798:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _inlineStylePrefixerStatic = __webpack_require__(799);
	
	var _inlineStylePrefixerStatic2 = _interopRequireDefault(_inlineStylePrefixerStatic);
	
	var _util = __webpack_require__(800);
	
	/**
	 * Generate CSS for a selector and some styles.
	 *
	 * This function handles the media queries, pseudo selectors, and descendant
	 * styles that can be used in aphrodite styles.
	 *
	 * @param {string} selector: A base CSS selector for the styles to be generated
	 *     with.
	 * @param {Object} styleTypes: A list of properties of the return type of
	 *     StyleSheet.create, e.g. [styles.red, styles.blue].
	 * @param stringHandlers: See `generateCSSRuleset`
	 * @param useImportant: See `generateCSSRuleset`
	 *
	 * To actually generate the CSS special-construct-less styles are passed to
	 * `generateCSSRuleset`.
	 *
	 * For instance, a call to
	 *
	 *     generateCSSInner(".foo", {
	 *       color: "red",
	 *       "@media screen": {
	 *         height: 20,
	 *         ":hover": {
	 *           backgroundColor: "black"
	 *         }
	 *       },
	 *       ":active": {
	 *         fontWeight: "bold",
	 *         ">>bar": {
	 *           _names: { "foo_bar": true },
	 *           height: 10,
	 *         }
	 *       }
	 *     });
	 *
	 * will make 5 calls to `generateCSSRuleset`:
	 *
	 *     generateCSSRuleset(".foo", { color: "red" }, ...)
	 *     generateCSSRuleset(".foo:active", { fontWeight: "bold" }, ...)
	 *     generateCSSRuleset(".foo:active .foo_bar", { height: 10 }, ...)
	 *     // These 2 will be wrapped in @media screen {}
	 *     generateCSSRuleset(".foo", { height: 20 }, ...)
	 *     generateCSSRuleset(".foo:hover", { backgroundColor: "black" }, ...)
	 */
	var generateCSS = function generateCSS(selector, styleTypes, stringHandlers, useImportant) {
	    var merged = styleTypes.reduce(_util.recursiveMerge);
	
	    var declarations = {};
	    var mediaQueries = {};
	    var pseudoStyles = {};
	
	    Object.keys(merged).forEach(function (key) {
	        if (key[0] === ':') {
	            pseudoStyles[key] = merged[key];
	        } else if (key[0] === '@') {
	            mediaQueries[key] = merged[key];
	        } else {
	            declarations[key] = merged[key];
	        }
	    });
	
	    return generateCSSRuleset(selector, declarations, stringHandlers, useImportant) + Object.keys(pseudoStyles).map(function (pseudoSelector) {
	        return generateCSSRuleset(selector + pseudoSelector, pseudoStyles[pseudoSelector], stringHandlers, useImportant);
	    }).join("") + Object.keys(mediaQueries).map(function (mediaQuery) {
	        var ruleset = generateCSS(selector, [mediaQueries[mediaQuery]], stringHandlers, useImportant);
	        return mediaQuery + '{' + ruleset + '}';
	    }).join("");
	};
	
	exports.generateCSS = generateCSS;
	/**
	 * Helper method of generateCSSRuleset to facilitate custom handling of certain
	 * CSS properties. Used for e.g. font families.
	 *
	 * See generateCSSRuleset for usage and documentation of paramater types.
	 */
	var runStringHandlers = function runStringHandlers(declarations, stringHandlers) {
	    var result = {};
	
	    Object.keys(declarations).forEach(function (key) {
	        // If a handler exists for this particular key, let it interpret
	        // that value first before continuing
	        if (stringHandlers && stringHandlers.hasOwnProperty(key)) {
	            result[key] = stringHandlers[key](declarations[key]);
	        } else {
	            result[key] = declarations[key];
	        }
	    });
	
	    return result;
	};
	
	/**
	 * Generate a CSS ruleset with the selector and containing the declarations.
	 *
	 * This function assumes that the given declarations don't contain any special
	 * children (such as media queries, pseudo-selectors, or descendant styles).
	 *
	 * Note that this method does not deal with nesting used for e.g.
	 * psuedo-selectors or media queries. That responsibility is left to  the
	 * `generateCSS` function.
	 *
	 * @param {string} selector: the selector associated with the ruleset
	 * @param {Object} declarations: a map from camelCased CSS property name to CSS
	 *     property value.
	 * @param {Object.<string, function>} stringHandlers: a map from camelCased CSS
	 *     property name to a function which will map the given value to the value
	 *     that is output.
	 * @param {bool} useImportant: A boolean saying whether to append "!important"
	 *     to each of the CSS declarations.
	 * @returns {string} A string of raw CSS.
	 *
	 * Examples:
	 *
	 *    generateCSSRuleset(".blah", { color: "red" })
	 *    -> ".blah{color: red !important;}"
	 *    generateCSSRuleset(".blah", { color: "red" }, {}, false)
	 *    -> ".blah{color: red}"
	 *    generateCSSRuleset(".blah", { color: "red" }, {color: c => c.toUpperCase})
	 *    -> ".blah{color: RED}"
	 *    generateCSSRuleset(".blah:hover", { color: "red" })
	 *    -> ".blah:hover{color: red}"
	 */
	var generateCSSRuleset = function generateCSSRuleset(selector, declarations, stringHandlers, useImportant) {
	    var handledDeclarations = runStringHandlers(declarations, stringHandlers);
	
	    var prefixedDeclarations = (0, _inlineStylePrefixerStatic2['default'])(handledDeclarations);
	
	    var prefixedRules = (0, _util.flatten)((0, _util.objectToPairs)(prefixedDeclarations).map(function (_ref) {
	        var _ref2 = _slicedToArray(_ref, 2);
	
	        var key = _ref2[0];
	        var value = _ref2[1];
	
	        if (Array.isArray(value)) {
	            var _ret = (function () {
	                // inline-style-prefix-all returns an array when there should be
	                // multiple rules, we will flatten to single rules
	
	                var prefixedValues = [];
	                var unprefixedValues = [];
	
	                value.forEach(function (v) {
	                    if (v.indexOf('-') === 0) {
	                        prefixedValues.push(v);
	                    } else {
	                        unprefixedValues.push(v);
	                    }
	                });
	
	                prefixedValues.sort();
	                unprefixedValues.sort();
	
	                return {
	                    v: prefixedValues.concat(unprefixedValues).map(function (v) {
	                        return [key, v];
	                    })
	                };
	            })();
	
	            if (typeof _ret === 'object') return _ret.v;
	        }
	        return [[key, value]];
	    }));
	
	    var rules = prefixedRules.map(function (_ref3) {
	        var _ref32 = _slicedToArray(_ref3, 2);
	
	        var key = _ref32[0];
	        var value = _ref32[1];
	
	        var stringValue = (0, _util.stringifyValue)(key, value);
	        var ret = (0, _util.kebabifyStyleName)(key) + ':' + stringValue + ';';
	        return useImportant === false ? ret : (0, _util.importantify)(ret);
	    }).join("");
	
	    if (rules) {
	        return selector + '{' + rules + '}';
	    } else {
	        return "";
	    }
	};
	exports.generateCSSRuleset = generateCSSRuleset;

/***/ },

/***/ 799:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(482)


/***/ },

/***/ 800:
/***/ function(module, exports) {

	// {K1: V1, K2: V2, ...} -> [[K1, V1], [K2, V2]]
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var objectToPairs = function objectToPairs(obj) {
	    return Object.keys(obj).map(function (key) {
	        return [key, obj[key]];
	    });
	};
	
	exports.objectToPairs = objectToPairs;
	// [[K1, V1], [K2, V2]] -> {K1: V1, K2: V2, ...}
	var pairsToObject = function pairsToObject(pairs) {
	    var result = {};
	    pairs.forEach(function (_ref) {
	        var _ref2 = _slicedToArray(_ref, 2);
	
	        var key = _ref2[0];
	        var val = _ref2[1];
	
	        result[key] = val;
	    });
	    return result;
	};
	
	var mapObj = function mapObj(obj, fn) {
	    return pairsToObject(objectToPairs(obj).map(fn));
	};
	
	exports.mapObj = mapObj;
	// Flattens an array one level
	// [[A], [B, C, [D]]] -> [A, B, C, [D]]
	var flatten = function flatten(list) {
	    return list.reduce(function (memo, x) {
	        return memo.concat(x);
	    }, []);
	};
	
	exports.flatten = flatten;
	var UPPERCASE_RE = /([A-Z])/g;
	var MS_RE = /^ms-/;
	
	var kebabify = function kebabify(string) {
	    return string.replace(UPPERCASE_RE, '-$1').toLowerCase();
	};
	var kebabifyStyleName = function kebabifyStyleName(string) {
	    return kebabify(string).replace(MS_RE, '-ms-');
	};
	
	exports.kebabifyStyleName = kebabifyStyleName;
	var recursiveMerge = function recursiveMerge(a, b) {
	    // TODO(jlfwong): Handle malformed input where a and b are not the same
	    // type.
	
	    if (typeof a !== 'object') {
	        return b;
	    }
	
	    var ret = _extends({}, a);
	
	    Object.keys(b).forEach(function (key) {
	        if (ret.hasOwnProperty(key)) {
	            ret[key] = recursiveMerge(a[key], b[key]);
	        } else {
	            ret[key] = b[key];
	        }
	    });
	
	    return ret;
	};
	
	exports.recursiveMerge = recursiveMerge;
	/**
	 * CSS properties which accept numbers but are not in units of "px".
	 * Taken from React's CSSProperty.js
	 */
	var isUnitlessNumber = {
	    animationIterationCount: true,
	    borderImageOutset: true,
	    borderImageSlice: true,
	    borderImageWidth: true,
	    boxFlex: true,
	    boxFlexGroup: true,
	    boxOrdinalGroup: true,
	    columnCount: true,
	    flex: true,
	    flexGrow: true,
	    flexPositive: true,
	    flexShrink: true,
	    flexNegative: true,
	    flexOrder: true,
	    gridRow: true,
	    gridColumn: true,
	    fontWeight: true,
	    lineClamp: true,
	    lineHeight: true,
	    opacity: true,
	    order: true,
	    orphans: true,
	    tabSize: true,
	    widows: true,
	    zIndex: true,
	    zoom: true,
	
	    // SVG-related properties
	    fillOpacity: true,
	    floodOpacity: true,
	    stopOpacity: true,
	    strokeDasharray: true,
	    strokeDashoffset: true,
	    strokeMiterlimit: true,
	    strokeOpacity: true,
	    strokeWidth: true
	};
	
	/**
	 * Taken from React's CSSProperty.js
	 *
	 * @param {string} prefix vendor-specific prefix, eg: Webkit
	 * @param {string} key style name, eg: transitionDuration
	 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
	 * WebkitTransitionDuration
	 */
	function prefixKey(prefix, key) {
	    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
	}
	
	/**
	 * Support style names that may come passed in prefixed by adding permutations
	 * of vendor prefixes.
	 * Taken from React's CSSProperty.js
	 */
	var prefixes = ['Webkit', 'ms', 'Moz', 'O'];
	
	// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
	// infinite loop, because it iterates over the newly added props too.
	// Taken from React's CSSProperty.js
	Object.keys(isUnitlessNumber).forEach(function (prop) {
	    prefixes.forEach(function (prefix) {
	        isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
	    });
	});
	
	var stringifyValue = function stringifyValue(key, prop) {
	    if (typeof prop === "number") {
	        if (isUnitlessNumber[key]) {
	            return "" + prop;
	        } else {
	            return prop + "px";
	        }
	    } else {
	        return prop;
	    }
	};
	
	exports.stringifyValue = stringifyValue;
	/**
	 * JS Implementation of MurmurHash2
	 *
	 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
	 * @see http://github.com/garycourt/murmurhash-js
	 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
	 * @see http://sites.google.com/site/murmurhash/
	 *
	 * @param {string} str ASCII only
	 * @return {string} Base 36 encoded hash result
	 */
	function murmurhash2_32_gc(str) {
	    var l = str.length;
	    var h = l;
	    var i = 0;
	    var k = undefined;
	
	    while (l >= 4) {
	        k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
	
	        k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
	        k ^= k >>> 24;
	        k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
	
	        h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16) ^ k;
	
	        l -= 4;
	        ++i;
	    }
	
	    switch (l) {
	        case 3:
	            h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
	        case 2:
	            h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
	        case 1:
	            h ^= str.charCodeAt(i) & 0xff;
	            h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
	    }
	
	    h ^= h >>> 13;
	    h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
	    h ^= h >>> 15;
	
	    return (h >>> 0).toString(36);
	}
	
	// Hash a javascript object using JSON.stringify. This is very fast, about 3
	// microseconds on my computer for a sample object:
	// http://jsperf.com/test-hashfnv32a-hash/5
	//
	// Note that this uses JSON.stringify to stringify the objects so in order for
	// this to produce consistent hashes browsers need to have a consistent
	// ordering of objects. Ben Alpert says that Facebook depends on this, so we
	// can probably depend on this too.
	var hashObject = function hashObject(object) {
	    return murmurhash2_32_gc(JSON.stringify(object));
	};
	
	exports.hashObject = hashObject;
	var IMPORTANT_RE = /^([^:]+:.*?)( !important)?;$/;
	
	// Given a single style rule string like "a: b;", adds !important to generate
	// "a: b !important;".
	var importantify = function importantify(string) {
	    return string.replace(IMPORTANT_RE, function (_, base, important) {
	        return base + " !important;";
	    });
	};
	exports.importantify = importantify;

/***/ },

/***/ 801:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();
	
	var _util = __webpack_require__(800);
	
	var _inject = __webpack_require__(795);
	
	var StyleSheet = {
	    create: function create(sheetDefinition) {
	        return (0, _util.mapObj)(sheetDefinition, function (_ref) {
	            var _ref2 = _slicedToArray(_ref, 2);
	
	            var key = _ref2[0];
	            var val = _ref2[1];
	
	            return [key, {
	                // TODO(emily): Make a 'production' mode which doesn't prepend
	                // the class name here, to make the generated CSS smaller.
	                _name: key + '_' + (0, _util.hashObject)(val),
	                _definition: val
	            }];
	        });
	    },
	
	    rehydrate: function rehydrate() {
	        var renderedClassNames = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	
	        (0, _inject.addRenderedClassNames)(renderedClassNames);
	    }
	};
	
	/**
	 * Utilities for using Aphrodite server-side.
	 */
	var StyleSheetServer = {
	    renderStatic: function renderStatic(renderFunc) {
	        (0, _inject.reset)();
	        (0, _inject.startBuffering)();
	        var html = renderFunc();
	        var cssContent = (0, _inject.flushToString)();
	
	        return {
	            html: html,
	            css: {
	                content: cssContent,
	                renderedClassNames: (0, _inject.getRenderedClassNames)()
	            }
	        };
	    }
	};
	
	/**
	 * Utilities for using Aphrodite in tests.
	 *
	 * Not meant to be used in production.
	 */
	var StyleSheetTestUtils = {
	    /**
	     * Prevent styles from being injected into the DOM.
	     *
	     * This is useful in situations where you'd like to test rendering UI
	     * components which use Aphrodite without any of the side-effects of
	     * Aphrodite happening. Particularly useful for testing the output of
	     * components when you have no DOM, e.g. testing in Node without a fake DOM.
	     *
	     * Should be paired with a subsequent call to
	     * clearBufferAndResumeStyleInjection.
	     */
	    suppressStyleInjection: function suppressStyleInjection() {
	        (0, _inject.reset)();
	        (0, _inject.startBuffering)();
	    },
	
	    /**
	     * Opposite method of preventStyleInject.
	     */
	    clearBufferAndResumeStyleInjection: function clearBufferAndResumeStyleInjection() {
	        (0, _inject.reset)();
	    }
	};
	
	var css = function css() {
	    for (var _len = arguments.length, styleDefinitions = Array(_len), _key = 0; _key < _len; _key++) {
	        styleDefinitions[_key] = arguments[_key];
	    }
	
	    var useImportant = true; // Append !important to all style definitions
	    return (0, _inject.injectAndGetClassName)(useImportant, styleDefinitions);
	};
	
	exports['default'] = {
	    StyleSheet: StyleSheet,
	    StyleSheetServer: StyleSheetServer,
	    StyleSheetTestUtils: StyleSheetTestUtils,
	    css: css
	};
	module.exports = exports['default'];

/***/ },

/***/ 802:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _aphroditeNoImportant = __webpack_require__(793);
	
	// import Swipeable from 'react-swipeable';
	
	var _theme = __webpack_require__(803);
	
	var _theme2 = _interopRequireDefault(_theme);
	
	var _componentsArrow = __webpack_require__(804);
	
	var _componentsArrow2 = _interopRequireDefault(_componentsArrow);
	
	var _componentsContainer = __webpack_require__(815);
	
	var _componentsContainer2 = _interopRequireDefault(_componentsContainer);
	
	var _componentsFooter = __webpack_require__(816);
	
	var _componentsFooter2 = _interopRequireDefault(_componentsFooter);
	
	var _componentsHeader = __webpack_require__(817);
	
	var _componentsHeader2 = _interopRequireDefault(_componentsHeader);
	
	var _componentsPaginatedThumbnails = __webpack_require__(818);
	
	var _componentsPaginatedThumbnails2 = _interopRequireDefault(_componentsPaginatedThumbnails);
	
	var _componentsPortal = __webpack_require__(820);
	
	var _componentsPortal2 = _interopRequireDefault(_componentsPortal);
	
	var _utils = __webpack_require__(805);
	
	var Lightbox = (function (_Component) {
		_inherits(Lightbox, _Component);
	
		function Lightbox() {
			_classCallCheck(this, Lightbox);
	
			_get(Object.getPrototypeOf(Lightbox.prototype), 'constructor', this).call(this);
	
			_utils.bindFunctions.call(this, ['gotoNext', 'gotoPrev', 'handleKeyboardInput']);
		}
	
		_createClass(Lightbox, [{
			key: 'getChildContext',
			value: function getChildContext() {
				return {
					theme: this.props.theme
				};
			}
		}, {
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps(nextProps) {
				if (!_utils.canUseDom) return;
	
				// preload images
				if (nextProps.preloadNextImage) {
					var currentIndex = this.props.currentImage;
					var nextIndex = nextProps.currentImage + 1;
					var prevIndex = nextProps.currentImage - 1;
					var preloadIndex = undefined;
	
					if (currentIndex && nextProps.currentImage > currentIndex) {
						preloadIndex = nextIndex;
					} else if (currentIndex && nextProps.currentImage < currentIndex) {
						preloadIndex = prevIndex;
					}
	
					// if we know the user's direction just get one image
					// otherwise, to be safe, we need to grab one in each direction
					if (preloadIndex) {
						this.preloadImage(preloadIndex);
					} else {
						this.preloadImage(prevIndex);
						this.preloadImage(nextIndex);
					}
				}
	
				// add event listeners
				if (nextProps.enableKeyboardInput) {
					window.addEventListener('keydown', this.handleKeyboardInput);
				} else {
					window.removeEventListener('keydown', this.handleKeyboardInput);
				}
	
				// handle body scroll
				if (nextProps.isOpen) {
					_utils.bodyScroll.blockScroll();
				} else {
					_utils.bodyScroll.allowScroll();
				}
			}
	
			// ==============================
			// METHODS
			// ==============================
	
		}, {
			key: 'preloadImage',
			value: function preloadImage(idx) {
				var image = this.props.images[idx];
	
				if (!image) return;
	
				var img = new Image();
	
				img.src = image.src;
	
				if (image.srcset) {
					img.srcset = image.srcset.join();
				}
			}
		}, {
			key: 'gotoNext',
			value: function gotoNext(event) {
				if (this.props.currentImage === this.props.images.length - 1) return;
				if (event) {
					event.preventDefault();
					event.stopPropagation();
				}
				this.props.onClickNext();
			}
		}, {
			key: 'gotoPrev',
			value: function gotoPrev(event) {
				if (this.props.currentImage === 0) return;
				if (event) {
					event.preventDefault();
					event.stopPropagation();
				}
				this.props.onClickPrev();
			}
		}, {
			key: 'handleKeyboardInput',
			value: function handleKeyboardInput(event) {
				if (event.keyCode === 37) {
					this.gotoPrev(event);
					return true;
				} else if (event.keyCode === 39) {
					this.gotoNext(event);
					return true;
				} else if (event.keyCode === 27) {
					this.props.onClose();
					return true;
				}
				return false;
			}
	
			// ==============================
			// RENDERERS
			// ==============================
	
		}, {
			key: 'renderArrowPrev',
			value: function renderArrowPrev() {
				if (this.props.currentImage === 0) return null;
	
				return _react2['default'].createElement(_componentsArrow2['default'], {
					direction: 'left',
					icon: 'arrowLeft',
					onClick: this.gotoPrev,
					title: 'Previous (Left arrow key)',
					type: 'button'
				});
			}
		}, {
			key: 'renderArrowNext',
			value: function renderArrowNext() {
				if (this.props.currentImage === this.props.images.length - 1) return null;
	
				return _react2['default'].createElement(_componentsArrow2['default'], {
					direction: 'right',
					icon: 'arrowRight',
					onClick: this.gotoNext,
					title: 'Previous (Right arrow key)',
					type: 'button'
				});
			}
		}, {
			key: 'renderDialog',
			value: function renderDialog() {
				var _props = this.props;
				var backdropClosesModal = _props.backdropClosesModal;
				var customControls = _props.customControls;
				var isOpen = _props.isOpen;
				var onClose = _props.onClose;
				var showCloseButton = _props.showCloseButton;
				var showThumbnails = _props.showThumbnails;
				var width = _props.width;
	
				if (!isOpen) return _react2['default'].createElement('span', { key: 'closed' });
	
				var offsetThumbnails = 0;
				if (showThumbnails) {
					offsetThumbnails = _theme2['default'].thumbnail.size + _theme2['default'].container.gutter.vertical;
				}
	
				return _react2['default'].createElement(
					_componentsContainer2['default'],
					{
						key: 'open',
						onClick: !!backdropClosesModal && onClose,
						onTouchEnd: !!backdropClosesModal && onClose
					},
					_react2['default'].createElement(
						'div',
						{ className: (0, _aphroditeNoImportant.css)(classes.content), style: { marginBottom: offsetThumbnails, maxWidth: width } },
						_react2['default'].createElement(_componentsHeader2['default'], {
							customControls: customControls,
							onClose: onClose,
							showCloseButton: showCloseButton
						}),
						this.renderImages()
					),
					this.renderThumbnails(),
					this.renderArrowPrev(),
					this.renderArrowNext()
				);
			}
		}, {
			key: 'renderImages',
			value: function renderImages() {
				var _props2 = this.props;
				var currentImage = _props2.currentImage;
				var images = _props2.images;
				var imageCountSeparator = _props2.imageCountSeparator;
				var onClickImage = _props2.onClickImage;
				var showImageCount = _props2.showImageCount;
				var showThumbnails = _props2.showThumbnails;
	
				if (!images || !images.length) return null;
	
				var image = images[currentImage];
	
				var srcset = undefined;
				var sizes = undefined;
	
				if (image.srcset) {
					srcset = image.srcset.join();
					sizes = '100vw';
				}
	
				var thumbnailsSize = showThumbnails ? _theme2['default'].thumbnail.size : 0;
				var heightOffset = _theme2['default'].header.height + _theme2['default'].footer.height + thumbnailsSize + _theme2['default'].container.gutter.vertical + 'px';
	
				return _react2['default'].createElement(
					'figure',
					{ className: (0, _aphroditeNoImportant.css)(classes.figure) },
					_react2['default'].createElement('img', {
						className: (0, _aphroditeNoImportant.css)(classes.image),
						onClick: !!onClickImage && onClickImage,
						sizes: sizes,
						src: image.src,
						srcSet: srcset,
						style: {
							cursor: this.props.onClickImage ? 'pointer' : 'auto',
							maxHeight: 'calc(100vh - ' + heightOffset + ')'
						}
					}),
					_react2['default'].createElement(_componentsFooter2['default'], {
						caption: images[currentImage].caption,
						countCurrent: currentImage + 1,
						countSeparator: imageCountSeparator,
						countTotal: images.length,
						showCount: showImageCount
					})
				);
			}
		}, {
			key: 'renderThumbnails',
			value: function renderThumbnails() {
				var _props3 = this.props;
				var images = _props3.images;
				var currentImage = _props3.currentImage;
				var onClickThumbnail = _props3.onClickThumbnail;
				var showThumbnails = _props3.showThumbnails;
				var thumbnailOffset = _props3.thumbnailOffset;
	
				if (!showThumbnails) return;
	
				return _react2['default'].createElement(_componentsPaginatedThumbnails2['default'], {
					currentImage: currentImage,
					images: images,
					offset: thumbnailOffset,
					onClickThumbnail: onClickThumbnail
				});
			}
		}, {
			key: 'render',
			value: function render() {
				// return this.renderDialog();
				return _react2['default'].createElement(
					_componentsPortal2['default'],
					null,
					this.renderDialog()
				);
			}
		}]);
	
		return Lightbox;
	})(_react.Component);
	
	Lightbox.propTypes = {
		backdropClosesModal: _react.PropTypes.bool,
		currentImage: _react.PropTypes.number,
		customControls: _react.PropTypes.arrayOf(_react.PropTypes.node),
		enableKeyboardInput: _react.PropTypes.bool,
		imageCountSeparator: _react.PropTypes.string,
		images: _react.PropTypes.arrayOf(_react.PropTypes.shape({
			src: _react.PropTypes.string.isRequired,
			srcset: _react.PropTypes.array,
			caption: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.element]),
			thumbnail: _react.PropTypes.string
		})).isRequired,
		isOpen: _react.PropTypes.bool,
		onClickImage: _react.PropTypes.func,
		onClickNext: _react.PropTypes.func,
		onClickPrev: _react.PropTypes.func,
		onClose: _react.PropTypes.func.isRequired,
		preloadNextImage: _react.PropTypes.bool,
		sheet: _react.PropTypes.object,
		showCloseButton: _react.PropTypes.bool,
		showImageCount: _react.PropTypes.bool,
		showThumbnails: _react.PropTypes.bool,
		theme: _react.PropTypes.object,
		thumbnailOffset: _react.PropTypes.number,
		width: _react.PropTypes.number
	};
	Lightbox.defaultProps = {
		currentImage: 0,
		enableKeyboardInput: true,
		imageCountSeparator: ' of ',
		onClickShowNextImage: true,
		preloadNextImage: true,
		showCloseButton: true,
		showImageCount: true,
		theme: {},
		thumbnailOffset: 2,
		width: 1024
	};
	Lightbox.childContextTypes = {
		theme: _react.PropTypes.object.isRequired
	};
	
	var classes = _aphroditeNoImportant.StyleSheet.create({
		content: {
			position: 'relative'
		},
		figure: {
			margin: 0 },
		// remove browser default
		image: {
			display: 'block', // removes browser default gutter
			height: 'auto',
			margin: '0 auto', // maintain center on very short screens OR very narrow image
			maxWidth: '100%',
	
			// disable user select
			WebkitTouchCallout: 'none',
			userSelect: 'none'
		}
	});
	
	exports['default'] = Lightbox;
	module.exports = exports['default'];
	/*
	Re-implement when react warning "unknown props"
	https://fb.me/react-unknown-prop is resolved
	<Swipeable onSwipedLeft={this.gotoNext} onSwipedRight={this.gotoPrev} />
	*/

/***/ },

/***/ 803:
/***/ function(module, exports) {

	// ==============================
	// THEME
	// ==============================
	
	'use strict';
	
	var theme = {};
	
	// container
	theme.container = {
		background: 'rgba(0, 0, 0, 0.8)',
		gutter: {
			horizontal: 10,
			vertical: 10
		},
		zIndex: 2001
	};
	
	// header
	theme.header = {
		height: 40
	};
	theme.close = {
		fill: 'white',
		height: 20,
		width: 20
	};
	
	// footer
	theme.footer = {
		color: 'white',
		count: {
			color: 'rgba(255, 255, 255, 0.75)',
			fontSize: '0.85em'
		},
		height: 40,
		gutter: {
			horizontal: 0,
			vertical: 5
		}
	};
	
	// thumbnails
	theme.thumbnail = {
		activeBorderColor: 'white',
		size: 50,
		gutter: 2
	};
	
	// arrow
	theme.arrow = {
		background: 'black',
		fill: 'white',
		height: 120
	};
	
	module.exports = theme;

/***/ },

/***/ 804:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _aphroditeNoImportant = __webpack_require__(793);
	
	var _theme = __webpack_require__(803);
	
	var _theme2 = _interopRequireDefault(_theme);
	
	var _utils = __webpack_require__(805);
	
	var _Icon = __webpack_require__(810);
	
	var _Icon2 = _interopRequireDefault(_Icon);
	
	function Arrow(_ref, _ref2) {
		var direction = _ref.direction;
		var icon = _ref.icon;
		var onClick = _ref.onClick;
		var size = _ref.size;
	
		var props = _objectWithoutProperties(_ref, ['direction', 'icon', 'onClick', 'size']);
	
		var theme = _ref2.theme;
	
		var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));
	
		return _react2['default'].createElement(
			'button',
			_extends({
				type: 'button',
				className: (0, _aphroditeNoImportant.css)(classes.arrow, classes['arrow__direction__' + direction], size && classes['arrow__size__' + size]),
				onClick: onClick,
				onTouchEnd: onClick
			}, props),
			_react2['default'].createElement(_Icon2['default'], { fill: !!theme.arrow && theme.arrow.fill || _theme2['default'].arrow.fill, type: icon })
		);
	};
	
	Arrow.propTypes = {
		direction: _react.PropTypes.oneOf(['left', 'right']),
		icon: _react.PropTypes.string,
		onClick: _react.PropTypes.func.isRequired,
		size: _react.PropTypes.oneOf(['medium', 'small']).isRequired
	};
	Arrow.defaultProps = {
		size: 'medium'
	};
	Arrow.contextTypes = {
		theme: _react.PropTypes.object.isRequired
	};
	
	var defaultStyles = {
		arrow: {
			background: 'none',
			border: 'none',
			borderRadius: 4,
			cursor: 'pointer',
			outline: 'none',
			padding: 10, // increase hit area
			position: 'absolute',
			top: '50%',
	
			// disable user select
			WebkitTouchCallout: 'none',
			userSelect: 'none'
		},
	
		// sizees
		arrow__size__medium: {
			height: _theme2['default'].arrow.height,
			marginTop: _theme2['default'].arrow.height / -2,
			width: 40,
	
			'@media (min-width: 768px)': {
				width: 70
			}
		},
		arrow__size__small: {
			height: _theme2['default'].thumbnail.size,
			marginTop: _theme2['default'].thumbnail.size / -2,
			width: 30,
	
			'@media (min-width: 500px)': {
				width: 40
			}
		},
	
		// direction
		arrow__direction__right: {
			right: _theme2['default'].container.gutter.horizontal
		},
		arrow__direction__left: {
			left: _theme2['default'].container.gutter.horizontal
		}
	};
	
	module.exports = Arrow;

/***/ },

/***/ 805:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _bindFunctions = __webpack_require__(806);
	
	var _bindFunctions2 = _interopRequireDefault(_bindFunctions);
	
	var _bodyScroll = __webpack_require__(807);
	
	var _bodyScroll2 = _interopRequireDefault(_bodyScroll);
	
	var _canUseDom = __webpack_require__(808);
	
	var _canUseDom2 = _interopRequireDefault(_canUseDom);
	
	var _deepMerge = __webpack_require__(809);
	
	var _deepMerge2 = _interopRequireDefault(_deepMerge);
	
	module.exports = {
		bindFunctions: _bindFunctions2['default'],
		bodyScroll: _bodyScroll2['default'],
		canUseDom: _canUseDom2['default'],
		deepMerge: _deepMerge2['default']
	};

/***/ },

/***/ 806:
/***/ function(module, exports) {

	/**
		Bind multiple component methods:
	
		* @param {this} context
		* @param {Array} functions
	
		constructor() {
			...
			bindFunctions.call(this, ['handleClick', 'handleOther']);
		}
	*/
	
	"use strict";
	
	module.exports = function bindFunctions(functions) {
		var _this = this;
	
		functions.forEach(function (f) {
			return _this[f] = _this[f].bind(_this);
		});
	};

/***/ },

/***/ 807:
/***/ function(module, exports) {

	// Don't try and apply overflow/padding if the scroll is already blocked
	'use strict';
	
	var bodyBlocked = false;
	
	var allowScroll = function allowScroll() {
		if (typeof window === 'undefined' || !bodyBlocked) return;
	
		//  FIXME iOS ignores overflow on body
	
		try {
			var target = document.body;
	
			target.style.paddingRight = '';
			target.style.overflowY = '';
	
			bodyBlocked = false;
		} catch (err) {
			console.error('Failed to find body element. Err:', err);
		}
	};
	
	var blockScroll = function blockScroll() {
		if (typeof window === 'undefined' || bodyBlocked) return;
	
		//  FIXME iOS ignores overflow on body
	
		try {
			var scrollBarWidth = window.innerWidth - document.body.clientWidth;
	
			var target = document.body;
	
			target.style.paddingRight = scrollBarWidth + 'px';
			target.style.overflowY = 'hidden';
	
			bodyBlocked = true;
		} catch (err) {
			console.error('Failed to find body element. Err:', err);
		}
	};
	
	module.exports = {
		allowScroll: allowScroll,
		blockScroll: blockScroll
	};

/***/ },

/***/ 808:
/***/ function(module, exports) {

	// Return true if window + document
	
	'use strict';
	
	module.exports = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

/***/ },

/***/ 809:
/***/ function(module, exports) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	function deepMerge(target) {
		var source = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
		var extended = _extends({}, target);
	
		Object.keys(source).forEach(function (key) {
			if (typeof source[key] !== 'object' || !source[key]) {
				extended[key] = source[key];
			} else {
				if (!target[key]) {
					extended[key] = source[key];
				} else {
					extended[key] = deepMerge(target[key], source[key]);
				}
			}
		});
	
		return extended;
	}
	
	module.exports = deepMerge;

/***/ },

/***/ 810:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _icons = __webpack_require__(811);
	
	var _icons2 = _interopRequireDefault(_icons);
	
	var Icon = function Icon(_ref) {
		var fill = _ref.fill;
		var type = _ref.type;
	
		var props = _objectWithoutProperties(_ref, ['fill', 'type']);
	
		var icon = _icons2['default'][type];
	
		return _react2['default'].createElement('span', _extends({
			dangerouslySetInnerHTML: { __html: icon(fill) }
		}, props));
	};
	
	Icon.propTypes = {
		fill: _react.PropTypes.string,
		type: _react.PropTypes.oneOf(Object.keys(_icons2['default']))
	};
	Icon.defaultProps = {
		fill: 'white'
	};
	
	exports['default'] = Icon;
	module.exports = exports['default'];

/***/ },

/***/ 811:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = {
		arrowLeft: __webpack_require__(812),
		arrowRight: __webpack_require__(813),
		close: __webpack_require__(814)
	};

/***/ },

/***/ 812:
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	exports["default"] = function (fill) {
		return "<svg fill=\"" + fill + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"100%\" height=\"100%\" viewBox=\"0 0 512 512\" xml:space=\"preserve\">\n\t\t<path d=\"M213.7,256L213.7,256L213.7,256L380.9,81.9c4.2-4.3,4.1-11.4-0.2-15.8l-29.9-30.6c-4.3-4.4-11.3-4.5-15.5-0.2L131.1,247.9 c-2.2,2.2-3.2,5.2-3,8.1c-0.1,3,0.9,5.9,3,8.1l204.2,212.7c4.2,4.3,11.2,4.2,15.5-0.2l29.9-30.6c4.3-4.4,4.4-11.5,0.2-15.8 L213.7,256z\"/>\n\t</svg>";
	};
	
	module.exports = exports["default"];

/***/ },

/***/ 813:
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	exports["default"] = function (fill) {
		return "<svg fill=\"" + fill + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"100%\" height=\"100%\" viewBox=\"0 0 512 512\" xml:space=\"preserve\">\n\t\t<path d=\"M298.3,256L298.3,256L298.3,256L131.1,81.9c-4.2-4.3-4.1-11.4,0.2-15.8l29.9-30.6c4.3-4.4,11.3-4.5,15.5-0.2l204.2,212.7 c2.2,2.2,3.2,5.2,3,8.1c0.1,3-0.9,5.9-3,8.1L176.7,476.8c-4.2,4.3-11.2,4.2-15.5-0.2L131.3,446c-4.3-4.4-4.4-11.5-0.2-15.8 L298.3,256z\"/>\n\t</svg>";
	};
	
	module.exports = exports["default"];

/***/ },

/***/ 814:
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	exports["default"] = function (fill) {
		return "<svg fill=\"" + fill + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"100%\" height=\"100%\" viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\">\n\t\t<path d=\"M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4 L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1 c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1 c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z\"/>\n\t</svg>";
	};
	
	module.exports = exports["default"];

/***/ },

/***/ 815:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _aphroditeNoImportant = __webpack_require__(793);
	
	var _theme = __webpack_require__(803);
	
	var _theme2 = _interopRequireDefault(_theme);
	
	var _utils = __webpack_require__(805);
	
	function Container(_ref, _ref2) {
		var props = _objectWithoutProperties(_ref, []);
	
		var theme = _ref2.theme;
	
		var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));
	
		return _react2['default'].createElement('div', _extends({
			className: (0, _aphroditeNoImportant.css)(classes.container)
		}, props));
	};
	
	Container.contextTypes = {
		theme: _react.PropTypes.object.isRequired
	};
	
	var defaultStyles = {
		container: {
			alignItems: 'center',
			backgroundColor: _theme2['default'].container.background,
			boxSizing: 'border-box',
			display: 'flex',
			height: '100%',
			justifyContent: 'center',
			left: 0,
			paddingBottom: _theme2['default'].container.gutter.vertical,
			paddingLeft: _theme2['default'].container.gutter.horizontal,
			paddingRight: _theme2['default'].container.gutter.horizontal,
			paddingTop: _theme2['default'].container.gutter.vertical,
			position: 'fixed',
			top: 0,
			width: '100%',
			zIndex: _theme2['default'].container.zIndex
		}
	};
	
	module.exports = Container;

/***/ },

/***/ 816:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _aphroditeNoImportant = __webpack_require__(793);
	
	var _theme = __webpack_require__(803);
	
	var _theme2 = _interopRequireDefault(_theme);
	
	var _utils = __webpack_require__(805);
	
	function Footer(_ref, _ref2) {
		var caption = _ref.caption;
		var countCurrent = _ref.countCurrent;
		var countSeparator = _ref.countSeparator;
		var countTotal = _ref.countTotal;
		var showCount = _ref.showCount;
	
		var props = _objectWithoutProperties(_ref, ['caption', 'countCurrent', 'countSeparator', 'countTotal', 'showCount']);
	
		var theme = _ref2.theme;
	
		if (!caption && !showCount) return null;
	
		var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));
	
		var imageCount = showCount ? _react2['default'].createElement(
			'div',
			{ className: (0, _aphroditeNoImportant.css)(classes.footerCount) },
			countCurrent,
			countSeparator,
			countTotal
		) : _react2['default'].createElement('span', null);
	
		return _react2['default'].createElement(
			'div',
			_extends({ className: (0, _aphroditeNoImportant.css)(classes.footer) }, props),
			caption ? _react2['default'].createElement(
				'figcaption',
				{ className: (0, _aphroditeNoImportant.css)(classes.footerCaption) },
				caption
			) : _react2['default'].createElement('span', null),
			imageCount
		);
	};
	
	Footer.propTypes = {
		caption: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.element]),
		countCurrent: _react.PropTypes.number,
		countSeparator: _react.PropTypes.string,
		countTotal: _react.PropTypes.number,
		showCount: _react.PropTypes.bool
	};
	Footer.contextTypes = {
		theme: _react.PropTypes.object.isRequired
	};
	
	var defaultStyles = {
		footer: {
			boxSizing: 'border-box',
			color: _theme2['default'].footer.color,
			cursor: 'auto',
			display: 'flex',
			justifyContent: 'space-between',
			left: 0,
			lineHeight: 1.3,
			paddingBottom: _theme2['default'].footer.gutter.vertical,
			paddingLeft: _theme2['default'].footer.gutter.horizontal,
			paddingRight: _theme2['default'].footer.gutter.horizontal,
			paddingTop: _theme2['default'].footer.gutter.vertical
		},
		footerCount: {
			color: _theme2['default'].footer.count.color,
			fontSize: _theme2['default'].footer.count.fontSize,
			paddingLeft: '1em' },
		// add a small gutter for the caption
		footerCaption: {
			flex: '1 1 0'
		}
	};
	
	module.exports = Footer;

/***/ },

/***/ 817:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _aphroditeNoImportant = __webpack_require__(793);
	
	var _theme = __webpack_require__(803);
	
	var _theme2 = _interopRequireDefault(_theme);
	
	var _utils = __webpack_require__(805);
	
	var _Icon = __webpack_require__(810);
	
	var _Icon2 = _interopRequireDefault(_Icon);
	
	function Header(_ref, _ref2) {
		var customControls = _ref.customControls;
		var onClose = _ref.onClose;
		var showCloseButton = _ref.showCloseButton;
	
		var props = _objectWithoutProperties(_ref, ['customControls', 'onClose', 'showCloseButton']);
	
		var theme = _ref2.theme;
	
		var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));
	
		return _react2['default'].createElement(
			'div',
			_extends({ className: (0, _aphroditeNoImportant.css)(classes.header) }, props),
			customControls ? customControls : _react2['default'].createElement('span', null),
			!!showCloseButton && _react2['default'].createElement(
				'button',
				{
					title: 'Close (Esc)',
					className: (0, _aphroditeNoImportant.css)(classes.close),
					onClick: onClose
				},
				_react2['default'].createElement(_Icon2['default'], { fill: !!theme.close && theme.close.fill || _theme2['default'].close.fill, type: 'close' })
			)
		);
	};
	
	Header.propTypes = {
		customControls: _react.PropTypes.array,
		onClose: _react.PropTypes.func.isRequired,
		showCloseButton: _react.PropTypes.bool
	};
	Header.contextTypes = {
		theme: _react.PropTypes.object.isRequired
	};
	
	var defaultStyles = {
		header: {
			display: 'flex',
			justifyContent: 'space-between',
			height: _theme2['default'].header.height
		},
		close: {
			background: 'none',
			border: 'none',
			cursor: 'pointer',
			outline: 'none',
			position: 'relative',
			top: 0,
			verticalAlign: 'bottom',
	
			// increase hit area
			height: _theme2['default'].close.height + 20,
			marginRight: -10,
			padding: 10,
			width: _theme2['default'].close.width + 20
		}
	};
	
	module.exports = Header;

/***/ },

/***/ 818:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _aphroditeNoImportant = __webpack_require__(793);
	
	var _Thumbnail = __webpack_require__(819);
	
	var _Thumbnail2 = _interopRequireDefault(_Thumbnail);
	
	var _Arrow = __webpack_require__(804);
	
	var _Arrow2 = _interopRequireDefault(_Arrow);
	
	var _theme = __webpack_require__(803);
	
	var _theme2 = _interopRequireDefault(_theme);
	
	var classes = _aphroditeNoImportant.StyleSheet.create({
		paginatedThumbnails: {
			bottom: _theme2['default'].container.gutter.vertical,
			height: _theme2['default'].thumbnail.size,
			padding: '0 50px',
			position: 'absolute',
			textAlign: 'center',
			whiteSpace: 'nowrap'
		}
	});
	
	var arrowStyles = {
		height: _theme2['default'].thumbnail.size + _theme2['default'].thumbnail.gutter * 2,
		width: 40
	};
	
	var PaginatedThumbnails = (function (_Component) {
		_inherits(PaginatedThumbnails, _Component);
	
		function PaginatedThumbnails(props) {
			_classCallCheck(this, PaginatedThumbnails);
	
			_get(Object.getPrototypeOf(PaginatedThumbnails.prototype), 'constructor', this).call(this, props);
	
			this.state = {
				hasCustomPage: false
			};
	
			this.gotoPrev = this.gotoPrev.bind(this);
			this.gotoNext = this.gotoNext.bind(this);
		}
	
		_createClass(PaginatedThumbnails, [{
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps(nextProps) {
				// Component should be controlled, flush state when currentImage changes
				if (nextProps.currentImage !== this.props.currentImage) {
					this.setState({
						hasCustomPage: false
					});
				}
			}
	
			// ==============================
			// METHODS
			// ==============================
	
		}, {
			key: 'getFirst',
			value: function getFirst() {
				var _props = this.props;
				var currentImage = _props.currentImage;
				var offset = _props.offset;
	
				if (this.state.hasCustomPage) {
					return this.clampFirst(this.state.first);
				}
				return this.clampFirst(currentImage - offset);
			}
		}, {
			key: 'setFirst',
			value: function setFirst(event, newFirst) {
				var first = this.state.first;
	
				if (event) {
					event.preventDefault();
					event.stopPropagation();
				}
	
				if (first === newFirst) return;
	
				this.setState({
					hasCustomPage: true,
					first: newFirst
				});
			}
		}, {
			key: 'gotoPrev',
			value: function gotoPrev(event) {
				this.setFirst(event, this.getFirst() - this.props.offset);
			}
		}, {
			key: 'gotoNext',
			value: function gotoNext(event) {
				this.setFirst(event, this.getFirst() + this.props.offset);
			}
		}, {
			key: 'clampFirst',
			value: function clampFirst(value) {
				var _props2 = this.props;
				var images = _props2.images;
				var offset = _props2.offset;
	
				var totalCount = 2 * offset + 1; // show $offset extra thumbnails on each side
	
				if (value < 0) {
					return 0;
				} else if (value + totalCount > images.length) {
					// Too far
					return images.length - totalCount;
				} else {
					return value;
				}
			}
	
			// ==============================
			// RENDERERS
			// ==============================
	
		}, {
			key: 'renderArrowPrev',
			value: function renderArrowPrev() {
				if (this.getFirst() <= 0) return null;
	
				return _react2['default'].createElement(_Arrow2['default'], {
					direction: 'left',
					size: 'small',
					icon: 'arrowLeft',
					onClick: this.gotoPrev,
					style: arrowStyles,
					title: 'Previous (Left arrow key)',
					type: 'button'
				});
			}
		}, {
			key: 'renderArrowNext',
			value: function renderArrowNext() {
				var _props3 = this.props;
				var offset = _props3.offset;
				var images = _props3.images;
	
				var totalCount = 2 * offset + 1;
				if (this.getFirst() + totalCount >= images.length) return null;
	
				return _react2['default'].createElement(_Arrow2['default'], {
					direction: 'right',
					size: 'small',
					icon: 'arrowRight',
					onClick: this.gotoNext,
					style: arrowStyles,
					title: 'Previous (Right arrow key)',
					type: 'button'
				});
			}
		}, {
			key: 'render',
			value: function render() {
				var _props4 = this.props;
				var images = _props4.images;
				var currentImage = _props4.currentImage;
				var onClickThumbnail = _props4.onClickThumbnail;
				var offset = _props4.offset;
	
				var totalCount = 2 * offset + 1; // show $offset extra thumbnails on each side
				var thumbnails = [];
				var baseOffset = 0;
				if (images.length <= totalCount) {
					thumbnails = images;
				} else {
					// Try to center current image in list
					baseOffset = this.getFirst();
					thumbnails = images.slice(baseOffset, baseOffset + totalCount);
				}
	
				return _react2['default'].createElement(
					'div',
					{ className: (0, _aphroditeNoImportant.css)(classes.paginatedThumbnails) },
					this.renderArrowPrev(),
					thumbnails.map(function (img, idx) {
						return _react2['default'].createElement(_Thumbnail2['default'], _extends({ key: baseOffset + idx
						}, img, {
							index: baseOffset + idx,
							onClick: onClickThumbnail,
							active: baseOffset + idx === currentImage }));
					}),
					this.renderArrowNext()
				);
			}
		}]);
	
		return PaginatedThumbnails;
	})(_react.Component);
	
	exports['default'] = PaginatedThumbnails;
	
	PaginatedThumbnails.propTypes = {
		currentImage: _react.PropTypes.number,
		images: _react.PropTypes.array,
		offset: _react.PropTypes.number,
		onClickThumbnail: _react.PropTypes.func.isRequired
	};
	module.exports = exports['default'];

/***/ },

/***/ 819:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _aphroditeNoImportant = __webpack_require__(793);
	
	var _theme = __webpack_require__(803);
	
	var _theme2 = _interopRequireDefault(_theme);
	
	var _utils = __webpack_require__(805);
	
	function Thumbnail(_ref, _ref2) {
		var index = _ref.index;
		var src = _ref.src;
		var thumbnail = _ref.thumbnail;
		var active = _ref.active;
		var onClick = _ref.onClick;
		var theme = _ref2.theme;
	
		var url = thumbnail ? thumbnail : src;
		var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));
	
		return _react2['default'].createElement('div', {
			className: (0, _aphroditeNoImportant.css)(classes.thumbnail, active && classes.thumbnail__active),
			onClick: function () {
				return onClick(index);
			},
			style: { backgroundImage: 'url("' + url + '")' }
		});
	}
	
	Thumbnail.propTypes = {
		active: _react.PropTypes.bool,
		index: _react.PropTypes.number,
		onClick: _react.PropTypes.func.isRequired,
		src: _react.PropTypes.string,
		thumbnail: _react.PropTypes.string
	};
	
	Thumbnail.contextTypes = {
		theme: _react.PropTypes.object.isRequired
	};
	
	var defaultStyles = {
		thumbnail: {
			backgroundPosition: 'center',
			backgroundSize: 'cover',
			borderRadius: 2,
			boxShadow: 'inset 0 0 0 1px hsla(0,0%,100%,.2)',
			cursor: 'pointer',
			display: 'inline-block',
			height: _theme2['default'].thumbnail.size,
			margin: _theme2['default'].thumbnail.gutter,
			overflow: 'hidden',
			width: _theme2['default'].thumbnail.size
		},
		thumbnail__active: {
			boxShadow: 'inset 0 0 0 2px ' + _theme2['default'].thumbnail.activeBorderColor
		}
	};
	
	exports['default'] = Thumbnail;
	module.exports = exports['default'];

/***/ },

/***/ 820:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactAddonsCssTransitionGroup = __webpack_require__(821);
	
	var _reactAddonsCssTransitionGroup2 = _interopRequireDefault(_reactAddonsCssTransitionGroup);
	
	var _reactDom = __webpack_require__(35);
	
	var _PassContext = __webpack_require__(826);
	
	var _PassContext2 = _interopRequireDefault(_PassContext);
	
	var Portal = (function (_Component) {
		_inherits(Portal, _Component);
	
		function Portal() {
			_classCallCheck(this, Portal);
	
			_get(Object.getPrototypeOf(Portal.prototype), 'constructor', this).call(this);
			this.portalElement = null;
		}
	
		_createClass(Portal, [{
			key: 'componentDidMount',
			value: function componentDidMount() {
				var p = document.createElement('div');
				document.body.appendChild(p);
				this.portalElement = p;
				this.componentDidUpdate();
			}
		}, {
			key: 'componentDidUpdate',
			value: function componentDidUpdate() {
				// Animate fade on mount/unmount
				var duration = 200;
				var styles = '\n\t\t\t\t.fade-enter { opacity: 0.01; }\n\t\t\t\t.fade-enter.fade-enter-active { opacity: 1; transition: opacity ' + duration + 'ms; }\n\t\t\t\t.fade-leave { opacity: 1; }\n\t\t\t\t.fade-leave.fade-leave-active { opacity: 0.01; transition: opacity ' + duration + 'ms; }\n\t\t';
	
				(0, _reactDom.render)(_react2['default'].createElement(
					_PassContext2['default'],
					{ context: this.context },
					_react2['default'].createElement(
						'div',
						null,
						_react2['default'].createElement(
							'style',
							null,
							styles
						),
						_react2['default'].createElement(_reactAddonsCssTransitionGroup2['default'], _extends({
							component: 'div',
							transitionName: 'fade',
							transitionEnterTimeout: duration,
							transitionLeaveTimeout: duration
						}, this.props))
					)
				), this.portalElement);
			}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {
				document.body.removeChild(this.portalElement);
			}
		}, {
			key: 'render',
			value: function render() {
				return null;
			}
		}]);
	
		return Portal;
	})(_react.Component);
	
	exports['default'] = Portal;
	
	Portal.contextTypes = {
		theme: _react.PropTypes.object.isRequired
	};
	module.exports = exports['default'];

/***/ },

/***/ 821:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(822);

/***/ },

/***/ 822:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ReactCSSTransitionGroup
	 */
	
	'use strict';
	
	var _assign = __webpack_require__(4);
	
	var React = __webpack_require__(3);
	
	var ReactTransitionGroup = __webpack_require__(547);
	var ReactCSSTransitionGroupChild = __webpack_require__(823);
	
	function createTransitionTimeoutPropValidator(transitionType) {
	  var timeoutPropName = 'transition' + transitionType + 'Timeout';
	  var enabledPropName = 'transition' + transitionType;
	
	  return function (props) {
	    // If the transition is enabled
	    if (props[enabledPropName]) {
	      // If no timeout duration is provided
	      if (props[timeoutPropName] == null) {
	        return new Error(timeoutPropName + ' wasn\'t supplied to ReactCSSTransitionGroup: ' + 'this can cause unreliable animations and won\'t be supported in ' + 'a future version of React. See ' + 'https://fb.me/react-animation-transition-group-timeout for more ' + 'information.');
	
	        // If the duration isn't a number
	      } else if (typeof props[timeoutPropName] !== 'number') {
	          return new Error(timeoutPropName + ' must be a number (in milliseconds)');
	        }
	    }
	  };
	}
	
	/**
	 * An easy way to perform CSS transitions and animations when a React component
	 * enters or leaves the DOM.
	 * See https://facebook.github.io/react/docs/animation.html#high-level-api-reactcsstransitiongroup
	 */
	var ReactCSSTransitionGroup = React.createClass({
	  displayName: 'ReactCSSTransitionGroup',
	
	  propTypes: {
	    transitionName: ReactCSSTransitionGroupChild.propTypes.name,
	
	    transitionAppear: React.PropTypes.bool,
	    transitionEnter: React.PropTypes.bool,
	    transitionLeave: React.PropTypes.bool,
	    transitionAppearTimeout: createTransitionTimeoutPropValidator('Appear'),
	    transitionEnterTimeout: createTransitionTimeoutPropValidator('Enter'),
	    transitionLeaveTimeout: createTransitionTimeoutPropValidator('Leave')
	  },
	
	  getDefaultProps: function () {
	    return {
	      transitionAppear: false,
	      transitionEnter: true,
	      transitionLeave: true
	    };
	  },
	
	  _wrapChild: function (child) {
	    // We need to provide this childFactory so that
	    // ReactCSSTransitionGroupChild can receive updates to name, enter, and
	    // leave while it is leaving.
	    return React.createElement(ReactCSSTransitionGroupChild, {
	      name: this.props.transitionName,
	      appear: this.props.transitionAppear,
	      enter: this.props.transitionEnter,
	      leave: this.props.transitionLeave,
	      appearTimeout: this.props.transitionAppearTimeout,
	      enterTimeout: this.props.transitionEnterTimeout,
	      leaveTimeout: this.props.transitionLeaveTimeout
	    }, child);
	  },
	
	  render: function () {
	    return React.createElement(ReactTransitionGroup, _assign({}, this.props, { childFactory: this._wrapChild }));
	  }
	});
	
	module.exports = ReactCSSTransitionGroup;

/***/ },

/***/ 823:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ReactCSSTransitionGroupChild
	 */
	
	'use strict';
	
	var React = __webpack_require__(3);
	var ReactDOM = __webpack_require__(36);
	
	var CSSCore = __webpack_require__(824);
	var ReactTransitionEvents = __webpack_require__(825);
	
	var onlyChild = __webpack_require__(34);
	
	var TICK = 17;
	
	var ReactCSSTransitionGroupChild = React.createClass({
	  displayName: 'ReactCSSTransitionGroupChild',
	
	  propTypes: {
	    name: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.shape({
	      enter: React.PropTypes.string,
	      leave: React.PropTypes.string,
	      active: React.PropTypes.string
	    }), React.PropTypes.shape({
	      enter: React.PropTypes.string,
	      enterActive: React.PropTypes.string,
	      leave: React.PropTypes.string,
	      leaveActive: React.PropTypes.string,
	      appear: React.PropTypes.string,
	      appearActive: React.PropTypes.string
	    })]).isRequired,
	
	    // Once we require timeouts to be specified, we can remove the
	    // boolean flags (appear etc.) and just accept a number
	    // or a bool for the timeout flags (appearTimeout etc.)
	    appear: React.PropTypes.bool,
	    enter: React.PropTypes.bool,
	    leave: React.PropTypes.bool,
	    appearTimeout: React.PropTypes.number,
	    enterTimeout: React.PropTypes.number,
	    leaveTimeout: React.PropTypes.number
	  },
	
	  transition: function (animationType, finishCallback, userSpecifiedDelay) {
	    var node = ReactDOM.findDOMNode(this);
	
	    if (!node) {
	      if (finishCallback) {
	        finishCallback();
	      }
	      return;
	    }
	
	    var className = this.props.name[animationType] || this.props.name + '-' + animationType;
	    var activeClassName = this.props.name[animationType + 'Active'] || className + '-active';
	    var timeout = null;
	
	    var endListener = function (e) {
	      if (e && e.target !== node) {
	        return;
	      }
	
	      clearTimeout(timeout);
	
	      CSSCore.removeClass(node, className);
	      CSSCore.removeClass(node, activeClassName);
	
	      ReactTransitionEvents.removeEndEventListener(node, endListener);
	
	      // Usually this optional callback is used for informing an owner of
	      // a leave animation and telling it to remove the child.
	      if (finishCallback) {
	        finishCallback();
	      }
	    };
	
	    CSSCore.addClass(node, className);
	
	    // Need to do this to actually trigger a transition.
	    this.queueClassAndNode(activeClassName, node);
	
	    // If the user specified a timeout delay.
	    if (userSpecifiedDelay) {
	      // Clean-up the animation after the specified delay
	      timeout = setTimeout(endListener, userSpecifiedDelay);
	      this.transitionTimeouts.push(timeout);
	    } else {
	      // DEPRECATED: this listener will be removed in a future version of react
	      ReactTransitionEvents.addEndEventListener(node, endListener);
	    }
	  },
	
	  queueClassAndNode: function (className, node) {
	    this.classNameAndNodeQueue.push({
	      className: className,
	      node: node
	    });
	
	    if (!this.timeout) {
	      this.timeout = setTimeout(this.flushClassNameAndNodeQueue, TICK);
	    }
	  },
	
	  flushClassNameAndNodeQueue: function () {
	    if (this.isMounted()) {
	      this.classNameAndNodeQueue.forEach(function (obj) {
	        CSSCore.addClass(obj.node, obj.className);
	      });
	    }
	    this.classNameAndNodeQueue.length = 0;
	    this.timeout = null;
	  },
	
	  componentWillMount: function () {
	    this.classNameAndNodeQueue = [];
	    this.transitionTimeouts = [];
	  },
	
	  componentWillUnmount: function () {
	    if (this.timeout) {
	      clearTimeout(this.timeout);
	    }
	    this.transitionTimeouts.forEach(function (timeout) {
	      clearTimeout(timeout);
	    });
	
	    this.classNameAndNodeQueue.length = 0;
	  },
	
	  componentWillAppear: function (done) {
	    if (this.props.appear) {
	      this.transition('appear', done, this.props.appearTimeout);
	    } else {
	      done();
	    }
	  },
	
	  componentWillEnter: function (done) {
	    if (this.props.enter) {
	      this.transition('enter', done, this.props.enterTimeout);
	    } else {
	      done();
	    }
	  },
	
	  componentWillLeave: function (done) {
	    if (this.props.leave) {
	      this.transition('leave', done, this.props.leaveTimeout);
	    } else {
	      done();
	    }
	  },
	
	  render: function () {
	    return onlyChild(this.props.children);
	  }
	});
	
	module.exports = ReactCSSTransitionGroupChild;

/***/ },

/***/ 824:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @typechecks
	 */
	
	var invariant = __webpack_require__(8);
	
	/**
	 * The CSSCore module specifies the API (and implements most of the methods)
	 * that should be used when dealing with the display of elements (via their
	 * CSS classes and visibility on screen. It is an API focused on mutating the
	 * display and not reading it as no logical state should be encoded in the
	 * display of elements.
	 */
	
	/* Slow implementation for browsers that don't natively support .matches() */
	function matchesSelector_SLOW(element, selector) {
	  var root = element;
	  while (root.parentNode) {
	    root = root.parentNode;
	  }
	
	  var all = root.querySelectorAll(selector);
	  return Array.prototype.indexOf.call(all, element) !== -1;
	}
	
	var CSSCore = {
	
	  /**
	   * Adds the class passed in to the element if it doesn't already have it.
	   *
	   * @param {DOMElement} element the element to set the class on
	   * @param {string} className the CSS className
	   * @return {DOMElement} the element passed in
	   */
	  addClass: function addClass(element, className) {
	    !!/\s/.test(className) ?  true ? invariant(false, 'CSSCore.addClass takes only a single class name. "%s" contains ' + 'multiple classes.', className) : invariant(false) : void 0;
	
	    if (className) {
	      if (element.classList) {
	        element.classList.add(className);
	      } else if (!CSSCore.hasClass(element, className)) {
	        element.className = element.className + ' ' + className;
	      }
	    }
	    return element;
	  },
	
	  /**
	   * Removes the class passed in from the element
	   *
	   * @param {DOMElement} element the element to set the class on
	   * @param {string} className the CSS className
	   * @return {DOMElement} the element passed in
	   */
	  removeClass: function removeClass(element, className) {
	    !!/\s/.test(className) ?  true ? invariant(false, 'CSSCore.removeClass takes only a single class name. "%s" contains ' + 'multiple classes.', className) : invariant(false) : void 0;
	
	    if (className) {
	      if (element.classList) {
	        element.classList.remove(className);
	      } else if (CSSCore.hasClass(element, className)) {
	        element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g'), '$1').replace(/\s+/g, ' ') // multiple spaces to one
	        .replace(/^\s*|\s*$/g, ''); // trim the ends
	      }
	    }
	    return element;
	  },
	
	  /**
	   * Helper to add or remove a class from an element based on a condition.
	   *
	   * @param {DOMElement} element the element to set the class on
	   * @param {string} className the CSS className
	   * @param {*} bool condition to whether to add or remove the class
	   * @return {DOMElement} the element passed in
	   */
	  conditionClass: function conditionClass(element, className, bool) {
	    return (bool ? CSSCore.addClass : CSSCore.removeClass)(element, className);
	  },
	
	  /**
	   * Tests whether the element has the class specified.
	   *
	   * @param {DOMNode|DOMWindow} element the element to check the class on
	   * @param {string} className the CSS className
	   * @return {boolean} true if the element has the class, false if not
	   */
	  hasClass: function hasClass(element, className) {
	    !!/\s/.test(className) ?  true ? invariant(false, 'CSS.hasClass takes only a single class name.') : invariant(false) : void 0;
	    if (element.classList) {
	      return !!className && element.classList.contains(className);
	    }
	    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
	  },
	
	  /**
	   * Tests whether the element matches the selector specified
	   *
	   * @param {DOMNode|DOMWindow} element the element that we are querying
	   * @param {string} selector the CSS selector
	   * @return {boolean} true if the element matches the selector, false if not
	   */
	  matchesSelector: function matchesSelector(element, selector) {
	    var matchesImpl = element.matches || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector || function (s) {
	      return matchesSelector_SLOW(element, s);
	    };
	    return matchesImpl.call(element, selector);
	  }
	
	};
	
	module.exports = CSSCore;

/***/ },

/***/ 825:
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ReactTransitionEvents
	 */
	
	'use strict';
	
	var ExecutionEnvironment = __webpack_require__(50);
	
	var getVendorPrefixedEventName = __webpack_require__(110);
	
	var endEvents = [];
	
	function detectEvents() {
	  var animEnd = getVendorPrefixedEventName('animationend');
	  var transEnd = getVendorPrefixedEventName('transitionend');
	
	  if (animEnd) {
	    endEvents.push(animEnd);
	  }
	
	  if (transEnd) {
	    endEvents.push(transEnd);
	  }
	}
	
	if (ExecutionEnvironment.canUseDOM) {
	  detectEvents();
	}
	
	// We use the raw {add|remove}EventListener() call because EventListener
	// does not know how to remove event listeners and we really should
	// clean up. Also, these events are not triggered in older browsers
	// so we should be A-OK here.
	
	function addEventListener(node, eventName, eventListener) {
	  node.addEventListener(eventName, eventListener, false);
	}
	
	function removeEventListener(node, eventName, eventListener) {
	  node.removeEventListener(eventName, eventListener, false);
	}
	
	var ReactTransitionEvents = {
	  addEndEventListener: function (node, eventListener) {
	    if (endEvents.length === 0) {
	      // If CSS transitions are not supported, trigger an "end animation"
	      // event immediately.
	      window.setTimeout(eventListener, 0);
	      return;
	    }
	    endEvents.forEach(function (endEvent) {
	      addEventListener(node, endEvent, eventListener);
	    });
	  },
	
	  removeEndEventListener: function (node, eventListener) {
	    if (endEvents.length === 0) {
	      return;
	    }
	    endEvents.forEach(function (endEvent) {
	      removeEventListener(node, endEvent, eventListener);
	    });
	  }
	};
	
	module.exports = ReactTransitionEvents;

/***/ },

/***/ 826:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(2);
	
	// Pass the Lightbox context through to the Portal's descendents
	// StackOverflow discussion http://goo.gl/oclrJ9
	
	var PassContext = (function (_Component) {
		_inherits(PassContext, _Component);
	
		function PassContext() {
			_classCallCheck(this, PassContext);
	
			_get(Object.getPrototypeOf(PassContext.prototype), 'constructor', this).apply(this, arguments);
		}
	
		_createClass(PassContext, [{
			key: 'getChildContext',
			value: function getChildContext() {
				return this.props.context;
			}
		}, {
			key: 'render',
			value: function render() {
				return _react.Children.only(this.props.children);
			}
		}]);
	
		return PassContext;
	})(_react.Component);
	
	;
	
	PassContext.propTypes = {
		context: _react.PropTypes.object.isRequired
	};
	PassContext.childContextTypes = {
		theme: _react.PropTypes.object
	};
	
	exports['default'] = PassContext;
	module.exports = exports['default'];

/***/ },

/***/ 827:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _ReviewCard = __webpack_require__(828);
	
	var _ReviewCard2 = _interopRequireDefault(_ReviewCard);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _ReviewCard2.default;

/***/ },

/***/ 828:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactSlick = __webpack_require__(679);
	
	var _reactSlick2 = _interopRequireDefault(_reactSlick);
	
	var _Card = __webpack_require__(643);
	
	var _FlatButton = __webpack_require__(655);
	
	var _FlatButton2 = _interopRequireDefault(_FlatButton);
	
	var _Divider = __webpack_require__(641);
	
	var _Divider2 = _interopRequireDefault(_Divider);
	
	var _IconButton = __webpack_require__(531);
	
	var _IconButton2 = _interopRequireDefault(_IconButton);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var settings = {
	  infinite: true,
	  speed: 500,
	  slidesToShow: 2,
	  slidesToScroll: 1,
	  autoplay: false,
	  autoplaySpeed: 3000
	};
	var styles = {
	  card: {
	    margin: '30px'
	  },
	  reviewBody: {
	    minHeight: '176px'
	  },
	  reviewIcon: {
	    top: '20px',
	    left: '300px',
	    zIndex: 100,
	    border: '1px solid #2B2B2B',
	    borderRadius: "9999px"
	
	  },
	  cardHeader: {
	    backgroundColor: '#2B2B2B',
	    color: "#ffffff !important"
	  }
	};
	var ReviewCard = function ReviewCard(props) {
	  return _react2.default.createElement(
	    'div',
	    null,
	    _react2.default.createElement(
	      _reactSlick2.default,
	      settings,
	      props.reviews.map(function (tile, index) {
	        return _react2.default.createElement(
	          'div',
	          { key: index },
	          _react2.default.createElement(
	            _Card.Card,
	            { key: index,
	              style: styles.card
	            },
	            _react2.default.createElement(_Card.CardTitle, {
	              title: tile.review,
	              style: styles.reviewBody
	            }),
	            _react2.default.createElement(_Divider2.default, null),
	            _react2.default.createElement(_Card.CardHeader, {
	              style: styles.cardHeader,
	              title: tile.name,
	              subtitle: 'Dated : ' + tile.date,
	              avatar: tile.thumbnail
	            })
	          )
	        );
	      })
	    )
	  );
	};
	
	ReviewCard.propTypes = {
	  reviews: _react2.default.PropTypes.array.isRequired
	};
	
	exports.default = ReviewCard;

/***/ }

});
//# sourceMappingURL=5.studio.d107b1e81ba5c991cfe8.js.map