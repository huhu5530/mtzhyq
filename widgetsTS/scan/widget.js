(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 280,
                    height: 120
                }
            }
        }

        //初始化[仅执行1次]
        create() {
            this.layerWork = this.viewer.mars.getLayer(204012, 'id');

        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //打开激活
        activate() {
            viewer.mars.centerAt({ "y": 31.277358, "x": 121.464477, "z": 3826.53, "heading": 158.8, "pitch": -34.5, "roll": 0.1 });

            if (this.layerWork) {
                this.lastVisible = this.layerWork._visible;
                if (!this.lastVisible)
                    this.layerWork.visible = true;
            } 

            this.showCircleScan()

        }
        showRadarScan() {
            this.clear();

            //扫描效果 
            var rotation = 0;
            this.entity2 = this.viewer.entities.add({
                position: new Cesium.Cartesian3.fromDegrees(121.502919, 31.240169),
                ellipse: {
                    semiMinorAxis: 1000.0,
                    semiMajorAxis: 1000.0,
                    material: new mars3d.material.CircleScanMaterialProperty({//扫描材质
                        url: "img/textures/circleScan.png",
                        color: Cesium.Color.fromCssColorString("#5fc4ee")
                    }),
                    stRotation: new Cesium.CallbackProperty(function () {
                        rotation -= 0.1;
                        return rotation;
                    }, false),
                    classificationType: Cesium.ClassificationType.BOTH
                }
            });
        }
        showCircleScan() {
            this.clear();

            //扩散效果
            this.entity1 = this.viewer.entities.add({
                position: new Cesium.Cartesian3.fromDegrees(121.47118, 31.230396),
                ellipse: {
                    semiMinorAxis: 1000.0,
                    semiMajorAxis: 1000.0,
                    material: new mars3d.material.CircleWaveMaterialProperty({//多个圆圈
                        duration: 4000,//动画时长，单位：毫秒
                        color: Cesium.Color.fromCssColorString("#5fc4ee"),
                        gradient: 0,
                        count: 1
                    }),
                    classificationType: Cesium.ClassificationType.BOTH,
                    zIndex: 999
                }
            });
        }
        clear() {

            if (this.entity1) {
                this.viewer.entities.remove(this.entity1)
                delete this.entity1
            }

            if (this.entity2) {
                this.viewer.entities.remove(this.entity2)
                delete this.entity2
            }
        }
        //关闭释放
        disable() {
            this.clear();
            this.viewWindow = null;
            if (this.layerWork && !this.lastVisible)
                this.layerWork.visible = false;


        }


    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 