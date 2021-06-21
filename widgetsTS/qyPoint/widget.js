(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //外部资源配置
        get resources() {
            return [
                'map.css'
            ]
        }

        //初始化[仅执行1次]
        create() {
            this.arrdata = []
            this.objData = {}

            //图标点
            this.billboardCollection = new Cesium.BillboardCollection({ scene: viewer.scene });

            //文字
            this.labelCollection = new Cesium.LabelCollection({ scene: viewer.scene });

            //添加到图层控制  
            if (window.bindToLayerControl) {
                this.viewer.scene.primitives.destroyPrimitives = false;

                var that = this;
                this.layerWork = bindToLayerControl({
                    pid: 30,
                    name: '企业',
                    visible: true,
                    onAdd: function () {//显示回调
                        if (!that.viewer.scene.primitives.contains(that.billboardCollection)) {
                            that.viewer.scene.primitives.add(that.billboardCollection);
                        }
                        if (!that.viewer.scene.primitives.contains(that.labelCollection)) {
                            that.viewer.scene.primitives.add(that.labelCollection);
                        }
                    },
                    onRemove: function () {//隐藏回调 
                        if (that.viewer.scene.primitives.contains(that.billboardCollection)) {
                            that.viewer.scene.primitives.remove(that.billboardCollection);
                        }
                        if (that.viewer.scene.primitives.contains(that.labelCollection)) {
                            that.viewer.scene.primitives.remove(that.labelCollection);
                        }
                    },
                    onCenterAt: function (duration) {//定位回调
                        that.viewer.flyTo(that.billboardCollection, { duration: duration });
                    },
                });
            }
            //从图层控制中 移除
            //  if(this.layerWork){
            //     unbindLayerControl(this.layerWork);
            // }
        }
        //打开激活
        activate() {
            if (!this.viewer.scene.primitives.contains(this.billboardCollection)) {
                this.viewer.scene.primitives.add(this.billboardCollection);
            }
            if (!this.viewer.scene.primitives.contains(this.labelCollection)) {
                this.viewer.scene.primitives.add(this.labelCollection);
            }

            this.arrdata = this.config.dataQy;
            if (this.arrdata) {
                this.addFeature(this.arrdata);
            }
            else {
                var that = this;
                $.getJSON("http://data.marsgis.cn/file/apidemo/qiye/point.json", function (result) {
                    that.arrdata = result.Data;
                    for (var j = 0; j < that.arrdata.length; j++) {
                        var item = that.arrdata[j];

                        //为了详情面板展示，所绑定的示例数据
                        item.QYZP = 5;
                        item.CPZP = 4;
                        item.QYJJ = "有";
                        item.JJ = [
                            { "NF": "2015", "ZCZ": 6000 + haoutil.math.random(10, j * 1000), "LY": 1000 + haoutil.math.random(10, j * 1000), "NSE": 1000 + haoutil.math.random(10, j * 1000) },
                            { "NF": "2016", "ZCZ": 10000 + haoutil.math.random(10, j * 1000), "LY": 3000 + haoutil.math.random(10, j * 1000), "NSE": 3000 + haoutil.math.random(10, j * 1000) },
                            { "NF": "2017", "ZCZ": 25000 + haoutil.math.random(10, j * 1000), "LY": 5000 + haoutil.math.random(10, j * 1000), "NSE": 5000 + haoutil.math.random(10, j * 1000) }
                        ];
                    }

                    that.addFeature(that.arrdata, true);
                });
            }
        }
        //关闭释放
        disable() {
            if (this.viewer.scene.primitives.contains(this.billboardCollection)) {
                this.viewer.scene.primitives.remove(this.billboardCollection);
            }
            if (this.viewer.scene.primitives.contains(this.labelCollection)) {
                this.viewer.scene.primitives.remove(this.labelCollection);
            }

        }
        clear() {
            this.viewer.mars.tooltip.close();

            this.billboardCollection.removeAll()
            this.labelCollection.removeAll()
        }
        addFeature(arr, iscenter) {
            this.clear();

            var that = this;

            var positions = [];

            that.objData = {};
            $(arr).each(function (i, item) {
                that.objData[item.ID] = item;

                var jd = Number(item.JD);
                var wd = Number(item.WD);
                //var z = 0;


                //===========无坐标数据=========== 
                if (isNaN(jd) || jd == 0 || isNaN(wd) || wd == 0)
                    return;
                item.JD = jd;
                item.WD = wd;

                var inthtml = `<div onclick="widgetPointQy.showXQ('${item.ID}')" >${item.NAME}</div>
                      <div>${item.LX}</div>`


                var position = Cesium.Cartesian3.fromDegrees(jd, wd);
                positions.push(position);

                //加图标点
                var primitive = that.billboardCollection.add({
                    position: position,
                    image: 'img/marker/mark3.png',
                    scale: 0.6,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1)
                });
                primitive.data = item
                primitive.tooltip = {
                    html: inthtml,
                    anchor: [0, -12],
                };
                primitive.click = function (entity) { //单击回调
                    that.showXQ(entity.data.ID);
                }

                item._primitive = primitive;


                //文字
                var primitive = that.labelCollection.add({
                    position: position,
                    text: item.JC,
                    font: "normal small-caps normal 18px 楷体",
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    fillColor: Cesium.Color.AZURE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -27), //偏移量 
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 80000),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                });
                primitive.data = item
                primitive.tooltip = {
                    html: inthtml,
                    anchor: [0, -12],
                };
                primitive.click = function (entity) { //单击回调
                    that.showXQ(entity.data.ID);
                }
                item._primitiveLabel = primitive;

            });

            //console.log(JSON.stringify(arr));
            if (iscenter) {
                var extent = mars3d.point.getRectangle(positions, true);
                that.viewer.mars.centerAt(extent);
            }

            return arr;
        }
        getData() {
            return this.arrdata;
        }
        //打开详情
        showXQ(id) {
            var item = this.objData[id];
            if (item === null) return;

            mars3d.widget.activate({
                uri: 'widgetsTS/qyDetailsView/widget.js',
                dataQy: item,
            });

            //弹出自己的单独页面或其他站点url页面。
            //layer.open({
            //    type: 2,
            //    title: '详情页面',
            //    fix: true,
            //    shadeClose: false,
            //    maxmin: true,
            //    area: ["80%", "80%"],
            //    content: "test.html?id="+id,
            //    skin: "layer-mars-dialog animation-scale-up",
            //    success: function (layero) {

            //    }
            //});
        }
        queryData(params) {
            var newdata = [];

            var arrdata = this.arrdata;
            for (var i = 0; i < arrdata.length; i++) {
                var item = arrdata[i];
                if (params.key == "" || item.NAME.indexOf(params.key) != -1) {
                    newdata.push(item);

                    if (item._primitive) {
                        item._primitive.show = true
                    }
                    if (item._primitiveLabel) {
                        item._primitiveLabel.show = true
                    }
                }
                else {
                    if (item._primitive) {
                        item._primitive.show = false
                    }
                    if (item._primitiveLabel) {
                        item._primitiveLabel.show = false
                    }
                }
            }
            return newdata;
        }
        clearLastCenter() {
            this.viewer.mars.tooltip.close();
            if (this.lastCenter == null) return;

            this.lastCenter.image = 'img/marker/mark3.png';
            this.lastCenter = null;
        }
        centerAt(id) {
            var that = this;

            this.clearLastCenter();

            var item = this.objData[id];
            if (item === null) return;

            var entity = item._primitive;
            if (entity == null) {
                toastr.warning(item.JC + " 无经纬度坐标信息！");
                return;
            }


            this.viewer.mars.centerAt({ x: item.JD, y: item.WD, minz: 2500 });

            setTimeout(function () {
                that.viewer.mars.tooltip.show(entity, entity.position);
            }, 3000);

            this.lastCenter = entity;

            this.lastCenter.image = 'img/marker/mark2.png';

            var that = this;
            setTimeout(function () {
                that.clearLastCenter();
            }, 10000);
        }



    }


    //注册到widget管理器中。
    window.widgetPointQy = mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 