(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {  
        //初始化[仅执行1次]
        create() {
            var dataSource = new Cesium.CustomDataSource();
 
            //示例 
            dataSource.entities.add({
                name: '动态立体墙',
                wall: {
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        117.154815, 31.853495,
                        117.181255, 31.854257,
                        117.182284, 31.848255,
                        117.184748, 31.840141,
                        117.180557, 31.835556,
                        117.180023, 31.833741,
                        117.166846, 31.833737,
                        117.155531, 31.833151,
                        117.154787, 31.835978,
                        117.151994, 31.839036,
                        117.150691, 31.8416,
                        117.151215, 31.844734,
                        117.154457, 31.848152,
                        117.154815, 31.853495,
                    ]),
                    maximumHeights: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500],
                    minimumHeights: [43.9, 49.4, 38.7, 40, 54, 51, 66.7, 44.6, 41.2, 31.2, 50.1, 53.8, 46.9, 43.9,],
                    material: new mars3d.material.LineFlowMaterialProperty({//动画线材质
                        color: Cesium.Color.fromCssColorString("#00ff00"),
                        duration: 5000, //时长，控制速度
                        url: this.path + 'img/textures/fence.png',
                        repeat: new Cesium.Cartesian2(6, 1),
                        axisY: true,
                    }),
                }
            });


            //示例 
            dataSource.entities.add({
                name: '动态立体墙',
                wall: {
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        117.216321, 31.842863,
                        117.246056, 31.843395,
                        117.246503, 31.818713,
                        117.217114, 31.819745,
                        117.216321, 31.842863,
                    ]),
                    maximumHeights: [500, 500, 500, 500, 500],
                    minimumHeights: [38.9, 44, 34.7, 34.4, 38.9,],
                    material: new mars3d.material.LineFlowMaterialProperty({//动画线材质
                        color: Cesium.Color.CHARTREUSE,
                        duration: 1000, //时长，控制速度
                        url: this.path + 'img/textures/arrow.png',
                        repeat: new Cesium.Cartesian2(30, 1),
                    }),
                }
            });

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