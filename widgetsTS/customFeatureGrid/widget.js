(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //初始化[仅执行1次]
        create() {
            var that = this;

            //添加图层（按视域分块加载数据）
            this.layer = new mars3d.layer.CustomFeatureGridLayer(this.viewer, {
                minimumLevel: 13, //限定层级，只加载该层级下的数据。
                debuggerTileInfo: false,
                IdName: 'id', //getDataForGrid构造的数据中，标识唯一值的属性名称
                getDataForGrid: function (opts, callback) {

                    //获取网格内的数据，calback为回调方法，参数传数据数组  
                    that.getDataForGrid(opts, callback);
                },
                createEntity: function (opts, attributes) {
                    //根据数据创造entity
                    return that.createEntity(opts, attributes);
                },
                updateEntity: function (enetity, attributes) {
                    //更新entity（动态移动的数据时有用）

                },
            });

        }

        //打开激活
        activate() {
            this.layer.visible = true;

        }
        //关闭释放
        disable() {
            this.layer.visible = false;

        }
        getDataForGrid(opts, callback) {
            var url = 'http://yourserverurl'; //你的后端服务地址

            var that = this;
            $.ajax({
                url: url,
                type: "POST",
                dataType: 'json',
                timeout: 10000,
                data: {
                    "xmin": opts.rectangle.xmin,
                    "xmax": opts.rectangle.xmax,
                    "ymin": opts.rectangle.ymin,
                    "ymax": opts.rectangle.ymax,
                },
                success: function (data) {
                    if (!that.isActivate) return;

                    var newarr = [];

                    //根据服务返回数据返回给回调，回调后会传到后续的createEntity方法中使用

                    //var arrdata = data.ais;
                    //for (var index = 0, len = arrdata.length; index < len; index++) {
                    //    var item = arrdata[index];

                    //    var mmsi = item[0];
                    //    var jd = Number(item[2]);
                    //    var wd = Number(item[3]);
                    //    if (isNaN(jd) || jd == 0 || isNaN(wd) || wd == 0)
                    //        continue;

                    //    newarr.push({
                    //        id: mmsi, mmsi: mmsi, name: item[1], x: jd, y: wd,
                    //        trueHead: (Number(item[4]) || 0), sog: item[5], type: item[6], length: item[7]
                    //    });
                    //}

                    if (newarr.length == 0) return;

                    callback(newarr);
                },
                error: function (data) {
                    console.log("请求出错(" + data.status + ")：" + data.statusText);
                }
            });
        }
        createEntity(opts, attributes) {
            //attributes参数为上面getDataForGrid方法中，自行构造的数组中的单项

            //添加实体
            var entity = this.layer.dataSource.entities.add({
                name: attributes.name,
                position: Cesium.Cartesian3.fromDegrees(attributes.x, attributes.y),
                billboard: {
                    image: 'a.jpg',
                    scale: 1,
                    rotation: Cesium.Math.toRadians(attributes.trueHead - 90),
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,   //CLAMP_TO_GROUND RELATIVE_TO_GROUND,
                    scaleByDistance: new Cesium.NearFarScalar(1000, 1, 10000000, 0.1)
                },
                label: {
                    text: attributes.name,
                    font: '8px Helvetica',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    fillColor: Cesium.Color.AZURE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -20),   //偏移量  
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //是地形上方的高度 
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 9000)
                },
                data: attributes,
                popup: {
                    html: function (entity) {
                        var attributes = entity.data;
                        var inthtml = '<div>船名：' + attributes.name + '</div>'
                            + '<div>MMSI：' + attributes.mmsi + '</div>'
                            + '<div>船速：' + attributes.sog + 'kts</div>';

                        return inthtml;
                    },
                    anchor: [0, -12],
                }
            });

            return entity;
        } 
    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 