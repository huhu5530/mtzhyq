
(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //初始化[仅执行1次]
        create() {
            //对应的模型，实际项目中可以注释，一直打开模型
            // this.layerWork = this.viewer.mars.getLayer(203012, 'id');

            //添加参考三维模型  
            this.layerWork = mars3d.layer.createLayer(viewer, {
                "type": "3dtiles",
                "url": "http://127.0.0.1:5503/data/export_zgc_all/tileset.json",
                "offset": { "z": 155.5 },
                "visible": true
            });

            this.layerWorkDT = mars3d.layer.createLayer(viewer, {
                "type": "3dtiles",
                "url": "http://127.0.0.1:5503/data/export_zgc_all/lab_a_0_0_0.json",
                "classificationType": Cesium.ClassificationType.CESIUM_3D_TILE,
                "style": {
                    "color": "rgba(255, 255, 255, 0.5)"
                },
                "showMoveFeature": true,
                "moveFeatureColor": "rgba(0, 255, 0, 0.5)",
                "popup": "all",

                "visible": true
            });

        }
        //打开激活
        activate() {

            if (this.layerWork) {
                this.layerWork.visible = true;
            }
            if (this.layerWorkDT) {
                this.layerWorkDT.visible = true;
            }
        }
        //关闭释放
        disable() {


            if (this.layerWork) {
                this.layerWork.visible = false;
            }
            if (this.layerWorkDT) {
                this.layerWorkDT.visible = false;
            }

        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 