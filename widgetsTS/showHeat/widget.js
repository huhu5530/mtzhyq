(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //外部资源配置
        get resources() {
            return [
                './lib/cesiumjs/plugins/heatmap/heatmap.min.js',
                './lib/cesiumjs/plugins/heatmap/HeatmapImageryProvider.js'
            ]
        }
        //弹窗配置
        get view() {
            return {
                type: "append",
                url: "view.html"
            }
        }


        //初始化[仅执行1次]
        create() {


        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            //此处可以绑定页面dom事件 

            opt._dom.children().attr('src', this.path + 'img/heatmap-tuli.png');
        }
        //打开激活
        activate() {
            var that = this;
            $.getJSON("http://data.marsgis.cn/file/apidemo/heat.json", function (data) {
                if (data.Code != 0) {
                    haoutil.msg(data.Msg);
                    return;
                }
                that.addData(data.Data);
            });

        }
        addData(arrdata) {

            var heatLayer = new mars3d.HeatmapImageryProvider({
                //min: min, max: max, //可自定义热力值范围，默认为数据中的最大最小值
                data: arrdata,
                heatmapoptions: {//参阅api：https://www.patrick-wied.at/static/heatmapjs/docs.html
                    radius: 180,
                    minOpacity: 0.2,
                    xField: 'X',
                    yField: 'Y',
                    valueField: 'Count'
                }
            });
            this.layer = this.viewer.imageryLayers.addImageryProvider(heatLayer);

            viewer.camera.flyTo({
                destination: heatLayer.rectangle,
            });
        }
        //关闭释放
        disable() {
            if (this.layer) {
                this.viewer.imageryLayers.remove(this.layer);
                this.layer = null;
            }

        }


    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 