// ==UserScript==
// @name         Bilibili 音频模式 [听视频]
// @namespace    xxnuo
// @version      1.0.0
// @description  给播放器上方添加一个音频播放条
// @author       xxnuo
// @match        https://www.bilibili.com/video/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// @run-at       document-start
// @require      https://greasyfork.org/scripts/449444-hook-vue3-app/code/Hook%20Vue3%20app.js
// @require      https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js
// @connect      api.bilibili.com
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";
  const quality = "max"; // or min
  const isHideVideo = false;
  const isHideComment = false;
  const log = (...args) => console.log("[LISTEN] ", ...args);
  const win = typeof unsafeWindow === "undefined" ? window : unsafeWindow;
  const get = (obj, paths) => paths.reduce((prev, path) => (typeof prev === "undefined" ? undefined : prev[path]), obj);
  const playerWarpEle = document.getElementById("playerWrap");

  log("START");

  window._vueUnhooked_ = vueUnhooked;
  window._vueHooked_ = vueHooked;

  log(playerWarpEle);

  const hideBiliPlayer = () => {
    if (isHideVideo) {
      if (playerWarpEle) {
        //   log("process");
        // playerWarpEle.style.display = "none";

        const bilibiliPlayerEle = playerWarpEle.querySelector("#bilibili-player");
        const bilibiliPlayerPlaceholderEle = playerWarpEle.querySelector("#bilibili-player-placeholder");
        if (bilibiliPlayerEle) {
          bilibiliPlayerEle.style.display = "none";
        }
        if (bilibiliPlayerPlaceholderEle) {
          bilibiliPlayerPlaceholderEle.style.display = "none";
          const top = bilibiliPlayerPlaceholderEle.querySelector("#bilibili-player-placeholder-top");
          const bot = bilibiliPlayerPlaceholderEle.querySelector("#bilibili-player-placeholder-bottom");
          top.style.display = "none";
          bot.style.display = "none";
        }
      }
    }
  };
  hideBiliPlayer();

  const hideComment = () => {
    if (isHideComment) {
      const commentEle = document.getElementById("comment");
      if (commentEle) {
        commentEle.style.display = "none";
        // commentEle.remove();
      }
    }
  };
  hideComment();

  let originalPushState = history.pushState;
  history.pushState = function (state) {
    let result = originalPushState.apply(this, arguments);
    let event = new Event("pushstate");
    event.state = state;
    window.dispatchEvent(event);
    return result;
  };

  GM_addElement("link", {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css",
  });

  const aplayerEle = GM_addElement("div", {
    id: "aplayer",
  });
  playerWarpEle.parentElement.insertBefore(aplayerEle, playerWarpEle);

  const listen_aplayer = new APlayer({
    container: document.getElementById("aplayer"),
    // fixed: true,
  });

  const reloadPlayer = () => {
    const curP = get(win, ["__INITIAL_STATE__", "p"]);
    const bvID = get(win, ["__INITIAL_STATE__", "bvid"]);
    const cid = get(win, ["__INITIAL_STATE__", "cidMap", bvID, "cids", curP]);

    const pic = get(win, ["__INITIAL_STATE__", "videoData", "pic"]);
    const author = get(win, ["__INITIAL_STATE__", "videoData", "owner", "name"]);
    const title = get(win, ["__INITIAL_STATE__", "videoData", "title"]);

    if (isHideVideo) {
      const coverEle = GM_addElement("img", {
        id: "listen-cover",
        src: pic,
        alt: title,
        style: `object-fit: scale-down;`,
      });
      playerWarpEle.parentElement.insertBefore(coverEle, playerWarpEle);
    }

    const url = `https://api.bilibili.com/x/player/wbi/playurl?bvid=${bvID}&cid=${cid}&fnval=16`;
    // log("fetch url", url);
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      cookie: true,
      onload: function (response) {
        var res = JSON.parse(response.responseText).data;
        var url;

        if (res.dash) {
          var audios = res.dash.audio;

          if (quality === "max") {
            audios.sort((a, b) => a.bandwidth - b.bandwidth);
          } else if (quality === "min") {
            audios.sort((a, b) => b.bandwidth - a.bandwidth);
          }
          url = audios[0].baseUrl;
        } else {
          url = res.durl[0].url;
        }

        // log("audio url ", url);

        listen_aplayer.list.clear();
        listen_aplayer.list.add({
          name: title,
          artist: author,
          url: url,
          cover: pic,
        });

        console.log("[LISTEN] Bilibili 音频模式 [听视频] 已加载");
      },
    });
  };

  reloadPlayer();

  win.addEventListener("pushstate", reloadPlayer);

  log("END");
})();
