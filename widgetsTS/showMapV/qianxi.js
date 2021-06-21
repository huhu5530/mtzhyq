(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //初始化[仅执行1次]
        create() { 
            this.layers = [] 
        }
        //打开激活
        activate() {
            viewer.mars.centerAt({ "x": 110.597446, "y": 29.808307, "z": 7852845.8, "heading": 352.7, "pitch": -86.3, "roll": 0.7 }, 0);

            var that = this;
            $.ajax({
                url: 'http://data.marsgis.cn/file/geojson/china.json',
                type: "GET",
                dataType: 'json',
                success: function (rs) {
                    that.showMapV(rs);
                }
            });
        }
        //关闭释放
        disable() {
            for (var i = 0, len = this.layers.length; i < len; i++) {
                var layer = this.layers[i];
                layer.destroy();
            }
            this.layers = [];
        }

        showMapV(geojson) {

            var geojsonOptions = {
                gradient: {
                    0: 'rgba(55, 50, 250, 0.4)',
                    1: 'rgba(55, 50, 250, 1)'
                },
                max: 354551,
                draw: 'intensity'
            }

            var geojsonDataSet = mapv.geojson.getDataSet(geojson);

            var to = '北京';

            var qianxi = new mapv.DataSet([
                {
                    from: '河北',
                    count: 354551,
                    to: to,
                },
                {
                    from: '天津',
                    count: 97323,
                    to: to,
                },
                {
                    from: '山东',
                    count: 28664,
                    to: to,
                },
                {
                    from: '山西',
                    count: 16650,
                    to: to,
                },
                {
                    from: '辽宁',
                    count: 14379,
                    to: to,
                },
                {
                    from: '河南',
                    count: 10980,
                    to: to,
                },
                {
                    from: '内蒙古自治区',
                    count: 9603,
                    to: to,
                },
                {
                    from: '江苏',
                    count: 4536,
                    to: to,
                },
                {
                    from: '上海',
                    count: 3556,
                    to: to,
                },
                {
                    from: '广东',
                    count: 2600,
                    to: to,
                },
            ]);

            var qianxiData = qianxi.get();

            var lineData = [];
            var pointData = [];
            var textData = [];
            var timeData = [];

            var citys = {}

            for (var i = 0; i < qianxiData.length; i++) {
                var fromCenter = mapv.utilCityCenter.getCenterByCityName(qianxiData[i].from);
                var toCenter = mapv.utilCityCenter.getCenterByCityName(qianxiData[i].to);
                if (!fromCenter || !toCenter) {
                    continue;
                }
                citys[qianxiData[i].from] = qianxiData[i].count;
                citys[qianxiData[i].to] = 100;
                pointData.push(
                    {
                        geometry: {
                            type: 'Point',
                            coordinates: [fromCenter.lng, fromCenter.lat]
                        }
                    }
                );
                pointData.push(
                    {
                        geometry: {
                            type: 'Point',
                            coordinates: [toCenter.lng, toCenter.lat]
                        }
                    }
                );
                textData.push(
                    {
                        geometry: {
                            type: 'Point',
                            coordinates: [fromCenter.lng, fromCenter.lat]
                        },
                        text: qianxiData[i].from
                    }
                );
                textData.push(
                    {
                        geometry: {
                            type: 'Point',
                            coordinates: [toCenter.lng, toCenter.lat]
                        },
                        text: qianxiData[i].to
                    }
                );

                var curve = mapv.utilCurve.getPoints([fromCenter, toCenter]);

                for (var j = 0; j < curve.length; j++) {
                    timeData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: curve[j]
                        },
                        count: 1,
                        time: j
                    });
                }

                lineData.push({
                    geometry: {
                        type: 'LineString',
                        coordinates: curve
                        //coordinates: [[fromCenter.lng, fromCenter.lat], [toCenter.lng, toCenter.lat]]
                    },
                    count: 30 * Math.random()
                });

            }

            var data = geojsonDataSet.get({
                filter: function (item) {

                    if (!citys[item.name]) {
                        return false;
                    }

                    item.count = citys[item.name];
                    return true;
                }
            });
            geojsonDataSet = new mapv.DataSet(data);
            var layer = new mars3d.MapVLayer(this.viewer, geojsonDataSet, geojsonOptions);
            this.layers.push(layer);

            var textDataSet = new mapv.DataSet(textData);

            var textOptions = {
                draw: 'text',
                font: '14px Arial',
                fillStyle: 'white',
                shadowColor: 'yellow',
                shadowBlue: 10,
                zIndex: 11,
                shadowBlur: 10
            }
            var layer = new mars3d.MapVLayer(this.viewer, textDataSet, textOptions);
            this.layers.push(layer);

            var lineDataSet = new mapv.DataSet(lineData);

            var lineOptions = {
                strokeStyle: 'rgba(255, 250, 50, 0.8)',
                shadowColor: 'rgba(255, 250, 50, 1)',
                shadowBlur: 20,
                lineWidth: 2,
                zIndex: 100,
                draw: 'simple'
            }
            var layer = new mars3d.MapVLayer(this.viewer, lineDataSet, lineOptions);
            this.layers.push(layer);

            var pointOptions = {
                fillStyle: 'rgba(254,175,3,0.7)',
                shadowColor: 'rgba(55, 50, 250, 0.5)',
                shadowBlur: 10,
                size: 5,
                zIndex: 10,
                draw: 'simple'
            }
            var pointDataSet = new mapv.DataSet(pointData);
            var layer = new mars3d.MapVLayer(this.viewer, pointDataSet, pointOptions);
            this.layers.push(layer);


            var timeDataSet = new mapv.DataSet(timeData);
            var timeOptions = {
                fillStyle: 'rgba(255, 250, 250, 0.5)',
                zIndex: 200,
                size: 2.5,
                animation: {
                    type: 'time',
                    stepsRange: {
                        start: 0,
                        end: 50
                    },
                    trails: 10,
                    duration: 2,
                },
                draw: 'simple'
            }
            var layer = new mars3d.MapVLayer(this.viewer, timeDataSet, timeOptions);
            this.layers.push(layer);


        }





    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d)
