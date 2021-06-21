(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
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
            // var layerId =this.config.layerItem.id  

            //
            opt._dom.children().attr('src', this.path + 'img/heatmap.png');
        }
        //打开激活
        activate() {

        }
        //关闭释放
        disable() {

        }

    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d)