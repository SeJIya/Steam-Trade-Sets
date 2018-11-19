var sCommon = document.createElement('script');
    sCommon.src = chrome.runtime.getURL('js/jquery.js');
    (document.head || document.documentElement).appendChild(sCommon);
    sCommon.onload = function () {
        var sOffer = document.createElement('script');
        sOffer.src = chrome.runtime.getURL('js/checker.js');
        (document.head || document.documentElement).appendChild(sOffer);
        sOffer.onload = function () {
            sOffer.parentNode.removeChild(sOffer);
        };
        sCommon.parentNode.removeChild(sCommon);
    };




	//	var head = document.getElementsByTagName('head').item(0);
   // var script = document.createElement('script');
    //script.setAttribute('type', 'text/javascript');
    //script.setAttribute('src', chrome.runtime.getURL('js/jquery.js'));
    //head.appendChild(script);
		///var head = document.getElementsByTagName('head').item(0);
   // var script = document.createElement('script');
   // script.setAttribute('type', 'text/javascript');
   // script.setAttribute('src', chrome.runtime.getURL('js/checker.js'));
//head.appendChild(script);
		