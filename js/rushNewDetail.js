mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	var num = self.num;//新单id
	var dt = plus.storage.getItem(num);
	var result = JSON.parse(dt); //获取该融资单的对象
	 
	//加载转介原因
	var url = getUrl("makeOver/getNewMakeOverApi");
	var FKEY = getkey(); //获取秘钥
	var mydata = { 
		FKEY: FKEY,
		financingSingleId: result.id,
	};
	mui.ajax(url, {
		data: mydata,
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否登录成功；
			if (data.flag) {
				var objects=data.data;
				var len=objects.length; 
				var html=''; 
				if (len) {//如果有转接记录
					for (var i=0;i<len;i++) {
						var obj=objects[i];
						html+='<div class="my-content margin2">'
							+'<div class="pading8px my-hr">'
							+'<div class="text-title">转介记录<span class="mui-pull-right">'+getTime(obj.createTime)+'</span></div>'
							+'<div class="mui-clearfix"></div>'
							+'</div>'
							+'<div class="my-hr">'
							+'<ul class="record-ul">';
						
						var ResonList=obj.makeOverResonList;
						if(ResonList){//有常用转接原因
							html+=getReasonsHtml(obj.makeOverResonList,"noicon");
						}else{//没有常用转接原因
							html+='';
						}
						html+='</ul>'
							+'</div>'
							+'<div class="pading8px my-hr year-text other-reason">'
							+ obj.content
							+'</div>'
							+'</div>';
					}
					document.getElementById('reason_list_div').innerHTML=html;
				}
			} 
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log('获取数据，请检查网络连接' + errorThrown);
		}
	});

	//加载融资单其他信息
	if (result.loanType.text == "企业") {
		var temp_name = result.companyName;
	} else {
		var temp_name = result.personalName + "(个人贷款)";
	}
	document.getElementsByClassName("my-name")[0].innerHTML = temp_name;
	document.getElementsByClassName("mymoney")[0].innerHTML = "￥" + result.loanMoney + "万";
	document.getElementsByClassName("myyt")[0].innerHTML = result.loanUse.text;
	document.getElementsByClassName("loanYear")[0].innerHTML = result.loanYear + "(年)";
	document.getElementsByClassName("time-text")[0].innerHTML = result.converCreateTime;
	mui.currentWebview.show();
	//立即抢单 
	document.getElementById('rushNow').addEventListener("tap", function() {
		plus.nativeUI.showWaiting();
		var managerInfoId = plus.storage.getItem("managerInfoId");
		var financingSingleId = result.id; //融资单ID
		var url = getUrl("financingSingle/grabSingleApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			financingSingleId: financingSingleId,
			managerInfoId: managerInfoId
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				plus.nativeUI.closeWaiting();
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if (data.flag) {
					var newUich = plus.webview.getWebviewById("newUich");
					mui.fire(newUich, 'deleteUich', num);
					var bts = ["返回", "查看融单"];
					plus.nativeUI.confirm("恭喜！抢单成功", function(e) {
						var i = e.index;
						if (i == 0) {
							var ws = plus.webview.getWebviewById("myUich");
							if (ws) {
								mui.fire(ws,'myUichFire',{
									tap:'noCloseNewUichAndNewUichDe'
								});
							}
							mui.back();
						} else {
							var ws = plus.webview.getWebviewById("myUich");
							if (ws) {
								mui.fire(ws, 'myUichFire', null);
							}
							mui.openWindow({
								id: "myUich",
								url: "myUich.html"
							});
						} 
					}, "", bts);
				} else {
					if (data.msg) {
						var newUich = plus.webview.getWebviewById("newUich");
						mui.fire(newUich, 'deleteUich', num);
						mui.alert('很遗憾，该融资单已经被抢走了', 'uich', function() {
							mui.back();
						});
					}
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				console.log('抢单失败，请检查网络连接' + errorThrown);
			}
		});

	});

});