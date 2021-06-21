//该js是对后端服务请求的统一入口封装方法

//是否有服务端,false时存储数据在浏览器缓存内
var hasServer = false;

var baseUrl = 'http://192.168.0.40:9002';


//统一访问后台接口方法
function sendAjax(opts) {
    console.log('请求信息：\n' + JSON.stringify(opts)); //日志
    $.ajax({
        url: baseUrl + "/" + opts.url,
        type: opts.type || "post",
        dataType: opts.dataType || "json",
        timeout: opts.timeout || 12000,
        contentType: opts.contentType,
        data: opts.data,
        crossDomain: true,
        beforeSend: function (request) {
            if (opts.loading)
                haoutil.loading.show(opts.loading);
            var token = haoutil.storage.get("access_token");
            if (token)
                request.setRequestHeader("Authorization", "Bearer " + token);
        },
        success: function (result, status, xhr) {
            if (opts.loading)
                haoutil.loading.hide();
            console.log('返回结果：\n' + JSON.stringify(result)); //日志
            if (result.msg == "操作成功") {
                if (opts.success) {
                    opts.success(result.data);
                }
            } else if (result.access_token) {
                if (opts.success) {
                    opts.success(result);
                }
            } else {
                haoutil.msg(result.msg);
                if (opts.error) {
                    opts.error();
                }
            }
        },
        error: function (data) {
            if (opts.loading)
                haoutil.loading.hide();
            if (opts.noError) return;

            console.log('服务访问出错：\n' + JSON.stringify(data)); //日志

            if (data.status == 401 && window.top) {
                top.location.href = "/theme/login.html";
            }
            var msg = opts.errorMsg || ("服务访问出错(" + data.status + ")：" + data.responseText);
            haoutil.msg(msg);

            if (opts.error) {
                opts.error();
            }
        }
    });
}

//模拟登录
function sendLoginAjax(arg) {
    var username = arg.username;
    var password = arg.password;
    var client_id = arg.client_id || "d809b060-9506-44b8-9689-d804d1804778";
    var client_secret = arg.client_secret || "e5572d49-70b4-43bd-96ba-380556e66692";
    if (!username || !password || !client_id || !client_secret) return;
    if (!hasServer) return;
    sendAjax({
        url: "public/login",
        data: "username=" + username + "&password=" + password + "&client_id=" + client_id + "&client_secret=" + client_secret,
        type: "post",
        success: function (data) {
            haoutil.storage.add("access_token", data.access_token);
            haoutil.storage.add("refresh_token", data.refresh_token);
            //获取当前用户的userId
            getUserId();
        }
    });
}

var userId;
function getUserId() {
    sendAjax({
        url: "v1/user/me",
        type: "get",
        success: function (data) {
            userId = data.userId;
        }
    });
}



//模拟登录
if (hasServer) {
    sendLoginAjax({
        username: "admin",
        password: "admin"
    });
}
