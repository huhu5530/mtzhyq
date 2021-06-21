(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 470,
                    height: 460
                }
            }
        }


        //初始化[仅执行1次]
        create() {
            this.objResultFeature = {}
            this.drawControl = new mars3d.Draw({
                viewer: this.viewer,
                hasEdit: false
            });

        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //激活插件
        activate() {

        }
        //释放插件
        disable() {
            this.clearDraw();
            this.clearShowFeature();
        }
        clearDraw() {
            this.drawControl.clearDraw();
        }
        drawPolygon() {
            this.drawControl.clearDraw();
            this.drawControl.startDraw({
                "type": "polygon",
                "style": {
                    "color": "#00FF00",
                    "opacity": 0.3,
                    "outline": true,
                    "outlineColor": "#ffffff",
                    "clampToGround": true
                },
            });
        }
        drawRectangle() {
            this.drawControl.clearDraw();
            this.drawControl.startDraw({
                "type": "rectangle",
                "style": {
                    "color": "#00FF00",
                    "opacity": 0.3,
                    "outline": true,
                    "outlineColor": "#ffffff",
                    "clampToGround": true
                },
            });
        }
        drawCircle() {
            this.drawControl.clearDraw();
            this.drawControl.startDraw({
                "type": "circle",
                "style": {
                    "color": "#00FF00",
                    "opacity": 0.3,
                    "outline": true,
                    "outlineColor": "#ffffff",
                    "clampToGround": true
                },
            });
        }
        hasDraw() {
            return this.drawControl.hasDraw();
        }
        //查询后全部显示处理
        clearShowFeature() {
            if (!this.dataSource) return;

            this.viewer.dataSources.remove(this.dataSource);
            this.dataSource = null;
            if (this.viewWindow)
                this.viewWindow.clearResult();
        }
        query(param) {
            var query = mars3d.L.esri.query({
                url: param.url
            });

            if ((param.where != null && param.where.length > 0)) {
                query.where(param.where);
            }

            var drawEntity;
            if (param.extenttype == "1") {
                //当前视域内
                var extent = mars3d.point.getExtent(this.viewer);
                query.intersects(mars3d.L.latLngBounds(mars3d.L.latLng(extent.ymin, extent.xmin), mars3d.L.latLng(extent.ymax, extent.xmax)));
            }
            else if (param.extenttype == "2") {
                this.drawControl.stopDraw();

                drawEntity = this.drawControl.getEntitys()[0];
                if (drawEntity.polygon) {
                    query.intersects(this.drawControl.toGeoJSON(drawEntity));
                }
                else if (drawEntity.rectangle) {
                    var coor = mars3d.draw.attr.getCoordinates(drawEntity);
                    query.intersects(mars3d.L.latLngBounds(mars3d.L.latLng(coor[0][1], coor[0][0]),
                        mars3d.L.latLng(coor[1][1], coor[1][0])));
                }
                else if (drawEntity.ellipse) {
                    //query.nearby(latlngs, distance)   需要ArcGIS Server 10.3+ 

                    var radius = drawEntity.ellipse.semiMajorAxis.getValue() / 1000;
                    var buffere = turf.buffer(this.drawControl.toGeoJSON(drawEntity), radius, { units: 'kilometers' });
                    query.intersects(buffere);
                }

            }

            var that = this;

            query.run(function (error, featureCollection, response) {
                param.end();//回调

                if (error != null && error.code > 0) {
                    toastr.error(error.message, '服务访问出错');
                    return;
                }
                if (featureCollection == undefined || featureCollection == null || featureCollection.features.length == 0) {
                    toastr.info("未找到符合查询条件的要素！")
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
                        that.showQueryResult(dataSource);
                    }).otherwise(function (error) {
                        that.showError("服务出错", error);
                    });
                }
            });
        }
        showQueryResult(dataSource) {
            var that = this;
            this.clearShowFeature();

            this.dataSource = dataSource;
            this.viewer.dataSources.add(dataSource);

            //设置配置
            const arrResultData = [];
            const entities = dataSource.entities.values;
            for (let i = 0, len = entities.length; i < len; i++) {
                const entity = entities[i];
                const attr = mars3d.util.getAttrVal(entity.properties);

                attr.rowID = (i + 1).toString();
                arrResultData.push(attr);
                this.objResultFeature[attr.rowID] = entity;
            }
            this.viewWindow.selectedLayer.click = function (entity) {
                that.highlight(entity);
            }
            mars3d.util.config2Entity(entities, this.viewWindow.selectedLayer)

            this.viewWindow.showResult(arrResultData);
        }
        centerAt(rowID) {
            var entity = this.objResultFeature[rowID];
            //参数解释：线面数据：scale控制边界的放大比例，点数据：radius控制视距距离
            this.viewer.mars.flyTo(entity, { scale: 0.5, radius: 1000 });
            this.highlight(entity);
        }
        highlight(entity) {
            if (this.lastEntity) {
                if (this.lastEntity.polygon) {
                    this.lastEntity.polygon.material = this.lastEntity.polygon.material_bak
                }
                if (this.lastEntity.polyline) {
                    this.lastEntity.polyline.material = this.lastEntity.polyline.material_bak
                }
                delete this.lastEntity
            }
            if (entity.polygon) {
                entity.polygon.material_bak = entity.polygon.material
                entity.polygon.material = Cesium.Color.RED.withAlpha(0.8)
                this.lastEntity = entity;
            }
            else if (entity.polyline) {
                entity.polyline.material_bak = entity.polyline.material
                entity.polyline.material = Cesium.Color.RED.withAlpha(0.8)
                this.lastEntity = entity;
            }
        }


    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 