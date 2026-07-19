// 1. จำลองฐานข้อมูลมังงะ (ปรับโครงสร้างให้รองรับ BGM และแก้ไขปีกกาที่พัง)
const mangaData = {
  Knightsoul_Vacation: {
    bgm: "assets/action-story/battle-theme.mp3", // เพลงคลอหลังแนวตื่นเต้น
    scenes: [
      { img: "asset/Knightsoul Vacation/1.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/2.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/3.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/4.png", sfx: "" },
      { img: "asset/Knightsoul Vacation/5.png", sfx: "asset/Knightsoul Vacation/Test.mp3" },
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
    bgm: "sounds/ambient-dark.mp3", // เพลงคลอหลังหลอนๆ (หาไฟล์มาใส่เพิ่มได้ครับ)
    scenes: [
      { img: "https://via.placeholder.com/800x1200/ffffff/000000?text=[Horror]+Scene+1+Dark+Corridor", sfx: "sounds/creak.mp3" },
      { img: "https://via.placeholder.com/800x1200/ffffff/000000?text=[Horror]+Scene+2+Footsteps", sfx: "sounds/footsteps.mp3" }
    ]
  },
  romance: {
    bgm: "sounds/sweet-piano.mp3", // เพลงคลอหลังหวานๆ (หาไฟล์มาใส่เพิ่มได้ครับ)
    scenes: [
      { img: "https://via.placeholder.com/800x1200/ffffff/000000?text=[Romance]+Scene+1+Under+Sakura", sfx: "sounds/wind-chime.mp3" },
      { img: "https://via.placeholder.com/800x1200/ffffff/000000?text=[Romance]+Scene+2+Eye+Contact", sfx: "sounds/heartbeat.mp3" }
    ]
  }
};

// 2. ดึงค่าจาก URL เช่น ?story=action
const urlParams = new URLSearchParams(window.location.search);
const storyParam = urlParams.get('story') || 'action';
const currentStory = mangaData[storyParam];

// สถานะและตัวแปรจัดการระบบเสียง
let isMuted = false;
let bgmAudio = null;      // ใช้เก็บอ็อบเจกต์ของเพลงคลอหลัง
const activeSFXs = [];    // ใช้เก็บอ็อบเจกต์เสียงเอฟเฟคฉากที่กำลังเล่นอยู่

const viewer = document.getElementById('manga-viewer');
const muteBtn = document.getElementById('mute-btn');

// 🔥 ฟังก์ชันเริ่มเล่นเพลงคลอหลัง (BGM) วนลูปเบาๆ
function startBGM(url) {
  if (!url) return;
  bgmAudio = new Audio(url);
  bgmAudio.loop = true;   // ตั้งให้เล่นวนลูปไม่มีวันจบ
  bgmAudio.volume = 0.25; // เปิดคลอเบาๆ ที่ 25% จะได้ไม่กลบเสียงเอฟเฟค
  
  bgmAudio.play().catch(err => {
    console.log("Browser บล็อกเสียง BGM: จะทำงานเมื่อผู้ใช้ตอบโต้หน้าจอ", err);
  });
}

// สั่งให้เพลง BGM ทำงานทันทีที่เข้าหน้านี้
if (currentStory && currentStory.bgm) {
  startBGM(currentStory.bgm);
}

// 3. สร้างหน้ามังงะลงใน HTML (เปลี่ยนไปดึงจาก currentStory.scenes)
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

// 4. ระบบตรวจจับการเลื่อน (Scroll Tracking) โดยใช้ Intersection Observer
const observerOptions = {
  root: null, 
  rootMargin: '0px',
  threshold: 0.5 // เมื่อฉากโผล่มาเห็นในหน้าจอเกิน 50% ให้ทำงาน
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const sfxUrl = entry.target.dataset.sfx;
      
      // เช็คว่าฉากนี้มีเสียงเอฟเฟค และยังไม่เคยเล่นใช่ไหม
      if (sfxUrl && !entry.target.dataset.played) {
        playSFX(sfxUrl);
        entry.target.dataset.played = "true"; // มาร์คไว้ว่าเล่นแล้ว
      }
    }
  });
}, observerOptions);

// สั่งให้จับตาดูทุกฉากมังงะ
document.querySelectorAll('.manga-scene').forEach(scene => {
  observer.observe(scene);
});

// 5. ฟังก์ชันสำหรับเล่นเสียงเอฟเฟคฉาก (SFX)
function playSFX(url) {
  if (isMuted) return; 

  const audio = new Audio(url);
  audio.volume = 0.7; // ตั้งความดัง 70% ให้ดังชัดกว่าเสียงเพลงคลอหลัง
  
  activeSFXs.push(audio);
  
  audio.play().catch(err => {
    console.log("Browser บล็อกเสียง SFX:", err);
  });

  // พอเสียงเล่นจบ ให้ลบออกจากรายการเสียงที่ทำงานอยู่
  audio.onended = () => {
    const index = activeSFXs.indexOf(audio);
    if (index > -1) activeSFXs.splice(index, 1);
  };
}

// 6. ระบบปุ่มเปิด-ปิดเสียง (Toggle Mute) - ควบคุมทั้ง BGM และ SFX พร้อมกัน
muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  
  if (isMuted) {
    muteBtn.innerText = "🔇 ปิดเสียงอยู่";
    // 1) หยุดเพลงคลอหลัง
    if (bgmAudio) bgmAudio.pause();
    // 2) หยุดเสียงเอฟเฟคทุกตัวที่กำลังดังอยู่ ณ ตอนนั้น
    activeSFXs.forEach(audio => audio.pause());
  } else {
    muteBtn.innerText = "🔊 เปิดเสียงอยู่";
    // เล่นเพลงคลอหลังต่อจากจุดเดิม
    if (bgmAudio) bgmAudio.play().catch(err => console.log(err));
  }
});