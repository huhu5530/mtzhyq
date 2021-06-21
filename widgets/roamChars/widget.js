(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 500,
                    height: 200
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
            this.data = this.config.data;
            this.viewWindow.setEchartsData(this.data);
        }
        //关闭释放
        disable() {
            this.viewWindow = null;
            this.data = null;
        }
        //内置方法，不重启方式刷新页面
        update() {
            this.data = this.config.data;
            this.viewWindow.setEchartsData(this.data);
        }
        changeFlyOk(len) {
            if (this.data) {
                this.data.thislen = len;
            }
        }

    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 