(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {

        //初始化[仅执行1次]
        create() {
            this.dataSource = new Cesium.CustomDataSource();

            //取区域内的随机点
            function randomPoint(height) {
                var jd = haoutil.math.random(117.1 * 1000, 117.3 * 1000) / 1000;
                var wd = haoutil.math.random(31.75 * 1000, 31.9 * 1000) / 1000;
                return Cesium.Cartesian3.fromDegrees(jd, wd, height);
            }

            var colors = [
                new Cesium.Color(77 / 255, 201 / 255, 255 / 255, 0.9),
                new Cesium.Color(255 / 255, 201 / 255, 38 / 255, 0.9),
                new Cesium.Color(221 / 255, 221 / 255, 221 / 255, 0.9),
                Cesium.Color.RED
            ];

            //单个圆圈
            var dataSource = new Cesium.CustomDataSource();
            for (var i = 0; i < 50; i++) {
                var position = randomPoint();

                dataSource.entities.add({
                    position: position,
                    ellipse: {
                        height: 0.0,
                        semiMinorAxis: 500.0,
                        semiMajorAxis: 500.0,
                        material: new mars3d.material.CircleWaveMaterialProperty({
                            duration: 1500,//动画时长，单位：毫秒
                            color: colors[i % 4],
                        }),
                    }
                });
            }

            //支持多个圆圈
            for (var i = 0; i < 50; i++) {
                var position = randomPoint();

                dataSource.entities.add({
                    position: position,
                    ellipse: {
                        height: 0.0,
                        semiMinorAxis: 500.0,
                        semiMajorAxis: 500.0,
                        material: new mars3d.material.CircleWaveMaterialProperty({
                            duration: 2000,//动画时长，单位：毫秒
                            color: colors[i % 4],
                            gradient: 0,
                            count: 3
                        }),
                    }
                });
            }
            this.dataSource = dataSource;

        }
        //打开激活
        activate() {
            this.viewer.mars.centerAt({ "y": 31.746206, "x": 117.229251, "z": 18225.61, "heading": 356.5, "pitch": -67, "roll": 360 });

            this.viewer.dataSources.add(this.dataSource);
        }
        //关闭释放
        disable() {
            this.viewer.dataSources.remove(this.dataSource);

        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 