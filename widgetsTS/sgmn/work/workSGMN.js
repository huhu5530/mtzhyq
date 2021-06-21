//第1步骤：事故模拟

class WorkSGMN {
    //========== 构造方法 ========== 
    //创建一个模型编辑对象
    constructor(viewer, options) {
        this.viewer = viewer;
        this.gaoDePoi = new GaodePOI();
        this.ellipseArr = []; //保存事故范围的椭圆
        this.interval = -1;
        this.iNow = 0; //开始时间
        this.iALLTime = 60; //总时长时间
        this.iALL = 6; //模拟总次数
        this.isStartPlay = false; //用于标记是否开始模拟
        this.windArg = null;
        this.affectedPointArr = []; //受影响点的坐标信息
        this.affectedYWArr = []; //受影响的业务点 模拟===
        this.timelineCallback = null; //用于同步进度轴
        this.bootstrapTableCallback = null // 用于同步查询结果
        this.pageNum = 1; //当前页码
        this.newPoint = null; //当前查询的中心点
        this._radiusX = null; //当前查询的范围
        this.lastEllipseData = null; //模拟范围的最后一个椭圆
        this.isLoadMore = false;

        this.drawControl_SG = new mars3d.Draw({
            viewer: viewer,
            hasEdit: false
        });
        this.queryData = []; //当前查询的结果
        this.oneQueryEnd = false; //标识一次查询结束
        this._setArgAgain = false;
    }



    //========== 对外属性 ==========  
    //模拟点
    get point() {
        return this.incidentLnglat;
    }

    //获取最后一个椭圆的相关信息
    get extentData() {
        return this.lastEllipseData;
    }
    //获取所有受影响的企业点
    get pois() {
        return this.affectedPointArr;
    }
    //获取受影响的业务点
    get YWpois() {
        return this.affectedYWArr;
    }
    //获取所有受影响的点
    get allPois() {
        return this.affectedPointArr.concat(this.affectedYWArr);
    }
    //获取影响的范围
    get radiusX() {
        return this._radiusX;
    }
    //获取事故影响点
    get sgDatas() {
        return this.queryData;
    }
    //事故模拟是否结束
    get state() {

        return ((this.iNow > this.iALL) && (this.oneQueryEnd));
    }

    // set _setArgAgain(bool){
    //     this.argAgain = bool;
    // }
    // get argAgain(){
    //     return this.argAgain;
    // }

    //========== 方法 ========== 
    //开始激活（需求的参数通过opts传入）
    start(arg, opt) {
        if (this.windArg && arg) {
            if (this.windArg.windSpeed != arg.windSpeed || this.windArg.windDirection != arg.windDirection || this.windArg.playSpeed != arg.playSpeed) {
                this.clearRes();
                this._setArgAgain = true;
            }
        }

        if (this.isStartPlay && !this._setArgAgain && this.iNow == 0) { //不用分析
            opt.noComputeCallback();
            return;
        }
        if (!this.windArg) this.windArg = arg;
        if (!this.timelineCallback) this.timelineCallback = opt.timelineCallback;
        if (!this.bootstrapTableCallback) this.bootstrapTableCallback = opt.bootstrapTableCallback;
        var _fs = this.windArg.windSpeed; //风速 m/s
        var _fx = Number(this.windArg.windDirection); //风向
        var _sd = Number(this.windArg.playSpeed) //速度
        var speed = 15 / _sd;
        var that = this;
        this.interval = setInterval(function () {
            that.isStartPlay = true;
            that.iNow++;
            if (that.iNow > that.iALL || that.iNow < 0) {
                that.stopPlay();
                return;
            }
            var time = (that.iNow / that.iALL) * that.iALLTime;
            that._addMnCicles(time, _fs, _fx);
            if (that.timelineCallback) that.timelineCallback(that.iNow);
        }, speed * 1000);
    }

    //开始 图上选择事故点 
    selectSgd(callback) {
        var that = this;
        this.drawControl_SG.startDraw({
            type: "billboard",
            style: {
                image: "img/marker/mark1.png"
            },
            success: function (entity) {
                var cartesian = entity.position.getValue();
                if (!cartesian) return;
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var jd = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
                var wd = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
                var height = Number(cartographic.height.toFixed(1));
                var data = {
                    x: jd,
                    y: wd,
                    z: height
                }
                that.incidentLnglat = [data.x, data.y, height];
                if (that.incidentMarker == null) {
                    that.incidentMarker = entity;
                } else {
                    that.clearRes(); //重新选点后 清除之前的结果
                    that.drawControl_SG.deleteEntity(entity);
                    that.incidentMarker.position.setValue(cartesian);
                    if (that.isStartPlay) {
                        that.argAgain = true;
                    }
                }

                //to曹志良：此处内部要处理，选择新的点后，清除所有之前的查询分析结果，方便判断是否要重新分析

                callback(data);
            }
        });
    }
    //移除事故点
    removeSgd() {
        if (this.incidentMarker) {
            this.drawControl_SG.deleteEntity(this.incidentMarker);
            this.incidentMarker = null;
        }
    }

    //事故模拟结束
    stopPlay() {
        if (!this.isStartPlay) return;
        //$("#btn_sgmn_start").html('开始模拟');
        clearInterval(this.interval);
        // this.isStartPlay = false;
    }
    //暂停模拟
    pausePlay() { //事故模拟暂停
        if (!this.isStartPlay) return;
        clearInterval(this.interval);
        //this.isStartPlay = false;
    }
    //添加事故模拟范围
    _addMnCicles(_time, _fs, _fx) { //_time时间（分钟）,_fs 风速（m/s），_fx风向
        //此处加入公式，计算出半径
        var distance = (_time * 60 * _fs) / 1000; //公里 
        var bearing = _fx;
        if (!this.incidentLnglat || this.incidentLnglat.length == 0) return;
        var point = turf.point([this.incidentLnglat[0], this.incidentLnglat[1]]);
        var newpoint = turf.destination(point, distance, bearing, {
            units: 'kilometers'
        });
        this.newPoint = {
            x: newpoint.geometry.coordinates[0],
            y: newpoint.geometry.coordinates[1],
            z: this.incidentLnglat[2]
        };

        var radiusX = this._radiusX = distance;
        var radiusY = distance * 0.6;
        var angle = 90 - _fx;
        //椭圆 
        var entity = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(this.newPoint.x, this.newPoint.y, this.newPoint.z),
            ellipse: {
                show: true,
                semiMajorAxis: radiusX * 1000,
                semiMinorAxis: radiusY * 1000,
                rotation: Cesium.Math.toRadians(angle),
                classificationType: Cesium.ClassificationType.BOTH,
                fill: true,
                material: Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.4),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.7),
                outlineWidth: 2,
            }
        });
        this.ellipseArr.push(entity);
        this.viewer.flyTo(entity, {
            duration: 2
        });
        this.pausePlay(); //暂停 此时暂停 用于计算范围内的点
        //计算椭圆焦点
        var temp = (radiusX - radiusY) / 2;
        var pt1 = turf.destination(point, temp, bearing, {
            units: 'kilometers'
        });
        var pt2 = turf.destination(point, (radiusX + radiusY + temp), bearing, {
            units: 'kilometers'
        });
        var item = {
            center: this.newPoint, //中心点
            radiusX: radiusX * 1000, //长半轴（米）
            radiusY: radiusY * 1000, //短半轴（米）
            pt1: {
                x: pt1.geometry.coordinates[0],
                y: pt1.geometry.coordinates[1]
            }, //焦点1
            pt2: {
                x: pt2.geometry.coordinates[0],
                y: pt2.geometry.coordinates[1]
            }, //焦点2
        }
        this.pageNum = 1;
        this.radius = radiusX * 1000;
        this.oneQueryEnd = false;
        this.queryPOI({
            x: this.newPoint.x,
            y: this.newPoint.y,
            radius: this.radius,
            page: this.pageNum
        });
        //记录最后一个椭圆 用于查询结束后筛选
        this.lastEllipseData = item;
        this.queryYwData(item);
    }
    //查询
    queryPOI(opts) {
        var that = this;
        var arg = {};
        arg.x = opts.x;
        arg.y = opts.y;
        arg.radius = opts.radius;
        arg.count = 10; //count 每页数量
        arg.text = "企业";
        arg.page = opts.pageNum;
        arg.success = function (res) {
            that.oneQueryEnd = true;
            var data = res.list;
            that.queryData = [];
            that.queryData.concat(data);
            that.addEntity(data);
            if (that.bootstrapTableCallback) that.bootstrapTableCallback(data);
            that.start();
        }
        arg.error = function (msg) {
            window.toastr.error(msg);
        }
        this.gaoDePoi.queryCircle(arg);
    }
    //加载更多
    loadMore(callback) {
        this.isLoadMore = true;
        this.pageNum++;
        if (!this.newPoint || !this.pageNum) return;
        var that = this;
        var arg = {};
        arg.x = this.newPoint.x;
        arg.y = this.newPoint.y;
        arg.radius = this.radius;
        arg.count = 10;
        arg.text = "企业";
        arg.page = this.pageNum;
        arg.success = function (res) {
            var data = res.list;
            that.queryData.concat(data);
            that.addEntity(data);
            if (callback) callback(data);
        }
        arg.error = function (msg) {
            window.toastr.error(msg);
        }
        this.gaoDePoi.queryCircle(arg);
    }
    //添加事故范围内受影响的点
    addEntity(data) {
        if (!this.isLoadMore) {
            this.clearPointArr(); //椭圆变化时 清除上一次的结果 , 点击加载更多则不清除
            this.affectedPointArr = []; //清空之前的数据
        }
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            //==================构建图上目标单击后显示div=================   
            var inHtml = '<div class="mars-popup-titile">' + item.name + '</div><div class="mars-popup-content" >';
            var type = $.trim(item.type);
            if (type != '') inHtml += '<div><label>类别</label>' + type + '</div>';
            var xzqh = $.trim(item.xzqh);
            if (xzqh != '') inHtml += '<div><label>区域</label>' + xzqh + '</div>';
            var tel = $.trim(item.tel);
            if (tel != '') inHtml += '<div><label>电话</label>' + tel + '</div>';
            var address = $.trim(item.address);
            if (address != '') inHtml += '<div><label>地址</label>' + address + '</div>';
            inHtml += '</div>';
            var entity = this.viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(item.x, item.y),
                point: {
                    color: Cesium.Color.fromCssColorString("#3388ff"),
                    pixelSize: 10,
                    outlineColor: Cesium.Color.fromCssColorString("#ffffff"),
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                    scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1)
                },
                label: {
                    text: item.name,
                    font: '20px 楷体',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    fillColor: Cesium.Color.AZURE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -10), //偏移量  
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //是地形上方的高度 
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
                },
                popup: {
                    html: inHtml,
                    anchor: [0, -12],
                }
            });
            this.affectedPointArr.push({
                data: item,
                lnglat: [item.x, item.y],
                entity: entity
            });
            item._entity = entity;
        }
    }
    clearPointArr() {
        if (!this.affectedPointArr || this.affectedPointArr.length == 0) return;
        for (var i = 0; i < this.affectedPointArr.length; i++) {
            var item = this.affectedPointArr[i];
            if (item.entity) this.viewer.entities.remove(item.entity);
        }
        this.affectedPointArr = [];
    }


    //添加模拟企业点
    queryYwData(params) {
        var arrdata = [];
        for (var j = 0; j < 100; j++) {
            var jd = params.center.x + 0.1 * Math.random() * (Math.random() > 0.5 ? 1 : -1);
            var wd = params.center.y + 0.1 * Math.random() * (Math.random() > 0.5 ? 1 : -1);

            var attr = {
                id: j,
                name: '企业' + j,
                x: jd,
                y: wd
            };
            arrdata.push(attr);
        }
        this.showYwResult(params, arrdata);
    }
    showYwResult(params, arrdata) {
        this.clearPointYWArr();
        var that = this;
        var pt1 = Cesium.Cartesian3.fromDegrees(params.pt1.x, params.pt1.y);
        var pt2 = Cesium.Cartesian3.fromDegrees(params.pt2.x, params.pt2.y);
        var len = params.radiusX * 2;
        $.each(arrdata, function (index, item) {
            var position = Cesium.Cartesian3.fromDegrees(item.x, item.y);
            var len1 = Cesium.Cartesian3.distance(position, pt1);
            var len2 = Cesium.Cartesian3.distance(position, pt2);
            if (len1 + len2 > len) { //不在椭圆内
                return;
            }
            var entity = that.viewer.entities.add({
                position: position,
                point: {
                    color: Cesium.Color.YELLOW,
                    pixelSize: 6,
                    outlineColor: Cesium.Color.fromCssColorString("#ffffff"),
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                },
                label: {
                    text: item.name,
                    font: '12px Helvetica',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    fillColor: Cesium.Color.AZURE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -10), //偏移量  
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                },
                popup: item.name,
                data: item
            });
            entity.data = item;
            that.affectedYWArr.push({
                data: item,
                lnglat: [item.x, item.y],
                entity: entity
            });
        });
    }
    clearPointYWArr() {
        if (!this.affectedYWArr || this.affectedYWArr.length == 0) return;
        for (var i = 0; i < this.affectedYWArr.length; i++) {
            var item = this.affectedYWArr[i];
            if (item.entity) this.viewer.entities.remove(item.entity);
        }
        this.affectedYWArr = [];
    }
    //返回上一步时 清除对应的地图上结果
    clearRes() {
        this.clearPointArr();
        this.clearPointYWArr();
        for (var i = 0; i < this.ellipseArr.length; i++) {
            this.viewer.entities.remove(this.ellipseArr[i]);
        }
        this.ellipseArr = [];
        clearInterval(this.interval);
        this.interval = -1;
        this.iNow = 0;
        this.iALLTime = 60;
        this.iALL = 6;
        this.isStartPlay = false;
        this.windArg = null;
        this.affectedPointArr = [];
        this.timelineCallback = null;
        this.bootstrapTableCallback = null;
        this.pageNum = 1;
        this.newPoint = null;
        this._radiusX = null;
        this.lastEllipseData = null;
        this.isLoadMore = false;
        this.queryData = [];
        this.stopDraw();
        this.queryData = []; //当前查询的结果
        this.oneQueryEnd = false; //标识一次查询结束
        this._setArgAgain = false;
    }
    //移除绑定
    stopDraw() {
        if (this.drawControl_SG) this.drawControl_SG.stopDraw();
    }
    //清除所有效果
    clearAll() {
        this.argAgain = false;
        this.clearRes();
        this.removeSgd();
        this.incidentLnglat = [];
        if (this.drawControl_SG) {
            this.drawControl_SG.deleteAll();
        }
    }
}