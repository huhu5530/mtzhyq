(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //外部资源配置
        get resources() {
            return [
                'view.css'
            ]
        }

        //弹窗配置
        get view() {
            return { type: "append", url: "view.html" }
        }


        //初始化[仅执行1次]
        create() {

        }
        winCreateOK(opt, result) {
            var that = this;
            $("#btn_print_expimg").click(function () {
                that.expImg();
            });
            $("#btn_print_start").click(function () {
                that.printview();
            });
            $("#btn_print_close").click(function () {
                that.disableBase();
            });
        }
        //激活插件
        activate() {
            //隐藏div 
            $(".no-print-view").hide();

            $(".cesium-viewer-toolbar").hide();
            $(".cesium-viewer-fullscreenContainer").hide();

        }
        //释放插件
        disable() {
            //还原显示div 
            $(".no-print-view").show();

            $(".cesium-viewer-toolbar").show();
            $(".cesium-viewer-fullscreenContainer").show();
        }
        printview() {
            window.print();
        }
        expImg() {
            haoutil.loading.show();
            viewer.mars.expImage();
            haoutil.loading.hide();
        }
 
    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 