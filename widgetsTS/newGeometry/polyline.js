(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {

        //初始化[仅执行1次]
        create() {
            var dataSource = new Cesium.CustomDataSource();

            var center = Cesium.Cartesian3.fromDegrees(117.29, 32.0581, 1);
            dataSource.entities.add({
                name: '合肥市',
                position: center,
                point: {
                    pixelSize: 10,
                    color: new Cesium.Color(77 / 255, 201 / 255, 255 / 255, 0.9)
                }
            });
            dataSource.entities.add({
                name: '合肥市',
                position: center,
                ellipse: {
                    height: 0.0,
                    semiMinorAxis: 80000.0,
                    semiMajorAxis: 80000.0,
                    material: new mars3d.material.CircleWaveMaterialProperty({
                        color: new Cesium.Color(77 / 255, 201 / 255, 255 / 255, 0.9)
                    }),
                }
            });


            var cities = [
                { name: '六安市', lon: 116.3123, lat: 31.8329 },
                { name: '安庆市', lon: 116.7517, lat: 30.5255 },
                { name: '滁州市', lon: 118.1909, lat: 32.536 },
                { name: '宣城市', lon: 118.8062, lat: 30.6244 },
                { name: '阜阳市', lon: 115.7629, lat: 32.9919 },
                { name: '宿州市', lon: 117.5208, lat: 33.6841 },
                { name: '黄山市', lon: 118.0481, lat: 29.9542 },
                { name: '巢湖市', lon: 117.7734, lat: 31.4978 },
                { name: '亳州市', lon: 116.1914, lat: 33.4698 },
                { name: '池州市', lon: 117.3889, lat: 30.2014 },
                { name: '蚌埠市', lon: 117.4109, lat: 33.1073 },
                { name: '芜湖市', lon: 118.3557, lat: 31.0858 },
                { name: '淮北市', lon: 116.6968, lat: 33.6896 },
                { name: '淮南市', lon: 116.7847, lat: 32.7722 },
                { name: '马鞍山市', lon: 118.6304, lat: 31.5363 },
                { name: '铜陵市', lon: 117.9382, lat: 30.9375 }
            ];

            var material = new mars3d.material.LineFlowMaterialProperty({//动画线材质
                color: new Cesium.Color(255 / 255, 201 / 255, 38 / 255, 1),
                duration: 2000, //时长，控制速度
                url: this.path + 'img/textures/lineClr.png'
            });

            for (var i = 0; i < cities.length; i++) {
                var item = cities[i];
                var thisPoint = Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 1);

                var positions = mars3d.polyline.getLinkedPointList(center, thisPoint, 40000, 100);//计算曲线点
                dataSource.entities.add({
                    name: item.name + ' 路线',
                    polyline: {
                        positions: positions,
                        width: 2,
                        material: material
                    }
                });

                dataSource.entities.add({
                    name: item.name,
                    position: thisPoint,
                    point: {
                        pixelSize: 8,
                        color: new Cesium.Color(255 / 255, 201 / 255, 38 / 255, 1)
                    }
                });
            }


            this.dataSource = dataSource;
        }
        //打开激活
        activate() {
            this.viewer.dataSources.add(this.dataSource);
            this.viewer.flyTo(this.dataSource.entities);

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