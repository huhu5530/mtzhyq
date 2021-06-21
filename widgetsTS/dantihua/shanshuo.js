(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {

        //初始化[仅执行1次]
        create() {
            this.layers = {}
            this.layerWork = this.viewer.mars.getLayer(203012, 'id');

            var url = this.config.data || "http://data.marsgis.cn/file/geojson/draw-dth-wm.json";
            this.addPolygon(url, '房屋单体化');
        }
        //打开激活
        activate() {
            this.viewer.mars.centerAt({ "y": 40.412079, "x": 115.458642, "z": 937.7, "heading": 193, "pitch": -53.1, "roll": 359.9 });

            if (this.layerWork) {
                this.lastVisible = this.layerWork._visible;
                if (!this.lastVisible)
                    this.layerWork.visible = true;
                //this.layerWork.centerAt();
            }

            this.setVisible(true);
        }
        //关闭释放
        disable() {
            if (this.layerWork && !this.lastVisible)
                this.layerWork.visible = false;
            this.setVisible(false);
        }
        setVisible(value) {
            for (var key in this.layers) {
                this.layers[key].visible = value;
            }
        }

        addPolygon(json, name) {
            var that = this;

            //添加叠加的单体化数据 
            $.ajax({
                type: "get",
                dataType: "json",
                url: json,
                success: function (featureCollection) {
                    var dataSource = Cesium.GeoJsonDataSource.load(featureCollection);
                    dataSource.then(function (dataSource) {
                        var entities = dataSource.entities.values;
                        var arrEntity = that.showResult(entities);

                        //添加到图层控制 
                        that.layers[name] = bindToLayerControl({
                            "pid": 20,
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
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    haoutil.alert("Json文件" + json + "加载失败！");
                }

            });
        }

        showResult(entities) {


            var arrEntitie = [];
            for (var i = 0; i < entities.length; i++) {
                var entityOld = entities[i];

                var hierarchy = entityOld.polygon.hierarchy;
                var inhtml = "名称：" + entityOld.properties.name;

                var entitie = this.viewer.entities.add({
                    properties: entityOld.properties,
                    description: entityOld.description,
                    polygon: {
                        perPositionHeight: false,
                        classificationType: Cesium.ClassificationType.BOTH,
                        hierarchy: hierarchy,
                        material: Cesium.Color.fromCssColorString("#00ff00").withAlpha(0.2) //闪烁的颜色
                    },
                    popup: {
                        html: inhtml,
                        anchor: [0, -12],//左右、上下的偏移像素值。
                    },
                });
                arrEntitie.push(entitie);
            }

            //闪烁
            var isshow = true;
            setInterval(function () {
                isshow = !isshow;
                for (var i = 0, len = arrEntitie.length; i < len; i++) {
                    var entity = arrEntitie[i];
                    entity.show = isshow;
                }
            }, 600);

            return arrEntitie;
        }




    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 