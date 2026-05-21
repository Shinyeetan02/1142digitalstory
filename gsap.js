// 載入 ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

// 第一幀
const scene1 = document.getElementById('scene1')
// 第二幀
const scene2 = document.getElementById('scene2')
// 第三幀
const scene3 = document.getElementById('scene3')
// 第四幀
const scene4 = document.getElementById('scene4')
// 第五幀
const scene5 = document.getElementById('scene5')
// 按鈕1：進入故事
const playBtn = document.getElementById('playBtn')
// 時間軸建立，影片一開始先paused
const tl = gsap.timeline({ paused: true })
// 按鈕2：開啟手機
const phoneBtn = document.getElementById('phoneBtn')

// 按鈕1：點擊進入故事後按鈕opacity調整為0
playBtn.addEventListener('click', () => {
    scene1.play()
    document.getElementById('scene1bgm').play()
    scene3.muted = false
    gsap.to(playBtn, { opacity: 0, duration: 0.3, pointerEvents: 'none' })
    gsap.to('.title', { opacity: 0, duration: 0.3 })
})

tl.to("#caption1", { opacity: 1, duration: 1 }, 0.01)
  .to('#caption1', { opacity: 0, duration: 0.3 })
  .to('#caption2', { opacity: 1, duration: 1 })
  .to('#caption2', { opacity: 0, duration: 0.3 })
  .to('#caption3', { opacity: 1, duration: 1 })
  .to('#caption3', { opacity: 0, duration: 0.3 })
  .to('#caption4', { opacity: 1, duration: 1.5 }, 6)
  .to('#caption4', { opacity: 0, duration: 0.3 })

scene1.addEventListener('timeupdate', () => {
    tl.time(scene1.currentTime)
})

// scene1 結束
scene1.addEventListener('ended', () => {
    gsap.to('.scene2-container', { opacity: 1, duration: 0.8 })
 
    // hintScrolling-img：scene2 出現後淡入，同時開始 y 軸來回浮動，使用者開始 scroll 後淡出並停止
    gsap.to('#hintScrolling-img', {
        opacity: 1,
        duration: 0.8,
        delay: 0.8,
        onComplete: () => {
            window._hintScrollAnim = gsap.to('#hintScrolling-img', {
                y: -12,
                duration: 0.9,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true
            })
        }
    })
 
    gsap.to('#hintScrolling', { opacity: 1, duration: 0.8, delay: 0.8 })
 
    const hideHintOnScroll = () => {
        if (window._hintScrollAnim) {
            window._hintScrollAnim.kill()
            window._hintScrollAnim = null
        }
        gsap.to('#hintScrolling-img', { opacity: 0, y: 0, duration: 0.4 })
        gsap.to('#hintScrolling', { opacity: 0, duration: 0.4 })
        window.removeEventListener('scroll', hideHintOnScroll)

        // 使用者開始 scroll，播放 scene2 背景音效
        const scene2bgm = document.getElementById('scene2bgm')
        scene2bgm.play()
    }
    window.addEventListener('scroll', hideHintOnScroll, { passive: true })
 
    // 撐開頁面讓 scroll 有空間
    document.body.style.height = '600vh'
    document.body.style.overflow = 'scroll'
 
    scene2.addEventListener('loadedmetadata', setupScrollTriggers)
    if (scene2.readyState >= 1) setupScrollTriggers()
})

function setupScrollTriggers() {
    ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: '75% top',
        onUpdate: (self) => {
            // 只在 scene3 尚未啟動時才更新 scene2 時間
            if (!window._scene3Active) {
                scene2.currentTime = self.progress * scene2.duration
            }
        }
    })

    ScrollTrigger.create({
        trigger: document.body,
        start: '75% top',
        end: '75% top',
        onEnter: () => {
            window._scene3Active = true
            showScene3()
        },
        onLeaveBack: () => {
            window._scene3Active = false
            showScene2()
        }
    })
}

// Scene3 顯示：scene2 fade out 與 scene3 fade in 同時進行（crossfade，避免 scene1 露出）
function showScene3() {
    scene3.currentTime = 0
    scene3.addEventListener('ended', onScene3Ended)

    gsap.to('.scene2-container', { opacity: 0, duration: 0.6 })
    gsap.to('.scene3-container', { opacity: 1, duration: 0.6 })

    const playPromise = scene3.play()
    if (playPromise !== undefined) {
        playPromise.catch((err) => {
            // 只有在非 AbortError（即真正被瀏覽器政策封鎖）時，才跳到結束畫面
            if (err.name !== 'AbortError') {
                scene3.removeEventListener('ended', onScene3Ended)
                onScene3Ended()
            }
        // AbortError 代表播放被中斷（例如快速滑動），忽略即可
        })
    }
}

function onScene3Ended() {
    // scene3 結束，停止 scene2 背景音效
    const scene2bgm = document.getElementById('scene2bgm')
    scene2bgm.pause()

    gsap.to('#scene3-img', { opacity: 1, duration: 0.5, pointerEvents: 'auto' })
    gsap.to('#phoneBtn', { opacity: 1, duration: 0.5, delay: 0.3, pointerEvents: 'auto' })
    scene3.removeEventListener('ended', onScene3Ended)

    // scene3-img 出現後依序顯示三段字幕
    // caption5：出現後停留 0.5 秒再消失
    // caption6：接著出現，停留 0.5 秒再消失
    // caption7：出現後持續停留，直到 phoneBtn 被點擊
    const captionTl = gsap.timeline({ delay: 0.6 })
    captionTl
        .to('#caption5', { opacity: 1, duration: 0.6 })
        .to('#caption5', { opacity: 0, duration: 0.4, delay: 0.5 })
        .to('#caption6', { opacity: 1, duration: 0.6 })
        .to('#caption6', { opacity: 0, duration: 0.4, delay: 0.5 })
        .to('#caption7', { opacity: 1, duration: 0.4 })
        .to('#hintClick-img', { opacity: 1, duration: 0.5 })
        .call(() => {
            // caption7 出現後，hintClick-img 開始循環閃爍
            window._hintClickAnim = gsap.to('#hintClick-img', {
                opacity: 0,
                duration: 0.7,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true
            })
        })
}

// Scene2 回復：scene3 fade out 與 scene2 fade in 同時進行（crossfade，避免 scene1 露出）
function showScene2() {
    scene3.removeEventListener('ended', onScene3Ended)
    scene3.pause()

    // 重置 scene3-img 與 phoneBtn
    gsap.to('#scene3-img', { opacity: 0, duration: 0.3, pointerEvents: 'none' })
    gsap.to('#phoneBtn', { opacity: 0, duration: 0.3, pointerEvents: 'none' })
    gsap.to(['#caption5', '#caption6', '#caption7'], { opacity: 0, duration: 0.3 })

    gsap.to('.scene3-container', { opacity: 0, duration: 0.6 })
    gsap.to('.scene2-container', {
        opacity: 1,
        duration: 0.6,
        onStart: () => { scene2.currentTime = scene2.duration } // 停在最後一幀
    })
}

phoneBtn.addEventListener('click', () => {
    // 隱藏 caption7
    gsap.to('#caption7', { opacity: 0, duration: 0.3 })
 
    // 停止 hintClick-img 閃爍並淡出
    if (window._hintClickAnim) {
        window._hintClickAnim.kill()
        window._hintClickAnim = null
    }
    gsap.to('#hintClick-img', { opacity: 0, duration: 0.3 })
 
    scene4.currentTime = 0
    // 確保 scene4 -> scene5 轉場時，其他 scenes 不會透出
    gsap.to('.scene1-container', { opacity: 0, duration: 0.3 })
    gsap.to('.scene2-container', { opacity: 0, duration: 0.3 })
    gsap.to('.scene3-container', { opacity: 0, duration: 0.3 })
    gsap.to('.scene4-container', { opacity: 1, duration: 0.6, pointerEvents: 'auto' })
    scene4.play()

    scene5.currentTime = 0
    scene5.load()

    // scene4 結束後接 scene5 循環播放
    scene4.addEventListener('ended', () => {
        scene5.loop = true
        gsap.to('.scene4-container', { opacity: 0, duration: 0.6 })
        gsap.to('.scene5-container', { opacity: 1, duration: 0, pointerEvents: 'auto' })
        scene5.play()

        // scene5 開始，播放背景音樂
        document.getElementById('scene5bgm').play()

        // scene5 開始後淡入 hintClick 提示文字與圖片，並啟動閃爍動畫
        gsap.to('#hintClick', { opacity: 1, duration: 0.6, delay: 0.3, overwrite: true })
 
        // Mind bubbles 依序點擊出現：bubble1 先出現，點擊後消失再出現 bubble2，依此類推
        const bubbleIds = ['#mindbubble1','#mindbubble2','#mindbubble3','#mindbubble4','#mindbubble5','#mindbubble6']
        let currentBubbleIndex = 0
 
        function showBubble(index) {
            if (index >= bubbleIds.length) {
                // 所有 bubble 點擊完畢，停止閃爍並淡出 hint 提示
                if (window._hintClickScene5Anim) {
                    window._hintClickScene5Anim.kill()
                    window._hintClickScene5Anim = null
                }
                gsap.to('#hintClick-img-scene5', { opacity: 0, duration: 0.6 })
                gsap.to('#hintClick', { opacity: 0, duration: 0.6 })

                // 顯示 relaxOptions 選擇介面
                gsap.to('#relaxOptions', { opacity: 1, duration: 0.8, delay: 0.4, pointerEvents: 'auto' })

                // 點擊 #tea 或 #oil 後切換到 music-overlay
                function goToMusic() {
                    gsap.to('#relaxOptions', { opacity: 0, duration: 0.5, pointerEvents: 'none' })
                    gsap.to('#music-overlay', { opacity: 1, duration: 0.8, delay: 0.3, pointerEvents: 'auto' })
                    document.getElementById('tea').removeEventListener('click', goToMusic)
                    document.getElementById('oil').removeEventListener('click', goToMusic)
                }
                document.getElementById('tea').addEventListener('click', goToMusic)
                document.getElementById('oil').addEventListener('click', goToMusic)
                return
            }
 
            const id = bubbleIds[index]
            const el = document.querySelector(id)
 
            // 淡入當前 bubble，並開啟點擊事件
            gsap.to(id, { opacity: 1, duration: 0.6, ease: 'power1.inOut', onComplete: () => {
                el.style.pointerEvents = 'auto'
            }})
 
            // 點擊後：淡出當前，顯示下一個
            el.addEventListener('click', () => {
                el.style.pointerEvents = 'none'
                gsap.to(id, { opacity: 0, duration: 0.4, ease: 'power1.inOut', onComplete: () => {
                    currentBubbleIndex++
                    showBubble(currentBubbleIndex)
                }})
            }, { once: true })

            // mindbubble6（index === 5）時，hint 位置往右上移動 10%；
            // 其他 bubble 維持 CSS 預設位置（top: 30%, left: 60%）
            if (index === 5) {
                gsap.set('#hintClick-img-scene5', { top: '26%', left: '65%' })
            } else {
                gsap.set('#hintClick-img-scene5', { top: '30%', left: '58%' })
            }

            gsap.to('#hintClick-img-scene5', {
                opacity: 1,
                duration: 0.8,
                delay: 0.3,
                overwrite: true,
                onComplete: () => {
                    window._hintClickScene5Anim = gsap.to('#hintClick-img-scene5', {
                        opacity: 0,
                        duration: 0.7,
                        ease: 'power1.inOut',
                        repeat: -1,
                        yoyo: true
                    })
                }
            })
        }
        gsap.delayedCall(1.0, () => showBubble(0))
    }, { once: true })
})

// 音樂按鈕：點擊後播放對應音樂，並淡出選擇介面
const lofi = document.getElementById('lofi')
const classical = document.getElementById('classical')
const lofiBtn = document.getElementById('lofiBtn')
const classicalBtn = document.getElementById('classicalBtn')

lofiBtn.addEventListener('click', () => playMusic(lofi))
classicalBtn.addEventListener('click', () => playMusic(classical))

// scene6 ~ scene9 相關元素
const scene6Img = document.getElementById('scene6-img')
const scene6 = document.getElementById('scene6')
const scene7 = document.getElementById('scene7')
const scene8 = document.getElementById('scene8')
const scene9 = document.getElementById('scene9')

function playMusic(audio) {
    lofi.pause()
    classical.pause()
    lofi.currentTime = 0
    classical.currentTime = 0
    audio.play()

    // 停止 scene5 背景音樂
    const scene5bgm = document.getElementById('scene5bgm')
    scene5bgm.pause()
    scene5bgm.currentTime = 0

    // 立刻將 scene6-container 墊到最上層並設為不透明黑底，
    // 確保 music-overlay 淡出時 scene5 不會透出
    gsap.set('.scene6-container', { zIndex: 60, opacity: 1, backgroundColor: '#000', pointerEvents: 'auto' })

    // music-overlay 淡出，同時 scene6-img 延遲淡入
    gsap.to('#music-overlay', { opacity: 0, duration: 0.8, pointerEvents: 'none' })
    gsap.to('#scene6-img', {
        opacity: 1,
        duration: 0.8,
        delay: 0.4,
        pointerEvents: 'auto',
        onComplete: () => {
            // scene6-img 淡入完成後，hintClick-img-scene6 與 caption7.5 同時淡入，hint 開始閃爍
            gsap.to('#hintClick-img-scene6', {
                opacity: 1,
                duration: 0.6,
                delay: 0.3,
                onComplete: () => {
                    window._hintClickScene6Anim = gsap.to('#hintClick-img-scene6', {
                        opacity: 0,
                        duration: 0.7,
                        ease: 'power1.inOut',
                        repeat: -1,
                        yoyo: true
                    })
                }
            })
            gsap.to('#caption7\\.5', { opacity: 1, duration: 0.6, delay: 0.3 })
        }
    })

    // scene5 完全被遮住後停止播放，節省資源
    gsap.delayedCall(0.9, () => {
        scene5.pause()
        gsap.set('.scene5-container', { opacity: 0, pointerEvents: 'none' })
    })
}

// 點擊 scene6-img 後播放 scene6 影片（crossfade，避免黑色畫面）
scene6Img.addEventListener('click', () => {
    // 停止閃爍動畫並淡出提示
    if (window._hintClickScene6Anim) {
        window._hintClickScene6Anim.kill()
        window._hintClickScene6Anim = null
    }
    gsap.to('#hintClick-img-scene6', { opacity: 0, duration: 0.3 })
    gsap.to('#caption7\\.5', { opacity: 0, duration: 0.3 })

    scene6.currentTime = 0
    scene6.play()

    // scene6 開始，停止 scene5 背景音樂
    const scene5bgm = document.getElementById('scene5bgm')
    scene5bgm.pause()
    scene5bgm.currentTime = 0

    gsap.to('#scene6-img', { opacity: 0, duration: 0.8, pointerEvents: 'none' })
    gsap.to('#scene6', { opacity: 1, duration: 0.8 })
})

// scene6 結束 → scene8
scene6.addEventListener('ended', () => {
    gsap.to('#scene6', { opacity: 0, duration: 0.6 })
    gsap.to('.scene6-container', { opacity: 0, duration: 0.6, pointerEvents: 'none' })
    gsap.to('.scene8-container', { opacity: 1, duration: 0.6, pointerEvents: 'auto' })
    scene8.currentTime = 0
    scene8.play()
})

// scene8 結束 → scene9（循環播放）並啟動字幕序列
scene8.addEventListener('ended', () => {

    // ── Step 1：截下 scene8 最後一幀，建立 canvas 凍結層 ──
    const dpr = window.devicePixelRatio || 1
    const dispW = window.innerWidth
    const dispH = window.innerHeight

    const canvas = document.createElement('canvas')
    // 畫布內部解析度乘上 dpr，避免 Retina 螢幕模糊或比例錯誤
    canvas.width  = dispW * dpr
    canvas.height = dispH * dpr
    Object.assign(canvas.style, {
        position:  'fixed',
        top:       '0',
        left:      '0',
        width:     dispW + 'px',
        height:    dispH + 'px',
        zIndex:    '9000',
        pointerEvents: 'none'
    })

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)   // 讓後續繪製以 CSS 像素為單位

    // 模擬 object-fit: cover：計算影片原始比例與容器比例，
    // 取較大的縮放倍率，居中裁切，與畫面上看到的完全一致
    const vw = scene8.videoWidth  || dispW
    const vh = scene8.videoHeight || dispH
    const scale = Math.max(dispW / vw, dispH / vh)
    const drawW = vw * scale
    const drawH = vh * scale
    const offsetX = (dispW - drawW) / 2
    const offsetY = (dispH - drawH) / 2
    ctx.drawImage(scene8, offsetX, offsetY, drawW, drawH)

    document.body.appendChild(canvas)

    // ── Step 2：在 canvas 保護下，靜默 seek scene9 到第 0 幀 ──
    gsap.set('.scene9-container', { opacity: 1, pointerEvents: 'auto' })
    gsap.set('#scene9', { opacity: 1 })
    gsap.set('.scene8-container', { opacity: 0, pointerEvents: 'none' })

    scene9.loop = true
    scene9.currentTime = 0

    // ── Step 3：等 scene9 第一幀解碼完成後，移除凍結 canvas ──
    function doTransition() {
        scene9.play()

        // canvas 淡出（0.5 秒），消失後移除 DOM，scene9 影片完整顯現
        gsap.to(canvas, {
            opacity: 0,
            duration: 0.5,
            ease: 'power1.inOut',
            onComplete: () => canvas.remove()
        })

        // 字幕序列在 canvas 淡出後延遲啟動
        gsap.delayedCall(1.4, () => startScene9Captions())
    }

    scene9.addEventListener('seeked', doTransition, { once: true })

    // 保險機制：seeked 若 300ms 內未觸發則強制執行
    const fallback = setTimeout(() => {
        scene9.removeEventListener('seeked', doTransition)
        doTransition()
    }, 300)
    scene9.addEventListener('seeked', () => clearTimeout(fallback), { once: true })
})

// ── scene9 字幕序列 ──
// caption8 自動出現，之後每點擊一次推進到下一條字幕（caption9 → caption10 → caption11）
// 每次等待點擊時底部顯示 hintClick.png 閃爍提示；caption11 出現後不再顯示 hint
function startScene9Captions() {
    const hintEl = document.getElementById('hintClick-img-scene9')

    const captions = ['#caption8', '#caption9', '#caption10', '#caption11']
    let currentIndex = 0

    function showHint() {
        stopHint()
        gsap.to(hintEl, {
            opacity: 1,
            duration: 0.9,
            // delay: 1 → hint 比字幕晚 1 秒開始淡入
            delay: 1.0,
            onComplete: () => {
                window._hintScene9Anim = gsap.to(hintEl, {
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power1.inOut',
                    repeat: -1,
                    yoyo: true
                })
            }
        })
    }

    function stopHint() {
        if (window._hintScene9Anim) {
            window._hintScene9Anim.kill()
            window._hintScene9Anim = null
        }
        // 取消尚未執行的 showHint delay（若使用者在 0.4s 內點擊）
        gsap.killTweensOf(hintEl)
    }

    function showCaption(index) {
        if (index >= captions.length) {
            // 全部字幕顯示完畢
            stopHint()
            gsap.to(hintEl, { opacity: 0, duration: 0.5 })
            return
        }

        // 淡入當前字幕
        gsap.to(captions[index], { opacity: 1, duration: 0.8 })

        // 最後一條字幕（caption11）不需要 hint 也不需要監聽點擊
        if (index === captions.length - 1) {
            stopHint()
            gsap.to(hintEl, { opacity: 0, duration: 0.5 })
            gsap.to('#theEnd', { opacity: 1, duration: 1.5, delay: 1.0 })
            return
        }

        // caption8 / caption9 / caption10：
        // hint 延遲 0.4 秒後才淡入（delay 設定在 showHint 內部）
        showHint()

        document.addEventListener('click', function onClick() {
            stopHint()
            gsap.to(hintEl, { opacity: 0, duration: 0.3 })
            // 淡出當前字幕，再推進下一條
            gsap.to(captions[index], {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    currentIndex++
                    showCaption(currentIndex)
                }
            })
        }, { once: true })
    }

    showCaption(0)
}