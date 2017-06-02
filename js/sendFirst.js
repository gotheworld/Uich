mui.plusReady(function() {
	//var singleId=plus.storage.getItem("singleId");
	var url = getUrl("production/getProductionTypeApi");
	var FKEY = getkey(); //获取秘钥
	var mydata = {
		FKEY: FKEY,
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
					html += "<div id='" + obj.productionType + "' class='my-content type-line s-pading'>" + "<div class='s-type mui-pull-left'>" + obj.text + "</div>" + "<div class='select-icon mainBg mui-pull-right'></div>" + "<div class='mui-clearfix'></div>" + "</div>";
				}
				document.getElementById("type-list").innerHTML = html;
				mui(".type-list").on('tap', '.type-line', function() {
					var typeName = this.getAttribute("id");
					mui.openWindow({
						id: "sendSecond",
						url: "sendSecond.html",
						extras: {
							typeName: typeName
						}
					});
				});
			} else {
				mui.toast("获取失败");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log('获取数据，请检查网络连接' + errorThrown);
		}
	});
});