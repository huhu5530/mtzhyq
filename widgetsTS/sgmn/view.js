//对应widget.js中MyWidget实例化后的对象
var thisWidget;
var that = this;
//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) { //适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    //结束模拟
    $(".btnEndStep").click(function () {
        clearHtml();
        thisWidget.clearAll();
    });



    //===================事故模拟相关==================
    $("#choosePoint").click(startSelectSgd);

    //开始模拟(第1到第2步)
    $("#btnState1to2").click(function () {
        thisWidget.stopDraw();
        if (!thisWidget.check1to2()) {
            return;
        }
        startNextStep(this); //下一步

        var arg = {};
        arg.windSpeed = $("#windSpeed").val();
        arg.windDirection = $("#windDirection").val();
        arg.playSpeed = $("#playSpeed").val();
        thisWidget.startSgmn(arg);
    });

    $("#btnState2to1").click(function () {
        thisWidget.stopDraw();
        startPrevStep(this); //上一步
    });

    //点击poi面板
    $('.unitFind span').click(function () {
        pcShowAndHide(this)
    })


    //进入撤离模拟
    $("#btnState2to3").click(function () {
        thisWidget.stopDraw();
        if (!thisWidget.check2to3()) {
            return;
        }
        startNextStep(this); //下一步  
    });


    //===================撤离模拟相关==================
    //撤离模拟图上选点 
    $("#setMarker_CL").click(startSelectClmnPoint);
    $("#btnState3to2").click(function () {
        thisWidget.stopDraw();
        startPrevStep(this); //上一步
    });
    $("#btnState3to4").click(function () {
        thisWidget.stopDraw();
        if (!thisWidget.check3to4()) {
            return;
        }
        thisWidget.startClmn();
        var cheliDotNum = thisWidget.cheliDotNum();
        cheliDot(cheliDotNum);
        startNextStep(this); //下一步
    });

    $("#btnState4to3").click(function () {
        thisWidget.stopDraw();
        startPrevStep(this); //上一步
    });
    $("#btnState4to5").click(function () {
        thisWidget.stopDraw();
        if (!thisWidget.check4to5()) {
            return;
        }
        startNextStep(this); //下一步
    });

    //从撤离模拟跳到救援模拟
    $('.skipStep').click(skipStep)
    //撤离速度
    var oldLeaveSpeedVal = '120';
    var safeCount = 0;
    $('#leaveSpeedVal').keyup(function (e) {
        var keycode = e.keyCode;
        if (keycode == 13) {
            var val = speedValue(this);
            thisWidget.updateCLPlaySpeed(val);
        }
    });
    //点击开始撤离
    $('#startLeave').click(function () {
        $('.startAndEndLeave').show();
        $('.lineTableList li').removeClass('nowLi');
        $('.safeLineTableList li').find('i').removeClass('currentOpIcon');
        var idArr = startLeaveArr();
        var newLeaveSpeedVal = $('#leaveSpeedVal').val();
        if (flag) {
            var speedVal = $('.leaveSpeed input').val();
            thisWidget.roamClmnArr(idArr, speedVal);
        } else {
            thisWidget.stopRoamClmnArr(idArr);
        }
        var time = thisWidget.getMaxFlylineTime() / (parseInt(newLeaveSpeedVal) / parseInt(oldLeaveSpeedVal));
        startLeave(this, time);
        //去除救援模拟操作
        clearRescue();
    })



    //===================救援模拟相关==================
    $("#setMarker_JY").click(startSelectJymnPoint);

    $("#btnState5to4").click(function () {
        thisWidget.stopDraw();
        startPrevStep(this); //上一步
        //判断是否跳过撤离模拟
        isSkipStep();
    });
    $("#btnState5to6").click(function () {
        thisWidget.stopDraw();
        if (!thisWidget.check5to6()) {
            return;
        }
        thisWidget.startJymn();
        startNextStep(this); //下一步
    });

    $("#btnState6to5").click(function () {
        thisWidget.stopDraw();
        startPrevStep(this); //上一步
    });
    //救援速度
    var oldRescueSpeedVal = '120';
    $('#rescueSpeedVal').keyup(function (e) {
        var keycode = e.keyCode;
        if (keycode == 13) {
            var val = speedValue(this);
            thisWidget.updateJYPlaySpeed(val);
        }
    });
    //开始救援
    $('#startRescue').click(function () {
        $('.startAndEndRescue').show();
        $('.lineTableList li').removeClass('nowLi');
        $('.rescueTableList li').find('i').removeClass('currentOpIcon');
        var idArr = startRescueArr();
        var newRescueSpeedVal = $('#rescueSpeedVal').val();
        if (otherfl) {
            var speedVal = $('.rescueSpeed input').val();
            thisWidget.roamJymnArr(idArr, speedVal);
        } else {
            thisWidget.stopJymnArr(idArr);
        }
        var time = thisWidget.getMaxFlylineTime_JY() / (parseInt(newRescueSpeedVal) / parseInt(oldRescueSpeedVal));
        startRescue(this, time);
        //去除撤离模拟操作
        clearLeave();
    });


}

//上一步 共用样式处理
function startPrevStep(that) {
    var index = $(that).parents('.faultInfo').index();
    $('.stepRing i').eq(index).removeClass('nowStep');
    $('.faultInfo').eq(index - 1).show().siblings().hide();
    if ((index - 1) >= 0 && (index - 1) <= 1) {
        $('.faultText span').eq(0).addClass('active').siblings().removeClass('active');
    } else if ((index - 1) >= 2 && (index - 1) <= 3) {
        $('.faultText span').eq(1).addClass('active').siblings().removeClass('active');
    } else {
        $('.faultText span').eq(2).addClass('active').siblings().removeClass('active');
    }
}

//下一步 共用样式处理
function startNextStep(that) {
    var index = $(that).parents('.faultInfo').index() + 1;
    $('.stepRing i').eq(index).addClass('nowStep');
    $('.faultInfo').eq(index).show().siblings().hide();
    if (index >= 0 && index <= 1) {
        $('.faultText span').removeClass('active').eq(0).addClass('active');
    } else if (index >= 2 && index <= 3) {
        $('.faultText span').removeClass('active').eq(1).addClass('active');
    } else {
        $('.faultText span').removeClass('active').eq(2).addClass('active');
    }
}


//事故地点图上选点
function startSelectSgd() {
    thisWidget.startSelectSgd(function (data) {
        var locStr = `<li class="clearfix">
                    <p>${data.x}，${data.y}</p>
                    <span></span>
                </li>`

        $('.faultDot').html(locStr);
        //删除选中的点
        $('.faultDot span').click(function () {
            $(this).parents('li').remove();
            thisWidget.removeSgd();
            if ($('.faultDot li').length == 0) {
                $('.nextStep').attr('disabled', 'disabled');
                $('.nextStep').css({
                    'cursor': 'not-allowed'
                });
            }
        })
        if ($('.faultDot li').length != 0) {
            $('.nextStep').removeAttr('disabled');
            $('.nextStep').css({
                'cursor': 'pointer'
            });
        }
    })
}
//撤离模拟图上选点

function startSelectClmnPoint() {
    thisWidget.startSelectCld(function (data) {
        var newData = data.data;
        var safeStr = `<li class="clearfix">
                            <i>${data.name}:</i>
                            <p>${newData.x}，${newData.y}</p>
                            <span markerId="${data.markerId}"></span>
                        </li>`;
        $('.safeDot').append(safeStr);
        $('.safeDot span').click(function () {
            $(this).parents('li').remove();
            var markerId = $(this).attr('markerId');
            thisWidget.removeCLPointById(markerId);
        })
    })
}

function startSelectJymnPoint() {
    thisWidget.startSelectJyd(function (data) {
        var newData = data.data;
        var rescueStr = `<li class="clearfix">
                            <i>${data.name}:</i>
                            <p>${newData.x}，${newData.y}</p>
                            <span markerId="${data.markerId}"></span>
                        </li>`;
        $('.rescueDot').append(rescueStr);
        $('.rescueDot span').click(function () {
            $(this).parents('li').remove();
            var markerId = $(this).attr('markerId');
            debugger;
            thisWidget.removeJYPointById(markerId);
        })
    });
}

//影响范围
function effactArea(dis) {
    var dis = parseFloat(dis).toFixed(2);
    $('.affect i').html(dis);
}

//时间轴
function timeProgress(step) {
    var stepLen = (1 / 6 * 336 * step);
    $('.otherProgressBar').css({
        'width': stepLen + 'px'
    });
    $('.progressDot').css({
        'left': (stepLen - 8) + 'px'
    });
}

//影响单位
var unitArr = [];
var unitNum = 0; //POI数量
function affectInfo(data) {
    // console.log(data)
    var unitStr = '';
    for (var i = 0; i < data.length; i++) {
        var name = data[i].name;
        if (name.length > 17) {
            var name = name.substring(0, 17) + '...'
        }
        unitStr += `<li x="${data[i].x}" y="${data[i].y}">
                        <span>${i + 1}</span>
                        <span title="${data[i].name}">${name}</span>
                    </li>`;
    }
    $('.poiTable').html(unitStr);
    if ($('.poiTable li').length > 0) {
        $('.loadMore').show();
    }
    unitNum = data.length;
    $('.unitFind span').eq(0).find('i').html(unitNum);
    for (var i = 0; i < $('.poiTable li').length; i++) {
        $('.poiTable li').eq(i).click(function () {
            var x = $(this).attr('x');
            var y = $(this).attr('y');
            thisWidget.locateById(x, y);
        })
    }
}


//加载更多
$('.loadMore').click(function () {
    thisWidget.loadMorePOI();
})
//企业
function companyInfo(data) {
    if (data.length == 0) {
        return;
    }
    var unitStr = '';
    for (var i = 0; i < data.length; i++) {
        var name = data[i].data.name;
        if (name.length > 17) {
            var name = name.substring(0, 17) + '...'
        }
        unitStr += `<li x="${data[i].data.x}" y="${data[i].data.y}">
                        <span>${i + 1}</span>
                        <span title="${data[i].data.name}">${name}</span>
                    </li>`;
    }
    $('.companyTable').html(unitStr);
    unitNum = data.length;
    $('.unitFind span').eq(1).find('i').html(unitNum);
    for (var i = 0; i < $('.companyTable li').length; i++) {
        $('.companyTable li').eq(i).click(function () {
            var x = $(this).attr('x');
            var y = $(this).attr('y');
            thisWidget.locateById(x, y);
        })
    }
}
//poi和company切换
function pcShowAndHide(that) {
    var index = $(that).index();
    $(that).addClass('unitNow').siblings().removeClass('unitNow');
    $('.tableBox').eq(index).show().siblings().hide();
}


function moreTableList(data) {
    var moreStr = '';
    var tabLen = $('.poiTable li').length;
    for (var i = 0; i < data.length; i++) {
        var name = data[i].name;
        if (name.length > 17) {
            var name = name.substring(0, 17) + '...'
        }
        moreStr += `<li x="${data[i].x}" y="${data[i].y}">
                        <span>${tabLen + i + 1}</span>
                        <span title="${data[i].name}">${name}</span>
                    </li>`;
    }
    $('.poiTable').append(moreStr);
    for (var i = 0; i < $('.poiTable li').length; i++) {
        $('.poiTable li').eq(i).click(function () {
            var x = $(this).attr('x');
            var y = $(this).attr('y');
            thisWidget.locateById(x, y);
        })
    }
    unitNum += data.length;
    $('.unitFind span').eq(0).find('i').html(unitNum);
}

//表单验证
var stepNum = 0;
$('.parmBox li').eq(0).find('input').blur(function () {
    var val = $(this).val();
    var pLen = $(this).parents('li').find('p').length;
    if (!Number(val)) {
        if (pLen == 1) {
            $(this).parents('li').append('<p style="width:174px; float:left; color:red; margin-left:71px;">请输入正确的数值！</p>');
            stepNum++;
        }
    } else {
        if (pLen > 1) {
            $(this).parents('li').find('p').eq(1).remove();
        }
        stepNum--;
    }
    allowedInput();
})
$('.parmBox li').eq(1).find('input').blur(function () {
    var val = $(this).val();
    var pLen = $(this).parents('li').find('p').length;
    if (!Number(val) || val < 0 || val > 360) {
        if (pLen == 1) {
            $(this).parents('li').append('<p style="width:174px; float:left; color:red; margin-left:71px;">请输入0-360的数值！</p>');
            stepNum++;
        }
    } else {
        if (pLen > 1) {
            $(this).parents('li').find('p').eq(1).remove();
        }
        stepNum--;
    }
    allowedInput();
})
$('.parmBox li').eq(2).find('input').blur(function () {
    var val = $(this).val();
    var pLen = $(this).parents('li').find('p').length;
    if (!Number(val) || val % 1 != 0) {
        if (pLen == 1) {
            $(this).parents('li').append('<p style="width:174px; float:left; color:red; margin-left:71px;">请输入整数的数值！</p>');
            stepNum++;
        }
    } else {
        if (pLen > 1) {
            $(this).parents('li').find('p').eq(1).remove();
        }
        stepNum--;
    }
    allowedInput();
})

function allowedInput() {
    if (stepNum <= 0) {
        stepNum = 0;
        $('.nextStep').removeAttr('disabled');
        $('.nextStep').css({
            'cursor': 'pointer'
        });
    } else {
        $('.nextStep').attr('disabled', 'disabled');
        $('.nextStep').css({
            'cursor': 'not-allowed'
        });
    }
}


//撤离路线
function safeLine(dataArr) {
    $('.leaveNum i').eq(0).html(dataArr.length); //企业数量
    var safeTableStr = '';
    for (var i = 0; i < dataArr.length; i++) {
        var name = dataArr[i].startPointData.name;
        if (name.length > 5) {
            name = name.substring(0, 5) + '...';
        }
        var endName = dataArr[i].endPointData._name;
        if (endName.length > 5) {
            endName = endName.substring(0, 5) + '...';
        }
        safeTableStr += `<li>
                            <span>
                                <div class="checkbox">
                                    <input type="checkbox" class="styled" id="singleCheckbox1" value="option1" aria-label="Single checkbox One" checked="checked"  />
                                    <label></label>
                                </div>
                            </span>
                            <span>${ i + 1}</span>
                            <span><i title="${dataArr[i].startPointData.name}">${name}</i>---><i title="${dataArr[i].endPointData._name}">${endName}</i></span>
                            <span _id="${ dataArr[i]._id}"><i class="opIcon"></i></span>
                        </li>`;
    }
    $('.safeLineTableList').html(safeTableStr);
    var lineLi = $('.safeLineTableList li');
    var lineLen = lineLi.length;
    for (var i = 0; i < lineLen; i++) {
        $('.safeLineTableList li').eq(i).find('input').click(function () {
            var checkedBoolen = $(this).prop('checked');
            var checkNum = 0;
            if (checkedBoolen) {
                $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
            for (var i = 0; i < lineLen; i++) {
                var othercheck = $('.safeLineTableList li').eq(i).find('input').prop('checked');
                if (othercheck) {
                    checkNum++;
                }
            }
            if (checkNum == lineLen) {
                $('.safeLineTable span').eq(0).find('input').prop('checked', true);
            } else {
                $('.safeLineTable span').eq(0).find('input').prop('checked', false);
            }
            //选中路线的id
            var safeId = $(this).parents('li').find('span').eq(3).attr('_id');
            thisWidget.showHidelineByid(safeId, checkedBoolen);
        })

        //播放
        lineLi.eq(i).find('span').eq(3).click(function () {
            var oneFlag = $(this).find('i').is('.currentOpIcon');
            var $_id = $(this).attr('_id');
            if (!oneFlag) {
                $('.leaveSpeed input').attr('disabled', true);
                $('.safeLineTableList li').find('i').removeClass('currentOpIcon');
                $(this).find('i').addClass('currentOpIcon');
                $(this).parents('li').find('input').prop('checked', true);
                $(this).parents('li').addClass('nowLi').siblings().removeClass('nowLi');
                var speedVal = $('.leaveSpeed input').val();
                thisWidget.roamClmnOne($_id,speedVal);
                $('.startAndEndLeave').show();
                var times = thisWidget.getOneTimeById($_id) / (parseInt(speedVal) / 120);
                var startLeaveText = $('#startLeave').html();
                if(startLeaveText == '停止撤离'){
                    $('#startLeave').html('开始撤离');
                    flag = true;
                }
                startLeave1(times);
                //去除救援模拟操作
                clearRescue();
            } else {
                $('.leaveSpeed input').attr('disabled', false);
                $('.safeLineTableList li').find('i').removeClass('currentOpIcon');
                $('.leaveProgressBlue').stop().width(0);
                $('.leaveHideEl').stop().width(0);
                $('.leavePercent').stop().html('0.00%');
                thisWidget.stopRoamClmnArr([$_id]);
                thisWidget.resetAllLineStyleCL();
            }

        })

    }
    //全选、全不选

    $('.safeLineTable span').eq(0).find('input').click(function () {
        var allChecked = $(this).prop('checked');
        if (allChecked) {
            for (var i = 0; i < lineLen; i++) {
                $('.safeLineTableList li').eq(i).find('span input').prop('checked', true)
            }
        } else {
            for (var i = 0; i < lineLen; i++) {
                $('.safeLineTableList li').eq(i).find('span input').prop('checked', false)
            }
        }
        thisWidget.showHideAllLine(allChecked);
        // startLeave()
    })

}

function cheliDot(cheliDotNum) {
    $('.leaveNum i').eq(1).html(cheliDotNum);
}
function clearLeave(){
        $('.startAndEndLeave').hide();
        $('.leaveSpeed input').attr('disabled',false);
        $('.safeLineTableList li').find('i').removeClass('currentOpIcon');
        $('.safeLineTableList li').removeClass('nowLi');
        $('.leaveProgressBlue').stop().width(0);
        $('.leaveHideEl').stop().width(0);
        $('.leavePercent').stop().html('0.00%');
        $('#startLeave').html('开始撤离');
        flag = true;
}
//开始撤离
function startLeaveArr() {
    var lineLi = $('.safeLineTableList li');
    var lineLen = lineLi.length;
    var idArr = [];
    for (var i = 0; i < lineLen; i++) {
        var checked = $('.safeLineTableList li').eq(i).find('input').prop('checked');
        if (checked) {
            var id = $('.safeLineTableList li').eq(i).find('span').eq(3).attr('_id');
            idArr.push(id)
        }
    }
    return idArr;
}

function startLeave1(time) {
    $('.leaveProgressBlue').stop().width(0);
    $('.leaveHideEl').stop().width(0);
    $('.leavePercent').stop().html('0.00%');
    var time = time * 1000;
    $('.leaveProgressBlue').animate({
        width: '256px'
    }, {
        duration: time,
        step: function (now, fx) {
            var now = (((fx.now) / 256) * 100).toFixed(2);
            $('.leavePercent').html(now + '%');
            if (now > 99.99) {
                thisWidget.resetAllLineStyleCL();
            }
        }
    }, time);
    $('.leaveHideEl').animate({
        width: '256px'
    }, time, function () {
        $('#leaveSpeedVal').attr('disabled', false);
        $('.safeLineTableList li').find('i').removeClass('currentOpIcon');
    })
}


var flag = true;

function startLeave(that, time) {
    $('.leaveProgressBlue').stop().width(0);
    $('.leaveHideEl').stop().width(0);
    $('.leavePercent').stop().html('0.00%');
    var time = time * 1000;
    if (flag) {
        $(that).html('停止撤离');
        $('.leaveSpeed input').attr('disabled', true);
        $('.leaveProgressBlue').animate({
            width: '256px'
        }, {
            duration: time,
            step: function (now, fx) {
                var now = (((fx.now) / 256) * 100).toFixed(2);
                $('.leavePercent').html(now + '%');
                if (now > 99.99) {
                    thisWidget.resetAllLineStyleCL();
                }
            }
        }, time);

        $('.leaveHideEl').animate({
            width: '256px'
        }, time, function () {
            $(that).html('开始撤离');
            $('.leaveSpeed input').attr('disabled', false);
            flag = true;
        })
        flag = false;
    } else {
        $(that).html('开始撤离');
        $('.leaveProgressBlue').stop().width(0);
        $('.leaveHideEl').stop().width(0);
        $('.leavePercent').stop().html('0.00%');
        $('.leaveSpeed input').attr('disabled', false);
        flag = true;
    }
}

function isSkipStep() {
    var isHas = $('.stepRing i').eq(3).is('.nowStep');
    if (!isHas) {
        $('.faultInfo').eq(2).show().siblings().hide();
    }
}
//跳过
function skipStep() {
    $('.stepRing i').eq(4).addClass('nowStep');
    $('.faultText span').eq(2).addClass('active').siblings().removeClass('active');
    $('.faultInfo').eq(4).show().siblings().hide();
    thisWidget.stopDraw();
}

//救援路线
function rescueLine(dataArr) {
    $('.rescueNum i').html(dataArr.length);
    var rescueTableStr = '';
    for (var i = 0; i < dataArr.length; i++) {
        var name = dataArr[i].startPointData.name;
        if (name.length > 6) {
            name = name.substring(0, 6) + '...';
        }
        rescueTableStr += `<li>
                            <span>
                                <div class="checkbox">
                                    <input type="checkbox" class="styled" id="singleCheckbox1" value="option1" aria-label="Single checkbox One" checked="checked"  />
                                    <label></label>
                                </div>
                            </span>
                            <span>${ i + 1}</span>
                            <span><i title="${dataArr[i].startPointData.name}">${name}</i>--->事故点</span>
                            <span _id="${ dataArr[i]._id}"><i class="opIcon"></i></span>
                        </li>`;
    }
    $('.rescueTableList').html(rescueTableStr);
    var lineLi = $('.rescueTableList li');
    var lineLen = lineLi.length;
    for (var i = 0; i < lineLen; i++) {
        $('.rescueTableList li').eq(i).find('input').click(function () {
            var checkedBoolen = $(this).prop('checked');
            var checkNum = 0;
            if (checkedBoolen) {
                $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
            for (var i = 0; i < lineLen; i++) {
                var othercheck = $('.rescueTableList li').eq(i).find('input').prop('checked');
                if (othercheck) {
                    checkNum++;
                }
            }
            if (checkNum == lineLen) {
                $('.rescueLineTable span').eq(0).find('input').prop('checked', true);
            } else {
                $('.rescueLineTable span').eq(0).find('input').prop('checked', false);
            }
            //选中路线的id
            var rescueId = $(this).parents('li').find('span').eq(3).attr('_id');
            thisWidget.showHidelineByid_JY(rescueId, checkedBoolen);
        })

        //播放

        lineLi.eq(i).find('span').eq(3).click(function () {
            var oneOtherFl = $(this).find('i').is('.currentOpIcon');
            var $_id = $(this).attr('_id');
            if (!oneOtherFl) {
                $(this).parents('li').find('input').prop('checked', true);
                $(this).parents('li').addClass('nowLi').siblings().removeClass('nowLi');
                $('.rescueTableList li').find('i').removeClass('currentOpIcon');
                $(this).find('i').addClass('currentOpIcon');
                $('.rescueSpeed input').attr('disabled', true);
                var speedVal = $('.rescueSpeed input').val();
                thisWidget.roamJymnOne($_id, speedVal);
                $('.startAndEndRescue').show();
                var times = thisWidget.getOtherOneTimeById($_id) / (parseInt(speedVal) / 120);
                var startRescueText = $('#startRescue').html();
                if(startRescueText == '停止救援'){
                    $('#startRescue').html('开始救援');
                    otherfl = true;
                }
                startRescue1(times);
                //去除撤离模拟中的操作
                clearLeave();

            } else {
                $('.rescueSpeed input').attr('disabled', false);
                $('.rescueTableList li').find('i').removeClass('currentOpIcon');
                $('.rescueProgressBlue').stop().width(0);
                $('.rescueHideEl').stop().width(0);
                $('.rescuePercent').stop().html('0.00%');
                thisWidget.stopJymnArr([$_id]);
                thisWidget.resetAllLineStyleJY();
            }

        })

    }
    //全选、全不选

    $('.rescueLineTable span').eq(0).find('input').click(function () {
        var allChecked = $(this).prop('checked');
        if (allChecked) {
            for (var i = 0; i < lineLen; i++) {
                $('.rescueTableList li').eq(i).find('span input').prop('checked', true)
            }
        } else {
            for (var i = 0; i < lineLen; i++) {
                $('.rescueTableList li').eq(i).find('span input').prop('checked', false)
            }

        }
        thisWidget.showHideAllLine_JY(allChecked);
    })
}
//开始救援
function startRescueArr() {
    var lineLi = $('.rescueTableList li');
    var lineLen = lineLi.length;
    var idArr = [];
    for (var i = 0; i < lineLen; i++) {
        var checked = $('.rescueTableList li').eq(i).find('input').prop('checked');
        if (checked) {
            var id = $('.rescueTableList li').eq(i).find('span').eq(3).attr('_id');
            idArr.push(id)
        }
    }
    return idArr;
}

function startRescue1(time) {
    $('.rescueProgressBlue').stop().width(0);
    $('.rescueHideEl').stop().width(0);
    $('.rescuePercent').stop().html('0.00%');
    var time = time * 1000;
    $('.rescueProgressBlue').animate({
        width: '256px'
    }, {
        duration: time,
        step: function (now, fx) {
            var now = (((fx.now) / 256) * 100).toFixed(2);
            $('.rescuePercent').html(now + '%');
            if (now > 99.99) {
                thisWidget.resetAllLineStyleJY();
            }
        }
    }, time)
    $('.rescueHideEl').animate({
        width: '256px'
    }, time, function () {
        $('.rescueSpeed input').attr('disabled', false);
        $('.rescueTableList li').find('i').removeClass('currentOpIcon');
    })
}
var otherfl = true;

function startRescue(that, time) {
    $('.rescueProgressBlue').stop().width(0);
    $('.rescueHideEl').stop().width(0);
    $('.rescuePercent').stop().html('0.00%');
    var time = time * 1000;
    if (otherfl) {
        $(that).html('停止救援');
        $('.rescueSpeed input').attr('disabled', true);
        $('.rescueProgressBlue').animate({
            width: '256px'
        }, {
            duration: time,
            step: function (now, fx) {
                var now = (((fx.now) / 256) * 100).toFixed(2);
                $('.rescuePercent').html(now + '%');
                if (now > 99.99) {
                    thisWidget.resetAllLineStyleJY();
                }
            }
        }, time)
        $('.rescueHideEl').animate({
            width: '256px'
        }, time, function () {
            $(that).html('开始救援');
            $('.rescueSpeed input').attr('disabled', false);
            otherfl = true;
        })
        otherfl = false;
    } else {
        $(that).html('开始救援');
        $('.rescueProgressBlue').stop().width(0);
        $('.rescueHideEl').stop().width(0);
        $('.rescuePercent').stop().html('0.00%');
        $('.rescueSpeed input').attr('disabled', false);
        otherfl = true;
    }
}
function clearRescue(){
        otherfl = true;
        $('.startAndEndRescue').hide();
        $('#startRescue').html('开始救援');
        $('.rescueSpeed input').attr('disabled',false);
        $('.rescueTableList li').find('i').removeClass('currentOpIcon');
        $('.rescueTableList li').find('i').removeClass('nowLi');
        $('.rescueProgressBlue').stop().width(0);
        $('.rescueHideEl').stop().width(0);
        $('.rescuePercent').stop().html('0.00%');
    
}

//速度值
function speedValue(that) {
    var val = $(that).val();
    return val;
}
//清楚页面所有内容
function clearHtml() {
    $('.faultInfo').eq(0).show().siblings().hide();
    $('.faultText span').eq(0).addClass('active').siblings().removeClass('active');
    $('.stepRing i').eq(0).addClass('nowStep').siblings().removeClass('nowStep');
    //事故模拟--选点页面
    $('.faultDot').html('');
    $('#windSpeed').val(1);
    $('#windDirection').val(45);
    $('#playSpeed').val(10);
    //事故模拟--数据展示页面
    $('.affect i').html(0);
    $('.otherProgressBar').width(0);
    $('.progressDot').css({
        'left': '0px'
    });
    $('.unitFind span').eq(0).find('i').html(0);
    $('.unitFind span').eq(1).find('i').html(0);
    $('.tableList').html('');
    $('.loadMore').hide();
    //撤离模拟模拟--选点页面
    $('.safeDot').html('');
    //撤离模拟模拟--数据展示页面
    $('.rescueNum i').eq(0).html(0);
    $('.rescueNum i').eq(1).html(0);
    $('.safeLineTableList').html('');
    $('.leaveSpeed input').val(10);
    $('#startLeave').html('开始撤离');
    $('.startAndEndLeave').hide();
    flag = true;
    //救援模拟模拟--选点页面
    $('.rescueDot').html('');
    //救援模拟模拟--数据展示页面
    $('.rescueNum i').html(0);
    $('.rescueLineTableList').html('');
    $('.rescueSpeed input').val(10);
    $('#startRescue').html('开始救援');
    $('.startAndEndRescue').hide();
    otherfl = true;
}

//展示当前多少家企业撤离到安全点
function showRes(is) {
    if (is) {
        $("#showRes").show();
        $('.startAndEndLeave').show();
    } else {
        $("#showRes").hide();
        $('.startAndEndLeave').hide();
    }
}

function showPro(bol){
    if (bol) {
        $('.startAndEndRescue').show();
    } else {
        $('.startAndEndRescue').hide();
    }
}


