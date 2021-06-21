/**
 * 台风 对象类【统一管理】 
 */
class Typhoon {
    // ========== 构造方法 ==========
    constructor(viewer, options) {
        this.viewer = viewer;
        this.options = options;

        this._show = Cesium.defaultValue(this.options.show, false);
        this.dataSource = new Cesium.CustomDataSource();
        this.positionScratch = new Cesium.Cartesian3()

        this.init();
    }

    // ========== 对外属性 ==========
    //显示和隐藏 
    get show() {
        return this._show;
    }
    set show(val) {
        this.setVisible(val);
    }

    // 当前点
    get position() {
        return this._lastPosition
    }

    // ========== 方法 ==========

    init() {
        var startTime;
        var stopTime;
        var property = new Cesium.SampledPositionProperty();

        var positions = [];

        //添加路径点
        var arr = this.options.points;
        for (var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];

            var position = Cesium.Cartesian3.fromDegrees(item.lng, item.lat);
            positions.push(position);

            var juliaDate = Cesium.JulianDate.fromDate(new Date(item.time));
            property.addSample(juliaDate, position);

            item._position = position;
            item._time = juliaDate;

            if (i == 0)
                startTime = juliaDate;
            else if (i == len - 1)
                stopTime = juliaDate;
        }
        this.startTime = startTime;
        this.stopTime = stopTime;


        this.positions = positions;
        this.property = property
    }

    getHtml(item) {
        return '<table style="width: 220px;"><tr>\
            <th scope="col" colspan="4"  style="text-align:center;font-size:15px;">'+ this.options.tfid + ' 台风动态信息</th></tr>\
            <tr><td >中文名</td><td >' + this.options.name + '</td></tr>\
            <tr><td >经度</td><td >' + item.lng + ' 度</td></tr>\
            <tr><td >纬度</td><td >' + item.lat + ' 度</td></tr>\
            <tr><td >中心气压</td><td >' + item.pressure + ' 百帕</td></tr>\
            <tr><td >7级风圈半径</td><td >' + item.radius7 + ' 千米</td></tr>\
            <tr><td >10级风圈半径</td><td >' + item.radius10 + ' 千米</td></tr>\
            <tr><td >最大风速</td><td >' + item.speed + ' 米/秒</td></tr>\
            <tr><td >移动方向</td><td >' + item.movedirection + '</td></tr>\
            <tr><td >移动速度</td><td >' + item.movespeed + ' 米/秒</td></tr>\
            <tr><td >当前时间</td><td >' + item.time + '</td></tr>\
        </table>';
    }
    create() {
        var that = this;

        //台风中心点 DIV方式gif图片
        this.divpoint = new mars3d.DivPoint(viewer, {
            html: '<img src="img/marker/tf.gif" style="width:80px;height:80px;pointer-events:none;" ></img>',
            position: this.property,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
        });

        //添加台风路线
        this.entity = this.dataSource.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start: this.startTime,
                stop: this.stopTime
            })]),
            position: this.property,
            orientation: new Cesium.VelocityOrientationProperty(this.property),
            // billboard: {//图片，后期可以换位model小模型
            //     scale: 0.2,
            //     image: 'img/marker/tf.gif',
            //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            //     scaleByDistance: new Cesium.NearFarScalar(10000, 1, 1000000, 0.6),
            //     disableDepthTestDistance: Number.POSITIVE_INFINITY,
            // },
            label: {//文字
                text: this.options.name,
                font: 'normal small-caps normal 17px 楷体',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -40),   //偏移量  
                // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000000)
            },
            // ellipsoid: {//下一步影像区域(圆锥区域) 
            //     radii: new Cesium.Cartesian3(150000.0, 150000.0, 150000.0),
            //     innerRadii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
            //     minimumClock: Cesium.Math.toRadians(-15.0),
            //     maximumClock: Cesium.Math.toRadians(15.0),
            //     minimumCone: Cesium.Math.toRadians(90.0),
            //     maximumCone: Cesium.Math.toRadians(90.0),
            //     material: Cesium.Color.YELLOW.withAlpha(0.3),
            //     height: 1000,
            //     outline: false,
            // },
            path: { 
                leadTime: 0,
                material: Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.9),
                width: 2,
            },
            popup: function (entity) {
                if (that._lastItem)
                    return that.getHtml(that._lastItem)
                else
                    return null
            }
        });

        //添加途径的圆点
        for (var i = 0, len = this.options.points.length; i < len; i++) {
            var item = this.options.points[i];

            this.dataSource.entities.add({
                position: item._position,
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start: item._time,
                    stop: this.stopTime
                })]),
                point: {
                    // show: new Cesium.CallbackProperty(function (time) {
                    //     return Cesium.JulianDate.compare(entity.data._time, that.viewer.clock.currentTime) <= 0;
                    // }, false),
                    color: Cesium.Color.fromCssColorString("#ffff00"),
                    pixelSize: 10,
                    outlineColor: Cesium.Color.fromCssColorString("#ffffff"),
                    outlineWidth: 2,
                    // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.4),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
                tooltip: this.getHtml(item),
                data: item,
                click: function (entity) {
                    that.viewer.clock.currentTime = entity.data._time;
                }
            });
        }


        //7级风圈 
        this._circle7radius = 0
        this._circle7show = false
        this.dataSource.entities.add({
            name: '7级风圈',
            show: new Cesium.CallbackProperty(function (time) {
                return that._circle7show;
            }, false),
            position: new Cesium.CallbackProperty(function (time) {
                return that._lastPosition;
            }, false),
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(function (time) {
                    return that._circle7radius;
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(function (time) {
                    return that._circle7radius;
                }, false),
                material: Cesium.Color.RED.withAlpha(0.4),
                height: 600,
                zIndex: 20
            },
            popup: function (entity) {
                if (that._lastItem)
                    return that.getHtml(that._lastItem)
                else
                    return null
            }
        });


        //10级风圈(圆)
        this._circle10radius = 0;
        this._circle10show = false;
        this.dataSource.entities.add({
            name: '10级风圈',
            show: new Cesium.CallbackProperty(function (time) {
                return that._circle10show;
            }, false),
            position: new Cesium.CallbackProperty(function (time) {
                return that._lastPosition;
            }, false),
            ellipse: {
                semiMinorAxis: new Cesium.CallbackProperty(function (time) {
                    return that._circle10radius;
                }, false),
                semiMajorAxis: new Cesium.CallbackProperty(function (time) {
                    return that._circle10radius;
                }, false),
                material: Cesium.Color.YELLOW.withAlpha(0.2),
                height: 500,
                zIndex: 10
            },
            popup: function (entity) {
                if (that._lastItem)
                    return that.getHtml(that._lastItem)
                else
                    return null
            }
        });


        //下一步影像区域半径(虚线展示) 
        this._target_position = null;
        this.dataSource.entities.add({
            name: '虚线',
            polyline: {
                positions: new Cesium.CallbackProperty(function (time) {
                    if (!that._target_position) return [];
                    return [that._lastPosition, that._target_position];
                }, false),
                width: 3,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW
                })
            }
        });

        //下一步影像区域(圆锥+扇形区域)  
        this.circlularHierarchy = null;
        this.dataSource.entities.add({
            polygon: {
                hierarchy: new Cesium.CallbackProperty(function (time) {
                    return that.circlularHierarchy;
                }, false),
                height: 900,
                material: Cesium.Color.YELLOW.withAlpha(0.3)
            }
        });

    }


    //修改显示、隐藏状态
    setVisible(val) {
        if (this._show === val) return;
        this._show = val;

        if (this._show) {
            this.flyTo();

            //设置时间
            this.viewer.clock.startTime = this.startTime.clone();
            this.viewer.clock.stopTime = this.stopTime.clone();
            this.viewer.clock.currentTime = this.startTime.clone();
            this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;

            if (this.viewer.timeline)
                this.viewer.timeline.zoomTo(this.startTime, this.stopTime);

            //添加图层
            if (!this.viewer.dataSources.contains(this.dataSource))
                this.viewer.dataSources.add(this.dataSource);
            if (this.divpoint) {
                this.divpoint.visible = true;
            }

            if (!this.entity)
                this.create();

            this.viewer.scene.preRender.addEventListener(this.preRender_eventHandler, this);
        }
        else {
            if (this.viewer.dataSources.contains(this.dataSource))
                this.viewer.dataSources.remove(this.dataSource);
            if (this.divpoint) {
                this.divpoint.visible = false;
            }
            this.viewer.scene.preRender.removeEventListener(this.preRender_eventHandler, this);
        }
    }

    //实时运行事件
    preRender_eventHandler(e) {
        var time = this.viewer.clock.currentTime;
        //当前点
        var position = Cesium.Property.getValueOrUndefined(this.property, time, this.positionScratch);
        if (position) {
            this._lastPosition = position;

            //获取已完成的点
            var arr = this.options.points;
            var idx = arr.length - 1;
            for (var i = 0, length = arr.length; i < length; i++) {
                if (Cesium.JulianDate.compare(arr[i]._time, time) > 0) {
                    idx = i - 1;
                    break;
                }
            }

            if (this.lastIndex == idx) return
            this.lastIndex = idx;

            var item = this.options.points[idx];
            this._lastItem = item

            //计算实时数据 
            this._circle7radius = Number(item.radius7 || 0) * 1000;
            this._circle7show = this._circle7radius > 0

            this._circle10radius = Number(item.radius10 || 0) * 1000;
            this._circle10show = this._circle10radius > 0

            //下一步影像区域半径(虚线展示)
            this._target_position = mars3d.matrix.getOnLinePointByLen(item._position, position, 150000, true);
            if (!this._target_position || isNaN(this._target_position.x)) this._target_position = null;

            //下一步影像区域(圆锥+扇形区域)   
            if (this._target_position) {
                var target_point = turf.point(mars3d.pointconvert.cartesian2lonlat(this._target_position));//求参考点  
                var bearing = mars3d.measure.getAngle(item._position, position);//求方位角  
                var arc = turf.lineArc(target_point, 50, bearing - 90, bearing + 90);//求半弧 

                var arcPositons = mars3d.pointconvert.lonlats2cartesians(arc.geometry.coordinates);
                arcPositons.push(item._position)
                this.circlularHierarchy = new Cesium.PolygonHierarchy(arcPositons);
            }
        }
    }

    flyTo() {
        if (!this.positions) return;

        if (this.positions.length > 2) {
            var viewRect = Cesium.Rectangle.fromCartesianArray(this.positions);
            var lonDiff = viewRect.east - viewRect.west;
            var latDiff = viewRect.north - viewRect.south;
            viewRect.east += lonDiff;
            viewRect.west -= latDiff;
            viewRect.north += lonDiff;
            viewRect.south -= latDiff;
            this.viewer.camera.flyTo({ destination: viewRect });
        }
        else {
            this.viewer.camera.flyTo({
                destination: mars3d.point.setPositionsHeight(this.positions[0], 1000),
                orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 }
            });
        }
    }

    //释放
    destroy() {
        this.show = false

        if (this.entity) {
            delete this.entity
        }
        if (this.dataSource) {
            this.dataSource.entities.removeAll()
            if (this.viewer.dataSources.contains(this.dataSource))
                this.viewer.dataSources.remove(this.dataSource, true);
        }
        if (this.divpoint) {
            this.divpoint.destroy();
        }


    }


}


