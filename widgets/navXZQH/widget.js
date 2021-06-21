(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 220,
                    height: 440,
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

        }
        //关闭释放
        disable() {
            this.viewWindow = null;
            this.clearLastRegion();

        }

        //显示行政区划边界 
        clearLastRegion() {
            if (this.last_region != null) {
                this.viewer.dataSources.remove(this.last_region);
                this.last_region = null;
            }
            if (this.last_timetemp) {
                clearTimeout(this.last_timetemp);
                delete this.last_timetemp;
            }
        }
        showRegionExtent(geojson) {
            this.clearLastRegion();

            var that = this;
            var dataSource = Cesium.GeoJsonDataSource.load(geojson, {
                clampToGround: true,
                stroke: Cesium.Color.fromCssColorString("#ffffff"),
                strokeWidth: 2,
                fill: Cesium.Color.fromCssColorString("#ffff00").withAlpha(0.5)
            });
            dataSource.then(function (dataSource) {
                that.viewer.dataSources.add(dataSource);
                that.last_region = dataSource;

                that.viewer.flyTo(dataSource.entities.values, { duration: 2 });
            }).otherwise(function (error) {
                toastr.error(error);
            });


            //定时清除
            // var that = this;
            // this.last_timetemp = setTimeout(function () {
            //     that.clearLastRegion();
            // }, 5000);
        }
        goHome() {
            this.clearLastRegion(); 
            this.viewer.mars.centerAt();
        }

    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 