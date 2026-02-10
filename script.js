function makeHeart(x, y) {
  const img = document.createElement('img');
  img.src = 'assets/heart.svg';
  img.className = 'floating-heart';
  img.style.left = x + 'px';
  img.style.top = y + 'px';
  const scale = 0.7 + Math.random() * 0.8;
  img.style.width = 24 * scale + 'px';
  document.body.appendChild(img);

  const dx = (Math.random() - 0.5) * 80;
  const dy = -120 - Math.random() * 160;
  const duration = 2200 + Math.random() * 1400;
  const start = performance.now();

  function frame(now) {
    const t = (now - start) / duration;
    if (t >= 1) { img.remove(); return }
    const ease = 1 - Math.pow(1 - t, 3);
    img.style.transform = `translate(${dx * ease}px, ${dy * ease}px) scale(${1 - 0.25 * t}) rotate(${t * 20}deg)`;
    img.style.opacity = String(1 - t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

document.getElementById('reveal').addEventListener('click', e => {
  const btn = e.currentTarget;
  document.getElementById('message').classList.remove('hidden');
  btn.disabled = true;
  btn.textContent = 'With all my love ❤️';

  // burst of hearts around the button
  const rect = btn.getBoundingClientRect();
  for (let i = 0; i < 18; i++) {
    setTimeout(() => makeHeart(rect.left + rect.width/2 + (Math.random()-0.5)*80, rect.top + rect.height/2 + (Math.random()-0.5)*40), i * 60);
  }

  // reveal gallery and photos with staggered animation
  const gallerySection = document.querySelector('.gallery-section');
  if (gallerySection && gallerySection.classList.contains('initial-hidden')){
    gallerySection.classList.remove('initial-hidden');
    gallerySection.classList.add('visible');
    // keep photos covered by per-photo overlays; do not auto-reveal images here
    const overlays = Array.from(document.querySelectorAll('.photo-overlay'));
    overlays.forEach(o => o.classList.remove('hidden'));
  }
});

// Gallery / lightbox behavior
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbQuote = document.getElementById('lb-quote');
const lbClose = document.getElementById('lb-close');
gallery?.addEventListener('click', e => {
  const wrap = e.target.closest('.photo-wrap');
  if (!wrap) return;
  // only open lightbox if the image was revealed (no overlay)
  const overlay = wrap.querySelector('.photo-overlay');
  if (overlay && !overlay.classList.contains('hidden')) return; // still covered
  const img = wrap.querySelector('.photo');
  if (!img) return;
  openLightbox(img.src, img.alt, img.dataset.caption);
  // subtle heart burst on click (from wrapper center)
  const rect = wrap.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    setTimeout(() => makeHeart(rect.left + rect.width/2 + (Math.random()-0.5)*60, rect.top + rect.height/2 + (Math.random()-0.5)*40), i * 80);
  }
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

// Page ready entrance + parallax
document.addEventListener('DOMContentLoaded', () => {
  // mark ready to trigger CSS entrance transitions
  document.documentElement.classList.add('ready');

  // add subtle grain overlay element
  const grain = document.createElement('div');
  grain.className = 'grain-overlay';
  document.body.appendChild(grain);

  // add star field for night theme
  const starField = document.createElement('div');
  starField.className = 'star-field';
  const starCount = 60;
  for (let i = 0; i < starCount; i++){
    const s = document.createElement('div');
    s.className = 'star';
    const sizeClass = (Math.random() < 0.6) ? 'small' : (Math.random() < 0.9 ? 'med' : 'large');
    s.classList.add(sizeClass);
    s.style.left = (Math.random() * 100) + 'vw';
    s.style.top = (Math.random() * 100) + 'vh';
    s.style.animationDelay = (Math.random() * 4) + 's';
    s.style.animationDuration = (2 + Math.random() * 3) + 's';
    starField.appendChild(s);
  }
  document.body.appendChild(starField);

  // parallax mouse move for hero and photo wrappers
  const hero = document.querySelector('.hero-heart');
  const photoWraps = Array.from(document.querySelectorAll('.photo-wrap'));
  // photo reveal now controlled by reveal button
  photoWraps.forEach(w => { w.style.transform = 'translate(0,0)'; });

  // only enable mouse parallax when device has a fine pointer (desktop)
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('mousemove', (ev) => {
      const cx = (ev.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const cy = (ev.clientY / window.innerHeight - 0.5) * 2;
      if (hero) hero.style.transform = `translate(${cx * 6}px, ${cy * 6}px) rotate(${cx * 2}deg)`;
      photoWraps.forEach((wrap, i) => {
        const depth = 6 + (i % 3);
        wrap.style.transform = `translate(${cx * depth}px, ${cy * depth / 2}px)`;
      });
    });
  }
});

// per-photo reveal button handler
document.addEventListener('click', (e) => {
  if (!e.target.matches('.photo-reveal')) return;
  const btn = e.target;
  const wrap = btn.closest('.photo-wrap');
  if (!wrap) return;
  const overlay = wrap.querySelector('.photo-overlay');
  const img = wrap.querySelector('.photo');
  if (overlay) {
    overlay.classList.add('hidden');
    // reveal image smoothly
    img.classList.add('revealed');
    // small heart burst centered on the photo
    const rect = wrap.getBoundingClientRect();
    for (let i = 0; i < 10; i++) setTimeout(() => makeHeart(rect.left + rect.width/2 + (Math.random()-0.5)*60, rect.top + rect.height/2 + (Math.random()-0.5)*40), i * 60 + 20);
    // remove overlay from DOM after fade
    setTimeout(() => overlay.remove(), 420);
    
    // Open photo in bigger modal view with animation
    setTimeout(() => {
      openLightbox(img.src, img.alt, img.dataset.caption);
    }, 300);
    
    // Check if all photos are revealed
    checkAllPhotosRevealed();
  }
});

function checkAllPhotosRevealed() {
  const allPhotos = Array.from(document.querySelectorAll('.photo-wrap'));
  const revealedPhotos = allPhotos.filter(wrap => {
    const overlay = wrap.querySelector('.photo-overlay');
    return !overlay || overlay.classList.contains('hidden');
  });
  
  if (revealedPhotos.length === allPhotos.length) {
    const nextButton = document.getElementById('next-btn');
    const hintText = document.getElementById('reveal-hint');
    nextButton.classList.remove('hidden');
    if (hintText) hintText.classList.add('hidden');
    
    // celebrate with heart burst
    const rect = nextButton.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
      setTimeout(() => makeHeart(rect.left + rect.width/2 + (Math.random()-0.5)*100, rect.top + rect.height/2 + (Math.random()-0.5)*60), i * 80);
    }
  }
}

// Enhanced lightbox with swipe and keyboard navigation
let imageList = [];
let currentIndex = 0;

function getImageList(){
  return Array.from(document.querySelectorAll('.photo')).map(p => p.src);
}

function showLightboxImageByIndex(idx){
  const list = imageList = getImageList();
  if (!list.length) return;
  currentIndex = (idx + list.length) % list.length;
  const src = list[currentIndex];
  const imgs = document.querySelectorAll('.photo');
  const caption = imgs[currentIndex] && imgs[currentIndex].dataset.caption;
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  lbCaption.textContent = caption || '';
  lbQuote.textContent = randomQuote.text;
  lbImg.style.opacity = '0';
  const pre = new Image();
  pre.onload = () => {
    lbImg.src = src;
    lbImg.alt = imgs[currentIndex] && imgs[currentIndex].alt || '';
    requestAnimationFrame(() => { lbImg.style.opacity = '1'; });
  };
  pre.src = src;
}

function openLightbox(src, alt, caption){
  imageList = getImageList();
  currentIndex = imageList.indexOf(src);
  if (currentIndex === -1) currentIndex = 0;
  lightbox.classList.remove('hidden');
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  showLightboxImageByIndex(currentIndex);
}

function closeLightbox(){
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lightbox.classList.remove('open');
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden','true');
    lbImg.src = '';
  }, 360);
}

// Next button and Quiz
const nextBtn = document.getElementById('next-btn');
const quizModal = document.getElementById('quiz-modal');
const quizCard = document.querySelector('.quiz-card');
const quizClose = document.getElementById('quiz-close');
const quizSubmitBtn = document.getElementById('quiz-submit-btn');
const quizProgress = document.getElementById('quiz-progress');
const readyModal = document.getElementById('ready-modal');
const readyClose = document.getElementById('ready-close');
const finalSurpriseBtn = document.getElementById('final-surprise-btn');

// Surprise quotes + modal
const quoteModal = document.getElementById('quote-modal');
const quotePhoto = document.getElementById('quote-photo');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const quoteClose = document.getElementById('quote-close');

// Video modal
const videoModal = document.getElementById('video-modal');
const surpriseVideo = document.getElementById('surprise-video');
const videoClose = document.getElementById('video-close');

const quotes = [
  {text: "You are my favorite hello and my hardest goodbye.", author: '— Me'},
  {text: "In your smile I see something more beautiful than the stars.", author: '— Yours'},
  {text: "Together is my favorite place to be.", author: '— Always'},
  {text: "I still fall for you every day.", author: '— Forever'},
  {text: "You make ordinary moments unforgettable.", author: '— With love'}
];

// Quiz state
let currentQuestion = 1;
let selectedAnswer = null;
let answerCorrect = false;

function openQuiz(){
  quizModal.classList.remove('hidden');
  quizModal.setAttribute('aria-hidden','false');
  currentQuestion = 1;
  selectedAnswer = null;
  answerCorrect = false;
  updateQuizUI();
}

function closeQuiz(){
  quizModal.classList.add('hidden');
  quizModal.setAttribute('aria-hidden','true');
}

function updateQuizUI(){
  // Hide all questions
  document.querySelectorAll('.quiz-question').forEach(q => q.classList.add('hidden'));
  // Show current question
  document.getElementById(`question-${currentQuestion}`)?.classList.remove('hidden');
  // Update progress
  quizProgress.textContent = `Question ${currentQuestion} of 2`;
  // Reset button
  selectedAnswer = null;
  answerCorrect = false;
  updateOptionStyles();
  quizSubmitBtn.classList.add('hidden');
  quizSubmitBtn.textContent = 'Check Answer';
  // Clear feedback
  document.querySelectorAll('.answer-feedback').forEach(f => {
    f.classList.add('hidden');
    f.textContent = '';
  });
}

function updateOptionStyles(){
  document.querySelectorAll('.quiz-option').forEach(option => {
    option.classList.remove('selected', 'correct', 'incorrect');
  });
}

// Quiz option selection
document.addEventListener('click', (e) => {
  if (e.target.matches('.quiz-option')) {
    // Don't allow selecting after answer is submitted
    if (answerCorrect) return;
    
    selectedAnswer = e.target;
    updateOptionStyles();
    selectedAnswer.classList.add('selected');
    quizSubmitBtn.classList.remove('hidden');
  }
});

function handleQuizSubmit(){
  if (!selectedAnswer) return;
  
  const isCorrect = selectedAnswer.getAttribute('data-correct') === 'true';
  const feedbackElement = document.getElementById(`answer-feedback-${currentQuestion}`);
  
  if (isCorrect) {
    answerCorrect = true;
    selectedAnswer.classList.remove('selected');
    selectedAnswer.classList.add('correct');
    feedbackElement.textContent = '✓ Correct!';
    feedbackElement.classList.add('correct');
    feedbackElement.classList.remove('hidden');
    
    // Disable all options
    document.querySelectorAll(`#question-${currentQuestion} .quiz-option`).forEach(opt => {
      opt.disabled = true;
    });
    
    if (currentQuestion === 1) {
      quizSubmitBtn.textContent = 'Continue to Question 2';
    } else {
      quizSubmitBtn.textContent = 'Complete Quiz';
    }
  } else {
    selectedAnswer.classList.remove('selected');
    selectedAnswer.classList.add('incorrect');
    feedbackElement.textContent = '✗ Try again!';
    feedbackElement.classList.add('incorrect');
    feedbackElement.classList.remove('hidden');
    selectedAnswer = null;
  }
}

function handleQuizContinue(){
  if (currentQuestion === 1) {
    currentQuestion = 2;
    updateQuizUI();
  } else {
    // Quiz complete
    closeQuiz();
    openReadyModal();
  }
}

function handleQuizButtonClick(){
  if (answerCorrect) {
    handleQuizContinue();
  } else {
    handleQuizSubmit();
  }
}

function openReadyModal(){
  readyModal.classList.remove('hidden');
  readyModal.setAttribute('aria-hidden','false');
  // heart burst
  const rect = document.querySelector('.card').getBoundingClientRect();
  for (let i = 0; i < 16; i++) setTimeout(() => makeHeart(rect.left + rect.width/2 + (Math.random()-0.5)*200, rect.top + rect.height/2 + (Math.random()-0.5)*100), i * 60);
}

function closeReadyModal(){
  readyModal.classList.add('hidden');
  readyModal.setAttribute('aria-hidden','true');
}

function openQuoteModal(imgSrc, quote){
  quotePhoto.src = imgSrc;
  quoteText.textContent = quote.text;
  quoteAuthor.textContent = quote.author || '';
  quoteModal.classList.remove('hidden');
  quoteModal.setAttribute('aria-hidden','false');
  // small burst
  const rect = document.querySelector('.card').getBoundingClientRect();
  for (let i = 0; i < 14; i++) setTimeout(() => makeHeart(rect.left + rect.width/2 + (Math.random()-0.5)*160, rect.top + rect.height/2 + (Math.random()-0.5)*80), i * 60);
}

function closeQuoteModal(){
  quoteModal.classList.add('hidden');
  quoteModal.setAttribute('aria-hidden','true');
  quotePhoto.src = '';
}

function openVideoModal(){
  videoModal.classList.remove('hidden');
  videoModal.setAttribute('aria-hidden','false');
  surpriseVideo.play();
  // small burst
  const rect = document.querySelector('.card').getBoundingClientRect();
  for (let i = 0; i < 14; i++) setTimeout(() => makeHeart(rect.left + rect.width/2 + (Math.random()-0.5)*160, rect.top + rect.height/2 + (Math.random()-0.5)*80), i * 60);
}

function closeVideoModal(){
  videoModal.classList.add('hidden');
  videoModal.setAttribute('aria-hidden','true');
  surpriseVideo.pause();
  surpriseVideo.currentTime = 0;
}

// Event listeners
nextBtn?.addEventListener('click', openQuiz);
quizClose?.addEventListener('click', closeQuiz);
quizModal?.addEventListener('click', e => { if (e.target === quizModal) closeQuiz(); });
quizSubmitBtn?.addEventListener('click', handleQuizButtonClick);

readyClose?.addEventListener('click', closeReadyModal);
readyModal?.addEventListener('click', e => { if (e.target === readyModal) closeReadyModal(); });
finalSurpriseBtn?.addEventListener('click', () => {
  closeReadyModal();
  openVideoModal();
});

quoteClose?.addEventListener('click', closeQuoteModal);
quoteModal?.addEventListener('click', e => { if (e.target === quoteModal) closeQuoteModal(); });

videoClose?.addEventListener('click', closeVideoModal);
videoModal?.addEventListener('click', e => { if (e.target === videoModal) closeVideoModal(); });


function nextLightbox(){ showLightboxImageByIndex(currentIndex + 1); }
function prevLightbox(){ showLightboxImageByIndex(currentIndex - 1); }

// keyboard navigation (Escape handled elsewhere if necessary)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!quizModal.classList.contains('hidden')) closeQuiz();
    else if (!readyModal.classList.contains('hidden')) closeReadyModal();
    else if (!videoModal.classList.contains('hidden')) closeVideoModal();
    else return closeLightbox();
  }
  if (e.key === 'ArrowRight') return nextLightbox();
  if (e.key === 'ArrowLeft') return prevLightbox();
});

// swipe support on touch/pointer devices
let startX = 0;
let isPointerDown = false;
lightbox.addEventListener('pointerdown', (e) => { isPointerDown = true; startX = e.clientX; });
lightbox.addEventListener('pointerup', (e) => {
  if (!isPointerDown) return; isPointerDown = false;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 40){ if (dx < 0) nextLightbox(); else prevLightbox(); }
});



