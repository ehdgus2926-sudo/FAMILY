/* ===================================================================
   예원'S Family Story - 웹 인터랙션 및 오디오 엔진
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeManager();
  initPetalAnimation();
  initAudioManager();
  initBirthdayCalculators();
  initAvatarUploader();
  initAlbumGallery();
  initTravelBucketList();
  initLettersSystem();
  initCelebrationBoard();
  initNavScroll();
});

/* ===================================================================
   1. 테마 매니저
   =================================================================== */
function initThemeManager() {
  const themeSelect = document.getElementById('theme-select');
  if (!themeSelect) return;

  const savedTheme = localStorage.getItem('family_theme') || 'warm-peach';
  document.body.setAttribute('data-theme', savedTheme);
  themeSelect.value = savedTheme;

  themeSelect.addEventListener('change', (e) => {
    const theme = e.target.value;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('family_theme', theme);
  });
}

/* ===================================================================
   2. 봄날 벚꽃 꽃잎 애니메이션 (Canvas)
   =================================================================== */
function initPetalAnimation() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const petalCount = 28;

  class Petal {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 8 + 7;
      this.speedX = Math.random() * 1.5 - 0.5;
      this.speedY = Math.random() * 0.9 + 0.6;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = Math.random() * 0.02 - 0.01;
      this.opacity = Math.random() * 0.4 + 0.35;
    }
    update() {
      this.x += this.speedX + Math.sin(this.angle) * 0.4;
      this.y += this.speedY;
      this.angle += this.spin;

      if (this.y > height + 20 || this.x > width + 20 || this.x < -20) {
        this.reset();
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = `rgba(255, 192, 203, ${this.opacity})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(this.size, -this.size / 2, this.size, this.size / 2, 0, this.size);
      ctx.bezierCurveTo(-this.size, this.size / 2, -this.size, -this.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < petalCount; i++) {
    petals.push(new Petal());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ===================================================================
   3. 감성 피아노 배경음악 시스템 (Web Audio Synthesizer)
   =================================================================== */
function initAudioManager() {
  const toggleBtn = document.getElementById('audio-toggle-btn');
  const player = document.getElementById('floating-player');
  const volumeSlider = document.getElementById('audio-volume');
  const trackTitle = document.getElementById('audio-track-title');
  const playerStatus = document.getElementById('audio-status');

  if (!toggleBtn) return;

  let audioCtx = null;
  let isPlaying = false;
  let currentTimer = null;
  let masterGain = null;

  // 잔잔하고 포근한 어쿠스틱 피아노 코드 진행
  // Cmaj9 -> Am9 -> Fmaj7 -> Gsus4 -> Em7
  const chordProgressions = [
    // [베이스, 화음 노트들 (Hz)]
    { bass: 130.81, notes: [261.63, 329.63, 392.00, 493.88, 587.33] }, // Cmaj9
    { bass: 110.00, notes: [220.00, 261.63, 329.63, 392.00, 493.88] }, // Am9
    { bass: 87.31,  notes: [174.61, 261.63, 329.63, 349.23, 440.00] }, // Fmaj7
    { bass: 98.00,  notes: [196.00, 261.63, 293.66, 392.00, 523.25] }, // Gsus4
    { bass: 82.41,  notes: [164.81, 246.94, 329.63, 392.00, 493.88] }, // Em7
    { bass: 110.00, notes: [220.00, 261.63, 329.63, 392.00, 587.33] }  // Am9
  ];

  let currentChordIndex = 0;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(volumeSlider ? parseFloat(volumeSlider.value) : 0.4, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }

  // 따뜻한 톤의 피아노 음 합성 (부드러운 삼각파 + 온화한 저역통과 필터)
  function playPianoTone(freq, time, duration, velocity = 0.2) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const noteGain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(350, time + duration);

    // 피아노 느낌의 ADSR 엔벨로프
    noteGain.gain.setValueAtTime(0.0001, time);
    noteGain.gain.linearRampToValueAtTime(velocity, time + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(velocity * 0.6, time + 0.35);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  function playNextChordPattern() {
    if (!isPlaying || !audioCtx) return;

    const chord = chordProgressions[currentChordIndex];
    const now = audioCtx.currentTime;

    // 베이스 아르페지오 연주
    playPianoTone(chord.bass, now, 3.2, 0.22);

    // 하모니 노트들을 자연스러운 아르페지오/스트럼으로 순차 타건
    chord.notes.forEach((freq, idx) => {
      const noteDelay = 0.12 * idx + (Math.random() * 0.03);
      playPianoTone(freq, now + noteDelay, 2.8, 0.15);
    });

    // 높은 음역 멜로디 음 포인트 추가
    if (Math.random() > 0.3) {
      const melodyFreq = chord.notes[Math.floor(Math.random() * chord.notes.length)] * 1.5;
      playPianoTone(melodyFreq, now + 0.85, 2.2, 0.12);
    }

    currentChordIndex = (currentChordIndex + 1) % chordProgressions.length;
    currentTimer = setTimeout(playNextChordPattern, 2400);
  }

  function startMusic() {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isPlaying = true;
    toggleBtn.innerHTML = '❚❚';
    toggleBtn.title = '음악 일시정지';
    player.classList.add('playing');
    playerStatus.textContent = '잔잔히 재생 중 🎵';
    playNextChordPattern();
  }

  function stopMusic() {
    isPlaying = false;
    clearTimeout(currentTimer);
    toggleBtn.innerHTML = '▶';
    toggleBtn.title = '배경음악 재생';
    player.classList.remove('playing');
    playerStatus.textContent = '일시 정지됨';
  }

  toggleBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(vol, audioCtx.currentTime);
      }
    });
  }
}

/* ===================================================================
   4. 가족 생일 D-day 계산기
   =================================================================== */
function initBirthdayCalculators() {
  const familyBirthdays = [
    { id: 'bday-father', month: 3, day: 25 },
    { id: 'bday-mother', month: 8, day: 29 },
    { id: 'bday-daughter', month: 10, day: 8 }
  ];

  const today = new Date();
  const currentYear = today.getFullYear();

  familyBirthdays.forEach(member => {
    const el = document.getElementById(member.id);
    if (!el) return;

    let targetDate = new Date(currentYear, member.month - 1, member.day);
    
    // 올해 생일이 이미 지났다면 내년 생일 기준 계산
    const diffTime = targetDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      targetDate = new Date(currentYear + 1, member.month - 1, member.day);
      const nextDiffTime = targetDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
      diffDays = Math.ceil(nextDiffTime / (1000 * 60 * 60 * 24));
    }

    if (diffDays === 0) {
      el.textContent = '🎉 오늘 생신!';
      el.style.backgroundColor = '#f4a261';
      el.style.color = '#fff';
    } else {
      el.textContent = `D-${diffDays}`;
    }
  });
}

/* ===================================================================
   5. 가족 사진 직접 업로드 & 교체 기능
   =================================================================== */
function initAvatarUploader() {
  const members = ['father', 'mother', 'daughter'];

  members.forEach(member => {
    const imgEl = document.getElementById(`avatar-${member}`);
    const btnEl = document.getElementById(`change-${member}-btn`);
    const fileInput = document.getElementById(`file-${member}`);

    // 로컬스토리지에 저장된 사진이 있으면 복원
    const savedImg = localStorage.getItem(`family_avatar_${member}`);
    if (savedImg && imgEl) {
      imgEl.src = savedImg;
    }

    if (btnEl && fileInput) {
      btnEl.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (imgEl) imgEl.src = dataUrl;
          localStorage.setItem(`family_avatar_${member}`, dataUrl);
          alert('가족 사진이 성공적으로 반영되었습니다! ✨');
        };
        reader.readAsDataURL(file);
      });
    }
  });
}

/* ===================================================================
   6. 가족 앨범 & 라이트박스 팝업 & 새 추억 추가
   =================================================================== */
function initAlbumGallery() {
  const initialMemories = [
    {
      id: 1,
      category: 'daily',
      categoryName: '일상',
      title: '알프스 산자락 한옥의 봄날 티타임',
      date: '2026.04.12',
      caption: '스위스 설산을 바라보며 넓은 한옥 정원에서 마시는 따스한 차 한잔. 세 가족의 평화로운 시간.',
      image: 'assets/images/hero.jpg'
    },
    {
      id: 2,
      category: 'celebration',
      categoryName: '기념일',
      title: '아빠의 36년 명예로운 정년퇴임 축하 파티',
      date: '2025.12.31',
      caption: '36년간 헌신해주신 아빠께 바치는 감사 케이크와 축하 파티. "아버지, 진심으로 존경하고 사랑합니다."',
      image: 'assets/images/celebration.jpg'
    },
    {
      id: 3,
      category: 'travel',
      categoryName: '여행',
      title: '봄날 제주 유채꽃밭 힐링 산책',
      date: '2025.04.05',
      caption: '황금빛 유채꽃과 활짝 핀 벚꽃길을 손잡고 걸으며 나눈 이야기들. 영원히 간직할 따스한 추억.',
      image: 'assets/images/travel_spring.jpg'
    }
  ];

  // 로컬스토리지에 추가 저장된 사진 불러오기
  const savedMemories = JSON.parse(localStorage.getItem('family_album_items') || '[]');
  const allMemories = [...initialMemories, ...savedMemories];

  const grid = document.getElementById('album-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function renderAlbum(category = 'all') {
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = category === 'all' 
      ? allMemories 
      : allMemories.filter(m => m.category === category);

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'album-item';
      card.innerHTML = `
        <div class="album-thumb-wrap">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <span class="album-category-badge">${item.categoryName || '추억'}</span>
        </div>
        <div class="album-info">
          <span class="album-date">🗓️ ${item.date}</span>
          <h4 class="album-title">${item.title}</h4>
          <p class="album-caption">${item.caption}</p>
        </div>
      `;

      card.addEventListener('click', () => openLightbox(item));
      grid.appendChild(card);
    });
  }

  // 필터 버튼 클릭
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAlbum(btn.dataset.category);
    });
  });

  renderAlbum();

  // 라이트박스 로직
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDate = document.getElementById('lightbox-date');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(item) {
    if (!lightboxModal) return;
    lightboxImg.src = item.image;
    lightboxTitle.textContent = item.title;
    lightboxDate.textContent = item.date;
    lightboxDesc.textContent = item.caption;
    lightboxModal.classList.add('active');
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
  }
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.remove('active');
    });
  }

  // 새 추억 등록 모달
  const addMemoryBtn = document.getElementById('add-memory-btn');
  const addMemoryModal = document.getElementById('add-memory-modal');
  const addMemoryClose = document.getElementById('add-memory-close');
  const memoryForm = document.getElementById('memory-form');

  if (addMemoryBtn && addMemoryModal) {
    addMemoryBtn.addEventListener('click', () => addMemoryModal.classList.add('active'));
    addMemoryClose.addEventListener('click', () => addMemoryModal.classList.remove('active'));
    addMemoryModal.addEventListener('click', (e) => {
      if (e.target === addMemoryModal) addMemoryModal.classList.remove('active');
    });

    if (memoryForm) {
      memoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('mem-title').value.trim();
        const category = document.getElementById('mem-category').value;
        const categoryName = document.getElementById('mem-category').selectedOptions[0].text;
        const date = document.getElementById('mem-date').value || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
        const caption = document.getElementById('mem-caption').value.trim();
        const fileInput = document.getElementById('mem-file');

        if (!title || !caption) {
          alert('제목과 내용을 입력해주세요.');
          return;
        }

        const handleSave = (imgUrl) => {
          const newMem = {
            id: Date.now(),
            category,
            categoryName,
            title,
            date,
            caption,
            image: imgUrl || 'assets/images/hero.jpg'
          };
          savedMemories.unshift(newMem);
          localStorage.setItem('family_album_items', JSON.stringify(savedMemories));
          allMemories.unshift(newMem);
          renderAlbum('all');
          memoryForm.reset();
          addMemoryModal.classList.remove('active');
          alert('소중한 가족 추억이 앨범에 등록되었습니다! 📸');
        };

        if (fileInput.files && fileInput.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => handleSave(ev.target.result);
          reader.readAsDataURL(fileInput.files[0]);
        } else {
          handleSave('assets/images/hero.jpg');
        }
      });
    }
  }
}

/* ===================================================================
   7. 가족 여행 버킷리스트
   =================================================================== */
function initTravelBucketList() {
  const defaultBuckets = [
    { id: 1, text: '🇨🇭 스위스 융프라우 & 체르마트 기차 여행', votes: 12 },
    { id: 2, text: '🇫🇷 남프랑스 프로방스 라벤더 로드 드라이브', votes: 9 },
    { id: 3, text: '🌴 하와이 마우이섬 해변 휴양 & 선셋 디너', votes: 15 },
    { id: 4, text: '🇯🇵 홋카이도 온천 료칸 힐링 겨울 여행', votes: 8 }
  ];

  let buckets = JSON.parse(localStorage.getItem('family_travel_buckets') || 'null') || defaultBuckets;
  const listEl = document.getElementById('bucket-list');
  const addBtn = document.getElementById('add-bucket-btn');

  function renderBuckets() {
    if (!listEl) return;
    listEl.innerHTML = '';
    buckets.forEach(b => {
      const item = document.createElement('div');
      item.className = 'bucket-item';
      item.innerHTML = `
        <span>${b.text}</span>
        <button class="vote-btn" title="응원/투표">❤️ <strong>${b.votes}</strong></button>
      `;
      item.querySelector('.vote-btn').addEventListener('click', () => {
        b.votes++;
        localStorage.setItem('family_travel_buckets', JSON.stringify(buckets));
        renderBuckets();
      });
      listEl.appendChild(item);
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const newPlace = prompt('우리 가족이 함께 가고 싶은 새로운 여행지를 적어주세요:');
      if (newPlace && newPlace.trim()) {
        buckets.push({ id: Date.now(), text: `✨ ${newPlace.trim()}`, votes: 1 });
        localStorage.setItem('family_travel_buckets', JSON.stringify(buckets));
        renderBuckets();
      }
    });
  }

  renderBuckets();
}

/* ===================================================================
   8. 가족에게 전하는 편지 시스템 (Letters)
   =================================================================== */
function initLettersSystem() {
  const initialLetters = [
    {
      id: 1,
      to: '사랑하는 아빠에게',
      from: '딸 예원 올림',
      date: '2026.01.01',
      preview: '아빠, 36년이라는 기나긴 세월 동안 비바람을 막아주신 가장 든든한 우리 집의 큰 기둥이 되어주셔서 진심으로 감사드려요. 은퇴 후 맞이하신 매일매일이 봄날처럼 따스하고 행복하셨으면 좋겠어요. 아빠 딸이라서 세상에서 제일 행복해요. 사랑합니다!',
      content: `사랑하는 아빠에게,\n\n아빠, 36년이라는 기나긴 세월 동안 비바람을 막아주신 가장 든든한 우리 집의 큰 기둥이 되어주셔서 진심으로 감사드려요.\n\n매일 아침 성실함 하나로 가족을 위해 일터로 향하시던 아빠의 묵묵한 뒷모습을 보며 저는 바르고 씩씩하게 자랄 수 있었습니다.\n은퇴 후 맞이하신 매일매일이 햇살 가득한 봄날처럼 여유롭고 행복하셨으면 좋겠어요.\n앞으로는 아빠가 좋아하시는 여행도 많이 다니시고, 정원에서 엄마와 따뜻한 차도 마음껏 즐기세요.\n\n아빠의 딸이라서 세상에서 제일 자랑스럽고 행복합니다.\n언제나 건강하시고 오래오래 우리 곁에 계셔주세요. 사랑합니다! ❤️\n\n- 우리 집의 보물, 딸 예원 올림`
    },
    {
      id: 2,
      to: '우리 집의 보물 예원이에게',
      from: '자상한 아빠가',
      date: '2026.01.15',
      preview: '착하고 밝게 자라주어 우리 집의 가장 큰 행복이 되어준 예원아. IBK 기업은행에서 멋지게 사회생활을 해나가는 모습을 보면 아빠는 늘 가슴이 벅차단다. 언제나 너의 든든한 편이 되어줄게.',
      content: `우리 집의 보물 예원이에게,\n\n착하고 예쁘게, 그리고 누구보다 바르게 자라주어 엄마 아빠의 가장 큰 기쁨이자 자랑이 되어준 사랑하는 딸 예원아.\n\n36년간 직장 생활을 무사히 마치고 은퇴할 수 있었던 것도, 힘들 때마다 활짝 웃어주던 너의 밝은 미소 덕분이었단다.\nIBK 기업은행에서 당당하고 지혜롭게 역할을 해내는 모습을 볼 때마다 아빠는 가슴이 뭉클하고 자랑스럽기 그지없다.\n\n세상을 살아가며 때로는 지치는 날도 있겠지만, 너의 뒤에는 항상 너를 무조건적으로 믿고 사랑하는 엄마 아빠가 있다는 걸 잊지 마렴.\n우리 예원이의 앞날에 늘 꽃길만 펼쳐지길 매일 기도한단다.\n사랑한다, 내 소중한 딸! 🌸\n\n- 너를 세상에서 가장 사랑하는 아빠가`
    },
    {
      id: 3,
      to: '세상에서 가장 소중한 남편과 딸에게',
      from: '엄마가',
      date: '2026.02.14',
      preview: '언제나 서로를 먼저 배려하고 아껴주는 우리 가족. 36년간 헌신해 준 든든한 남편과 착하고 사랑스러운 우리 딸 예원이가 있어 내 삶은 언제나 감사와 행복으로 가득합니다.',
      content: `세상에서 가장 소중한 남편과 딸에게,\n\n가훈처럼 "서로 사랑(愛)하고, 아름답고(美), 착하게(善)" 살아온 우리 세 사람.\n\n평생 가족을 위해 헌신하고 명예롭게 은퇴한 존경하는 당신, 그리고 밝고 성실하게 자라 우리 가족의 비타민이 되어주는 착한 딸 예원이.\n두 사람이 있어 평범했던 내 삶의 모든 순간들이 기적처럼 아름다운 날들이 되었습니다.\n\n알프스 산자락 한옥 정원에서 함께 나누는 따스한 차 한 잔처럼, 우리 가족의 앞날도 늘 포근하고 다정한 온기로 가득하길 소망합니다.\n매일매일 더 많이 아끼고 사랑해요. 우리 영원히 행복합시다! 🕊️\n\n- 가족의 든든한 수호천사 엄마가`
    }
  ];

  const savedLetters = JSON.parse(localStorage.getItem('family_letters') || '[]');
  const allLetters = [...initialLetters, ...savedLetters];

  const grid = document.getElementById('letters-grid');
  const readModal = document.getElementById('read-letter-modal');
  const readClose = document.getElementById('read-letter-close');
  const readTo = document.getElementById('read-letter-to');
  const readFrom = document.getElementById('read-letter-from');
  const readDate = document.getElementById('read-letter-date');
  const readBody = document.getElementById('read-letter-body');

  function renderLetters() {
    if (!grid) return;
    grid.innerHTML = '';

    allLetters.forEach(l => {
      const card = document.createElement('div');
      card.className = 'letter-card';
      card.innerHTML = `
        <div class="letter-envelope-icon">💌</div>
        <h4 class="letter-to">${l.to}</h4>
        <div class="letter-from">${l.from}</div>
        <p class="letter-preview">${l.preview}</p>
        <div class="letter-footer">
          <span class="letter-date">${l.date}</span>
          <button class="read-more-btn">편지 전문 읽기 ✉️</button>
        </div>
      `;

      card.querySelector('.read-more-btn').addEventListener('click', () => {
        if (!readModal) return;
        readTo.textContent = l.to;
        readFrom.textContent = l.from;
        readDate.textContent = l.date;
        readBody.textContent = l.content || l.preview;
        readModal.classList.add('active');
      });

      grid.appendChild(card);
    });
  }

  if (readClose) {
    readClose.addEventListener('click', () => readModal.classList.remove('active'));
  }
  if (readModal) {
    readModal.addEventListener('click', (e) => {
      if (e.target === readModal) readModal.classList.remove('active');
    });
  }

  // 새 편지 작성 모달
  const writeBtn = document.getElementById('write-letter-btn');
  const writeModal = document.getElementById('write-letter-modal');
  const writeClose = document.getElementById('write-letter-close');
  const writeForm = document.getElementById('letter-form');

  if (writeBtn && writeModal) {
    writeBtn.addEventListener('click', () => writeModal.classList.add('active'));
    writeClose.addEventListener('click', () => writeModal.classList.remove('active'));
    writeModal.addEventListener('click', (e) => {
      if (e.target === writeModal) writeModal.classList.remove('active');
    });

    if (writeForm) {
      writeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const to = document.getElementById('letter-to-input').value.trim();
        const from = document.getElementById('letter-from-input').value.trim();
        const content = document.getElementById('letter-content-input').value.trim();

        if (!to || !from || !content) {
          alert('받는 사람, 보내는 사람, 편지 내용을 모두 작성해주세요.');
          return;
        }

        const newLetter = {
          id: Date.now(),
          to,
          from,
          date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
          preview: content.slice(0, 120) + (content.length > 120 ? '...' : ''),
          content
        };

        savedLetters.unshift(newLetter);
        localStorage.setItem('family_letters', JSON.stringify(savedLetters));
        allLetters.unshift(newLetter);
        renderLetters();
        writeForm.reset();
        writeModal.classList.remove('active');
        alert('가족에게 보내는 사랑의 편지가 안전하게 전달되었습니다! 💌');
      });
    }
  }

  renderLetters();
}

/* ===================================================================
   9. 연중 기념일 & 축하 메시지 방명록
   =================================================================== */
function initCelebrationBoard() {
  const initialMessages = [
    {
      id: 1,
      author: '예원이',
      emoji: '💐',
      content: '아빠, 36년간의 명예로운 직장 생활과 은퇴를 온 마음으로 축하드립니다! 이제 세상에서 가장 여유롭고 행복한 시간들을 보내세요!',
      time: '2026.01.01',
      likes: 8
    },
    {
      id: 2,
      author: '아빠',
      emoji: '🌸',
      content: '우리 집의 자랑스러운 보물 예원아, IBK 기업은행에서의 멋진 도전을 아빠가 늘 힘차게 응원한다! 사랑한다 우리 딸!',
      time: '2026.01.10',
      likes: 12
    },
    {
      id: 3,
      author: '엄마',
      emoji: '💖',
      content: '서로 사랑하며 아름답고 착하게 살아온 우리 세 가족. 앞으로도 알프스 한옥에서 매일매일 행복한 추억만 쌓아가요!',
      time: '2026.02.05',
      likes: 15
    }
  ];

  const savedMessages = JSON.parse(localStorage.getItem('family_messages') || '[]');
  const allMessages = [...savedMessages, ...initialMessages];

  const streamEl = document.getElementById('messages-stream');
  const formEl = document.getElementById('guestbook-form');
  const emojiBtns = document.querySelectorAll('.emoji-btn');
  let selectedEmoji = '💐';

  emojiBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      emojiBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedEmoji = btn.dataset.emoji || btn.textContent.trim();
    });
  });

  function renderMessages() {
    if (!streamEl) return;
    streamEl.innerHTML = '';

    allMessages.forEach(msg => {
      const note = document.createElement('div');
      note.className = 'message-note';
      note.innerHTML = `
        <div class="note-header">
          <span class="note-author">${msg.emoji} <strong>${msg.author}</strong></span>
          <span class="note-time">${msg.time}</span>
        </div>
        <p class="note-content">${msg.content}</p>
        <div class="note-actions">
          <button class="like-btn">❤️ 응원 <strong>${msg.likes}</strong></button>
        </div>
      `;

      note.querySelector('.like-btn').addEventListener('click', () => {
        msg.likes++;
        localStorage.setItem('family_messages', JSON.stringify(savedMessages));
        renderMessages();
      });

      streamEl.appendChild(note);
    });
  }

  if (formEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const authorInput = document.getElementById('msg-author');
      const contentInput = document.getElementById('msg-content');

      const author = authorInput.value.trim();
      const content = contentInput.value.trim();

      if (!author || !content) {
        alert('이름과 축하 메시지를 입력해주세요.');
        return;
      }

      const newMsg = {
        id: Date.now(),
        author,
        emoji: selectedEmoji,
        content,
        time: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
        likes: 1
      };

      savedMessages.unshift(newMsg);
      allMessages.unshift(newMsg);
      localStorage.setItem('family_messages', JSON.stringify(savedMessages));
      renderMessages();

      contentInput.value = '';
      alert('축하 메시지가 등록되었습니다! 🌸');
    });
  }

  renderMessages();
}

/* ===================================================================
   10. 네비게이션 부드러운 스크롤 & 모바일 메뉴
   =================================================================== */
function initNavScroll() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}
