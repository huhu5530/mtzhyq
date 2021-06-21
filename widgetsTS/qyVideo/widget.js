(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {


        //弹窗配置
        get view() {
            return {
                type: "divwindow",
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

            $("#qyVideo").attr('src', this.config.filename);
        }
        //打开激活
        activate() {
            $(".layer-mars-dialog .layui-layer-title").css({
                "background": "rgb(0, 0, 0)",
                "border-color": "#000000",
                //"height": 0
            });
        }
        //关闭释放
        disable() {


        }
        getData() {
            return this.config.filename;
        }
        shoData(filename) {
            this.config.filename = filename;
            $("#qyVideo").attr('src', this.config.filename);
        }


    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 