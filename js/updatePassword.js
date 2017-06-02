mui.plusReady(function() {
	var userString = plus.storage.getItem("uichUser");
	if (userString) {
		userId = JSON.parse(userString).id;
	}
	//绑定确认按钮事件
	document.getElementById('update-btn').addEventListener('tap', function() {
		var url = getUrl("managerInfo/updatePwdApi");
		var oldPassword = document.getElementById("old-pwd").value;
		var newPassword = document.getElementById("new-pwd").value;
		var Password2 = document.getElementById("pwd2").value;
		if (oldPassword=='') {
			mui.toast("原密码不能为空");
			document.getElementById("old-pwd").focus();
			return;
		}
		if (newPassword.length < 6) {
			mui.toast("密码应大于6位");
			document.getElementById("new-pwd").focus();
			return;
		} else if (newPassword != Password2) {
			mui.toast("新密码输入不一致");
			document.getElementById("new-pwd").focus();
			return;
		}
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			userId: userId,
			oldPassword: oldPassword,
			newPassword: newPassword
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					plus.storage.removeItem("uichUser"); //删除本地数据
					plus.storage.setItem("status",'0');    //修改status状态为0
					mui.alert('请重新登录', '修改成功', function() {
						plus.runtime.restart();
					});
					
				} else {
					mui.toast("修改失败:"+data.msg);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log('获取数据，请检查网络连接' + errorThrown);
			}
		});
	});

});