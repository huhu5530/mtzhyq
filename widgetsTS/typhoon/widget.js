(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {

        //外部资源配置
        get resources() {
            return [
                'Typhoon.js'
            ]
        }
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 250,
                    height: 500
                }
            }
        }


        //初始化[仅执行1次]
        create() {
            this.objData = {}
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //打开激活
        activate() {
            this.viewer.clock.multiplier = 2000;
        }
        //关闭释放
        disable() {
            this.viewWindow = null;
            this.clearData();
            this.viewer.clock.multiplier = 1;
        }
        clearData() {
            for (var key in this.objData) {
                this.objData[key].destroy();
            }
            this.objData = {};
        }
        queryData(param, callback) {
            this.clearData();

            var that = this;

            //改为从后台去获取数据
            $.getJSON(this.path + "data/getTyphoon.json", function (result) {
                var arrdata = result.data;

                for (var i = 0; i < arrdata.length; i++) {
                    var item = arrdata[i];

                    var typhoon = new Typhoon(viewer, item);
                    that.objData[item.tfid] = typhoon;
                }

                callback(arrdata);
            });


        }
        showItem(tfid) {
            if (this.lastTyphoon) {
                this.lastTyphoon.show = false;
                this.lastTyphoon = null;
            }

            var typhoon = this.objData[tfid];
            if (typhoon == null) return;

            typhoon.show = true;
            this.lastTyphoon = typhoon;
        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 