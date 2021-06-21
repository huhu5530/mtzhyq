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
                type: "append",
                url: 'view.html',
                parent: 'body'
            }
        }

        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            var that = this;
            $("#btn_streetscapeBar_close").click(function () {
                that.disableBase();
            });
        }
        //激活插件
        activate() {
            var point = this.config.point || { y: 31.833789, x: 117.183995 };

            this.centerAt(point);
            var point = this.getBaiduPoint(point);

            var inhtml = `<div id="streetscapeView" style="position:absolute;right:0px;top:0px;border:1px solid #ccc;top: 0px;bottom: 0px;width:50%;overflow: hidden;">     
                    <iframe id="streetscape" name="streetscape" style="width:100%;height:100%;overflow:hidden;margin:0;"
                        scrolling="no" frameborder="0" src="${this.path}streetscape.html?x=${point.x}&y=${point.y}"></iframe>
                  </div>`;
            $("body").append(inhtml);

            $("#centerDiv").css({
                position: "",
                height: "100%",
                width: "50%"
            });
            $(".no-print-view").hide();

            //单击地图事件
            this.viewer.mars.on(mars3d.event.click, this.onMapClick, this);
            $('.cesium-viewer').css('cursor', 'crosshair');
        }
        //释放插件
        disable() {
            //释放单击地图事件
            this.viewer.mars.off(mars3d.event.click, this.onMapClick, this);
            $('.cesium-viewer').css('cursor', '');

            if (this.markerXY) {
                this.viewer.entities.remove(this.markerXY);
                this.markerXY = null;
            }
            $("#streetscapeView").remove();

            $("#centerDiv").css({
                position: "",
                height: "100%",
                width: "100%"
            });
            $(".no-print-view").show();
        }
        onMapClick(event) {
            var cartesian = mars3d.point.getCurrentMousePosition(this.viewer.scene, event.position);
            if (cartesian) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);

                var jd = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
                var wd = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
                //var height = Number(cartographic.height.toFixed(1));

                var wgsPoint = this.viewer.mars.point2wgs({ x: jd, y: wd }); //坐标转换为wgs
                jd = wgsPoint.x;
                wd = wgsPoint.y;

                this.centerAt(wgsPoint);

                //点击地图的事件,触发街景改变 
                var point = this.getBaiduPoint({ x: jd, y: wd });
                var streetscapeFrame = document.getElementById('streetscape');
                if (streetscapeFrame && streetscapeFrame.contentWindow.setPosition) {
                    streetscapeFrame.contentWindow.setPosition(point); //根据经纬度坐标展示全景图
                }
            }
        }
        getBaiduPoint(point) {
            var jd = point.x;
            var wd = point.y;

            point = mars3d.pointconvert.wgs2bd([jd, wd]);
            jd = point[0];
            wd = point[1];

            return { x: jd, y: wd };
        }
        centerAt(_latlng) {
            var val = this.viewer.mars.point2map(_latlng); //坐标转换为map一致的坐标系 
            var position = Cesium.Cartesian3.fromDegrees(val.x, val.y);
            if (this.markerXY == null) {
                this.markerXY = this.viewer.entities.add({
                    position: position,
                    billboard: {
                        image: this.path + "img/streetimg.png",
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER ,
                        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND   //CLAMP_TO_GROUND RELATIVE_TO_GROUND
                    }
                });
            }
            else {
                this.markerXY.position = position;
            }
            this.viewer.mars.centerAt({ x: val.x, y: val.y });
        }


    }


    //注册到widget管理器中。
    window.streetscapeWidget = mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 