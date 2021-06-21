
(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {


        //初始化[仅执行1次]
        create() {
            this.layers = {}
            //对应的模型，实际项目中可以注释，一直打开模型
            this.layerWork = this.viewer.mars.getLayer(203012, 'id');

            this.addPolygon({
                pid: 40,
                name: '文庙单体化',
                url: "http://data.marsgis.cn/file/geojson/draw-dth-wm.json",
                color: "#ffff00",
                zIndex: 1,
            });
        }
        //打开激活
        activate() {

            //实际项目中可以注释，打开模型的处理
            this.viewer.mars.centerAt({ "y": 33.589536, "x": 119.032216, "z": 145.08, "heading": 3.1, "pitch": -22.9, "roll": 0 });

            if (this.layerWork) {
                this.lastVisible = this.layerWork._visible;
                if (!this.lastVisible)
                    this.layerWork.visible = true;
            }
            //实际项目中可以注释，打开模型的处理

            this.setVisible(true);
        }
        //关闭释放
        disable() {
            //实际项目中可以注释，打开模型的处理
            if (this.layerWork && !this.lastVisible)
                this.layerWork.visible = false;
            //实际项目中可以注释，打开模型的处理

            this.setVisible(false);

        }
        setVisible(value) {
            for (var key in this.layers) {
                this.layers[key].visible = value;
            }
        }

        addPolygon(opts) {
            var that = this;

            //添加叠加的单体化数据 
            $.ajax({
                type: "get",
                dataType: "json",
                url: opts.url,
                success: function (featureCollection) {
                    var dataSource = Cesium.GeoJsonDataSource.load(featureCollection);
                    dataSource.then(function (dataSource) {
                        var entities = dataSource.entities.values;

                        var arrEntity = that.showResult(entities, opts);

                        //添加到图层控制 
                        that.layers[opts.name] = bindToLayerControl({
                            pid: opts.pid,
                            name: opts.name,
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
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    haoutil.alert("Json文件" + json + "加载失败！");
                }

            });
        }

        //整栋单体化
        showResult(entities, opts) {
            //单体化显示的面
            var highlighted_hierarchy;
            var highlightedEntity = viewer.entities.add({
                noMouseMove: true, //标识下，内部不监听其移入事件 
                polygon: {
                    perPositionHeight: false,
                    classificationType: Cesium.ClassificationType.BOTH,
                    material: Cesium.Color.fromCssColorString(opts.color || "#ffff00").withAlpha(opts.alpha || 0.3),
                    hierarchy: new Cesium.CallbackProperty(function (time) {
                        return highlighted_hierarchy;
                    }, false)
                }
            });


            var arrEntitie = [];
            for (var i = 0; i < entities.length; i++) {
                var entityOld = entities[i];

                var hierarchy = entityOld.polygon.hierarchy;

                // var inhtml = mars3d.util.getPopup("all", entityOld.properties, opts.name)  //实际数据时使用的代码
                var inhtml = "名称：房屋" + (i + 1) + "<br />属性：可绑定其他属性"; //entityOld.properties.name;

                var entitie = this.viewer.entities.add({
                    properties: entityOld.properties,
                    description: entityOld.description,
                    polygon: {
                        perPositionHeight: false,
                        classificationType: Cesium.ClassificationType.BOTH,
                        hierarchy: hierarchy,
                        material: Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.01),
                        zIndex: Cesium.defaultValue(opts.zIndex, 0)
                    },
                    popup: {
                        html: inhtml,
                        anchor: [0, -12],//左右、上下的偏移像素值。
                    },
                    mouseover: function (entity) {//移入 
                        highlighted_hierarchy = entity.polygon.hierarchy.getValue();
                        highlightedEntity.polygon.show = true;

                        highlightedEntity.properties = entity.properties;
                        highlightedEntity.tooltip = entity.tooltip ? entity.tooltip : null;
                        highlightedEntity.popup = entity.popup ? entity.popup : null;
                    },
                    mouseout: function (entity) {//移出
                        if (Cesium.defined(highlightedEntity)) {
                            highlightedEntity.polygon.show = false;
                        }
                    },
                });
                arrEntitie.push(entitie);
            }

            return arrEntitie;
        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 