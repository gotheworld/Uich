mui.plusReady(function() {
	//获取位置信息后上传照片
	mui.init({
		beforeback: function() {
			//console.log(1);
			var uichDetail = plus.webview.getWebviewById("uichDetail");
			mui.fire(uichDetail, "uichDetailFire", null);
			return true;
		}
	});

	var self = plus.webview.currentWebview();
	var num = self.num;
	var NowStatu = self.NowStatu; //当前融资单状态
	var dt = plus.storage.getItem(num);
	var result = JSON.parse(dt); //获取该融资单的对象
	var loanType = result.loanType;
	var loanUse = result.loanUse;
	var financingSingleId = plus.storage.getItem("financingSingleId");

	document.getElementsByClassName("u-type-text")[0].innerHTML = loanType.text + "-" + loanUse.text;
	if(loanType.loanType == "PERSONAL" && loanUse.loanUse == "CONSUMPTION" || loanType.loanType == "PERSONAL" && loanUse.loanUse == "MORTGAGE") {
		document.getElementById("imgType-1").innerHTML = "住所";
		document.getElementsByClassName("home-icon")[0].style.display = "block";
	} else {
		document.getElementById("imgType-1").innerHTML = "经营场所";
		document.getElementsByClassName("u-typebtn2")[0].style.marginLeft = "-64px";
		document.getElementsByClassName("jjcs-div")[0].style.display = "block";
	}
	var li_width = ($(window).width() - 60) / 4;
	$(".pic-ul li img").css("width", li_width);
	$(".pic-ul li img").css("height", li_width);
	$(".btn-width").css("width", li_width);
	$(".btn-width").css("height", li_width);
	loadPic('A');
	loadPic('B');
	var haveHistoryImgA = false;
	var haveHistoryImgB = false;

	var my_ID = null; //面访记录版本号 id 和version
	var my_Version = 0;

	function loadPic(type) {
		//获取已经上传的图片
		var url = getUrl("financingSingleFile/getFileApi");
		var FKEY = getkey(); //获取秘钥
		var temp = 0;
		if(type == "A") { //区分图片类型
			temp = 0;
			if(document.getElementById("imgType-1").innerHTML == "住所") {
				var financingFileType = "RESIDENCE"; //住所
			} else {
				var financingFileType = "OPERATEPLACE"; //经营产所
			}

		} else {
			temp = 2;
			var financingFileType = "MORTGAGED"; //抵押物
		}
		//console.log(financingSingleId);	
		//console.log(financingFileType);
		var mydata = {
			FKEY: FKEY,
			financingSingleId: financingSingleId,
			financingFileType: financingFileType
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if(data.flag) {
					var result = data;
					console.log(JSON.stringify(result));
					var html = '';
					var base = result.fileBaseUrl;
					if(result.data.length) {
						if(type == "A") {
							haveHistoryImgA = true;
						} else {
							haveHistoryImgB = true;
						}
					}
					for(var i = 0; i < result.data.length; i++) {
						var obj = result.data[i];
						html += '<li name="' + obj.id + '" class="historyImg"><img width=' + li_width + ' height=' + li_width + ' src="' + base + obj.fileUrl + '" data-preview-src="" data-preview-group="1" /></li>';
					}
					//console.log(html); 
					html += document.getElementsByClassName('pic-ul')[temp].innerHTML;
					document.getElementsByClassName('pic-ul')[temp].innerHTML = html;
					if(type == 'A' && data.interViewRecord) {
						
						document.getElementById("remark").value = data.interViewRecord.content;
						my_ID = data.interViewRecord.id;
						my_Version = data.interViewRecord.version;
						//console.log(my_ID+"/"+my_Version);
					}
					setTimeout(function() {
						plus.nativeUI.closeWaiting();
					}, 400);
					mui.currentWebview.show('pop-in');
				} else {
					plus.nativeUI.closeWaiting();
					mui.currentWebview.show('slide-in-right');
					mui.toast("获取失败");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting();
				mui.currentWebview.show('slide-in-right');
				console.log('获取数据，请检查网络连接' + errorThrown);
			}
		});
	}

	var imgArrayA = []; //储存批量上传的图片
	var imgArrayB = []; //储存批量上传的图片

	//绑定上传按钮的事件
	mui(".my-content").on('tap', '.btn-width', function() {
		showActionSheet(this);
	});
	//绑定已经上传的图片的删除事件	
	mui(".my-content").on('longtap', '.historyImg', function() {
		addEvent(this, 'history');
	});
	//绑定长按删除事件
	function addEvent(th, tap) {
		if(!$(th).children("img").length) return;
		var th_t = th;
		var btnArray = ['否', '是'];
		mui.confirm('是否取消删除这张图片？', 'Uich', btnArray, function(e) {
			if(e.index == 1) {
				var url = $(th_t).children("img").attr("src");
				//删除数组中的url
				if($.inArray(url, imgArrayA) != -1) {
					imgArrayA.splice($.inArray(url, imgArrayA), 1);
				}
				if($.inArray(url, imgArrayB) != -1) {
					imgArrayB.splice($.inArray(url, imgArrayB), 1);
				}
				//删除界面中图片
				$(th_t).remove();
				if(tap == 'history') {
					var id = $(th_t).attr("name");
					deleteHistoryImg(id);
				}
			}
		})
	}

	function deleteHistoryImg(id) {
		var url = getUrl("financingSingleFile/delUploadApi");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			financingSingleFileId: id,
		};
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if(data.flag) {
					mui.toast("删除成功");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log('获取数据，请检查网络连接' + errorThrown);
				mui.toast('删除失败，请检查网络连接');
			}
		});
	}
	var COUNT = 0; //记录上传当前次数
	var COUNTAll = 0; //记录上传总次数
	var wt = null;
	var remark = ''; //备注
	var addresses = null; //记录当前详细位置
	document.getElementById('upload-btn').addEventListener('tap', function() {
		remark = document.getElementById("remark").value;
		console.log(remark);
		wt = plus.nativeUI.showWaiting(); //打开等待窗口
		var imgACount = $(".imgA img").length;
		var imgBCount = $(".imgB img").length;
		if(imgACount < 3) {
			mui.toast("[" + document.getElementById("imgType-1").innerHTML + "]图片应至少3张");
			wt.close();
			return;
		}
		if(imgBCount != 0 && imgBCount < 3) {
			mui.toast("如果有，[抵押物]图片应至少3张");
			wt.close();
			return;
		}
		if(imgArrayA == 0 && imgArrayB == 0) {
			mui.toast("您没有新增图片，请增加图片后上传");
			wt.close();
			return;
		}
		//获取位置信息后上传照片
		var geolocation = new BMap.Geolocation();
		var gc = new BMap.Geocoder();
		geolocation.getCurrentPosition(function(r) {
			if(this.getStatus() == BMAP_STATUS_SUCCESS) {
				var latitude = r.point.lat;
				var longitude = r.point.lng;
				console.log(latitude + "/" + longitude);
				var pt = r.point;
				gc.getLocation(pt, function(rs) {
					var addComp = rs.addressComponents;
					addresses = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
					if(imgArrayA) {
						COUNTAll += 1;
						uploadImg(imgArrayA, "A");
					}
					if(imgArrayB) {
						COUNTAll += 1;
						uploadImg(imgArrayB, "B");
					}
				});
			} else {
				alert('获取位置失败,请重试');
			}
		});
	});

	//预约面访弹出菜单实现
	function showActionSheet(th) {
		var bts = [{
			title: "拍照"
		}, {
			title: "从手机相册获取"
		}];
		plus.nativeUI.actionSheet({
				title: "图片上传",
				cancel: "取消",
				buttons: bts
			},
			function(e) {
				if(e.index == 1) { //拍照
					getImage(th);
				} else if(e.index == 2) { //本地获取
					galleryImg(th);
				}
			}
		);
	}
	//拍照
	function getImage(th) {
		var cmr = plus.camera.getCamera();
		cmr.captureImage(function(path) {
			//console.log(plus.io.convertLocalFileSystemURL(path));
			var url = "file://" + plus.io.convertLocalFileSystemURL(path);
			showImg(url, th); //显示到相应位置并且把url储存到数组
		}, function(e) {
			mui.toast("取消拍照");
		});
	}
	// 从相册中选择图片 
	function galleryImg(th) {
		// 从相册中选择图片
		plus.gallery.pick(function(path) {
			var url = path;
			//console.log(url);
			showImg(url, th); //显示到相应位置并且把url储存到数组

		}, function(e) {
			console.log("取消选择图片");
		}, {
			filter: "image"
		});
	}
	//上传图片
	function upload() {
		//compressImage(imgArrayA);
		//compressImage(imgArrayB);
	}
	//压缩图片和上传 
	function compressImage(url, arr, th) {
		var date_str = getDateString();
		var picName = "_doc/" + date_str + getUid() + '.jpg';
		plus.zip.compressImage({
				src: url,
				dst: picName,
				quality: 30,
				width: '50%'
			},
			function(img) {
				var url = img.target;
				arr.push(url);
				var html1 = "<img src='" + url + "'" + "width='" + li_width + "'" + "height='" + li_width + "'" + " data-preview-src='' data-preview-group='1' />";
				var html = "<li class='more'>" + "<button class='btn-width more-btn mainBg'></button>" + "</li>";
				$(th).parents("ul").append(html);
				$(".btn-width").css("width", li_width);
				$(".btn-width").css("height", li_width);
				var obj = $(th).parent();
				$(th).parent().html(html1);
				$(th).parent().addClass("list"); //增加list class 以便统计图片数目 和绑定删除事件
				$(th).parent().removeClass("more"); //删除more class
				//var pa = $(th).parent();
				obj[0].addEventListener('longtap', function() {
					addEvent(this);
				});
			},
			function(error) {
				alert("Compress error!" + error.code);
			}
		);
	}

	/*
	 * 上传到服务器
	 * @arr:图片url数组
	 */
	function uploadImg(arr, type) {
		var serverUrl = getUrl("financingSingleFile/uploadApi");
		var task = plus.uploader.createUpload(serverUrl, {
				method: "POST"
			},
			function(t, status) {
				// 上传完成
				if(status == 200) { // 上传完成
					console.log("上传成功" + t.responseText);
					COUNT += 1;
					if(COUNT == COUNTAll) {
						uploadRemark(type); //上传面访记录
						if(NowStatu == 'BESPEAKED') { // 如果当前状态为已预约 才进行状态改为已面访 
							changeStatusAjax('INTERVIEWED', '已面访');
						} else { //其他状态补传照片 不改变状态
							plus.nativeUI.closeWaiting();
							var bts = ["返回", "继续上传"];
							plus.nativeUI.confirm("上传成功", function(e) {
								var i = e.index;
								if(i == 0) {
									mui.back();
								} else {
									console.log(1);
									imgArrayB = [];
									imgArrayA = [];
								}
							}, "", bts);
						}
					}
				} else {
					alert("Upload failed: " + t.responseText);

					mui.toast("上传失败，出了点小故障");
				}
			}
		);
		task.addData("financingSingleId", financingSingleId.toString());
		if(addresses) {
			task.addData("address", addresses.toString());
		} else {
			task.addData("address", "未知位置");
		}

		task.addData("FKEY", getkey());
		if(type == "A") { //区分图片类型
			if(document.getElementById("imgType-1").innerHTML == "住所") {
				var tempType = "RESIDENCE"; //住所
			} else {
				var tempType = "OPERATEPLACE"; //经营产所
			}

		} else {
			var tempType = "MORTGAGED"; //抵押物
		}
		task.addData("financingFileType", tempType);
		var numLen = arr.length;
		task.addData("num", numLen.toString());
		for(var i = 0; i < arr.length; i++) {
			var t = arr[i];
			task.addFile(t, {
				key: "file" + i,
				name: t.substring(t.length - 15)
			});
		}
		task.start();
	}
	//获取照片 显示到ul中 并且把url压缩后地址储存到数组
	function showImg(url, th) {
		if($(th).parent().parent().parent().attr("id") == "more") { //判断是哪个类型下面的图片
			compressImage(url, imgArrayB, th); //压缩
		} else {
			compressImage(url, imgArrayA, th); //压缩
		}

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
				if(data.flag) {
					plus.nativeUI.closeWaiting();
					//本地数据修改状态
					var num = plus.storage.getItem("num"); //获取该融资单保存时的num
					var dt = plus.storage.getItem(num);
					var result = JSON.parse(dt); //获取该融资单的对象
					result.singleStatus.text = text;
					result.singleStatus.singleStatus = value;
					plus.storage.setItem(num, JSON.stringify(result));

					var myUich = plus.webview.getWebviewById("myUich");
					mui.fire(myUich, "myUichFire", {
						tap: "noCloseDetail"
					}); //传入tap参数 不需要关闭uichdetail
					var uichDetail = plus.webview.getWebviewById("uichDetail");
					mui.fire(uichDetail, "uichDetailFire", null); //传入tap参数 不需要关闭uichdetail
					var bts = ["返回", "继续上传"];
					plus.nativeUI.confirm("上传成功", function(e) {
						var i = e.index;
						if(i == 0) {
							mui.back();
						} else {
							console.log(2);
							imgArrayB = [];
							imgArrayA = [];
						}
					}, "", bts);

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

	function uploadRemark(type) {
		if(remark == '' || type == 'B') { //备注为空 或者上传抵押物退出  备注只需要上传一次
			return;
		}
		console.log(remark);
		console.log(my_ID);
		var url = getUrl("interViewRecord/saveInterViewRecord");
		var FKEY = getkey(); //获取秘钥
		var mydata = {
			FKEY: FKEY,
			financingSingleId: plus.storage.getItem("financingSingleId"),
			content: remark,
			version: my_Version
		};
		if(my_ID) {
			mydata.id = my_ID;
		}
		console.log(JSON.stringify(mydata));
		mui.ajax(url, {
			data: mydata,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				//服务器返回响应，根据响应结果，分析是否登录成功；
				if(data.flag) {
					console.log("面访记录上传成功");
				} else {
					console.log("面访记录上传失败");
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log('获取数据，请检查网络连接' + errorThrown);
			}
		});
	}
});
// 产生一个随机数
function getUid() {
	return Math.floor(Math.random() * 1000).toString();
}