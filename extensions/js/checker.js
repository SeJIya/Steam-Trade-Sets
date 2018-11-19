const set_data = chrome.runtime.getURL('set_data.json');
let rgInventory = {};
let rgDescriptions = {};
let sets = {}
$(document).ready(function() {
    chrome.runtime.sendMessage('getCookies', async function(response) {
        let inventory_ctn = $('.inventory_ctn')[2];
        let partner = $(inventory_ctn).attr('id');
        let profile = partner.split('_')[1];
        await getInventory(profile, response.sessionid).then(async function(){
            sets = await getSet();
            let app753 = 0;
            let getitems = setInterval(() => {
                app753 = $($('#' + partner)[0]).find('.app753').length
                if(app753 > 0){
                    clearInterval(getitems);
                    let keylen = Object.keys(sets).length;
                    if (keylen > 0){
                        let header = $('#tradeoffer_addmessage');
                        $(header).prepend('<div id="allsets"><div id="blackinv"></div></div>');
                        for(key in sets){
                            let count = sets[key].length;
                            $('#blackinv').prepend('<div class="itemHolder" id="'+ key +'"><div class="countwrap"><div class="count">' + count + '</div></div><div class="sets" style="background: url(\'https://steamcommunity-a.akamaihd.net/economy/boosterpack/' + key + '\'); background-size: contain; background-position-x: center; background-position-y: 6px; background-repeat: no-repeat;"></div></div>');
                        } 
                        let nedd = 4 - (keylen % 4);
                        for(let i = 0; i< nedd;  i++){
                            $('#blackinv').append('<div class="itemHolder disabled"></div>');
                        }
                    }
                }
            }, 200);

            $(document).on('click', '.sets, .countwrap', function(){ 
                let par =  $(this).parents('.itemHolder')[0];
                let id = $(par).attr('id');
                setToTrade(id);
                let count = sets[id].length;
                let el = $(par).find('.count')[0];
                $(el).text(count);
            }); 
        });
    });
});

function getInventory(profile, sessionid, start = 0){
    return new Promise(function(resolve, reject){
        $.ajax({
            type:'GET',
            url:'https://steamcommunity.com/tradeoffer/new/partnerinventory/?sessionid=' + sessionid + '&partner=' + profile + '&appid=753&contextid=6&start=' + start,
            xhrFields: {
                withCredentials: true
            },
            response:'json',
            success:async function (data) {
                if(data.success){
                    rgInventory = Object.assign(data.rgInventory, rgInventory);
                    rgDescriptions = Object.assign(data.rgDescriptions, rgDescriptions);
                    if(data.more){
                        await resolve(getInventory(profile, sessionid, data.more_start));
                    }else{
                        resolve(true);
                    }
                }
            }	
        });
    })
}

function getSet(){
    return new Promise(function(resolve, reject){
        let onlycards = [];
        for (var key in rgDescriptions) {
            if (rgDescriptions.hasOwnProperty(key)) {
                let tegs = rgDescriptions[key].tags;
                let tagsString = "";
                for(let i = 0; i < tegs.length; i++){
                    tagsString += tegs[i].internal_name + ' ';
                }
                if(tagsString.indexOf('cardborder_0') > -1 && tagsString.indexOf('item_class_2') > -1){
                    onlycards.push(rgDescriptions[key]);
                }
            }
        }
        let cardtogame = {};
        for(let i = 0; i < onlycards.length; i++){
            let appid = onlycards[i].market_fee_app;
            if(typeof cardtogame[appid] === 'undefined'){
                let teamArray = [];
                let name  = [];
                for(let j = 0; j < onlycards.length; j++){
                    let tmpappid = onlycards[j].market_fee_app;
                    let tmpname = onlycards[j].market_hash_name;
                    if(tmpappid == appid && name.indexOf(tmpname) == -1){
                        name.push(tmpname);
                        teamArray.push(onlycards[j]);
                    }
                }
                cardtogame[appid] = teamArray;
            }
        }
        let classcards = {};
        for (let key in rgInventory) {
            if (rgInventory.hasOwnProperty(key)) {
                let classid = rgInventory[key].classid;
                if(typeof classcards[classid] === 'undefined'){
                    let teamArray = [];
                    for (let key2 in rgInventory) {
                        if (rgInventory.hasOwnProperty(key2)) {
                            let tmpclassid = rgInventory[key2].classid;
                            if(tmpclassid == classid){
                                teamArray.push(rgInventory[key2]);
                            }
                        }
                    }
                    classcards[classid] = teamArray;
                }
            }
        } 

        fetch(set_data).then((response) => response.json()).then(function(data){
            let sets = data.sets;
            let allsets = {};
            for (let key in cardtogame) {
                if (cardtogame.hasOwnProperty(key)) {
                    for(let i = 0; i < sets.length; i++){
                        let appid = sets[i].appid;
                        if(key == appid){
                            let cardcount = sets[i].normal.count;
                            let invCardCount = cardtogame[key].length;
                            if(cardcount == invCardCount){
                                allsets[key] = cardtogame[key];
                            }
                            i += sets.length
                        }
                    }
                }
            }
            let min;
            let allcardtosets = {};
            for (let key in allsets) {
                if (allsets.hasOwnProperty(key)) {
                    let array = allsets[key]; 
                    let cardtosets = [];
                    min = classcards[array[0].classid].length;
                    for(let i = 0; i < array.length; i++){
                        let classid = array[i].classid;
                        cardtosets.push(classcards[classid]);
                        let count = classcards[classid].length;
                        if (min > count){
                            min = count;
                        }
                    }
                    allcardtosets[key] = {count: min, cards: cardtosets};
                }
            }
            let mainsets = {};
            for (let key in allsets) {
                if (allsets.hasOwnProperty(key)) {
                    let count =  allcardtosets[key].count;
                    let cards = allcardtosets[key].cards;
                    let tosets = [];
                    let tosetsArr = [];
                    for(let i = 0; i < count; i++){
                        tosets = [];
                        for(let i = 0; i < cards.length; i++){
                            let allcard = cards[i].shift();
                            tosets.push({"appid": "753", "contextid": "6", "amount": 1, "assetid": allcard.id});
                        }
                        tosetsArr.push(tosets);
                    }
                    mainsets[key] = tosetsArr;
                }
            }
            resolve(mainsets);
        });
    })
}

function setToTrade(app){
    $('#addsets').remove();
    let str = "";
    if(sets[app].length > 0){
        let cardset = sets[app].shift();
        for(let i = 0; i< cardset.length; i++){
            let assetid = cardset[i].assetid;
            let appid = cardset[i].appid;
            let contextid = cardset[i].contextid;
            let item = "MoveItemToTrade($J('#item" + appid + "_" + contextid + "_" + assetid + "')[0]);";
            str += item;
        }
        $('head').append('<script id="addsets" type="text/javascript">' + str + '</script>');   
    }    
}