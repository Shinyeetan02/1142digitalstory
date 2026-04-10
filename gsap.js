// 載入 ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

// 第一幀
const scene1 = document.getElementById('scene1')
// 第二幀
const scene2 = document.getElementById('scene2')
// 第三幀
const scene3 = document.getElementById('scene3')
// 按鈕1：進入故事
const playBtn = document.getElementById('playBtn')
// 時間軸建立，影片一開始先paused
const tl = gsap.timeline({ paused: true })

// 按鈕1：點擊進入故事後按鈕opacity調整為0
playBtn.addEventListener('click', () => {
    scene1.play()
    gsap.to(playBtn, { opacity: 0, duration: 0.3, pointerEvents: 'none' })
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
    // Scene3 滾動
    ScrollTrigger.create({
        trigger: document.body,
        start: '75% top',
        end: '100% top',
        onUpdate: (self) => {
            if (window._scene3Active) {
                scene3.currentTime = self.progress * scene3.duration
            }
        }
    })
}

// Scene3 顯示：scene2 fade out 與 scene3 fade in 同時進行（crossfade，避免 scene1 露出）
function showScene3() {
    scene3.currentTime = 0
    scene3.play()

    gsap.to('.scene2-container', { opacity: 0, duration: 0.6 })
    gsap.to('.scene3-container', { opacity: 1, duration: 0.6 })
}

// Scene2 回復：scene3 fade out 與 scene2 fade in 同時進行（crossfade，避免 scene1 露出）
function showScene2() {
    scene3.pause()

    gsap.to('.scene3-container', { opacity: 0, duration: 0.6 })
    gsap.to('.scene2-container', {
        opacity: 1,
        duration: 0.6,
        onStart: () => { scene2.currentTime = scene2.duration } // 停在最後一幀
    })
}