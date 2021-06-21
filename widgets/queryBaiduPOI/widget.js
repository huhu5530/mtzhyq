(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //外部资源配置
        get resources() {
            return [
                'view.css',
                "./lib/cesiumjs/plugins/class/BaiduPOI.js" //百度poi查询
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
            this.cookieName = 'querypoi_gis'
            this.pageSize = 6
            this.arrdata = []
            this.counts = 0
            this.allpage = 0
            this.thispage = 0

            this.baiduPOI = new BaiduPOI();

        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            if (opt.type != "append") return;

            var that = this;

            var img = $('#map-querybar img');
            img.each(function (index, item) {
                $(item).attr('src', that.path + $(item).attr('src'));
            });

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


            var timetik = 0;

            // 搜索框绑定文本框值发生变化,隐藏默认搜索信息栏,显示匹配结果列表
            $("#txt_querypoi").bind("input propertychange", function () {
                clearTimeout(timetik);
                timetik = setTimeout(function () {
                    that.hideAllQueryBarView();
                    that.clearLayers();

                    var queryVal = $.trim($("#txt_querypoi").val());
                    if (queryVal.length == 0) {
                        // 文本框内容为空,显示历史记录
                        that.showHistoryList();
                    } else {
                        that.autoTipList(queryVal, true);
                    }

                }, 500);
            });

            // 点击搜索查询按钮
            $("#btn_querypoi").click(function () {
                clearTimeout(timetik);
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

            this.hideAllQueryBarView();
            this.clearLayers();
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
            $("#querybar_detail_view").hide();
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
            //输入经纬度数字时
            if (this.isLonLat(text)) return;

            //查询外部widget
            if (this.hasExWidget() && queryEx) {
                var qylist = this.autoExTipList(text);
                return;
            }
            //查询外部widget

            this.baiduPOI.autoTip({
                text: text,
                location: this.viewer.mars.getCenter(),
                success: function (result) {
                    var inhtml = "";
                    var pois = result.list;
                    for (var index = 0; index < pois.length; index++) {
                        var name = pois[index].name;
                        // var num = pois[index].num;
                        // if (num > 0) continue;

                        inhtml += "<li><i class='fa fa-search'></i><a href=\"javascript:widget_queryBaiduPOI.autoSearch('" + name + "');\">" + name + "</a></li>";
                    }

                    if (inhtml.length > 0) {
                        $("#querybar_ul_autotip").html(inhtml);
                        $("#querybar_autotip_view").show();
                    }

                }
            });

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

            //输入经纬度数字时
            if (this.isLonLat(text)) {
                this.centerAtLonLat(text);
                return;
            }

            //查询外部widget
            if (this.hasExWidget() && queryEx) {
                var qylist = this.queryExPOI(text);
                return;
            }
            //查询外部widget


            this.thispage = 1;
            this.queryText = text;
            this.query_location = this.viewer.mars.getCenter()
            this.query_radius = this.viewer.camera.positionCartographic.height; //单位：米

            this.queryPOI();
        }
        queryPOI() {
            var that = this;

            //查询获取数据
            this.baiduPOI.queryText({
                text: this.queryText,
                count: this.pageSize,
                page: (this.thispage - 1),
                location: this.query_location,
                radius: this.query_radius,
                success: function (result) {
                    if (!that.isActivate) return;
                    that.showPOIPage(result.list, result.allcount);
                }
            });
        }

        //===================显示查询结果处理========================  
        showPOIPage(data, counts) {
            this.arrdata = data;
            this.counts = counts;
            if (this.counts < data.length) this.counts = data.length;
            this.allpage = Math.ceil(this.counts / this.pageSize);

            var inhtml = "";
            if (this.counts == 0) {
                inhtml += '<div class="querybar-page"><div class="querybar-fl">没有找到"<strong>' + this.queryText + '</strong>"相关结果</div></div>';
            }
            else {
                this.objResultData = this.objResultData || {}
                for (var index = 0; index < this.arrdata.length; index++) {
                    var item = this.arrdata[index];
                    var startIdx = (this.thispage - 1) * this.pageSize;
                    item.index = startIdx + (index + 1);

                    var _id = index;
                    var _mc;
                    if (item.detail_info && item.detail_info.detail_url) {
                        _mc = '<a href="' + item.detail_info.detail_url + '"  target="_black" style="color: #ffffff; ">' + item.name + '</a>';
                    }
                    else {
                        _mc = item.name;
                    }


                    inhtml += '<div class="querybar-site" onclick="widget_queryBaiduPOI.showDetail(\'' + _id + '\')"> <div class="querybar-sitejj"> <h3>'
                        + item.index + '、' + _mc + '</h3> <p>' + (item.address || '') + '</p> </div> </div>';

                    this.objResultData[_id] = item;
                };




                //分页信息
                var _fyhtml;
                if (this.allpage > 1)
                    _fyhtml = '<div class="querybar-ye querybar-fr">' + this.thispage + '/' + this.allpage + '页  <a href="javascript:widget_queryBaiduPOI.showFirstPage()">首页</a> <a href="javascript:widget_queryBaiduPOI.showPretPage()">&lt;</a>  <a href="javascript:widget_queryBaiduPOI.showNextPage()">&gt;</a> </div>';
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
            this.queryPOI();
        }
        showNextPage() {
            this.thispage = this.thispage + 1;
            if (this.thispage > this.allpage) {
                this.thispage = this.allpage;
                toastr.warning('当前已是最后一页了');
                return;
            }
            this.queryPOI();
        }

        showPretPage() {
            this.thispage = this.thispage - 1;
            if (this.thispage < 1) {
                this.thispage = 1;
                toastr.warning('当前已是第一页了');
                return;
            }
            this.queryPOI();
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
            this.clearLayers();

            var dataSource = this.getWorkLayer();
            $(arr).each(function (i, item) {
                var jd = Number(item.x);
                var wd = Number(item.y);
                if (isNaN(jd) || isNaN(wd)) return;

                var pt = viewer.mars.point2map({ x: jd, y: wd })
                jd = pt.x
                wd = pt.y

                item.x = jd
                item.y = wd

                //==================构建图上目标单击后显示div=================  
                var name;
                if (item.detail_info && item.detail_info.detail_url) {
                    name = '<a href="' + item.detail_info.detail_url + '"  target="_black" style="color: #ffffff; ">' + item.name + '</a>';
                }
                else {
                    name = item.name;
                }

                var inHtml = '<div class="mars-popup-titile">' + name + '</div><div class="mars-popup-content" >';

                var phone = $.trim(item.tel);
                if (phone != '') inHtml += '<div><label>电话</label>' + phone + '</div>';

                var dz = $.trim(item.address);
                if (dz != '') inHtml += '<div><label>地址</label>' + dz + '</div>';

                if (item.detail_info) {
                    var fl = $.trim(item.detail_info.tag);
                    if (fl != '') inHtml += '<div><label>类别</label>' + fl + '</div>';

                }
                inHtml += '</div>';
                //==============================================================

                //添加实体
                var entity = dataSource.entities.add({
                    name: item.name,
                    position: Cesium.Cartesian3.fromDegrees(jd, wd),
                    point: {
                        color: Cesium.Color.fromCssColorString("#3388ff"),
                        pixelSize: 10,
                        outlineColor: Cesium.Color.fromCssColorString("#ffffff"),
                        outlineWidth: 2,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,     //贴地
                        scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY //不被遮挡
                    },
                    label: {
                        text: item.name,
                        font: '20px 楷体',
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        fillColor: Cesium.Color.AZURE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -10),   //偏移量  
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //是地形上方的高度 
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 200000),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY //不被遮挡
                    },
                    data: item,
                    popup: {
                        html: inHtml,
                        anchor: [0, -12],
                    },
                    // click: function (entity) {//单击回调
                    //     var data = entity.data;

                    // }
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


            this.viewer.mars.centerAt({ x: item.x, y: item.y, minz: 2500 });

            var that = this;
            setTimeout(function () {
                that.viewer.mars.popup.show(entity);
            }, 3000);
        }

        //===================坐标定位处理========================
        isLonLat(text) {
            var reg = /^-?((0|1?[0-7]?[0-9]?)(([.][0-9]*)?)|180(([.][0]*)?)),-?((0|[1-8]?[0-9]?)(([.][0-9]*)?)|90(([.][0]*)?))$/;   /*定义验证表达式*/
            return reg.test(text);     /*进行验证*/
        }
        centerAtLonLat(text) {
            var arr = text.split(",");
            if (arr.length != 2) return;

            var jd = Number(arr[0]);
            var wd = Number(arr[1]);
            if (isNaN(jd) || isNaN(wd)) return;

            this.viewer.mars.centerAt({ x: jd, y: wd, minz: 2500 });

            var dataSource = this.getWorkLayer();

            var inHtml = '<div class="mars-popup-titile">坐标定位</div>\
                      <div class="mars-popup-content" >\
                        <div><label>经度</label>' + jd + '</div>\
                        <div><label>纬度</label>' + wd + '</div>\
                      </div>';

            //添加实体
            var entity = dataSource.entities.add({
                name: "坐标定位",
                position: Cesium.Cartesian3.fromDegrees(jd, wd),
                point: {
                    color: Cesium.Color.fromCssColorString("#3388ff"),
                    pixelSize: 10,
                    outlineColor: Cesium.Color.fromCssColorString("#ffffff"),
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,     //贴地
                    scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.1),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY //不被遮挡
                },
                popup: {
                    html: inHtml,
                    anchor: [0, -12],
                }
            });

            var that = this;
            setTimeout(function () {
                that.viewer.mars.popup.show(entity);
            }, 3000);
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
                inhtml += "<li><i class='fa fa-history'/><a href=\"javascript:widget_queryBaiduPOI.autoSearch('" + item + "');\">" + item + "</a></li>";
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


        //======================查询非百度poi，联合查询处理=================
        //外部widget是否存在或启用 
        hasExWidget() {
            if (window["queryBarWidget"] == null)
                return false;
            else {
                this.exWidget = queryBarWidget;
                return true;
            }
        }
        autoExTipList(text) {
            var that = this;
            this.exWidget.autoTipList(text, function () {
                that.autoTipList(text, false);
            });
        }
        //调用外部widget进行查询
        queryExPOI(text) {
            var layer = this.getWorkLayer();

            var that = this;
            this.exWidget.strartQueryPOI(text, layer, function () {
                that.strartQueryPOI(text, false);
            });
        }


    }


    //注册到widget管理器中。
    window.widget_queryBaiduPOI = mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 