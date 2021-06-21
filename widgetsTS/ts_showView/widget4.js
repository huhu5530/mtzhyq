(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view4.html",
                windowOptions: {
                    width: 500,
                    height: 380,
                }
            }
        }

        //初始化[仅执行1次]
        create() {
            var item = {
                "name": "县界",
                "type": "arcgis_dynamic",
                "url": "http://data.marsgis.cn/arcgis/rest/services/mars/hefei/MapServer",
                "layers": "40",
                "center": { "y": 31.814176, "x": 117.225362, "z": 5105.3, "heading": 359.2, "pitch": -83.1, "roll": 360 },
                "popup": "all"
            };

            this.layerWork = mars3d.layer.createLayer(this.viewer, item);
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //打开激活 
        activate() {
            this.layerWork.visible = true
            this.layerWork.centerAt();
        }
        //关闭释放
        disable() {
            this.layerWork.visible = false;
        }




    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d)  