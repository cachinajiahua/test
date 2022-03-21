function isDaylight() {
    var currdate = new Date();
    var starthours = 8;//开始小时
    var startmintes = 0;
    //开始分钟
    var endhours = 23;
    //结束小时
    var endminutes = 0;//结束分钟

    if (((currdate.getHours() > starthours) && (currdate.getHours() < endhours))
        || ((currdate.getHours() == starthours) && (currdate.getMinutes() >= startmintes))
        || ((currdate.getHours() == endhours) && (currdate.getMinutes() < endminutes))
    ) {
        return false;

    }
    return true;

}

if (!isDaylight()) {

    (function(a, b, c, d, e, j, s) {
        a[d] = a[d] || function() {
            (a[d].a = a[d].a || []).push(arguments)
        };
        j = b.createElement(c),
            s = b.getElementsByTagName(c)[0];
        j.async = true;
        j.charset = 'UTF-8';
        j.src = 'https://static.meiqia.com/widget/loader.js';
        s.parentNode.insertBefore(j, s);
    })(window, document, 'script', '_MEIQIA');
    _MEIQIA('entId', '7ef3bfa9f6d1fee2a66f77f6c3178442');
    //点击事件切换为美洽
    window.ydtopenchat=function()
    {
        _MEIQIA('showPanel');
    }

    var _timer = null;
    function yourFunction(visibility) {
        if (visibility === 'visible') {
            clearTimeout(_timer);
            _timer = null
        } else {
            if (_timer == null) {
                _timer = setTimeout(function(){
                    _MEIQIA('showPanel');
                }, 20000);
            }
        }
    }
    setTimeout(function () {
        _MEIQIA('showPanel');
    },6000)

    setInterval(function () {
        _MEIQIA('getPanelVisibility', yourFunction);
    },1000)
} else {

    //易聊js引入
    document.writeln("<script type='text/javascript' charset='UTF-8' src='//scripts.easyliao.com/js/easyliao.js'></script>");
    //下面的代码 需要更换成自己公司管理后台生成的代码
    document.writeln("<script type='text/javascript' charset='UTF-8' src='//scripts.easyliao.com/32947/62511.js'></script>");
    //点击事件切换为易聊
    window.ydtopenchat = function (param1, param2) {
        try {
            //openJesongChatByGroup( 32947, 39677,0,param1&&param1.input_wd);
            openJesongChatByGroup(32947, 39677);
        } catch (err) {
            window.location.href = "http://live.easyliao.com/live/chat.do?c=32947&g=39677";
        }
    }
}