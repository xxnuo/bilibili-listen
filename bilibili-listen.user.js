// ==UserScript==
// @name         Bilibili 音频模式 [听视频]
// @namespace    xxnuo
// @version      1.0.0
// @description  给播放器添加一个音频播放条
// @author       xxnuo
// @match        https://www.bilibili.com/video/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        unsafeWindow
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";
  const log = (...args) => console.log("[LISTEN] ", ...args);
  const win = typeof unsafeWindow === "undefined" ? window : unsafeWindow;
  log("START");

  //   // 通过播放器获取信息，不使用
  //   const get = (obj, paths) => paths.reduce((prev, path) => (typeof prev === "undefined" ? undefined : prev[path]), obj);

  //   const curP = get(win, ["__INITIAL_STATE__", "p"]);
  //   const totalP = get(win, ["__INITIAL_STATE__", "videoData", "videos"]);
  //   const cid = get(win, ["__INITIAL_STATE__", "videoData", "cid"]);
  //   const pic = get(win, ["__INITIAL_STATE__", "videoData", "pic"]);

  // 直接将播放器干掉并换为音频播放器，省流省资源

  let playerWarpEle = document.getElementById("playerWrap");
  if (playerWarpEle) {
    // 隐藏播放器
    let bilibiliPlayerEle = playerWarpEle.querySelector("#bilibili-player");
    let bilibiliPlayerPlaceholderEle = playerWarpEle.querySelector("#bilibili-player-placeholder");
    if (bilibiliPlayerEle) {
        playerWarpEle.removeChild(bilibiliPlayerEle);
      // bilibiliPlayerEle.style.display = "none";
    }
    if (bilibiliPlayerPlaceholderEle) {
        // playerWarpEle.removeChild(bilibiliPlayerPlaceholderEle);
      bilibiliPlayerPlaceholderEle.style.display = "none";
    }

    let coverUrl = "";
    let cID = "";

    // const metaUrl = document.querySelector('meta[itemprop="url"]');
    const metaUrl = document.querySelector('link[rel="canonical"]');
    const metaImage = document.querySelector('meta[itemprop="image"]');

    if (metaImage) {
      // 获取并格式化封面尺寸
      coverUrl = metaImage.getAttribute("content").split("@")[0];
    } else {
      console.log("LISTEN:Video Cover Image not found on the page.");
      coverUrl = "https://i2.hdslb.com/bfs/space/768cc4fd97618cf589d23c2711a1d1a729f42235.png";
    }

    // let coverEle = document.createElement("img");
    // coverEle.id = "bilibili-listen-cover";
    // coverEle.src = coverUrl;
    // coverEle.style.width = "100%";
    // coverEle.style.height = "100%";
    // coverEle.style.objectFit = "contain";

    // playerWarpEle.appendChild(coverEle);

    let coverHtml = `<img id="bilibili-listen-cover" src="${coverUrl}" style="width: 100%; height: 100%; object-fit: contain;">`;
    playerWarpEle.insertAdjacentHTML("beforeend", coverHtml);

    console.log("LISTEN:metaUrl:", metaUrl);
    if (metaUrl) {
      let videoUrlParts = metaUrl.getAttribute("href").split("/").reverse();
      let bvIDwithP = videoUrlParts.find((part) => part.startsWith("BV")).split("?");
      let bvID = bvIDwithP[0];
      console.log("LISTEN:bvID:", bvID);
      let p = 0;
      if (bvIDwithP[1]) p = bvIDwithP[1];
      // 通过 bvID 获取 cID，接口 //api.bilibili.com/x/player/pagelist?bvid=${bvID} 返回值内 json.data[0].cid

      fetch(`https://api.bilibili.com/x/player/pagelist?bvid=${bvID}`)
        .then((response) => response.json())
        .then((data) => {
          cID = data.data[p].cid;
          console.log("LISTEN:cID:", cID);
        });
    } else {
      console.log("LISTEN:Video ID not found on the page.");
      return;
    }
  } else {
    // 未找到播放器元素
    console.log("LISTEN:Player element not found on the page.");
    return;
  }
})();
