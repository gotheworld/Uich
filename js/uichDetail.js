window.addEventListener('uichDetailMoneyFire', function(event) {
	var money = event.detail.money;
	console.log(money);
	$(".mymoney").html("￥" + money + "万");
	var num = plus.storage.getItem("num"); //获取该融资单保存时的num
	var dt = plus.storage.getItem(num);
	var result = JSON.parse(dt); //获取该融资单的对象
	result.loanMoney = money;
	plus.storage.setItem(num, JSON.stringify(result));
}); 
//添加自定义事件监听
window.addEventListener('uichDetailFire', function(event) {
	mui.plusReady(function() {
		var tap = event.detail.tap;
		if (tap == "send") {
			closeWindows('sendThird');
			closeWindows('sendSecond');
			closeWindows('send'); 
		}

		var self = plus.webview.currentWebview();
		var num = self.num;
		var dt = plus.storage.getItem(num);
		plus.storage.setItem("num", num); //保存融资单num 发送邮件成功后返回用到
		var result = JSON.parse(dt); //获取该融资单的对象
		var ID = result.id; //当前融资单id
	
		
		/*var url = getUrl("makeOver/getNewMakeOverApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			financingSingleId: result.id,
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 8000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					var objects = data.data;
					var len = objects.length;
					var html = '';
					if (len) { //如果有转接记录
						for (var i = 0; i < len; i++) {
							var obj = objects[i];
							html += '<div class="my-content margin2">' + '<div class="pading8px my-hr">' + '<div class="text-title">转介记录<span class="mui-pull-right">' + getTime(obj.createTime) + '</span></div>' + '<div class="mui-clearfix"></div>' + '</div>' + '<div class="my-hr">' + '<ul class="record-ul">';
							var ResonList = obj.makeOverResonList;
							if (ResonList) { //有常用转接原因
								html += getReasonsHtml(obj.makeOverResonList, "noicon");
							} else { //没有常用转接原因
								html += '';
							}
							html += '</ul>' + '</div>' + '<div class="pading8px my-hr year-text other-reason">' + obj.content + '</div>' + '</div>';
						}
						document.getElementById('reason_list_div').innerHTML = html;
					}
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				mui.toast('获取数据，请检查网络连接' + errorThrown);
			}
		});*/

		var ThisType = result.loanType.loanType;
		//获取发送文档列表
		//var productionId = result.productionInfoId;
		var productionId = plus.storage.getItem('productionId');
		//获取发送文档列表
		if (productionId) { //如果发送了文档
			var sendEmailTime = result.sendEmailTime;//发送文档时间
			var url = getUrl("fileInfo/getFileByFinancingSingleIdApi");
			var FKEY = getkey(); //获取秘钥
			var mydata = {
				FKEY: FKEY,
				loanType: ThisType,
				productionId: productionId
			};
			mui.ajax(url, {
				data: mydata,
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				timeout: 8000, //超时时间设置为10秒；
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否登录成功；
					if (data.flag) {
						var html = "";
						var len = data.data.length;
						var result = data.data;
						for (var i = 0; i < len; i++) {
							var obj = result[i];
							html += "<li class='my-hr'>" + obj.fileName + "</li>";
						}
						//console.log(html);
						if (len != 0) {
							document.getElementById('file').style.display = "block";
							document.getElementsByClassName("s-word-ul")[0].innerHTML = html;
							var sendEmailTime=plus.storage.getItem("sendEmailTime");
							//console.log(sendEmailTime);
							document.getElementById("sendEmailTime").innerHTML = getLocalTime(sendEmailTime);
						}
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log('获取数据，请检查网络连接' + errorThrown);
				}
			});
		}
		if (ThisType == "ENTERPRISE") {
			var temp_name = result.companyName;
			var d_name = result.legalPerson;
		} else {
			var temp_name = result.personalName + "(个人贷款)";
			var d_name = result.personalName;
		}
		plus.storage.setItem("financingSingleId", ID.toString()); //储存融资单Id 发送文档用到 必须转化为字符串才能保存
		plus.storage.setItem("loanType", ThisType); //储存借贷类型 发送文档用到
		document.getElementsByClassName("my-name")[0].innerHTML = temp_name;
		document.getElementsByClassName("mymoney")[0].innerHTML = "￥" + result.loanMoney + "万";
		document.getElementsByClassName("myyt")[0].innerHTML = "(" + result.loanUse.text + ")";
		if(result.singleStatus.singleStatus=='INTERVIEWED'){
			$(".status-btn").addClass("status-upload-btn");
		}else{
			$(".status-btn").removeClass("status-upload-btn");
		}
		document.getElementsByClassName("status-btn")[0].innerHTML = result.singleStatus.text;
		document.getElementsByClassName("d-name")[0].innerHTML = d_name;
		document.getElementById("tel").setAttribute("href", result.phone);
		document.getElementById("loanYear").innerHTML = result.loanYear + "(年)";
		document.getElementsByClassName("time-text")[0].innerHTML = getLocalTime(result.createTime);
		//如果还没签约  则显示下一步按钮
		var singleStatus = result.singleStatus.singleStatus; //该单融资单状态

		setBtn(singleStatus); //根据融资单状态，改变按钮

		if (singleStatus == "SENTED") {
			document.getElementById("file").style.display = "block";
		}
		if (singleStatus != "LOANSUCCESS") {
			document.getElementById("next").style.display = "block";
		} else {
			document.getElementById("next").style.display = "none";
		}
		//console.log(interViewStatus); 

		var menuHmlt = getMenuListHtml(singleStatus); //更据融资单状态 菜单栏显示不同菜单  并返回HTML代码
		if (singleStatus == "LOANSUCCESS") { //如果 ”已签约“状态 则隐藏菜单按钮
			document.getElementById("menu").style.display = "none";

		} else {
			document.getElementById("d-menuList").innerHTML = menuHmlt; //加载菜单html
			document.getElementById("menu").style.display = "block";
		}
		if (result.singleStatus.singleStatus == "INTERVIEWED") {
			$("#return-history-btn").attr("data", "upload");
		}

	});
});
uichDetailMain();

function uichDetailMain() {
	mui.plusReady(function() {
		var self = plus.webview.currentWebview();
		var num = self.num;
		var dt = plus.storage.getItem(num);
		plus.storage.setItem("num", num); //保存融资单num 发送邮件成功后返回用到
		var result = JSON.parse(dt); //获取该融资单的对象
		var ID = result.id; //当前融资单id
		console.log(ID); 
		mui.init({
			beforeback: function() {
				var myUich = plus.webview.getWebviewById("myUich");
				mui.fire(myUich, 'myUichFire', null);
				return true;
			}
		}); 
		var ThisType = result.loanType.loanType;
		plus.storage.setItem("loanType", ThisType); //保存产品类型 发送文档用到
		plus.storage.removeItem('emailStatus'); //每次加载详情时 删除临时的emailStatus
		plus.storage.removeItem('productionId'); //每次加载详情时 删除临时的productionId
		//获取转介原因 
		var url = getUrl("makeOver/getMakeOverApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			financingSingleId: result.id, 
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 8000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					var objects = data.data;
					var len = objects.length; 
					var html = '';
					if (len) { //如果有转接记录
						for (var i = 0; i < len; i++) {
							var obj = objects[i];
							html += '<div class="my-content margin2">' + '<div class="pading8px my-hr">' + '<div class="text-title">转介记录<span class="mui-pull-right">' + getLocalTime(obj.createTime) + '</span></div>' + '<div class="mui-clearfix"></div>' + '</div>' + '<div class="my-hr">' + '<ul class="record-ul">';
							var ResonList = obj.makeOverResonList;
							if (ResonList) { //有常用转接原因
								html += getReasonsHtml(obj.makeOverResonList, "noicon");
							} else { //没有常用转接原因
								html += '';
							}
							html += '</ul>' + '</div>' + '<div class="pading8px my-hr year-text other-reason">' + obj.content + '</div>' + '</div>';
						}
						document.getElementById('reason_list_div').innerHTML = html;
					}
				}
				plus.nativeUI.closeWaiting();
				mui.currentWebview.show('pop-in');
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				mui.currentWebview.show('pop-in');
				mui.toast('获取数据，请检查网络连接' + errorThrown);
			}
		});
		//获取发送文档列表
		var productionId = result.productionInfoId;
		if (productionId) { //如果发送了文档
			var sendEmailTime = result.sendEmailTime;//发送文档时间
			var url = getUrl("fileInfo/getFileByFinancingSingleIdApi");
			var FKEY = getkey(); //获取秘钥
			var mydata = {
				FKEY: FKEY,
				loanType: ThisType,
				productionId: productionId
			};
			mui.ajax(url, {
				data: mydata,
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				timeout: 8000, //超时时间设置为10秒；
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否登录成功；
					if (data.flag) {
						var html = "";
						var len = data.data.length;
						var result = data.data;
						//console.log(JSON.stringify(result));
						for (var i = 0; i < len; i++) {
							var obj = result[i];
							html += "<li class='my-hr'>" + obj.fileName + "</li>";
						}
						//console.log(html);
						if (len != 0) {
							document.getElementById('file').style.display = "block";
							document.getElementsByClassName("s-word-ul")[0].innerHTML = html;
							document.getElementById("sendEmailTime").innerHTML = getLocalTime(sendEmailTime);
						}
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log('获取数据，请检查网络连接' + errorThrown);
				}
			});
		}

		if (ThisType == "ENTERPRISE") {
			var temp_name = result.companyName;
			var d_name = result.legalPerson;
		} else {
			var temp_name = result.personalName + "(个人贷款)";
			var d_name = result.personalName;
		}
		plus.storage.setItem("financingSingleId", ID.toString()); //储存融资单Id 发送文档用到 必须转化为字符串才能保存
		plus.storage.setItem("loanType", ThisType); //储存借贷类型 发送文档用到
		document.getElementsByClassName("my-name")[0].innerHTML = temp_name;
		document.getElementsByClassName("mymoney")[0].innerHTML = "￥" + result.loanMoney + "万";
		document.getElementsByClassName("myyt")[0].innerHTML = "(" + result.loanUse.text + ")";
		if(result.singleStatus.singleStatus=='INTERVIEWED'){
			$(".status-btn").addClass("status-upload-btn");
		}else{
			$(".status-btn").removeClass("status-upload-btn");
		}
		document.getElementsByClassName("status-btn")[0].innerHTML = result.singleStatus.text;
		document.getElementsByClassName("d-name")[0].innerHTML = d_name;
		document.getElementById("tel").setAttribute("href", result.phone);
		document.getElementById("loanYear").innerHTML = result.loanYear + "(年)";
		document.getElementsByClassName("time-text")[0].innerHTML = getLocalTime(result.createTime);
		//如果还没签约  则显示下一步按钮
		var singleStatus = result.singleStatus.singleStatus; //该单融资单状态
		setBtn(singleStatus); //根据融资单状态，改变按钮
		if (singleStatus == "SENTED") {
			document.getElementById("file").style.display = "block";
		}
		if (singleStatus != "LOANSUCCESS"&&singleStatus!='MANAGERTERMINATION') { //如果 ”放款成功、经理终止"不显示按钮
			document.getElementById("next").style.display = "block";
		} else {
			document.getElementById("next").style.display = "none";
		} 
		
		var menuHmlt = getMenuListHtml(singleStatus); //更据融资单状态 菜单栏显示不同菜单  并返回HTML代码
		if (singleStatus == "LOANSUCCESS"||singleStatus == "MANAGERTERMINATION") { //如果 ”放款成功“状态 则隐藏菜单按钮
			document.getElementById("menu").style.display = "none";
		} else {
			document.getElementById("d-menuList").innerHTML = menuHmlt; //加载菜单html
			document.getElementById("menu").style.display = "block";
		}
		if (result.singleStatus.singleStatus == "INTERVIEWED") {
			$("#return-history-btn").attr("data", "upload");
		}
		if(singleStatus=='MANAGERTERMINATION'){
			var url = getUrl("closeReason/getCloseReasonApi");
			var FKEY = getkey(); //获取秘钥
			var mydata = {
				FKEY: FKEY,
				financingSingleId: ID
			};
			mui.ajax(url, {
				data: mydata,
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				timeout: 8000, //超时时间设置为10秒；
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否登录成功；
					if (data.flag) {
						$('.closeReason_div').css("display",'block');
						$("#close-time").html(getLocalTime(data.data.createTime));
						$("#close-reason").html(data.data.reason);
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log('获取数据，请检查网络连接' + errorThrown);
				}
			});
		}

		//循环绑定菜单事件  关闭和转介
		mui(".mui-table-view").on('tap', '.mui-table-view-cell', function() {
			//获取id
			var id = this.getAttribute("id");
			mui.openWindow({
				id: id,
				url: id + ".html",
				extras: {
					ID: ID
				},
				show: {
					aniShow: "pop-in",
					autoShow: true
				}
			});
			mui(".mui-popover").popover('hide');

		});
		//绑定状态按钮 转到相应历史页面
		document.getElementById('return-history-btn').addEventListener('tap', function() {
			var url = this.getAttribute("data");
			if (url != '') {
				mui.openWindow({
					id: url,
					url: url + ".html",
					extras: {
						num: num
					},
					show: {
						aniShow: "pop-in",
						autoShow: true
					}
				});
			}

		});
		//绑定拨打电话事件 
		document.getElementById('tel').addEventListener('tap', function() {
			var tell = document.getElementById("tel").getAttribute("href");
			var bts = ["呼叫", "取消"];
			plus.nativeUI.confirm(tell, function(e) {
				var i = e.index;
				if (i == 0) {
					plus.device.dial(tell, false);
				}
			}, "", bts);
		});
		document.getElementById('wechat').addEventListener('tap', function() {
			var wechat = result.weixin;
			var bts = ["复制", "取消"];
			plus.nativeUI.confirm("微信号:" + wechat, function(e) {
				var i = e.index;
				if (i == 0) {
					var Context = plus.android.importClass("android.content.Context");
					var main = plus.android.runtimeMainActivity();
					var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
					plus.android.invoke(clip, "setText", wechat);
					mui.toast("微信号已复制到粘贴板");
				}
			}, "", bts);
		});
		document.getElementById('email').addEventListener('tap', function() {
			var email = result.email;
			var bts = ["复制", "取消"];
			plus.nativeUI.confirm("邮箱:" + email, function(e) {
				var i = e.index;
				if (i == 0) {
					var Context = plus.android.importClass("android.content.Context");
					var main = plus.android.runtimeMainActivity();
					var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
					plus.android.invoke(clip, "setText", email);
					mui.toast("邮箱已复制到粘贴板");
				}
			}, "", bts);
		});
		
		if (document.getElementById('next-btn')) {
			document.getElementById('next-btn').addEventListener('tap', function() {
				var data = this.getAttribute("data");
				//已抢单或者 资料审核不通过  跳转到添加日程
				if (data == "pushForm") {
					var  num = plus.storage.getItem("num"); //保存融资单num 发送邮件成功后返回用到
					mui.openWindow({
						url: data + ".html",
						id: data,
						extras: {
							num: num
						},
						show: {
							autoShow: false
						}
					});
				}
				if (data == "appointment") {
					mui.openWindow({
						url: data + ".html",
						id: data
					});
				}
				var num = plus.storage.getItem("num"); //获取该融资单保存时的num
				var dt2 = plus.storage.getItem(num);
				var result2 = JSON.parse(dt2); //获取该融资单的对象
				//console.log(result2.singleStatus.singleStatus);
				if (data == 'upload') {
					mui.openWindow({
						url: data + ".html",
						id: data,
						extras: {
							num: num,
							NowStatu: result2.singleStatus.singleStatus
						},
						show: {
							autoShow: false
						}
					});
				}
				if (data == 'sendSecond') {
					mui.openWindow({
						url: data + ".html",
						id: data,
						extras: {
							loanType: ThisType
						}
					});
				}
				if (data == 'change') {
					var dt2 = plus.storage.getItem(num);
					var result1 = JSON.parse(dt2); //获取该融资单的对象
					var Status = result1.singleStatus.singleStatus
					changeStatus(Status); //弹出下拉框 选择状态 然后改变
				}
			});
		}

		//查看更多按钮 加载贷款人或企业信息
		var see = false; //记录是否已经加载过数据
		document.getElementById('click-more-btn').addEventListener('tap', function() {

			if (ThisType == "ENTERPRISE") { //企业贷款
				var url = getUrl("loanEnterprise/getLoanEnterpriseApi");
				see_more("company-more", see);
			} else { //个人贷款
				var url = getUrl("loanPersonal/getLoanPersonalApi");
				see_more("personal-more", see);
			}
			if (see) { //判断是否是第一次加载
				return;
			}
			see = true; //标记为已加载
			if (mui.os.android) {
				var ws = plus.nativeUI.showWaiting();
			}
			var FKEY = getkey(); //获取秘钥  
			var mydata = {
				FKEY: FKEY,
				financingSingleId: ID
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
						if (ThisType == "ENTERPRISE") { //企业贷款
							document.getElementById("c-legalPerson").innerHTML = result.legalPerson;
							document.getElementById("c-certificateType").innerHTML = result.certificateType.text;
							document.getElementById("c-frontImg").innerHTML = "<img src='" + data.fileBaseUrl + result.frontImgUrl + "'" + " data-preview-src='' data-preview-group='2' />";
							document.getElementById("c-contraryImg").innerHTML = "<img src='" + data.fileBaseUrl + result.contraryImgUrl + "'" + " data-preview-src='' data-preview-group='2'/>";
							document.getElementById("c-enterpriseCode").innerHTML = result.enterpriseCode;
							document.getElementById("c-certificateCopy").innerHTML = "<img src='" + data.fileBaseUrl + result.certificateCopyUrl + "'" + " data-preview-src='' data-preview-group='2' />";
							document.getElementsByClassName("company-more")[0].style.display = "block";
						} else { //个人贷款
							document.getElementById("p-certificateType").innerHTML = result.certificateType.text;
							document.getElementById("p-certificateCode").innerHTML = result.certificateCode;
							document.getElementById("p-frontImg").innerHTML = "<img src='" + data.fileBaseUrl + result.frontImgUrl + "'" + " data-preview-src='' data-preview-group='1' />";
							document.getElementById("p-contraryImg").innerHTML = "<img src='" + data.fileBaseUrl + result.contraryImgUrl + "'" + " data-preview-src='' data-preview-group='1'/>";
							document.getElementsByClassName("personal-more")[0].style.display = "block";
						}
						if (mui.os.android) {
							setTimeout(function() {
								ws.close();
							}, 800);
						}
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
		//预约面访弹出菜单实现
		function showActionSheet() {
			var bts = [{
				title: "面访确认与上传"
			}, {
				title: "添加日程"
			}];
			plus.nativeUI.actionSheet({
					title: "预约面访菜单栏",
					cancel: "取消",
					buttons: bts
				},
				function(e) {
					//日程提醒
					if (e.index == 1) {
						var dt = plus.storage.getItem(num);
						var result = JSON.parse(dt); //获取该融资单的对象
						var status = result.singleStatus.singleStatus; //当前融资单状态
						if (status == "GRABSINGLE") { //如果该融资单没有确认面访
							showConfirm(); //弹出确认面访框
						} else { //如果该融资单已经确认面访 直接进入上传图片页面
							mui(".mui-popover").popover('hide');
							mui.openWindow({
								url: "upload.html",
								id: "upload",
								extras: {
									num: num
								},
								show: {
									autoShow: false
								}
							});
						}
					} else if (e.index == 2) { //添加日程
						mui(".mui-popover").popover('hide');
						mui.openWindow({
							url: "appointment.html",
							id: "appointment"
						});
					}
					mui(".mui-popover").popover('hide');
				}
			);
		}
		//确认面访
		function showConfirm() {
			var bts = ["确认", "取消"];
			plus.nativeUI.confirm("请确认是否已面访？", function(e) {
				mui(".mui-popover").popover('hide');
				var i = e.index;
				if (i == 0) {
					changeStatusAjax("ACCEPT", "受理中", "mf");
				}
			}, "", bts);
		}
		//弹出下拉框 选择状态 然后改变
		function changeStatus(status) {
			//根据当前融资单状态 分别显示能更改的状态
			if (status == "INTERVIEWED") { //受理中->资料审核通过||资料审核不通过

				var statusDate = [{
					value: 'INFORMATIONAUDITPASS',
					text: '资料审核通过'
				}, {
					value: 'INFORMATIONAUDITNOPASS',
					text: '资料审核不通过'
				}];
			}
			if (status == "INFORMATIONAUDITPASS") { //资料审核通过->贷款审核通过||贷款审核不通过（终止融资单）
				var statusDate = [{
					value: 'LOANAUDITPASS',
					text: '贷款审核通过'
				}, {
					value: 'LOANAUDITNOPASS',
					text: '贷款审核不通过'
				}];
			}

			if (status == "LOANAUDITPASS") { //贷款审核通过->已签约
				var statusDate = [{
					value: 'SIGNCONTRACT',
					text: '已签约'
				}];
			}
			if (status == "LOANAUDITNOPASS") { //贷款审核不通过->关闭
				var statusDate = [{
					value: 'INFORMATIONAUDITPASS',
					text: '资料审核通过'
				}, {
					value: 'INFORMATIONAUDITNOPASS',
					text: '资料审核不通过'
				}];
			}
			if (status == "SIGNCONTRACT") { //签约->受理
				var statusDate = [{
					value: 'ACCEPTANCEPASS',
					text: '受理通过'
				}, {
					value: 'ACCEPTANCENOPASS',
					text: '受理不通过'
				}];
			}
			if (status == "ACCEPTANCENOPASS") { //签约->受理
				var statusDate = [{
					value: 'ACCEPTANCEPASS',
					text: '受理通过'
				}];
			}
			if (status == "ACCEPTANCEPASS") { //签约->受理
				var statusDate = [{
					value: 'LOANSUCCESS',
					text: '放款成功'
				}, {
					value: 'LOANFAIL',
					text: '放款不成功'
				}];
			}
			if (status == "LOANFAIL") { //签约->受理
				var statusDate = [{
					value: 'LOANSUCCESS',
					text: '放款成功'
				}];
			}
			var userPicker = new mui.PopPicker();
			userPicker.setData(statusDate);
			userPicker.show(function(items) {
				var value = items[0]['value'];
				var text = items[0]['text'];
				changeStatusAjax(value, text); //ajax改变该融资单状态
			});
		}
		//ajax改变该融资单状态
		function changeStatusAjax(value, text, flag) {
			plus.nativeUI.showWaiting();
			var url = getUrl("financingSingle/updateSingleStatusApi");
			var FKEY = getkey(); //获取秘钥
			var mydata = {
				FKEY: FKEY,
				financingSingleId: ID,
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
						mui.toast("修改成功");
						plus.nativeUI.closeWaiting();
						result.singleStatus.text = text;
						result.singleStatus.singleStatus = value;
						plus.storage.setItem(num, JSON.stringify(result));
						var uichDetail = plus.webview.currentWebview();
						mui.fire(uichDetail, "uichDetailFire", null);
						var myUich = plus.webview.getWebviewById("myUich");
						mui.fire(myUich, "myUichFire", {
							tap: "noCloseDetail"
						}); //传入tap参数 不需要关闭uichdetail
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
}
//关闭右上角menu以及背景遮板
//tag:1仅关闭menu 2：关闭背景遮板  null：关闭全部
function closeMenuList(tag) {
	if (tag == 1) {
		$("#menu-list").css("display", "none");
		return;
	} else if (tag == 2) {
		$(".mui-backdrop").css("position", "static");
		return;
	}
	$("#menu-list").css("display", "none");
	$(".mui-backdrop").css("position", "static");
}

//根据不同状态 返回不同的菜单
function getMenuListHtml(status, interViewStatus) {
	var html = "";
	var e_li = "</li>";

	if (status != "LOANSUCCESS"&&status!='MANAGERTERMINATION') {
		html += "<li id='refer' class='mui-table-view-cell'>";
		html += "<a>转介此单</a>";
		html += e_li;
	}
	if (status != "LOANSUCCESS"&&status!='MANAGERTERMINATION') {
		html += "<li id='close' class='mui-table-view-cell'>";
		html += "<a>关闭此单</a>";
		html += e_li;
	}
	
	return html;
}
//点击加载更多 样式变化
function see_more(id, see) {
	var dis = document.getElementsByClassName(id)[0].style.display;
	if (dis == "block") {
		document.getElementsByClassName(id)[0].style.display = "none";
		document.getElementsByClassName("d-more-icon-down")[0].style.display = "block";
		document.getElementsByClassName("d-more-icon-up")[0].style.display = "none";
	} else {
		if (see) {
			document.getElementsByClassName(id)[0].style.display = "block";
		}
		document.getElementsByClassName("d-more-icon-down")[0].style.display = "none";
		document.getElementsByClassName("d-more-icon-up")[0].style.display = "block";
	}
}

function setBtn(statu) {
	if (statu == "GRABSINGLE") {
		$("#next-btn").text("推送申请表");
		$("#next-btn").attr("data", "pushForm");
	}
	if (statu == "PUSHED") {
		$("#next-btn").text("确认申请表");
		$("#next-btn").attr("data", "pushForm");
	}
	if (statu == "APPLYED") {
		$("#next-btn").text("发送文档");
		$("#next-btn").attr("data", "sendSecond");
	}
	if (statu == "SENTED" || statu == "INFORMATIONAUDITNOPASS") {
		$("#next-btn").text("添加面访日程");
		$("#next-btn").attr("data", "appointment");
	}
	if (statu == "BESPEAKED") {
		$("#next-btn").text("确认面访与上传");
		$("#next-btn").attr("data", "upload");
	}
	//var list = ['INTERVIEWED', 'INFORMATIONAUDITPASS', 'LOANAUDITPASS', 'LOANAUDITNOPASS', 'SIGNCONTRACT', 'ACCEPTANCEPASS', 'ACCEPTANCENOPASS', 'LOANFAIL'];
	if(statu=='INTERVIEWED'){
		$("#next-btn").text("资料审核");
		$("#next-btn").attr("data", 'change');
	}
	if(statu=='INFORMATIONAUDITPASS'){
		$("#next-btn").text("贷款审核");
		$("#next-btn").attr("data", 'change');
	}
	if(statu=='LOANAUDITPASS'){
		$("#next-btn").text("签约确认");
		$("#next-btn").attr("data", 'change');
	}
	if(statu=='LOANAUDITNOPASS'){
		$("#next-btn").text("资料审核");
		$("#next-btn").attr("data", 'change');
	}
	if(statu=='SIGNCONTRACT'){
		$("#next-btn").text("抵押登记受理");
		$("#next-btn").attr("data", 'change');
	}
	if(statu=='ACCEPTANCEPASS'){
		$("#next-btn").text("放款");
		$("#next-btn").attr("data", 'change');
	}
	if(statu=='ACCEPTANCENOPASS'){
		$("#next-btn").text("抵押登记受理");
		$("#next-btn").attr("data", 'change');
	}
	
}