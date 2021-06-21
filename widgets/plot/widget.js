(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //外部资源配置
        get resources() {
            return [
                //字体标号使用到的div转img库，无此标号时可以删除 
                "./lib/dom2img/dom-to-image.js",
            ]
        }

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
        get serverURL() {
            return "http://data.marsgis.cn";
        }
        get gltfServerURL() {
            return "http://data.marsgis.cn/gltf"
        }
        //初始化[仅执行1次]
        create() {
            this.storageName = "marsgis_plot"

            this.drawControl = new mars3d.Draw({
                viewer: this.viewer,
                hasEdit: false,
                popup: {
                    enable: false,
                    edit: true,
                    title: "属性编辑",
                    columns: [
                        { "field": "name", "name": "名称", },
                        { "field": "address", "name": "地址", },
                        { "field": "phone", "name": "电话", },
                        { "field": "remark", "name": "备注", "type": "textarea" },
                    ]
                }
            });

            var that = this;

            //事件监听  
            this.drawControl.on(mars3d.Draw.event.drawCreated, function (e) {
                var entity = e.entity;
                that.startEditing(entity);
            });
            //模型加载完成后事件
            this.drawControl.on(mars3d.Draw.event.load, function (e) {
                //console.log('gltf模型加载完成'); 
                haoutil.loading.hide();
            });
            this.drawControl.on(mars3d.Draw.event.editStart, function (e) {
                var entity = e.entity;
                that.startEditing(entity);
            });
            this.drawControl.on(mars3d.Draw.event.editMovePoint, function (e) {
                var entity = e.entity;
                that.startEditing(entity);
            });
            this.drawControl.on(mars3d.Draw.event.editRemovePoint, function (e) {
                var entity = e.entity;
                that.startEditing(entity);
            });
            this.drawControl.on(mars3d.Draw.event.editStop, function (e) {
                var entity = e.entity;
                that.stopEditing(entity);

                that.sendSaveEntity(entity); //保存数据
                that.showLayerTree();
            });

            this.drawControl.on(mars3d.Draw.event.delete, function (e) {
                that.sendDeleteEntity(e.entity);//保存数据
                that.showLayerTree();
            });


            //添加到图层控制  
            if (window.bindToLayerControl) {
                this.layerWork = bindToLayerControl({
                    pid: 0,
                    name: '标绘',
                    visible: true,
                    onAdd: function () { //显示回调 
                        that.drawControl.setVisible(true);
                    },
                    onRemove: function () { //隐藏回调 
                        that.drawControl.setVisible(false);
                    },
                    onCenterAt: function (duration) { //定位回调
                        var arr = that.drawControl.getEntitys();
                        that.viewer.flyTo(arr, {
                            duration: duration
                        });
                    },
                    compare: {//"分屏对比" 中使用, 回覆盖上面方法
                        onCreate: function (viewerEx) {
                            //viewerEx为分屏中另外一个屏的地球回调 ，add时不能讲当前viewer的对象直接添加到viewerEx，需要新构造
                            this.drawControlEx = new mars3d.Draw({
                                viewer: viewerEx,
                                hasEdit: false,
                            })
                        },
                        onAdd: function (viewerEx) { //显示回调 
                            //viewerEx为分屏中另外一个屏的地球回调
                            this.drawControlEx.loadJson(that.getGeoJson()); //新构造数据，不能直接add到新viewerEx
                            this.drawControlEx.setVisible(true);
                        },
                        onRemove: function (viewerEx) { //隐藏回调  
                            this.drawControlEx.setVisible(false);
                        },
                    },
                });
            }

            this.sendGetList();
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //激活插件
        activate() {
            this.drawControl.hasEdit(true);
        }
        //释放插件
        disable() {
            this.stopEditing();

            this.viewWindow = null;
            this.drawControl.stopDraw();
            this.drawControl.hasEdit(false);
            //this.deleteAll();  

            //从图层控制中 移除
            //  if(this.layerWork){
            //     unbindLayerControl(this.layerWork);
            // }
        }
        getDefStyle(type) {
            return mars3d.draw.attr.getDefStyle(type)
        }
        hasEdit(val) {
            this.drawControl.hasEdit(val);
        }
        hasPopup(val) {
            this.drawControl.popup.enable = val
        }
        //开始标记
        startDraw(defval) {
            haoutil.loading.hide();
            switch (defval.type) {
                case "model"://小模型
                    defval.drawShow = true;//模型点状对象绘制时，是否显示本身对象，可避免在3dtiles上拾取坐标存在问题。
                    haoutil.loading.show();//LoadEnd后关闭
                    break;
                case "point":
                case "font-point":
                case "billboard":
                    defval.drawShow = true;//模型点状对象绘制时，是否显示本身对象，可避免在3dtiles上拾取坐标存在问题。
                    break;
            }

            // console.log(JSON.stringify(defval));
            this.drawControl.startDraw(defval);
        }
        //结束绘制、等同双击完成绘制，比如手机端无法双击结束
        endDraw() {
            this.drawControl.endDraw();
        }
        startEditingById(id) {
            var entity = this.drawControl.getEntityById(id);
            if (entity == null) return;
            this.viewer.mars.flyTo(entity);
            this.drawControl.startEditing(entity);
        }
        startEditing(entity) {
            var that = this;
            if (this.viewWindow == null) return;
            var lonlats = this.drawControl.getCoordinates(entity);

            clearTimeout(this.timeTik);

            var plotAttr = mars3d.widget.getClass('widgets/plotAttr/widget.js');
            if (plotAttr && plotAttr.isActivate) {
                plotAttr.startEditing(entity, lonlats);
            }
            else {
                mars3d.widget.activate({
                    uri: 'widgets/plotAttr/widget.js',
                    entity: entity,
                    lonlats: lonlats,
                    deleteEntity: function (entity) {
                        that.deleteEntity(entity);
                    },
                    updateAttr: function (attr) {
                        that.updateAttr2map(attr);
                    },
                    updateGeo: function (positions) {
                        that.updateGeo2map(positions);
                    },
                    centerAt: function (entity) {
                        that.centerAt(entity);
                    },
                });
            }
        }
        stopEditing() {
            this.timeTik = setTimeout(function () {
                mars3d.widget.disable('widgets/plotAttr/widget.js');
            }, 200);
        }
        //更新图上的属性
        updateAttr2map(attr) {
            this.drawControl.updateAttribute(attr);
        }
        //更新图上的几何形状、坐标等
        updateGeo2map(positions) {
            this.drawControl.setPositions(positions); //更新当前编辑的entity
            return positions;
        }
        centerAt(entity) {
            //参数解释：线面数据：scale控制边界的放大比例，点数据：radius控制视距距离
            this.viewer.mars.flyTo(entity, { scale: 0.5, radius: 1000 });
        }
        //文件处理
        getGeoJson(target) {
            return this.drawControl.toGeoJSON(target);
        }
        downloadJson(filename, target) {
            var data = this.getGeoJson(target);
            if (data == null || (data.features && data.features.length == 0)) {
                haoutil.msg("当前未标绘任何数据！");
            }
            else {
                var timestr = (new Date()).format("MMddHHmmss")
                haoutil.file.downloadFile(filename + "_" + timestr + ".json", JSON.stringify(data));
            }
        }
        loadJson(json, isClear, isFly) {
            if (json == null) return;

            var arr = this.drawControl.loadJson(json, {
                clear: isClear,
                flyTo: isFly
            });

            this.showLayerTree();
            return arr
        }
        deleteAll() {
            this.drawControl.deleteAll();
            this.sendDeleteAll();

            this.showLayerTree();
        }
        deleteEntity(entity) {
            var entity = entity || this.drawControl.getCurrentEntity();
            if (entity == null) return;

            this.drawControl.deleteEntity(entity);
        }
        //搜索
        query(text, maxcount) {
            var arrEntity = this.drawControl.getEntitys();

            var arr = [];
            var counts = 0;
            for (var i = 0; i < arrEntity.length; i++) {
                var entity = arrEntity[i];

                var name;
                if (entity.attribute.type === "label") {
                    name = entity.attribute.style.text;
                } else if (entity.attribute.attr) {
                    name = entity.attribute.attr.name;
                }

                if (name == null || name.indexOf(text) == -1) continue;

                arr.push({
                    name: name,
                    type: '标绘 - ' + entity.attribute.name,
                    _datatype: 'plot',
                    _entity: entity
                });

                if (maxcount) {
                    counts++;
                    if (counts > maxcount) break;
                }
            }
            return arr;
        }
        // //弹窗属性编辑处理
        // last_window_param: null,
        // showEditAttrWindow (param) {
        //     this.last_window_param = param;

        //     //layer.open({
        //     //    type: 2,
        //     //    title: '选择数据',
        //     //    fix: true,
        //     //    shadeClose: false,
        //     //    maxmin: true,
        //     //    area: ["100%", "100%"],
        //     //    content: "test.html?name=" + param.attrName + "&value=" + param.attrVal,
        //     //    skin: "layer-mars-dialog animation-scale-up",
        //     //    success: function (layero) {

        //     //    }
        //     //});
        // }
        // saveWindowEdit (attrVal) {
        //     this.viewWindow.plotEdit.updateAttr(this.last_window_param.parname, this.last_window_param.attrName, attrVal);
        //     layer.close(layer.index);
        // }

        //分组树相关方法
        showLayerTree() {
            if (!this.viewWindow) return
            this.viewWindow.treeWork.loadData(this.drawControl.dataSources);
        }
        checkRemoveGroup(layer) {
            if (this.drawControl.dataSources.length < 2) {
                haoutil.msg("不能删除所有图层，需要至少保留1个图层！");
                return false
            }
            return true
        }
        removeGroup(layer) {
            var result = this.drawControl.removeGroup(layer);
            if (result) {
                this.showLayerTree();
                haoutil.msg("删除成功！");
                return true
            } else {
                haoutil.msg("删除失败！");
                return false
            }
        }
        //删除所有非空数组
        removeNullGroup(layer) {
            if (this.drawControl.dataSources.length < 2) {
                haoutil.msg("不能删除所有图层，需要至少保留1个图层！");
                return
            }
            this.drawControl.removeNullGroup();
            this.showLayerTree();
        }
        editGroupName(layer) {
            mars3d.widget.activate({
                uri: 'widgets/plotGroupName/widget.js',
                name: layer ? "重命名分组" : "新增分组",
                data: layer ? layer.name : "",
                checkName: (newname) => {
                    //校验分组是否有同名的  
                    return this.drawControl.checkGroupName(newname, layer);
                },
                callback: (newname) => {
                    console.log(newname);

                    if (layer) {//修改
                        layer.name = newname
                    }
                    else {//新增
                        this.drawControl.addGroup(newname);
                    }
                    this.showLayerTree();
                },
            });
        }
        activateGroup(layer) {
            this.drawControl.activateGroup(layer);
            this.showLayerTree();
        }
        moveEntityGroup(entity, group) {
            this.drawControl.moveEntityGroup(entity, group);
        }

        //数据保存及加载处理
        sendGetList() {
            var that = this;
            if (window.hasServer) {
                //读取后台存储
                sendAjax({
                    url: 'map/plot/list',
                    type: 'get',
                    success: function (arr) {
                        var arrjson = [];
                        for (var i = 0; i < arr.length; i++) {
                            var geojson = JSON.parse(arr[i].geojson);
                            geojson.properties.attr.id = arr[i].id;
                            arrjson.push(geojson);
                        }
                        that.loadJson({ type: "FeatureCollection", features: arrjson }, true, true);
                    }
                });
            } else {
                //读取本地存储
                var laststorage = haoutil.storage.get(this.storageName); //读取localStorage值  
                if (laststorage == null || laststorage == 'null') {
                    //实际系统时可以注释下面代码，该代码是在线加载演示数据
                    if (location.hostname != "127.0.0.1" && location.hostname != "localhost") {
                        $.getJSON("http://data.marsgis.cn/file/geojson/draw-demo.json", function (result) {
                            if (!that.isActivate) return;
                            that.loadJson(result, true, true);
                        });
                    }

                } else {
                    var json = JSON.parse(laststorage);
                    that.loadJson(json, true, true);
                }
            }
        }
        sendSaveEntity(entity) {
            if (this.viewWindow == null) return;
            if (this.isOnDraw) {
                this.isOnDraw = false;
                return;
            }

            console.log("plot: 保存了数据")

            if (window.hasServer) {
                entity.attribute.attr = entity.attribute.attr || {};
                var entityId = entity.attribute.attr.id;

                //服务端存储
                var geojson = this.drawControl.toGeoJSON(entity);
                if (!entity.attribute.attr.name) {
                    // this.drawControl.deleteEntity(entity);
                    haoutil.msg("名称不可为空！");
                    return;
                }

                //新增 
                if (!entityId) {
                    sendAjax({
                        url: "map/plot/add",
                        type: "post",
                        data: JSON.stringify({
                            name: entity.attribute.attr.name || "", //名称	
                            geojson: geojson || "", //geojson	
                            type: entity.attribute.type, //类型	
                            remark: entity.attribute.attr.remark || "", //备注	
                        }),
                        contentType: "application/json",
                        success: function (data) {

                            entity.attribute.attr.id = data.id;
                        }
                    });
                } else {
                    //修改
                    sendAjax({
                        url: "map/plot/update",
                        data: JSON.stringify({
                            id: entityId,
                            geojson: geojson,
                        }),
                        contentType: "application/json",
                        success: function (result) { },
                    });
                }
            } else {
                entity.attribute.attr.id = entity.attribute.attr.id || (new Date()).format("yyyyMMddHHmmss");

                //本地存储 
                var geojson = JSON.stringify(this.getGeoJson());
                haoutil.storage.add(this.storageName, geojson);
            }

            this.sendSocket(entity);
        }
        sendDeleteEntity(entity) {
            console.log("plot: 删除了数据")

            if (window.hasServer) {
                //后台删除
                var entityId = entity.attribute.attr.id;
                if (!entityId) { //表示绘制过程中删除
                    this.isOnDraw = true;
                    return;
                }
                sendAjax({
                    url: "map/plot/" + entityId,
                    data: JSON.stringify({}),
                    type: "delete",
                    contentType: "application/json",
                    success: function (result) {

                    },
                });
            }
            else {
                var storagedata = JSON.stringify(this.getGeoJson());
                haoutil.storage.add(this.storageName, storagedata);
            }
        }
        sendDeleteAll() {
            console.log("plot: 删除了所有数据")

            if (window.hasServer) {
                //后台删除 
                sendAjax({
                    url: "map/plot/deleteAll",
                    contentType: "application/json",
                    success: function (result) {

                    },
                });
            }
            else {
                //本地存储
                haoutil.storage.del(this.storageName);
            }
        }

        //websocket更新坐标
        socketConfig() {
            var that = this;
            mars3d.widget.activate({
                uri: 'widgets/plotSocket/widget.js',
                updateAttr: function (json) {
                    that.drawControl.loadJson(json, {
                        clear: false,
                        flyTo: false
                    });
                }
            });
        }
        sendSocket(entity) {
            var plotSocket = mars3d.widget.getClass('widgets/plotSocket/widget.js');
            if (plotSocket && plotSocket.isActivate) {
                var geojson = this.drawControl.toGeoJSON(entity);
                plotSocket.sendSocket(geojson);
            }
        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 