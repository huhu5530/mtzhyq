(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
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
            this.arrResult = []

            this.drawControl = new mars3d.Draw({
                viewer: this.viewer,
                hasEdit: true
            });
            this.drawControl.on(mars3d.Draw.event.drawCreated, (e) => {
                this.updateBufferForEdit(e.entity);
            });
            this.drawControl.on(mars3d.Draw.event.editMovePoint, (e) => {
                this.updateBufferForEdit(e.entity);
            });

        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //打开激活
        activate() {


        }
        //关闭释放
        disable() {
            this.viewWindow = null;
            this.clearDraw();
            this.clearShowFeature();
        }
        clearDraw() {
            this.clearBuffer();
            this.geojsonEntity = null;
            this.drawControl.removeAll();
        }
        clearBuffer() {
            if (this.lastdataSource) {
                this.viewer.dataSources.remove(this.lastdataSource);
                delete this.lastdataSource;
            }
        }
        updateBufferForRadius() {
            if (!this.geojsonEntity) return

            this.updateBuffer(this.geojsonEntity);
        }
        updateBufferForEdit(entity) {
            this.clearBuffer();
            if (!entity.attribute.buffer) return;

            this.geojsonEntity = this.drawControl.toGeoJSON(entity);
            this.updateBuffer(this.geojsonEntity);
        }
        updateBuffer(geojson) {
            this.clearBuffer();

            var buffere
            try {
                var bufferRadius = this.viewWindow.getBufferRadius();
                buffere = mars3d.util.buffer(geojson, bufferRadius);
            } catch (e) {
                console.log(e);
            }
            if (!buffere) return;

            var that = this
            Cesium.GeoJsonDataSource.load(buffere, {
                stroke: Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.7),
                strokeWidth: 2,
                fill: Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.4),
                clampToGround: true
            }).then(function (dataSource) {
                that.lastdataSource = dataSource;
                that.viewer.dataSources.add(dataSource);
                that.viewer.dataSources.lower(dataSource)

            }).otherwise(function (error) {
                haoutil.alert(error, "加载数据出错");
            });

        }

        hasDraw() {
            return this.drawControl.hasDraw();
        }
        //查询后全部显示处理
        clearShowFeature() {
            for (let i = 0, len = this.arrResult.length; i < len; i++) {
                var dataSource = this.arrResult[i];
                this.viewer.dataSources.remove(dataSource);
            }
            this.arrResult = [];
            this.viewer.mars.popup.close();
        }
        getExtentByType(extenttype) {
            var drawEntity;
            if (extenttype == "1") {
                //当前视域内
                var extent = mars3d.point.getExtent(this.viewer);
                return mars3d.L.latLngBounds(mars3d.L.latLng(extent.ymin, extent.xmin), mars3d.L.latLng(extent.ymax, extent.xmax))
            }
            else if (extenttype == "2") {//绘制的区域
                this.drawControl.stopDraw();

                drawEntity = this.drawControl.getEntitys()[0];
                if (drawEntity.polygon) {
                    return this.drawControl.toGeoJSON(drawEntity);
                }
                else if (drawEntity.rectangle) {
                    var coor = mars3d.draw.attr.getCoordinates(drawEntity);
                    return mars3d.L.latLngBounds(mars3d.L.latLng(coor[0][1], coor[0][0]),
                        mars3d.L.latLng(coor[1][1], coor[1][0]));
                }
                else if (drawEntity.ellipse) {
                    //query.nearby(latlngs, distance)   需要ArcGIS Server 10.3+ 

                    var radius = drawEntity.ellipse.semiMajorAxis.getValue() / 1000;
                    var buffere = turf.buffer(this.drawControl.toGeoJSON(drawEntity), radius, { units: 'kilometers' });
                    return buffere;
                }
            }
            else if (extenttype == "3") {//缓冲区内
                this.drawControl.stopDraw();

                drawEntity = this.lastdataSource.entities.values[0];
                if (drawEntity.polygon) {
                    var buffere = mars3d.draw.attr.polygon.toGeoJSON(drawEntity)
                    return buffere;
                }
            }
            return null;
        }
        query(param) {
            var query = mars3d.L.esri.query({
                url: param.layer.url
            });

            if ((param.where != null && param.where.length > 0)) {
                query.where(param.where);
            }
            if (param.extent) {
                query.intersects(param.extent);
            }

            var that = this;
            query.run(function (error, featureCollection, response) {
                if (param.end) param.end();//回调

                if (error != null && error.code > 0) {
                    toastr.error(error.message, '服务访问出错');
                    return;
                }
                if (featureCollection == undefined || featureCollection == null || featureCollection.features.length == 0) {
                    toastr.info("未找到符合查询条件的" + param.layer.name + "要素！")
                    return;
                }
                else {
                    //剔除有问题数据 
                    const featuresOK = [];
                    for (var i = 0; i < featureCollection.features.length; i++) {
                        const feature = featureCollection.features[i];
                        if (feature == null || feature.geometry == null
                            || feature.geometry.coordinates == null || feature.geometry.coordinates.length == 0) continue;
                        // feature.properties

                        if (feature.geometry.type == "LineString") {
                            feature.properties["长度"] = mars3d.point.formatNum(turf.length(feature) * 1000, 2);
                        }
                        else if (feature.geometry.type == "Polygon") {
                            feature.properties["面积"] = mars3d.point.formatNum(turf.area(feature), 2);
                            feature.properties["长度"] = mars3d.point.formatNum(turf.length(feature) * 1000, 2);
                        }

                        featuresOK.push(feature);
                    }
                    featureCollection.features = featuresOK;

                    var dataSource = Cesium.GeoJsonDataSource.load(featureCollection, {
                        clampToGround: true
                    });
                    dataSource.then(function (dataSource) {
                        that.showQueryResult(dataSource, param.layer);
                    }).otherwise(function (error) {
                        that.showError("服务出错", error);
                    });
                }
            });

        }
        showQueryResult(dataSource, layer) {
            this.arrResult.push(dataSource);
            this.viewer.dataSources.add(dataSource);

            //设置配置
            const arrResultData = [];
            const objResultFeature = {};
            const entities = dataSource.entities.values;
            for (let i = 0, len = entities.length; i < len; i++) {
                const entity = entities[i];
                const attr = mars3d.util.getAttrVal(entity.properties);

                attr.rowID = (i + 1).toString();
                arrResultData.push(attr);
                objResultFeature[attr.rowID] = entity;
            }
            layer.result = arrResultData
            layer.resultEntity = objResultFeature
            layer.click = (entity) => {
                this.highlight(entity);
            }
            mars3d.util.config2Entity(entities, layer)

            this.viewWindow.updateAllCount(arrResultData.length, layer);
        }
        centerAt(item, layer) {
            var entity = layer.resultEntity[item.rowID];
            if (!entity) return

            //参数解释：线面数据：scale控制边界的放大比例，点数据：radius控制视距距离
            this.viewer.mars.flyTo(entity, { scale: 0.5, radius: 1000 });
            this.highlight(entity);
        }
        highlight(entity) {
            if (this.lastEntity) {
                if (this.lastEntity.polygon) {
                    this.lastEntity.polygon.material = this.lastEntity.polygon.material_bak
                }
                if (this.lastEntity.corridor) { 
                    this.lastEntity.corridor.material = this.lastEntity.corridor.material_bak
                }
                if (this.lastEntity.polyline) {
                    this.lastEntity.polyline.material = this.lastEntity.polyline.material_bak
                    if (this.lastEntity._corridorEx) {
                        this.lastEntity._corridorEx.corridor.material = this.lastEntity._corridorEx.corridor.material_bak
                    }
                }
                delete this.lastEntity
            }
            if (entity.polygon) {
                entity.polygon.material_bak = entity.polygon.material
                entity.polygon.material = Cesium.Color.RED.withAlpha(0.8)
                this.lastEntity = entity;
            }
            else if (entity.corridor) {
                entity.corridor.material_bak = entity.corridor.material
                entity.corridor.material = Cesium.Color.RED.withAlpha(0.8)
                this.lastEntity = entity;
            }
            else if (entity.polyline) {
                entity.polyline.material_bak = entity.polyline.material
                entity.polyline.material = Cesium.Color.RED.withAlpha(0.8)
                if (entity._corridorEx) {
                    entity._corridorEx.corridor.material_bak = entity._corridorEx.corridor.material
                    entity._corridorEx.corridor.material = Cesium.Color.RED.withAlpha(0.8)
                }
                this.lastEntity = entity;
            }
        }


    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 