chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request == "getCookies"){
		checkUserLogin(request, sender, sendResponse);
	};
	return true;
});

function checkUserLogin(request, sender, sendResponse){
	chrome.cookies.getAll({'url': "https://steamcommunity.com"}, function (cookies){
		let sessionid = "";
		for(let i = 0; i< cookies.length; i++){
			let name = cookies[i].name;
			let value = cookies[i].value;
			if(name == 'sessionid'){
				sessionid = value;
			}
		}
		sendResponse({sessionid});
	});
}