mui.plusReady(function() {
	mui.init({
		beforeback: function() {
			var plan = plus.webview.getWebviewById("plan");
			mui.fire(plan, "planFire", null);
			return true;
		}
	});

	var allTime = ''; //记录日程时间
	var earlyTime = ''; //记录提醒时间
	var self = plus.webview.currentWebview();
	var id = self.ID; //日程安排id
	var version = null; //获取版本后面用到
	var financingSingleId = self.financingSingleId; //融资单ID
	var url = getUrl("taskSchedule/getTaskScheduleByIdApi");
	var FKEY = getkey(); //获取秘钥
	var mydata = {
		FKEY: FKEY,
		financingSingleId: financingSingleId,
		id: id
	};
	mui.ajax(url, {
		data: mydata,
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否登录成功；
			if (data.flag) {
				var result = data.data;
				//alert(data.data); 
				var temp = result.companyName;
				if (temp) {
					document.getElementsByClassName("a-name")[0].innerHTML = temp;
				} else {
					document.getElementsByClassName("a-name")[0].innerHTML = "个人贷款";
				}
				document.getElementsByClassName("a-span1")[0].innerHTML = result.userName;
				document.getElementById("tel").setAttribute("name", result.phone);
				allTime = result.arrangeTime;
				document.getElementById("allTime").innerHTML = getLocalTime(result.arrangeTime);
				if (result.remindTime % 60 == 0) {
					document.getElementById("EarlyTime").innerHTML = result.remindTime / 60 + "小时前";
				} else {
					document.getElementById("EarlyTime").innerHTML = result.remindTime + "分钟前";
				}
				version = result.version;
				earlyTime = result.remindTime;
				document.getElementById("textarea").innerHTML = result.description;
				//绑定拨打电话事件
				document.getElementById('tel').addEventListener('tap', function() {
					var tell = document.getElementById("tel").getAttribute("name");
					var bts = ["呼叫", "取消"];
					plus.nativeUI.confirm(tell, function(e) {
						var i = e.index;
						if (i == 0) {
							plus.device.dial(tell, false);
						}
					}, "", bts);
				});
				mui.currentWebview.show("pop-in");
				plus.nativeUI.closeWaiting();
			} else {
				plus.nativeUI.closeWaiting();
				if (data.msg = "没有获取到相关数据") {
					mui.toast("暂无数据");
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			plus.nativeUI.closeWaiting();
			mui.currentWebview.show("pop-in");
			console.log('获取数据，请检查网络连接' + errorThrown);
		}
	});

	document.getElementById("set-btn").addEventListener('tap', function() {
		if ($("#set1").hasClass("set-block-1")) {
			$("#set1").removeClass("set-block-1");
			$("#set2").removeClass("set-block-2");
			$(".set-swith").css("display", "none");
			tapFlag = false;
		} else {
			$("#set1").addClass("set-block-1");
			$("#set1").addClass("set1");
			$("#set2").addClass("set-block-2");
			$("#set2").addClass("set2");
			$(".set-swith").css("display", "block");
			document.getElementById("textarea").readOnly = false;
			tapFlag = true;
		}
	});

	var tapFlag = false; //记录是否出发时间选择事件
	//绑定li点击事件 
	var funAll = function() {
		if (tapFlag) {
			//创建时间组件对象
			var options = JSON.parse("{}");
			var picker = new mui.DtPicker(options);
			picker.show(function(rs) {
				picker.dispose();
				allTime = new Date(parseInt(rs.y.value), parseInt(rs.m.value) - 1, parseInt(rs.d.value), parseInt(rs.h.value), parseInt(rs.i.value), 0).getTime();
				document.getElementById("allTime").innerHTML = rs.value;
			});
		}

	};
	var funEar = function() {
		if (tapFlag) {
			var statusDate = [{
				value: '10',
				text: '10分钟前'
			}, {
				value: '20',
				text: '20分钟前'
			}, {
				value: '30',
				text: '30分钟前'
			}, {
				value: '60',
				text: '60分钟前'
			}, {
				value: '120',
				text: '2个小时前'
			}];
			var userPicker = new mui.PopPicker();
			userPicker.setData(statusDate);
			userPicker.show(function(items) {
				var value = items[0]['value'];
				var text = items[0]['text'];
				document.getElementById("EarlyTime").innerHTML = text;
				earlyTime = value;
			});
		}
	};
	document.getElementById("set1").addEventListener('click', funAll);
	document.getElementById("set2").addEventListener('click', funEar);
	//修改成日程安排
	document.getElementById("save-btn").addEventListener('click', function() {
		if (allTime == '') {
			mui.toast("请选择时间");
			return;
		}
		if (earlyTime == "") {
			mui.toast("请选择提醒时间");
			return;
		}
		var description = document.getElementById("textarea").value;
		var managerInfoId = plus.storage.getItem("managerInfoId");
		var url = getUrl("taskSchedule/updateTaskScheduleApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			id: id,
			financingSingleId: financingSingleId,
			managerInfoId: managerInfoId,
			arrangeLongTime: allTime,
			remindTime: earlyTime,
			version: version,
			description: description
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					mui.toast("修改成功");
					/*var plan = plus.webview.getWebviewById("plan");
					setTimeout(function() {
						mui.fire(plan, "planFire", null);
					}, "300");*/
					mui.back();
					

				} else {
					mui.toast("修改失败，请重试");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log('获取失败，请检查网络连接' + errorThrown);
			}
		});

	});
	document.getElementById("delete-btn").addEventListener('click', function() {
		var btnArray = ['否', '是'];
		mui.confirm('确认删除？', 'uich', btnArray, function(e) {
			if (e.index == 1) {
				var url = getUrl("taskSchedule/delTaskScheduleApi");
				var FKEY = getkey(); //获取秘钥  
				var mydata = {
					FKEY: FKEY,
					id: id,
				};
				mui.ajax(url, {
					data: mydata,
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						//服务器返回响应，根据响应结果，分析是否登录成功；
						if (data.flag) {
							mui.toast("删除成功");
						
							mui.back();
						} else {
							mui.toast("删除失败，请重试");
						}
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						console.log('获取失败，请检查网络连接' + errorThrown);
					}
				});
			}
		})

	});
});