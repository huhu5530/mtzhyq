(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {


        //外部资源配置
        get resources() {
            return [
                "./lib/cesiumjs/plugins/class/GaodePOI.js",
            ]
        }

        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    "width": 350,
                    "position": {
                        "top": 45,
                        "bottom": 30,
                        "right": 5
                    }
                }
            }
        }


        //初始化[仅执行1次] 
        create() {
            this.isSearched = false

        }
        //每个窗口创建完成后调用

        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //打开激活 
        activate() {
            this.drawControl = new mars3d.Draw({
                viewer: this.viewer,
                hasEdit: false
            });
            this.dataSource = new Cesium.CustomDataSource();
            this.viewer.dataSources.add(this.dataSource);
            this.gaoDePoi = new GaodePOI();
        }
        //关闭释放
        disable() {
            this.clearAll();
            this.drawControl = null;
            this.viewer.dataSources.remove(this.dataSource);
            this.dataSource = null;
            this.gaoDePoi = null;
            this.lastArg = null;

        }
        draw(type, callback) {
            this.clearAll();
            if (type == 1) {
                this.drawControl.startDraw({
                    "type": "rectangle",
                    "style": {
                        "color": "#00FF00",
                        "opacity": 0.3,
                        "outline": true,
                        "outlineColor": "#ffffff",
                        "clampToGround": true
                    },
                    success: function (entity) {
                        if (callback) callback(entity);
                    }
                });
            } else if (type == 2) {
                this.drawControl.startDraw({
                    "type": "polygon",
                    "style": {
                        "color": "#00FF00",
                        "opacity": 0.3,
                        "outline": true,
                        "outlineColor": "#ffffff",
                        "clampToGround": true
                    },
                    success: function (entity) {
                        if (callback) callback(entity);
                    }
                });
            } else {
                this.drawControl.startDraw({
                    "type": "circle",
                    "style": {
                        "color": "#00FF00",
                        "opacity": 0.3,
                        "outline": true,
                        "outlineColor": "#ffffff",
                        "clampToGround": true
                    },
                    success: function (entity) {
                        if (callback) callback(entity);
                    }
                });
            }
        }
        loadMore() {
            if (!this.lastArg) return;
            this.lastArg.page++;
            this.loadData(this.lastArg);
        }
        loadData(arg) {
            var that = this;
            arg.success = function (res) {
                var data = res.list;
                that.addEntity(data);
                that.viewWindow.loadSuccess(res);
            }
            arg.error = function (msg) {
                window.toastr.error(msg);
                haoutil.loading.close();
            }
            this.gaoDePoi.query(arg);
            this.lastArg = arg;
        }
        clearAll(noClearDraw) {
            this.lastArg = null;
            if (this.dataSource) this.dataSource.entities.removeAll();
            if (!noClearDraw && this.drawControl) {
                this.drawControl.clearDraw();
                this.drawEntity = null;
            }
            this.viewer.mars.popup.close();
        }
        getExtent() {
            return mars3d.point.getExtent(this.viewer);
        }

        addEntity(data) {
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

                var entity = this.dataSource.entities.add({
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

                item._entity = entity;
            }
        }
        centerAt(item) {
            var entity = item._entity;
            if (entity == null) {
                toastr.warning(item.name + " 无经纬度坐标信息！");
                return;
            }


            //参数解释：线面数据：scale控制边界的放大比例，点数据：radius控制视距距离
            var that = this;
            this.viewer.mars.flyTo(entity, {
                scale: 0.5,
                radius: 1000,
                complete: function (e) { //飞行完成回调方法
                    that.viewer.mars.popup.show(entity); //显示popup
                }
            });

        }

    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 