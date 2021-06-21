(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 250,
                    height: 300
                }
            }
        }


        //初始化[仅执行1次]
        create() {

        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //打开激活
        activate() {

        }
        //关闭释放
        disable() {
            this.viewWindow = null;


        }
        getData() {
            var item = this.config.dataQy;//传入过来的参数 
            return item;
        }
        //打开视频监控
        showSPJK() {
            var item = this.config.dataQy;
            if (item === null) return;

            var filename = 'http://data.marsgis.cn/video/lukou.mp4';

            var jkWidgetUri = 'widgetsTS/qyVideo/widget.js';
            var roamingJK = mars3d.widget.getClass(jkWidgetUri);
            if (roamingJK && roamingJK.isActivate) {
                roamingJK.shoData(filename);
            }
            else {
                mars3d.widget.activate({
                    uri: jkWidgetUri,
                    filename: filename
                });
            }

        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 