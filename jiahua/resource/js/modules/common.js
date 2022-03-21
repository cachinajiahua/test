var lyxFn = {
    init: function () {
        this.header(),
            this.login(),
            this.otherslide()
    },
    header: function () {
        var that = this;
        this.hover($(".tpy-company-branch"), $(".tpy-company-ul")); //顶部导航条分公司hover  	
        $(".tpy-company-ul").hover(function () { //顶部导航条分公司展开效果
            var $this = $(this);
            $(".tpy-company-branch").addClass("on");
            $this.removeClass("hide");
        }, function () {
            var $this = $(this);
            $this.addClass("hide");
            $(".tpy-company-branch").removeClass("on");
        });

        this.hover($(".tpy-contact-chat"), $(".tpy-chat-box")); //顶部导航条微信关注
        this.hover($(".tpy-contact-tel"), $(".tpy-tel-box")); //顶部导航条直接联系
        this.hover($(".tpy-login"), $(".tpy-login-box")); //顶部导航条登录账号后hover出现下拉菜单
        this.hover($(".tpy-index-login"), $(".tpy-index-login-box")); //顶部导航条登录账号后hover出现下拉菜单
        $(".tpy-login-box").hover(function () { //登录账号后hover出现的下拉菜单，菜单hover时
            var $this = $(this);
            $(".tpy-login").addClass("on");
            $this.removeClass("hide");
        }, function () {
            var $this = $(this);
            $this.addClass("hide");
            $(".tpy-login").removeClass("on");
        });
        $(".tpy-index-login-box").hover(function () { //登录账号后hover出现的下拉菜单，菜单hover时
            var $this = $(this);
            $(".tpy-index-login").addClass("on");
            $this.removeClass("hide");
        }, function () {
            var $this = $(this);
            $this.addClass("hide");
            $(".tpy-index-login").removeClass("on");
        });

        this.hover($(".tpy-login-bar"), $(".tpy-login-box-bar"));
        $(".tpy-login-box-bar").hover(function () { //顶部导航条分公司展开效果
            var $this = $(this);
            $(".tpy-login-bar").addClass("on");
            $this.removeClass("hide");
        }, function () {
            var $this = $(this);
            $this.addClass("hide");
            $(".tpy-login-bar").removeClass("on");
        });

        (function () {
            //nav中移民国家，项目，划过后js
            $(".js-nav-country").hover(function () {
                var $this = $(this),
                    $this_box = $this.find(".js-country-box");
                $this.addClass("on");
                $this_box.removeClass("hide");
            }, function () {
                var $this = $(this),
                    $this_box = $this.find(".js-country-box");
                $this.removeClass("on");
                $this_box.addClass("hide");
            });
            //nav国家左右侧列表，项目左右侧列表初始化class
            $(".js-nav-country").each(function () {
                var $this = $(this),
                    left_p = $this.find(".nav-country-left p"),
                    right_p = $this.find(".nav-country-right p");
                left_p.eq(0).addClass("on");
                right_p.eq(0).addClass("show");
            });
            //nav国家左侧列表，项目左侧列表hover后
            $(".js-nav-country .nav-country-left p").hover(function () {
                var $this = $(this),
                    index = $this.index();
                $this.addClass("on").siblings().removeClass("on");
                $this.parent(".nav-country-left").next().find("p").eq(index).addClass("show").siblings().removeClass("show");
            });
            //nav中go太平洋划过后js
            $(".js-nav-company").hover(function () {
                var $this = $(this),
                    $this_width = $this.outerWidth(),
                    $this_box = $this.find(".nav-company-box");
                $this.addClass("on");
                $this_box.removeClass("hide").outerWidth($this_width);
            }, function () {
                var $this = $(this),
                    $this_box = $this.find(".nav-company-box");
                $this.removeClass("on");
                $this_box.addClass("hide");
            });
        }());
        //首页导航效果
        (function () {
            //nav中移民国家，项目，划过后js
            $(".index-nav-country").hover(function () {
                var $this = $(this),
                    $this_box = $this.find(".js-index-country");
                $this.addClass("on");
                $this_box.removeClass("hide");
            }, function () {
                var $this = $(this),
                    $this_box = $this.find(".js-index-country");
                $this.removeClass("on");
                $this_box.addClass("hide");
            });
            //nav国家左右侧列表，项目左右侧列表初始化class
            $(".index-nav-country").each(function () {
                var $this = $(this),
                    left_p = $this.find(".index-country-left p"),
                    right_p = $this.find(".ndex-country-right p");
                left_p.eq(0).addClass("on");
                right_p.eq(0).addClass("show");
            });
            //nav国家左侧列表，项目左侧列表hover后
            $(".index-nav-country .index-country-left p").hover(function () {
                var $this = $(this),
                    index = $this.index();
                $this.addClass("on").siblings().removeClass("on");
                $this.parent(".index-country-left").next().find("p").eq(index).addClass("show").siblings().removeClass("show");
            });
            //nav中go太平洋划过后js
            $(".js-index-company").hover(function () {
                var $this = $(this),
                    $this_width = $this.outerWidth(),
                    $this_box = $this.find(".index-company-box");
                $this.addClass("on");
                $this_box.removeClass("hide").outerWidth($this_width);
            }, function () {
                var $this = $(this),
                    $this_box = $this.find(".index-company-box");
                $this.removeClass("on");
                $this_box.addClass("hide");
            });

        }());



        (function () { //账号登录后，下拉列表的宽度=登录后账号的宽度
            var login = $(".tpy-header-status .tpy-login"),
                login_box = login.next(".tpy-login-box"),
                login_width = login.outerWidth();
            login_box.outerWidth(login_width + 2);
        }());
        //顶部广告位
        (function(){
        	var ad = $('.js-ad');
        	// if(ad.length){
        	// 	ad.slideDown(1200,function(){
        	// 		setTimeout(function(){
	        // 			ad.slideUp(1200);
	        // 		},10000);
        	// 	});
        	//
        	// }
        }());

    },
    hover: function (hoverobj, showobj) { //hover时，showobj显示，否，隐藏
        hoverobj.hover(function () {
            var $this = $(this);
            $this.addClass("on");
            showobj.removeClass("hide");
        }, function () {
            var $this = $(this);
            $this.removeClass("on");
            showobj.addClass("hide");
        });
    },
    login: function () {
        $(".js-log-btn li").on("click", function () { //注册登录按钮点击事件
            var $this = $(this),
                index = $this.index();
            $(".js-login-alert,.js-alert-box").removeClass("hide");
            $(".js-alert-mmbox").addClass("hide");
            $(".tpy-login-title li").eq(index).addClass("on").siblings().removeClass("on");
            $(".tpy-login-context").eq(index).removeClass("hide").addClass("on");
            $(".tpy-login-context").eq(index).siblings().removeClass("on").addClass("hide");
        });
        this.tab($(".js-login-title li"), $(".tpy-login-context")); //弹出框中，注册登录按钮切换
        $(".js-login-forget").on("click", function () { //弹出框中，点击忘记密码，弹出重置密码弹出框
            $(this).parents(".js-alert-box").find(".on").removeClass("on").end().addClass("hide");
            $(".js-alert-mmbox").removeClass("hide");
        });

        $(".js-login-alert").bind('click', function (ev) { //点击弹出框以外的黑色背景，隐藏弹框
            var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
            var evt = $(touch.target);
            if (evt.parents().hasClass('js-alert-box') || evt.parents().hasClass('js-alert-mmbox')) {
                return; // 如果是元素本身，则返回
            } else {
                $('.js-login-alert').addClass("hide"); // 如不是则隐藏元素
            }
        });


    },
    tab: function (hoverobj, showobj) { //tab切换
        hoverobj.on("click", function () {
            var $this = $(this),
                index = $this.index();
            $this.addClass("on").siblings().removeClass("on");
            showobj.eq(index).removeClass("hide").addClass("on").siblings(showobj).addClass("hide").removeClass("on");
        });
    },
    otherslide: function () { //二级页面中banner轮换
        if ($('.js-bxslider').length > 0) {
            $('.js-bxslider').bxSlider({
                captions: true, //自动控制 
                auto: true,
                controls: false, //隐藏左右按钮 
                pause: typeof officialFrequency == "undefined" ? 4000 : officialFrequency * 1000, //停留时间
                speed: 500, //切换时间
                infiniteLoop: true
            });
        }


    }
};
lyxFn.init();