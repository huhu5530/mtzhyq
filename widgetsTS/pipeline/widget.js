
(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget { 
        //初始化[仅执行1次]
        create() {
            this.layers = {}
            this.bindEvent();

            var url = this.path + (this.config.data || "data/pipeline.json?cache=2");
            this.addPipeline(url, '供水管网');
        }
        //打开激活
        activate() {
            this.setVisible(true);
        }
        //关闭释放
        disable() {
            this.setVisible(false);
        }
        setVisible(value) {
            for (var key in this.layers) {
                this.layers[key].visible = value;
            }
        }

        addPipeline(json, name) {
            var that = this;

            //添加管道示例数据 
            $.getJSON(json, function (featureCollection) {
                var dataSource = Cesium.GeoJsonDataSource.load(featureCollection);
                dataSource.then(function (dataSource) {
                    var entities = dataSource.entities.values;
                    var arrEntity = that.showResult(entities);

                    that.viewer.flyTo(arrEntity);

                    //添加到图层控制 
                    that.layers[name] = bindToLayerControl({
                        name: name,
                        visible: true,
                        entities: arrEntity,
                        onAdd: function () {//显示回调  
                            $(this.entities).each(function (i, item) {
                                that.viewer.entities.add(item);
                            });
                        },
                        onRemove: function () {//隐藏回调 
                            $(this.entities).each(function (i, item) {
                                that.viewer.entities.remove(item);
                            });
                        },
                        onCenterAt: function (duration) {//定位回调 
                            that.viewer.flyTo(this.entities, { duration: duration });
                        },
                    });

                }).otherwise(function (error) {
                    if (!error) error = '未知错误';
                    console.log('arcDynamicLayer错误:' + error);
                });
            });
        }

        showResult(entities) {
            var arrEntitie = [];

            var shapeCache = {};

            for (var i = 0; i < entities.length; i++) {
                var entityOld = entities[i];

                var positions = entityOld.polyline.positions;


                var inhtml = "管线长度：" + entityOld.properties._changdu + "米<br/>管径：" + entityOld.properties._guanjin + "mm";

                var radius = entityOld.properties._guanjin / 80;
                if (radius < 2) radius = 2;

                if (!shapeCache[radius])
                    shapeCache[radius] = this.computeCircle(radius);

                var entitie = this.viewer.entities.add({
                    isPipeline: true,
                    properties: entityOld.properties,
                    description: entityOld.description,
                    polylineVolume: {
                        positions: positions,
                        shape: shapeCache[radius],
                        material: Cesium.Color.fromCssColorString("#651112").withAlpha(0.8)
                    },
                    popup: {
                        html: inhtml,
                        anchor: [0, -12],//左右、上下的偏移像素值。
                    },
                });
                arrEntitie.push(entitie);
            }
            console.log('管线加载完成，共' + arrEntitie.length + "条");

            //this.updateTerrainHeight(arrEntitie);

            return arrEntitie;
        }

        //计算管道形状
        computeCircle(radius) {
            var hd = radius / 3;
            var startAngle = 0;
            var endAngle = 360;

            var pss = [];
            for (var i = startAngle; i <= endAngle; i++) {
                var radians = Cesium.Math.toRadians(i);
                pss.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
            }
            for (var i = endAngle; i >= startAngle; i--) {
                var radians = Cesium.Math.toRadians(i);
                pss.push(new Cesium.Cartesian2((radius - hd) * Math.cos(radians), (radius - hd) * Math.sin(radians)));
            }
            return pss;
        }

        updateTerrainHeight(arrEntitie) {
            var that = this;
            var index = 0;
            function getLineFD() {
                if (index > arrEntitie.length - 1) {
                    console.log('管线高程更新全部完成');

                    var json = that.toGeoJSON(arrEntitie);
                    haoutil.file.downloadFile("pipeline.json", JSON.stringify(json));
                    return;
                }
                console.log('更新第' + index + "条管线高程完成");

                var entity = arrEntitie[index];
                var positions = entity.polylineVolume.positions.getValue();
                mars3d.polyline.computeSurfaceLine({
                    viewer: that.viewer,
                    positions: positions,
                    callback: function (raisedPositions, noHeight) {
                        if (!noHeight) {
                            entity.polylineVolume.positions = raisedPositions;
                        }
                        index++;
                        getLineFD();
                    }
                });
            }
            getLineFD();
        }
        toGeoJSON(arrEntity) {
            var features = [];
            for (var i = 0; i < arrEntity.length; i++) {
                var entity = arrEntity[i];

                entity.attribute = {
                    changdu: entity.properties._changdu._value,
                    guanjin: entity.properties._guanjin._value,
                };
                var geojson = mars3d.draw.attr.polylineVolume.toGeoJSON(entity);
                features.push(geojson);
            }
            var geojson = {
                type: "FeatureCollection",
                features: features
            };
            return geojson;
        }



        bindEvent() {
            //var highlightedEntity;

            //viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(event) {
            //    if (Cesium.defined(highlightedEntity)) {
            //        var color = Cesium.Color.fromCssColorString("#0000FF").withAlpha(0.8);
            //        highlightedEntity.polylineVolume.material.color.setValue(color);
            //        highlightedEntity = null;
            //    }
            //    // Pick a new feature
            //    var position = event.endPosition;
            //    var pickedObject = viewer.scene.pick(position);
            //    if (pickedObject && Cesium.defined(pickedObject.id)) {
            //        debugger
            //        var entity = pickedObject.id;
            //        if (entity && entity.isPipeline) {
            //            highlightedEntity = entity;

            //            debugger
            //            var color = Cesium.Color.fromCssColorString("#FF0000").withAlpha(0.8);
            //            highlightedEntity.polylineVolume.material.color.setValue(color);
            //        }
            //    }
            //}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        }


    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 