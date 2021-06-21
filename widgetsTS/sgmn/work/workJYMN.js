//第3步骤：救援模拟
class WorkJYMN {
    //========== 构造方法 ========== 
    //创建一个模型编辑对象
    constructor(viewer, options) {
        this.viewer = viewer;
        this.gaodeRoute = new GaodeRoute();
        this.allRouteData = [];
        this.flylineArr = [];
        this.lineArr = [];

        this.drawControl_JY = new mars3d.Draw({
            viewer: viewer,
            hasEdit: false
        });
        this.isStart = false;
        this.markerArr_JY = [];
        this.lnglatArr_JY = [];
        this.index_JY = 1;
        this.updateJY = false;
    }
    //========== 对外属性 ==========  
    //救援点数组
    get points() {
        return this.lnglatArr_JY;
    }
    get flylines() {
        return this.flylineArr;
    }
    //========== 方法 ========== 
    startSelectJyd(opts) {
        var that = this;
        this.drawControl_JY.startDraw({
            type: "billboard",
            style: {
                image: "img/marker/mark3.png"
            },
            success: function (entity) {
                var cartesian = entity.position.getValue();
                var html = "救援点" + that.index_JY;
                entity.name = html;
                entity.tooltip = {
                    html: html, //可以是任意html
                    anchor: [0, -10] //定义偏移像素值 [x, y]
                };
                that.markerArr_JY.push(entity);
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var jd = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
                var wd = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
                var height = Number(cartographic.height.toFixed(1));
                var data = {
                    x: jd,
                    y: wd,
                    z: height
                }
                if (that.lnglatArr_JY)
                    that.lnglatArr_JY.push({
                        data: "", //绑定相关信息
                        lnglat: [data.x, data.y],
                        entity: entity
                    });


                //to曹志良：此处内部要处理，选择新的点后，清除所有之前的查询分析结果，方便判断是否要重新分析
                if (that.isStart) { //分析过之后 二次修改
                    that.clearRes();
                    that.updateJY = true;
                }
                if (opts.callback) {
                    opts.callback({
                        data: data,
                        markerId: entity.id,
                        name: html
                    });
                }
                that.index_JY++;
            }
        });
    }

    //开始激活（需求的参数通过opts传入）
    start(opts) {
        if (!opts) return;

        if (!this.updateJY && this.isStart) { //未修改撤离点 下一步 不用分析 
            opts.noComputeCallback();
            return;
        }
        var incidentLnglat = opts.incidentLnglat;
        var lnglatArr_JY = this.lnglatArr_JY;
        this.isStart = true;
        var index = -1;
        var that = this;
        this.allRouteData = [];

        function compute() {
            index++;
            if (index < lnglatArr_JY.length) {
                that.gaodeRoute.query({
                    type: 3,
                    points: [lnglatArr_JY[index].lnglat, incidentLnglat],
                    success: function (data) {
                        var line = that.createLine(data.paths[0], {
                            startPointData: lnglatArr_JY[index].entity
                        });

                        if (line) that.roamOnground(line, function () {
                            compute();
                        });
                    },
                    error: function (msg) {
                        window.toastr.error(msg);
                        compute();
                    }
                });
            } else {
                if (opts.callback) opts.callback(that.allRouteData); //计算完路径信息后 供前端展示信息
                that.updateJY = false;
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
        this.updateJY = false;
        this.stopDraw();
        //this.lnglatArr_JY = [];
    }
    //构建路径线
    createLine(item, opt) {
        if (!item) return;
        var lnglats = item.points;
        var startPointData = opt.startPointData;
        if (!lnglats || lnglats.length < 1) return;
        var name = item.name || "--";
        var positions = mars3d.pointconvert.lonlats2cartesians(lnglats);
        var time = haoutil.str.formatTime(item.allDuration);
        var distance = haoutil.str.formatLength(item.allDistance);
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
            // popup: html
        });
        entity.lineData = item;
        entity.polyline.material_old = entity.polyline.material;
        entity.startPointData = startPointData;
        this.allRouteData.push(entity);
        this.lineArr.push(entity);
        return entity;
    }
    //控制线的显示隐藏
    showHideLineById(id, isShow) {
        if (!id) return;
        var flyline = this.getFlylineById(id);
        if (flyline) {
            flyline.line.isStart = isShow; //禁止其运动、
            flyline.entity.show = isShow; //隐藏车辆
        }
        for (var i = 0; i < this.lineArr.length; i++) {
            if (this.lineArr[i].id == id) {
                this.lineArr[i].show = isShow;
                break;
            }
        }

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
    //获取漫游对象
    getFlylineById(id) {
        if (!id) return;
        var flyline;
        for (var i = 0; i < this.flylineArr.length; i++) {
            var flyLine = this.flylineArr[i];
            if (flyLine.line.id == id) {
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
        if (flyline) flyline.start();
    }
    //漫游多个车辆
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
            "name": line.startPointData._name || "-- ",
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
        flyLine.line = line;
        // flyLine.clampToGround(function () {
        //     flyLine.popup = {
        //         anchor: [0, -20], //左右、上下的偏移像素值。
        //         timeRender: true, //实时更新html
        //         html: function () {
        //             var params = flyLine.timeinfo;
        //             if (!params) return "即将开始漫游";
        //             var html = '<div style="width:200px;">' +
        //                 '名称：' + (flyLine.name || "--") + '<br/>' +
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
    //停止动画
    stopFlyline(arr) {
        for (var i = 0; i < arr.length; i++) {
            for (var j = 0; j < this.flylineArr.length; j++) {
                if (arr[i] == this.flylineArr[j].line.id) {
                    if (his.flylineArr[j]) his.flylineArr[j].stop();
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
        for (var i = 0; i < this.lnglatArr_JY.length; i++) {
            if (id === this.lnglatArr_JY[i].entity.id) {
                if (this.lnglatArr_JY[i].entity) this.drawControl_JY.deleteEntity(this.lnglatArr_JY[i].entity);
                this.lnglatArr_JY.splice(i, 1);
                break;
            }
        }

    }
    //根据撤离点id 删除对应的线 及 flyline对象
    removeLineAboutByPointId(id) {
        if (!id) return;
        if (this.lineArr.length > 0 || this.flylineArr.length > 0) {
            this.updateJY = true; //表示当前删除时 已经经过计算了
        }
        var newLineArr = [];
        for (var k = 0; k < this.lineArr.length; k++) {
            if (this.lineArr[k].startPointData.id == id) {
                if (this.lineArr[k]) this.viewer.entities.remove(this.lineArr[k]);
            } else {
                if (this.lineArr[k]) newLineArr.push(this.lineArr[k]);
            }
        }
        this.lineArr = newLineArr;
        var newFlylineArr = [];
        for (var i = 0; i < this.flylineArr.length; i++) {
            if (this.flylineArr[i].line && id == this.flylineArr[i].line.startPointData.id) {
                this.flylineArr[i].destroy();
            } else {
                newFlylineArr.push(this.flylineArr[i]);
            }
        }
        this.flylineArr = newFlylineArr;
    }
    //控制线的显示隐藏
    showHideLineById(id, isShow) {
        if (!id) return;
        var flyline = this.getFlylineById(id);
        flyline.line.isStart = isShow; //禁止其运动、
        flyline.line.show = isShow; //隐藏车辆
        for (var i = 0; i < this.lineArr.length; i++) {
            if (this.lineArr[i] && this.lineArr[i].id == id) {
                this.lineArr[i].show = isShow;
                break;
            }
        }
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
        line.polyline.material = new mars3d.material.LineFlowMaterialProperty({ //动画线材质
            color: Cesium.Color.CYAN,
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
        for (var i = 0; i < this.markerArr_JY.length; i++) {
            this.drawControl_JY.deleteEntity(this.markerArr_JY[i]);
        }
        this.markerArr_JY = [];
        this.lnglatArr_JY = [];
        this.allRouteData = [];
        if (this.drawControl_JY) this.drawControl_JY.deleteAll();
    }
    //移除绑定
    stopDraw() {
        if (this.drawControl_JY) this.drawControl_JY.stopDraw();
    }
}