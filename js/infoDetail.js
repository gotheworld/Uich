//添加自定义事件监听 改变消息按钮
window.addEventListener('infoDetail', function(event) {
	infoDetailMain();

});
infoDetailMain();

function infoDetailMain() {
	mui.plusReady(function() {
		//返回前把info页面 消息清零 
		mui.init({
			beforeback: function() {
				var info=plus.webview.getWebviewById("info");
				mui.fire(info,"deleteInfo",null);
				return true;
			}
		});
		//获取消息历史
		var url = getUrl("taskSchedule/getTaskScheduleWaitApi");
		var managerInfoId = plus.storage.getItem("managerInfoId");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			managerInfoId: managerInfoId,
			rows: 1,
			page: 1,
			sort: "arrangeTime"
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					var result = data.data.result;
					console.log(JSON.stringify(result));
					var len = result.length;
					var html = "";

					for (var i = 0; i < len; i++) {
						var obj = result[i];
						var user = '';
						var temp = obj.companyName;
						if (temp) {
							user = obj.legalPerson + "(" + obj.companyName + ")";
						} else {
							user = obj.userName + "(个人贷款)";
						}
						
						html += '<li class="my-cell-li">';
						html += '<div class="info-time">' + getLocalPushTime(obj.pushMessageTime) + '</div>' + '<div class="my-hr info-lis radu-first">' + '<span class="info-li-left info-li-left-icon-1 mainBg"></span>' + '<span class="info-li-right info-li-right-text">' + user + '</span>' + '</div>' + '<div class="my-hr info-lis">' + '<span class="info-li-left info-li-left-icon-2 mainBg"></span>' + '<span class="info-li-right info-li-right-text">' + getLocalTime(obj.arrangeTime) + '</span>' + '</div>' + '<div class="info-lis radu-end">' + '<span class="info-li-left info-li-left-icon-3 mainBg"></span>' + '<span class="info-li-right info-li-right-text">' + obj.description + '</span>' + '</div>';
						html += "</li>";
					}
					document.getElementsByClassName("my-ul")[0].innerHTML = html;
					if (len == 0) document.getElementsByClassName("my-ul")[0].innerHTML = getNullHtml();
				} else {
					mui.toast("获取失败");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				mui.toast('获取数据，请检查网络连接');
			}
		});
	});
}