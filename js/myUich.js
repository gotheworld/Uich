//添加自定义事件监听 改变消息按钮
window.addEventListener('myUichFire', function(event) {
	myUichMain(event.detail.tap);
});
myUichMain();

function myUichMain(tap) {
	mui.plusReady(function() {
		mui.init();
		if(tap!="noCloseDetail"){closeWindows("uichDetail");}//tap存在的时候 不关闭uichDetail页面 列如状态改变时
		if(tap=="noCloseNewUich"||tap=='noCloseNewUichAndNewUichDe'){
		}else{ 
			closeWindows('newUich');//关闭弹出抢单窗口 页面 如果存在
			closeWindows('rushNewDetail');//关闭弹出抢单窗口 详细页面 如果存在
		}
		closeWindows('rushDetail');//如果是抢单详细进入此页面 则进入后关闭之
		var upage = 1; //初始化未完成页数
		var dpage = 1; //初始化已完成页数
		//获取经理id
		var managerInfoId = plus.storage.getItem("managerInfoId");
		//alert(managerInfoId); 
		//第一次载入页面ajax获取数据 未完成和已完成
		GetMyUichlist("main", "list_Unfinished");
		GetMyUichlist("main", "list_done");
		//添加li点击事件 
		mui(".mui-table-view").off("tap");
		mui(".mui-table-view").on('tap', '.mui-table-view-cell', function() {
			//获取id
			var id = this.getAttribute("id");
			//console.log(id);
			
			mui.openWindow({
				id: 'uichDetail',
				url: 'uichDetail.html',
				extras: {
					num: id
				},
				show: {
					autoShow: false
				}
			});
		});
		/* ajax请求数据函数 并且输出到dom中 
		 * @flag down:下拉刷新 up上拉加载
		 * @htmlId:输出到html节点的id
		 * @下拉或者上拉刷新传入的dom对象  为空代表
		 */

		function GetMyUichlist(f, htmlId, th) {

			var page = 0;
			if (htmlId == "list_Unfinished") {
				var url = getUrl("financingSingle/getListUnfinishedApi");
				var status = ""; //这里暂时用已签约代替 未完成状态
				var flag = "u"; //储存记号
			} else {
				var url = getUrl("financingSingle/getFinancingSingleListApi");
				var status = "LOANSUCCESS"; //已签约 因为没有已签约数据 暂时用NEW代替
				var flag = "d"; //储存记号
			}
			if (f == "main") {
				//var waitws = plus.nativeUI.showWaiting(); //打开等待圈
				var html = "";
				page = 1;
			}

			if (f == "down") { //向下刷新
				var html = "";
				//各自初始化page参数
				if (htmlId == "list_Unfinished") {
					upage = 1; //刷新时页数重置为1
					page = upage;
				}
				if (htmlId == "list_done") {
					dpage = 1; //刷新时页数重置为1
					page = dpage;
				}
			}
			if (f == "up") {
				var ws = plus.nativeUI.showWaiting();
				//console.log("1");
				var html = document.getElementById(htmlId).innerHTML;
				if (htmlId == "list_Unfinished") {
					upage += 1; //下拉 页数增加1
					page = upage; 
				}
				if (htmlId == "list_done") {
					dpage += 1; //下拉 页数增加1
					page = dpage;
				}
			}
			var row = 6; //每页显示条数
			var FKEY = getkey(); //获取秘钥  
			var mydata = {
				FKEY: FKEY,
				singleStatus: status, //暂时使用这个状态测试
				rows: row,
				order: "desc",
				sort: "fs.create_time",
				page: page,
				managerInfoId: managerInfoId
			};
			mui.ajax(url, {
				data: mydata,
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					//服务器返回响应，根据响应结果，分析是否登录成功；
					if (data.flag) {
						//保存经理id 后面上传头像用到
						var len = data.data.result.length;
						var num = (page - 1) * row; // num+i 生成一个依次递增的id 方便储存和读取
						for (var i = 0; i < len; i++) {
							var obj = data.data.result[i];
							plus.storage.setItem(flag + (num + i), JSON.stringify(obj)); //保存每一条数据
							if (obj.loanType.loanType == "ENTERPRISE") {
								var temp_name = obj.companyName;
								var my_Name = obj.legalPerson;
							} else {
								var temp_name = "个人贷款";
								var my_Name = obj.personalName;
							}

							html += "<li id='" + flag + (num + i) + "' class='mui-table-view-cell'>" + "<div class='list-div'>" + "<div class='list-div-up'>" + "<div class='list-1 mui-pull-left'>" + "<div class='l-name'>" + temp_name + "</div>" + "<div class='l-head'>" + "<span class='l-text'>" + my_Name + "</span><span class='l-text'>" + obj.phone + "</span>" + "</div>" + "</div>" + "<div class='list-2 mui-pull-left'>" + "<div class='mymoney'>¥" + obj.loanMoney + "(万)</div>" + "<div class='myyt'>(" + obj.loanUse.text + ")</div>" + "</div>" + "<div class='list-3 mui-pull-right mainBg'>" + "</div>" + "<div class='mui-clearfix'></div>" + "</div>" + "<div class='list-div-down'>" + "<div class='mui-pull-left status-btn'>" + obj.singleStatus.text + "</div>" + "<div class='mui-pull-left myyear'>" + "(" + obj.loanYear + "年)" + "</div>" + "<div class='mui-pull-right mytime'>" + "<span class='time-icon mainBg mui-pull-left'></span><span class='time-span'>" + getTime(obj.createTime) + "</span>" + "</div>" + "<div class='mui-clearfix'></div>" + "</div>" + "</div>" + "</li>";
						}
						document.getElementById(htmlId).innerHTML = html;
						if (f == "main") {
							if (len == 0) document.getElementById(htmlId).innerHTML = getNullHtml();
						}
						if (f == "down") {
							if (len == 0) document.getElementById(htmlId).innerHTML = getNullHtml();
							mui.toast("刷新成功");
							th.endPullDownToRefresh();
							th.refresh(true);
						}
						if (f == "up") {
							setTimeout(function() {
								ws.close();
							}, 600);
							if (len == 0) {
								mui.toast("没有更多了");
								th.endPullUpToRefresh(true); //关闭下拉加载 显示没有更多
							} else {
								th.endPullUpToRefresh();
							}
						}
						$(".mui-pull-bottom-tips").css("display", "none"); //隐藏下拉加载字样
					} else {
						//alert(1);
						//mui.toast("获取失败"+data.msg);
						if (th) { 
							if (f == "down") {
								th.endPullDownToRefresh();
							}
							if (f == "up") {
								ws.close();
								th.endPullUpToRefresh();
							}
						}
						if (data.msg = "没有获取到相关数据") {
							if (f != "main" || (f == "main" && htmlId == "list_Unfinished")) {
								//mui.toast("暂无数据");
								document.getElementById(htmlId).innerHTML = getNullHtml();
							}
							if (f == "down") {
								mui.toast("刷新成功");
								document.getElementById(htmlId).innerHTML = getNullHtml();
							}
						} else {
							mui.toast("获取失败" + data.msg);
						}
						if (f == "down") {
							th.refresh(true);
						}
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					mui.toast('获取数据失败，请检查网络连接');
					th.endPullDownToRefresh();
					th.endPullUpToRefresh();
				}
			});
		}
		//阻尼系数
		var deceleration = mui.os.ios ? 0.003 : 0.0009;
		mui('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: true, //是否显示滚动条
			deceleration: deceleration
		});
		//循环初始化所有下拉刷新，上拉加载。
		mui.ready(function() {
			mui.each(document.querySelectorAll('.mui-slider-group .mui-scroll'), function(index, pullRefreshEl) {
				mui(pullRefreshEl).pullToRefresh({
					down: {
						callback: function() {
							var self = this;
							setTimeout(function() {
								var ul = self.element.querySelector('.mui-table-view');
								//当前选项卡 ul的id
								var listId = ul.getAttribute("id");
								GetMyUichlist("down", listId, self);
							}, 1000);
						}
					},
					up: {
						contentrefresh: "正在加载...",
						callback: function() {
							var self = this;
							setTimeout(function() {
								var ul = self.element.querySelector('.mui-table-view');
								//当前选项卡 ul的id
								var listId = ul.getAttribute("id");
								GetMyUichlist("up", listId, self);
							}, 1000);
						}
					}
				});
			});
		});
	});
}