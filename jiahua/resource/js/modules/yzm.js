function yzm(yzmbtn, telselect, number) {
    yzmbtn.on("click", function () {
        var tel = telselect.val(),
            $this = $(this),
            timeFn,
            countdown,
            setTime,
            isOn = $this.data("on"); //防止多次点出现的问题
//		debugger
		console.log(tel)
        if (isOn === "y") return;
        if (!tel) {
        		telselect.addClass("forbid");
                telselect.next(".person-tips").removeClass("hide");
            return;
        };
        if (/^(1[3|5|7|8])\d{9}$/.test(tel)) {
        	console.log(tel)
            var params = {};
            params.phoneNo = tel;
            
            $.ajax({
                type: "get",
                data: params,
                url: "/sendMsg",
                success: function (data) {
                    
                    $this.addClass("time-wait").data("on", "y");
                    countdown = number;
                    setTime = function () {
                        $this.text("重新获取(" + countdown + ")");
                        countdown--;
                    };
                    setTime();
                    timeFn = setInterval(function () {
                        if (countdown > 0) {
                            setTime();
                        } else {
                            clearInterval(timeFn);
                            $this.text("获取验证码").data("on", "n").removeClass("time-wait");
                        }
                    }, 1000);
                    $(".js-person-code").removeClass("hide");
                    $(".js-person-code").find("span").html(tel.substring(0, 3) + "****" + tel.substring(7));
                },
                error: function (data) {
                    layer.alert("发送失败！");

                }
            });

        }
    });

};

yzm($('.js-alert-box .js-getyzm'), $('.js-alert-box .js-yzm-tel'), 60); //注册账号时验证码方法
yzm($('.js-alert-mmbox .js-getyzm'), $('.js-alert-mmbox .js-tel'), 60); //重置密码时验证码方法