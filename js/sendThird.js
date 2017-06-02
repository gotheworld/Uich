mui.plusReady(function() {
	//var singleId=plus.storage.getItem("singleId");
	var self = plus.webview.currentWebview();
	var typeId = self.typeId;
	var dt = plus.storage.getItem(typeId);
	var result = JSON.parse(dt); //获取该融资单的对象
	document.getElementById("typeName").innerHTML = result.productionType.text + "-" + result.name;
	document.getElementsByClassName("t-money")[0].innerHTML = result.loanSum + "(万元)";
	document.getElementsByClassName("t-Condition")[0].innerHTML = result.loanCondition;
	document.getElementById('send-btn').addEventListener('tap', function() {
		//closeMenuList(); //关闭右上角弹出菜单
		mui.openWindow({
			url: "send.html",
			id: "send",
			extras: {
				typeId: typeId
			},
			show: {
				aniShow:"pop-in"
			}
		});
	});
});