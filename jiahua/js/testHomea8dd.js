$(function () {
    var activityId, activityName, activityFlag = true, toolkitActivity = false;
    if ($(".homeNav-child").length >= 1) {
        $(".homeNav-child").each(function (i, ele) {
            var arr = [], max;
            $(ele).children("li").each(function (index, element) {
                if ($(element).children("ul").length >= 1) {
                    $(element).children("ul").each(function (ind, ele) {
                        arr.push($($(ele).children("li")).children("a").length)
                    })
                }
            });
            max = Math.max.apply(null, arr);
            $($(ele).children("li")).children("ul").css("width", 190 * (max > 3 ? 3 : max) + "px");
            if ($(ele).parent().hasClass("turnLeft")) {
                $($(ele).children("li")).children("ul").css("left", -190 * (max > 3 ? 3 : max) + "px")
            }
        })
    }
    $(".homeNav").hover(function () {
        $(this).children("a").siblings().show()
    }, function () {
        $(this).children("a").siblings().hide()
    });
    $(".homeNav-child li").hover(function () {
        $(this).children("a").siblings().css("backgroundColor", "#1f2964")
    }, function () {
        $(this).children("a").siblings().css("backgroundColor", "#1e2864")
    });

    function scrollNav() {
        var top = parseInt($(document).scrollTop());
        if (top >= 155) {
            $(".homeHeader-nav").css({"position": "fixed", "top": "0"});
            $(".headerSwiper").css("margin-top", "54px");
            $(".projectHeaderImg").css("margin-top", "54px")
        } else {
            $(".homeHeader-nav").css({"position": "static",});
            $(".headerSwiper").css("margin-top", "0");
            $(".projectHeaderImg").css("margin-top", "0")
        }
        if (top > 0) {
            $(".homeToolkit-returnTop").show()
        } else {
            if (top == 0) {
                $(".homeToolkit-returnTop").hide()
            }
        }
        if ($(".active .selected .order-triangle").css("display") && $(".active .selected .order-triangle").css("display") != "none") {
            $(".order-modal").hide();
            $(".order-triangle").hide()
        }
        if ($(".onlineConsultModal").css("display") && $(".onlineConsultModal").css("display") != "none") {
            $(".onlineConsultModal").hide();
            $(".onlineConsultModal-triangle").hide()
        }
    }

    scrollNav();

    function bigWindow() {
        if ($(window).width() > 1920) {
            $(".headerGuide").css("top", $(".headerSwiper .swiper-container").height() + 180 + "px")
        } else {
            if (parseInt($(".headerGuide").css("top")) > 680) {
                $(".headerGuide").css("top", $(".headerSwiper .swiper-container").height() + 180 + "px")
            }
        }
    }

    window.onresize = bigWindow;
    $(window).scroll(scrollNav);
    $(".homeToolkit-returnTop").click(function (e) {
        $("body").animate({scrollTop: 0}, 500, function () {
            $(".homeToolkit-returnTop").children("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/returnTop.svg")
        })
    });
    $(document).bind("click", function (e) {
        var targetName = e.target.className;
        if (targetName.indexOf("formModal") < 0 && targetName != "form-info_btn") {
            $(".form-info .onlineConsultModal").hide();
            $(".form-info .onlineConsultModal-triangle").hide()
        }
    });
    $(".homeToolkit a, .homeToolkit p").mouseenter(function (e) {
        var text = $(this).find("span").html(), className = e.currentTarget.className;
        switch (text) {
            case"在线咨询":
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/words.svg");
                break;
            case"资料下载":
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/downloadHover.svg");
                break;
            case"快速评估":
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/assessHover.svg");
                break;
            case"返回顶部":
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/returnTopHover.svg");
                break
        }
        if (className == "homeToolkit-wechat") {
            $(this).find(".wechatImg")[0].src = "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/wechatHover.svg";
            $(".homeToolkit-wechat_qrcode").show()
        } else {
            if (className == "activityOrder") {
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/previewHover.svg")
            }
        }
    });
    $(".homeToolkit a, .homeToolkit p").mouseleave(function (e) {
        var text = $(this).find("span").html(), className = e.currentTarget.className;
        switch (text) {
            case"在线咨询":
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/wordsNormal.svg");
                break;
            case"资料下载":
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/download.svg");
                break;
            case"快速评估":
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/pinggu.svg");
                break;
            case"返回顶部":
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/returnTop.svg");
                break
        }
        if (e.currentTarget.className == "homeToolkit-wechat") {
            $(this).find(".wechatImg")[0].src = "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/wechat.svg";
            $(".homeToolkit-wechat_qrcode").hide()
        } else {
            if (className == "activityOrder") {
                $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/preview.svg")
            }
        }
    });

    function activityOrderFuc() {
        $(".homeToolkit-modal .homeToolkit-modal_back").show();
        $(".homeToolkit-modal .homeToolkit-modal_back .order-modal").show()
    }

    $(".activityOrder").click(function () {
        activityFlag = false;
        if (sessionStorage.getItem("newActivityId") && sessionStorage.getItem("newActivityName") && sessionStorage.getItem("newActivityNum")) {
            if (!toolkitActivity) {
                toolkitActivity = true;
                $(".homeToolkit-modal_back").find(".order-modal_success span").html(sessionStorage.getItem("newActivityNum"))
            }
            activityOrderFuc()
        } else {
            alert("暂时没有活动可以预约，敬请关注！")
        }
    });
    $(".previewBtn").click(function () {
        activityFlag = false;
        if (sessionStorage.getItem("newActivityId") && sessionStorage.getItem("newActivityName") && sessionStorage.getItem("newActivityNum")) {
            if (!toolkitActivity) {
                toolkitActivity = true;
                $(".homeToolkit-modal_back").find(".order-modal_success span").html(sessionStorage.getItem("newActivityNum"))
            }
            activityOrderFuc()
        } else {
            alert("暂时没有活动可以预约，敬请关注！")
        }
    });
    setTimeout(function () {
        $(".immediateConsultation").click(function () {
            //max_from_company_mini(this);
            $(this).trigger("mouseleave");
            $(this).find("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/words.svg")
        })
    }, 1);

    function clearModal(flag) {
        setTimeout(function () {
            $(".order-modal").hide();
            $(".order-triangle").hide();
            $(".order-modal_successTips").hide();
            $(".homeToolkit-modal_back").hide();
            $(".order-modal").find("input").val("");
            if (flag) {
                var target = $(".order-modal").find(".order-modal_success span");
                var num = parseInt(target.html());
                target.html(num + 1)
            }
        }, 1000)
    }

    var headerSwiper = new Swiper(".headerSwiper .swiper-container", {
        loop: true,
        autoplay: true,
        pagination: {el: ".headerSwiper .swiper-pagination", clickable: true},
        navigation: {
            nextEl: ".headerSwiper .control-wrapper .swiper-button-next",
            prevEl: ".headerSwiper .control-wrapper .swiper-button-prev",
        },
        effect: "fade",
        speed: 1000
    });
    $(".headerSwiper .swiper-container").hover(function (e) {
        headerSwiper.autoplay.stop()
    }, function (e) {
        headerSwiper.autoplay.start()
    });
    $("#homeActivityContent .tab-content_order").click(function () {
        if (!$(this).hasClass("selected") && !$(this).hasClass("order-content_right")) {
            $(this).addClass("selected").siblings().removeClass("selected");
            $("#homeActivityContent .active .order-modal").hide();
            $("#homeActivityContent .active .order-triangle").hide()
        }
    });
    $("#homeActivityContent .tab-content_order .order-title").click(function (e) {
        if ($(this).parent().hasClass("selected")) {
            location.href = "/activity/" + this.dataset.activityid
        }
    });
    $(".order-content_right").click(function (e) {
        activityId = e.target.dataset.tabid;
        activityName = e.target.dataset.activityname;
        if (!$(this).hasClass("doned")) {
            if ($("#homeActivityContent .active .order-modal").css("display") == "none") {
                $("#homeActivityContent .active .order-modal").show();
                $("#homeActivityContent .active .order-triangle").show()
            }
        }
    });
    $(".order-modal .order-modal_close").click(function (e) {
        if ($(".active .selected .order-modal").css("display") != "none") {
            $(".order-modal").hide();
            if ($(".order-triangle").css("display") != "none") {
                $(".order-triangle").hide()
            }
        }
        if ($(".homeToolkit-modal_back").css("display") != "none") {
            $(".homeToolkit-modal_back").hide()
        }
    });
    $(".order-modal .order-modal_btn").click(function (e) {
        var target = $(this).siblings(".order-modal_info").children(".info");
        var username = target.children(".username").val(), userphone = target.children(".userphone").val(),
            patern = new RegExp([0 - 9]);
        if (!activityFlag) {
            activityName = sessionStorage.getItem("newActivityName");
            activityId = sessionStorage.getItem("newActivityId")
        }
        if (!username || !userphone) {
            alert("请完整填写您的信息")
        } else {
            if (userphone.length != 11) {
                alert("请填写正确长度的手机号")
            } else {
                var params = {
                    username: username,
                    userphone: userphone,
                    usergoal: activityName,
                    data: {
                        source: "activity",
                        username: username,
                        tel: userphone,
                        content: activityName,
                        target_ids: "[" + activityId + "]"
                    }
                }, success = function () {
                    $(".order-modal_successTips").text("恭喜您，提交成功！");
                    $(".order-modal_successTips").css("display", "block");
                    clearModal(true)
                }, error = function () {
                    $(".order-modal_successTips").text("提交失败，请刷新页面重试！");
                    $(".order-modal_successTips").css("display", "block");
                    clearModal(false)
                };
                customizeFormSubmit(params, success, error)
            }
        }
    });
    var adviserSwiper, tabLength = $(".adviserBody").find(".tab li").length;
    var tabWidth = ((1220 - 20 * (tabLength - 1)) / tabLength) - 10;
    var adviserSwiperInit = function () {
        adviserSwiper = new Swiper(".adviserBody-content .active .swiper-container", {
            loop: true,
            slidesPerView: 5,
            spaceBetween: 30,
            navigation: {
                nextEl: ".adviserBody-content .active .swiper-button-next",
                prevEl: ".adviserBody-content .active .swiper-button-prev",
            },
            autoplay: {delay: 2000,}
        });
        $(".adviserBody-content .active .swiper-container").mouseenter(function (e) {
            adviserSwiper.autoplay.stop()
        });
        $(".adviserBody-content .active .swiper-container").mouseleave(function (e) {
            adviserSwiper.autoplay.start()
        });
        $(".adviserBody-content .active .swiper-container .swiper-slide").mouseenter(function (e) {
            $(this).find(".boxShadow").show()
        });
        $(".adviserBody-content .active .swiper-container .swiper-slide").mouseleave(function (e) {
            $(this).find(".boxShadow").hide()
        });
        $(".adviserBody-content .active img").click(function (e) {
            location.href = "/consultant_detail?id=" + this.dataset.adviser
        })
    };
    adviserSwiperInit();
    $(".adviserBody").find(".tab li").each(function (index, value) {
        $(this).width(tabWidth)
    });
    $(".adviserBody li").click(function (e) {
        if (!$(this).hasClass("active")) {
            setTimeout(function () {
                adviserSwiperInit()
            }, 1)
        }
    });
    $(".homeVideo-body .tab-pane .class").click(function (e) {
        location.href = "/immigrant_classroom/" + $(this).data("video")
    });
    var breakingAutoplay = false;
    if (document.getElementById("homeBreakingNews")) {
        var num = parseInt($("#homeBreakingNews .swiper-container").data("count"));
        if (num <= 4) {
            breakingAutoplay = true
        }
    }
    var breakingNews = new Swiper(".homeBreakingNews-body .swiper-container", {
        loop: true,
        slidesPerView: 4,
        slidesPerGroup: 1,
        spaceBetween: 18,
        autoplay: breakingAutoplay ? false : {delay: 2000},
    });
    $(".homeBreakingNews-body .swiper-container").hover(function (e) {
        breakingNews.autoplay.stop()
    }, function (e) {
        if (!breakingAutoplay) {
            breakingNews.autoplay.start()
        }
    });
    $(".hotLine-view").hover(function (e) {
        $(this).children().each(function (index, ele) {
            if ($(ele)[0].className == "left") {
                $(ele).children("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/phoneHover.svg")
            } else {
                $(ele).children("img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/infoHover.svg")
            }
        })
    }, function (e) {
        $(".hotLine-view .left img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/phoneNormal.svg");
        $(".hotLine-view .right img").attr("src", "http://cdn.pacificimmi.com/www.pacificimmi.cn/images/Home/infoNormal.svg")
    });
    var hotImmigrantSwiper;
    var hotImmigrantInit = function () {
        hotImmigrantSwiper = new Swiper(".hotImmigrantSwiper .swiper-container", {
            loop: true,
            slidesPerView: 3,
            spaceBetween: 30,
            navigation: {
                nextEl: ".hotImmigrantSwiper .swiper-button-next",
                prevEl: ".hotImmigrantSwiper .swiper-button-prev",
            },
        })
    };
    hotImmigrantInit();
    var spanUp = function (e) {
        $(e.currentTarget).children("span").animate({height: "43px"})
    };
    var spanDown = function (e) {
        $(e.currentTarget).children("span").animate({height: "0"})
    };
    $(".homeSeminar-content_right .seminar").hover(spanUp, spanDown);
    var footerTarget = $(".homeFooter-list").find("ul");
    var footerListLength = footerTarget.length;
    var footerRight = Math.floor((1196 - (120 * footerListLength)) / (footerListLength - 1)) - 1;
    footerTarget.each(function (index, val) {
        if (index != footerListLength - 1) {
            $(this).css("margin-right", footerRight)
        }
    });
    var tel = "";
    $.ajax({
        type: "post", url: "/api/web/userCheck", async: true, data: {}, success: function (data) {
            if (data.code == 403) {
                $(".homeHeader").find(".homeHeader-shortcut_right").hide();
                $(".homeHeader").find(".noLogin").show()
            } else {
                if (data.code == 200) {
                    $(".homeHeader").find(".homeHeader-shortcut_right").hide();
                    $(".homeHeader").find(".inLogin").show();
                    tel = data.data.tel;
                    $(".homeHeader").find(".inLogin .telStart").html(data.data.tel.slice(0, 3));
                    $(".homeHeader").find(".inLogin .telEnd").html(data.data.tel.slice(7, 11));
                    var username = data.data.name, userphone = tel.slice(0, 3) + "****" + tel.slice(7, 11);
                    sessionStorage.setItem("username", username);
                    sessionStorage.setItem("userphone", userphone)
                }
            }
        }, error: function (data) {
            console.error(data)
        }
    });
    $(".homeHeader").find(".homeHeader-shortcut_right .withDrawal").on("click", function () {
        var r = confirm("您确定退出吗？");
        if (r == true) {
            $.ajax({
                type: "get", url: "/api/web/logout", async: true, data: {}, success: function (data) {
                    if (data.code == 200) {
                        $(".homeHeader").find(".homeHeader-shortcut_right").hide();
                        $(".homeHeader").find(".noLogin").show();
                        sessionStorage.removeItem("username");
                        sessionStorage.removeItem("userphone");
                        window.location.reload()
                    } else {
                        alert("退出失败！")
                    }
                }, error: function (data) {
                    console.error(data)
                }
            })
        }
    });
    $(".homeHeader").find(".homeHeader-shortcut_right .homeHeader-personal_Center").on("click", function () {
        $(this).attr("href", "/member_center" + "?" + "userName=" + tel)
    });
    $(".homeVideo-body_right .form .form-info_btn").click(function (e) {
        var target = $(this).siblings(".info");
        var success = function () {
            if ($(".form-info .onlineConsultModal").css("display") == "none") {
                $(".form-info .onlineConsultModal").show();
                $(".form-info .onlineConsultModal-triangle").show()
            }
        }, error = function () {
            alert("出错啦，请刷新重试!")
        };
        customizeInfoInstall(target, success, error)
    });
    var bottomFlag = true;
    $(".activity_close").click(function () {
        bottomFlag = false;
        $("#activityBottom").hide()
    });
    window.onscroll = function () {
        if ($(document).scrollTop() > 400 && bottomFlag == true) {
            $("#activityBottom").show()
        } else {
            $("#activityBottom").hide()
        }
    };
    $(".activitySlide-content-close").click(function () {
        $("#activitySlide").hide()
    });
    $(".add-assess").click(function () {
        $.ajax({
            type: "post", url: "/api/web/addAssessNum", async: true, data: {}, success: function (data) {
                if (data.code == 200) {
                    location.href = "/evaluate";
                    console.log("评估数加一")
                } else {
                    console.log("评估数加一失败")
                }
            }, error: function (data) {
                location.href = "/evaluate";
                console.error(data)
            }
        })
    });
    $("#searchType").on("change", function () {
        if ($("option:selected", this).attr("id") == 1) {
            $(this).attr("dataid", 1)
        } else {
            if ($("option:selected", this).attr("id") == 2) {
                $(this).attr("dataid", 2)
            } else {
                if ($("option:selected", this).attr("id") == 3) {
                    $(this).attr("dataid", 3)
                } else {
                    if ($("option:selected", this).attr("id") == 4) {
                        $(this).attr("dataid", 4)
                    }
                }
            }
        }
    });
    $("#searchPage").click(function () {
        $.ajax({
            type: "get",
            url: "/search",
            async: true,
            data: {id: $("#searchType").attr("dataid"), keywords: $("#searchCon").val()},
            success: function (data) {
                var url = location.href = "/search?id=" + $("#searchType").attr("dataid") + "&keywords=" + $("#searchCon").val();
                console.log(data)
            },
            error: function (data) {
                console.error(data)
            }
        })
    })
});
