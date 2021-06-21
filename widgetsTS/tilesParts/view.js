//对应widget.js中MyWidget实例化后的对象
var thisWidget;
var layers = [];
var layersObj = {};

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {
        $("body").addClass(thisWidget.config.style);
    }

   thisWidget.getTreeUrl(); 
  

    $("#btn_back").click(function (e) {
        thisWidget.resetStyle();
        $("#viewReset").hide();
    });

}



function name2text(o) {
    o.text = o.name;

    //这块为了避免tree控件里的id不统一，所以加改变一下
    o.eleid = o.id;
    o.id = undefined;
     
    if ((!o.text || o.text.trim() == "") && o.type)
        o.text = o.type;

    if (o.children) {
        for (var i = 0; i < o.children.length; i++) {
            name2text(o.children[i]);
        }
    }
}
 
function initSceneTree(scene) {
    var data = [];
    if (scene.scenes) {
        for (var i = 0; i < scene.scenes.length; i++) {
            var node = scene.scenes[i];
            name2text(node);
            data.push(node);
        }
    }
    else {
        name2text(scene);
        data.push(scene);
    }

    $('#treeOverlays').jstree({ 
        core: {
            data: data,
            "themes": {
                "name": "default-dark",
                "dots": true,
                "icons": true
            },
        }
    });
    $('#treeOverlays').on("changed.jstree", function (e, data) {
        var node = data.node.original;
        if (node && node.sphere) { 
            thisWidget.locateNode(node.eleid, node.sphere);

            $("#viewReset").show();
        }
    });

 
}


 