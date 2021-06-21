/*!
 * 基于Mars3D的支持结合echarts和mapv可视化功能插件  
 * 版本信息：v2.0.3, hash值: 0b3d3600c9117639c432
 * 编译日期：2020-10-25 13:58:02     
 * 版权所有：Copyright by 火星科技 http://cesium.marsgis.cn
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("cesium/Cesium"), require("echarts"), require("mapv"));
	else if(typeof define === 'function' && define.amd)
		define(["cesium/Cesium", "echarts", "mapv"], factory);
	else if(typeof exports === 'object')
		exports["Mars3DVisual"] = factory(require("cesium/Cesium"), require("echarts"), require("mapv"));
	else
		root["Mars3DVisual"] = factory(root["Cesium"], root["echarts"], root["mapv"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__0__, __WEBPACK_EXTERNAL_MODULE__3__, __WEBPACK_EXTERNAL_MODULE__6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _cesium = __webpack_require__(0);

var Cesium = _interopRequireWildcard(_cesium);

var _FlowEcharts = __webpack_require__(2);

var _MapVLayer = __webpack_require__(4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

if (!window.mars3d) {
    console.log('请首先引入 mars3d 基础库，才能使用该插件！ http://cesium.marsgis.cn');
}

//=====================可视化支持 mapv 、Echarts=====================

exports.FlowEcharts = _FlowEcharts.FlowEcharts;

exports.MapVLayer = _MapVLayer.MapVLayer;

mars3d.FlowEcharts = _FlowEcharts.FlowEcharts;
mars3d.MapVLayer = _MapVLayer.MapVLayer;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FlowEcharts = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //参考了开源：https://github.com/sharpzao/EchartsCesium
//当前版本由火星科技开发 http://marsgis.cn 


// 引入 ECharts 主模块


var _cesium = __webpack_require__(0);

var Cesium = _interopRequireWildcard(_cesium);

var _echarts = __webpack_require__(3);

var _echarts2 = _interopRequireDefault(_echarts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 类
var CompositeCoordinateSystem = function () {
    //========== 构造方法 ========== 
    function CompositeCoordinateSystem(GLMap, api) {
        _classCallCheck(this, CompositeCoordinateSystem);

        this._GLMap = GLMap;
        this.dimensions = ['lng', 'lat'];
        this._mapOffset = [0, 0];

        this._api = api;
    }

    //========== 对外属性 ==========  
    // //裁剪距离 
    // get distance() {
    //     return this._distance || 0;
    // }
    // set distance(val) {
    //     this._distance = val; 
    // }

    //========== 方法 ========== 


    _createClass(CompositeCoordinateSystem, [{
        key: 'setMapOffset',
        value: function setMapOffset(mapOffset) {
            this._mapOffset = mapOffset;
        }
    }, {
        key: 'getBMap',
        value: function getBMap() {
            return this._GLMap;
        }
    }, {
        key: 'dataToPoint',
        value: function dataToPoint(data) {
            var scene = this._GLMap;
            var defVal = [99999, 99999];

            var heightTerrain = scene.echartsFixedHeight;
            if (scene.echartsAutoHeight) {
                heightTerrain = scene.globe.getHeight(Cesium.Cartographic.fromDegrees(data[0], data[1]));
            }

            var position = Cesium.Cartesian3.fromDegrees(data[0], data[1], heightTerrain);
            if (!position) {
                return defVal;
            }

            var px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position);
            // var px = scene.cartesianToCanvasCoordinates(position);
            if (!px) {
                return defVal;
            }

            //判断是否在球的背面
            if (scene.echartsDepthTest && scene.mode === Cesium.SceneMode.SCENE3D) {
                var occluder = new Cesium.EllipsoidalOccluder(scene.globe.ellipsoid, scene.camera.positionWC);
                var visible = occluder.isPointVisible(position);
                //visible为true说明点在球的正面，否则点在球的背面。 
                //需要注意的是不能用这种方法判断点的可见性，如果球放的比较大，点跑到屏幕外面，它返回的依然为true
                if (!visible) return false;
            }
            //判断是否在球的背面


            return [px.x - this._mapOffset[0], px.y - this._mapOffset[1]];
        }
    }, {
        key: 'pointToData',
        value: function pointToData(pt) {
            var mapOffset = this._mapOffset;
            var pt = this._bmap.project([pt[0] + mapOffset[0], pt[1] + mapOffset[1]]);
            return [pt.lng, pt.lat];
        }
    }, {
        key: 'getViewRect',
        value: function getViewRect() {
            var api = this._api;
            return new _echarts2.default.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
        }
    }, {
        key: 'getRoamTransform',
        value: function getRoamTransform() {
            return _echarts2.default.matrix.create();
        }
    }]);

    return CompositeCoordinateSystem;
}();

//用于确定创建列表数据时要使用的维度


CompositeCoordinateSystem.dimensions = ['lng', 'lat'];
CompositeCoordinateSystem.create = function (ecModel, api) {
    var coordSys;

    ecModel.eachComponent('GLMap', function (GLMapModel) {
        var painter = api.getZr().painter;
        if (!painter) return;

        var viewportRoot = painter.getViewportRoot();
        var GLMap = _echarts2.default.glMap;
        coordSys = new CompositeCoordinateSystem(GLMap, api);
        coordSys.setMapOffset(GLMapModel.__mapOffset || [0, 0]);
        GLMapModel.coordinateSystem = coordSys;
    });

    ecModel.eachSeries(function (seriesModel) {
        if (seriesModel.get('coordinateSystem') === 'GLMap') {
            seriesModel.coordinateSystem = coordSys;
        }
    });
};

/////////扩展echarts///////////
if (_echarts2.default) {
    _echarts2.default.registerCoordinateSystem('GLMap', CompositeCoordinateSystem);
    _echarts2.default.registerAction({
        type: 'GLMapRoam',
        event: 'GLMapRoam',
        update: 'updateLayout'
    }, function (payload, ecModel) {});

    _echarts2.default.extendComponentModel({
        type: 'GLMap',
        getBMap: function getBMap() {
            // __bmap is injected when creating BMapCoordSys
            return this.__GLMap;
        },
        defaultOption: {
            roam: false
        }
    });

    _echarts2.default.extendComponentView({
        type: 'GLMap',
        init: function init(ecModel, api) {
            this.api = api;
            _echarts2.default.glMap.postRender.addEventListener(this.moveHandler, this);
        },
        moveHandler: function moveHandler(type, target) {
            this.api.dispatchAction({
                type: 'GLMapRoam'
            });
        },
        render: function render(GLMapModel, ecModel, api) {},
        dispose: function dispose(target) {
            _echarts2.default.glMap.postRender.removeEventListener(this.moveHandler, this);
        }
    });
}

////////////FlowEcharts/////////////// 
var flowEchartsIndex = 999;

// 类

var FlowEcharts = exports.FlowEcharts = function () {
    //========== 构造方法 ========== 
    function FlowEcharts(_viewer, option) {
        _classCallCheck(this, FlowEcharts);

        this._viewer = _viewer;

        this._viewer.scene.echartsDepthTest = Cesium.defaultValue(option.depthTest, true); //是否进行计算深度（大数据时，需要关闭）
        this._viewer.scene.echartsAutoHeight = Cesium.defaultValue(option.clampToGround, false);
        this._viewer.scene.echartsFixedHeight = Cesium.defaultValue(option.fixedHeight, 0);

        this._overlay = this._createChartOverlay();
        this._overlay.setOption(option);
    }

    //========== 对外属性 ==========  
    // //裁剪距离 
    // get distance() {
    //     return this._distance || 0;
    // }
    // set distance(val) {
    //     this._distance = val; 
    // }

    //========== 方法 ========== 


    _createClass(FlowEcharts, [{
        key: '_createChartOverlay',
        value: function _createChartOverlay() {
            var scene = this._viewer.scene;
            scene.canvas.setAttribute('tabIndex', 0);

            var chartContainer = document.createElement('div');
            chartContainer.style.position = 'absolute';
            chartContainer.style.top = '0px';
            chartContainer.style.left = '0px';
            chartContainer.style.width = scene.canvas.clientWidth + 'px';
            chartContainer.style.height = scene.canvas.clientHeight + 'px';
            chartContainer.style.pointerEvents = 'none'; //auto时可以交互，但是没法放大地球， none 没法交互
            chartContainer.style.zIndex = flowEchartsIndex--;

            chartContainer.setAttribute('id', 'echarts');
            chartContainer.setAttribute('class', 'echartMap');
            this._viewer.cesiumWidget.container.appendChild(chartContainer);
            this._echartsContainer = chartContainer;

            _echarts2.default.glMap = scene;
            return _echarts2.default.init(chartContainer);
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            if (this._echartsContainer) {
                this._viewer.cesiumWidget.container.removeChild(this._echartsContainer);
                this._echartsContainer = null;
            }
            if (this._overlay) {
                this._overlay.dispose();
                this._overlay = null;
            }
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            //兼容不同名称
            this.dispose();
        }
    }, {
        key: 'updateOverlay',
        value: function updateOverlay(option) {
            if (this._overlay) {
                this._overlay.setOption(option);
            }
        }
    }, {
        key: 'getMap',
        value: function getMap() {
            return this._viewer;
        }
    }, {
        key: 'getOverlay',
        value: function getOverlay() {
            return this._overlay;
        }
    }, {
        key: 'show',
        value: function show() {
            if (this._echartsContainer) this._echartsContainer.style.visibility = "visible";
        }
    }, {
        key: 'hide',
        value: function hide() {
            if (this._echartsContainer) this._echartsContainer.style.visibility = "hidden";
        }
    }]);

    return FlowEcharts;
}();

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MapVLayer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //mapv+cesium融合，by http://marsgis.cn 


var _cesium = __webpack_require__(0);

var Cesium = _interopRequireWildcard(_cesium);

var _MapVRenderer = __webpack_require__(5);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var divId = 0;

/**
 * @class mapVLayer
 * @classdesc MapV 图层。
 * @category Visualization MapV 
 * @param {mapv.DataSet} dataSet - MapV 图层数据集。
 * @param {Object} mapVOptions - MapV 图层参数。
 * @param {Object} options - 参数。
 * @param {string} [options.attributionPrefix] - 版权信息前缀。
 * @param {string} [options.attribution='© 2018 百度 MapV'] - 版权信息。
 * @fires mapVLayer#loaded
 */

var MapVLayer = exports.MapVLayer = function () {
	//========== 构造方法 ========== 
	function MapVLayer(t, e, i, n) {
		_classCallCheck(this, MapVLayer);

		this.map = t;
		this.scene = t.scene;

		this.scene.mapvDepthTest = Cesium.defaultValue(i.depthTest, true); //是否进行计算深度（大数据时，需要关闭）
		this.scene.mapvAutoHeight = Cesium.defaultValue(i.clampToGround, false);
		this.scene.mapvFixedHeight = Cesium.defaultValue(i.fixedHeight, 0);

		this.mapvBaseLayer = new _MapVRenderer.MapVRenderer(t, e, i, this);

		this.mapVOptions = i;
		this.initDevicePixelRatio();
		this.canvas = this._createCanvas();
		this.render = this.render.bind(this);

		void 0 != n ? (this.container = n, n.appendChild(this.canvas)) : (this.container = t.container, this.addInnerContainer());
		this.bindEvent();
		this._reset();
	}
	//========== 方法 ========== 


	_createClass(MapVLayer, [{
		key: "initDevicePixelRatio",
		value: function initDevicePixelRatio() {
			this.devicePixelRatio = window.devicePixelRatio || 1;
		}
	}, {
		key: "addInnerContainer",
		value: function addInnerContainer() {
			this.container.appendChild(this.canvas);
		}
	}, {
		key: "bindEvent",
		value: function bindEvent() {
			var _this = this;

			//绑定cesium事件与mapv联动
			this.innerMoveStart = this.moveStartEvent.bind(this), this.innerMoveEnd = this.moveEndEvent.bind(this);

			this.scene.camera.moveStart.addEventListener(this.innerMoveStart, this);
			this.scene.camera.moveEnd.addEventListener(this.innerMoveEnd, this);

			//解决cesium有时 moveStart 后没有触发 moveEnd
			var handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
			handler.setInputAction(function (event) {
				_this.innerMoveEnd();
			}, Cesium.ScreenSpaceEventType.LEFT_UP);
			handler.setInputAction(function (event) {
				_this.innerMoveEnd();
			}, Cesium.ScreenSpaceEventType.MIDDLE_UP);

			this.handler = handler;
		}
	}, {
		key: "unbindEvent",
		value: function unbindEvent() {
			this.scene.camera.moveStart.removeEventListener(this.innerMoveStart, this);
			this.scene.camera.moveEnd.removeEventListener(this.innerMoveEnd, this);
			this.scene.postRender.removeEventListener(this._reset, this);

			if (this.handler) {
				this.handler.destroy();
				this.handler = null;
			}
		}
	}, {
		key: "moveStartEvent",
		value: function moveStartEvent() {
			this.mapvBaseLayer && this.mapvBaseLayer.animatorMovestartEvent();
			//this._unvisiable()

			this.scene.postRender.addEventListener(this._reset, this);

			// console.log('mapv moveStartEvent');
		}
	}, {
		key: "moveEndEvent",
		value: function moveEndEvent() {
			this.scene.postRender.removeEventListener(this._reset, this);

			this.mapvBaseLayer && this.mapvBaseLayer.animatorMoveendEvent();
			this._reset();
			//this._visiable() 
			// console.log('mapv moveEndEvent');
		}
	}, {
		key: "zoomStartEvent",
		value: function zoomStartEvent() {
			this._unvisiable();
		}
	}, {
		key: "zoomEndEvent",
		value: function zoomEndEvent() {
			this._unvisiable();
		}
	}, {
		key: "addData",
		value: function addData(t, e) {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer.addData(t, e);
		}
	}, {
		key: "updateData",
		value: function updateData(t, e) {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer.updateData(t, e);
		}
	}, {
		key: "getData",
		value: function getData() {
			return this.mapvBaseLayer && (this.dataSet = this.mapvBaseLayer.getData()), this.dataSet;
		}
	}, {
		key: "removeData",
		value: function removeData(t) {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer && this.mapvBaseLayer.removeData(t);
		}
	}, {
		key: "removeAllData",
		value: function removeAllData() {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer.clearData();
		}
	}, {
		key: "_visiable",
		value: function _visiable() {
			return this.canvas.style.display = "block";
		}
	}, {
		key: "_unvisiable",
		value: function _unvisiable() {
			return this.canvas.style.display = "none";
		}
	}, {
		key: "_createCanvas",
		value: function _createCanvas() {
			var t = document.createElement("canvas");
			t.id = this.mapVOptions.layerid || "mapv" + divId++, t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.style.pointerEvents = "none", //auto时可以交互，但是没法放大地球, none没法交互
			t.style.zIndex = this.mapVOptions.zIndex || 100, t.width = parseInt(this.map.canvas.width), t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height = this.map.canvas.style.height;

			var e = this.devicePixelRatio;
			return "2d" == this.mapVOptions.context && t.getContext(this.mapVOptions.context).scale(e, e), t;
		}
	}, {
		key: "_reset",
		value: function _reset() {
			this.resizeCanvas(), this.fixPosition(), this.onResize(), this.render();
		}
	}, {
		key: "draw",
		value: function draw() {
			this._reset();
		}
	}, {
		key: "show",
		value: function show() {
			this._visiable();
		}
	}, {
		key: "hide",
		value: function hide() {
			this._unvisiable();
		}
	}, {
		key: "destroy",
		value: function destroy() {
			//释放	
			this.unbindEvent();
			this.remove();
		}
	}, {
		key: "remove",
		value: function remove() {
			void 0 != this.mapvBaseLayer && (this.removeAllData(), this.mapvBaseLayer.destroy(), this.mapvBaseLayer = void 0, this.canvas.parentElement.removeChild(this.canvas));
		}
	}, {
		key: "update",
		value: function update(t) {
			void 0 != t && this.updateData(t.data, t.options);
		}
	}, {
		key: "resizeCanvas",
		value: function resizeCanvas() {
			if (void 0 != this.canvas && null != this.canvas) {
				var t = this.canvas;
				t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.width = parseInt(this.map.canvas.width), t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height = this.map.canvas.style.height;
			}
		}
	}, {
		key: "fixPosition",
		value: function fixPosition() {}
	}, {
		key: "onResize",
		value: function onResize() {}
	}, {
		key: "render",
		value: function render() {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer._canvasUpdate();
		}
	}]);

	return MapVLayer;
}();

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MapVRenderer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _cesium = __webpack_require__(0);

var Cesium = _interopRequireWildcard(_cesium);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //mapv+cesium融合，by http://marsgis.cn 


var mapv = __webpack_require__(6);

var baiduMapLayer = mapv ? mapv.baiduMapLayer : null;
var BaseLayer = baiduMapLayer ? baiduMapLayer.__proto__ : Function;

var MapVRenderer = exports.MapVRenderer = function (_BaseLayer) {
	_inherits(MapVRenderer, _BaseLayer);

	//========== 构造方法 ========== 
	function MapVRenderer(t, e, i, n) {
		_classCallCheck(this, MapVRenderer);

		var _this = _possibleConstructorReturn(this, (MapVRenderer.__proto__ || Object.getPrototypeOf(MapVRenderer)).call(this, t, e, i));

		if (!BaseLayer) {
			return _possibleConstructorReturn(_this);
		}

		_this.map = t, _this.scene = t.scene, _this.dataSet = e;
		i = i || {}, _this.init(i), _this.argCheck(i), _this.initDevicePixelRatio(), _this.canvasLayer = n, _this.stopAniamation = !1, _this.animation = i.animation, _this.clickEvent = _this.clickEvent.bind(_this), _this.mousemoveEvent = _this.mousemoveEvent.bind(_this), _this.bindEvent();

		return _this;
	}
	//========== 方法 ========== 


	_createClass(MapVRenderer, [{
		key: "initDevicePixelRatio",
		value: function initDevicePixelRatio() {
			this.devicePixelRatio = window.devicePixelRatio || 1;
		}
	}, {
		key: "clickEvent",
		value: function clickEvent(t) {
			var e = t.point;
			_get(MapVRenderer.prototype.__proto__ || Object.getPrototypeOf(MapVRenderer.prototype), "clickEvent", this).call(this, e, t);
		}
	}, {
		key: "mousemoveEvent",
		value: function mousemoveEvent(t) {
			var e = t.point;
			_get(MapVRenderer.prototype.__proto__ || Object.getPrototypeOf(MapVRenderer.prototype), "mousemoveEvent", this).call(this, e, t);
		}
	}, {
		key: "addAnimatorEvent",
		value: function addAnimatorEvent() {}
	}, {
		key: "animatorMovestartEvent",
		value: function animatorMovestartEvent() {
			var t = this.options.animation;
			this.isEnabledTime() && this.animator && (this.steps.step = t.stepsRange.start);
		}
	}, {
		key: "animatorMoveendEvent",
		value: function animatorMoveendEvent() {
			this.isEnabledTime() && this.animator;
		}
	}, {
		key: "bindEvent",
		value: function bindEvent() {
			this.map;
			this.options.methods && (this.options.methods.click, this.options.methods.mousemove);
		}
	}, {
		key: "unbindEvent",
		value: function unbindEvent() {
			var t = this.map;
			this.options.methods && (this.options.methods.click && t.off("click", this.clickEvent), this.options.methods.mousemove && t.off("mousemove", this.mousemoveEvent));
		}
	}, {
		key: "getContext",
		value: function getContext() {
			return this.canvasLayer.canvas.getContext(this.context);
		}
	}, {
		key: "init",
		value: function init(t) {
			this.options = t;
			this.initDataRange(t);
			this.context = this.options.context || "2d";

			if (this.options.zIndex && this.canvasLayer && this.canvasLayer.setZIndex) this.canvasLayer.setZIndex(this.options.zIndex);

			this.initAnimator();
		}
	}, {
		key: "_canvasUpdate",
		value: function _canvasUpdate(t) {
			this.map;
			var e = this.scene;
			if (this.canvasLayer && !this.stopAniamation) {
				var i = this.options.animation,
				    n = this.getContext();
				if (this.isEnabledTime()) {
					if (void 0 === t) return void this.clear(n);
					"2d" === this.context && (n.save(), n.globalCompositeOperation = "destination-out", n.fillStyle = "rgba(0, 0, 0, .1)", n.fillRect(0, 0, n.canvas.width, n.canvas.height), n.restore());
				} else this.clear(n);
				if ("2d" === this.context) for (var o in this.options) {
					n[o] = this.options[o];
				} else n.clear(n.COLOR_BUFFER_BIT);
				var a = {
					transferCoordinate: function transferCoordinate(data) {
						var scene = e;
						var defVal = [99999, 99999];

						var heightTerrain = scene.mapvFixedHeight;
						if (scene.mapvAutoHeight) {
							heightTerrain = scene.globe.getHeight(Cesium.Cartographic.fromDegrees(data[0], data[1]));
						}

						//坐标转换
						var position = Cesium.Cartesian3.fromDegrees(data[0], data[1], heightTerrain);
						if (!position) {
							return defVal;
						}
						var px = scene.cartesianToCanvasCoordinates(position);
						if (!px) {
							return defVal;
						}

						//判断是否在球的背面  
						if (scene.mapvDepthTest && scene.mode === Cesium.SceneMode.SCENE3D) {
							var occluder = new Cesium.EllipsoidalOccluder(scene.globe.ellipsoid, scene.camera.positionWC);
							var visible = occluder.isPointVisible(position);
							//visible为true说明点在球的正面，否则点在球的背面。 
							//需要注意的是不能用这种方法判断点的可见性，如果球放的比较大，点跑到屏幕外面，它返回的依然为true
							if (!visible) return false;
						}
						//判断是否在球的背面

						return [px.x, px.y];
					}
				};
				void 0 !== t && (a.filter = function (e) {
					var n = i.trails || 10;
					return !!(t && e.time > t - n && e.time < t);
				});
				var c = this.dataSet.get(a);
				this.processData(c), "m" == this.options.unit && this.options.size, this.options._size = this.options.size;
				var h = Cesium.SceneTransforms.wgs84ToWindowCoordinates(e, Cesium.Cartesian3.fromDegrees(0, 0));

				this.drawContext(n, new mapv.DataSet(c), this.options, h), this.options.updateCallback && this.options.updateCallback(t);
			}
		}
	}, {
		key: "updateData",
		value: function updateData(t, e) {
			var i = t;
			i && i.get && (i = i.get()), void 0 != i && this.dataSet.set(i), _get(MapVRenderer.prototype.__proto__ || Object.getPrototypeOf(MapVRenderer.prototype), "update", this).call(this, {
				options: e
			});
		}
	}, {
		key: "addData",
		value: function addData(t, e) {
			var i = t;
			t && t.get && (i = t.get()), this.dataSet.add(i), this.update({
				options: e
			});
		}
	}, {
		key: "getData",
		value: function getData() {
			return this.dataSet;
		}
	}, {
		key: "removeData",
		value: function removeData(t) {
			if (this.dataSet) {
				var e = this.dataSet.get({
					filter: function filter(e) {
						return null == t || "function" != typeof t || !t(e);
					}
				});
				this.dataSet.set(e), this.update({
					options: null
				});
			}
		}
	}, {
		key: "clearData",
		value: function clearData() {
			this.dataSet && this.dataSet.clear(), this.update({
				options: null
			});
		}
	}, {
		key: "draw",
		value: function draw() {
			this.canvasLayer.draw();
		}
	}, {
		key: "clear",
		value: function clear(t) {
			t && t.clearRect && t.clearRect(0, 0, t.canvas.width, t.canvas.height);
		}
		/**
      * @function MapVRenderer.prototype.destroy
      * @description 释放资源。
      */

	}, {
		key: "destroy",
		value: function destroy() {
			this.unbindEvent();
			this.clear(this.getContext());
			this.clearData();
			this.animator && this.animator.stop();
			this.animator = null;
			this.canvasLayer = null;
		}
	}]);

	return MapVRenderer;
}(BaseLayer);

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__6__;

/***/ })
/******/ ]);
});