mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	var ID = self.ID; //当前待转介融资单id 转介要用到
	var url = getUrl("makeOverReason/getMakeOverReasonApi");
	var FKEY = getkey(); //获取秘钥
	var mydata = {
		FKEY: FKEY
	};
	mui.ajax(url, {
		data: mydata,
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否登录成功；
			if (data.flag) {
				var html = "";
				var len = data.data.length;
				var result = data.data;
				for (var i = 0; i < len; i++) {
					var obj = result[i];
					if (obj.enableStatus.enableStatus != "ENABLE") { //判断是否禁用
						continue;
					}
					html += "<span id='" + obj.id + "' class='check-div mui-pull-left'>" + "<input type='checkbox' name='reason' id='checkbox" + obj.id + "'/>" + "<label for='checkbox" + obj.id + "'>" + obj.content + "<i class='my-icon1 mui-pull-right'></i></label>" + "</span>";
				}
				document.getElementById("reasonList").innerHTML = html;
				//循环绑定checkbox事件
				mui(".boxs-div").on('tap', '.check-div', function() {
					var obj = $(this);
					if (obj.hasClass("checked")) {
						obj.removeClass("checked");
					} else {
						obj.addClass("checked");
					}
				});
			} else {
				mui.toast("获取失败");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			alert('获取数据，请检查网络连接' + errorThrown);
		}
	});

	//转介融资单
	document.getElementById('refer-btn').addEventListener('tap', function() {
		var content = document.getElementById("textarea").value;
		var managerInfoId = plus.storage.getItem("managerInfoId");
		var obj = document.getElementsByName("reason");
		if(content==''){
			mui.toast("请填写转介原因");
			return ;
		}
		var check_val = [];
		var reasonStr = '';
		$(".checked").each(function() {
			check_val.push($(this).attr("id"));
		});
		for (var i = 0; i < check_val.length; i++) {
			reasonStr += check_val[i];
			if (i != check_val.length - 1) reasonStr += ",";
		}
		plus.nativeUI.showWaiting();
		var url = getUrl("makeOver/saveMakeOverApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			content: content,
			reason: reasonStr,
			financingSingleId: ID,
			managerInfoId: managerInfoId
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					plus.nativeUI.closeWaiting(); 
					mui.toast("转介成功");
					closeWindows("uichDetail");
					var myUich = plus.webview.getWebviewById("myUich");
					mui.fire(myUich,"myUichFire",null);
					var rushBody = plus.webview.getWebviewById("rushBody");
					mui.fire(rushBody,"rushBodyFire",null);
					mui.openWindow({
						id: "myUich",
						url: "myUich.html"
					});
					closeWindows('refer');
				} else {
					plus.nativeUI.closeWaiting();
					mui.toast("转介失败");
				}
			},
			error: function(xhr, type, errorThrown) {

				//异常处理；
				plus.nativeUI.closeWaiting();
				alert('获取数据，请检查网络连接' + errorThrown);
			}
		});
	});
});