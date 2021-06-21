//对应widget.js中MyWidget实例化后的对象
var thisWidget;

var filePath = "http://data.marsgis.cn/file/apidemo/qiye/";
var photoQYJJ = { "title": "企业简介", "id": 1, "start": 0, "data": [] };
var photoCpjj = { "title": "企业产品", "id": 2, "start": 0, "data": [] };

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    //传入的企业信息
    var item = thisWidget.getData();

    showItemView(item);

    var height = ($(window).height() - 100);

    if ($("#zpQYJJ").is(":hidden")) {
        if ($("#zpCPJJ").is(":hidden")) {
            //都没有时
            $(".ryglGjRight2").hide();
            $(".ryglGjRight1").css("width", "100%");

        }
        else {//只有产品照片时
            $("#zpCPJJ").height(height);
        }
    }
    else {//只有企业照片时
        if ($("#zpCPJJ").is(":hidden")) {
            $("#zpQYJJ").height(height);
        }
        else {//都存在时
            $("#zpQYJJ").height(height / 2);
            $("#zpCPJJ").height(height / 2);
        }
    }



    $(".toolsbar-mappic").mCustomScrollbar({
        theme: "minimal",
    });

    $("#btnSPJK").click(function () {
        thisWidget.showSPJK();
    });
}

function showItemView(item) {
    filePath += (item.ID || "") + "/";

    $("#qyNameJC").html(item.JC);
    $("#qyName").html("名称：" + item.NAME);
    $("#qyLX").html("类型：" + item.LX);

    if (item.LXDH)
        $("#qyLXDH").html("电话：" + item.LXDH);
    if (item.DZ)
        $("#qyDZ").html("地址：" + item.DZ);

    //测试数据，真实项目中请注释 start
    filePath = "http://data.marsgis.cn/file/apidemo/qiye/B0FFHH68OO/"
    item.QYZP = 6;
    item.CPZP = 6;
    item.QYJJ = "有";
    item.JJ = [
        { "NF": "2017", "ZCZ": 6000 + haoutil.math.random(1000, 3000), "LY": 1000 + haoutil.math.random(100, 1000), "NSE": 1000 + haoutil.math.random(100, 1000) },
        { "NF": "2018", "ZCZ": 10000 + haoutil.math.random(2000, 3000), "LY": 3000 + haoutil.math.random(100, 1000), "NSE": 3000 + haoutil.math.random(100, 1000) },
        { "NF": "2019", "ZCZ": 25000 + haoutil.math.random(3000, 5000), "LY": 5000 + haoutil.math.random(100, 1000), "NSE": 5000 + haoutil.math.random(100, 1000) }
    ];
    //测试数据，真实项目中请注释 end


    //企业简介
    $("#txtQYJJ").html("&nbsp;&nbsp;&nbsp;&nbsp;暂无");
    if (item.QYJJ == "有") {
        $.ajax({
            url: filePath + 'about.txt',
            type: "get",
            dataType: "text",
            success: function (rs) {
                $("#txtQYJJ").html("&nbsp;&nbsp;&nbsp;&nbsp;" + (rs || "暂无"));
                $("#txtQYJJ").mCustomScrollbar({
                    theme: "minimal"
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("企业简介文件" + filePath + "about.txt加载失败！");
                //toastr.error("企业简介文件" + filePath + "about.txt加载失败！");
            }
        });
    }

    //企业照片
    photoQYJJ.data = [];
    var imgcount = Number(item.QYZP);
    if (!isNaN(imgcount) && imgcount > 0) {
        var inhtml = "<ul>";
        for (var i = 0; i < imgcount; i++) {
            var url = filePath + "company/" + (i + 1) + ".jpg";
            inhtml += "<li  onclick='showPhotoQyjj(" + i + ")'><a><div><img src='" + url + "'/></div><div></div> </a></li>";

            photoQYJJ.data.push({ "pid": i, "alt": "", "src": url, "thumb": url });
        }
        inhtml += "</ul>";

        $("#zpQYJJ").html(inhtml);
    }
    else {
        $("#zpQYJJ-Title").hide();
        $("#zpQYJJ").hide();
    }


    //产品照片
    photoCpjj.data = [];
    var imgcount = Number(item.CPZP);
    if (!isNaN(imgcount) && imgcount > 0) {
        var inhtml = "<ul>";
        for (var i = 0; i < imgcount; i++) {
            var url = filePath + "product/" + (i + 1) + ".jpg";
            inhtml += "<li  onclick='showPhotoQycp(" + i + ")'><a><div><img src='" + url + "'/></div><div></div> </a></li>";

            photoCpjj.data.push({ "pid": i, "alt": "", "src": url, "thumb": url });
        }
        inhtml += "</ul>";

        $("#zpCPJJ").html(inhtml);
    }
    else {
        $("#zpCPJJ-Title").hide();
        $("#zpCPJJ").hide();
    }

    //$('img').error(function () {
    //    $(this).parent().parent().hide();
    //});


    //设置echarts的高度
    var height = $(window).height() - $("#infoExView").height();
    $("#echartsView").css("height", height + "px");


    // 基于准备好的dom，初始化echarts实例
    if (item.JJ && item.JJ.length > 0) {
        var myChart1 = echarts.init(document.getElementById('echartsView'), 'dark');
        myChart1.setOption(getOption1(item.JJ));
    }
}


function getOption1(arrObj) {
    var arrNF = [];     //x轴(年份)
    var arrZCZ = [];   //总产值
    var arrLY = [];    //利润
    var arrNSE = [];   //纳税额

    var arrZCZ_SD = [0];
    var arrLY_SD = [0];
    var arrNSE_SD = [0];

    for (var i = 0; i < arrObj.length; i++) {
        var item = arrObj[i];

        item.ZCZ = Number(item.ZCZ);
        item.LY = Number(item.LY);
        item.NSE = Number(item.NSE);

        arrNF.push(item.NF + "年");
        arrZCZ.push(item.ZCZ);
        arrLY.push(item.LY);
        arrNSE.push(item.NSE);

        //计算同比增长率
        if (i > 0) {
            var lastItem = arrObj[i - 1];
            if (item.ZCZ != 0)
                arrZCZ_SD.push(Math.round((item.ZCZ - lastItem.ZCZ) * 100 / lastItem.ZCZ));
            else
                arrZCZ_SD.push(0);

            if (item.LY != 0)
                arrLY_SD.push(Math.round((item.LY - lastItem.LY) * 100 / lastItem.LY));
            else
                arrLY_SD.push(0);

            if (item.NSE != 0)
                arrNSE_SD.push(Math.round((item.NSE - lastItem.NSE) * 100 / lastItem.NSE));
            else
                arrNSE_SD.push(0);
        }
    }


    var option = {
        //title: {
        //    text: "企业经营情况",
        //    left: 'center'
        //},
        tooltip: {
            trigger: 'axis',
            position: function (point, params, dom, rect, size) {
                return ["10%", "10%"];
            },
            formatter: function (params) {
                var inhtml = "";
                for (var i in params) {
                    var item = params[i];
                    if (item == null || item.value == null) continue;

                    if (item.value == 0) {
                        inhtml += "无数据<br />";
                        continue;
                    }
                    else if (item.value < 10000) {
                        inhtml += "<label style='color:" + item.color + ";'>" + item.value + "</label>&nbsp;万元";
                    }
                    else {
                        var val = Math.round(item.value / 1000) / 10;
                        inhtml += "<label style='color:" + item.color + ";'>" + val + "</label>&nbsp;亿元";
                    }

                    if (item.dataIndex > 0) {
                        var value = 100;
                        if (item.seriesName == "总产值")
                            value = arrZCZ_SD[item.dataIndex];
                        else if (item.seriesName == "利润")
                            value = arrLY_SD[item.dataIndex];
                        else if (item.seriesName == "纳税额")
                            value = arrNSE_SD[item.dataIndex];
                        inhtml += "，&nbsp;同比增长<label style='color:" + item.color + ";'>" + value + "</label>%<br />";
                    }
                    else {
                        inhtml += "<br />";
                    }
                }
                return inhtml;
            }
        },
        toolbox: {
            top: 10,
            right: 10,
            feature: {
                magicType: { show: true, type: ['line', 'bar'] },
            }
        },
        legend: {
            top: 10,
            left: 10,
            //orient: "vertical",
            data: ['总产值', '利润', '纳税额']
        },
        xAxis: {
            data: arrNF,
            axisLine: {
                show: false
            }
        },
        yAxis: {
            axisLabel: {
                rotate: 60
            }
        },
        series: [
            {
                name: '总产值',
                type: 'bar',
                data: arrZCZ
            },
            {
                name: '利润',
                type: 'bar',
                data: arrLY
            },
            {
                name: '纳税额',
                type: 'bar',
                data: arrNSE
            }
        ]
    };

    return option;
}

function showPhotoQyjj(startid) {
    photoQYJJ.start = startid || 0;
    layer.photos({
        photos: photoQYJJ,
        anim: 5,
        shade: [0.5, '#393D49']
    });
}

function showPhotoQycp(startid) {
    photoCpjj.start = startid || 0;
    layer.photos({
        photos: photoCpjj,
        anim: 5,
        shade: [0.3, '#393D49']
    });
}
