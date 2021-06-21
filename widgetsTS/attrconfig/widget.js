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
                    position: {
                        "top": 50,
                        "right": 5,
                        "bottom": 5
                    }
                }
            }
        }

        //初始化[仅执行1次]
        create() {

        } 
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result; 
            this.viewWindow.plotEdit.startEditing({});
        }
        //激活插件
        activate() {

        }
        //释放插件
        disable() {
            this.viewWindow = null;

        }
        updateAttr2map(attr) {


        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 