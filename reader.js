// 1. จำลองฐานข้อมูลมังงะ (อัปเดตรายชื่อภาพจริงของเรื่อง Knightsoul Vacation แล้ว)
const mangaData = {
  Knightsoul_Vacation: {
    bgm: "assets/action-story/battle-theme.mp3", // เพลงคลอหลังแนวตื่นเต้น
    scenes: [
      { img: "asset/Knightsoul Vacation/1.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/2.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/3.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/4.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/5.png", sfx: "asset/Knightsoul Vacation/Test.mp3" }, // 💥 มีเสียงเอฟเฟคเฉพาะฉากที่ 5 เท่านั้น
      { img: "asset/Knightsoul Vacation/6.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/7.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/8.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/9.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/10.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/11.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/12.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/13.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/14.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/15.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/16.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/17.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/18.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/19.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/20.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/21.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/22.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/23.png", sfx: "" }
    ]
  },
  horror: {
    bgm: "sounds/ambient-dark.mp3", 
    scenes: [
      { img: "https://via.placeholder.com/800x1200/ffffff/000000?text=[Horror]+Scene+1+Dark+Corridor", sfx: "sounds/creak.mp3" },
      { img: "https://via.placeholder.com/800x1200/ffffff/000000?text=[Horror]+Scene+2+Footsteps", sfx: "sounds/footsteps.mp3" }
    ]
  },
  romance: {
    bgm: "sounds/sweet-piano.mp3", 
    scenes: [
      { img: "https://via.placeholder.com/800x1200/ffffff/000000?text=[Romance]+Scene+1+Under+Sakura", sfx: "sounds/wind-chime.mp3" },
      { img: "https://via.placeholder.com/800x1200/ffffff/000000?text=[Romance]+Scene+2+Eye+Contact", sfx: "sounds/heartbeat.mp3" }
    ]
  }
};

// 2. ดึงค่าจาก URL (แก้ไขให้ค่าเริ่มต้นตรงกับคีย์ Knightsoul_Vacation)
const urlParams = new URLSearchParams(window.location.search);
const storyParam = urlParams.get('story') || 'Knightsoul_Vacation'; // เปลี่ยนเป็นเรื่องใหม่เรียบร้อย
const currentStory = mangaData[storyParam];

// สถานะและตัวแปรจัดการระบบเสียง
let isMuted = false;
let bgmAudio = null;      
const activeSFXs = [];    

const viewer = document.getElementById('manga-viewer');
const muteBtn = document.getElementById('mute-btn');
const loadingScreen = document.getElementById('loading-screen'); // ดึง element หน้าโหลดมารองรับ

// 3. สร้างหน้ามังงะลงใน HTML ทันทีเพื่อให้เบราว์เซอร์เริ่มดาวน์โหลดรูปล่วงหน้า
if (currentStory && currentStory.scenes) {
  currentStory.scenes.forEach((scene, index) => {
    const sceneDiv = document.createElement('div');
    sceneDiv.classList.add('manga-scene');
    sceneDiv.dataset.index = index;
    sceneDiv.dataset.sfx = scene.sfx;

    const img = document.createElement('img');
    img.src = scene.img;
    img.alt = `Scene ${index + 1}`;

    sceneDiv.appendChild(img);
    viewer.appendChild(sceneDiv);
  });
}

// 4. ฟังก์ชันหลัก: จะทำงานเมื่อรูปภาพและทุกอย่างในหน้าเว็บโหลดเสร็จสมบูรณ์แล้ว 
// (แก้อาการเอฟเฟคดังซ้อนกันตั้งแต่ตอนเริ่มเข้าเว็บ)
function initMangaReader() {
  // สั่งซ่อนหน้าจอ Loading (ถ้าใน HTML มี tag id="loading-screen" อยู่)
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');
  }

  // สั่งเปิดเพลงคลอหลัง (BGM)
  if (currentStory && currentStory.bgm) {
    startBGM(currentStory.bgm);
  }

  // เริ่มรันระบบตรวจจับการเลื่อนหน้าจอด้วย Intersection Observer
  const observerOptions = {
    root: null, 
    rootMargin: '0px',
    threshold: 0.5 // เห็นรูปเกินครึ่งจอแล้วเสียงถึงจะดัง
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sfxUrl = entry.target.dataset.sfx;
        
        // เล่นเสียงเฉพาะเมื่อมีไฟล์เสียงผูกไว้ และยังไม่เคยเล่นในรอบนี้
        if (sfxUrl && !entry.target.dataset.played) {
          playSFX(sfxUrl);
          entry.target.dataset.played = "true"; 
        }
      }
    });
  }, observerOptions);

  // สั่งให้ตัวสแกน เริ่มจับตาดูความเคลื่อนไหวของรูปมังงะทั้งหมด
  document.querySelectorAll('.manga-scene').forEach(scene => {
    observer.observe(scene);
  });
}

// 🔥 บังคับให้ระบบเสียงและการตรวจจับการเลื่อน เริ่มทำงานหลังจากหน้าเว็บโหลดเสร็จนิ่งสนิท
window.addEventListener('load', initMangaReader);

// 5. ฟังก์ชันสำหรับเล่นเพลงคลอหลัง (BGM) วนลูปเบาๆ
function startBGM(url) {
  if (!url) return;
  bgmAudio = new Audio(url);
  bgmAudio.loop = true;   
  bgmAudio.volume = 0.25; 
  bgmAudio.play().catch(err => {
    console.log("Browser บล็อกเสียง BGM: จะทำงานเมื่อผู้ใช้ตอบโต้หน้าจอ", err);
  });
}

// 6. ฟังก์ชันสำหรับเล่นเสียงเอฟเฟคฉาก (SFX)
function playSFX(url) {
  if (isMuted) return; 

  const audio = new Audio(url);
  audio.volume = 0.7; // ให้เสียงเอฟเฟคดังชัดเด่นขึ้นมาจากเพลงคลอหลัง
  
  activeSFXs.push(audio);
  audio.play().catch(err => {
    console.log("Browser บล็อกเสียง SFX:", err);
  });

  audio.onended = () => {
    const index = activeSFXs.indexOf(audio);
    if (index > -1) activeSFXs.splice(index, 1);
  };
}

// 7. ระบบปุ่มเปิด-ปิดเสียง (Toggle Mute) - ควบคุมทั่ง BGM และ SFX พร้อมกัน
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  
  if (isMuted) {
    muteBtn.innerText = "🔇 ปิดเสียงอยู่";
    if (bgmAudio) bgmAudio.pause();
    activeSFXs.forEach(audio => audio.pause());
  } else {
    muteBtn.innerText = "🔊 เปิดเสียงอยู่";
    if (bgmAudio) bgmAudio.play().catch(err => console.log(err));
  }
});