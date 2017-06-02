mui.plusReady(function() {
	//var singleId=plus.storage.getItem("singleId");
	var self = plus.webview.currentWebview();
	var typeId = self.typeId;
	var dt = plus.storage.getItem(typeId);
	var result = JSON.parse(dt); //获取该产品的对象
	document.getElementsByClassName("s-type-text")[0].innerHTML = result.productionType.text + "-" + result.name;
	var productionId = result.id;
	var loanType = plus.storage.getItem("loanType");
	var url = getUrl("fileInfo/getFileByFinancingSingleIdApi");
	var FKEY = getkey(); //获取秘钥
	var mydata = {
		FKEY: FKEY,
		loanType: loanType,
		productionId: productionId
	};
	var fileList='';
	var fileListArray = []; //存储要发送的文件id
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
					fileListArray.push(obj.id);
					html += "<li class='my-hr'>" + obj.fileName + "</li>";
				}
				//console.log(html);
				fileList=html;
				if (len == 0) {
					document.getElementsByClassName("s-word-ul")[0].innerHTML = "<div style='padding: 10px 10px;'>无</div>";

				} else {
					document.getElementsByClassName("s-word-ul")[0].innerHTML = html;
				}
				document.getElementById("send-btn-div").style.display = "block";
				if (len == 0) {
					document.getElementById("send-btn").setAttribute("disabled", "disabled");
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			mui.toast('获取数据，请检查网络连接' + errorThrown);
		}
	});

	//发送邮件
	document.getElementById('send-btn').addEventListener('tap', function() {
		plus.nativeUI.showWaiting(); //显示等待框
		var financingSingleId = plus.storage.getItem("financingSingleId");
		var num = plus.storage.getItem("num");
		var loanType = plus.storage.getItem("loanType");
		var fileIdListStr = fileListArray.toString();
		var url = getUrl("fileInfo/sendMailApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			fileIdListStr: fileIdListStr,
			financingSingleId: financingSingleId,
			loanType: loanType
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(flag) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				setTimeout(function() {
					if (flag) {
						var url = getUrl("financingSingle/updateProductionInfoIdApi");
						var FKEY = getkey(); //获取秘钥
						var mydata = {
							FKEY: FKEY,
							financingSingleId: financingSingleId,
							productionInfoId: productionId
						};
						mui.ajax(url, {
							data: mydata,
							dataType: 'json', //服务器返回json格式数据
							type: 'get', //HTTP请求类型
							timeout: 10000, //超时时间设置为10秒；
							success: function(data) {
								//服务器返回响应，根据响应结果，分析是否登录成功；
								if (data.flag) {
									changeStatusAjax('SENTED', '已发送');
								}  
							},
							error: function(xhr, type, errorThrown) {
								//异常处理；
								console.log('获取数据，请重试' + errorThrown);
								mui.toast("发送失败，请重试");
							}
						});

					} else {
						plus.nativeUI.closeWaiting();
						mui.toast("发送失败，请重试");
					}

				}, 600);

			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				console.log('获取数据，请检查网络连接' + errorThrown);
				mui.toast("发送失败，请重试");
			}
		});
	});
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
					mui.toast("发送成功");
					//保存发送记录 和发送文档列表 跳转至详情时显示
					plus.storage.setItem("emailStatus",'SENT');
					plus.storage.setItem("productionId",productionId.toString());
					var nowTime=new Date();
					plus.storage.setItem("sendEmailTime",nowTime.getTime().toString());
					var num=plus.storage.getItem("num"); //获取该融资单保存时的num
					var dt= plus.storage.getItem(num);
					var result = JSON.parse(dt); //获取该融资单的对象
					result.singleStatus.text = text;
					result.singleStatus.singleStatus = value; //刷新本地保存的状态 自定义事件触发时才能正常显示这个状态
					plus.storage.setItem(num, JSON.stringify(result));
					
					//关闭其他窗口并转向详细页面
					plus.webview.getWebviewById("sendThird").hide("none");
					plus.webview.getWebviewById("sendSecond").hide("none");
					
					var myUich = plus.webview.getWebviewById("myUich");
					mui.fire(myUich, "myUichFire", {
						tap: "noCloseDetail"
					}); //传入tap参数 不需要关闭uichdetail
					var uichDetail = plus.webview.getWebviewById("uichDetail");
					mui.fire(uichDetail, "uichDetailFire",{tap:"send"});
					uichDetail.show("pop-in"); 
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