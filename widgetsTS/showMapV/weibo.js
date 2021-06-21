(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //初始化[仅执行1次]
        create() {

        }
        //激活插件
        activate() {
            viewer.mars.centerAt({ "x": 110.597446, "y": 29.808307, "z": 7852845.8, "heading": 352.7, "pitch": -86.3, "roll": 0.7 }, 0);

            var that = this;
            $.ajax({
                url: 'http://data.marsgis.cn/file/apidemo/weibo.json',
                type: "GET",
                dataType: 'json',
                success: function (rs) {
                    debugger
                    that.showMapV(rs);
                }
            });
        }

        //关闭释放
        disable() {
            
        }
        showMapV(rs) {
            debugger
            var data1 = [];
            var data2 = [];
            var data3 = [];
            for (var i = 0; i < rs[0].length; i++) {
                var geoCoord = rs[0][i].geoCoord;
                data1.push({
                    geometry: {
                        type: 'Point',
                        coordinates: geoCoord
                    }
                });
            }

            for (var i = 0; i < rs[1].length; i++) {
                var geoCoord = rs[1][i].geoCoord;
                data2.push({
                    geometry: {
                        type: 'Point',
                        coordinates: geoCoord
                    },
                    time: Math.random() * 10
                });
            }

            for (var i = 0; i < rs[2].length; i++) {
                var geoCoord = rs[2][i].geoCoord;
                data3.push({
                    geometry: {
                        type: 'Point',
                        coordinates: geoCoord
                    }
                });
            }

            var dataSet = new mapv.DataSet(data1);
            var options = {
                fillStyle: 'rgba(200, 200, 0, 0.8)',
                bigData: 'Point',
                size: 0.7,
                draw: 'simple',
            };
            debugger
            var s = new mars3d.MapVLayer(viewer, dataSet, options);

            var dataSet = new mapv.DataSet(data2);
            var options = {
                fillStyle: 'rgba(255, 250, 0, 0.8)',
                size: 0.7,
                bigData: 'Point',
                draw: 'simple',
            };
            var s1 = new mars3d.MapVLayer(viewer, dataSet, options);

            var dataSet = new mapv.DataSet(data3);
            var options = {
                fillStyle: 'rgba(255, 250, 250, 0.6)',
                size: 0.7,
                bigData: 'Point',
                draw: 'simple',
            };
            var s2 = new mars3d.MapVLayer(viewer, dataSet, options);

            var dataSet = new mapv.DataSet(data2);
            var options = {
                fillStyle: 'rgba(255, 250, 250, 0.9)',
                size: 1.1,
                draw: 'simple',
                bigData: 'Point',
                animation: {
                    stepsRange: {
                        start: 0,
                        end: 10
                    },
                    trails: 1,
                    duration: 6,
                }
            };
            var s3 = new mars3d.MapVLayer(viewer, dataSet, options);

        }

    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 