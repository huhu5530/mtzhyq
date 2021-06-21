(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //外部资源配置
        get resources() {
            return [
                "./lib/cesiumjs/plugins/class/GaodeRoute.js",//高德路径查询
                "./lib/cesiumjs/plugins/class/GaodePOI.js" //高德poi查询
            ]
        }

        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 350
                }
            }
        }

        //初始化[仅执行1次]
        create() {

            //设置路线随机色
            this.randomColor = [
                Cesium.Color.fromCssColorString("#eaf731").withAlpha(0.8),
                Cesium.Color.fromCssColorString("#57f72e").withAlpha(0.8),
                Cesium.Color.fromCssColorString("#2effd2").withAlpha(0.8),
                Cesium.Color.fromCssColorString("#cc6e26").withAlpha(0.8),
                Cesium.Color.fromCssColorString("#ff2ec7").withAlpha(0.8),
            ]
            this.colorStep = 0
            this.routeArr = [] //保存路径

            this.alreadyCompute = false  //是否已计算过  
            this.flyLineArr = [] //保存路径
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //打开激活 
        activate() {
            this.gaodeRoute = new GaodeRoute();
            this.gaodePOI = new GaodePOI();
        }
        //关闭释放
        disable() {
            this.gaodeRoute = null;
            this.startLnglat = null;
            this.endLnglat = null;
            if (this.startPoint) {
                this.viewer.mars.draw.deleteEntity(this.startPoint);
                this.viewer.entities.remove(this.startPoint);
                this.startPoint = null;
            }
            if (this.endPoint) {
                this.viewer.mars.draw.deleteEntity(this.endPoint);
                this.viewer.entities.remove(this.endPoint);
                this.endPoint = null;
            }
            this.alreadyCompute = false;
            this.gaodePOI = null;
            this.gaodeRoute = null;
            this.startLnglat = null;
            this.startPoint = null;

            this.endLnglat = null;
            this.endPoint = null;
            this.clearCoumpute();
        }
        //===========gaodePOI 通过输入名称选点 ============
        queryPOI(text, type) {
            if (!text || !type) return;
            var arg = {};
            arg.success = function (res) {
                this.viewWindow.setHtmlInMCXD(res, type); //展示搜索结果
            }
            arg.error = function (msg) {
                window.toastr.error(msg);
                haoutil.loading.close();
            }
            arg.text = text;
            if (this.gaodePOI) this.gaodePOI.queryText(arg);
        }
        //=======================起点===============================
        //绘制起点 
        drawStartPoint(callback) {
            var that = this;
            that.viewer.mars.draw.startDraw({
                type: "billboard",
                style: {
                    image: this.path + "img/start.png"
                },
                success: function (entity) {
                    var currentTime = that.viewer.clock.currentTime;
                    var cartesian = entity.position.getValue(currentTime);
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    var jd = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
                    var wd = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
                    if (callback) callback(jd + "," + wd);
                    that.startLnglat = [jd, wd];
                    if (that.startPoint) {
                        that.viewer.mars.draw.deleteEntity(entity);
                        that.startPoint.position.setValue(cartesian);
                    } else {
                        that.startPoint = entity;
                    }
                    that.startCompute();
                }
            });
        }
        //输入起点坐标
        inputStartPoint(jd, wd) {
            if (!jd || !wd) return;
            if (this.startPoint) {
                this.viewer.mars.draw.deleteEntity(this.startPoint);
                this.viewer.entities.remove(this.startPoint);
            }
            this.startLnglat = [jd, wd];
            var cartesian = Cesium.Cartesian3.fromDegrees(jd, wd);
            var entity = this.viewer.entities.add({
                position: cartesian,
                billboard: {
                    image: this.path + "img/start.png",
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    scale: 1,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
            this.startPoint = entity;
            this.locateByJWD({
                jd: jd,
                wd: wd
            });
            this.startCompute();
        }
        //查询起点坐标
        queryStartPoint(text) {
            if (!text) {
                window.toastr.error("请输入查询条件！");
                return;
            }
            this.queryPOI(text, "start");
        }
        //=======================终点===============================
        //绘制终点 
        drawEndPoint(callback) {
            var that = this;
            that.viewer.mars.draw.startDraw({
                type: "billboard",
                style: {
                    image: this.path + "img/end.png"
                },
                success: function (entity) {
                    var currentTime = that.viewer.clock.currentTime;
                    var cartesian = entity.position.getValue(currentTime);
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    var jd = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
                    var wd = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
                    if (callback) callback(jd + "," + wd);
                    that.endLnglat = [jd, wd];
                    if (that.endPoint) {
                        that.viewer.mars.draw.deleteEntity(entity);
                        that.endPoint.position.setValue(cartesian);
                    } else {
                        that.endPoint = entity;
                    }
                    that.startCompute();
                }
            });
        }
        //输入终点坐标
        inputEndPoint(jd, wd) {
            if (!jd || !wd) return;
            if (this.endPoint) {
                this.viewer.mars.draw.deleteEntity(this.endPoint);
                this.viewer.entities.remove(this.endPoint);
            }
            this.endLnglat = [jd, wd];
            var cartesian = Cesium.Cartesian3.fromDegrees(jd, wd);
            var entity = this.viewer.entities.add({
                position: cartesian,
                billboard: {
                    image: this.path + "img/end.png",
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    scale: 1,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
            this.endPoint = entity;
            this.locateByJWD({
                jd: jd,
                wd: wd
            });
            this.startCompute();
        }
        //查询终点坐标
        queryEndPoint(text) {
            if (!text) {
                window.toastr.error("请输入查询条件！");
                return;
            }
            this.queryPOI(text, "end");
        }
        //===================开始计算路线========================
        //清除计算的结果
        clearCoumpute() {
            this.colorStep = 0;
            //清除路线
            for (var i = 0; i < this.routeArr.length; i++) {
                var line = this.routeArr[i];
                if (line) this.viewer.entities.remove(line);
            }
            this.routeArr = [];
            this.viewWindow.clearRouteContent(); //清除页面搜索结果

            //清除漫游的数组
            for (var index = 0; index < this.flyLineArr.length; index++) {
                var flyline = this.flyLineArr[index];
                if (flyline) flyline.destroy();
            }
            this.flyLineArr = [];

            //取消当前的视角跟随
            this.removeTrack();
            // if (this.nowFline) {
            //     this.nowFline.destroy();
            //     this.nowFline = null;
            // }

            $("#mapDH_speed").remove();
        }
        //开始计算
        startCompute() {
            if (!this.startLnglat || this.startLnglat.length == 0) return;
            if (!this.endLnglat || this.endLnglat.length == 0) return;
            if (this.alreadyCompute) { //清除上一次的计算结果
                this.clearCoumpute();
            }

            //当两点存在时 自动计算
            var that = this;
            this.gaodeRoute.query({
                type: 3,
                points: [this.startLnglat, this.endLnglat],
                extensions: "all",
                strategy: 11,
                success: function (data) {
                    that.alreadyCompute = true;
                    that.viewWindow.startCompute();
                    if (!data || data.paths.length < 1) return;
                    that.viewWindow.showRouteBox(true);
                    //添加速度控制面板
                    for (var i = 0; i < data.paths.length; i++) {
                        var line = that.addRouteLine(data.paths[i]);
                        if (!line) return;
                        that.routeArr.push(line);
                        //展示路径信息
                        that.viewWindow.showRouteInfo(line);
                        //计算漫游路线
                        that.computeFlyline(line);
                    }
                }
            });
        }
        //添加路径
        addRouteLine(path) {
            var steps = path.steps;
            var points = path.points;
            if (!steps || steps.length < 1 || !points || points.length < 1) return;
            if (this.colorStep > this.randomColor.length - 1) {
                this.colorStep = 0;
            }
            var material = this.randomColor[this.colorStep]

            var cartesians = mars3d.pointconvert.lonlats2cartesians(points);
            var line = this.viewer.entities.add({
                polyline: {
                    positions: cartesians,
                    clampToGround: true,
                    material: material,
                    width: 3
                }
            });
            line.attr = path;

            this.colorStep++;

            return line;
        }
        //============= 计算漫游路线 ======================
        computeFlyline(line) {
            if (!line || !line.attr) return;

            var lnglats = line.attr.points;

            var flydata = {
                "name": "贴地路线",
                "camera": { "type": "" },
                "points": lnglats,
                "speed": 200,
                "model": {
                    "uri": "http://data.marsgis.cn/gltf/mars/qiche.gltf",
                    "scale": 0.3,
                    "minimumPixelSize": 30,
                    "clampToGround": true,
                    "show": true,
                }
            };
            var flyLine = new mars3d.FlyLine(this.viewer, flydata);
            flyLine.lineId = line.id;
            this.flyLineArr.push(flyLine);

            // var that = this;
            // haoutil.loading.show("正在计算路径!");
            // flyLine.clampToGround(function () { //异步计算完成贴地后再启动
            //     haoutil.loading.hide();

            //     flyLine.popup = {
            //         id: Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0)),
            //         anchor: [0, -20], //左右、上下的偏移像素值。
            //         timeRender: true, //实时更新html
            //         html: function () {
            //             var params = flyLine.timeinfo;
            //             if (!params) return "即将开始漫游";
            //             var html = '<div style="width:200px;">' +
            //                 '总距离：' + haoutil.str.formatLength(flyLine.alllen) + '<br/>' +
            //                 '总时间：' + haoutil.str.formatTime(flyLine.alltimes / viewer.clock.multiplier) + '<br/>' +
            //                 '开始时间：' + Cesium.JulianDate.toDate(flyLine.startTime).format("yyyy-M-d HH:mm:ss") + '<br/>' +
            //                 '剩余时间：' + haoutil.str.formatTime((flyLine.alltimes - params.time) / viewer.clock.multiplier) + '<br/>' +
            //                 '剩余距离：' + haoutil.str.formatLength(flyLine.alllen - params.len) + ' <br/>' +
            //                 '</div>';
            //             return html;
            //         }
            //     }
            // });
        }
        getFlylineById(id) {
            if (!id) return;
            var flyline;
            for (var index = 0; index < this.flyLineArr.length; index++) {
                if (this.flyLineArr[index].lineId == id) {
                    flyline = this.flyLineArr[index];
                    break;
                }
            }
            return flyline;
        }
        roamOneById(id) {
            var flyline;
            for (var index = 0; index < this.flyLineArr.length; index++) {
                this.flyLineArr[index].stop();
                if (this.flyLineArr[index].lineId == id) {
                    flyline = this.flyLineArr[index];
                }
            }
            this.nowFline = flyline;

            this.viewer.mars.popup.close();
            this.viewer.mars.popup.show(flyline, flyline.property);

            var that = this;
            flyline.start(function () {
                that.reset();
                if (that.cameraView) that.viewer.mars.centerAt(that.cameraView);
            });
        }
        //漫游自动结束 或点击 停止导航按钮 后，重置界面和操作
        reset() {
            //漫游结束 重置按钮 取消跟随 
            this.resetBtn();
            this.removeTrack();
            if (this.nowFline) {
                this.nowFline.entity.show = false;
                this.nowFline = null;
            }
            //重置速度面板
            this.viewer.clock.multiplier = 1;

            //还原线的高亮
            this.highLightLine();
        }
        //重置按钮
        resetBtn() {
            this.viewWindow.resetButton();
            this.viewer.mars.popup.close();
        }
        //取消当前的视角跟随
        removeTrack() {
            if (this.nowFline) {
                this.nowFline.updateStyle({
                    camera: {
                        type: ""
                    }
                });
            }
            this.viewer.trackedEntity = undefined;
        }
        //==============开始导航===================
        startDH(id, isGS) {
            //导航前释放之前的所有导航操作
            this.reset();
            //检测视角跟随是否选中
            //开始导航
            if (!id) return;
            this.roamOneById(id);

            if (isGS) {
                this.nowFline.updateStyle({ camera: { type: "gs" } });
            }
        }
        //============开始视角跟随=============
        startGS(id, ele) {
            //判断当前点击的视角跟随的id 是否是已在导航时的id
            if (this.nowFline) { //表示已开始漫游即已点击开始导航
                if (this.nowFline.lineId == id) {
                    this.nowFline.updateStyle({ camera: { type: "gs" } });
                } else {
                    window.toastr.error("当前路径无车辆运行！");
                    if (ele) ele.prop("checked", false);
                    return;
                }
            }
        }
        //==================其它方法=====================
        highLightLine(id) {
            var currentTime = this.viewer.clock.currentTime;
            for (var i = 0; i < this.routeArr.length; i++) {
                var nowLineMaterial = this.routeArr[i].polyline.material;
                var rgba = nowLineMaterial.color.getValue(currentTime);
                this.routeArr[i].polyline.material = new Cesium.Color(rgba.red, rgba.green, rgba.blue, 0.3);
                this.routeArr[i].polyline.width = 3;
            }
            if (!id) return;
            var entity = this.viewer.entities.getById(id);
            var rgba3 = entity.polyline.material.color.valueOf();
            entity.polyline.material = new Cesium.Color(rgba3.red, rgba3.green, rgba3.blue, 1);
            entity.polyline.width = 5;
        }
        locateByJWD(obj) {
            if (!obj || !obj.jd || !obj.wd) return;
            var position = Cesium.Cartesian3.fromDegrees(obj.jd, obj.wd, obj.gd || 0);
            var heading = Cesium.Math.toRadians(obj.heading || 0);
            var pitch = Cesium.Math.toRadians(obj.pitch || -90);
            var roll = Cesium.Math.toRadians(obj.roll || 0);
            var hpr = new Cesium.HeadingPitchRange(heading, pitch, roll);
            var bs = new Cesium.BoundingSphere(position, obj.cameraHeight || 2000);
            this.viewer.camera.viewBoundingSphere(bs, hpr);
            this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        }
        getCameraView() {
            this.cameraView = mars3d.point.getCameraView(this.viewer, false);
        }
        setCameraView() {
            if (this.cameraView) this.viewer.mars.centerAt(this.cameraView);
        }
        resetSpeed(num) {
            if (num == undefined) return;
            this.viewer.clock.multiplier = num / 120;
        }

    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d)

