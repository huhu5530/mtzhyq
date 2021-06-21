(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: 'view.html',
                windowOptions: {
                    width: 250,
                    height: 500,
                }
            }
        }
        create() {
            this.typeFP = false //true:垂直，false水平

            var inhtml = '<div id="centerDivEx" style="position:absolute;left:0px;top:0px;border:1px solid #ccc;bottom: 0px;width:50%;overflow: hidden;">'
                + '<div id="cesiumContainerEx" style="height:100%;width:100%;overflow: hidden;"></div>'
                + '</div>';
            $("body").append(inhtml);
            $("#centerDiv").css({
                position: "absolute",
                width: "50%",
                height: "100%",
                top: 0,
                right: 0
            });
            var configdata = this.viewer.mars.getConfig();
            delete configdata.navigation;
            delete configdata.location;

            //用于双屏同图层，不同配置展示
            for (var i = 0, len = configdata.operationallayers.length; i < len; i++) {
                var item = configdata.operationallayers[i];
                if (item.compare) {//存在compare属性时
                    for (var key in item.compare) {
                        item[key] = item.compare[key];
                    }
                }
            }

            this.viewerEx = mars3d.createMap({
                id: 'cesiumContainerEx',
                data: configdata,
                "homeButton": false,
                "geocoder": false,
                "sceneModePicker": false,
                "navigationHelpButton": false,
                "vrButton": false,
                "fullscreenButton": false,
                "baseLayerPicker": true,
            });

            var that = this;
            this.viewer.scene.morphComplete.addEventListener(function (event) {//切换场景前事件 
                if (that.viewer.scene.mode === Cesium.SceneMode.SCENE2D) {
                    that.viewerEx.scene.screenSpaceCameraController.enableTilt = false;
                }
                else {
                    that.viewerEx.scene.screenSpaceCameraController.enableTilt = true;
                }
            });
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            var that = this;

            $("#btn_mapCompare_close").click(function () {
                that.disableBase();
            });
        }
        //激活插件
        activate() {
            if (this.typeFP) {
                $("#centerDiv").css({
                    position: "absolute",
                    height: "50%",
                    width: "100%"
                });
            } else {
                $("#centerDiv").css({
                    position: "absolute",
                    height: "100%",
                    width: "50%"
                });
            }

            $("#centerDivEx").show(); 

            this.viewer.camera.changed.addEventListener(this._map_extentChangeHandler, this);
            this.viewer.camera.percentageChanged = 0.01;

            this.viewerEx.camera.changed.addEventListener(this._mapEx_extentChangeHandler, this);
            this.viewerEx.camera.percentageChanged = 0.01;

            this._map_extentChangeHandler();
        }

        //释放插件
        disable() {
            this.viewer.camera.changed.removeEventListener(this._map_extentChangeHandler, this);
            this.viewerEx.camera.changed.removeEventListener(this._mapEx_extentChangeHandler, this);

            ////this.viewerEx.mars.destroy();
            ////this.viewerEx.destroy();
            ////this.viewerEx = null; 
            ////$("#centerDivEx").remove();
            ////$("#btnMapComType").remove();

            $("#centerDivEx").hide();
            $("#centerDiv").css({
                position: "",
                height: "100%",
                width: "100%"
            }); 
        } 
        _map_extentChangeHandler(e) {
            this.viewerEx.camera.changed.removeEventListener(this._mapEx_extentChangeHandler, this);
            this.updateView(this.viewer, this.viewerEx);
            this.viewerEx.camera.changed.addEventListener(this._mapEx_extentChangeHandler, this);
        }
        _mapEx_extentChangeHandler(e) {
            this.viewer.camera.changed.removeEventListener(this._map_extentChangeHandler, this);
            this.updateView(this.viewerEx, this.viewer);
            this.viewer.camera.changed.addEventListener(this._map_extentChangeHandler, this);
        }
        //“变化屏”viewerChange变化，将“被更新屏”viewerUpdate同步更新
        updateView(viewerChange, viewerUpdate) {

            //if (viewerUpdate.scene.mode === Cesium.SceneMode.SCENE2D && viewerChange.scene.mode !== Cesium.SceneMode.SCENE2D) {
            //    //被更新屏”是二维，并且“变化屏”不是二维时
            //    var point = mars3d.point.getCenter(viewerChange);
            //    //console.log(JSON.stringify(point));

            //    viewerUpdate.scene.camera.lookAt(Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z),
            //        new Cesium.Cartesian3(0.0, 0.0, point.cameraZ));
            //}
            //else if (viewerUpdate.scene.mode !== Cesium.SceneMode.SCENE2D && viewerChange.scene.mode === Cesium.SceneMode.SCENE2D) {
            //    //“变化屏”是二维时 ,并且“被更新屏”不是二维 

            //////[该部分无法解决，暂时关闭sceneModePicker，不能二三维联动]

            //}
            //else {
                var point = mars3d.point.getCameraView(viewerChange);
                viewerUpdate.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z),
                    orientation: {
                        heading: Cesium.Math.toRadians(point.heading),
                        pitch: Cesium.Math.toRadians(point.pitch),
                        roll: Cesium.Math.toRadians(point.roll)
                    }
                });
            //}


        }


        //图层树相关
        getLayers() {
            if (this._layers == null) {
                var layers = [];
                var basemapsCfg = this.hasManagerBaseMaps ? this.viewerEx.mars.config.basemaps : [];
                var operationallayersCfg = this.viewerEx.mars.config.operationallayers;

                //构建集合，预处理相关数据  
                for (var i = 0; i < basemapsCfg.length; i++) {
                    var item = basemapsCfg[i];
                    layers.push(item);
                }
                for (var i = 0; i < operationallayersCfg.length; i++) {
                    var item = operationallayersCfg[i];
                    layers.push(item);
                }
                //初始化顺序字段,
                for (var i = 0; i < layers.length; i++) {
                    var item = layers[i];

                    //主键，用于存储取图层用，防止有重复
                    item._key = i + "_" + item.id + "_" + item.name;
                }
                this._layers = layers;
            }
            return this._layers;
        }
        getLayar(item) {
            return this.viewerEx.mars.getLayer(item);
        }
        centerAt(item) {
            var model = this.getLayar(item);
            model && model.centerAt();
        }
        //更新图层:显示隐藏状态
        updateLayerVisible(item, visible) {
            var model = this.getLayar(item);
            if (model)
                model.visible = visible;
        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d)

