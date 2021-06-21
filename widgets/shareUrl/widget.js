(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "divwindow",
                url: "view.html",
                windowOptions: {
                    width: 700,
                    height: 110
                }
            }
        }

        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.updateUrl();
        }
        //激活插件
        activate() {
 
            //相机移动结束事件
            this.viewer.scene.camera.moveEnd.addEventListener(this.camera_moveEndHandler, this);
        }
        //释放插件
        disable() {
            this.viewWindow = null;
            //相机移动结束事件
            this.viewer.scene.camera.moveEnd.removeEventListener(this.camera_moveEndHandler, this);

        }
        updateUrl(url) {
            $("#txtUrl").val(this.getUrl());

            $("#txtUrl").focus();
            $("#txtUrl").select();
        }
        camera_moveEndHandler() {
            this.updateUrl();
        }
        getUrl() {
            var bookmark = mars3d.point.getCameraView(this.viewer, true);


            var lasturl = window.location.href;
            if (lasturl.lastIndexOf('#') != -1) {
                lasturl = lasturl.replace(window.location.hash, "").replace("#", "");
            }
            var idx = lasturl.lastIndexOf('?');
            if (idx != -1) {
                lasturl = lasturl.substring(0, idx);
            }

            var url = lasturl + "?x=" + bookmark.x
                + "&y=" + bookmark.y
                + "&z=" + bookmark.z
                + "&heading=" + bookmark.heading
                + "&pitch=" + bookmark.pitch
                + "&roll=" + bookmark.roll;

            var req = haoutil.system.getRequest();
            for (var key in req) {
                if (key == "x" || key == "y" || key == "z" || key == "heading" || key == "pitch" || key == "roll") continue;
                url += "&" + key + "=" + req[key];
            }
            return url;
        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 