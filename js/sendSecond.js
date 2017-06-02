mui.plusReady(function() {
	//var singleId=plus.storage.getItem("singleId");
	var self = plus.webview.currentWebview();
	var loanType = self.loanType;
	var url = getUrl("production/getProductionApi");
	var FKEY = getkey(); //获取秘钥
	var mydata = {
		FKEY: FKEY,
		loanType:loanType
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
					plus.storage.setItem("t"+i, JSON.stringify(obj)); //保存所有产品数据
					html += "<div id='" + "t"+i + "' class='my-content type-line s-pading'>" + "<div class='s-type mui-pull-left'>" + obj.name + "</div>" + "<div class='select-icon mainBg mui-pull-right'></div>" + "<div class='mui-clearfix'></div>" + "</div>";
				}
				document.getElementById("type-list").innerHTML = html;
				mui(".type-list").on('tap', '.type-line', function() {
					var typeId = this.getAttribute("id");
					mui.openWindow({
						id: "sendThird",
						url: "sendThird.html", 
						extras: {
							typeId: typeId
						},
						show: {
							aniShow:"pop-in"
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