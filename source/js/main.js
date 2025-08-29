// 变量声明
let apiAd = localStorage.apiAd || "http://139.9.223.233:3000/"; // 内置默认API地址
let loginMethod = 1;
let loginStatus = 0;
let loginCookie = localStorage.cookie;
let lastPlayedId = localStorage.lastPlayedId;
let cookieStr = "cookie=" + loginCookie;
let avatar_url;
let nickname;
let AcData;
let uid;
let userPlayLists;
let userCreatPlaylistIds = new Array();
let userFavPlaylistIds = new Array();
let listId = new Array();
let listSongs;
let playing;
let audio = document.getElementById("audio");
let playingIndex;
let playingListId = new Array();
let subscribedLists = new Array();
let playMethod;
let playMethodIcon = new Array();
let shuffledPlayingIndexs = new Array();
let likeList = new Array();
let searchMethod = 1;
let appendToWhere;
let nowPage = 0;
let nowWord = "";
let QRCode = 0;
// 初始化
$(".me").hide();
$(".list").hide();
$(".playing_div").hide();
$(".home").hide();
$(".discover").hide();

// 默认显示首页
$(".nav_links a").eq(0).click();
// 隐藏contianer中的所有元素(可改进)
// 在hideAll函数中添加新页面
function hideAll() {
    $(".contianer").children().each(function () {
        $(this).hide();
    })
    
    // 移除歌词容器，避免它显示在其他页面
    $('.lyrics-container').remove();
}

// 导航栏点击事件
$(".nav_links a").eq(0).click(function() {
    hideAll();
    $(".home").show();
    loadHomeData();
});

$(".nav_links a").eq(1).click(function() {
    hideAll();
    $(".discover").show();
    loadDiscoverData('recommend');
});

// 发现页标签切换
$(".discover-tab").click(function() {
    $(".discover-tab").removeClass("active");
    $(this).addClass("active");
    const tab = $(this).data("tab");
    $(".discover-section").removeClass("active");
    $(`#${tab}-section`).addClass("active");
    loadDiscoverData(tab);
});

// 加载首页数据
function loadHomeData() {
    // 推荐歌单
    let api_adr = apiAd + "personalized?" + cookieStr + "&limit=6";
    let data;
    if (data = ajaxGet(api_adr)) {
        $("#recommend-playlists").empty();
        data.result.forEach((playlist, index) => {
            if (index >= 6) return;
            const card = $(`
                <div class="card playlist-card" href="playlist" id="${playlist.id}">
                    <img src="${playlist.picUrl}">
                    <div class="info">
                        <div class="name">${playlist.name}</div>
                    </div>
                </div>
            `);
            $("#recommend-playlists").append(card);
        });
		
    }
    
    // 新歌速递
    api_adr = apiAd + "personalized/newsong?" + cookieStr;
    if (data = ajaxGet(api_adr)) {
        $("#new-songs").empty();
        data.result.forEach((song, index) => {
            const item = $(`
                <div class="song-item">
                    <div class="index">${index + 1}</div>
                    <div class="info">
                        <div class="name">${song.name}</div>
                        <div class="artist">${song.song.artists[0].name}</div>
                    </div>
                    <div class="actions">
                        <i class="fas fa-play" href="song" pro="play" id="${song.id}"></i>
                        <i class="fas fa-plus" href="song" pro="plus" id="${song.id}"></i>
                    </div>
                </div>
            `);
            $("#new-songs").append(item);
        });
    }
    
    // 热门歌手
    api_adr = apiAd + "top/artists?" + cookieStr + "&limit=6";
    if (data = ajaxGet(api_adr)) {
        $("#top-artists").empty();
        data.artists.forEach((artist, index) => {
            if (index >= 6) return;
            const card = $(`
                <div class="card artist-card" href="artist" id="${artist.id}">
                    <img src="${artist.img1v1Url}">
                    <div class="name">${artist.name}</div>
                </div>
            `);
            $("#top-artists").append(card);
        });
    }
    
    initItem();
}

// 加载发现页数据
function loadDiscoverData(tab) {
    let api_adr, data;
    
    // 显示加载状态
    $(`#${tab}-section`).html('<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>');
    
    switch(tab) {
        case 'recommend':
            // 个性推荐内容 - 同时加载多个推荐数据
            Promise.all([
                fetchData(apiAd + "recommend/resource?" + cookieStr),
                fetchData(apiAd + "personalized/newsong?" + cookieStr + "&limit=10"),
                fetchData(apiAd + "personalized/djprogram?" + cookieStr + "&limit=6")
            ]).then(([playlistData, newSongsData, djData]) => {
                $("#recommend-section").empty();
                
                // 1. 添加每日推荐歌单
                const playlistTitle = $("<h2 class='section-title'>每日推荐歌单</h2>");
                const playlistGrid = $('<div class="playlist-grid"></div>');
                
                playlistData.recommend.forEach((playlist, index) => {
                    if (index >= 6) return; // 限制数量
                    const card = $(`
                        <div class="card playlist-card" href="playlist" id="${playlist.id}">
                            <div class="card-cover">
                                <img src="${playlist.picUrl}" alt="${playlist.name}">
                                <div class="card-play-icon">
                                    <i class="fas fa-play-circle"></i>
                                </div>
                            </div>
                            <div class="info">
                                <div class="name">${playlist.name}</div>
                                <div class="desc">${playlist.copywriter || ''}</div>
                            </div>
                        </div>
                    `);
                    playlistGrid.append(card);
                });
                
                // 2. 添加新歌推荐
                const newSongsTitle = $("<h2 class='section-title'>新歌速递</h2>");
                const newSongsList = $('<div class="song-list"></div>');
                
                newSongsData.result.forEach((song, index) => {
                    const item = $(`
                        <div class="song-item">
                            <div class="index">${index + 1}</div>
                            <div class="song-cover">
                                <img src="${song.picUrl || song.song.album.picUrl}" alt="${song.name}">
                            </div>
                            <div class="info">
                                <div class="name" href="song" pro="play" id="${song.id}">${song.name}</div>
                                <div class="artist">${song.song.artists[0].name}</div>
                            </div>
                            <div class="actions">
                                <i class="fas fa-play" href="song" pro="play" id="${song.id}"></i>
                                <i class="fas fa-plus" href="song" pro="plus" id="${song.id}"></i>
                                <i class="fas fa-ellipsis-h" href="song" pro="more" id="${song.id}"></i>
                            </div>
                        </div>
                    `);
                    newSongsList.append(item);
                });
                
                // 3. 添加推荐电台
                const djTitle = $("<h2 class='section-title'>精选电台</h2>");
                const djGrid = $('<div class="dj-grid"></div>');
                
                djData.result.forEach(dj => {
                    const card = $(`
                        <div class="card dj-card" href="dj" id="${dj.id}">
                            <img src="${dj.picUrl}" alt="${dj.name}">
                            <div class="info">
                                <div class="name">${dj.name}</div>
                                <div class="desc">${dj.copywriter}</div>
                            </div>
                        </div>
                    `);
                    djGrid.append(card);
                });
                
                // 添加所有内容到页面
                $("#recommend-section").append(
                    playlistTitle, playlistGrid,
                    newSongsTitle, newSongsList,
                    djTitle, djGrid
                );
                
                // 初始化事件
                initItem();
                
                // 初始化卡片悬停效果
                $(".card").hover(
                    function() {
                        $(this).find(".card-play-icon").fadeIn(200);
                    },
                    function() {
                        $(this).find(".card-play-icon").fadeOut(200);
                    }
                );
            }).catch(error => {
                console.error('加载推荐内容失败:', error);
                $("#recommend-section").html('<div class="error">加载推荐内容失败，<a href="#" onclick="loadDiscoverData(\'recommend\')">点击重试</a></div>');
            });
            break;
            
        case 'playlist':
            // 歌单分类
            api_adr = apiAd + "playlist/highquality/tags?" + cookieStr;
            fetchData(api_adr)
                .then(data => {
                $("#playlist-section").empty();
                    
                    // 1. 添加热门推荐标签
                    const hotTags = [
                        { name: "全部", hot: true },
                        { name: "华语", hot: true },
                        { name: "流行", hot: true },
                        { name: "摇滚", hot: true },
                        { name: "民谣", hot: true },
                        { name: "电子", hot: true }
                    ];
                    
                    // 2. 创建标签导航区域
                    const tagsNav = $('<div class="tags-nav"></div>');
                    const hotTagsContainer = $('<div class="hot-tags"><h3>热门标签</h3><div class="tags-container"></div></div>');
                    
                    // 添加热门标签
                    hotTags.forEach(tag => {
                        const tagEl = $(`<span class="tag ${tag.name === '全部' ? 'active' : ''}">${tag.name}</span>`);
                        tagEl.click(function() {
                            $(".tag").removeClass("active");
                            $(this).addClass("active");
                            const tagName = tag.name === "全部" ? "" : tag.name;
                            loadPlaylistsByTag(tagName);
                        });
                        hotTagsContainer.find('.tags-container').append(tagEl);
                    });
                    
                    // 添加所有标签分类
                    const allTagsContainer = $('<div class="all-tags"><h3>全部分类</h3><div class="tags-category"></div></div>');
                    
                    // 按分类组织标签
                    const tagCategories = {};
                data.tags.forEach(tag => {
                        if (!tagCategories[tag.category]) {
                            tagCategories[tag.category] = [];
                        }
                        tagCategories[tag.category].push(tag);
                    });
                    
                    // 生成分类标签
                    for (const category in tagCategories) {
                        const categoryEl = $(`<div class="tag-category"><h4>${category}</h4><div class="category-tags"></div></div>`);
                        
                        tagCategories[category].forEach(tag => {
                    const tagEl = $(`<span class="tag">${tag.name}</span>`);
                            tagEl.click(function() {
                                $(".tag").removeClass("active");
                                $(this).addClass("active");
                                loadPlaylistsByTag(tag.name);
                                
                                // 滚动到歌单列表
                                $('html, body').animate({
                                    scrollTop: $("#playlist-grid").offset().top - 100
                                }, 500);
                            });
                            categoryEl.find('.category-tags').append(tagEl);
                });
                
                        allTagsContainer.find('.tags-category').append(categoryEl);
                    }
                    
                    tagsNav.append(hotTagsContainer, allTagsContainer);
                    
                    // 3. 创建歌单列表区域
                    const playlistTitle = $('<h2 class="section-title">精品歌单</h2>');
                    const playlistContainer = $('<div class="playlist-container"></div>');
                    const playlistGrid = $('<div class="playlist-grid" id="playlist-grid"></div>');
                    const loadMoreBtn = $('<button class="load-more-btn">加载更多</button>');
                    
                    playlistContainer.append(playlistGrid, loadMoreBtn);
                    
                    // 4. 添加到页面
                    $("#playlist-section").append(tagsNav, playlistTitle, playlistContainer);
                
                    // 5. 加载默认标签的歌单
                    loadPlaylistsByTag("");
                    
                    // 6. 加载更多按钮事件
                    let currentPage = 1;
                    let currentTag = "";
                    
                    loadMoreBtn.click(function() {
                        $(this).text("加载中...").prop("disabled", true);
                        loadMorePlaylists(currentTag, currentPage);
                    });
                    
                    // 7. 包装loadPlaylistsByTag函数以更新当前标签和页码
                    const originalLoadPlaylistsByTag = loadPlaylistsByTag;
                    loadPlaylistsByTag = function(tag) {
                        currentTag = tag;
                        currentPage = 1;
                        $("#playlist-grid").empty();
                        loadMoreBtn.text("加载更多").prop("disabled", false);
                        originalLoadPlaylistsByTag(tag);
                    };
                    
                    // 8. 添加加载更多功能
                    function loadMorePlaylists(tag, page) {
                        const api_adr = apiAd + "top/playlist/highquality?" + cookieStr + 
                                       (tag ? "&cat=" + tag : "") + 
                                       "&limit=12&offset=" + (page * 12);
                        
                        fetchData(api_adr)
                            .then(data => {
                                currentPage++;
                                
                                data.playlists.forEach(playlist => {
                                    const card = $(`
                                        <div class="card playlist-card" href="playlist" id="${playlist.id}">
                                            <div class="card-cover">
                                                <img src="${playlist.coverImgUrl}" alt="${playlist.name}">
                                                <div class="card-play-icon">
                                                    <i class="fas fa-play-circle"></i>
                                                </div>
                                            </div>
                                            <div class="info">
                                                <div class="name">${playlist.name}</div>
                                                <div class="desc">播放量: ${formatPlayCount(playlist.playCount)}</div>
                                            </div>
                                        </div>
                                    `);
                                    $("#playlist-grid").append(card);
                                });
                                
                                // 如果返回的数据少于12条，说明没有更多数据了
                                if (data.playlists.length < 12) {
                                    loadMoreBtn.text("没有更多了").prop("disabled", true);
                                } else {
                                    loadMoreBtn.text("加载更多").prop("disabled", false);
                                }
                                
                                // 初始化新添加的元素
                                initItem();
                                
                                // 初始化卡片悬停效果
                                $(".card").hover(
                                    function() {
                                        $(this).find(".card-play-icon").fadeIn(200);
                                    },
                                    function() {
                                        $(this).find(".card-play-icon").fadeOut(200);
                                    }
                                );
                            })
                            .catch(error => {
                                console.error('加载更多歌单失败:', error);
                                loadMoreBtn.text("加载失败，点击重试").prop("disabled", false);
                            });
                    }
                    
                    // 格式化播放次数
                    function formatPlayCount(count) {
                        if (count < 10000) {
                            return count;
                        } else if (count < 100000000) {
                            return Math.floor(count / 10000) + '万';
                        } else {
                            return Math.floor(count / 100000000) + '亿';
                        }
                    }
                    
                    // 初始化事件
                    initItem();
                })
                .catch(error => {
                    console.error('加载歌单分类失败:', error);
                    $("#playlist-section").html('<div class="error">加载歌单分类失败，<a href="#" onclick="loadDiscoverData(\'playlist\')">点击重试</a></div>');
                });
            break;
            
        case 'rank':
            // 排行榜
            api_adr = apiAd + "toplist?" + cookieStr;
            fetchData(api_adr)
                .then(data => {
                $("#rank-section").empty();
                    
                    // 将排行榜分类
                    const officialRankings = [];
                    const globalRankings = [];
                    const featureRankings = [];
                    
                data.list.forEach(list => {
                        if (list.name.includes('云音乐') || list.name.includes('飙升') || list.name.includes('热歌') || list.name.includes('新歌')) {
                            officialRankings.push(list);
                        } else if (list.name.includes('UK') || list.name.includes('美国') || list.name.includes('日本') || list.name.includes('韩国') || list.name.includes('欧美')) {
                            globalRankings.push(list);
                        } else {
                            featureRankings.push(list);
                        }
                    });
                    
                    // 创建官方榜单部分 - 使用大卡片布局
                    if (officialRankings.length > 0) {
                        const officialTitle = $('<h2 class="section-title">官方榜单</h2>');
                        const officialContainer = $('<div class="official-rank-container"></div>');
                        
                        officialRankings.forEach(list => {
                            const rankCard = $(`
                                <div class="rank-card official" data-id="${list.id}">
                                    <div class="rank-cover">
                                        <img src="${list.coverImgUrl}" alt="${list.name}">
                                        <div class="rank-play-btn">
                                            <i class="fas fa-play-circle"></i>
                                        </div>
                                    </div>
                                    <div class="rank-info">
                                        <div class="rank-title">${list.name}</div>
                                        <div class="rank-update">更新时间: ${formatUpdateTime(list.updateTime)}</div>
                                        <div class="rank-songs" id="rank-preview-${list.id}">
                                            <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
                                        </div>
                                    </div>
                                </div>
                            `);
                            
                            officialContainer.append(rankCard);
                            
                            // 加载每个排行榜的前5首歌
                            loadRankPreview(list.id);
                        });
                        
                        $("#rank-section").append(officialTitle, officialContainer);
                    }
                    
                    // 创建全球榜单部分 - 使用小卡片网格布局
                    if (globalRankings.length > 0) {
                        const globalTitle = $('<h2 class="section-title">全球榜单</h2>');
                        const globalContainer = $('<div class="global-rank-container"></div>');
                        
                        globalRankings.forEach(list => {
                            const rankCard = $(`
                                <div class="rank-card global" data-id="${list.id}">
                                    <div class="rank-cover">
                                        <img src="${list.coverImgUrl}" alt="${list.name}">
                                        <div class="rank-play-btn">
                                            <i class="fas fa-play-circle"></i>
                                        </div>
                                        <div class="rank-update-time">${formatUpdateFrequency(list.updateFrequency)}</div>
                                    </div>
                                    <div class="rank-name">${list.name}</div>
                                </div>
                            `);
                            
                            globalContainer.append(rankCard);
                        });
                        
                        $("#rank-section").append(globalTitle, globalContainer);
                    }
                    
                    // 创建特色榜单部分
                    if (featureRankings.length > 0) {
                        const featureTitle = $('<h2 class="section-title">特色榜单</h2>');
                        const featureContainer = $('<div class="feature-rank-container"></div>');
                        
                        featureRankings.forEach(list => {
                            const rankCard = $(`
                                <div class="rank-card feature" data-id="${list.id}">
                                    <div class="rank-cover">
                                        <img src="${list.coverImgUrl}" alt="${list.name}">
                                        <div class="rank-play-btn">
                                            <i class="fas fa-play-circle"></i>
                                        </div>
                                        <div class="rank-update-time">${formatUpdateFrequency(list.updateFrequency)}</div>
                                    </div>
                                    <div class="rank-name">${list.name}</div>
                        </div>
                    `);
                            
                            featureContainer.append(rankCard);
                        });
                        
                        $("#rank-section").append(featureTitle, featureContainer);
                    }
                    
                    // 为排行榜卡片添加点击事件
                    $(".rank-card").click(function() {
                        const rankId = $(this).data("id");
                        showRankDetail(rankId);
                    });
                    
                    // 为播放按钮添加事件
                    $(".rank-play-btn").click(function(e) {
                        e.stopPropagation(); // 阻止事件冒泡
                        const rankId = $(this).closest(".rank-card").data("id");
                        playRankList(rankId);
                });
                    
                    // 初始化项目
                    initItem();
                })
                .catch(error => {
                    console.error('加载排行榜失败:', error);
                    $("#rank-section").html('<div class="error">加载排行榜失败，<a href="#" onclick="loadDiscoverData(\'rank\')">点击重试</a></div>');
                });
            break;
            
        case 'artist':
            // 歌手分类
            api_adr = apiAd + "artist/list?" + cookieStr;
            fetchData(api_adr)
                .then(data => {
                $("#artist-section").empty();
                    
                    // 1. 创建歌手分类选择器
                    const categorySelector = $('<div class="artist-category-selector"></div>');
                    
                    // 语种分类
                    const languageCategories = [
                        { id: -1, name: "全部" },
                        { id: 7, name: "华语" },
                        { id: 96, name: "欧美" },
                        { id: 8, name: "日本" },
                        { id: 16, name: "韩国" },
                        { id: 0, name: "其他" }
                    ];
                    
                    // 类型分类
                    const typeCategories = [
                        { id: -1, name: "全部" },
                        { id: 1, name: "男歌手" },
                        { id: 2, name: "女歌手" },
                        { id: 3, name: "乐队" }
                    ];
                    
                    // 创建分类选择器
                    const languageSelector = $('<div class="category-group"><h3>语种</h3><div class="category-options language-options"></div></div>');
                    languageCategories.forEach(category => {
                        const option = $(`<span class="category-option ${category.id === -1 ? 'active' : ''}" data-type="area" data-id="${category.id}">${category.name}</span>`);
                        languageSelector.find('.category-options').append(option);
                    });
                    
                    const typeSelector = $('<div class="category-group"><h3>分类</h3><div class="category-options type-options"></div></div>');
                    typeCategories.forEach(category => {
                        const option = $(`<span class="category-option ${category.id === -1 ? 'active' : ''}" data-type="type" data-id="${category.id}">${category.name}</span>`);
                        typeSelector.find('.category-options').append(option);
                    });
                    
                    // 字母索引
                    const letterSelector = $('<div class="category-group"><h3>首字母</h3><div class="letters-container"></div></div>');
                    // 添加"热门"选项
                    const hotOption = $('<span class="letter active" data-initial="-1">热门</span>');
                    letterSelector.find('.letters-container').append(hotOption);
                    
                    // 添加字母选项
                for (let i = 65; i <= 90; i++) {
                    const letter = String.fromCharCode(i);
                        const letterEl = $(`<span class="letter" data-initial="${i}">${letter}</span>`);
                        letterSelector.find('.letters-container').append(letterEl);
                    }
                    
                    // 添加分类选择器到页面
                    categorySelector.append(languageSelector, typeSelector, letterSelector);
                    
                    // 2. 创建歌手展示区域
                    const artistTitle = $('<h2 class="section-title">热门歌手</h2>');
                    const artistGrid = $('<div class="artist-grid" id="artist-grid"></div>');
                    
                    // 3. 创建加载更多按钮
                    const loadMoreBtn = $('<button class="load-more-btn">加载更多</button>');
                    
                    // 4. 添加到页面
                    $("#artist-section").append(categorySelector, artistTitle, artistGrid, loadMoreBtn);
                    
                    // 5. 定义当前筛选条件和页码
                    let currentFilter = {
                        type: -1,
                        area: -1,
                        initial: -1,
                        offset: 0,
                        limit: 30
                    };
                    
                    // 6. 加载初始数据
                    loadArtistsByFilter(currentFilter);
                    
                    // 7. 绑定事件
                    // 分类选择事件
                    $(".category-option").click(function() {
                        const type = $(this).data("type");
                        const id = $(this).data("id");
                
                        // 更新UI
                        $(this).siblings().removeClass("active");
                        $(this).addClass("active");
                        
                        // 更新筛选条件
                        currentFilter[type] = id;
                        currentFilter.offset = 0;
                        
                        // 更新标题
                        updateArtistTitle(currentFilter);
                        
                        // 重新加载数据
                        $("#artist-grid").empty();
                        loadMoreBtn.text("加载更多").prop("disabled", false);
                        loadArtistsByFilter(currentFilter);
                    });
                    
                    // 字母选择事件
                    $(".letter").click(function() {
                        const initial = $(this).data("initial");
                        
                        // 更新UI
                        $(this).siblings().removeClass("active");
                        $(this).addClass("active");
                        
                        // 更新筛选条件
                        currentFilter.initial = initial;
                        currentFilter.offset = 0;
                        
                        // 更新标题
                        updateArtistTitle(currentFilter);
                        
                        // 重新加载数据
                        $("#artist-grid").empty();
                        loadMoreBtn.text("加载更多").prop("disabled", false);
                        loadArtistsByFilter(currentFilter);
                    });
                    
                    // 加载更多事件
                    loadMoreBtn.click(function() {
                        $(this).text("加载中...").prop("disabled", true);
                        currentFilter.offset += currentFilter.limit;
                        loadArtistsByFilter(currentFilter);
                    });
                    
                    // 8. 根据筛选条件更新标题
                    function updateArtistTitle(filter) {
                        let title = "";
                        
                        // 获取当前选中的语种和类型
                        const language = languageCategories.find(c => c.id === filter.area);
                        const type = typeCategories.find(c => c.id === filter.type);
                        
                        if (filter.initial === -1) {
                            title = "热门";
                        } else if (filter.initial !== -1) {
                            title = String.fromCharCode(filter.initial) + "开头";
                        }
                        
                        if (language && language.id !== -1) {
                            title = language.name + title;
                        }
                        
                        if (type && type.id !== -1) {
                            title = title + type.name;
                        }
                        
                        if (!title) {
                            title = "热门歌手";
                        } else {
                            title += "歌手";
                        }
                        
                        $(".section-title").text(title);
                    }
                })
                .catch(error => {
                    console.error('加载歌手分类失败:', error);
                    $("#artist-section").html('<div class="error">加载歌手分类失败，<a href="#" onclick="loadDiscoverData(\'artist\')">点击重试</a></div>');
                });
            break;
    }
}

// 根据标签加载歌单
function loadPlaylistsByTag(tag) {
    const api_adr = apiAd + "top/playlist/highquality?" + cookieStr + "&cat=" + tag + "&limit=12";
    let data;
    if (data = ajaxGet(api_adr)) {
        $("#playlist-grid").empty();
        data.playlists.forEach(playlist => {
            const card = $(`
                <div class="card playlist-card" href="playlist" id="${playlist.id}">
                    <img src="${playlist.coverImgUrl}">
                    <div class="info">
                        <div class="name">${playlist.name}</div>
                    </div>
                </div>
            `);
            $("#playlist-grid").append(card);
        });
    }
}

// 加载排行榜歌曲
/**
 * 加载排行榜歌曲（优化版）
 * @param {string} id 排行榜ID
 */
async function loadRankSongs(id) {
    // 1. 检查重复加载
    if ($(`#rank-${id}`).hasClass('loading')) return;
    
    try {
        // 2. 显示加载状态
        $(`#rank-${id}`)
            .addClass('loading')
            .html('<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>');

        // 3. 使用异步请求替代同步ajaxGet
        const api_adr = `${apiAd}playlist/detail?${cookieStr}&id=${id}`;
        const response = await fetch(api_adr);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();

        // 4. 使用文档片段减少DOM操作
        const fragment = document.createDocumentFragment();
        const songs = data.playlist?.tracks?.slice(0, 5) || [];

        songs.forEach((song, index) => {
            const item = $(`
                <div class="song-item" data-id="${song.id}">
                    <div class="index">${index + 1}</div>
                    <div class="info">
                        <div class="name" href="song" pro="play" id="${song.id}">${song.name}</div>
                        <div class="artist">${song.ar[0]?.name || '未知歌手'}</div>
                    </div>
                    <div class="actions">
                        <i class="fas fa-play" href="song" pro="play" id="${song.id}"></i>
                        <i class="fas fa-plus" href="song" pro="plus" id="${song.id}"></i>
                    </div>
                </div>
            `)[0]; // 转换为DOM元素
            
            fragment.appendChild(item);
        });

        // 5. 批量DOM插入
        $(`#rank-${id}`)
            .removeClass('loading')
            .empty()
            .append(fragment);

        // 6. 重新绑定事件
        initItem();

    } catch (error) {
        console.error('加载排行榜失败:', error);
        $(`#rank-${id}`)
            .removeClass('loading')
            .html('<div class="error">加载失败，点击重试</div>')
            .on('click', () => loadRankSongs(id));
    }
}

// 加载排行榜预览（前3首歌）
function loadRankPreview(id) {
    const api_adr = apiAd + "playlist/detail?" + cookieStr + "&id=" + id;
    fetchData(api_adr)
        .then(data => {
            const songs = data.playlist?.tracks?.slice(0, 3) || [];
            const previewHtml = songs.map((song, index) => {
                return `
                    <div class="rank-preview-item" href="song" pro="play" id="${song.id}">
                        <span class="rank-preview-index">${index + 1}</span>
                        <span class="rank-preview-name">${song.name}</span>
                        <span class="rank-preview-artist">- ${song.ar[0]?.name || '未知歌手'}</span>
                    </div>
                `;
            }).join('');
            
            $(`#rank-preview-${id}`).html(previewHtml);
        })
        .catch(error => {
            console.error('加载排行榜预览失败:', error);
            $(`#rank-preview-${id}`).html('<div class="error">加载失败</div>');
        });
}

// 显示排行榜详情
function showRankDetail(id) {
    hideAll();
    $("#item_list").show();
    $("#item_list .list_info").text("加载中...");
    
    fetchData(apiAd + "playlist/detail?" + cookieStr + "&id=" + id)
        .then(data => {
            const playlist = data.playlist;
            $("#item_list .list_info").text(playlist.name);
            
            // 使用现有的列表展示功能
            changeList(playlist.name, playlist.tracks, "song", $("#item_list"));
        })
        .catch(error => {
            console.error('加载排行榜详情失败:', error);
            $("#item_list .list_info").text("加载失败");
        });
}

// 播放排行榜
function playRankList(id) {
    fetchData(apiAd + "playlist/detail?" + cookieStr + "&id=" + id)
        .then(data => {
            const playlist = data.playlist;
            const songs = playlist.tracks;
            
            // 清空当前播放列表
            playingListId = [];
            
            // 添加歌曲到播放列表
            songs.forEach(song => {
                playingListId.push(song.id);
            });
            
            // 保存播放列表
            localStorage.playingListId = JSON.stringify(playingListId);
            
            // 从第一首开始播放
            playingIndex = 0;
            localStorage.playingIndex = playingIndex;
            
            // 播放第一首歌
            if (playingListId.length > 0) {
                playSongFromId(playingListId[0], true);
            }
        })
        .catch(error => {
            console.error('播放排行榜失败:', error);
            alert("播放失败，请稍后再试");
        });
}

// 格式化更新时间
function formatUpdateTime(timestamp) {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
}

// 格式化更新频率
function formatUpdateFrequency(frequency) {
    return frequency || "每日更新";
}

// 根据字母加载歌手
function loadArtistsByLetter(letter) {
    const api_adr = apiAd + "artist/list?" + cookieStr + "&initial=" + letter.charCodeAt(0);
    let data;
    if (data = ajaxGet(api_adr)) {
        $("#artist-grid").empty();
        data.artists.forEach(artist => {
            const card = $(`
                <div class="card artist-card" href="artist" id="${artist.id}">
                    <img src="${artist.img1v1Url}">
                    <div class="name">${artist.name}</div>
                </div>
            `);
            $("#artist-grid").append(card);
        });
    }
}

// 根据筛选条件加载歌手
function loadArtistsByFilter(filter) {
    // 构建API参数
    let params = [];
    if (filter.type !== -1) params.push(`type=${filter.type}`);
    if (filter.area !== -1) params.push(`area=${filter.area}`);
    if (filter.initial !== -1) params.push(`initial=${filter.initial}`);
    params.push(`offset=${filter.offset}`);
    params.push(`limit=${filter.limit}`);
    
    const api_adr = apiAd + "artist/list?" + cookieStr + "&" + params.join("&");
    
    fetchData(api_adr)
        .then(data => {
            if (data.artists && data.artists.length > 0) {
                // 如果是首次加载（offset为0），则清空网格
                if (filter.offset === 0) {
                    $("#artist-grid").empty();
                }
                
                // 添加歌手卡片
                data.artists.forEach(artist => {
                    // 使用更好的图片（如果有）
                    const imageUrl = artist.picUrl || artist.img1v1Url;
                    
                    const card = $(`
                        <div class="card artist-card" href="artist" id="${artist.id}">
                            <div class="artist-cover">
                                <img src="${imageUrl}" alt="${artist.name}">
                                <div class="artist-play-icon">
                                    <i class="fas fa-play-circle"></i>
                                </div>
                            </div>
                            <div class="info">
                                <div class="name">${artist.name}</div>
                                ${artist.alias && artist.alias.length > 0 ? `<div class="alias">${artist.alias[0]}</div>` : ''}
                            </div>
                        </div>
                    `);
                    
                    $("#artist-grid").append(card);
                });
                
                // 如果返回的数据少于请求的数量，说明没有更多数据了
                if (data.artists.length < filter.limit) {
                    $(".load-more-btn").text("没有更多了").prop("disabled", true);
                } else {
                    $(".load-more-btn").text("加载更多").prop("disabled", false);
                }
                
                // 初始化事件
                initItem();
                
                // 初始化卡片悬停效果
                $(".artist-cover").hover(
                    function() {
                        $(this).find(".artist-play-icon").fadeIn(200);
                    },
                    function() {
                        $(this).find(".artist-play-icon").fadeOut(200);
                    }
                );
            } else {
                // 如果是首次加载且没有数据
                if (filter.offset === 0) {
                    $("#artist-grid").html('<div class="no-results">没有找到相关歌手</div>');
                }
                $(".load-more-btn").text("没有更多了").prop("disabled", true);
            }
        })
        .catch(error => {
            console.error('加载歌手失败:', error);
            if (filter.offset === 0) {
                $("#artist-grid").html('<div class="error">加载失败，请稍后重试</div>');
            }
            $(".load-more-btn").text("加载失败，点击重试").prop("disabled", false);
        });
}

// ajax请求
function ajaxGet(api_adr, checkCode = true) {
    let res;
    $.ajax({
        url: api_adr,
        datatype: "json",
        type: "GET",
        async: false,
        success: function (data) {
            console.log(data);
            if (data.code == "200" || (!checkCode)) res = data;
        }
    });
    if (res) return res;
    else return false;
}

/**
 * 使用Promise和Fetch API的异步请求函数
 * @param {string} api_adr - API地址
 * @param {boolean} checkCode - 是否检查状态码
 * @returns {Promise} - 返回Promise对象
 */
function fetchData(api_adr, checkCode = true) {
    return fetch(api_adr)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络请求失败: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (checkCode && data.code !== 200) {
                throw new Error('API返回错误: ' + data.code);
            }
            return data;
        });
}

/**
 * 异步版本的ajaxGet，使用Promise
 * @param {string} api_adr - API地址
 * @param {boolean} checkCode - 是否检查状态码
 * @returns {Promise} - 返回Promise对象
 */
function ajaxGetAsync(api_adr, checkCode = true) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: api_adr,
            datatype: "json",
            type: "GET",
            success: function (data) {
                if (data.code == "200" || (!checkCode)) {
                    resolve(data);
                } else {
                    reject(new Error('API返回错误码: ' + data.code));
                }
            },
            error: function (xhr, status, error) {
                reject(new Error('请求失败: ' + error));
            }
        });
    });
}

// 变量初始化
playingIndex = parseInt(localStorage.playingIndex) ? parseInt(localStorage.playingIndex) : 0;
playMethod = (localStorage.playMethod == undefined) ? (localStorage.playMethod = 0) : localStorage.playMethod;
playingListId = localStorage.playingListId ? JSON.parse(localStorage.playingListId) : [];
playMethodIcon = ["source/img/loop.svg", "source/img/loop-1.svg", "source/img/random.svg"];
shuffledPlayingIndexs = localStorage.shuffledPlayingIndexs ? JSON.parse(localStorage.shuffledPlayingIndexs) : [];

// 初始化
$(".me").hide();
$(".list").hide();
$(".playing_div").hide();

// 测试API连接
let api_adr = apiAd + "search/hot";
let data;
if (!(data = ajaxGet(api_adr))) { 
    // 如果内置API不可用，提示用户输入
    localStorage.apiAd = apiAd = prompt("API连接失败，请输入可用的api地址\n例如: http://139.9.223.233:3000/", "http://139.9.223.233:3000/");
    location.reload();
}

transInputIcon(".search_input", ".search_btn");
transInputIcon("#account_input", ".fa-envelope");
transInputIcon("#account_input", ".fa-mobile-alt");
transInputIcon("#pwd_input", ".fa-lock");
$("#loginMethodChanger").click();
$(".login_qrcode_box").hide();
initLogin();
playSongFromId(lastPlayedId, false);
$(".bar_loop_svg").html('<embed src="' + playMethodIcon[playMethod] + '" type="image/svg+xml" pluginspage="http://www.adobe.com/svg/viewer/install/" />');

// 媒体会话控制
navigator.mediaSession.setActionHandler('play', startToPlay);
navigator.mediaSession.setActionHandler('pause', pausePlaying);
navigator.mediaSession.setActionHandler('previoustrack', function () {
    changeSong(0);
});
navigator.mediaSession.setActionHandler('nexttrack', function () {
    changeSong(1);
});


$(document).ready(function() {
  // 其他初始化代码...
  
  // 初始化弹窗事件
  $(".modal-close").click(() => {
    $("#artist-modal").fadeOut();
  });
});