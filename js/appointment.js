mui.plusReady(function() {
	var num = plus.storage.getItem("num"); //保存融资单num 发送邮件成功后返回用到
	var dt = plus.storage.getItem(num);
	var result = JSON.parse(dt); //获取该融资单的对象
	var ThisType = result.loanType.loanType;
	if (ThisType == "ENTERPRISE") {
		var temp_name = result.companyName;
		var d_name = result.legalPerson;
	} else {
		var temp_name = result.personalName + "(个人贷款)";
		var d_name = result.personalName;
	}
	document.getElementsByClassName("a-name")[0].innerHTML = temp_name;
	document.getElementsByClassName("a-span1")[0].innerHTML = d_name;
	document.getElementById("tel").setAttribute("name", result.phone);

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

	var allTime = ''; //记录日程时间
	var earlyTime = ''; //记录提醒时间

	//绑定选择时间事件
	document.getElementById('selectAllTime').addEventListener('tap', function() {
		//创建时间组件对象
		var options = JSON.parse("{}");
		var picker = new mui.DtPicker(options);
		picker.show(function(rs) {
			//rs.value 拼合后的 value
			//rs.text 拼合后的 text
			picker.dispose();
			//alert(rs.text);
			//allTime=new Date(2016,1,1,2,2,0); 
			allTime = new Date(parseInt(rs.y.value), parseInt(rs.m.value) - 1, parseInt(rs.d.value), parseInt(rs.h.value), parseInt(rs.i.value), 0).getTime();
			document.getElementById("allTime").innerHTML = rs.value;
		});
	});
	//绑定选择提前时间事件
	document.getElementById('selectEarlyTime').addEventListener('tap', function() {
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
	});
	document.getElementById('appoint-btn').addEventListener('tap', function() {
		
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
		var url = getUrl("taskSchedule/saveTaskScheduleApi");
		var FKEY = getkey(); //获取秘钥  
		var mydata = {
			FKEY: FKEY,
			financingSingleId: result.id,
			managerInfoId: managerInfoId,
			arrangeLongTime: allTime,
			remindTime: earlyTime,
			description: description
		};
		plus.nativeUI.showWaiting();
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(flag) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (flag) {
					changeStatusAjax('BESPEAKED', '已预约');
				} else {
					plus.nativeUI.closeWaiting();
					mui.toast("增加失败，请重试");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				console.log('获取失败，请检查网络连接' + errorThrown);
			}
		});
	});

	function showConfirm() {
		var bts = ["返回上页", "确认"];
		plus.nativeUI.confirm("添加成功，是否跳转到日程表？", function(e) {
			var i = e.index;
			if (i == 1) {
				var myUich = plus.webview.getWebviewById("myUich");
				mui.fire(myUich, "myUichFire", {
					tap: "noCloseDetail"
				}); //传入tap参数 不需要关闭uichdetail
				closeWindows("uichDetail");
				var plan = plus.webview.getWebviewById("plan");
				if(plan){
					mui.fire(plan,"planFire",null);
					//plan.hide();
					plan.show("pop-in");
				}else{
					mui.openWindow({
						id:"plan",
						url:"plan.html",
						show:{
							aniShow:"pop-in"
						}
					});
				}
				//closeWindows("appointment");
			}else{  //刷新myuich,uichDetail,plan页面
				var plan = plus.webview.getWebviewById("plan");
				mui.fire(plan,"planFire",null);
				var uichDetail = plus.webview.getWebviewById('uichDetail');
				mui.fire(uichDetail, "uichDetailFire", null);
				var myUich = plus.webview.getWebviewById("myUich");
				mui.fire(myUich, "myUichFire", {
					tap: "noCloseDetail"
				}); //传入tap参数 不需要关闭uichdetail
				mui.back();
			}
		}, "", bts);
	}
	//ajax改变该融资单状态
	function changeStatusAjax(value, text, flag) {
		var url = getUrl("financingSingle/updateSingleStatusApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			financingSingleId: plus.storage.getItem("financingSingleId"),
			singleStatus: value
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					plus.nativeUI.closeWaiting();
				
					var num=plus.storage.getItem("num"); //获取该融资单保存时的num
					var dt= plus.storage.getItem(num);
					var result = JSON.parse(dt); //获取该融资单的对象
					result.singleStatus.text = text;
					result.singleStatus.singleStatus = value; //刷新本地保存的状态 自定义事件触发时才能正常显示这个状态
					plus.storage.setItem(num, JSON.stringify(result));
					
					showConfirm();//弹出对话框 询问是否跳转到日程
				} else {
					plus.nativeUI.closeWaiting();
					mui.toast("修改失败" + data.msg);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				console.log('获取数据，请检查网络连接' + errorThrown);
			}
		});
	}
});