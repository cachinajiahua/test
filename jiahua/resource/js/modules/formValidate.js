$(function(){
	var body = $("body");
	
	//input格式验证
		
    	body.on("blur",".js-tel",function(){//对电话号码校验
	    	var $this = $(this),
	            tel = $this.val().trim();
	        if(tel){	        	
		        if (/^(1[3|5|7|8])\d{9}$/.test(tel)) {
		            removeClass($this);
		        } else {
		            addClass($this);
		        }
	        }else{
	        	addClass($this);
	        }
	    });
	    body.on("blur",".js-password",function(){//对密码校验
	    	var $this = $(this),
	            password = $this.val().trim(),
	             reg = /[^\w]/g;
				
	        if(password){
	        	if(password.length<6 || password.length>20){
	        		addClass($this);
	        		return;
	        	}
	        	if(reg.test(password)){
		           	addClass($this);
		            return;
	        	}
	        }else{
	        	addClass($this);
	        }
			
	    });
	    body.on("blur",".js-name",function(){//对密码校验
	    	var $this = $(this),
	            name = $this.val().trim(),
	             reg = /[^\w\u4e00-\u9fa5]/g;
				
	        if(name){
	        	if(name.length>10){
	        		addClass($this);
	        		return;
	        	}
	        	if(reg.test(name)){
		           	addClass($this);
		            return;
	        	}
	        }else{
	        	addClass($this);
	        }			
	    });
	    body.on("keyup","input.js-tel",function(){//input框输入时，error红色提醒取消
			removeClass($(this));					
		});
	    body.on("keyup","input.js-password",function(){//input框输入时，error红色提醒取消
			removeClass($(this));					
		});
		body.on("keyup","input.js-name",function(){//input框输入时，error红色提醒取消
			removeClass($(this));					
		});
		function removeClass(node){
			node.removeClass("forbid");
			node.next(".person-tips").addClass("hide");
		}
		function addClass(node){
			node.addClass("forbid");
			node.next(".person-tips").removeClass("hide");
		}
});