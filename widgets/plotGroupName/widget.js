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
            return {
                type: "divwindow",
                url: "view.html",
                windowOptions: {
                    width: 250,
                    height: 100
                }
            }
        }


        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            var that = this;

            $("#txt_editName").val(this.config.data || "");

            $("#btnEditNameOK").click(function () {
                var name = $.trim($("#txt_editName").val());
                if (that.config.checkName) {
                    var res = that.config.checkName(name);
                    if (res) {
                        haoutil.msg("存在同名分组，请修改");
                        return
                    }
                }

                that.config.callback(name);
                that.disableBase();
            });
        }
        //激活插件
        activate() {

        }
        //释放插件
        disable() {


        }


    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 