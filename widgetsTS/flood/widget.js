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
                    height: 270
                }
            }
        }
        //初始化[仅执行1次]
        create() {
            this.drawControl = new mars3d.Draw({
                viewer: this.viewer,
                hasEdit: false
            });
            this.floodControl = new mars3d.analysi.FloodByEntity({
                viewer: viewer
            });
            this.floodControl.on(mars3d.analysi.FloodByEntity.event.change, (e) => {//分析中，高度变化了 
                if (this.viewWindow)
                    this.viewWindow.onChangeHeight(e.height)
            })
            this.floodControl.on(mars3d.analysi.FloodByEntity.event.end, (e) => {//结束分析 
                if (this.viewWindow)
                    this.viewWindow.onStop()
            })
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
            this.clear();
        }
        drawPolygon() {
            var that = this;
            this.clear();

            this.drawControl.startDraw({
                type: "polygon",
                style: {
                    color: "#007be6",
                    opacity: 0.5,
                    perPositionHeight: true,
                    outline: false
                },
                success: function (entity) { //绘制成功后回调
                    that.drawOk(entity);
                }
            });
        }
        drawOk(entity) {
            if (this.viewWindow == null) return;

            this.entity = entity;

            //求最大、最小高度值  
            var positions = this.drawControl.getPositions(entity);
            var result = mars3d.polygon.getHeightRange(positions, viewer.scene);
            this.viewWindow.updateHeightForDraw(result.minHeight, result.maxHeight);
        }

        startFx(params) {
            if (this.entity == null) {
                haoutil.msg('请首先绘制分析区域！');
                return false;
            }

            this.floodControl.start(this.entity, params);
            return true;
        }
        clear() {
            this.floodControl.clear();

            this.drawControl.deleteAll();
            this.entity = null;
        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d)


