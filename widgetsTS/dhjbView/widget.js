(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //外部资源配置
        get resources() {
            return [
                "./lib/jstree/themes/default-dark/style.css",
                "./lib/jstree/jstree.min.js",
                'view.css',
                "dhjb/globe.js",
                "dhjb/JB.js",
                "dhjb/work.js",
            ]
        }
        //弹窗配置
        get view() {
            return {
                type: "divwindow",
                url: "view.html",
                windowOptions: {
                    width: 250
                }
            }
        }

        //初始化[仅执行1次]
        create() {
            var that = this
            document.addEventListener('keydown', function (e) {
                if (!that.isActivate) return;

                switch (e.keyCode) {
                    case '1'.charCodeAt(0): //播放、暂停切换
                        if (dataWork._isStart)
                            $("#btn_pause").click();
                        else
                            $("#btn_proceed").click();
                        break;
                    case '2'.charCodeAt(0): //停止
                        $("#btn_stop").click();
                        break;
                    case '3'.charCodeAt(0)://绑定和解绑键盘(控制器)控制
                        var result = viewer.mars.keyboardAuto({
                            speedRatio: 150,    //平移步长，值越大步长越小。
                            dirStep: 25,        //相机原地旋转步长，值越大步长越小。
                            rotateStep: 1.0,    //相机围绕目标点旋转速率，0.3 - 2.0
                            minPitch: 0.1,      //最小仰角  0 - 1
                            maxPitch: 0.95,     //最大仰角  0 - 1
                        });

                        if (result)
                            haoutil.msg("已开启键盘控制");
                        else
                            haoutil.msg("已关闭键盘控制，您可以鼠标进行操作了！");

                        break;
                }

            }, false);
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            //此处可以绑定页面dom事件
            $("#btn_start").click(function () {
                dataWork.start();
            });

            $("#btn_pause").click(function () {
                dataWork.pause();
            });

            $("#btn_proceed").click(function () {
                dataWork.proceed();
            });

            $("#btn_stop").click(function () {
                dataWork.stop();
            });

            initEditorJS();
        }
        //激活插件
        activate() {

        }
        //释放插件
        disable() {
            dataWork.stop();
        } 
    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d)

