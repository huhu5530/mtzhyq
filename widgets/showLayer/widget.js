(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {

        //初始化[仅执行1次]
        create() {
            if (this.config.layerId)
                this.layerWork = this.viewer.mars.getLayer(this.config.layerId, 'id');
            else
                this.layerWork = this.viewer.mars.getLayer(this.config.name, 'name');
        }
        //打开激活
        activate() {
            if (this.layerWork == null) return;

            this.lastVisible = this.layerWork._visible;
            if (!this.lastVisible)
                this.layerWork.visible = true;
            this.layerWork.centerAt();
        }
        //关闭释放
        disable() {
            if (this.layerWork && !this.lastVisible)
                this.layerWork.visible = false;
        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 