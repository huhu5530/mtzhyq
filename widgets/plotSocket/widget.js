(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "divwindow",
                url: "view.html",
                windowOptions: {
                    width: 400,
                    height: 110
                }
            }
        }

        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            var that = this;

            var lasturl = haoutil.storage.get("plot_ws");
            if (lasturl) {
                $("#txtWSUrl").val(lasturl);
                that.connectionWS(lasturl);
            }

            $("#txtCoonWS").click(function () {
                var url = $("#txtWSUrl").val();
                haoutil.storage.add("plot_ws", url);

                that.connectionWS(url);
            });

            $("#txtColseWS").click(function () {
                that.closeSocket();
            });

        }
        //激活插件
        activate() {


        }
        //释放插件
        disable() {
            this.viewWindow = null;


        }
        showMsg(msg) {
            $("#lblMsg").html(msg);
        }
        /**
         * WebSocket客户端 
         * 使用说明：
         * 1、WebSocket客户端通过回调函数来接收服务端消息。例如：webSocket.onmessage
         * 2、WebSocket客户端通过send方法来发送消息给服务端。例如：webSocket.send();
         */
        connectionWS(webSocketUrl) {
            var that = this;

            this.closeSocket();

            /**  WebSocket客户端 PS：URL开头表示WebSocket协议 中间是域名端口 结尾是服务端映射地址 */
            var webSocket = new WebSocket(webSocketUrl);

            /** 当服务端打开连接 */
            webSocket.onopen = function (event) {
                console.log('WebSocket打开连接');
                that.showMsg('已连接');
            };
            /** 通信失败   */
            webSocket.onerror = function (event) {
                console.log('WebSocket发生异常');
                that.showMsg('连接发生异常');
            };
            /** 关闭连接 */
            webSocket.onclose = function (event) {
                console.log('WebSocket关闭连接');
                that.showMsg('连接已关闭');

            };
            /** 当服务端发来消息：1.广播消息 2.更新在线人数  */
            webSocket.onmessage = function (event) {
                console.log('WebSocket接收到消息');
                console.log(event.data);

                var data = JSON.parse(event.data);
                that.config.updateAttr(data);
            };
            this.webSocket = webSocket;

            return webSocket;
        }
        closeSocket() {
            if (this.webSocket) {
                this.webSocket.close();
                delete this.webSocket;
            }
        }
        sendSocket(json) {
            if (!this.webSocket) return;

            console.log('发送了WebSocket消息');
            console.log(json);

            this.webSocket.send(JSON.stringify(json));
        }

    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 