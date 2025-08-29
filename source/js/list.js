/* 
<div class="item">
    <div class="item_info">
        <span class="item_name" href = "song" pro = "play" id = item.id  name =  i></span>
        </br>
        <div class="song_SA">
            <a class="singer" id= item.ar[0].id> item.ar[0].name + '-'</a> <a class="album" id= item.al.id > item.al.name </a>
        </div>
    </div>
    <div class="process">
        <i class="fas fa-play"  href = "song" pro = "play" id = item.id  name = i > item.name </i>
        <i class="fas fa-plus"  href = "song" pro = "plus" id = item.id  name = i></i>
        <i class="fas fa-heart"  href = "song" pro = "heart"' id = item.id  name = i" style ="color : #000000/#E79796"></i>
    </div>
</div>
*/

//将歌曲添加到列表
function appendSongToList(item, i) {
    let itemHtml = '<div class="item"><div class="item_info">';
    itemHtml = itemHtml + '<span class="item_name" href = "song" pro = "play"' + ' id = "' + item.id + '" name = "' + i + '">';
    itemHtml = itemHtml + item.name + '</span></br><div class="song_SA"><a class="singer" id= "' + item.ar[0].id + '">';
    itemHtml = itemHtml + item.ar[0].name + '</a> - <a class="album" id="' + item.al.id + '">' + item.al.name + '</a></div></div><div class="process"><i class="fas fa-play"  href = "song" pro = "play"' + ' id = "' + item.id + '" name = "' + i + '">' + '</i><i class="fas fa-plus"  href = "song" pro = "plus"' + ' id = "' + item.id + '" name = "' + i + '">' + '</i>';
    if (likeList.indexOf(item.id) >= 0) itemHtml = itemHtml + '<i class="fas fa-heart"  href = "song" pro = "heart"' + ' id = "' + item.id + '" name = "' + i + '" style ="color : #E79796">' + '</i></div></div>';
    else itemHtml = itemHtml + '<i class="fas fa-heart"  href = "song" pro = "heart"' + ' id = "' + item.id + '" name = "' + i + '" style ="color : #000000">' + '</i></div></div>';
    listId[i] = item.id;
    $(itemHtml).appendTo(appendToWhere);
}

//将播放列表添加到列表
function appendPlaylistToList(item) {
    let itemHtml = '<div class="item"><div class="item_info">';
    itemHtml = itemHtml + '<span class="item_name" href="playlist"' + ' id = "' + item.id + '">';
    itemHtml = itemHtml + item.name + '</span></br><div class="playlist_author"><a class="author">';
    itemHtml = itemHtml + item.author + '</a></div></div><div class="process"><i class="fas fa-play" href="playlist" href = "playlist" pro = "play"' + ' id = " ' + item.id + '">' + '</i>';
    if (item.subscribed == -1) itemHtml = itemHtml + '<i class="fas fa-star" style ="color : #00000050" href="playlist"' + ' id = "' + item.id + '" href = "playlist" pro = "star">' + '</i></div></div>';
    else if (item.subscribed) itemHtml = itemHtml + '<i class="fas fa-star" style ="color : #E79796" href="playlist"' + ' id = "' + item.id + '"  href = "playlist" pro = "star">' + '</i></div></div>';
    else itemHtml = itemHtml + '<i class="fas fa-star" href="playlist"' + ' id = "' + item.id + '"  href = "playlist" pro = "star">' + '</i></div></div>';
    console.log(itemHtml);
    $(itemHtml).appendTo(appendToWhere);
}

//将专辑添加到列表
function appendAlbumToList(item) {
    let itemHtml = '<div class="item"><div class="item_info">';
    itemHtml = itemHtml + '<span class="item_name" href="album"' + ' id = "' + item.id + '">';
    itemHtml = itemHtml + item.name + '</span></br><div class="album_author"><a class="author">';
    itemHtml = itemHtml + item.author + '</a></div></div><div class="process"><i class="fas fa-play" href="album" href = "album" pro = "play"' + ' id = " ' + item.id + '">' + '</i>';
    console.log(itemHtml);
    $(itemHtml).appendTo(appendToWhere);
}

//将歌单封面照添加到list
function appendPlaylistCoverToList(item) {
    var itemHtml = '<div class="res"><div class="res_cover" id="' + item.id + '" href="playlist" style="background: url(' + item.coverImgUrl + ') no-repeat;"><div class="res_play" id="' + item.id + '" href="playlist"><i class = "fas fa-play" id="' + item.id + '" pro = "play" href="playlist"></i></div></div><div class="res_name" id="' + item.id + '" href="playlist"><a>' + item.name + '</a></div></div>';
    $(itemHtml).appendTo(appendToWhere);
}

//更改列表
function changeList(list_info, items, type, el) {
    if (el.attr("id") == "item_list") {
        listId = [];
        $("#item_list").html('<div class="list_info">播放列表</div>');
        $(".list_info").html(list_info);
    } else if (el.attr("id") == "search_list") {
        $("#search_list").html('<div class="ser_pro_bar"><span class="fas fa-arrow-left" id="arrow" href="backward" onclick="turnResPage(-30)"></span><span class="change_search_method" id = "csm1" href="1" onclick="changeSearchMethod(1)" style="box-shadow: inset 0.2vh 0.2vh 1vh #cdcdcd, inset -0.3vh -0.3vh 0.6vh #ffffff">单曲</span><span class="change_search_method" id = "csm1000" href="1000" onclick="changeSearchMethod(1000)">歌单</span><span class="change_search_method" id = "csm10" href="10" onclick="changeSearchMethod(10)">专辑</span><span class="fas fa-arrow-right" id="arrow" href="forward" onclick="turnResPage(30)"></span></div>');
    }
    console.log(items);
    appendToWhere = el;
    el.css("display", "block");
    if (type == "playlist") items.forEach(appendPlaylistToList);
    else if (type == "song") items.forEach(appendSongToList);
    else if (type == "album") items.forEach(appendAlbumToList);
    else if (type == "playlistCover") {
        el.css("display", "grid");
        items.forEach(appendPlaylistCoverToList);
    }
    initItem();
}

//为列表里的item绑定点击事件
function initItem() {
    $(".item_name").unbind('click').click(function () {
        itemClick($(this));
    });
    $(".process i").unbind('click').click(function () {
        itemClick($(this));
    })
    $(".res_cover").unbind('click').click(function () {
        itemClick($(this));
    })
    $(".res_play").unbind('click').click(function () {
        itemClick($(this));
    })
    $(".res_name").unbind('click').click(function () {
        itemClick($(this));
    })
    $(".res_play i").unbind('click').click(function () {
        itemClick($(this));
    })
    $(".playing_album_cover").unbind('click').click(function () {
        itemClick($(this));
    })
	 // 绑定歌曲名称点击
	    $(".song-item .name").unbind('click').click(function() {
	        itemClick($(this));
	    });
	    
	    // 绑定播放按钮点击
	    $(".song-item .actions .fa-play").unbind('click').click(function() {
	        itemClick($(this));
	    });
	    
	    // 绑定其他按钮点击
	    $(".song-item .actions .fa-plus").unbind('click').click(function() {
	        itemClick($(this));
	    });
	    
	    // 原有的其他绑定保持不变...
	    $(".item_name").unbind('click').click(function () {
	        itemClick($(this));
	    });
	    $(".process i").unbind('click').click(function () {
	        itemClick($(this));
	    });
		// 绑定推荐歌单点击事件
		$(".playlist-card, .playlist-card .name, .playlist-card img").unbind('click').click(function() {
        // 获取最近的带有href属性的父元素
        let target = $(this).closest('[href]');
        if(target.length === 0) target = $(this);
        itemClick(target);
		});
    
		// 绑定推荐歌手点击事件
		$(".artist-card, .artist-card .name, .artist-card img").unbind('click').click(function() {
        let target = $(this).closest('[href]');
        if(target.length === 0) target = $(this);
        itemClick(target);
		});

}

//列表item点击事件
function itemClick(el) {
    let id = el.attr('id');
    let type = el.attr('href');
    let pro = el.attr('pro');
    console.log("点击详情：", {id, type, pro, element: el});
	
	// 处理歌手点击
	    if (type === "artist") {
	        loadArtistSongs(id);
	        return;
	    }
	
	    // 处理歌单点击（无pro属性时默认播放）
	    if (type === "playlist" && !pro) {
	        loadPlaylistSongs(id, 'play');
	        return;
	    }

	
    if (type == "playlist") {
        let api_adr = apiAd + "playlist/detail?" + cookieStr + "&id=" + id;
        let data;
        if (data = ajaxGet(api_adr)) {
            changeList(data.playlist.name, data.playlist.tracks, "song", $("#item_list"));
            $("#item_list").show();
            if (pro == "play") {
                playSongFromId(data.playlist.trackIds[0].id, true);
                localStorage.playingListId = JSON.stringify(playingListId = listId);
                localStorage.playingIndex = playingIndex = 0;
                if (playMethod == 2) shuffle();
            } else if (pro == "star") {
                let t = starAList(id);
                $(this).attr("style", ((t == 2) ? "color: #000000" : "color: #E79796"));
            }
        }
    } else if (type == "song") {
        if (pro == "play") {
            playSongFromId(id, true);
            localStorage.playingListId = JSON.stringify(playingListId = listId);
            localStorage.playingIndex = playingIndex = el.attr('name');
            if (playMethod == 2) shuffle();
        } else if (pro == "plus") {
            playAtNext(id);
        } else if (pro == "heart") {
            let fl = likeASong(id);
            $(this).attr("style", (fl ? "color: #000000" : "color: #E79796"));
        }
    } else if (type == "album") {
        let api_adr = apiAd + "album?" + cookieStr + "&id=" + id;
        let data;
        if (data = ajaxGet(api_adr)) {
            let songs = data.songs;
            changeList(data.album.name, songs, "song", $("#item_list"));
            $("#item_list").show();
            if (pro == "play") {
                playSongFromId(songs[0].id, true);
                localStorage.playingListId = JSON.stringify(playingListId = listId);
                localStorage.playingIndex = playingIndex = 0;
                if (playMethod == 2) shuffle();
            }
        }
    }
    showPlayingList();
}

// 新增函数：加载歌手歌曲
async function loadArtistSongs(artistId) {
  try {
    // 显示加载状态
    $("#artist-modal").fadeIn();
    $("#modal-artist-songs").html('<div class="loading">加载中...</div>');

    const api_adr = `${apiAd}artists?id=${artistId}&${cookieStr}`;
    const response = await fetch(api_adr);
    const data = await response.json();

    if (data.code === 200) {
      // 填充弹窗内容
      $("#modal-artist-name").text(data.artist.name);
      $("#modal-artist-cover").attr("src", data.artist.picUrl);
      
      // 渲染歌曲列表
      const fragment = document.createDocumentFragment();
      data.hotSongs.forEach((song, index) => {
        const item = $(`
          <div class="song-item" data-id="${song.id}">
            <div class="index">${index + 1}</div>
            <div class="info">
              <div class="name">${song.name}</div>
              <div class="artist">${song.ar[0]?.name || '未知歌手'}</div>
            </div>
            <div class="actions">
              <i class="fas fa-play" href="song" pro="play" id="${song.id}"></i>
              <i class="fas fa-plus" href="song" pro="plus" id="${song.id}"></i>
            </div>
          </div>
        `)[0];
        fragment.appendChild(item);
      });
      
      $("#modal-artist-songs").empty().append(fragment);
      
      // 重新绑定事件
      initItem();
    }
  } catch (error) {
    console.error('加载歌手信息失败:', error);
    $("#modal-artist-songs").html('<div class="error">加载失败</div>');
  }
}

// 绑定关闭按钮
$(".modal-close").click(() => {
  $("#artist-modal").fadeOut();
});

// 点击遮罩层关闭
$("#artist-modal").click(function(e) {
  if (e.target === this) {
    $(this).fadeOut();
  }
});

// 新增函数：加载歌单
async function loadPlaylistSongs(playlistId, action = 'play') {
    try {
        showLoading('#item_list');
        const api_adr = `${apiAd}playlist/detail?${cookieStr}&id=${playlistId}`;
        const data = await fetch(api_adr).then(res => res.json());
        
        if (data.code === 200) {
            changeList(data.playlist.name, data.playlist.tracks, "song", $("#item_list"));
            if (action === 'play') {
                playSongFromId(data.playlist.tracks[0].id, true);
            }
        }
    } catch (err) {
        console.error('加载歌单失败:', err);
        showError('#item_list', '加载失败');
    }
}

// 辅助函数
function showLoading(selector) {
    $(selector).html('<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i>加载中...</div>').show();
}

function showError(selector, msg) {
    return $(selector).html(`<div class="error">${msg}</div>`);
}

//下一首播放
function playAtNext(id) {
    if (playMethod == 2) {
        let ori = playingListId.indexOf(parseInt(id), 0);
        let des = shuffledPlayingIndexs[parseInt(playingIndex)] + 1;
        if (id == shuffledPlayingIndexs[playingIndex] || (ori == des && shuffledPlayingIndexs[playingIndex + 1] == ori)) return;
        if (ori) {
            playingListId.splice(ori, 1);
            playingListId.splice(des, 0, parseInt(id));
            if (shuffledPlayingIndexs.indexOf(ori) < parseInt(playingIndex)) playingIndex = parseInt(playingIndex) - 1;
            shuffledPlayingIndexs.splice(shuffledPlayingIndexs.indexOf(ori), 1);
            if (ori > des) {
                for (let i = 0; i < shuffledPlayingIndexs.length; i++) {
                    if (shuffledPlayingIndexs[i] >= des && shuffledPlayingIndexs[i] < ori)
                        shuffledPlayingIndexs[i]++;
                }
            } else if (ori < des) {
                for (let i = 0; i < shuffledPlayingIndexs.length; i++) {
                    if (shuffledPlayingIndexs[i] < des && shuffledPlayingIndexs[i] > ori)
                        shuffledPlayingIndexs[i]--;
                }
                des--;
            }
        } else {
            playingListId.splice(des, 0, parseInt(id));
            for (let i = 0; i < shuffledPlayingIndexs.length; i++) {
                if (shuffledPlayingIndexs[i] >= des)
                    shuffledPlayingIndexs[i]++;
            }
        }
        shuffledPlayingIndexs.splice(parseInt(playingIndex) + 1, 0, des);
    } else {
        if (id == playingListId[playingIndex]) return;
        let ind = playingListId.indexOf(parseInt(id), 0);
        if (ind) playingListId.splice(ind, 1);
        playingListId.splice(playingIndex + 1, 0, parseInt(id));
    }
}

//从id获取歌曲
function getSongsFromTrackIds(ids) {
    let api_adr = apiAd + "song/detail?" + cookieStr + "&ids=" + ids;
    let data;
    if (data = ajaxGet(api_adr)) listSongs = data.songs;
}	

// 显示列表
function showList() {
    document.querySelector('.list').classList.add('active');
    document.querySelector('.list-overlay').style.display = 'block';
    
    // 绑定点击遮罩层关闭
    document.querySelector('.list-overlay').onclick = closeList;
    
    // 防止点击列表内部传播到遮罩层
    document.querySelector('.list').onclick = function(e) {
        e.stopPropagation();
    };
}

// 关闭列表
function closeList() {
    document.querySelector('.list').classList.remove('active');
    document.querySelector('.list-overlay').style.display = 'none';
}