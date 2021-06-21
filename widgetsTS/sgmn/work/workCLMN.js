//第2步骤：撤离模拟 
class WorkCLMN {
    //========== 构造方法 ========== 
    //创建一个模型编辑对象
    constructor(viewer, options) {
        this.viewer = viewer;
        this.gaodeRoute = new GaodeRoute();
        this.allRouteData = [];
        this.flylineArr = []; //保存漫游对象
        this.lineArr = [];
        this.drawControl_CL = new mars3d.Draw({
            viewer: viewer,
            hasEdit: false
        });
        this.lnglatArr_CL = [];
        this.indexCL = 1;
        this.isFXend = false; //路线是否分析完毕
        this.isStart = false; //是否 已分析
        this.updateCL = false; //分析之后 是否重新修改撤离点
    }
    //========== 对外属性 ==========  
    //撤离点数组
    get points() {
        return this.lnglatArr_CL;
    }
    get flylines() {
        return this.flylineArr;
    }
    get state() {
        return this.isFXend;
    }
    //========== 方法 ==========  
    startSelectCld(opts) {
        var that = this;
        this.drawControl_CL.startDraw({
            type: "billboard",
            style: {
                image: "img/marker/mark4.png"
            },
            success: function (entity) {
                //to曹志良：此处内部要处理，选择新的点后，清除所有之前的查询分析结果，方便判断是否要重新分析
                if (that.isStart) { //分析过之后 二次修改
                    that.clearRes();
                    that.updateCL = true
                }
                var cartesian = entity.position.getValue();
                var html = '撤离点' + that.indexCL;
                entity.tooltip = {
                    html: html, //可以是任意html
                    anchor: [0, -10] //定义偏移像素值 [x, y]
                };
                entity.name = html;
                if (!cartesian) return;
                var isIn = false;
                if (opts.lastEllipseData) {
                    isIn = that.isInEllipse(cartesian, opts.lastEllipseData.pt1, opts.lastEllipseData.pt2, opts.lastEllipseData.radiusX);
                }
                if (isIn) {
                    haoutil.msg("不可选择事故影响范围内！");
                    that.drawControl_CL.deleteEntity(entity);
                    return;
                }
                if (!isIn) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    var jd = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
                    var wd = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
                    var height = Number(cartographic.height.toFixed(1));
                    var data = {
                        x: jd,
                        y: wd,
                        z: height
                    }
                    if (that.lnglatArr_CL)
                        that.lnglatArr_CL.push({
                            data: "", //绑定相关信息
                            lnglat: [data.x, data.y],
                            entity: entity
                        });


                    if (opts.callback) {
                        opts.callback({
                            data: data,
                            markerId: entity.id,
                            name: html
                        });
                    }
                }
                that.indexCL++;
            }
        });
    }
    //判断点是否在椭圆内 point 要判断的点 jd1 椭圆焦点1 jd2 椭圆焦点2
    isInEllipse(position, jd1, jd2, a) {
        var pt1 = Cesium.Cartesian3.fromDegrees(jd1.x, jd1.y);
        var pt2 = Cesium.Cartesian3.fromDegrees(jd2.x, jd2.y);
        var len1 = Cesium.Cartesian3.distance(position, pt1);
        var len2 = Cesium.Cartesian3.distance(position, pt2);
        var isIn = true;
        if (len1 + len2 > 2 * a) { //不在椭圆内
            isIn = false;
        }
        return isIn;
    }
    //开始激活（需求的参数通过opts传入）
    start(opts) {
        if (!opts) return;
        if (!this.updateCL && this.isStart) { //未修改撤离点 下一步 不用分析
            opts.noComputeCallback();
            return;
        }
        var lnglatArr_CL = this.lnglatArr_CL;
        var index = -1;
        var affectedPointArr = opts.affectedPointArr;
        var that = this;
        this.isStart = true;
        this.allRouteData = [];

        function compute() {
            console.log("计算完成撤离路线" + index);
            index++;
            if (index < affectedPointArr.length) {
                var arr = [];
                for (var step = 0; step < lnglatArr_CL.length; step++) {
                    arr.push([affectedPointArr[index].lnglat, lnglatArr_CL[step].lnglat]);
                }
                that.isFXend = false;
                that.queryOnePointLine({
                    affectedPointData: affectedPointArr[index].data, //绑定起点信息
                    arr: arr,
                }, function () {
                    compute();
                });
            } else {
                that.isFXend = true;

                if (opts.callback) opts.callback(that.allRouteData); //计算完路径信息后 供前端展示信息
                that.updateCL = false;
            }

        }
        compute();
    }
    //清除结果
    clearRes() {
        this.allRouteData = [];
        for (var i = 0; i < this.flylineArr.length; i++) {
            if (this.flylineArr[i]) this.flylineArr[i].destroy();
        }
        this.flylineArr = [];
        for (var k = 0; k < this.lineArr.length; k++) {
            if (this.lineArr[k]) this.viewer.entities.remove(this.lineArr[k]);
        }
        this.lineArr = [];
        //this.lnglatArr_CL = [];
        this.updateCL = false;
        this.resetAllLineStyle();
        this.stopDraw();
    }
    stopDraw() {
        if (this.drawControl_CL) this.drawControl_CL.stopDraw();
    }
    //计算路线
    queryOnePointLine(opt, callback) {
        var that = this;
        this.gaodeRoute.queryArr({
            type: 3,
            points: opt.arr,
            success: function (data) {

                var item = that.gaodeRoute.computeMindistanceLine(data);
                var line;
                var endPointData;
                if (item.index != -1) endPointData = that.lnglatArr_CL[item.index].entity; //线的终点信息
                if (item.lineData) line = that.createLine(item.lineData, {
                    startPointData: opt.affectedPointData, //线的起点信息
                    endPointData: endPointData
                }); //线的信息
                if (line) that.roamOnground(line, callback);
            },
            error: function (msg) {
                window.toastr.error(msg);
            }
        });
    }
    //构建路径线
    createLine(item, opt) {
        if (!item) return;
        var lnglats = item.points;
        if (!lnglats || lnglats.length < 1) return;
        var name = item.name || "--";
        var positions = mars3d.pointconvert.lonlats2cartesians(lnglats);
        var time = haoutil.str.formatTime(item.allDuration || 0);
        var distance = haoutil.str.formatLength(item.allDistance || 0);
        var html = '目的地：' + name + '<br/>总距离：' + distance + '<br/>所需时间：' + time + '';
        var entity = this.viewer.entities.add({
            polyline: {
                positions: positions,
                clampToGround: true,
                material: Cesium.Color.fromRandom({
                    alpha: 0.7
                }),
                width: 4
            },
            //popup: html
        });
        entity.lineData = item;
        if (opt) {
            entity.startPointData = opt.startPointData;
            entity.endPointData = opt.endPointData;
        }
        this.allRouteData.push(entity);
        this.lineArr.push(entity);
        return entity;
    }
    //控制线的显示隐藏
    showHideLineById(id, isShow) {
        if (!id) return;
        var flyline = this.getFlylineById(id);
        if (!flyline) return;
        flyline.line.isStart = isShow; //禁止其运动、
        flyline.line.show = isShow; //隐藏车辆
        var line = this.getLineById(id);
        if (line) line.show = isShow;
    }
    getLineById(id) {
        if (!id) return;
        var line;
        for (var i = 0; i < this.lineArr.length; i++) {
            if (this.lineArr[i].id == id) {
                line = this.lineArr[i];
                break;
            }
        }
        return line;
    }
    //高亮一条线
    hightOneLineById(id) {
        if (!id) return;
        this.resetAllLineStyle();
        var line = this.getLineById(id);
        if (!line) return;
        var rgba = line.polyline.material.color.getValue();
        //line.polyline.material = new Cesium.Color(rgba.red, rgba.green, rgba.blue, 1);
        line.polyline.width = 12;
        line.polyline.material = new mars3d.material.LineFlowMaterialProperty({//动画线材质
            color: Cesium.Color.fromCssColorString("#00ff00"),
            duration: 10000, //时长，控制速度
            url: '../../img/textures/LinkPulse.png'
        })
    }
    //还原所有线的样式
    resetAllLineStyle() {
        for (var i = 0; i < this.lineArr.length; i++) {
            var line = this.lineArr[i];
            if (line) {
                var rgba = line.polyline.material.color.getValue();
                line.polyline.material = new Cesium.Color(rgba.red, rgba.green, rgba.blue, 0.7);
                line.polyline.width = 4;
            }

        }
    }
    showHideAllLine(isShow) {
        for (var i = 0; i < this.flylineArr.length; i++) {
            var flyLine = this.flylineArr[i];
            if (flyLine) {
                flyLine.line.isStart = isShow; //禁止其运动、
                flyLine.line.show = isShow; //隐藏车辆
            }

        }
        for (var i = 0; i < this.lineArr.length; i++) {
            if (this.lineArr[i]) this.lineArr[i].show = isShow;
        }
    }
    //获取漫游对象
    getFlylineById(id) {
        if (!id) return;
        var flyline;
        for (var i = 0; i < this.flylineArr.length; i++) {
            var flyLine = this.flylineArr[i];
            if (flyLine && flyLine.line.id == id) {
                flyline = flyLine;
                break;
            }
        }
        return flyline;
    }
    //漫游对应的车辆
    roamOneById(id) {
        if (!id) return;
        var flyline = this.getFlylineById(id);
        this.stopAllRoam();
        flyline.start();
    }

    //对应车辆开始漫游
    roamArrByIds(ids) {
        if (!ids || ids.length == 0) return;
        this.stopAllRoam();
        for (var i = 0; i < ids.length; i++) {
            var flyline = this.getFlylineById(ids[i]);
            if (flyline) flyline.start();
        }
    }
    //对应车辆停止漫游
    stopRoamArrByIds(ids) {
        if (!ids || ids.length == 0) return;
        this.stopAllRoam();
        for (var i = 0; i < ids.length; i++) {
            var flyline = this.getFlylineById(ids[i]);
            if (flyline) flyline.stop();
        }
    }
    //停止所有车辆的漫游
    stopAllRoam() {
        for (var i = 0; i < this.flylineArr.length; i++) {
            var flyLine = this.flylineArr[i];
            if (flyLine) flyLine.stop();
        }
    }
    //撤离漫游动画
    roamOnground(line, callback) {
        if (!line) return;
        var posi = line.polyline.positions.getValue();
        if (!posi) return;
        var that = this;
        var lnglats = mars3d.pointconvert.cartesians2lonlats(posi);
        var flydata = {
            id: Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0)),
            "name": line.startPointData.name || "--",
            "camera": {
                "type": "",
                "followedX": 50,
                "followedZ": 10
            },
            "points": lnglats,
            "speed": 120,
            "model": {
                "show": true,
                "uri": "http://data.marsgis.cn/gltf/mars/qiche.gltf",
                "scale": 0.3,
                "minimumPixelSize": 30,
                "clampToGround": true
            }
        };
        var flyLine = new mars3d.FlyLine(that.viewer, flydata);
        line.isStart = true;
        flyLine.line = line;
        // flyLine.clampToGround(function () {
        //     flyLine.popup = {
        //         anchor: [0, -20], //左右、上下的偏移像素值。
        //         timeRender: true, //实时更新html
        //         html: function () {
        //             var params = flyLine.timeinfo;
        //             if (!params) return "即将开始漫游";
        //             var html = '<div style="width:200px;">' +
        //                 '名称：' + (flyLine.name  || "--" )+ '<br/>' +
        //                 '总距离：' + haoutil.str.formatLength(flyLine.alllen) + '<br/>' +
        //                 '总时间：' + haoutil.str.formatTime(flyLine.alltimes / that.viewer.clock.multiplier) + '<br/>' +
        //                 '开始时间：' + Cesium.JulianDate.toDate(flyLine.startTime).format("yyyy-M-d HH:mm:ss") + '<br/>' +
        //                 '剩余时间：' + haoutil.str.formatTime((flyLine.alltimes - params.time) / that.viewer.clock.multiplier) + '<br/>' +
        //                 '剩余距离：' + haoutil.str.formatLength(flyLine.alllen - params.len) + ' <br/>' +
        //                 '</div>';
        //             return html;
        //         }
        //     }
        //     if (callback) callback();
        // });
        this.flylineArr.push(flyLine);

        if (callback) callback();
    }
    //播放动画
    playFlyline(arr) {
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < this.flylineArr.length; j++) {
                if (arr[i] == this.flylineArr[j].line.id) {
                    if (his.flylineArr[j]) his.flylineArr[j].start();
                }
            }
        }
    }
    //更改播放速度
    updatePlaySpeed(speed) {
        if (!speed) return;
        var scale = speed / 120;
        this.viewer.clock.multiplier = scale || 1;
    }


    //根据id删除对应的撤离点
    removePointById(id) {
        if (!id) return;
        for (var i = 0; i < this.lnglatArr_CL.length; i++) {
            if (id === this.lnglatArr_CL[i].entity.id) {
                this.drawControl_CL.deleteEntity(this.lnglatArr_CL[i].entity);
                this.lnglatArr_CL.splice(i, 1);
                break;
            }
        }

    }
    //根据撤离点id 删除对应的线 及 flyline对象
    removeLineAboutByPointId(id) {
        if (!id) return;
        if (this.lineArr.length > 0 || this.flylineArr.length > 0) {
            this.updateCL = true; //表示当前删除时 已经经过计算了
        }
        var newLineArr = [];
        for (var k = 0; k < this.lineArr.length; k++) {
            if (this.lineArr[k].endPointData.id == id) {
                this.viewer.entities.remove(this.lineArr[k]);
            } else {
                newLineArr.push(this.lineArr[k]);
            }
        }
        this.lineArr = newLineArr;
        var newFlylineArr = [];
        for (var i = 0; i < this.flylineArr.length; i++) {
            if (id == this.flylineArr[i].line.endPointData.id) {
                if (this.flylineArr[i]) this.flylineArr[i].destroy();
            } else {
                newFlylineArr.push(this.flylineArr[i]);
            }
        }
        this.flylineArr = newFlylineArr;


    }
    //获取漫游所需最长时间
    getMaxFlylineTime() {
        var maxTime = Number.MIN_VALUE;
        for (var j = 0; j < this.flylineArr.length; j++) {
            var times = this.flylineArr[j].alltimes;
            if (times >= maxTime) {
                maxTime = times;
            }
        }
        return maxTime;
    }
    //清除全部
    clearAll() {
        this.clearRes();
        this.allRouteData = [];
        if (this.drawControl_CL) this.drawControl_CL.deleteAll();
        this.lnglatArr_CL = [];
        this.indexCL = 1;
        this.isFXend = false; //路线是否分析完毕
        this.isStart = false; //是否 已分析
    }
}