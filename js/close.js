mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	var ID = self.ID; //当前待转介融资单id
	var managerInfoId = plus.storage.getItem("managerInfoId");
	document.getElementById('close-btn').addEventListener('tap', function() {
		plus.nativeUI.showWaiting();
		var reason = document.getElementById("textarea").value;
		var url = getUrl("closeReason/saveCloseReasonApi");
		var FKEY = getkey(); //获取秘钥
		//alert(reason);
		var mydata = {
			FKEY: FKEY,
			financingSingleId : ID,
			reason: reason
		};
		if (reason == '') {
			mui.toast("请输入关闭原因");
			plus.nativeUI.closeWaiting();
			return;
		}
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) { //关闭原因保存成功
					var url = getUrl("financingSingle/updateSingleStatusApi");
					var FKEY = getkey(); //获取秘钥
					var mydata = {
						FKEY: FKEY,
						financingSingleId: ID,
						singleStatus: "MANAGERTERMINATION"
					};
					mui.ajax(url, {
						data: mydata,
						dataType: 'json', //服务器返回json格式数据
						type: 'post', //HTTP请求类型
						timeout: 10000, //超时时间设置为10秒；
						success: function(data) {
							//服务器返回响应，根据响应结果，分析是否登录成功；
							if (data.flag) { //关闭原因保存成功
								plus.nativeUI.closeWaiting();
								mui.toast("关闭成功");
								closeWindows('uichDetail');
								var myUich = plus.webview.getWebviewById("myUich");
								mui.fire(myUich, "myUichFire", null);
								mui.openWindow({
									id: "myUich",
									url: "myUich.html"
								});
								closeWindows('close');
							} else {
								plus.nativeUI.closeWaiting();
								mui.toast("关闭失败");
							}
						},
						error: function(xhr, type, errorThrown) {
							//异常处理；
							plus.nativeUI.closeWaiting();
							mui.toast('获取数据，请检查网络连接' + errorThrown);
						}
					});
				} else {
					plus.nativeUI.closeWaiting();
					mui.toast("关闭失败");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				mui.toast('获取数据，请检查网络连接' + errorThrown);
			}
		});
	});
});