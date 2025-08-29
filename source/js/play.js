//开始播放
function startToPlay() {
    if (audio.paused) {
        audio.play();
        $('#bar_play').hide();
        $('#bar_pause').show();
        $('#playing_bar_play').hide();
        $('#playing_bar_pause').show();
        //设置播放状态检查定时器
        let timer = setInterval(function () {
            if (audio.ended) {
                if (playMethod == 0 || playMethod == 2) changeSong(1);
                else if (playMethod == 1) {
                    audio.currentTime = 0;
                    audio.play();
                }
            } else {
                let ratio = audio.currentTime / audio.duration;
                $(".currentProgress").css({
                    'width': ratio * 100 + '%'
                });
                $(".playing_currentProgress").css({
                    'width': ratio * 100 + '%'
                });
            }
        }, 100)
        navigator.mediaSession.playbackState = "playing";
    }
}

//暂停播放
function pausePlaying() {
    audio.pause();
    $('#bar_play').show();
    $('#bar_pause').hide();
    $('#playing_bar_play').show();
    $('#playing_bar_pause').hide();
    navigator.mediaSession.playbackState = "Paused";
}

//播放歌曲
function playSongFromId(id, play) {
    // 使用异步方法，避免界面卡顿
    fetchData(apiAd + "song/detail?" + cookieStr + "&ids=" + id)
        .then(playing => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: playing.songs[0].name,
                artist: playing.songs[0].ar[0].name,
                album: playing.songs[0].al.name,
                artwork: [{ src: playing.songs[0].al.picUrl }]
            });
        }
        $(".bar_cover_img").css("background", 'url(' + playing.songs[0].al.picUrl + ') no-repeat');
        $("#bar_song_name").html(playing.songs[0].name);
        $("#bar_singer").html(playing.songs[0].ar[0].name);
        $("#bar_album").html(playing.songs[0].al.name);
        $("#bar_heart").attr("name", id);
        $("#playing_bar_heart").attr("name", id);
        $(".playing_cover").css("background", 'url(' + playing.songs[0].al.picUrl + ') no-repeat');
        $(".playing_name").html(playing.songs[0].name);
        $(".playing_singer").html(playing.songs[0].ar[0].name);
        $(".playing_album").html(playing.songs[0].al.name);
        $(".playing_album_cover").css("background", 'url(' + playing.songs[0].al.picUrl + ') no-repeat');
        $(".playing_album_cover").attr("id", playing.songs[0].al.id);
            
        if (likeList.indexOf(parseInt(id)) >= 0) {
            $("#bar_heart").attr("style", "color: #E79796");
            $("#playing_bar_heart").attr("style", "color: #E79796");
        }
        else {
            $("#bar_heart").attr("style", "color: #000000");
            $("#playing_bar_heart").attr("style", "color: #000000");
        }
            
            // 获取歌曲URL
            return fetchData(apiAd + "song/url?" + cookieStr + "&id=" + id);
        })
        .then(data => {
            let audioUrl = (data.code == "200" && data.data[0].url) ? 
                data.data[0].url : 
                "https://music.163.com/song/media/outer/url?id=" + id + ".mp3";
                
            lastPlayedId = localStorage.lastPlayedId = id;
            $(".playing").attr("src", audioUrl);
            
            if (play) {
                startToPlay();
            } else {
                pausePlaying();
            }
            
            initItem();
            
			// 加载歌词
			      loadLyrics(id);
            
    return true;
        })
        .catch(error => {
            console.error('播放歌曲失败:', error);
            return false;
        });
}

//检查歌曲可用性
function checkSongAvalibility(id) {
    let api_adr = apiAd + "check/music?id=" + id;
    let avalibility = false;
    let data;
    if (data = ajaxGet(api_adr)) avalibility = data.success;
    return avalibility;
}

//打乱播放列表(随机播放)
function shuffle() {
    shuffledPlayingIndexs = [];
    let t, j;
    for (let i = 0; i < playingListId.length; i++) {
        shuffledPlayingIndexs[i] = i;
    }

    for (let i = 0; i < playingListId.length; i++) {
        j = getRandomInt(0, i);
        if (j == playingIndex || i == playingIndex) continue;
        t = shuffledPlayingIndexs[i];
        shuffledPlayingIndexs[i] = shuffledPlayingIndexs[j];
        shuffledPlayingIndexs[j] = t;
    }
    localStorage.shuffledPlayingIndexs = JSON.stringify(shuffledPlayingIndexs);
}

//上/下一首 dir为0上一首，1为下一首
function changeSong(dir) {
    audio.currentTime = 0;
    audio.pause();
    localStorage.playingIndex = playingIndex = ((!dir) ? ((playingIndex + playingListId.length - 1) % playingListId.length) : ((playingIndex + 1) % playingListId.length));
    if (playMethod == 2) playSongFromId(playingListId[shuffledPlayingIndexs[playingIndex]], true);
    else playSongFromId(playingListId[playingIndex], true);
    showPlayingList();
}

//更改播放模式
function changeLoopMethod() {
    localStorage.playMethod = playMethod = (playMethod + 1) % 3;
    $(".bar_loop_svg").html("");
    $(".bar_loop_svg").html('<embed src="' + playMethodIcon[playMethod] + '" type="image/svg+xml" pluginspage="http://www.adobe.com/svg/viewer/install/" />');
    if (playMethod == 2) shuffle();
    showPlayingList();
}

//获取喜欢列表
function getLikeList(uid) {
    let api_adr = apiAd + "likelist?" + cookieStr + "&uid=" + uid + "&timestamp=" + stamp();
    let data;
    if (data = ajaxGet(api_adr)) likeList = data.ids;
}

// 加载歌词函数
function loadLyrics(id) {
    const api_adr = apiAd + "lyric?" + cookieStr + "&id=" + id;
    
    // 清除旧的歌词容器
    $('.lyrics-container').remove();
    
    // 只有在播放界面可见时才显示歌词
    if ($('.playing_div').is(':visible')) {
        // 显示加载中状态
        // 将歌词容器添加到播放区域内部的最后
        $('.playing_div').append('<div class="lyrics-container"><p class="loading-lyrics">歌词加载中...</p></div>');
        
        // 移除动态设置的margin-top
        // $('.lyrics-container').css('margin-top', ($('.playing_bar').height() + 20) + 'px');
        
        // 使用Promise和fetch API进行异步加载
        fetch(api_adr)
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络请求失败');
                }
                return response.json();
            })
            .then(data => {
                if (!data || !data.lrc || !data.lrc.lyric) {
                    $('.lyrics-container').html('<p class="no-lyrics">暂无歌词</p>');
                    return;
                }
                
                // 解析歌词内容
                const lrcContent = data.lrc.lyric;
                const lyricLines = parseLyric(lrcContent);
                
                // 如果有翻译歌词，也一起加载
                let translatedLyrics = [];
                if (data.tlyric && data.tlyric.lyric) {
                    translatedLyrics = parseLyric(data.tlyric.lyric);
                }
                
                // 合并原歌词和翻译
                const mergedLyrics = mergeLyrics(lyricLines, translatedLyrics);
                
                // 显示歌词
                displayLyrics(mergedLyrics);
            })
            .catch(error => {
                console.error('加载歌词失败:', error);
                $('.lyrics-container').html('<p class="no-lyrics">歌词加载失败</p>');
            });
    }
}

// 合并原歌词和翻译
function mergeLyrics(original, translated) {
    if (translated.length === 0) return original;
    
    // 创建时间索引映射
    const translationMap = {};
    translated.forEach(line => {
        translationMap[line.time] = line.text;
    });
    
    // 合并歌词
    return original.map(line => {
        const translation = translationMap[line.time] || '';
        return {
            time: line.time,
            text: line.text,
            translation: translation
        };
    });
}

// 解析LRC格式歌词
function parseLyric(lrc) {
    const lines = lrc.split('\n');
    const result = [];
    
    // 匹配时间标签的正则表达式 [00:00.00]
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;
        
        const timeMatches = line.match(timeReg);
        if (!timeMatches) continue;
        
        const text = line.replace(timeReg, '').trim();
        if (text === '') continue;
        
        const min = parseInt(timeMatches[1]);
        const sec = parseInt(timeMatches[2]);
        const ms = parseInt(timeMatches[3]);
        
        // 转换为秒
        const time = min * 60 + sec + ms / 1000;
        
        result.push({
            time: time,
            text: text
        });
    }
    
    // 按时间排序
    return result.sort((a, b) => a.time - b.time);
}

// 显示歌词
function displayLyrics(lyrics) {
    // 清空旧的歌词容器，避免重复创建
    $('.lyrics-container').remove();
    
    // 创建歌词显示区域，并放置在正确位置
    // 将歌词容器放在播放区域内部的最后，作为子元素
    $('.playing_div').append('<div class="lyrics-container"></div>');
    
    // 移除动态设置的margin-top
    // $('.lyrics-container').css('margin-top', ($('.playing_bar').height() + 20) + 'px');
    
    const container = $('.lyrics-container');
    
    // 如果没有歌词，显示提示信息
    if (!lyrics || lyrics.length === 0) {
        container.html('<p class="no-lyrics">暂无歌词</p>');
        return;
    }
    
    // 添加空白填充行，使第一行歌词可以滚动到中间位置
    container.append('<div class="lyric-padding"></div>');
    
    // 添加歌词行
    lyrics.forEach(line => {
        let lineHtml = `<p class="lyric-line" data-time="${line.time}">${line.text}`;
        if (line.translation) {
            lineHtml += `<br><span class="lyric-translation">${line.translation}</span>`;
        }
        lineHtml += '</p>';
        container.append(lineHtml);
    });
    
    // 添加底部空白填充，使最后一行歌词可以滚动到中间位置
    container.append('<div class="lyric-padding"></div>');
    
    // 设置填充区域高度，使其等于容器高度的一半
    setTimeout(() => {
        const halfHeight = Math.floor(container.height() / 2) - 10;
        $('.lyric-padding').css('height', halfHeight + 'px');
    }, 100);
    
    // 取消之前可能绑定的ontimeupdate事件
    if (audio.ontimeupdate) {
        audio.ontimeupdate = null;
    }
    
    // 存储当前高亮的歌词行，避免重复处理
    let currentActiveLine = -1;
    
    // 监听播放进度，高亮当前歌词
    audio.ontimeupdate = function() {
        if (!audio.duration) return; // 如果音频没有准备好，直接返回
        
        const currentTime = audio.currentTime;
        let activeLine = -1;
        
        // 找到当前播放时间对应的歌词行
        for (let i = 0; i < lyrics.length; i++) {
            // 如果当前时间大于等于这一行的时间，且小于下一行的时间（或者是最后一行）
            if (lyrics[i].time <= currentTime && 
                (i === lyrics.length - 1 || lyrics[i + 1].time > currentTime)) {
                activeLine = i;
                break;
            }
        }
        
        // 如果找到了当前行，且和上次不同，才进行处理
        if (activeLine !== -1 && activeLine !== currentActiveLine) {
            currentActiveLine = activeLine;
            
            // 移除所有行的高亮
            $('.lyric-line').removeClass('active');
            
            // 高亮当前行
            const activeElement = $(`.lyric-line[data-time="${lyrics[activeLine].time}"]`);
            activeElement.addClass('active');
            
            // 获取容器
            const container = $('.lyrics-container');
            
            // 只有当容器存在时才执行滚动
            if (container.length > 0 && activeElement.length > 0) {
                // 获取当前行在容器中的位置
                const lineTop = activeElement.position().top;
                const containerHeight = container.height();
                
                // 计算目标滚动位置，使当前行居中显示
                const targetScroll = lineTop + container.scrollTop() - (containerHeight / 2) + (activeElement.height() / 2);
                
                // 使用平滑滚动效果，速度更快
                container.stop().animate({
                    scrollTop: targetScroll
                }, 300, 'swing');
            }
        }
    };
}

// 处理文件名，移除非法字符
function sanitizeFileName(name) {
    // 移除文件名中的非法字符 (\ / : * ? " < > |)
    return name.replace(/[\\/:*?"<>|]/g, "_");
}

// 下载当前播放的歌曲
function downloadCurrentSong() {
    // 检查是否有正在播放的歌曲
    if (!lastPlayedId) {
        alert("当前没有播放的歌曲");
        return;
    }
    
    // 获取当前歌曲信息
    const songName = $(".playing_name").text() || $("#bar_song_name").text();
    const artistName = $(".playing_singer").text() || $("#bar_singer").text();
    
    // 如果没有歌曲信息，提示错误
    if (!songName || !artistName) {
        alert("无法获取歌曲信息");
        return;
    }
    
    // 格式化文件名：歌曲-歌手，并处理非法字符
    const fileName = sanitizeFileName(`${songName}-${artistName}.mp3`);
    
    // 获取当前播放的音频URL
    const audioUrl = $(".playing").attr("src");
    
    if (!audioUrl) {
        alert("无法获取歌曲下载链接");
        return;
    }
    
    // 添加日志显示
    console.log("开始下载歌曲:");
    console.log("歌曲名称:", songName);
    console.log("歌手名称:", artistName);
    console.log("文件名:", fileName);
    console.log("下载链接:", audioUrl);
    
    // 由于浏览器安全限制，使用Blob对象来确保文件名正确
    fetch(audioUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // 创建一个新的Blob对象，指定MIME类型为audio/mpeg
            const mp3Blob = new Blob([blob], { type: 'audio/mpeg' });
            const blobUrl = URL.createObjectURL(mp3Blob);
            
            const blobLink = document.createElement("a");
            blobLink.href = blobUrl;
            blobLink.download = fileName;
            
            // 显示下载状态
            console.log("使用Blob方式下载:", fileName);
            
            // 添加到文档并触发下载
            document.body.appendChild(blobLink);
            blobLink.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(blobLink);
                URL.revokeObjectURL(blobUrl);
                console.log("下载完成");
                alert(`下载完成: ${fileName}`);
            }, 100);
        })
        .catch(error => {
            console.error("下载失败:", error);
           
            
            // 备用方案：尝试直接下载
            console.log("尝试使用直接下载方式");
            const downloadLink = document.createElement("a");
            downloadLink.href = audioUrl;
            downloadLink.download = fileName;
            downloadLink.target = "_blank";
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            setTimeout(() => {
                document.body.removeChild(downloadLink);
            }, 100);
        });
}
