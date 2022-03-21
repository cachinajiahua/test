function changeText(arr, maxLength, that) {
    if ($(that).data('current')) {
        var current = $(that).data('current');
        if (arr.indexOf(current) >= 0) {
            $(that).text('+加入对比');
        } else {
            $(that).text('已加入对比');
        }
    }
}

function changeClass(arr, maxLength, that) {
    if ($(that).data('current')) {
        var current = $(that).data('current');
        if (arr.indexOf(current) >= 0) {
            $(that).removeClass('selected');
            arr.splice(arr.indexOf(current), 1);
        } else if (arr.length >= maxLength) {
            alert('一次做多只能选择' + maxLength + '个');
        } else {
            arr.push(current);
            $(that).addClass('selected');
        }
    }
}

// 点击对比检查事件
function checkContrast(arr, maxLength, that) {
    changeText(arr, maxLength, that);
    changeClass(arr, maxLength, that);
}

// form表单验证
var formCheck = {
    checkNull: function (val) {
        if (Object.prototype.toString.call(val) == '[object Array]') {
            return val.every(function (value) {
                return value !== null && value !== undefined && value !== '';
            })
        } else {
            if (val === null || val === undefined || val === '') {
                return false;
            } else {
                return true;
            }
        }
    },
    checkPhone: function (phone) {
        if (isNaN(phone)) {
            return 'errorType';
        } else if (phone.length < 11) {
            return 'errorLength';
        } else {
            return true;
        }
    },
    checkArray: function (array, name) {
        if (!array || array.length == 0) {
            return false;
        } else {
            return true;
        }
    }
};

// 获得指定元素的data属性
function getData(target, name) {
    return target.data(name);
}

// 项目立即对比
function projectContrastNow(arr, type) {
    var flag = formCheck.checkArray(arr);
    if (flag) {
        if (type === 'project') {
            location.href = '/project_contrast?projectIds=' + arr;
        } else {
            location.href = '/state_contrast?country=' + arr.join(',');
        }
    } else {
        alert('请选择要对比的项目');
    }
}

// 定制化表单提交
function customizeFormSubmit(params, successCB, errorCB) {
    if (arguments.length < 3) {
        function callbackSuccess() {
            console.error('请传入成功回调函数');
        }
        function callbackError() {
            alert('出错啦，请刷新重试!');
        }
        switch (arguments.length) {
            case 1:
                successCB = callbackSuccess;
                errorCB = callbackError;
                break;
            case 2:
                errorCB = callbackError;
                break;
        }
    }
    if (Object.prototype.toString.call(params) == '[object Object]') {
        var flag = Object.keys(params).every(function (value) {
            return value === 'username' || value === 'userphone' || value === 'usergoal' || value === 'userintent' || value === 'refer' || value === 'data';
        });
        var username = params.username || '',
            userphone = params.userphone || '',
            usergoal = params.usergoal,
            userintent = params.userintent || '',
            data = 'data' in params ? params.data : {};
        if (flag) {
            if (!formCheck.checkNull([username, userphone, usergoal])) {
                alert('请填写您的信息');
            } else if (formCheck.checkPhone(userphone) === 'errorLength') {
                alert('请填写11位手机号');
            } else {
                $.ajax({
                    type: 'POST',
                    url: '/api/web/message',
                    async: true,
                    data: data,
                    success: function (data) {
                        if (200 == data.code) {
                            successCB();
                        } else {
                            errorCB();
                            console.error(data);
                        }
                    },
                    error: function (data) {
                        errorCB();
                        console.error(data);
                    }
                });
            }
        } else {
            alert('表单填写错误！');
            console.error('请按照规范传入参数');
        }
    } else {
        alert('出错啦！');
        console.error('该方法需要一个对象');
    }
}

// 私人订制信息组装
function customizeInfoInstall(target, success, error, source) {
    if (arguments.length < 3) {
        switch (arguments.length) {
            case 2:
                error = function () {
                    alert('出错啦，请刷新重试!');
                };
                break;
            case 1:
                success = function () {
                    console.error('请传入成功回调函数');
                };
                error = function () {
                    alert('出错啦，请刷新重试!');
                };
                break;
        }
    }
    var username = target.children('.username').val(),
        userphone = target.children('.userphone').val(),
        usergoal = target.children('.goal').val(),
        userintent = target.children('.intent').val(),
        refer = target.children('#refer').val();

    customizeFormSubmit({
        username: username,
        userphone: userphone,
        usergoal: usergoal,
        userintent: userintent,
        refer : refer,
        data: {
            source: source || 'custom',
            content: userintent,
            tel: userphone,
            username: username,
            purpose: usergoal,
            refer : refer
        }
    }, success, error);
}

// 轮播图点击事件
function swiperClick() {
    function clickFuc(that) {
        var link = that.dataset.link ? that.dataset.link : '';
        if (link !== '') {
            location.href = link;
        }
    }
    $('.headerSwiper .swiper-slide').click(function (e) {
        clickFuc(this);
    });
    $('.projectHeaderSwiper .swiper-slide').click(function (e) {
        clickFuc(this);
    });
}
swiperClick();

// 获得最新活动
$.ajax({
    type: 'post',
    url: '/api/web/newActivity',
    async: true,
    data: {},
    success: function (data) {
        if (200 == data.code) {
            sessionStorage.setItem('newActivityId', data.data.id);
            sessionStorage.setItem('newActivityName', data.data.name);
            sessionStorage.setItem('newActivityNum', data.data.sign_in_number);
        } else {
            sessionStorage.removeItem('newActivityId');
            sessionStorage.removeItem('newActivityName');
            sessionStorage.removeItem('newActivityNum');
        }
    },
    error: function (data) {
        console.error(data, 'error');
        sessionStorage.removeItem('newActivityId');
        sessionStorage.removeItem('newActivityName');
        sessionStorage.removeItem('newActivityNum');
    }
});

$(function () {
    // 活动预约部分的变量
    var activityId, activityName, activityFlag = true, toolkitActivity = false;

    /* 首页导航栏 */

    // 首页nav的宽度计算
    if ($('.homeNav-child').length >= 1) {
        $('.homeNav-child').each(function (i, ele) {
            var arr = [], max;
            $(ele).children('li').each(function (index, element) {
                if ($(element).children('ul').length >= 1) {
                    $(element).children('ul').each(function (ind, ele) {
                        arr.push($($(ele).children('li')).children('a').length);
                    })
                }
            });
            max = Math.max.apply(null, arr);
            $($(ele).children('li')).children('ul').css('width', 190 * (max > 3 ? 3 : max) + 'px');
            if ($(ele).parent().hasClass('turnLeft')) {
                $($(ele).children('li')).children('ul').css('left', -190 * (max > 3 ? 3 : max) + 'px');
            }
        })
    }
    // 首页nav的hover交互
    $('.homeNav').hover(function () {
        $(this).children('a').siblings().show();
    }, function () {
        $(this).children('a').siblings().hide();
    });
    $('.homeNav-child li').hover(function () {
        $(this).children('a').siblings().css('backgroundColor', '#1f2964');
    }, function () {
        $(this).children('a').siblings().css('backgroundColor', '#1e2864');
    });

    // 监听页面滚动并对nav进行改变的方法
    function scrollNav() {
        var top = parseInt($(document).scrollTop());
        if (top >= 155) {
            $('.homeHeader-nav').css({
                'position': 'fixed',
                'top': '0'
            });
            $('.headerSwiper').css('margin-top', '54px');
            $('.projectHeaderImg').css('margin-top', '54px');
        } else {
            $('.homeHeader-nav').css({
                'position': 'static',
            });
            $('.headerSwiper').css('margin-top', '0');
            $('.projectHeaderImg').css('margin-top', '0');
        }
        if (top > 0) {
            $('.homeToolkit-returnTop').show();
        } else if (top == 0) {
            $('.homeToolkit-returnTop').hide();
        }
        if ($('.active .selected .order-triangle').css('display') && $('.active .selected .order-triangle').css('display') != 'none') {
            $('.order-modal').hide();
            $('.order-triangle').hide();
        }
        if ($('.onlineConsultModal').css('display') && $('.onlineConsultModal').css('display') != 'none') {
            $('.onlineConsultModal').hide();
            $('.onlineConsultModal-triangle').hide();
        }
    };
    scrollNav();

    /* 首页导航栏结束 */


    /* 全局事件 */

    // 超大屏幕适配
    function bigWindow() {
        if ($(window).width() > 1920) {
            $('.headerGuide').css('top', $('.headerSwiper .swiper-container').height() + 180 + 'px');
        } else {
            if (parseInt($('.headerGuide').css('top')) > 680) {
                $('.headerGuide').css('top', $('.headerSwiper .swiper-container').height() + 180 + 'px');
            }
        }
    }

    window.onresize = bigWindow;
    // 监听页面滚动事件
    $(window).scroll(scrollNav);
    // 返回顶部
    $('.homeToolkit-returnTop').click(function (e) {
        $("body").animate({scrollTop: 0}, 500, function () {
            $('.homeToolkit-returnTop').children('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/returnTop.svg');
        });
    });
    // 绑定全局点击事件，判断移民大课堂部分的modal
    $(document).bind("click", function (e) {
        var targetName = e.target.className;
        if (targetName.indexOf('formModal') < 0 && targetName != 'form-info_btn') {
            $('.form-info .onlineConsultModal').hide();
            $('.form-info .onlineConsultModal-triangle').hide();
        }
    });
    // 右侧工具栏
    $('.homeToolkit a, .homeToolkit p').mouseenter(function (e) {
        var text = $(this).find('span').html(),
            className = e.currentTarget.className
        ;
        switch (text) {
            case '在线咨询':
                $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/words.svg');
                break;
            case '资料下载' :
                $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/downloadHover.svg');
                break;
            case '快速评估':
                $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/assessHover.svg');
                break;
            case '返回顶部':
                $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/returnTopHover.svg');
                break;
        }
        if (className == 'homeToolkit-wechat') {
            $(this).find('.wechatImg')[0].src = 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/wechatHover.svg';
            $('.homeToolkit-wechat_qrcode').show();
        } else if (className == 'activityOrder') {
            $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/previewHover.svg');
        }
    });
    $('.homeToolkit a, .homeToolkit p').mouseleave(function (e) {
        var text = $(this).find('span').html(),
            className = e.currentTarget.className;
        switch (text) {
            case '在线咨询':
                $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/wordsNormal.svg');
                break;
            case '资料下载' :
                $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/download.svg');
                break;
            case '快速评估':
                $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/pinggu.svg');
                break;
            case '返回顶部':
                $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/returnTop.svg');
                break;
        }
        if (e.currentTarget.className == 'homeToolkit-wechat') {
            $(this).find('.wechatImg')[0].src = 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/wechat.svg';
            $('.homeToolkit-wechat_qrcode').hide();
        } else if (className == 'activityOrder') {
            $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/preview.svg');
        }
    });

    function activityOrderFuc() {
        $('.homeToolkit-modal .homeToolkit-modal_back').show();
        $('.homeToolkit-modal .homeToolkit-modal_back .order-modal').show();
    }

    // 活动预约点击事件
    $('.activityOrder').click(function () {
        activityFlag = false;
        if (sessionStorage.getItem('newActivityId') && sessionStorage.getItem('newActivityName') && sessionStorage.getItem('newActivityNum')) {
            if (!toolkitActivity) {
                toolkitActivity = true;
                $('.homeToolkit-modal_back').find('.order-modal_success span').html(sessionStorage.getItem('newActivityNum'));
            }
            activityOrderFuc();
        } else {
            alert('暂时没有活动可以预约，敬请关注！');
        }
    });
    $('.previewBtn').click(function () {
        activityFlag = false;
        if (sessionStorage.getItem('newActivityId') && sessionStorage.getItem('newActivityName') && sessionStorage.getItem('newActivityNum')) {
            if (!toolkitActivity) {
                toolkitActivity = true;
                $('.homeToolkit-modal_back').find('.order-modal_success span').html(sessionStorage.getItem('newActivityNum'));
            }
            activityOrderFuc();
        } else {
            alert('暂时没有活动可以预约，敬请关注！');
        }
    });
    setTimeout(function () {
        $('.immediateConsultation').click(function () {
//             window.open('https://tb.53kf.com/code/client/10141314/1');
//             var btnDisplay = document.getElementById('mini-btn').style.display;
//             if (btnDisplay === 'none') {
//                 hide_floatWindow();
//             } else {
//                 show_floatWindow();
//             }
            if(!isDaylight){
                _MEIQIA('showPanel');
            }else{
                ydtopenchat()
            }
//             max_from_company_mini(this);
            $(this).trigger('mouseleave');
            $(this).find('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/words.svg');
        });
    }, 1);

    // 清空模态框数据
    function clearModal(flag) {
        setTimeout(function () {
            $('.order-modal').hide();
            $('.order-triangle').hide();
            $('.order-modal_successTips').hide();
            $('.homeToolkit-modal_back').hide();
            $('.order-modal').find('input').val('');
            if (flag) {
                var target = $('.order-modal').find('.order-modal_success span');
                var num = parseInt(target.html());
                target.html(num + 1);
            }
        }, 1000);
    }

    /* 全局事件结束 */


    /* 首页头部轮播 */
    // headerSwiper初始化
    var headerSwiper = new Swiper('.headerSwiper .swiper-container', {
        loop: true,
        autoplay: true,
        // 如果需要分页器
        pagination: {
            el: '.headerSwiper .swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.headerSwiper .control-wrapper .swiper-button-next',
            prevEl: '.headerSwiper .control-wrapper .swiper-button-prev',
        },
        effect: 'fade',
        speed: 1000
    });
    // headerSwiper hover停止
    $('.headerSwiper .swiper-container').hover(function (e) {
        headerSwiper.autoplay.stop();
    }, function (e) {
        headerSwiper.autoplay.start();
    });
    /* 首页头部轮播结束 */


    /* 活动部分 */

    // 活动的点击切换
    $('#homeActivityContent .tab-content_order').click(function () {
        if (!$(this).hasClass('selected') && !$(this).hasClass('order-content_right')) {
            $(this).addClass('selected').siblings().removeClass('selected');
            $('#homeActivityContent .active .order-modal').hide();
            $('#homeActivityContent .active .order-triangle').hide();
        }
    });
    // 已经选中的活动，点击头部跳转到活动详细页
    $('#homeActivityContent .tab-content_order .order-title').click(function (e) {
        if ($(this).parent().hasClass('selected')) {
            location.href = '/activity/' + this.dataset.activityid;
        }
    });

    /* 活动部分结束 */


    /* 预约部分 */

    // 预约报名点击事件
    $('.order-content_right').click(function (e) {
        activityId = e.target.dataset.tabid;
        activityName = e.target.dataset.activityname;
        if (!$(this).hasClass('doned')) {
            if ($('#homeActivityContent .active .order-modal').css('display') == 'none') {
                $('#homeActivityContent .active .order-modal').show();
                $('#homeActivityContent .active .order-triangle').show();
            }
        }
    });
    // 报名模态框关闭事件
    $('.order-modal .order-modal_close').click(function (e) {
        if ($('.active .selected .order-modal').css('display') != 'none') {
            $('.order-modal').hide();
            if ($('.order-triangle').css('display') != 'none') {
                $('.order-triangle').hide();
            }
        }
        if ($('.homeToolkit-modal_back').css('display') != 'none') {
            $('.homeToolkit-modal_back').hide();
        }
    });
    // 预约模态框中提交按钮的点击事件
    $('.order-modal .order-modal_btn').click(function (e) {
        var target = $(this).siblings('.order-modal_info').children('.info');
        var username = target.children('.username').val(),
            userphone = target.children('.userphone').val(),
            patern = new RegExp([0 - 9])
        ;
        if (!activityFlag) {
            activityName = sessionStorage.getItem('newActivityName');
            activityId = sessionStorage.getItem('newActivityId');
        }
        if (!username || !userphone) {
            alert('请完整填写您的信息');
        } else if (userphone.length != 11) {
            alert('请填写正确长度的手机号');
        } else {
            var params = {
                    username: username,
                    userphone: userphone,
                    usergoal: activityName,
                    data: {
                        source: 'activity',
                        username: username,
                        tel: userphone,
                        content: activityName,
                        target_ids: '[' + activityId + ']',
                        refer:$("#refer").val()
                    }
                },
                success = function () {
                    $('.order-modal_successTips').text('恭喜您，提交成功！');
                    $('.order-modal_successTips').css('display', 'block');
                    clearModal(true);
                },
                error = function () {
                    $('.order-modal_successTips').text('提交失败，请刷新页面重试！');
                    $('.order-modal_successTips').css('display', 'block');
                    clearModal(false);
                }
            ;
            customizeFormSubmit(params, success, error);
        }
    });

    /* 预约部分结束 */


    /* 顾问部分 */

    // adviserSwiper初始化
    var adviserSwiper, tabLength = $('.adviserBody').find('.tab li').length;
    var tabWidth = ((1220 - 20 * (tabLength - 1)) / tabLength) - 10;
    var adviserSwiperInit = function () {
        adviserSwiper = new Swiper('.adviserBody-content .active .swiper-container', {
            loop: true,
            slidesPerView: 5,
            spaceBetween: 30,
            navigation: {
                nextEl: '.adviserBody-content .active .swiper-button-next',
                prevEl: '.adviserBody-content .active .swiper-button-prev',
            },
            autoplay: {
                delay: 2000,
            }
        });
        $('.adviserBody-content .active .swiper-container').mouseenter(function (e) {
            adviserSwiper.autoplay.stop();
        });
        $('.adviserBody-content .active .swiper-container').mouseleave(function (e) {
            adviserSwiper.autoplay.start();
        });
        $('.adviserBody-content .active .swiper-container .swiper-slide').mouseenter(function (e) {
            $(this).find('.boxShadow').show();
        });
        $('.adviserBody-content .active .swiper-container .swiper-slide').mouseleave(function (e) {
            $(this).find('.boxShadow').hide();
        });
        $('.adviserBody-content .active img').click(function (e) {
            location.href = '/consultant_detail?id=' + this.dataset.adviser;
        });
    };
    adviserSwiperInit();
    // 头部tab默认事件
    $('.adviserBody').find('.tab li').each(function (index, value) {
        $(this).width(tabWidth);
    });
    // 切换时初始化swiper
    $('.adviserBody li').click(function (e) {
        if (!$(this).hasClass('active')) {
            setTimeout(function () {
                adviserSwiperInit();
            }, 1);
        }
    });

    /* 顾问部分结束 */


    /* 移民大课堂部分 */

    $('.homeVideo-body .tab-pane .class').click(function (e) {
        location.href = '/immigrant_classroom/' + $(this).data('video');
    });

    /* 移民大课堂部分结束 */


    // //移民大课堂部分立即提交
    // $('.homeVideo-body_right .form-info_btn').click(function () {
    //     var target = $(this).siblings();
    //     var username = target.children('.username').val(),
    //         userphone = target.children('.userphone').val(),
    //         usergoal = target.children('.goal').val(),
    //         userintent = target.children('.intent').val();
    // if ($('.form-info .onlineConsultModal').css('display') == 'none') {
    //     $('.form-info .onlineConsultModal').show();
    //     $('.form-info .onlineConsultModal-triangle').show();
    // }
    //
    // });

    /* 大事件部分 */

    var breakingAutoplay = false;
    if (document.getElementById('homeBreakingNews')) {
        var num = parseInt($('#homeBreakingNews .swiper-container').data('count'));
        if (num <= 4) {
            breakingAutoplay = true;
        }
    }
    // 移民大事件swiper初始化
    var breakingNews = new Swiper('.homeBreakingNews-body .swiper-container', {
        loop: true,
        slidesPerView: 4,
        slidesPerGroup: 1,
        spaceBetween: 18,
        autoplay: breakingAutoplay ? false : {
            delay: 2000
        },
        // pagination: {
        //     el: '.homeBreakingNews-body .swiper-pagination',
        //     clickable: true
        // },
    });
    $('.homeBreakingNews-body .swiper-container').hover(function (e) {
        breakingNews.autoplay.stop();
    }, function (e) {
        if (!breakingAutoplay) {
            breakingNews.autoplay.start();
        }
    });
    // 热线hover事件
    $('.hotLine-view').hover(function (e) {
        $(this).children().each(function (index, ele) {
            if ($(ele)[0].className == 'left') {
                $(ele).children('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/phoneHover.svg');
            } else {
                $(ele).children('img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/infoHover.svg');
            }
        })
    }, function (e) {
        $('.hotLine-view .left img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/phoneNormal.svg');
        $('.hotLine-view .right img').attr('src', 'http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/infoNormal.svg');
    });

    /* 大事件部分结束 */


    /* 热门移民部分 */

    // 热门移民swiper初始化
    var hotImmigrantSwiper;
    var hotImmigrantInit = function () {
        hotImmigrantSwiper = new Swiper('.hotImmigrantSwiper .swiper-container', {
            loop: true,
            slidesPerView: 3,
            spaceBetween: 30,
            navigation: {
                nextEl: '.hotImmigrantSwiper .swiper-button-next',
                prevEl: '.hotImmigrantSwiper .swiper-button-prev',
            },
        })
    };
    hotImmigrantInit();

    /* 热门移民部分结束 */


    // 切换时初始化swiper
    // $('.hotImmigrant-title li').click(function (e) {
    //     if ($(this)[0].className.indexOf('active') < 0) {
    //         setTimeout(function () {
    //             hotImmigrantInit();
    //         }, 1);
    //     }
    // });

    /* 移民专题部分 */

    // 移民专题hover事件
    var spanUp = function (e) {
        $(e.currentTarget).children('span').animate({height: "43px"});
    };
    var spanDown = function (e) {
        $(e.currentTarget).children('span').animate({height: "0"});
    };
    // $('.homeSeminar-content_left').hover(spanUp, spanDown);
    $('.homeSeminar-content_right .seminar').hover(spanUp, spanDown);

    /* 移民专题部分结束 */


    /* 底部链接列表 */

    var footerTarget = $('.homeFooter-list').find('ul');
    var footerListLength = footerTarget.length;
    var footerRight = Math.floor((1196 - (120 * footerListLength)) / (footerListLength - 1)) - 1;
    footerTarget.each(function (index, val) {
        if (index != footerListLength - 1) {
            $(this).css('margin-right', footerRight);
        }
    });

    /* 底部链接列表结束 */


    //头部登录注册
    var tel = '';
    $.ajax({
        type: 'post',
        url: '/api/web/userCheck',
        async: true,
        data: {},
        success: function (data) {
            if (data.code == 403) {
                $(".homeHeader").find(".homeHeader-shortcut_right").hide();
                $(".homeHeader").find(".noLogin").show();
            } else if (data.code == 200) {
                $(".homeHeader").find(".homeHeader-shortcut_right").hide();
                $(".homeHeader").find(".inLogin").show();
                tel = data.data.tel;
                $(".homeHeader").find(".inLogin .telStart").html(data.data.tel.slice(0, 3));
                $(".homeHeader").find(".inLogin .telEnd").html(data.data.tel.slice(7, 11));
                var username = data.data.name,
                    userphone = tel.slice(0, 3) + '****' + tel.slice(7, 11);
                ;
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('userphone', userphone);
            }
        },
        error: function (data) {
            console.error(data);
        }
    });

    //退出
    $(".homeHeader").find(".homeHeader-shortcut_right .withDrawal").on('click', function () {
        var r = confirm("您确定退出吗？");
        if (r == true) {
            $.ajax({
                type: 'get',
                url: '/api/web/logout',
                async: true,
                data: {},
                success: function (data) {
                    if (data.code == 200) {
                        $(".homeHeader").find(".homeHeader-shortcut_right").hide();
                        $(".homeHeader").find(".noLogin").show();
                        sessionStorage.removeItem('username');
                        sessionStorage.removeItem('userphone');
                        window.location.reload();
                    } else {
                        alert("退出失败！")
                    }
                },
                error: function (data) {
                    console.error(data);
                }
            })
        }
    });

    //个人中心传参
    $(".homeHeader").find(".homeHeader-shortcut_right .homeHeader-personal_Center").on('click', function () {
        $(this).attr("href", "/member_center" + "?" + "userName=" + tel);
    });

    //登录页面跳转
    /*var getUrl = window.location.href;
    $(".login").on('click',function(){
        $(this).attr("href","/login" + "?" + getUrl);
    })*/

    // 定制化方案
    $('.homeVideo-body_right .form .form-info_btn').click(function (e) {
        var target = $(this).siblings('.info');
        var success = function () {
                if ($('.form-info .onlineConsultModal').css('display') == 'none') {
                    $('.form-info .onlineConsultModal').show();
                    $('.form-info .onlineConsultModal-triangle').show();
                }
            },
            error = function () {
                alert('出错啦，请刷新重试!');
            };
        customizeInfoInstall(target, success, error);
    });

    //底部新增fixed banner   我要报名、立即评估
    var bottomFlag = true;
    $('.activity_close').click(function(){
        bottomFlag = false
        $('#activityBottom').hide()
    })

    //控制首页底部banner滚动大于400px 出现
    window.onscroll = function () {
        if($(document).scrollTop() > 400 && bottomFlag == true) {
            $('#activityBottom').show()
        } else {
            $('#activityBottom').hide()
        }
    }

    $('.activitySlide-content-close').click(function(){
        $('#activitySlide').hide()
    })
    //增加评估数
    $('.add-assess').click(function() {
        $.ajax({
            type: 'post',
            url: '/api/web/addAssessNum',
            async: true,
            data: {},
            success: function (data) {
                if (data.code == 200) {
                    location.href="/evaluate"
                   console.log('评估数加一')
                } else {
                    console.log("评估数加一失败")
                }
            },
            error: function (data) {
                location.href = '/evaluate'
                console.error(data);
            }
        })
    })
});

$(function () {
    var showMore = false,
        evaluateArr = [],
        constrastArr = [],
        formid = '',
        notRequired = false
    ;
    // 点击展开更多信息
    $('.evaluate-form_section .middle').children().click(function (e) {
        var target = $('.evaluate-form_section .middle');
        if (!showMore) {
            target.siblings('.moreInfo').show();
            target.find('img').css('transform', 'rotate(180deg)');
            target.find('span').text('点击收起');
            showMore = true;
        } else {
            target.siblings('.moreInfo').hide();
            target.find('img').css('transform', 'rotate(0deg)');
            target.find('span').text('为了提高匹配精准度，可展开填写更多信息');
            showMore = false;
        }
    });
    // 判断是否是登陆后返回此页
    if (sessionStorage.getItem('evaluateInfo')) {
        constrastArr = JSON.parse(sessionStorage.getItem('evaluateInfo'));
        formid = sessionStorage.getItem('formid');
        constrastArr.forEach(function (val, index) {
            if (val.question_answer) {
                if (val.question_answer.length > 0) {
                    val.question_answer.forEach(function (value) {
                        $('.evaluate-form_section .group-button').each(function (i, e) {
                            var current = $(e).data('current');
                            if (value == current) {
                                $(e).addClass('selected');
                            }
                        });
                        $('.evaluate-form_section .dropdown ul li').each(function (i, e) {
                            var current = $(e).data('current');
                            if (value == current) {
                                if (!notRequired) {
                                    notRequired = true;
                                    $('.evaluate-form_section .middle img').trigger('click');
                                }
                                $(e).parent().siblings('.dropdownBtn').html($(e).text());
                            }
                        })
                    })
                }
            }
        });
    }
    // 点击选项卡时添加对象方法
    function evaluateAddObj(obj, maxLength, that) {
        constrastArr.push(obj);
        changeClass(obj.question_answer, maxLength, that);
    }
    // 选项卡添加时的判断
    function evaluateCheckArr(arr, obj, maxLength, that, id) {
        if (arr.length == 0) {
            evaluateAddObj(obj, maxLength, that);
        } else {
            arr.forEach(function (value) {
                if (id == value.question_id) {
                    changeClass(value.question_answer, maxLength, that);
                } else {
                    evaluateAddObj(obj, maxLength, that);
                }
            });
        }
    }
    // 选项的点击选中事件
    $('.evaluate-form_section .group .group-button').click(function (e) {
        var target = $(this).parents('.evaluate-form_section');
        var maxLength = getData(target, 'max'),
            minLength = getData(target, 'min'),
            id = getData(target, 'questionid'),
            weight = getData(target, 'weight'),
            title = getData(target, 'questiontitle'),
            that = this,
            current = $(this).text()
        ;
        if (!formid) {
            formid = getData(target, 'formid');
        }
        var addObj = {
            question_id: id,
            question_weight: weight,
            question_answer: [],
            question_title: title,
            question_value: [],
            is_required: 1
        };
        if (constrastArr.length == 0) {
            addObj.question_value.push(current);
            constrastArr.push(addObj);
            changeClass(addObj.question_answer, maxLength, that);
        } else {
            var flag = constrastArr.some(function (value) {
                    return value.question_id == id;
                }),
                constrastIndex
            ;
            if (flag) {
                constrastArr.forEach(function (value, index) {
                    if (id == value.question_id) {
                        if (value.question_value.indexOf(current) >= 0) {
                            value.question_value.splice(value.question_value.indexOf(current), 1);
                            if (value.question_value.length == 0) {
                                constrastArr.splice(index, 1);
                            }
                        } else if (value.question_value.length < maxLength) {
                            value.question_value.push(current);
                        }
                        constrastIndex = index;
                        changeClass(value.question_answer, maxLength, that);
                    }
                })
            } else {
                addObj.question_value.push(current);
                constrastArr.push(addObj);
                changeClass(addObj.question_answer, maxLength, that);
            }
        }
    });
    // 多选框点击事件
    $('.moreInfo-btn .dropdown .dropdown-menu li').click(function (e) {
        var targetParent = $(this).parents('.moreInfo-btn');
        var data = $(this).text(),
            target = $(this).parent().siblings('button'),
            current = $(this).data('current'),
            id = getData(targetParent, 'questionid'),
            title = getData(targetParent, 'questiontitle'),
            weight = getData(targetParent, 'weight'),
            text = $(this).text()
        ;
        var addObj = {
            question_id: id,
            question_weight: weight,
            question_answer: [],
            question_title: title,
            question_value: [],
            is_required: 0
        };
        addObj.question_answer.push(current);
        addObj.question_value.push(text);
        var flag = constrastArr.some(function (value) {
                return id == value.question_id;
            }),
            constrastIndex
        ;
        if (constrastArr.length == 0) {
            constrastArr.push(addObj);
        } else {
            if (flag) {
                constrastArr.forEach(function (value, index) {
                    if (id == value.question_id) {
                        constrastIndex = index;
                        value.question_answer[0] = current;
                        value.question_value[0] = text;
                    }
                })
            } else {
                constrastArr.push(addObj);
            }
        }
        target.html(data);
    });
    var nativetel = ''
    var isLogin = false;
    // 判断是否登陆，自动填写信息
    $.ajax({
        type: 'post',
        url: '/api/web/userCheck',
        async: true,
        data: {},
        success: function (data) {
            if (data.code == 403) {
                isLogin = false;
            } else if (data.code == 200) {
                isLogin = true;
                nativetel = data.data.tel;
                var usertelphone = data.data.tel.slice(0, 3) + '****' + data.data.tel.slice(7, 11);
                $('.evaluate-form_userinfo .userphone input').val(usertelphone) ;
                $('.evaluate-form_userinfo .userphone input').attr("disabled",true)
                if(data.data.name != '') {
                    $('.evaluate-form_userinfo .username input').attr("disabled",true)
                }
                $('.evaluate-form_userinfo .username input').val(data.data.name) ;
            }
        },
        error: function (data) {
            console.error(data);
        }
    });

    // 立即匹配点击事件
    $('.evaluate-form .evaluate-form_btn').click(function (e) {
        var userinfo = $(this).siblings('.evaluate-form_userinfo'),
            str = '[',
            count = $(this).data('count'),
            require = 0,
            content = ''
        ;
        constrastArr.map(function (value) {
            if (value.is_required == 1) {
                require++;
            }
            switch (value.question_title) {
                case "intention_country":
                    content += '意向国家：' + value.question_value.join(',') + '<br />';
                    break;
                case "immigration_purpose":
                    content += '移民目的：' + value.question_value.join(',') + '<br />';
                    break;
                case "immigration_budget":
                    content += '移民预算：' + value.question_value.join(',') + '<br />';
                    break;
                case "asset":
                    content += '家庭净资产：' + value.question_value.join(',') + '<br />';
                    break;
                case "live_requirement":
                    content += '可接受的居住条件：' + value.question_value.join(',') + '<br />';
                    break;
                case "manage":
                    content += '管理经验：' + value.question_value.join(',') + '<br />';
                    break;
                case "language":
                    content += '英文水平：' + value.question_value.join(',') + '<br />';
                    break;
                case "qualifications":
                    content += '最高学历：' + value.question_value.join(',') + '<br />';
                    break;
                case "age":
                    content += '年龄：' + value.question_value.join(',') + '<br />';
                    break;
            }
        });
        function getVal(typeName) {
            return userinfo.children('.' + typeName).children('input').val();
        }
        var username = getVal('username'),
            userphone = getVal('userphone'),
            checkName = formCheck.checkNull(username),
            checkPhone = formCheck.checkNull(userphone)
        ;
            if(!isLogin) {
                if($('.evaluate-form_userinfo .username input').val() == '') {
                    alert('请输入姓名')
                    return
                }
                if($('.evaluate-form_userinfo .userphone input').val() == '') {
                    alert('请输入电话')
                    return
                }
                if($('.evaluate-form_userinfo .userphone input').val().length != 11) {
                    alert('您输入的电话号码有误')
                    return
                }
                nativetel = $('.evaluate-form_userinfo .userphone input').val()
            } else {
                if($('.evaluate-form_userinfo .username input').val() == '') {
                    alert('请输入姓名')
                    return
                }
            }
                if (require < count) {
                    alert('请先选择必填项');
                } else {
                    constrastArr.forEach(function (value, index) {
                        str += JSON.stringify(value);
                        if (index < constrastArr.length - 1) {
                            str += ',';
                        } else {
                            str += ']';
                        }
                    });
                    sessionStorage.setItem('evaluateInfo', JSON.stringify(constrastArr));
                    sessionStorage.setItem('formid', formid);
                    sessionStorage.setItem('evaluateUserName', username);
                    sessionStorage.setItem('evaluateUserPhone', userphone);
                    // 收集数据
                    $.ajax({
                        type: 'post',
                        url: 'api/web/message',
                        async: true,
                        data: {
                            source: 'assess',
                            content: content,
                            username: $('.evaluate-form_userinfo .username input').val(),
                            tel: nativetel,
                            refer:$("#refer").val()
                        },
                        success: function (data) {
                            if (200 == data.code) {
                                // 提交表单
                                $.ajax({
                                    type: 'post',
                                    url: '/api/web/projectAssess',
                                    async: true,
                                    data: {
                                        data: str,
                                        form_id: formid,
                                        site:'PC'
                                    },
                                    success: function (data) {
                                        if (200 == data.code) {
                                            sessionStorage.setItem('resultInfo', JSON.stringify(data.data.data));
                                            $('.evaluate-form_tips').text('恭喜您，提交成功！');
                                            $('.evaluate-form_tips').show();
                                            setTimeout(function () {
                                                location.href = '/evaluate_result';
                                            }, 800);
                                        } else {
                                            alert('出错啦，请刷新重试！');
                                        }
                                    },
                                    error: function (data) {
                                        console.error(data);
                                    }
                                })
                            } else if (419 == data.code) {
                                $('.evaluate-form_tips').text('请先登录再继续完成评估');
                                $('.evaluate-form_tips').show();
                                setTimeout(function () {
                                    location.href = '/login?current=' + location.href;
                                }, 800);
                            } else {
                                console.error(data, 'success');
                            }
                        },
                        error: function (data) {
                            console.error(data, 'error');
                        }
                    });
                }

    });
});

$(function () {
    // 判断banner数量决定是否轮播
    var autoFlag = false;
    if (document.getElementById('projectHeaderSwiper')) {
        var bannerCount = document.getElementById('projectHeaderSwiper').dataset.count;
        if (bannerCount > 1) {
            autoFlag = true;
        }
    }

    // 头部swiper初始化
    var projectHeaderSwiper = new Swiper('#projectHeaderSwiper .swiper-container', {
        loop: true,
        // 如果需要分页器
        pagination: {
            el: '.projectHeaderSwiper .swiper-pagination',
            clickable: true
        },
        navigation: {
            nextEl: '.projectHeaderSwiper .control-wrapper .swiper-button-next',
            prevEl: '.projectHeaderSwiper .control-wrapper .swiper-button-prev',
        },
        autoplay: autoFlag,
        effect: 'fade',
        speed: 1000
    });

    $('.projectHeaderSwiper .swiper-container').hover(function (e) {
        projectHeaderSwiper.autoplay.stop();
    }, function (e) {
        if (autoFlag) {
            projectHeaderSwiper.autoplay.start();
        }
    });

    // 标记加载更多的点击次数
    var projectIndex, projectHeight, projectLength, countryProjectIndex, countryProjectHeight, countryProjectLength,
        projectContrast = [],
        countryContrast = [],
        followContrast = []
    ;

    // 项目对比初始化
    function projectInit() {
        projectIndex = 1;
        projectHeight = $('.investmentContrast-views .active').height();
        projectLength = Math.ceil($('.investmentContrast-views .active .investmentContrast-view').length / 9);
        if (projectLength > 0) {
            if (projectLength == 1) {
                $('.investmentContrast .investmentContrast-more').hide();
            } else {
                $('.investmentContrast .investmentContrast-more').show();
            }
        }
        $('.investmentContrast-views .tab-content .active').css('max-height', '975px');
    }

    // 国家项目对比初始化
    function countryProjectInit() {
        countryProjectIndex = 1;
        countryProjectHeight = $('.countryProjectContrast .countryProjectContrast-list').height();
        countryProjectLength = Math.ceil($('.countryProjectContrast .countryProjectContrast-list .countryProjectContrast-list_view').length / 6);
        if (countryProjectLength > 0) {
            if (countryProjectLength == 1) {
                $('.countryProjectContrast .investmentContrast-more').hide();
            } else {
                $('.countryProjectContrast .investmentContrast-more').show();
            }
        }
        $('.countryProjectContrast .countryProjectContrast-list').css('max-height', '634px');
    }

    projectInit();
    countryProjectInit();

    // 加入对比点击事件--项目
    $('.investmentContrast-view .investmentContrast-view_btnGroup .joinContrast').click(function (e) {
        checkContrast(projectContrast, 3, this);
    });
    // 加入对比点击事件--国家
    $('.countryProjectContrast-list_view .btnGroup .joinContrast').click(function (e) {
        checkContrast(countryContrast, 3, this);
    });
    // 关注部分加入对比
    $('.countryFollowList .countryFollowList-content .joinContrast').click(function (e) {
        checkContrast(followContrast, 3, this);
    });

    // 项目对比下button的hover事件
    $('.investmentContrast-btnGroup button, .investmentContrast-btnGroup a').mouseenter(function (e) {
        var text = e.currentTarget.innerText, src;
        if ('立即对比' == text) {
            src = '/images/test_investment/contrastNowWhite.svg';
        } else {
            src = '/images/test_investment/consultWhite.svg';
        }
        $(this).children('img').attr('src', src);
    });
    $('.investmentContrast-btnGroup button, .investmentContrast-btnGroup a').mouseleave(function (e) {
        var text = e.currentTarget.innerText, src;
        if ('立即对比' == text) {
            src = '/images/test_investment/contrastNow.svg';
        } else {
            src = '/images/test_investment/consultIcon.svg';
        }
        $(this).children('img').attr('src', src);
    });

    // 创业移民案例swiper初始化
    var investmentCases = new Swiper('.investmentCases-content .swiper-container', {
        slidesPerGroup: 2,
        slidesPerView: 2,
        spaceBetween: 14,
        autoplay: false
    });

    function checkShowMore() {
        setTimeout(function () {
            projectInit();
            // 项目对比加载更多的显示问题
            if (projectLength > 0) {
                if (projectLength == 1) {
                    $('.investmentContrast .investmentContrast-more').hide();
                } else {
                    $('.investmentContrast .investmentContrast-more').show();
                }
            }
        }, 1);
    }

    // tab点击事件
    $('.investmentContrast-projectScreen ul li a').click(function (e) {
        checkShowMore();
    });

    // 加载更多点击事件
    $('.investmentContrast .investmentContrast-more').click(function (e) {
        projectIndex++;
        $('.investmentContrast-views .tab-content .active').css('max-height', 975 * projectIndex + 'px');
        if (projectIndex >= projectLength) {
            $('.investmentContrast .investmentContrast-more').hide();
        } else {
            $('.investmentContrast .investmentContrast-more').show();
        }
    });
    // 国家项目对比加载更多
    $('.countryProjectContrast .investmentContrast-more').click(function (e) {
        countryProjectIndex++;
        $('.countryProjectContrast .countryProjectContrast-list').css('max-height', 634 * countryProjectIndex + 'px');
        if (countryProjectIndex >= countryProjectLength) {
            $('.countryProjectContrast .investmentContrast-more').hide();
        } else {
            $('.countryProjectContrast .investmentContrast-more').show();
        }
    });

    // 轮播图hover时禁止滚动
    $('.investmentCases-content .swiper-container').hover(function (e) {
        investmentCases.autoplay.stop();
    }, function () {
        // investmentCases.autoplay.start();
    });

    // 制定方案点击事件
    $('.formulateScheme').click(function (e) {
        var success = function () {
            if ($('.immigrantCustomMade-form_btnGroup .onlineConsultModal').css('display') == 'none') {
                $('.immigrantCustomMade-form_btnGroup .onlineConsultModal').show();
                $('.immigrantCustomMade-form_btnGroup .onlineConsultModal-triangle').show();
            }
        };
        var target = $('.immigrantCustomMade-form_info .entryInfo');
        customizeInfoInstall(target, success);
    });

    // 绑定全局点击事件，判断移民大课堂部分的modal
    $(document).bind("click", function (e) {
        var targetName = e.target.className;
        if (targetName.indexOf('formModal') < 0 && targetName.indexOf('formulateScheme') < 0) {
            $('.immigrantCustomMade-form_btnGroup .onlineConsultModal').hide();
            $('.immigrantCustomMade-form_btnGroup .onlineConsultModal-triangle').hide();
        }
    });

    // 为什么选择太平洋点击事件
    $('.immigrantWhyChoose-views_view').click(function (e) {
        // $(this).addClass('selected').siblings().removeClass('selected');
    });

    // 不同移民方式的移民对比
    $('.investmentContrast-btnGroup .contrastNow').click(function (e) {
        projectContrastNow(projectContrast, 'project');
    });

    // 国家项目的立即对比
    $('.countryProjectContrast .countryContrast').click(function (e) {
        projectContrastNow(countryContrast, 'project');
    });

    // 国家的关注国家对比
    $('.countryFollowList .countryFollowList-btn').click(function (e) {
        projectContrastNow(followContrast, 'country');
    })
});

$(function () {
    // 全局变量初始化
    var stepIndex = 1, stepLength = $('.immigrantDetailFlow-flows_step').length, starCurrent = {star: 0},
        showMore = Math.ceil($('.immigrantDetailEvaluate-content_view').length / 2) > 1, hotImmigrantDetailArr = [];
    // 监听星星选中数
    Object.defineProperty(starCurrent, 'star', {
        set: function (value) {
            star = value;
            $('.immigrantDetailEvaluate-form_foot .info img').each(function (i, ele) {
                if ($(ele).data('star') <= value) {
                    $(ele).attr('src', '/images/test_immigrantDetail/star.svg')
                } else {
                    $(ele).attr('src', '/images/test_immigrantDetail/starUnselect.svg')
                }
            })
        },
        get: function () {
            return star ? star : 0;
        }
    });

    // 如果用户登录后存在session直接显示
    if (sessionStorage.getItem('userAssess') || sessionStorage.getItem('userStar')) {
        var target = $('.immigrantDetailEvaluate-form'),
        assess = sessionStorage.getItem('userAssess'),
        star = sessionStorage.getItem('userStar');
        target.show();
        target.find('textarea').val(assess ? assess : '');
        starCurrent.star = parseInt(star);
    }

    // 初始化swiper
    var tipsSwiper = new Swiper('.immigrantDetailContent .immigrantDetailContent-tips .swiper-container', {
        loop: true,
        // 如果需要分页器
        pagination: {
            el: '.immigrantDetailContent .immigrantDetailContent-tips .swiper-container .swiper-pagination',
            clickable: true
        },
        autoplay: true
    });

    // 移民宝典中图片的点击事件
    $('.immigrantDetailContent-tips').find('img').click(function (e) {
        var link = this.dataset.link;
        location.href = link;
    });

    // 改变步骤方法
    function changeStep() {
        $('.immigrantDetailFlow-flows_step').each(function (i, ele) {
            if (!$(ele).hasClass('selected')) {
                if ($(ele).data('step') <= stepIndex) {
                    $(ele).addClass('selected');
                }
            } else {
                if ($(ele).data('step') > stepIndex) {
                    $(ele).removeClass('selected');
                }
            }
        })
    }

    $('.immigrantDetailFlow-flows_step').find('p').each(function (index, val) {
        $(val).css('left', - ($(val).width() + 30) / 2);
    });

    // 改变步骤内容方法
    function changeStepContent() {
        $('#handleContent' + stepIndex).show().siblings().hide();
    }

    // 流程点击事件
    $('.immigrantDetailFlow-flows_step').click(function (e) {
        var width = parseInt($('.immigrantDetailFlow-flows').width() / 2),
            left = parseInt(e.currentTarget.offsetLeft)
        ;
        if (!$(this).hasClass('selected')) {
            stepIndex = $(this).data('step');
            changeStepContent();
            checkDisable(true);
            if (left >= width) {
                $('.immigrantDetailFlow-flows').animate({scrollLeft: (left - width)}, 500);
            }
        }
    });

    // 检测箭头显示情况以及步骤改变
    function checkDisable(flag) {
        var target = document.getElementById('immigrantDetailFlow-flows');
        if (target.offsetWidth) {
            var offsetWidth = target.offsetWidth,
                scrollLeft = target.scrollLeft,
                scrollWidth = target.scrollWidth;
            if (stepLength == 1) {
                $('.immigrantDetailFlow-right').addClass('disabled');
                $('.immigrantDetailFlow-right').attr('src', '/images/test_immigrantDetail/rightArrowDisabled.svg');
            } else if (scrollLeft == 0 && stepIndex <= 1) {
                $('.immigrantDetailFlow-left').addClass('disabled');
                $('.immigrantDetailFlow-left').attr('src', '/images/test_immigrantDetail/leftArrowDisabled.svg');
            } else if (scrollLeft == (scrollWidth - offsetWidth) && stepIndex >= stepLength) {
                $('.immigrantDetailFlow-right').addClass('disabled');
                $('.immigrantDetailFlow-right').attr('src', '/images/test_immigrantDetail/rightArrowDisabled.svg');
                $('.immigrantDetailFlow-left').removeClass('disabled');
                $('.immigrantDetailFlow-left').attr('src', '/images/test_immigrantDetail/leftArrow.svg');
            } else {
                $('.immigrantDetailFlow-left').removeClass('disabled');
                $('.immigrantDetailFlow-right').removeClass('disabled');
                $('.immigrantDetailFlow-left').attr('src', '/images/test_immigrantDetail/leftArrow.svg');
                $('.immigrantDetailFlow-right').attr('src', '/images/test_immigrantDetail/rightArrow.svg');
            }
            if (flag) {
                changeStep();
            }
        }
    }

    if (document.getElementById('immigrantDetailFlow')) {
        checkDisable();
    }

    // 步骤div滚动事件监听
    $('.immigrantDetailFlow-flows').scroll(function (e) {
        checkDisable();
    });

    // 步骤部分箭头点击事件
    // 左箭头
    $('.immigrantDetailFlow-left').click(function (e) {
        var scrollLeft = document.getElementById('immigrantDetailFlow-flows').scrollLeft;
        if (!$(this).hasClass('disabled')) {
            $('.immigrantDetailFlow-right').removeClass('disabled');
            $('.immigrantDetailFlow-right').attr('src', '/images/test_immigrantDetail/rightArrow.svg');
            if (stepIndex > 1) {
                stepIndex--;
                changeStepContent();
            }
            checkDisable(true);
            $('.immigrantDetailFlow-flows').animate({scrollLeft: 83 * (stepIndex - 1)}, 500);
        }
    });
    //右箭头
    $('.immigrantDetailFlow-right').click(function (e) {
        var target = document.getElementById('immigrantDetailFlow-flows');
        var scrollLeft = target.scrollLeft,
            scrollWidth = target.scrollWidth,
            offsetWidth = target.offsetWidth
        ;
        if (!$(this).hasClass('disabled')) {
            $('.immigrantDetailFlow-left').removeClass('disabled');
            $('.immigrantDetailFlow-left').attr('src', '/images/test_immigrantDetail/leftArrow.svg');
            if (scrollLeft < (scrollWidth - offsetWidth)) {
                stepIndex++;
                changeStepContent();
            }
            $('.immigrantDetailFlow-flows').animate({scrollLeft: 83 * stepIndex}, 500);
            checkDisable(true);
        }
    });

    // 投资项目swiper初始化
    var detailProjectSwiper = new Swiper('.immigrantDetailProject .swiper-container', {
        loop: true,
        // 如果需要分页器
        pagination: {
            el: '.immigrantDetailProject .swiper-container .swiper-pagination',
            clickable: true
        },
        slidesPerView: 4,
        spaceBetween: 20,
        navigation: {
            nextEl: '.immigrantDetailProject .swiper-button-next',
            prevEl: '.immigrantDetailProject .swiper-button-prev',
        }
    });

    // 检查显示更多按钮是否显示
    function checkShowMore() {
        if (showMore) {
            $('.immigrantDetailPage .project_button').show();
        } else {
            $('.immigrantDetailPage .project_button').hide();
        }
    }

    checkShowMore();

    // 加载更多点击事件
    $('.immigrantDetailPage .project_button').click(function (e) {
        $('.immigrantDetailEvaluate .immigrantDetailEvaluate-content').css('max-height', '785px');
        $(this).hide();
    });

    // 显示评价点击事件
    $('.immigrantDetailEvaluate .immigrantDetailEvaluate-title button').click(function () {
        $('.immigrantDetailEvaluate-form').show();
    });

    // 评价星星点击事件
    $('.immigrantDetailEvaluate-form_foot .info img').click(function (e) {
        starCurrent.star = $(this).data('star');
    });

    // hover Enter
    function hoverEnter(that) {
        $(that).addClass('selected');
        var src = '/images/test_investment/consultWhite.svg';
        if ($(that).hasClass('firstBtn')) {
            src = '/images/test_investment/contrastNowWhite.svg';
        }
        $(that).children('img').attr('src', src);
    }

    // hover leave
    function hoverLeave(that) {
        $(that).removeClass('selected');
        var src = '/images/test_investment/consultIcon.svg';
        if ($(that).hasClass('firstBtn')) {
            src = '/images/test_investment/contrastNow.svg';
        }
        $(that).children('img').attr('src', src);
    }

    // 热门投资 加入对比事件
    $('.immigrantDetailHot-content_view .hotImmigrant .hotImmigrant-btnGroup .joinContrast').click(function (e) {
        checkContrast(hotImmigrantDetailArr, 3, this);
    });

    // 立即对比按钮点击事件
    $('.immigrantDetailHot-content_btnGroup .firstBtn').click(function (e) {
        var flag = formCheck.checkArray(hotImmigrantDetailArr);
        if (flag) {
            location.href = '/project_contrast?projectIds=' + hotImmigrantDetailArr;
        } else {
            alert('请选择要对比的项目');
        }
    });

    // 热门投资部分按钮点击和hover事件
    $('.immigrantDetailHot-content_btnGroup button').mouseenter(function (e) {
        hoverEnter(this);
    });
    $('.immigrantDetailHot-content_btnGroup button').mouseleave(function (e) {
        hoverLeave(this);
    });
    $('.immigrantDetailHot-content_btnGroup button').click(function (e) {
        $(this).siblings().removeClass('selected').mouseleave(function () {
            hoverLeave(this);
        });
        hoverLeave($(this).siblings());
        $(this).addClass('selected').unbind('mouseleave');
        var src = '/images/test_investment/consultWhite.svg';
        if ($(this).hasClass('firstBtn')) {
            src = '/images/test_investment/contrastNowWhite.svg';
        }
        $(this).children('img').attr('src', src);
    });

    // 清空表单
    function clearForm(formName, isSuccess) {
        var target = $(formName ? formName : '.immigrantDetailEvaluate-form'),
        tips = isSuccess ? $('.immigrantDetailEvaluate-form_tips') : $('.immigrantDetailEvaluate-form_login');
        target.find('textarea').val('');
        starCurrent.star = 0;
        tips.hide();
        target.hide();
    }

    // 评价提交按钮事件
    $('.immigrantDetailEvaluate-form_foot .btnGroup button').click(function (e) {
        var content = $('.immigrantDetailEvaluate-form_head textarea').val(),
            project_id = $(this).data('project')
        ;
        if (!content) {
            alert('请输入您的评价内容');
        } else if (starCurrent.star <= 0) {
            alert('请选择您对该项目的评分');
        } else {
            $.ajax({
                url: '/api/web/projectComment',
                type: 'POST',
                data: {
                    project_id: project_id,
                    content: content,
                    grade: starCurrent.star
                },
                timeout: 8000,
                dataType: 'json',
                success: function (data, textStatusInfo, jqXHR) {
                    if ('success' == textStatusInfo) {
                        $('.immigrantDetailEvaluate-form_tips').show();
                        sessionStorage.removeItem('userAssess');
                        sessionStorage.removeItem('userStar');
                        setTimeout(function () {
                            clearForm('', true);
                        }, 1000);
                    }
                },
                error: function (data, text, jqXHR) {
                    if (401 == data.status) {
                        $('.immigrantDetailEvaluate-form_login').show();
                        sessionStorage.setItem('userAssess', content);
                        sessionStorage.setItem('userStar', starCurrent.star);
                        setTimeout(function () {
                            location.href = '/login?current=' + location.href;
                            clearForm('', false);
                        }, 800);
                    }
                    console.error(data, text, jqXHR);
                }
            })
        }
    });
});

$(function () {
    //轮播功能
    var swiperTwo = new Swiper('.about_honor-swiper .swiper-container', {
        slidesPerView: 3,
        slidesPerColumn: 2,
        spaceBetween: 10,
        pagination: {
            el: '.about_honor-swiper .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.about_honor-swiper .swiper-button-next',
            prevEl: '.about_honor-swiper .swiper-button-prev',
        },
    });

        var coordinateX = 116.448152;
        var coordinateY = 39.91484;
        // 百度地图API功能
        function createMap(x, y) {
            if (document.getElementById('allmap')) {
                var map = new BMap.Map("allmap", {enableMapClick: false});
                var point = new BMap.Point(x, y);
                map.centerAndZoom(point, 15);

                var marker = new BMap.Marker(new BMap.Point(x, y));
                map.addOverlay(marker);            //增加点
            }
        }

        createMap(coordinateX, coordinateY);
        $('.tab_company .panel-heading').click(function () {
            $(this).parent().find('.panel-body').css("display", "block")
            $(this).parent().siblings().find('.panel-body').css("display", "none")
            $(this).parent().find('.about_arrow').css("display","none")
            $(this).parent().siblings().find('.about_arrow').css("display","block")
            coordinateX = $(this).parent().find('.about_arrow').data('x')
            coordinateY = $(this).parent().find('.about_arrow').data('y')
            createMap(coordinateX, coordinateY);
        })

    certifySwiper = new Swiper('#certify .swiper-container', {
        watchSlidesProgress: true,
        slidesPerView: 'auto',
        centeredSlides: true,
        loop: true,
        autoplay: true,
        speed: 1000,
        navigation: {
            nextEl: '#certify .swiper-button-next',
            prevEl: '#certify .swiper-button-prev',
        },
        // pagination: {
        //     el: '.swiper-pagination',
        //     //clickable :true,
        // },
        on: {
            progress: function(progress) {
                for (i = 0; i < this.slides.length; i++) {
                    var slide = this.slides.eq(i);
                    if(slide.is('#certify .swiper-slide-active')){
                        slide.find("p").css("display","block")
                    } else {
                        slide.find("p").css("display","none")
                    }
                    var slideProgress = this.slides[i].progress;
                    if(slide.is('#certify .swiper-slide-active')){
                        slide.find("p").css("display","block")
                    } else {
                        slide.find("p").css("display","none")
                    }

                    modify = 1;
                    if (Math.abs(slideProgress) > 1) {
                        modify = (Math.abs(slideProgress) - 1) * 0.3 + 1;
                    }
                    translate = slideProgress * modify * 260 + 'px';
                    scale = 1 - Math.abs(slideProgress) / 5;
                    zIndex = 999 - Math.abs(Math.round(10 * slideProgress));

                    slide.transform('translateX(' + translate + ') scale(' + scale + ')');
                    slide.css('zIndex', zIndex);
                    slide.css('opacity', 1);
                    if (Math.abs(slideProgress) > 3) {
                        slide.css('opacity', 0);
                    }
                }
            },
            setTransition: function(transition) {
                for (var i = 0; i < this.slides.length; i++) {
                    var slide = this.slides.eq(i)
                    if(slide.is('#certify .swiper-slide-active')){
                        slide.find("p").css("display","block")
                    } else {
                        slide.find("p").css("display","none")
                    }
                    slide.transition(transition);
                }

            }
        }
    })
})

$(function () {
    var mySwiper = new Swiper('.news_left-swiper .swiper-container', {
        loop: true,
        slidesPerView: 1,
        autoplay: true,
        // 如果需要前进后退按钮
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    })
    if (document.getElementById('news')) {
        $('.news .order-modal .order-modal_close').click(function (e) {
            $(this).parent().css("display", "none")
            $('.order-triangle').css("display", "none")
        });
        $(window).scroll(function () {
            $('.news .order-modal').css("display", "none")
            $('.news .order-triangle').css("display", "none")
        })
    }


    $(".news .news_list").hover(
        function () {
            $(this).addClass('news_shadow')
        },
        function () {
            $(this).removeClass('news_shadow')
        }
    );
    if (document.getElementById('news_tab')) {
        $('#news_tab').find('li').find('a').hover(
            function () {
                $(this).addClass('news_activeTwo')
            },
            function () {
                $(this).removeClass('news_activeTwo')
            }
        );
    }
    var router = window.location.pathname
    var regu = /^\/case\/\d+$/
    var re = new RegExp(regu);
    var regu2 = /^\/news\/\d+$/
    var re2 = new RegExp(regu2);
    var regu3 = /^\/information\/\d+$/
    var re3 = new RegExp(regu3);
    if (re.test(router) || re2.test(router) || re3.test(router)) {
        $('.rightBar-video').css("display", "none");
    }

    //提交出国惊喜表单
    // $("#rightBar_btn").click(function () {
    //     if ($('#InputName').val().length == 0) {
    //         $('#bar_toast').text("请输入您的姓名！")
    //         $('#bar_toast').css("display", "block")
    //         return;
    //     }
    //     if ($('#InputTel').val().length == 0) {
    //         $('#bar_toast').text("请输入您的电话！")
    //         $('#bar_toast').css("display", "block")
    //         return;
    //     }
    //     if ($('#InputCountry').val().length == 0) {
    //         $('#bar_toast').text("请输入您的意向国家！")
    //         $('#bar_toast').css("display", "block")
    //         return;
    //     }
    //     var user = {
    //         name: $('#InputName').val(),
    //         email: $('#InputTel').val(),
    //         content: $('#InputCountry').val()
    //     }
    //     $.ajax({
    //         type: 'post',
    //         data: user,
    //         url: "/contactUs",
    //         success: function (msg) {
    //             if (msg.code == 200) {
    //                 $('#bar_toast').css("display", "block")
    //             } else {
    //                 $('#bar_toast').text("很遗憾，提交失败！")
    //                 $('#bar_toast').css("display", "block")
    //             }
    //         }
    //     })
    // })

    //换一换功能
    var page = 2;

    $("#change_one").click(function () {
        // $(".rightBar-follow_body ul li").hide();
        // var showCount = 0;
        // while (showCount < 8) {
        //     var id = Math.floor(Math.random() * 20);
        //     var curDiv = $(".rightBar-follow_body ul li").eq(id);
        //     if (curDiv.css("display") == "none") {
        //         curDiv.css("display", "block");
        //         showCount++;
        //     }
        // }
        $.ajax({
            type: 'post',
            data: {
                "page": page
            },
            url: "/api/web/tags",
            success: function (msg) {
                if (msg.code == 200) {
                    if(msg.data.last_page < page) {
                        return
                    } else if(msg.data.last_page == page) {
                        $('#hotTags').empty()
                        var str = ''
                        for(var i = 0; i < msg.data.data.length; i ++) {
                            str += '<li>' +
                            '<a href="/popular_attention?key='+msg.data.data[i].name+'">' +
                            msg.data.data[i].name +
                            '<span></span></li>'
                        }
                        $('#hotTags').append(str)
                        page = 1;
                    }
                    else {
                        $('#hotTags').empty()

                        var str = ''
                        for(var i = 0; i < msg.data.data.length; i ++) {
                            str += '<li>' +
                            '<a href="/popular_attention?key='+msg.data.data[i].name+'">' +
                            msg.data.data[i].name +
                            '<span data-hot="'+ msg.data.data[i].hot +'"></span></li>'
                        }
                        $('#hotTags').append(str)
                        page ++;
                    }
                    var hotTags = document.getElementById('hotTags');
                    var spanArr = hotTags.getElementsByTagName('span')
                    for(var i = 0; i < spanArr.length; i ++) {
                        if(spanArr[i].getAttribute('data-hot') == 0) {
                            spanArr[i].style.display = 'none'
                        }
                    }
                } else {
                    return;
                }
            }
        })
    })

    // 右侧边栏提交事件
    $('.rightBar-form_body #rightBar_btn').click(function (e) {
        var target = $(this).siblings('.form-group'),
            success = function () {
                $('#bar_toast').css("display", "block");
            },
            error = function () {
                $('#bar_toast').text("很遗憾，提交失败！");
                $('#bar_toast').css("display", "block");
            };
        customizeInfoInstall(target, success, error, 'surprise');
    });
});

$(function () {
    if (document.getElementById('caseList_tab-nav')) {
        //选项卡功能
        $('#caseList_tab-nav').find('li').hover(
            function(){
                $(this).addClass('caseList_activeTwo')
            },
            function(){
                $(this).removeClass('caseList_activeTwo')
            }
        );

            var router = window.location.search;
            if(new RegExp(/^\?category_id\=10/).test(router)) {
                $('#caseList_tab-nav li').removeClass('caseList_active')
                $('.case_tab6').addClass('caseList_active')
            }else if(new RegExp(/^\?category_id\=1/).test(router)) {
                $('#caseList_tab-nav li').removeClass('caseList_active')
                $('.case_tab0').addClass('caseList_active')
            }else if(new RegExp(/^\?category_id\=2/).test(router)) {
                $('#caseList_tab-nav li').removeClass('caseList_active')
                $('.case_tab1').addClass('caseList_active')
            } else if(new RegExp(/^\?category_id\=3/).test(router)) {
                $('#caseList_tab-nav li').removeClass('caseList_active')
                $('.case_tab2').addClass('caseList_active')
            } else if(new RegExp(/^\?category_id\=5/).test(router)) {
                $('#caseList_tab-nav li').removeClass('caseList_active')
                $('.case_tab3').addClass('caseList_active')
            } else if(new RegExp(/^\?category_id\=6/).test(router)) {
                $('#caseList_tab-nav li').removeClass('caseList_active')
                $('.case_tab4').addClass('caseList_active')
            } else if(new RegExp(/^\?category_id\=8/).test(router)) {
                $('#caseList_tab-nav li').removeClass('caseList_active')
                $('.case_tab5').addClass('caseList_active')
            }else if(new RegExp(/^\?category_id\=0/).test(router)) {
                $('#caseList_tab-nav li').removeClass('caseList_active')
                $('.case_tab-first').addClass('caseList_active')
            }

        $(".caseList_list .news_list").mouseenter(function(e){
            $(this).find('.news_list-bottom').show()
            $(this).addClass('caseList_hover')
        })
        $(".caseList_list .news_list").mouseleave(function(e){
            $(this).removeClass('caseList_hover')
                $(this).find('.news_list-bottom').hide()
        })
        $('.news_list-bottom').mouseenter(function (e) {
            e.stopPropagation()
            return false
        })
    }
})

$(function(){
    //导航城市切换
    if (document.getElementById('branch_tab-right')) {
        $('.branch_tab-right-container').click(function(){
            $(this).siblings().removeClass('branch_active');
            $(this).addClass('branch_active');
            $('.branch_content').css("opacity","0");
            $('.branch_content').css("position","absolute");
            $('.branch_content').css("left","-9999px");
            $('.branch_content').eq($(this).index()-1).css("opacity","1");
            $('.branch_content').eq($(this).index()-1).css("position","static");
            $('.branch_content-top-date-model').css("display","none");
            $('.branch_content').eq($(this).index()-1).find('.branch_content-top-date-title').eq(0).next().css("display","block");
        })
    }
    //活动切换
    $('.branch_content-top-date-title').click(function(){
        $('.branch_content-top-date-title').css("display","block");
        $(this).css("display","none");
        $('.branch_content-top-date-model').css("display","none");
        $(this).next().css("display","block");
    })

    //轮播功能
    var swiper = new Swiper('#branch_swiper1 .swiper-container', {
        slidesPerView: 3,
        spaceBetween: 0,
        autoplay: true,
        loop: true,
        pagination: {
            el: '#branch_swiper1 .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '#branch_swiper1 .swiper-button-next',
            prevEl: '#branch_swiper1 .swiper-button-prev',
        },
    });
    var swiper = new Swiper('#branch_swiper2 .swiper-container', {
        slidesPerView: 3,
        spaceBetween: 0,
        autoplay: true,
        loop: true,
        pagination: {
            el: '#branch_swiper2 .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '#branch_swiper2 .swiper-button-next',
            prevEl: '#branch_swiper2 .swiper-button-prev',
        },
    });
    var swiper = new Swiper('#branch_swiper3 .swiper-container', {
        slidesPerView: 3,
        spaceBetween: 0,
        autoplay: true,
        loop: true,
        pagination: {
            el: '#branch_swiper3 .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '#branch_swiper3 .swiper-button-next',
            prevEl: '#branch_swiper3 .swiper-button-prev',
        },
    });
    var swiper = new Swiper('#branch_swiper4 .swiper-container', {
        slidesPerView: 3,
        spaceBetween: 0,
        autoplay: true,
        loop: true,
        pagination: {
            el: '#branch_swiper4 .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '#branch_swiper4 .swiper-button-next',
            prevEl: '#branch_swiper4 .swiper-button-prev',
        },
    });
})

$(function () {
    if(document.getElementById('classroomList')) {
        // 标记加载更多的点击次数
        var  themeLength = [];
        var themeIndex = [];
        // 加载更多专题

        function themeInit() {
            $("#classroomList .project_Immigration").each(function(index,element){
                themeIndex[$(this).index()] = 1
                themeLength[$(this).index()] = Math.ceil($(this).find('a').length / 3);
                if (themeLength[$(this).index()] > 0) {
                    if (themeLength[$(this).index()] == 1) {
                        $(this).find('.project_buttonTwo').css("display","none");
                    } else {
                        $(this).find('.project_buttonTwo').css("display","block");
                    }
                }
                $(this).find('.project_content-frame').css('max-height', '305px');
            })

        }
        themeInit();
        // 国家项目对比加载更多
        $('#classroomList .project_buttonTwo').click(function (e) {
            themeIndex[$(this).data('current')] ++;
            $(this).prev().css('max-height', 305 * themeIndex[$(this).data('current')] + 'px');
            if (themeIndex[$(this).data('current')] >= themeLength[$(this).data('current')]) {
                $(this).css("display","none");
            } else {
                $(this).css("display","block");
            }
        });
        //选中当前的标题
        $("#classroomList .project_Immigration").each(function(){
            if(0 < $(this).offset().top - $(document).scrollTop()  && $(this).offset().top - $(document).scrollTop() < $(window).height()) {
                $("#classroomList .project_Immigration").find('h3').removeClass('class_active')
                $(this).find('h3').addClass('class_active')
            }
        });
        if (document.getElementById('classroomList')) {
        $(window).scroll(function() {
            //获取页面滚走的距离
            var sTop = $(document).scrollTop();

            $("#classroomList .project_Immigration").each(function(){
                if(0 < $(this).offset().top - $(document).scrollTop()  && $(this).offset().top - $(document).scrollTop() < $(window).height()) {
                    $("#classroomList .project_Immigration").find('h3').removeClass('class_active')
                    $(this).find('h3').addClass('class_active')
                }
            });
        })
        }
        $('.project_buttonTwo').click(function () {
            $("#classroomList .project_Immigration").each(function(){
                if(0 < $(this).offset().top - $(document).scrollTop()  && $(this).offset().top - $(document).scrollTop() < $(window).height()) {
                    $("#classroomList .project_Immigration").find('h3').removeClass('class_active')
                    $(this).find('h3').addClass('class_active')
                }
            });
        })
    }

})

$(function(){
    if(document.getElementById('bread')) {
        var router = window.location.pathname
        var regu = /^\/immigrant_classroom\/\d+$/
        var regu2 = /^\/case\/\d+$/
        var regu3 = /^\/news\/\d+$/
        var regu4 = /^\/information\/\d+$/
        var regu5 = /^\/activity\/\d+$/
        var re = new RegExp(regu);
        var re2 = new RegExp(regu2);
        var re3 = new RegExp(regu3);
        var re4 = new RegExp(regu4);
        var re5 = new RegExp(regu5);
        if(router == '/news') {
            $('#level_two').append('<a href="/news"> > 新闻中心</a>')
            $('#level_three').append('<a href="/news"> > 头条新闻</a>')
        } else if(router == '/activity') {
            $('#level_two').append('<a href="/news"> > 新闻中心</a>')
            $('#level_three').append('<a href="javacript:;"> > 最新活动</a>')
        } else if(router == '/information') {
            $('#level_two').append('<a href="/news"> > 新闻中心</a>')
            $('#level_three').append('<a href="javacript:;"> > 最新资讯</a>')
        } else if(router == '/immigrant_classroom') {
            $('#level_two').append('<a href="javacript:;"> > 移民大课堂</a>')
            $('#level_three').text('')
        } else if(re.test(router)) {
            $('#level_two').append('<a href="/immigrant_classroom"> > 移民大课堂</a>')
            $('#level_three').append('<a href="javacript:;"> > 移民大课堂详情</a>')
        } else if(router == '/case') {
            $('#level_two').append('<a href="/case"> > 太平洋出国案例</a>')
            $('#level_three').text('')
        } else if(re2.test(router)) {
            $('#level_two').append('<a href="/case"> > 太平洋出国案例</a>')
            $('#level_three').text('')
        } else if(re3.test(router)) {
            $('#level_two').append('<a href="/news"> > 新闻中心</a>')
            $('#level_three').append('<a href="/news"> > 头条新闻</a>')
            $('#level_four').append('<a href="javacript:;"> > 新闻详情</a>')
        }  else if(re4.test(router)) {
            $('#level_two').append('<a href="/news"> > 新闻中心</a>')
            $('#level_three').append('<a href="/information"> > 最新资讯</a>')
            $('#level_four').append('<a href="javacript:;"> > 资讯详情</a>')
        }  else if(re5.test(router)) {
            $('#level_two').append('<a href="/news"> > 新闻中心</a>')
            $('#level_three').append('<a href="/activity"> > 最新活动</a>')
            $('#level_four').append('<a href="javacript:;"> > 活动详情</a>')
        } else if(router == '/popular_attention') {
            $('#level_two').append('<a href="/news"> > 新闻中心</a>')
            $('#level_three').append('<a href="javacript:;"> > 热门关注</a>')
        }else if(router == '/project'){
        	$('#level_two').append('<a href="javacript:;"> > 移民专题</a>')
            $('#level_three').text('')
        } else if(router == '/consultant_list'){
        	$('#level_two').append('<a href="javacript:;"> > 移民顾问</a>')
            $('#level_three').text('')
        } else if(router == '/consultant_detail'){
        	$('#level_two').append('<a href="javacript:;"> > 移民顾问</a>')
            $('#level_three').text('')
        } else if(router == '/state_contrast'){
        	$('#level_two').append('<a href="javacript:;"> > 国家对比</a>')
            $('#level_three').text('')
        } else if(router == '/state_contrastList'){
        	$('#level_two').append('<a href="javacript:;"> > 国家对比列表</a>')
            $('#level_three').text('')
        } else if(router == '/project_contrast'){
        	$('#level_two').append('<a href="javacript:;"> > 项目对比</a>')
            $('#level_three').text('')
        } else if(router == '/collect_information'){
        	$('#level_two').append('<a href="javacript:;"> > 领取资料</a>')
            $('#level_three').text('')
        } else if(router == '/member_center'){
        	$('#level_two').append('<a href="javacript:;"> > 会员中心</a>')
            $('#level_three').text('')
        } else if(router == '/login'){
        	$('#level_two').append('<a href="javacript:;"> > 登录</a>')
            $('#level_three').text('')
        } else if(router == '/registered'){
        	$('#level_two').append('<a href="javacript:;"> > 注册</a>')
            $('#level_three').text('')
        } else if(router == '/change_password'){
        	$('#level_two').append('<a href="javacript:;"> > 找回密码</a>')
            $('#level_three').text('')
        }
    }
})

$(function(){
	$(".city").click(function(){
		$(".city").removeClass("active");
		$(this).addClass("active");
	});
})

$(function(){
	if(document.getElementById("consultantDetail")){
		$("#star").raty({
		    score:function(){
				return $(this).attr("data-num");
	        },
	        starOn:'/images/test_consultantDetail/star-on.png',
	        starOff:'/images/test_consultantDetail/star-off.png',
	        starHalf:'/images/test_consultantDetail/star-half.png',
	        readOnly:false,
	        halfShow:true,
	        size:34,
		})
	}
	
	
	
	if(document.getElementById('bread')) {
        var router = window.location.pathname
        var levelThree = $("#consultantDetail").find(".consultantDetail_intro-right h4").html();
        if(router == '/consultant_detail') {
            /*$('#level_two').text(' > 移民顾问')
            $('#level_three').text(' > '+levelThree)*/
           $('#level_two').append('<a href="javacript:;"> > 移民顾问</a>')
            $('#level_three').append('<a href="javacript:;"> > '+levelThree+'</a>')
        } 
    }
	
	
	
})

$(function(){
    
    //专题title的hover效果   
    $(".project_content-common").find("div").hover(function(){
    	$(this).find(".project_immiTille").slideToggle();
    },function(){
    	$(this).find(".project_immiTille").slideToggle();
    })
    
    
    $("#project").find(".project_Immigration").each(function(){
    	if($(this).find("div.project_content-common").length <= 3){
    		$(this).find(".project_button").hide();
    	}else{
    		$(this).find(".project_button").show();
    		$(".project_button").parent(".project_Immigration").find(".project_content-frame").css("max-height","300px");
    		$(".project_button").parent(".project_Immigration").find(".project_content-frame").css("overflow","hidden");
    	}
    });
     
    
    
    
    //点击加载更多专题
    $(".project_button").click(function(){
//  	$(this).parent(".project_Immigration").find(".project_content-frame .moreContent").toggle();
    	
    	if($(this).html() == "加载更多专题"){
    		$(this).html("收起更多专题")
    		$(this).parent(".project_Immigration").find(".project_content-frame").css("max-height","");
    		$(this).parent(".project_Immigration").find(".project_content-frame").css("overflow","visible");
    	}else if($(this).html() == "收起更多专题"){
    		$(this).html("加载更多专题")
    		$(this).parent(".project_Immigration").find(".project_content-frame").css("max-height","300px");
    		$(this).parent(".project_Immigration").find(".project_content-frame").css("overflow","hidden");
    	}
    	
    });
    
    
    if(document.getElementById('project')) {
        $("#project").find(".project_Immigration").each(function(){
            if(0 < $(this).offset().top - $(document).scrollTop()  && $(this).offset().top - $(document).scrollTop() < $(window).height()) {
                $("#project").find('.project_Immigration h3').removeClass('project_active')
                $(this).find('h3').addClass('project_active')
            }
        });
        $(window).scroll(function() {
            //获取页面滚走的距离
            var sTop = $(document).scrollTop();

            $("#project").find(".project_Immigration").each(function(){
                if(0 < $(this).offset().top - $(document).scrollTop()  && $(this).offset().top - $(document).scrollTop() < $(window).height()) {
                    $("#project").find('.project_Immigration h3').removeClass('project_active')
                    $(this).find('h3').addClass('project_active')
                }
            });
        })
        $('.project_button').click(function () {
            $("#project").find(".project_Immigration").each(function(){
                if(0 < $(this).offset().top - $(document).scrollTop()  && $(this).offset().top - $(document).scrollTop() < $(window).height()) {
                    $("#project").find('.project_Immigration h3').removeClass('project_active')
                    $(this).find('h3').addClass('project_active')
                }
            });
        })
    }
    
    
    
    
})

$(function () {
    
   
   	var userTel = '';
   	var flag = false;
   	if(document.getElementById("stateContrastList")){
   		$.ajax({
	        type: 'post',
	        url: '/api/web/userCheck',
	        async: true,
	        data: {},
	        success: function (data) {
	        	if(data.data){
	        		$("#name").val(data.data.name?data.data.name:'');
	        		$("#phone").val(data.data.tel);
					userTel = data.data.tel.substring(0,3)+'****'+data.data.tel.substring(7,11)
	        		$("#phone").val(userTel);
	        		flag = true;
	        	}
	        },
	        error: function (data) {
	        	
	        }
	    })
   		
   	}
   	
   	
   	
   	
   	
   	$(".country_list").find("div").click(function(){
   		$(this).find("p").toggle();
   		var flag = $(this).find("img").attr("src");
        var country = $(this).find("img").attr("alt");
        var dataType = $(this).attr("datatype");
        if($(this).find("p").css("display") == "block"){
        	if ($(".pkCountry").find("div").length < 3) {
	            $(".pkCountry").append("<div datatype=" + dataType + "><img src=" + flag + " alt=" + country + "><span>" + country + "</span></div>");
	        } else {
	        	$(this).find("p").hide();
	            alert("最多可选3项");
	        }
        }else if($(this).find("p").css("display") == "none"){
        	$(".pkCountry").find("div[datatype = "+$(this).attr("datatype")+"]").remove();
        }
        
   	});
   	
   	
   	
   	

    $(".submitBtn").click(function () {
//		var reg = /^1[3|4|5|7|8][0-9]{9}$/;
        var reg = /^1[34578]\d{9}$/;
        var countryList = [];
        $(".pkCountry").find("div").each(function () {
            countryList.push($(this).attr('datatype'));
        });
        if(flag){
        	if (countryList.length < 2) {
	                alert("请至少选择两个国家对比");
	                return false;
	            } else {
	                $("#submit").removeAttr("disabled");
	                alert("提交成功");
	                $(this).attr('href', '/state_contrast' + '?' + '&userName='+$("#name").val()+'?'+'&userTel='+$("#phone").val()+'?'+'&country=,'+ countryList)
	            }
        }else{
        	if ($("#name").val() != "" && $("#phone").val() != "" && reg.test($("#phone").val())) {
	            if (countryList.length < 2) {
	                alert("请至少选择两个国家对比");
	                return false;
	            } else {
	                $("#submit").removeAttr("disabled");
	                alert("提交成功");
	                $(this).attr('href', '/state_contrast' + '?' + '&userName='+$("#name").val()+'?'+'&userTel='+$("#phone").val()+'?'+'&country=,' + countryList)
	            }
	        } else if (!reg.test($("#phone").val())) {
	        	alert("请输入正确的手机号码！")
	            return false;
	        } else {
	//			$(this).attr("disabled","disabled");
	            alert("请输入姓名和电话");
	            return false;
	        }
        }
        
    });

    if (document.getElementById('floatBox')) {
        window.onscroll = function () {
            var st = document.documentElement.scrollTop || document.body.scrollTop;
            if (st >= 300 && st <= 1800) {
                $(".floatBox").css("bottom", "300px");
            } else if (st < 300) {
                $(".floatBox").css("bottom", "0");
            } else if (st > 1800) {
                $(".floatBox").css("bottom", "500px");
            }
        };
    }


    $(".stateContrastList_continents-con").find(".countryName").each(function () {
        if ($(this).html().length > 4) {
            $(this).css('font-size', '16px');
        }
    });


    $(".stateContrastList_continents-con").each(function () {
        if ($(this).find(".country_list div").length < 6) {
            $(this).parent(".stateContrastList_continents").find("h1").css('position', 'relative');
            $(this).parent(".stateContrastList_continents").find("h1").css('bottom', '150px');
        }
    });

})

$(function(){
	
	if($(".table").find("tr.countryList td").length == 2){
		$(".table").find("td.tdOne").show();
	}else if($(".table").find("tr.countryList td").length == 3){
		$(".table").find("td.tdOne").show();
		$(".table").find("td.tdTwo").show();
	}else if($(".table").find("tr.countryList td").length == 4){
		$(".table").find("td.tdOne").show();
		$(".table").find("td.tdTwo").show();
		$(".table").find("td.tdThree").show();
	}
	
	
	
	
	
	
	
	var addCountry = '';
	/*$("#select").find("option").click(function(){
		$("#select").attr('data_id',$(this).attr('id'));
		addCountry = $("#select").attr('data_id');
	});*/
	$("#select").on('change',function(){
		addCountry = $("option:selected",this).attr('id');
	});
	$(".addComparison").click(function(){
		window.location.href = window.location.href+','+addCountry
	});
	

	var getUrl = window.location.href;
	var getId = decodeURIComponent(getUrl.split("?")[1]);
	var getTel = getUrl.split("?")[2];

	if(getId){
//		var getId1 = getId.split("&")[0];
		var getId1 = getId.split("=")[1];
	}
	if(getTel){
		var getTel1 = getTel.split("=")[1];
	}
	
	
	
	$(".icon-cuohao1").click(function(){
		var countryId = $(this).parent("td.cuohao1").attr('dataId');
		var sear=new RegExp(countryId);
		var firstDou = ','?',':"";
		if(sear.test(getUrl)){
			getUrl = getUrl.replace(new RegExp(firstDou+countryId,'g'),'')
			window.location.href = getUrl;
		}
		$(this).parents(".table").find("td.cuohao1").html("");
	});
	$(".icon-cuohao2").click(function(){
		var countryId = $(this).parent("td.cuohao2").attr('dataId');
		var sear=new RegExp(countryId);
		var firstDou = ','?',':"";
		if(sear.test(getUrl)){
			getUrl = getUrl.replace(new RegExp(firstDou+countryId,'g'),'')
			window.location.href = getUrl;
		}
		$(this).parents(".table").find("td.cuohao2").html("");
	});
	$(".icon-cuohao3").click(function(){
		var countryId = $(this).parent("td.cuohao3").attr('dataId');
		var sear=new RegExp(countryId);
		var firstDou = ','?',':"";
		if(sear.test(getUrl)){
			getUrl = getUrl.replace(new RegExp(firstDou+countryId,'g'),'')
			window.location.href = getUrl;
		}
		$(this).parents(".table").find("td.cuohao3").html("");
	});
	
	
	/*$("#stateContrast").find(".userName input").val(getId1);
	$("#stateContrast").find(".userTel input").val(getTel1);*/
	var flag = false;
	var telPhone = '';
	var nameOne = '';
	if(document.getElementById("stateContrast")){
		$.ajax({
	        type: 'post',
	        url: '/api/web/userCheck',
	        async: true,
	        data: {},
	        success: function (data) {
	        	if(data.data){
	        		flag = true;
	        		telPhone = data.data.tel;
	        		nameOne = data.data.name;
	        	}
	        },
	        error: function (data) {
	        	
	        }
	    })
		
		
		
		
		
		
		
		
		
		$(".callBack").click(function () {
	        $(".bulletWindows").show();
			if(getId.substring(0,9) == '&userName'){
				$("#stateContrast").find(".userName input").val(getId1);
				$("#stateContrast").find(".userTel input").val(getTel1);
			}else{
				$("#stateContrast").find(".userName input").val(nameOne);
				$("#stateContrast").find(".userTel input").val(telPhone);
			}
	    });
    $(".close").click(function () {
        $(".bulletWindows").hide();
    });
    $(".booking").click(function () {
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
        if(flag){
        	$.ajax({
		        type: 'post',
		        url: '/api/web/message',
		        async: true,
		        data: {
		        	source: "state_contrast",
		        	content: $("#stateContrast").find(".country").html(),
		        	remark: $(this).parents(".bulletWindows").find("textarea").val()?$(this).parents(".bulletWindows").find("textarea").val():"",
		        	tel: flag?telPhone:$(this).parents(".bulletWindows").find(".tel").val(),
		        	username: getId1,
                    refer:$("#refer").val()
		        },
		        success: function (data) {
		        	alert("提交成功");
		        },
		        error: function (data) {
		        	
		        }
		  	})
            $(".bulletWindows").hide();
        }else{
        	if (!myreg.test($(".tel").val())) {
	            alert("请输入有效的手机号码！")
	        } else {
	            $.ajax({
			        type: 'post',
			        url: '/api/web/message',
			        async: true,
			        data: {
			        	source: "state_contrast",
			        	content: $("#stateContrast").find(".country").html(),
			        	remark: $(this).parents(".bulletWindows").find("textarea").val()?$(this).parents(".bulletWindows").find("textarea").val():"",
			        	tel: $(this).parents(".bulletWindows").find(".tel").val(),
			        	username: getId1,
                        refer:$("#refer").val()
                    },
			        success: function (data) {
			        	alert("提交成功");
			        },
			        error: function (data) {
			        	
			        }
			  	})
	            $(".bulletWindows").hide();
	        }
        }
        
    });

	}

})

$(function(){
	var getUrl = window.location.href;
	var projectIds = [];
	var projectId = getUrl.split("?")[1];
	if(projectId){
		var projectId1 = projectId.split("&")[0];
		var projectId2 = projectId1.split("=")[1];
	}
	
	if(document.getElementById("projectContrast")){
		$.ajax({
	        type: 'post',
	        url: '/api/web/projectContrast',
	        async: true,
	        data: {
	        	project_ids: '['+projectId2+']'
	        },
	        success: function (data) {
	        	if(data){
	        		$.each(data.data, function(i,item) {
			            $(".projectContrast_content-center").find(".table .title").append("<th class='projectName'>"+item.title+"</th>");
			            $(".projectContrast_content-center").find(".table .intro").append("<td>"+item.intro+"</td>");
			            $(".projectContrast_content-center").find(".table .advantage").append("<td>"+item.advantage+"</td>");
			            $(".projectContrast_content-center").find(".table .apply_condition").append("<td>"+item.apply_condition+"</td>");
			            $(".projectContrast_content-center").find(".table .attached_apply_condition").append("<td>"+item.attached_apply_condition+"</td>");
			            $(".projectContrast_content-center").find(".table .renew_condition").append("<td>"+item.renew_condition+"</td>");
			            $(".projectContrast_content-center").find(".table .forever_live_condition").append("<td>"+item.forever_live_condition+"</td>");
			            $(".projectContrast_content-center").find(".table .naturalization_condition").append("<td>"+item.naturalization_condition+"</td>");
			            $(".projectContrast_content-center").find(".table .handle_procedure_period").append("<td>"+item.handle_procedure_period+"</td>");
			           	$(".projectContrast_content-center").find(".table .estimated_amounts").append("<td>"+item.estimated_amounts+"</td>");
			        });
			        if($(".table .title").find("th").length == 2){
			        	$(".table").find("td.tdOne").show();
			        }else if($(".table .title").find("th").length == 3){
			        	$(".table").find("td.tdOne").show();
			        	$(".table").find("td.tdTwo").show();
			        }else if($(".table .title").find("th").length == 4){
			        	$(".table").find("td.tdOne").show();
			        	$(".table").find("td.tdTwo").show();
			        	$(".table").find("td.tdThree").show();
			        }
	        	}
	        },
	        error: function (data) {
	        	
	        }
	    })
	}
	
	
	
	var tel = '';
	var name = '';
	if(document.getElementById("projectContrast")){
		$.ajax({
	        type: 'post',
	        url: '/api/web/userCheck',
	        async: true,
	        data: {},
	        success: function (data) {
	        	if(data.data){
	        		$("#projectContrast").find(".userName input").val(data.data.name?data.data.name:'');
	        		$("#projectContrast").find(".userTel input").val(data.data.tel);
	        		tel = data.data.tel;
	        		name = data.data.name;
	        	}else{
	        		tel = "";
	        		name = "";
	        	}
	        },
	        error: function (data) {
	        	
	        }
	    })
		
		
		$(".callBack").click(function(){
		$(".bulletWindows").show();
	});
	$(".close").click(function(){
		$(".bulletWindows").hide();
	});
	$(".booking").click(function(){
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
		if(!myreg.test($(".tel").val())){
			alert("请输入有效的手机号码！")
		}else if($(".userName").find("input").val() == ""){
			alert("请输入您的姓名！")
		}else{
			$.ajax({
		        type: 'post',
		        url: '/api/web/message',
		        async: true,
		        data: {
		        	source: "project_contrast",
		        	content: $("#projectContrast").find(".projectName").html(),
		        	remark: $(this).parents(".bulletWindows").find("textarea").val()?$(this).parents(".bulletWindows").find("textarea").val():"",
		        	tel: tel==''?$(".bulletWindows").find(".tel").val():tel,
		        	username: name==''?$(".bulletWindows").find(".userName input").val():name,
                    refer:$("#refer").val()
		        },
		        success: function (data) {
		        	alert("提交成功");
		        },
		        error: function (data) {
		        	
		        }
		  	})
			$(".bulletWindows").hide();
		}
	});
		
		
		
		
	}
	
	
	
})

$(function(){
	var content = [];
	$(".project").click(function(){
		$(this).find(".mask").toggle();
		var del = $(this).attr("dataCon");
		if($(this).find("p").css("display") == "block"){
			content.push($(this).attr("dataCon"));
		}else{
			$.each(content, function(index,item) {
				if(del == item){
					content.splice(index,1)
				}
			});
		}
	});
	
	
	/*$(".collectInformation_common-con").find("div.project").hover(function () {
        $(this).find("p").show();
    }, function () {
        $(this).find("p").hide();
    });*/
	
	
	
	
	var userAgent = navigator.userAgent; 
	if (userAgent.indexOf("Chrome") > -1){
		
	}  
	
	
	var userName = '';
	var userTel = '';
	var flag = false;
	if(document.getElementById("collectInformation")){
		$.ajax({
	        type: 'post',
	        url: '/api/web/userCheck',
	        async: true,
	        data: {},
	        success: function (data) {
	        	if(data.data){
	        		$("#collectInformation").find(".phoneNumber").val(data.data.tel.substring(0,3)+"****"+data.data.tel.substring(7,11));
	        		userName = data.data.name == ''?'':data.data.name;
	        		userTel = data.data.tel == ''?'':data.data.tel;
	        		flag = true;
	        		$("#collectInformation").find(".alreadyDenglu").hide();
	        	}else{
	        		$("#collectInformation").find(".alreadyDenglu").show();
	        	}
	        },
	        error: function (data) {
	        	
	        }
	   	})
	}
	
	
	
	
	
	$(".continentChoose").on('change',function(){
		if($("option:selected",this).attr("value") == -1){
			$(".collectInformation_content-section").show();
		}else if($("option:selected",this).attr("value") == "大洋洲"){
			$(".collectInformation_content-section").hide();
			$(".collectInformation_content-section[datatype = '大洋洲']").show();
		}else if($("option:selected",this).attr("value") == "北美洲"){
			$(".collectInformation_content-section").hide();
			$(".collectInformation_content-section[datatype = '北美洲']").show();
		}else if($("option:selected",this).attr("value") == "欧洲"){
			$(".collectInformation_content-section").hide();
			$(".collectInformation_content-section[datatype = '欧洲']").show();
		}else if($("option:selected",this).attr("value") == "亚洲"){
			$(".collectInformation_content-section").hide();
			$(".collectInformation_content-section[datatype = '亚洲']").show();
		}
	});
	
	
	
	
	$(".classification").on('change',function(){
		if($("option:selected",this).attr("value") == "全部"){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").show();
		}else if($("option:selected",this).attr("value") == 1){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 1]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 1]").length == 0){
					$(this).hide();
				}
			});
		}else if($("option:selected",this).attr("value") == 2){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 2]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 2]").length == 0){
					$(this).hide();
				}
			});
		}else if($("option:selected",this).attr("value") == 3){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 3]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 3]").length == 0){
					$(this).hide();
				}
			});
		}else if($("option:selected",this).attr("value") == 4){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 4]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 4]").length == 0){
					$(this).hide();
				}
			});
		}else if($("option:selected",this).attr("value") == 5){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 5]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 5]").length == 0){
					$(this).hide();
				}
			});
		}else if($("option:selected",this).attr("value") == 6){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 6]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 6]").length == 0){
					$(this).hide();
				}
			});
		}else if($("option:selected",this).attr("value") == 7){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 7]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 7]").length == 0){
					$(this).hide();
				}
			});
		}else if($("option:selected",this).attr("value") == 8){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 8]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 8]").length == 0){
					$(this).hide();
				}
			});
		}else if($("option:selected",this).attr("value") == 9){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 9]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 9]").length == 0){
					$(this).hide();
				}
			});
		}else if($("option:selected",this).attr("value") == 10){
			$(".collectInformation_common").show();
			$(".collectInformation_common-con").find(".project").hide();
			$(".collectInformation_common-con").find(".project[datatype = 10]").show();
			$(".collectInformation_common").each(function(){
				if($(this).find(".collectInformation_common-con .project[datatype = 10]").length == 0){
					$(this).hide();
				}
			});
		}
	});
	
	
	
	
	
	$("#collectInformation").find("#addSendCode").on('click',function(){
		var InterValObj; 
		var count = 60; 
		var curCount;
		curCount = count;
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
        var booltel = myreg.test($("#collectInformation").find(".phoneNumber").val());
        function SetRemainTimeRegistered() {
			if (curCount == 0) {                
				window.clearInterval(InterValObj);
				$("#addSendCode").removeAttr("disabled");
				$("#addSendCode").val("重新获取验证码").css({"background-color":"#0097a8"});
			}else {
				curCount--;
				$("#addSendCode").val("" + curCount + "秒后重新获取").css({"background-color":"#D1D4D3"});
			}
		}
		if(!booltel){
			alert("请输入有效的手机号码！");
		}
		if(booltel){
			$("#collectInformation").find("#addSendCode").attr("disabled", "true");
			$("#collectInformation").find("#addSendCode").val("" + curCount + "秒后重新获取");
			InterValObj = window.setInterval(SetRemainTimeRegistered, 1000); 
			$.ajax({
				type:'post',
				url:'/api/user/verify',
				async:true,
				data:{
					tel:$("#collectInformation").find(".phoneNumber").val(),
				},
				success:function(data){
					alert("校验码发送成功");
				}
			})
		}
	});
	
	var purpose = '' ;
	$("#selectMudi").on('change',function(){
		$(this).attr('dataCon',$("option:selected",this).attr("value"))
		if($(this).attr('dataCon') == '全部'){
			purpose = '全部'
		}else{
			purpose = $(this).attr('dataCon');
		}
	});
	
	
	
	
	
	var num = 0;
	var messageFlag = false;
	
	$("#collectInformation").find(".submit").click(function(){
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
		$(".project").each(function(){
			if($(this).find("p").css("display") == "block"){
				num++
			}
		});
		if(purpose == ''){
			purpose = '全部'
		}
		if(flag){
			if(num == 0){
				alert("请至少选择一个项目！")
			}else{
				if(messageFlag){
					return false;
				}
                messageFlag = true;
				$.ajax({
			        type: 'post',
			        url: '/api/web/message',
			        async: true,
			        data: {
			        	source: "collect_information",
			        	content: content.toString(),
			        	username: userName,
			        	purpose: purpose,
                        refer:$("#refer").val()
			        },
			        success: function (data) {
			        	alert("我们已经了解您的资料需求，会尽快和您联系。");
                        messageFlag = false;
			        },
			        error: function (data) {
			        	
			        }
			  })
			}
		}else{
			if(!myreg.test($(".phoneNumber").val())){
				alert("请输入正确的手机号码！")
			}else if($(".checkCode").val() == ""){
				alert("请输入校验码！")
			}else if(num == 0){
				alert("请至少选择一个项目！")
			}else{
                if(messageFlag){
                    return false;
                }
                messageFlag = true;
				$.ajax({
			        type: 'post',
			        url: '/api/web/message',
			        async: true,
			        data: {
			        	source: "collect_information",
			        	content: content.toString(),
			        	tel: $(".phoneNumber").val(),
			        	verify: $(".checkCode").val(),
			        	username: userName,
			        	purpose: purpose,
                        refer:$("#refer").val()
			        },
			        success: function (data) {
			        	if(data.code == 40101){
			        		alert("验证码发送频繁，请稍后再试");
			        	}else{
			        		alert("我们已经了解您的资料需求，会尽快和您联系。");
			        	}
                        messageFlag = false;
			        },
			        error: function (data) {
			        	
			        }
			  })
			}
		}
				
	});
	
	
	
	
})

$(function(){
	$(".save").find("button").click(function(){
		$(".save").find("button").removeClass("btnActive");
		$(this).addClass("btnActive");
	});
	
	$(".titleTab").find("button").click(function(){
		$(".titleTab").find("button").removeClass("btnActive");
		$(this).addClass("btnActive");
	});
	
	$(".btnInfo").click(function(){
		$(".tabCard").hide();
		$(".info").show();
	});
	$(".btnPortrait").click(function(){
		$(".tabCard").hide();
		$(".headPortrait").show();
	});
	$(".btnPassword").click(function(){
		$(".tabCard").hide();
		$(".changePassword").show();
	});
	
	
	
	if(document.getElementById("memberCenter")){
		$.ajax({
	        type: 'post',
	        url: '/api/web/userCheck',
	        async: true,
	        data: {},
	        success: function (data) {
	        	if(data.data){
	        		var d = new Date(data.data.birthday * 1000);
	        		var day = ("0" + d.getDate()).slice(-2); 
	        		var month = ("0" + (d.getMonth() + 1)).slice(-2); 
	        		$(".userName").val(data.data.name?data.data.name:'');
	        		sessionStorage.setItem('username', data.data.name?data.data.name:'');
		        	$(".nickName").val(data.data.nickname?data.data.nickname:'');
		        	$(".personalHead").attr("src",data.data.headimgurl_web?data.data.headimgurl_web:'');
		        	$(".email").val(data.data.email?data.data.email:'');
		        	$(".phone").val(data.data.reserve_tel?data.data.reserve_tel:'');
		        	$(".birthday").val(d.getFullYear()+'-'+month+'-'+day?d.getFullYear()+'-'+month+'-'+day:'');
		        	$("#budget").find("option[value = "+data.data.budget+"]").attr("selected","selected");
		        	$("#purpose").find("option[value = "+data.data.purpose+"]").attr("selected","selected");
		        	$(".preview").attr('src',data.data.headimgurl_web?data.data.headimgurl_web:'');
		        	if(data.data.sex == 1){
		        		$("#memberCenter").find(".sex input").attr("checked",false);
		        		$("#memberCenter").find("#male").attr("checked",true);
		        	}else{
		        		$("#memberCenter").find("#female").attr("checked",true);
		        		$("#memberCenter").find(".sex input").attr("checked",false);
		        	}
	        	}
	        },
	        error: function (data) {
	        	
	        }
	    })
	}
	
	
	
	
	
	
	
	
	
	//图像上传
	var crop = new Crop(document.getElementById('js_file'), {
	    cropWidth: 150,
	    cropHeight: 150
  });
	crop.on('change', function (file) {
		
	}).on('init', function (file) {
		
	}).on('error', function (code, msg) {
		
	}).on('crop', function (file, fileName) {
	    document.getElementById('js_img').src = file;
	});
		
		
	
	
	$(".file").on('change',function(){
		var file = $(this).val();
		var strFileName=file.replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi,"$1"); 
		var FileExt=file.replace(/.+\./,"");
		
		
		var $file = $(this);
        var fileObj = $file[0];
        var windowURL = window.URL || window.webkitURL;
        var dataURL;
        var $img = $(".memberCenter_content-left").find("img");
        var $imgTwo = $(".headPortrait").find("img");
        if (fileObj && fileObj.files && fileObj.files[0]) {
            dataURL = windowURL.createObjectURL(fileObj.files[0]);
            $img.attr('src', dataURL);
            $imgTwo.attr('src', dataURL);
        } else {
            dataURL = $file.val();
            var imgObj = document.getElementById("preview");
            // 两个坑:
            // 1、在设置filter属性时，元素必须已经存在在DOM树中，动态创建的Node，也需要在设置属性前加入到DOM中，先设置属性在加入，无效；
            // 2、src属性需要像下面的方式添加，上面的两种方式添加，无效；
            imgObj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
            imgObj.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = dataURL;

        }
	});
	$(".savePhoto").on('click',function(){
		var form=document.getElementById("form1");
	    var fd =new FormData(form);
	    $.ajax({
	    	url: '/api/upload',
	    	type: 'post',
	    	data: fd,
	    	processData: false,  
	        contentType: false,   
	        success:function(response,status,xhr){
	        	if(response.data){
	        		$(".memberCenter_content-left").find("img").attr("src",response.data['path']);
	        		$(".headPortrait").find("img").attr("src",response.data['path']);
	        		$.ajax({
						type:'post',
						url:'/api/web/updateUserInfo',
						async:true,
						data:{
							headimgurl_web:response.data['path']?response.data['path']:"",
						},
						success:function(data){
							alert("保存成功");
						},
						error:function(data){
							if(data.status == 401){
								alert("您尚未登录，请先登录！");
								window.location.href = "/login"+"?memberCenter";
							}
						}
					})
	        	}
//	        	alert("保存成功！")
	        },
	        error:function(data){
	        	
	        }
	    })
			
	    
	    
	    
	});
	
	
	
	
	
	
	
	
	$("#memberCenter").find(".email").on('focus',function(){
		if($(this).val() == '请输入正确的邮箱地址'){
			$(this).val("");
			$(this).css("color","#444444");
		}
	});
	$("#memberCenter").find(".email").on('blur',function(){
		var re = new RegExp(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/g);
		if(!re.test($(this).val())){
//			$(this).val("");
			$(this).val("请输入正确的邮箱地址");
			if($(this).val() == "请输入正确的邮箱地址"){
				$(this).css("color","red");
			}
//			$(this).css("color","red");
//			alert("请输入正确的邮箱地址！");
//			return true;
		}else if($(this).val() == ""){
			$(this).attr("placeholder","请填写您邮箱");
			$(this).css("color","#444444");
		}else{
			$(this).attr("placeholder","请填写您邮箱");
			$(this).css("color","#444444");
		}
	});
	$("#memberCenter").find(".phone").on('focus',function(){
		if($(this).val() == '请输入正确的手机号码'){
			$(this).val("");
			$(this).css("color","#444444");
		}			
	});
	
	$("#memberCenter").find(".phone").on('blur',function(){
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/; 
		if(!myreg.test($(this).val())){
//			$(this).val("");
			$(this).val("请输入正确的手机号码");
			if($(this).val() == "请输入正确的手机号码"){
				$(this).css("color","red");
			}
//			alert("请输入正确的手机号码！");
//			return true;
		}else if($(this).val() == ""){
			$(this).attr("placeholder","请填写您的备用手机（请输入数字）");
			$(this).css("color","#444444");
		}else{
			$(this).attr("placeholder","请填写您的备用手机（请输入数字）");
			$(this).css("color","#444444");
		}
	});
	
	
	//移民预算
	$("#budget").on('change',function(){
		$(this).attr("dataId",$("option:selected",this).attr("value"))
	})
	//移民目的
	$("#purpose").on('change',function(){
		$(this).attr("dataId",$("option:selected",this).attr("value"))
	})
	
	
	
	$("#memberCenter").find(".sexTotal input").on('click',function(){
		$("#memberCenter").find(".sexTotal input").attr("checked",false);
		$(this).attr("checked",true);
	});
	$(".saveInfo").on('click',function(){
		var re = new RegExp(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/g);
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/; 
		var userEmail = re.test($("#memberCenter").find(".email").val());
		var userTel = myreg.test($("#memberCenter").find(".phone").val())
		var userName = $("#memberCenter").find(".userName").val().length > 0;
		/*if(!userEmail){
			alert("请输入正确的邮箱地址！")
		}
		if(!userTel){
			alert("请输入正确的手机号码！")
		}*/
		if(!userName){
			alert("请输入姓名")
		}
		if(userName){
			$.ajax({
				type:'post',
				url:'/api/web/updateUserInfo',
				async:true,
				data:{
					name:$("#memberCenter").find(".userName").val(),
					nickname:$("#memberCenter").find(".nickName").val()?$("#memberCenter").find(".nickName").val():"",
					sex:$("#memberCenter").find(".sex input").attr("checked")=="checked"?1:2,
					email:$("#memberCenter").find(".email").val()?$("#memberCenter").find(".email").val():"",
					reserve_tel:$("#memberCenter").find(".phone").val()?$("#memberCenter").find(".phone").val():"",
					birthday:$("#memberCenter").find(".birthday").val()?Date.parse($("#memberCenter").find(".birthday").val())/1000:"",
					purpose:$("#purpose").attr("dataId"),
					budget:$("#budget").attr("dataId")
				},
				success:function(data){
					/*$("#msg").find("p").html("保存成功！");
					$("#msg").show(300).delay(3000).hide(300);*/
					alert("保存成功");
				},
				error:function(data){
					if(data.status == 401){
//						$("#msg").find("p").html("您尚未登录，请先登录！").show(3000).delay(30000).hide(3000); 
						alert("您尚未登录，请先登录！");
						window.location.href = "/login"+"?memberCenter";
					}
				}
			})
		}
	});
	
	
	
	
	
	
	
	
	$(".savepassword").on('click',function(){
		var bollpwd = $(".oldPsd").val().length >= 6;
		var newpwd = $(".newPsd").val().length >= 6;
		var confirmpsd = $(".confirmPsd").val().length >= 6;
		var psd1 = $(".newPsd").val() == $(".confirmPsd").val();
		if(!bollpwd){
			alert("您的原密码输入错误！请重新输入！");
		}
		if(!newpwd){
			alert("密码不能少于6位");
		}
		if(!confirmpsd){
			alert("密码不能少于6位");
		}
		if(!psd1){
			alert("两次输入密码不一致");
		}
		if(bollpwd && newpwd && confirmpsd && psd1){
			$.ajax({
				type:'post',
				url:'/api/web/updatePassword',
				async:true,
				data:{
					old_password:$(".oldPsd").val(),
					password:$(".newPsd").val(),
					confirm_password:$(".confirmPsd").val(),
				},
				success:function(data){
					if (200 == data.code) {
                        alert("修改密码成功");
                        $(".oldPsd").val("");
                        $(".newPsd").val("");
                        $(".confirmPsd").val("");
					} else if(40104 == data.code) {
						alert("原始密码错误！");
					} else {
                        alert("修改密码失败");
					}

				},
				fail:function(data){
					
				}
			})
		}
	});
	
	
	
	var getUrl = window.location.href;
	var getName = getUrl.split("?")[1];
	if(getName){
		var getName1 = getName.split("&")[0];
		var getName2 = getName1.split("=")[1];
		if(getName2){
			$("#memberCenter").find(".memberCenter_content-left .telStart").html(getName2.slice(0,3));
			$("#memberCenter").find(".memberCenter_content-left .telEnd").html(getName2.slice(7,11));
		}
	}
	
	
	
	
	
	
		
})

$(function(){
	
	var getUrl = window.location.href;
	var getName = getUrl.split("?")[1];
	if(getName){
		if(getName.substring(0,8) == 'userName'){
			var getName1 = getName.split("=")[1];
			$("#login").find(".phone").val(getName1?getName1:'');
		}
	}
	
	
	
	$("#login").find(".avoid input").on('click',function(){
		if($(this).attr("checked") == "checked"){
			$(this).attr("checked",false);
		}else{
			$(this).attr("checked",true);
		}
	});
	
	
	$("#login").find(".login_content-right .loginBtn").on('click',function(){
		var boolpwd = $("#login").find(".login_content-right .password").val().length >= 6;
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
		var booltel = myreg.test($("#login").find(".login_content-right .phone").val());
		if(!booltel){
			alert("请输入有效的手机号码！");
		}else if(!boolpwd){
			alert("密码不能少于6位！");
		}
		if(boolpwd && booltel){
			$.ajax({
				type:'post',
				url:'/api/web/login',
				async:true,
				data:{
					username:$("#login").find(".login_content-right .phone").val(),
					password:$("#login").find(".login_content-right .password").val(),
					remember:$("#login").find(".avoid input").attr("checked")=='checked'?1:0
				},
				success:function(data){
					if(data.code == 200){
						alert("登录成功");
						var getUrl = window.location.href;
						var tel = $("#login").find(".phone").val();
						var url = "/#"+"?"+"userName="+tel;
						// var getName = getUrl.split("?")[1];

						var getName;
						if (location.search) {
							var currentAry = location.search.split('=');
							if (currentAry[0] === '?current') {
								getName = location.search.split('=')[1];
                            }
						}
						if (getName) {
							location.href = getName;
						} else if(location.search == "?memberCenter"){
							window.location.href = "/member_center"
						}else {
                            window.location.href = url;
                        }



//						var url = getName+"?"+"userName="+tel;
// 						if(getName == 'Evaluate'){
// 							window.location.href = "/evaluate";
// 						}else{
// 							window.location.href = url;
// 						}
					}else if(data.code == 40001){
						alert("密码不正确！")
					}else if(data.code == 40102){
						alert("账户不存在！请注册！");
						var getUrl = window.location.href;
						var getName = getUrl.split("?")[1];
						window.location.href = "/registered"+'?'+getName;
					}
					
				},
				error:function(data){
					
				}
			})
		}
	});
	
	


})

$(function(){
	
	$("#registered").find("#addSendCode").on('click',function(){
		var InterValObj; 
		var count = 60; 
		var curCount;
		curCount = count;
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
        var booltel = myreg.test($("#registered").find("#add_phone").val());
		
					
					
					
		function SetRemainTimeRegistered() {
			if (curCount == 0) {                
				window.clearInterval(InterValObj);
				$("#addSendCode").removeAttr("disabled");
				$("#addSendCode").val("重新获取验证码").css({"background-color":"#0097a8"});
			}else {
				curCount--;
				$("#addSendCode").val("" + curCount + "秒后重新获取").css({"background-color":"#D1D4D3"});
			}
		}
		if(!booltel){
			alert("请输入有效的手机号码！");
		}
		if(booltel){
			$.ajax({
				type:'post',
				url:'/api/web/checkTel',
				async:true,
				data:{
					tel:$("#registered").find("#add_phone").val()
				},
				success:function(data){
					if(data.code == 40103){
						alert("您已注册太平洋出国，请直接登录");
						window.location.href = "/login"+"?"+"userName="+$("#registered").find("#add_phone").val();
					}else{
						$("#registered").find("#addSendCode").attr("disabled", "true");
						$("#registered").find("#addSendCode").val("" + curCount + "秒后重新获取");
						InterValObj = window.setInterval(SetRemainTimeRegistered, 1000); 
						$.ajax({
							type:'post',
							url:'/api/user/verify',
							async:true,
							data:{
								tel:$("#registered").find("#add_phone").val(),
							},
							success:function(data){
								alert("校验码发送成功");
							}
						})
					}
				},
				error:function(data){
					
				}
			})
						
		}	
					
					
	});
	
	
	
	$("#registered").find(".registered_content-right .registeredBtn").on('click',function(){
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
		var booltel = myreg.test($("#registered").find("#add_phone").val());
		var boolpwd = $("#registered").find(".registered_content-right .pwd").val().length >= 6;
		var boolcode = $("#registered").find(".registered_content-right .checkCode").val().length > 0;
		if(!booltel){
			alert("请输入有效的手机号码！");
		}else if(!boolpwd){
			alert("密码不能少于6位！");
		}else if(!boolcode){
			alert("请输入验证码！");
		}
		if(boolpwd && booltel && boolcode){
			$.ajax({
				type:'post',
				url:'/api/web/registered',
				async:true,
				data:{
					tel:$("#registered").find("#add_phone").val(),
					verify:$("#registered").find(".registered_content-right .checkCode").val(),
					password:$("#registered").find(".registered_content-right .pwd").val(),
                    refer:$("#refer").val()
				},
				success:function(data){
					if(data.code == 200){
						alert("注册成功,请登录");
						var getUrl = window.location.href;
						var getName = getUrl.split("?")[1];
						if(getName == 'Evaluate'){
							window.location.href = "/evaluate";
						}else{
							window.location.href = "/login"+"?"+"userName="+$("#registered").find("#add_phone").val();
						}
//						window.location.href = "/login";
					}else if(data.code == 40100){
						alert("验证码不正确");
					}else if(data.code == 40001){
						alert("注册失败!")
					}
				},
				error:function(data){
					if(data.status == 422){
						alert("您已注册太平洋出国，请直接登录");
//						window.location.href = "/login";
						window.location.href = "/login"+"?"+"userName="+$("#registered").find("#add_phone").val();
					}
				}
			})
		}
	});
	
	
	
	
	
})

$(function(){
	
	$("#changePassword").find(".addSendCode").on('click',function(){
		var InterValObj; 
		var count = 60; 
		var curCount;
		curCount = count;
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
		var booltel = myreg.test($("#changePassword").find(".tel").val());
		function SetRemainTimeChangePsd() {
			if (curCount == 0) {                
				window.clearInterval(InterValObj);
				$("#changePassword").find(".addSendCode").removeAttr("disabled");
				$("#changePassword").find(".addSendCode").val("重新获取验证码").css({"background-color":"#0097a8"});
			}
			else {
				curCount--;
				$("#changePassword").find(".addSendCode").val("" + curCount + "秒后重新获取").css({"background-color":"#D1D4D3"});
			}
		}
		if(!booltel){
			alert("请输入有效的手机号码！");
		}
		if(booltel){
			$("#changePassword").find(".addSendCode").attr("disabled", "true");
			$("#changePassword").find(".addSendCode").val("" + curCount + "秒后重新获取");
			InterValObj = window.setInterval(SetRemainTimeChangePsd, 1000); 
			$.ajax({
				type:'post',
				url:'/api/user/verify',
				async:true,
				data:{
					tel:$("#changePassword").find(".tel").val(),
				},
				success:function(data){
					alert("校验码发送成功");
				}
			})
		}
	});
	
	
	
	$("#changePassword").find(".changePassword_content-center button").on('click',function(){
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
		var booltel = myreg.test($("#changePassword").find(".tel").val());
		var boolpwd = $("#changePassword").find(".pwd").val().length >= 6;
		var boolcode = $("#changePassword").find(".checkCode").val().length > 0;
		if(!booltel){
			alert("请输入有效的手机号码！");
		}else if(!boolpwd){
			alert("密码不能少于6位！");
		}else if(!boolcode){
			alert("请输入验证码！");
		}
		if(boolpwd && booltel && boolcode){
			$.ajax({
				type:'post',
				url:'/api/web/findPassword',
				async:true,
				data:{
					tel:$("#changePassword").find(".tel").val(),
					verify:$("#changePassword").find(".checkCode").val(),
					password:$("#changePassword").find(".pwd").val()
				},
				success:function(data){
					if(data.code == 200){
						alert("修改密码成功");
						window.location.href = "/login";
					}else if(data.code == 40100){
						alert("验证码不正确");
					}else if(data.code == 40102){
						alert("	账号不存在！请注册！");
						window.location.href = "/registered";
					}else if(data.code == 40001){
						alert("修改密码失败！")
					}
				},
				error:function(data){
					
				}
			})
		}
	});
	
	
	
	
	
})

$.fn.CustomPage = function (config) {
    // 默认配置
    var defaults = {
        pageSize: 10,
        count: 100,
        current: 1,
        prevDes: "<上一页",
        nextDes: "下一页>",
        updateSelf: true,
        callback: null
    };
    // 插件配置合并
    this.oConfig = $.extend(defaults, config);
    var self = this;

    // 初始化函数
    var init = function () {
        // 初始化数据
        updateConfig(self.oConfig);
        // 事件绑定
        bindEvent();
    };
    // 更新方法
    var updateConfig = function (config) {
        typeof config.count !== 'undefined' ? self.count = config.count : self.count = self.oConfig.count;
        typeof config.pageSize !== 'undefined' ? self.pageSize = config.pageSize : self.pageSize = self.oConfig.pageSize;
        typeof config.current !== 'undefined' ? self.current = config.current : self.current = self.oConfig.current;
        self.pageCount = Math.ceil(self.count / self.pageSize);
        format();
    };
    var format = function () {
        var current = self.current;
        var count = self.pageCount;
        var html = '<div class="page-container"><ul>';
        if (current != 1)
            html += '<li class="page-item page-prev page-action-text">' + self.oConfig.prevDes + '</li>';
        var start = 1;
        var end = count;
        if (count > 10) {
            if (current <= 5) {
                start = 1;
                end = 10;
            } else if (current >= count - 4) {
                start = count - 9;
                end = count;
            } else {
                start = current - 5;
                end = current + 4;
            }
        }
        for (var i = start; i <= end; i++) {
            html += getItem(i);
        }
        if (current != count)
            html += '<li class="page-item page-next page-action-text">' + self.oConfig.nextDes + '</li>';
        html += '</ul></div>';
        self.html(html);
    };
    var getItem = function (i) {
        var item = '';
        var current = (i == self.current);
        item += '<li class="page-item" data-page="' + i + '"><div class="page-icon-content">';
        if (current) {
            item += '<div class="page-icon-current page-icon-content"></div>';
            item += '</div><span class="page-text-current">' + i + '</span></li>';
        } else {
            item += '<div class="' + (i % 2 == 0 ? 'page-icon-type1' : 'page-icon-type2') + ' page-icon"></div>';
            item += '</div><span class="page-text">' + i + '</span></li>';
        }
        return item;
    };
    //点击事件
    var bindEvent = function () {
        self.on('click', '.page-item', function () {
            var current;
            if ($(this).hasClass('page-prev')) {
                current = Math.max(1, self.current - 1);
            } else if ($(this).hasClass('page-next')) {
                current = Math.min(self.pageCount, self.current + 1);
            } else {
                current = parseInt($(this).data('page'));
            }
            self.oConfig.callback && self.oConfig.callback(current);
            if (self.oConfig.updateSelf) {
                self.current = current;
                format();
            }
        })
    };
    // 启动
    init();
    //对外提供更新方法
    this.update = function (config) {
        updateConfig(config);
    };
    // 链式调用
    return self;
};