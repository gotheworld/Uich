//mui.init();
mui.plusReady(function() {
	//自动登录
	if (plus.storage.getItem('status') == 1) {
		//console.log("自动登录");
		setTimeout(function() {
			mui.openWindow({
				url: 'index.html',
				id: 'index',
				show: {
					aniShow: 'pop-in'
				},
				waiting: {
					autoShow: false
				},
				style:{
					render: 'always'
				}
			});
		}, 0);
	}
	// close splash
	setTimeout(function() {
		//关闭 splash
		plus.navigator.closeSplashscreen();
	}, 1500); 
	var info = plus.push.getClientInfo();
	var cid = info.clientid;
	//绑定登录按钮事件
	document.getElementById('login').addEventListener('tap', function() {
		var url = getUrl("login/userLoginApi");
		var FKEY = getkey(); //获取秘钥 
		var loginName = $("#username").val();
		var password = $("#password").val();
		if (loginName == '') {
			mui.toast('请输入用户名');
			return;
		}
		if (password == "") {
			mui.toast('请输入密码');
			return;
		}
		plus.nativeUI.showWaiting();
		var autoLogin = $("#autoLogin").hasClass("mui-active");
		var mydata = {
			FKEY: FKEY,
			loginName: loginName,
			password: password,
			clientId: cid
		}

		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {

				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					if (autoLogin) { //如果选择了自动登录按钮 该用户信息加入到本地数据库中
						plus.storage.setItem('uichUser', '{"id":"' + data.data.id + '","loginName":"' + data.data.loginName + '","password":"' + data.data.password + '"}');
						plus.storage.setItem("status", '1'); //1代表自动登录 没有值代表不自动登录
					}
					mui.openWindow({
						id: "index",
						url: "index.html",
						extras: {
							userId: data.data.id
						},
						show: {
							autoShow: false, //页面loaded事件发生后自动显示，默认为true
						},
						style: {
							render:'always'
						}
					});
				} else {
					plus.nativeUI.closeWaiting();
					mui.toast("登录失败:" + data.msg);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				mui.toast('登录失败，请检查网络连接');
				plus.nativeUI.closeWaiting();
			}
		});
	});
});