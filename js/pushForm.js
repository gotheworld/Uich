mui.plusReady(function() {
	getList('repayMode');
	getList('guaranteeMode');
	var self = plus.webview.currentWebview();
	var num = self.num; //当前融资单ID
	var dt = plus.storage.getItem(num);
	var result = JSON.parse(dt); //获取该融资单的对象
	var ID = result.id;
	var singleStatus = result.singleStatus.singleStatus; //当前融资单状态
	var url = getUrl("applyForm/getApplyFormByFinancingSingleId");
	var FKEY = getkey(); //获取秘钥
	var mydata = {
		FKEY: FKEY,
		financingSingleId: ID
	};
	var RESULT = ''; //保存取的信息
	var TYPE = ''; //贷款主题类型
	var repayModeDate = null;
	var guaranteeModeDate = null;
	mui.ajax(url, {
		data: mydata,
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 8000, //超时时间设置为10秒；
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否登录成功；
			if (data.flag) {
				var result = data.data;
				//console.log(JSON.stringify(result));
				RESULT = result;
				var enterpriseName = result.enterpriseName; //公司名称
				var email = result.email;
				var money = result.money;
				var partyB = result.partyB;
				var phone = result.phone;
				var loanYear = result.loanYear;
				if (result.repayMode) {
					var repayMode = result.repayMode.text;
					document.getElementById("repayMode").innerHTML = repayMode;
					$("#repayMode").attr("data", result.repayMode.value);
				}
				if (result.guaranteeMode) {
					var guaranteeMode = result.guaranteeMode.text;
					document.getElementById("guaranteeMode").innerHTML = guaranteeMode;
					$("#guaranteeMode").attr("data", result.guaranteeMode.value);
				}
				document.getElementById("email").innerHTML = email;
				document.getElementById("money").value = money;
				document.getElementById("partyB").innerHTML = partyB;
				document.getElementById("loanYear").innerHTML = loanYear;
				document.getElementById("phone").innerHTML = phone;

				if (enterpriseName) { //判断是否是企业贷款
					TYPE = 'company';
					$(".company").show();
					var legalPerson = result.legalPerson;
					var enterpriseCode = result.enterpriseCode;
					if (result.address) {
						document.getElementById("address_c").value = result.address;
					}
					if (result.purpose) {
						document.getElementById("purpose").value = result.purpose;
					}
					document.getElementById("legalPerson").innerHTML = legalPerson;
					document.getElementById("legalPerson").innerHTML = legalPerson;
					document.getElementById("enterpriseName").innerHTML = enterpriseName;
					document.getElementById("enterpriseCode").innerHTML = enterpriseCode;

				} else {
					TYPE = 'personal';
					$(".personal").show();
					var certificateType = result.certificateType.text + "号";
					var certificateCode = result.certificateCode;
					var financingUserName = result.financingUserName;
					var loanCategory = result.loanCategory;
					if (loanCategory) {
						document.getElementById("loanCategory").innerHTML = loanCategory;
						$(".loanCategory").show();
					}
					document.getElementById("postCode").value = result.postCode;
					if (result.address) {
						document.getElementById("address_p").value = result.address;
					}
					document.getElementById("financingUserName").innerHTML = financingUserName;
					document.getElementById("certificateType").innerHTML = certificateType;
					document.getElementById("certificateCode").innerHTML = certificateCode;
				}
				if (singleStatus == "GRABSINGLE") { //如果是已抢单状态 进入的此页面 则表示以第一次推送
					$(".push").show();
				} else {
					$(".sure").show();
				}
				plus.nativeUI.closeWaiting();
				plus.webview.currentWebview().show("pop-in");
			} else {
				plus.nativeUI.closeWaiting();
				plus.webview.currentWebview().show("pop-in");
				mui.toast("获取失败");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			plus.nativeUI.closeWaiting();
			plus.webview.currentWebview().show("pop-in");
			console.log('获取数据，请检查网络连接' + errorThrown);
			mui.toast('网络连接故障');
		}
	});

	document.getElementById('repayMode-div').addEventListener('tap', function() {
		var userPicker = new mui.PopPicker();
		userPicker.setData(repayModeDate);
		userPicker.show(function(items) {
			var value = items[0]['value'];
			var text = items[0]['text'];
			document.getElementById('repayMode').innerHTML = text;
			$("#repayMode").attr("data", value);
		});
	});
	document.getElementById('guaranteeMode-div').addEventListener('tap', function() {
		var userPicker = new mui.PopPicker();
		userPicker.setData(guaranteeModeDate);
		userPicker.show(function(items) {
			var value = items[0]['value'];
			var text = items[0]['text'];
			document.getElementById('guaranteeMode').innerHTML = text;
			$("#guaranteeMode").attr("data", value);
		});
	});
	//修改和提交申请表
	document.getElementById('push-btn').addEventListener('tap', function() {
		pushMain('push');
	});
	document.getElementById('change-btn').addEventListener('tap', function() {
		pushMain('change');
	});

	//确认申请表
	document.getElementById('sure-btn').addEventListener('tap', function() {
		//
		var bts = ["确认", "取消"];
		plus.nativeUI.confirm("是否确认和客户沟通且信息正确无误？", function(e) {
			var i = e.index;
			if (i == 0) {
				changeStatusAjax('APPLYED', '已申请' ,'sure');
			}
		}, "", bts);
		
	});

	function pushMain(tap) {
		var FKEY = getkey(); //获取秘钥
		var address_p = $("#address_p").val();
		var address_c = $("#address_c").val();
		var money = $("#money").val();
		var guaranteeMode = $("#guaranteeMode").attr('data');
		var repayMode = $("#repayMode").attr('data');
		if (money == '') {
			mui.toast("请输入贷款金额");

			return;
		}
		if (repayMode == '') {
			mui.toast("请选择还款方式");
			return;
		}
		if (guaranteeMode == '') {
			mui.toast("请选择担保方式");
			return;
		}
		if (address_p == '' && address_c == '') {
			mui.toast("请输入地址");
			return;
		}
		var id = 0;

		if (TYPE == "company") {
			var purpose = $("#purpose").val();
			if (purpose == '') {
				mui.toast("请输入贷款用途");
				return;
			}
			var url = getUrl("applyForm/saveEnterpriseApplyForm");
			var mydata = {
				FKEY: FKEY,
				financingSingleId: ID,
				email: RESULT.email,
				enterpriseName: RESULT.enterpriseName,
				enterpriseCode: RESULT.enterpriseCode,
				legalPerson: RESULT.legalPerson,
				phone: RESULT.phone,
				address: address_c,
				email: RESULT.email,
				money: money,
				loanYear: RESULT.loanYear,
				partyB: RESULT.partyB,
				repayMode: repayMode,
				guaranteeMode: guaranteeMode,
				purpose: purpose
			};
			if (RESULT.id || RESULT.id == 0) { //如果是修改的话 id就存在
				mydata.id = RESULT.id;
			}
			var version = 0;
			if (RESULT.version || RESULT.version == 0) { //如果是修改的话version就存在
				mydata.version = RESULT.version;
			}
		} else { //个人
			var postCode = $("#postCode").val();
			if (postCode == '') {
				mui.toast("请输入邮政编码");
				return;
			}
			var url = getUrl("applyForm/savePersonalApplyForm");
			var certificateType = RESULT.certificateType.certificateType;
			var mydata = {
				FKEY: FKEY,
				financingSingleId: ID,
				financingUserName: RESULT.financingUserName,
				certificateType: certificateType,
				certificateCode: RESULT.certificateCode,
				phone: RESULT.phone,
				postCode: postCode,
				address: address_p,
				email: RESULT.email,
				money: money,
				loanYear: RESULT.loanYear,
				partyB: RESULT.partyB,
				repayMode: repayMode,
				guaranteeMode: guaranteeMode,
				
			};
			if(RESULT.loanCategory){//如果按揭的 则加入字段
				mydata.loanCategory = RESULT.loanCategory;
			}
			if (RESULT.id || RESULT.id == 0) { //如果是修改的话 id就存在
				mydata.id = RESULT.id;
			}
			var version = 0;
			if (RESULT.version || RESULT.version == 0) { //如果是修改的话version就存在
				mydata.version = RESULT.version;
			}
			
		}
		//plus.nativeUI.showWaiting();
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					if (tap == 'push') { //推表
						changeStatusAjax('PUSHED', '已推表');
					} else { //修改表
						var uichDetail = plus.webview.getWebviewById('uichDetail');
						mui.fire(uichDetail, "uichDetailMoneyFire", {
							money:money
						});
						plus.nativeUI.closeWaiting();
						var bts = ["返回", "留在此页面"];
						
						plus.nativeUI.confirm("修改成功", function(e) {
							var i = e.index;
							if (i == 0) {
								mui.back();
							}
						}, "", bts);
					}
				} else {
					plus.nativeUI.closeWaiting();
					mui.toast("提交失败");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				console.log('获取数据，请检查网络连接' + errorThrown);
			}
		});
	}
	//ajax改变该融资单状态
	function changeStatusAjax(value, text, flag) {
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
					plus.nativeUI.closeWaiting();
					if (flag == 'sure') {
						mui.toast("确认成功");
					} else {
						mui.toast("推送成功");
					}
					//本地数据修改状态
					result.singleStatus.text = text;
					result.singleStatus.singleStatus = value;
					plus.storage.setItem(num, JSON.stringify(result));

					var uichDetail = plus.webview.getWebviewById('uichDetail');
					mui.fire(uichDetail, "uichDetailFire", null);
					var myUich = plus.webview.getWebviewById("myUich");
					mui.fire(myUich, "myUichFire", {
						tap: "noCloseDetail"
					}); //传入tap参数 不需要关闭uichdetail
					mui.back();
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

	function getList(type) {
		if (type == 'repayMode') {
			var url = getUrl("applyForm/getRepayModeListApi");
		} else {
			var url = getUrl("applyForm/getGuaranteeModeListApi");
		}
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
					if (type == 'repayMode') {
						repayModeDate = data.data;
					} else {
						guaranteeModeDate = data.data;
					}
				} else {
					mui.toast("修改失败" + data.msg);
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log('获取数据，请检查网络连接1' + errorThrown);
			}
		});
	}

});