(function (window, mars3d) {

    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //外部资源配置
        get resources() {
            return [
                'map.css'
            ]
        }

        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 300,
                    height: 400
                }
            }
        }
        //初始化[仅执行1次]
        create() {
            this.storageName = "marsgis_addmarker"
            this.editable = true

            this.drawControl = new mars3d.Draw({
                viewer: this.viewer,
                hasEdit: false,
            });

            //事件监听  
            var that = this;
            this.drawControl.on(mars3d.Draw.event.drawCreated, function (e) {
                var entity = e.entity;
                if (entity == null || entity.position == null) return;

                entity.attribute.attr = entity.attribute.attr || {};
                entity.attribute.attr.id = "0";
                entity.attribute.attr.name = "我的标记";

                that.saveEntity(entity, function () {
                    that.bindPopup(entity);
                    that.viewer.mars.popup.show(entity);
                });
            });
            this.drawControl.on(mars3d.Draw.event.editMovePoint, function (e) {//编辑修改了点
                var entity = e.entity;

                that.saveEntity(entity);
            });
            this.drawControl.on(mars3d.Draw.event.delete, function (e) {
                that.deleteEditFeature(e.entity);//保存数据 
            });


            this.getList();
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //激活插件
        activate() {
            this.hasEdit(true);
        }
        //释放插件
        disable() {
            this.viewWindow = null;
            this.stopDraw();
            this.hasEdit(false);
        }
        stopDraw() {
            this.drawControl.stopDraw();
        }
        //配置的样式
        getStyle(name) {
            return {
                scale: 1,
                image: this.path + "img/marker.png",
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1, 8.0e6, 0.2),
                label: {
                    text: name || "我的标记",
                    font: "normal small-caps normal 19px 楷体",
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 3,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -50),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
                }
            }
        }
        drawPoint() {
            this.stopDraw();
            this.drawControl.startDraw({
                type: "billboard",
                style: this.getStyle()
            });
        }
        hasEdit(val) {
            this.editable = val;
            this.drawControl.hasEdit(val);
        }
        //========================   
        bindPopup(entity) {
            var that = this;
            entity.popup = {
                html: function (entity) {
                    var html = mars3d.util.getPopup([
                        { "field": "name", "name": "名称", },
                        { "field": "remark", "name": "备注", "type": "textarea" },
                        that.editable ? { "field": "id", "name": "确定", "type": "button" } : null
                    ], entity.attribute.attr, { title: "我的标记", edit: that.editable, width: 190 });

                    return html;
                },
                onAdd: function (eleId, entity) {   //popup的DOM添加到页面的回调方法 
                    $("#" + eleId + " .mars3d-popup-btn").click(function (e) {
                        $("#" + eleId + " .mars3d-popup-edititem").each(function () {
                            var val = $(this).val();
                            var key = $(this).attr("data-type");
                            entity.attribute.attr[key] = val;
                        });
                        that.saveEditFeature(entity);
                    });
                },
                onRemove: function (eleId, entity) {   //popup的DOM从页面移除的回调方法 

                },
                anchor: [0, -35]
            };
        }
        saveEditFeature(entity) {
            this.viewer.mars.popup.close();
            entity.label.text = entity.attribute.attr.name;

            this.saveEntity(entity);
        }
        deleteEditFeature(entity) {
            var id = entity.attribute.attr.id;

            this.viewer.mars.popup.close();
            this.viewWindow.refMarkerList();

            //服务端存储 
            if (window.hasServer) {
                sendAjax({
                    url: 'map/mark/' + id,
                    type: "delete",
                    success: function (data) {
                    }
                });
            }
            else {//浏览器本地存储 
                var storagedata = this.getJsonData();
                haoutil.storage.add(this.storageName, storagedata);
            }
        }
        getMarkerDataList() {
            var arr = [];
            var arrEntity = this.drawControl.getEntitys();
            for (var i = 0, len = arrEntity.length; i < len; i++) {
                if (!arrEntity[i].attribute.attr.name) arrEntity[i].attribute.attr.name = "我的标记";
                arr.push(arrEntity[i].attribute.attr);
            }
            return arr;
        }
        centerAt(id) {
            var entity = this.drawControl.getEntityById(id);
            if (entity) {
                //参数解释：点数据：radius控制视距距离
                this.viewer.mars.flyTo(entity, { radius: 2500 });
            }
        }
        deleteAll() {
            this.drawControl.deleteAll();
            this.viewer.mars.popup.close();

            if (this.viewWindow)
                this.viewWindow.refMarkerList();

            //服务端存储 
            if (window.hasServer && userId) {
                sendAjax({
                    url: 'map/mark/del/' + userId,
                    type: "delete",
                    dataType: "json",
                    success: function (data) {
                    }
                });
            }
            else {//浏览器本地存储 
                //本地存储
                haoutil.storage.del(this.storageName);
            }
        }
        getJsonData() {
            var arr = [];
            var arrEntity = this.drawControl.getEntitys();
            for (var i = 0, len = arrEntity.length; i < len; i++) {
                var entity = arrEntity[i];
                var attr = entity.attribute.attr;
                var coord = mars3d.draw.attr.billboard.getCoordinates(entity);

                var item = {
                    id: attr.id,
                    name: attr.name,
                    remark: attr.remark,
                    x: coord[0][0],
                    y: coord[0][1],
                    z: coord[0][2]
                };
                arr.push(item);
            }
            return JSON.stringify(arr);
        }
        jsonToLayer(arr, isclear) {
            if (arr == null || arr.length == 0) return;
            if (isclear) {
                this.drawControl.deleteAll();
            }

            var arrEntity = [];
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                if (!item.x || !item.y) continue;

                if (!isclear) { //叠加时，清除已有同id数据
                    var entity = this.drawControl.getEntityById(item.id);
                    this.drawControl.deleteEntity(entity);
                }

                //geojson格式标准数据
                var feature = {
                    type: "Feature",
                    properties: {
                        style: this.getStyle(item.name),
                        attr: {
                            id: item.id || "",
                            name: item.name || "",
                            remark: item.remark || ""
                        }
                    },
                    geometry: { type: "Point", coordinates: [item.x, item.y, item.z] }
                };
                var entity = this.drawControl.addFeature('billboard', feature);
                this.bindPopup(entity);
                arrEntity.push(entity);
            }

            this.viewer.flyTo(arrEntity, { duration: 2.0 });

            if (this.viewWindow)
                this.viewWindow.refMarkerList();
        }
        getList() {
            var that = this;

            //读取服务端存储 
            if (window.hasServer) {
                var that = this;
                sendAjax({
                    url: 'map/mark/list',
                    type: 'get',
                    success: function (arr) {
                        that.jsonToLayer(arr, true);
                    }
                });
            }
            else {//读取本地存储
                var laststorage = haoutil.storage.get(this.storageName); //读取localStorage值  
                if (laststorage != null && laststorage != 'null') {

                    var arr = JSON.parse(laststorage);
                    this.jsonToLayer(arr, true);
                }
            }
        }
        saveEntity(entity, endfun) {
            //服务端存储 
            if (window.hasServer) {
                var attr = entity.attribute.attr;
                var coord = mars3d.draw.attr.billboard.getCoordinates(entity);
                var that = this;
                if (attr.id == "0") {//新增
                    sendAjax({
                        url: 'map/mark/add',
                        data: JSON.stringify({
                            name: attr.name,
                            remark: attr.remark,
                            x: coord[0][0],
                            y: coord[0][1],
                            z: coord[0][2]
                        }),
                        type: 'post',
                        contentType: "application/json",
                        success: function (data) {
                            entity.attribute.attr.id = data.id;
                            if (endfun) endfun();
                            that.viewWindow.refMarkerList();
                        }
                    });
                } else {//修改
                    sendAjax({
                        url: 'map/mark/update',
                        data: JSON.stringify({
                            id: attr.id,
                            name: attr.name,
                            remark: attr.remark,
                            x: coord[0][0],
                            y: coord[0][1],
                            z: coord[0][2],
                        }),
                        type: 'post',
                        contentType: "application/json",
                        success: function (data) {
                            if (endfun) endfun();
                            that.viewWindow.refMarkerList();
                        }
                    });
                }

            }
            else {//浏览器本地存储
                if (entity.attribute.attr.id == "0")
                    entity.attribute.attr.id = (new Date()).format("yyyyMMddHHmmss");

                var storagedata = this.getJsonData();
                haoutil.storage.add(this.storageName, storagedata);

                if (endfun) endfun();
                this.viewWindow.refMarkerList();
            }

        }

    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d)

