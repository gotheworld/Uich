

/*
离线: 通知+不规则 (不需要清除通知)
在线: 1).规则+不规则
*/



//添加自定义事件监听  增加一个新单
window.addEventListener('newUich', function(event) {
	var data=event.detail;
	addNewUich(JSON.stringify(data),'add');
});
//添加自定义事件监听 删除一个新单
window.addEventListener('deleteUich', function(event) {
	var id=event.detail;
	mui.plusReady(function() {
		plus.storage.removeItem(id);//删除该条记录
	});
	//找到父元素 newUich 隐藏
	$("#"+id).closest(".newUich").css("display","none");
});

mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	var data = self.data;
	addNewUich(data);
	//绑定关闭按钮事件
	mui(".mui-content").on("tap",".close-btn",function(){
		plus.push.clear();//清空所有推送消息
		$(this).closest(".newUich").css("display","none");
	});
	//绑定查看更多事件
	mui(".mui-content").on("tap",".new-detail",function(){
		var num=this.getAttribute("id");
		mui.openWindow({
			id: 'rushNewDetail',
			url: 'rushNewDetail.html',
			extras: {
				num: num
			},
			show: {
				
				aniShow: 'pop-in'
			}
		});
		//alert("more-id="+id);
	}); 
	//绑定立即抢单事件
	mui(".mui-content").on("tap",".rush-btn",function(){
		var id=this.getAttribute("name");
		var th=this;
		plus.nativeUI.showWaiting();
		var managerInfoId = plus.storage.getItem("managerInfoId");
		var url = getUrl("financingSingle/grabSingleApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			financingSingleId: id,
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
					var w2 = plus.webview.getWebviewById("rushBody");
					mui.fire(w2, 'rushBodyFire', null);
					var bts = ["继续抢单", "查看融单"];
					plus.nativeUI.confirm("恭喜！抢单成功", function(e) {
						var i = e.index;
						if (i == 0) {
							var ws = plus.webview.getWebviewById("myUich");
							if (ws) {
								mui.fire(ws, "myUichFire", {
									tap: "noCloseNewUich"
								}); //传入tap参数 不需要关闭newuichdetail
								//找到父元素 newUich 隐藏
								$(th).closest(".newUich").css("display","none");
							} 
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
						mui.alert('很遗憾，该融资单已经被抢走了', 'uich', function() {
							//找到父元素 newUich 隐藏
							$(th).closest(".newUich").css("display","none");
						});
					}
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				mui.toast('抢单失败，请检查网络连接');
			}
		});
	});
});
var IDSTORAGE=0;
/*
 * result:融资单信息json对象
 * tap：区分新增还是第一次加载 
 */
function addNewUich(data,tap){
	/*plus.push.clear();//清空所有推送消息*/
	
	var result = JSON.parse(data); //获取该融资单的对象
	IDSTORAGE+=1;
	mui.plusReady(function() {
		//保存新单数据 以便在详细里面加载
		plus.storage.setItem("n"+IDSTORAGE,data);
		
	});
	if (result.loanType.text == "个人") {
		var temp_name = result.personalName + "(个人贷款)";
	} else {
		var temp_name = result.companyName;
	}
	var html='<div class="newUich">'
		+'<div class="new_div">'
		+'<div class="new_title new-text relative">发现一条新的融资单'
		+	'<span class="close-btn close_icon mainBg"></span>'
		+'</div>'
		+'<div class="new_cont new-text relative my-hr">'
		+	'<span class="new-l">'+temp_name+'</span>'
		+	'<span class="new-r">'+result.loanMoney+'万</span>'
		+'</div>'
		+'<div class="new_cont new-text relative my-hr ">'
		+	'<span class="new-l">'+result.loanUse.text+'</span>'
		+	'<span class="new-r">'+result.loanYear+'年</span>'
		+'</div>'
		+'<div id="n'+IDSTORAGE+'" class="new-detail new_cont new-text relative">'
		+	'<span class="new-more select-icon mainBg"></span>'
		+	'<span class="new-flag"></span>'
		+'</div>'
		+'</div>'
		+'<div class="rush-btn-div">'
		+	'<button name="'+result.id+'" class="mui-bottom rush-btn">立即抢单</button>'
		+'</div>'
		+'</div>';
		if(tap=="add"){  //新单窗口已经打开 增加一条新消息
			//如果有第二条以上消息 则从顶部开始向下显示 去掉margin-top
			//$(".newUich").css("margin-top","0px");
			var old=$("#newList").html();
			$("#newList").html(html+old);
		}else{
			$("#newList").html(html);
		}
}

