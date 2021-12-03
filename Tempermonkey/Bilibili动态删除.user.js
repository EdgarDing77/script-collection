// ==UserScript==
// @name         B站动态删除
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  可以批量删除B站动态
// @author       EdgarDing
// @match        https://*.bilibili.com/*
// @grant        unsafeWindow
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==
$(function(){
    'use strict';

    let a = document.querySelector("#internationalHeader > div > div > div.nav-link > ul > li:nth-child(5)");
    let but = document.createElement("button");
    but.innerHTML = '清除动态';
    but.onclick = function() {
        console.log("点击成功");
        main();
    }
    a.replaceChild(but, a.firstChild);

    let Dids = [];
    let count = 0;

    function getAttr(str, regex) {
        let m;
        if ((m = regex.exec(str)) !== null) {
            return m[1];
        }
        return null;
    }

    function del(id, csrf) {
        let data = "dynamic_id=" + id + "&csrf_token=" + csrf + "&csrf=" + csrf;
        $.ajax({
            type: "POST",
            xhrFields: {
                withCredentials: true
            },
            url: "https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/rm_dynamic",
            data: data,
            success: function () {
                count++;
            }
        })
    }

    function allDel(cookie) {
        let csrf = getAttr(cookie, /bili_jct=([^;]+)/gm);
        console.log(csrf);
        for (let i = 0; i < Dids.length; i++) {
            const id = Dids[i];
            del(id, csrf);
        }
        location.reload()
    }

    function load(id, Did, cookie) {
        $.ajax({
            type: "GET",
            xhrFields: {
                withCredentials: true
            },
            url: "https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?visitor_uid=" + id + "&host_uid=" + id + "&offset_dynamic_id=" + Did + "&need_top=1",
            success: function (data) {
                let cards = data["data"]["cards"];
                if (!data["data"]["has_more"]) {
                    allDel(cookie);
                    return;
                }
                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i];
                    Dids.push(card["desc"]["dynamic_id_str"]);
                }
                load(id, Dids[Dids.length - 1], cookie)
            }
        })
    }

    function main() {
        let cookie = document.cookie;
        let id = getAttr(cookie, /DedeUserID=([^;]+)/gm);
        load(id, 0, cookie);
        console.log("删除数目" + count);
    }
});