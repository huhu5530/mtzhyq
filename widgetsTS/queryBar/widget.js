//模块：查询工具栏
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


        //初始化[仅执行1次]
        create() {
            this.pageSize = 6
            this.arrdata = []
            this.counts = 0
            this.allpage = 0
            this.thispage = 0
            this.objResultData = {} 
            this.cookieName = 'querypoi_gis'
            this.arrHistory = []

            //单击事件
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            if (opt.type != "append") return;

            var that = this;

            if (that.config.position)
                $("#map-querybar").css(that.config.position);
            if (that.config.style)
                $("#map-querybar").css(that.config.style);

            // 搜索框
            $("#txt_querypoi").click(function () {
                // 文本框内容为空
                if ($.trim($(this).val()).length == 0) {
                    that.hideAllQueryBarView();
                    that.showHistoryList(); // 显示历史记录
                }
            });

            // 搜索框绑定文本框值发生变化,隐藏默认搜索信息栏,显示匹配结果列表
            $("#txt_querypoi").bind("input propertychange", function () {
                that.hideAllQueryBarView();

                that.clearLayers();

                var queryVal = $.trim($("#txt_querypoi").val());
                if (queryVal.length == 0) {
                    // 文本框内容为空,显示历史记录
                    that.showHistoryList();
                } else {

                    that.autoTipList(queryVal, true);
                }
            });

            // 点击搜索查询按钮
            $("#btn_querypoi").click(function () {
                that.hideAllQueryBarView();

                var queryVal = $.trim($("#txt_querypoi").val());
                that.strartQueryPOI(queryVal, true);
            });
            //绑定回车键  
            $("#txt_querypoi").bind('keydown', function (event) {
                if (event.keyCode == "13") {
                    $("#btn_querypoi").click();
                }
            });

            // 返回查询结果面板界面 
            $("#querybar_detail_back").click(function () {
                that.hideAllQueryBarView();
                $("#querybar_resultlist_view").show();
            });
        }
        //打开激活
        activate() {
            //单击地图事件
            this.viewer.mars.on(mars3d.event.click, this.onMapClick, this);
        }
        //关闭释放
        disable() {
            //释放单击地图事件
            this.viewer.mars.off(mars3d.event.click, this.onMapClick, this);
        }
        onMapClick(event) {
            // 点击地图区域,隐藏所有弹出框
            if ($.trim($("#txt_querypoi").val()).length == 0) {
                this.hideAllQueryBarView();
                $("#txt_querypoi").blur();
            }
        }


        hideAllQueryBarView() {
            $("#querybar_histroy_view").hide();
            $("#querybar_autotip_view").hide();
            $("#querybar_resultlist_view").hide();
        }

        // 点击面板条目,自动填充搜索框,并展示搜索结果面板
        autoSearch(name) {
            $("#txt_querypoi").val(name);
            $("#btn_querypoi").trigger("click");
        }

        //===================与后台交互========================  
        //显示智能提示搜索结果
        autoTipList(text, queryEx) {

            var that = this;
            this._queryXzqh(text, function (arr) {
                var inhtml = "";
                for (var index = 0; index < arr.length; index++) {
                    var name = arr[index].name;
                    inhtml += "<li><i class='fa fa-search'></i><a href=\"javascript:queryBarWidget.autoSearch('" + name + "');\">" + name + "</a></li>";
                }

                if (arr.length < 10) {
                    //=========查询poi============= 
                    that._queryPOI(text, function (pois) {
                        for (var index = 0; index < pois.length; index++) {
                            var name = pois[index].name;
                            inhtml += "<li><i class='fa fa-search'></i><a href=\"javascript:queryBarWidget.autoSearch('" + name + "');\">" + name + "</a></li>";
                        }
                        if (pois.length < 10) {
                            //=========查询plot============= 
                            that._queryPlot(text, function (arrplot) {

                                for (var index = 0; index < arrplot.length; index++) {
                                    var name = arrplot[index].name;
                                    inhtml += "<li><i class='fa fa-search'></i><a href=\"javascript:queryBarWidget.autoSearch('" + name + "');\">" + name + "</a></li>";
                                }

                                if (inhtml.length > 0) {
                                    $("#querybar_ul_autotip").html(inhtml);
                                    $("#querybar_autotip_view").show();
                                }

                            }, 10 - pois.length);
                            //=========查询plot end============= 
                        }
                        else {
                            if (inhtml.length > 0) {
                                $("#querybar_ul_autotip").html(inhtml);
                                $("#querybar_autotip_view").show();
                            }
                        }

                    }, 10 - arr.length);
                    //=========查询poi end============= 
                }
                else {
                    if (inhtml.length > 0) {
                        $("#querybar_ul_autotip").html(inhtml);
                        $("#querybar_autotip_view").show();
                    }
                }
            }, 10);

        }
        //查询行政区划
        _queryXzqh(text, callback, maxcount) {

            $.ajax({
                url: this.path + "data/xzqh.json",
                type: "get",
                //data: { 
                //    "text": text, 
                //},
                success: function (data) {
                    var pois = data.results;
                    var arr = [];

                    var counts = 0;
                    for (var index = 0; index < pois.length; index++) {
                        var name = pois[index].name;
                        if (name.indexOf(text) == -1) continue;

                        pois[index]._datatype = "xzqh";
                        arr.push(pois[index]);

                        if (maxcount) {
                            counts++;
                            if (counts > maxcount) break;
                        }
                    }

                    callback(arr);
                },
                error: function (data) {
                    toastr.error("请求行政区划出错(" + data.status + ")：" + data.statusText);
                    callback([]);
                }
            });

        }

        //查询北京POI
        _queryPOI(text, callback, maxcount) {

            $.ajax({
                url: this.path + "data/poi.json",
                type: "get",
                //data: { 
                //    "text": text, 
                //},
                success: function (data) {
                    var pois = data.results;
                    var arr = [];

                    var counts = 0;
                    for (var index = 0; index < pois.length; index++) {
                        var name = pois[index].name;
                        if (name.indexOf(text) == -1) continue;

                        pois[index]._datatype = "poi";
                        arr.push(pois[index]);

                        if (maxcount) {
                            counts++;
                            if (counts > maxcount) break;
                        }
                    }

                    callback(arr);
                },
                error: function (data, b, c) {
                    toastr.error("请求POI出错(" + data.status + ")：" + data.statusText);
                    callback([]);
                }
            });

        }
        //查询plot标绘的
        _queryPlot(text, callback, maxcount) {
            var arr = [];
            var plotWidget = mars3d.widget.getClass('widgets/plot/widget.js');
            if (plotWidget) {
                arr = plotWidget.query(text, maxcount);
            }

            callback(arr);
        }
        // 根据输入框内容，查询显示列表  
        strartQueryPOI(text, queryEx) {
            if (text.length == 0) {
                toastr.warning('请输入搜索关键字！');
                return;
            }

            // TODO:根据文本框输入内容,从数据库模糊查询到所有匹配结果（分页显示）
            this.addHistory(text);

            this.hideAllQueryBarView();


            this.thispage = 1;
            this.queryText = text;

            //查询
            var that = this;
            var arrData;
            this._queryXzqh(text, function (arr) {
                arrData = arr;

                that._queryPOI(text, function (pois) {
                    arrData = arrData.concat(pois);

                    that._queryPlot(text, function (plots) {
                        arrData = arrData.concat(plots);
                        that.showResult(arrData);
                    });
                });

            }, 10);
        }

        //===================显示查询结果处理======================== 

        showResult(data) {
            this.arrdata = data;
            this.counts = data.length;
            this.allpage = Math.ceil(this.counts / this.pageSize);
            this.thispage = 1;
            this.showPOIPage();
        }
        showPOIPage() {
            var inhtml = "";
            if (this.counts == 0) {
                inhtml += '<div class="querybar-page"><div class="querybar-fl">没有找到"<strong>' + this.queryText + '</strong>"相关结果</div></div>';
            }
            else {
                var startIdx = (this.thispage - 1) * this.pageSize;
                var endIdx = startIdx + this.pageSize;
                if (endIdx >= this.counts) {
                    endIdx = this.counts;
                }

                for (var index = startIdx; index < endIdx; index++) {
                    var item = this.arrdata[index];
                    item.index = startIdx + (index + 1);

                    var _id = index;

                    inhtml += '<div class="querybar-site" onclick="queryBarWidget.showDetail(\'' + _id + '\')"> <div class="querybar-sitejj"> <h3>'
                        + item.index + '、' + item.name + '</h3> <p>' + (item.addr || item.fullname || item.type || '') + '</p> </div> </div>';

                    this.objResultData[_id] = item;
                };


                //分页信息
                var _fyhtml;
                if (this.allpage > 1)
                    _fyhtml = '<div class="querybar-ye querybar-fr">' + this.thispage + '/' + this.allpage + '页  <a href="javascript:queryBarWidget.showFirstPage()">首页</a> <a href="javascript:queryBarWidget.showPretPage()">&lt;</a>  <a href="javascript:queryBarWidget.showNextPage()">&gt;</a> </div>';
                else
                    _fyhtml = '';

                //底部信息
                inhtml += '<div class="querybar-page"><div class="querybar-fl">找到<strong>' + this.counts + '</strong>条结果</div>' + _fyhtml + '</div>';
            }
            $("#querybar_resultlist_view").html(inhtml);
            $("#querybar_resultlist_view").show();


            this.showPOIArr(this.arrdata);

            if (this.counts == 1) {
                this.showDetail('0');
            }
        }
        showFirstPage() {
            this.thispage = 1;
            this.showPOIPage();
        }
        showNextPage() {
            this.thispage = this.thispage + 1;
            if (this.thispage > this.allpage) {
                this.thispage = this.allpage;
                toastr.warning('当前已是最后一页了');
                return;
            }
            this.showPOIPage();
        }

        showPretPage() {
            this.thispage = this.thispage - 1;
            if (this.thispage < 1) {
                this.thispage = 1;
                toastr.warning('当前已是第一页了');
                return;
            }
            this.showPOIPage();
        }
        //点击单个结果,显示详细
        showDetail(id) {
            var item = this.objResultData[id];
            this.centerAt(item);
        }
        getWorkLayer() {
            if (this.dataSource == null) {
                this.dataSource = new Cesium.CustomDataSource();
                this.viewer.dataSources.add(this.dataSource);
            }
            return this.dataSource;
        }
        clearLayers() {
            if (this.dataSource == null) return;
            this.dataSource.entities.removeAll();
            this.viewer.mars.popup.close();
        }
        showPOIArr(arr) {
            var that = this;
            var layer = this.getWorkLayer();
            this.clearLayers();


            $(arr).each(function (i, item) {
                var jd = item.x || item.jd;
                var wd = item.y || item.wd;
                var gd = item.gd || 0;

                //===========无坐标数据=========== 
                if (isNaN(jd) || jd == 0 || isNaN(wd) || wd == 0)
                    return;

                item.JD = jd;
                item.WD = wd;

                //==================构建图上目标单击后显示div=================  
                var inhtml;
                if (item._datatype == "poi") {
                    inhtml = that.viewer.mars.popup.getPopup([
                        { "field": "type", "name": "类型" },
                        { "field": "tel", "name": "电话" },
                        { "field": "addr", "name": "地址" },
                    ], item, item.name);
                }
                else if (item._datatype == "xzqh") {
                    inhtml = that.viewer.mars.popup.getPopup([
                        { "field": "id", "name": "编码" },
                        { "field": "fullname", "name": "全称" },
                    ], item, item.name);
                }
                else if (item._datatype == "plot") {
                    inhtml = that.viewer.mars.popup.getPopup([
                        { "field": "type", "name": "类型" },
                    ], item, item.name);
                }

                //==============================================================

                //添加实体
                var entity = that.dataSource.entities.add({
                    name: item.name,
                    position: Cesium.Cartesian3.fromDegrees(jd, wd),
                    point: {
                        color: Cesium.Color.fromCssColorString("#3388ff"),
                        pixelSize: 10,
                        outlineColor: Cesium.Color.fromCssColorString("#ffffff"),
                        outlineWidth: 2,
                        heightReference: gd == 0 ? Cesium.HeightReference.CLAMP_TO_GROUND : Cesium.HeightReference.NONE,     //贴地
                        scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1)
                    },
                    label: {
                        text: item.name,
                        font: '16px Helvetica',
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        fillColor: Cesium.Color.AZURE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -10),   //偏移量  
                        heightReference: gd == 0 ? Cesium.HeightReference.CLAMP_TO_GROUND : Cesium.HeightReference.NONE,     //贴地
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000)
                    },
                    data: item,
                    popup: {
                        html: inhtml,
                        anchor: [0, -12],
                    }
                });

                item._entity = entity;
            });

            if (arr.length > 1)
                that.viewer.flyTo(that.dataSource.entities, { duration: 3 });

        }
        centerAt(item) {
            var entity = item._entity;
            if (entity == null) {
                toastr.warning(item.name + " 无经纬度坐标信息！");
                return;
            }

            var height = 3000;

            if (item._datatype == "poi") {
                this.viewer.mars.centerAt({ x: item.JD, y: item.WD, minz: height });
            }
            else if (item._datatype == "xzqh") {
                this.viewer.mars.centerAt({ x: item.JD, y: item.WD, minz: height });
                this.centerAtRegion(item.id, item.xh);
            }
            else if (item._datatype == "plot") {
                if (entity.billboard || entity.label || entity.point) {
                    var position = entity.position.getValue();
                    var carto = Cesium.Cartographic.fromCartesian(position);

                    this.viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(carto.longitude), Cesium.Math.toDegrees(carto.latitude), carto.height + height),
                        duration: 3,
                        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 }
                    });
                } else {
                    this.viewer.flyTo(entity);
                }
            }

            var that = this;
            setTimeout(function () {
                that.viewer.mars.popup.show(entity, entity.position.getValue());
            }, 3000);
        }
        //=======================定位至指定区域=======================
        centerAtRegion(dmnm, dmxh) {
            var jsonurl;
            var dmxh;
            if (dmnm.substring(2) == "0000") {//省
                jsonurl = "sheng/china.json";
            }
            else if (dmnm.substring(4) == "00") {//市
                jsonurl = "shi/" + dmnm.substring(0, 2) + ".json";
            }
            else {//县区
                jsonurl = "xian/" + dmnm.substring(0, 4) + "00.json";
            }

            var that = this;

            $.getJSON('widgets/navXZQH/xzqhdata/' + jsonurl, function (geojson) {
                if (!that.isActivate) return;

                var length = geojson.features.length;
                for (var index = 0; index < length; index++) {
                    if (geojson.features[index].properties.id == dmxh) {
                        that.showRegionExtent(geojson.features[index]);
                        break;
                    }
                };
            });

        }
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
        showRegionExtent(feature) {
            this.clearLastRegion();

            var that = this;
            var dataSource = Cesium.GeoJsonDataSource.load(feature, {
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
            var that = this;
            this.last_timetemp = setTimeout(function () {
                that.clearLastRegion();
            }, 5000);
        }


        //===================历史记录相关========================
        showHistoryList() {
            $("#querybar_histroy_view").hide();

            var lastcookie = haoutil.cookie.get(this.cookieName); //读取cookie值  
            if (lastcookie == null) return;

            this.arrHistory = eval(lastcookie);
            if (this.arrHistory == null || this.arrHistory.length == 0) return;

            var inhtml = "";
            for (var index = this.arrHistory.length - 1; index >= 0; index--) {
                var item = this.arrHistory[index];
                inhtml += "<li><i class='fa fa-history'/><a href=\"javascript:queryBarWidget.autoSearch('" + item + "');\">" + item + "</a></li>";
            }
            $("#querybar_ul_history").html(inhtml);
            $("#querybar_histroy_view").show();
        }

        clearHistory() {
            this.arrHistory = [];
            haoutil.cookie.del(this.cookieName);

            $("#querybar_ul_history").html("");
            $("#querybar_histroy_view").hide();
        }

        //记录历史值 
        addHistory(data) {
            this.arrHistory = [];
            var lastcookie = haoutil.cookie.get(this.cookieName); //读取cookie值  
            if (lastcookie != null) {
                this.arrHistory = eval(lastcookie);
            }
            //先删除之前相同记录
            this.arrHistory.remove(data);

            this.arrHistory.push(data);

            if (this.arrHistory.length > 10)
                this.arrHistory.splice(0, 1);

            lastcookie = JSON.stringify(this.arrHistory);
            haoutil.cookie.add(this.cookieName, lastcookie);
        }


    }


    //注册到widget管理器中。
    window.queryBarWidget = mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 