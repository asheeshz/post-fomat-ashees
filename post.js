// --- AOS Initialization ---
try { AOS.init({ duration: 700, once: true, offset: 50, easing: 'ease-in-out-cubic' }); }
catch(e) { console.error("AOS init failed:", e); }

// --- Particles.js Initialization ---
if (typeof particlesJS !== 'undefined' && document.getElementById('am-particles-js')) {
    particlesJS('am-particles-js', { // Prefixed ID
        "particles": {
            "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": ["#FFD700", "#FFA500", "#FF4500", "#FF6347", "#8B0000"] },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.7, "random": true, "anim": { "enable": true, "speed": 0.8, "opacity_min": 0.2, "sync": false } },
            "size": { "value": 4, "random": true, "anim": { "enable": true, "speed": 3, "size_min": 0.5, "sync": false } },
            "line_linked": { "enable": false },
            "move": {
                "enable": true, "speed": 1.5, "direction": "top", "random": true,
                "straight": false, "out_mode": "out", "bounce": false,
                "attract": { "enable": false }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": false }, "onclick": { "enable": false }, "resize": true }
        },
        "retina_detect": true
    });
} else if (document.getElementById('am-particles-js')) {
    console.warn("particles.js script might not be loaded or particlesJS is not defined, but #am-particles-js element exists.");
}

// --- Year Update ---
try {
    const footerYearEl = document.getElementById('am-mahaTaandavCurrentYearFooter');
    if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();

    const copyrightYearEl = document.getElementById('am-copyrightYear');
    if (copyrightYearEl) {
         copyrightYearEl.textContent = new Date().getFullYear() + " आचार्य आशीष मिश्र";
    }
}
catch(e) { console.error("Year update failed:", e); }

// --- Staggered Line Animation on Scroll (Intersection Observer) ---
const am_poemLines = document.querySelectorAll('.am-poem-content-area .am-poem-line'); // Prefixed classes
const am_observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
const am_poemLineObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, am_observerOptions);
am_poemLines.forEach((line, idx) => {
    line.style.setProperty('--stagger-delay', (idx * 50) + 'ms');
    am_poemLineObserver.observe(line);
});

// --- TTS Functionality ---
const am_synth = window.speechSynthesis;
let am_voicesTTS = [];
let am_utteranceQueueTTS = [];
let am_isPlayingPoemTTS = false;
let am_currentUtteranceIndexTTS = 0;
const am_ttsPlayBtnGlobal = document.getElementById('am-ttsPlayPoem'); // Prefixed ID
const am_ttsStopBtnGlobal = document.getElementById('am-ttsStopPoem'); // Prefixed ID

function am_populateVoiceListTTSInternal() {
    am_voicesTTS = am_synth.getVoices().filter(voice => voice.lang.startsWith('hi'));
    if (am_voicesTTS.length === 0) { am_voicesTTS = am_synth.getVoices(); }
}
am_populateVoiceListTTSInternal();
if (speechSynthesis.onvoiceschanged !== undefined) { speechSynthesis.onvoiceschanged = am_populateVoiceListTTSInternal; }

function am_speakNextTTSInternal() {
    if (!am_isPlayingPoemTTS || am_currentUtteranceIndexTTS >= am_utteranceQueueTTS.length) {
        am_isPlayingPoemTTS = false; am_currentUtteranceIndexTTS = 0; am_utteranceQueueTTS = [];
        if(am_ttsPlayBtnGlobal) { am_ttsPlayBtnGlobal.innerHTML = '<i class="fa fa-volume-up" aria-hidden="true"></i> हुंकार सुनें'; am_ttsPlayBtnGlobal.disabled = false; }
        if(am_ttsStopBtnGlobal) am_ttsStopBtnGlobal.disabled = true;
        return;
    }
    const textToSpeak = am_utteranceQueueTTS[am_currentUtteranceIndexTTS];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onstart = () => {
        if(am_ttsPlayBtnGlobal) am_ttsPlayBtnGlobal.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> आग बरस रही...';
        if(am_ttsStopBtnGlobal) am_ttsStopBtnGlobal.disabled = false;
    };
    utterance.onend = () => { am_currentUtteranceIndexTTS++; am_speakNextTTSInternal(); };
    utterance.onerror = (event) => {
        console.error('TTS Error:', event);
        am_isPlayingPoemTTS = false; am_currentUtteranceIndexTTS = 0; am_utteranceQueueTTS = [];
        if(am_ttsPlayBtnGlobal) { am_ttsPlayBtnGlobal.innerHTML = '<i class="fa fa-volume-up" aria-hidden="true"></i> हुंकार सुनें'; am_ttsPlayBtnGlobal.disabled = false; }
        if(am_ttsStopBtnGlobal) am_ttsStopBtnGlobal.disabled = true;
    };
    if (am_voicesTTS.length > 0) {
        let hindiVoice = am_voicesTTS.find(voice => voice.lang === 'hi-IN');
        utterance.voice = hindiVoice || am_voicesTTS[0];
    }
    utterance.rate = 0.8; utterance.pitch = 0.9; utterance.volume = 1;
    am_synth.speak(utterance);
}

if (am_ttsPlayBtnGlobal) {
    am_ttsPlayBtnGlobal.addEventListener('click', () => {
        if (am_synth.speaking) {
            if (am_synth.paused) { am_synth.resume(); am_ttsPlayBtnGlobal.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> आग बरस रही...'; }
            else { am_synth.pause(); am_ttsPlayBtnGlobal.innerHTML = '<i class="fa fa-pause-circle" aria-hidden="true"></i> रुका (RESUME)'; }
            return;
        }
        am_utteranceQueueTTS = [];
        document.querySelectorAll('.am-poem-content-area .am-poem-line').forEach(el => { // Prefixed classes
            am_utteranceQueueTTS.push(el.textContent.replace( /[\u200B-\u200D\uFEFF]/g, '' ).trim());
        });
        if (am_utteranceQueueTTS.length > 0) {
            am_isPlayingPoemTTS = true; am_currentUtteranceIndexTTS = 0;
            if(am_ttsPlayBtnGlobal) am_ttsPlayBtnGlobal.disabled = true;
            am_speakNextTTSInternal();
        }
    });
}
if (am_ttsStopBtnGlobal) {
    am_ttsStopBtnGlobal.addEventListener('click', () => {
        am_synth.cancel(); am_isPlayingPoemTTS = false; am_currentUtteranceIndexTTS = 0; am_utteranceQueueTTS = [];
        if(am_ttsPlayBtnGlobal) { am_ttsPlayBtnGlobal.innerHTML = '<i class="fa fa-volume-up" aria-hidden="true"></i> हुंकार सुनें'; am_ttsPlayBtnGlobal.disabled = false; }
        if(am_ttsStopBtnGlobal) am_ttsStopBtnGlobal.disabled = true;
    });
}

// --- PDF Download (Class-based Toggling for Styles) ---
const am_downloadBtnGlobal = document.getElementById('am-downloadPoemPdf'); // Prefixed ID
if (am_downloadBtnGlobal) {
    am_downloadBtnGlobal.addEventListener('click', () => {
        const originalButtonHtml = am_downloadBtnGlobal.innerHTML;
        am_downloadBtnGlobal.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> डाउनलोड हो रहा है...';
        am_downloadBtnGlobal.disabled = true;

        const am_contentWrapper = document.querySelector('.am-maha-sangram-container .am-content-wrapper'); // Prefixed classes

        if (am_contentWrapper && window.html2canvas && window.jspdf) {
            const { jsPDF } = window.jspdf;

            document.body.classList.add('pdf-mode');

            setTimeout(() => {
                html2canvas(am_contentWrapper, {
                    scale: 1.5,
                    useCORS: true,
                    backgroundColor: '#ffffff', 
                    scrollX: 0, scrollY: 0,
                    windowWidth: am_contentWrapper.scrollWidth,
                    windowHeight: am_contentWrapper.scrollHeight,
                    logging: false
                })
                .then(canvas => {
                    document.body.classList.remove('pdf-mode');
                    am_downloadBtnGlobal.innerHTML = originalButtonHtml;
                    am_downloadBtnGlobal.disabled = false;

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfMargin = 10;
                    const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * pdfMargin;
                    const pdfHeightCalculated = (imgProps.height * pdfWidth) / imgProps.width;
                    const pageHeightA4 = pdf.internal.pageSize.getHeight() - 2 * pdfMargin;

                    let currentY = 0;
                    let pageIndex = 0;

                    while (currentY < pdfHeightCalculated) {
                        if (pageIndex > 0) pdf.addPage();

                        let sourceYInCanvas = (currentY / pdfHeightCalculated) * canvas.height;
                        let pageHeightInCanvas = Math.min((pageHeightA4 / pdfHeightCalculated) * canvas.height, canvas.height - sourceYInCanvas);
                        let sourceHeightInCanvas = Math.max(0, Math.min(pageHeightInCanvas, canvas.height - sourceYInCanvas));

                        if (sourceHeightInCanvas <= 0) break;

                        let pageCanvas = document.createElement('canvas');
                        pageCanvas.width = canvas.width;
                        pageCanvas.height = sourceHeightInCanvas;
                        let pageCtx = pageCanvas.getContext('2d');

                        pageCtx.drawImage(canvas, 0, sourceYInCanvas, canvas.width, sourceHeightInCanvas, 0, 0, canvas.width, sourceHeightInCanvas);

                        let destHeight = (sourceHeightInCanvas * pdfWidth) / canvas.width;
                        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', pdfMargin, pdfMargin, pdfWidth, destHeight);

                        currentY += pageHeightA4;
                        pageIndex++;
                    }
                    pdf.save('अतिथि-का-महा-तांडव.pdf');
                }).catch(err => {
                    console.error("PDF Error:", err);
                    document.body.classList.remove('pdf-mode');
                    am_downloadBtnGlobal.innerHTML = originalButtonHtml;
                    am_downloadBtnGlobal.disabled = false;
                    alert("PDF बनाने में त्रुटि हुई: " + err.message);
                });
            }, 250); 

        } else {
            alert("PDF बनाने में त्रुटि! आवश्यक लाइब्रेरी (html2canvas or jspdf) लोड नहीं हुई हैं या कंटेंट रैपर नहीं मिला।");
            am_downloadBtnGlobal.innerHTML = originalButtonHtml;
            am_downloadBtnGlobal.disabled = false;
        }
    });
}


// --- Share Functionality ---
const am_shareBtnGlobal = document.getElementById('am-sharePoem'); // Prefixed ID
if (am_shareBtnGlobal) {
    am_shareBtnGlobal.addEventListener('click', (e) => {
        e.preventDefault();
        const pageUrl = window.location.href;
        const poemTitleElement = document.querySelector('.am-maha-sangram-container .am-page-header .am-main-title-display'); // Prefixed classes
        const poemTitle = poemTitleElement ? poemTitleElement.textContent : "अतिथि का महा-तांडव";
        const poetName = "आचार्य आशीष मिश्र";
        const shareText = `🔥 "${poemTitle}" 🔥 ${poetName} द्वारा रचित - अतिथि शिक्षकों का महा-संग्राम! जरूर पढ़ें और शेयर करें!`;
        if (navigator.share) {
            navigator.share({ title: poemTitle, text: shareText, url: pageUrl })
            .catch((error) => console.log('Share Error:', error));
        } else {
            const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
            const whatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + pageUrl)}`;
            let fallbackMessage = "इस क्रांति को साझा करें!\n";
            fallbackMessage += `Twitter: ${twitter}\n`;
            fallbackMessage += `WhatsApp: ${whatsapp}\n\n`;
            fallbackMessage += `या लिंक कॉपी करें: ${pageUrl}`;
            alert(fallbackMessage);
        }
    });
}

// --- Copy Poem Guidance Text ---
function am_copyPoemGuidance() { // Prefixed function name
    const textToCopyEl = document.getElementById('am-poemGuidanceText'); // Prefixed ID
    if (textToCopyEl) {
        // Remove any "IGNORE_WHEN_COPYING" comments from the text content
        let textToCopy = textToCopyEl.innerText;
        textToCopy = textToCopy.replace(/IGNORE_WHEN_COPYING_START\s*content_copy\s*download\s*Use code with caution.\s*IGNORE_WHEN_COPYING_END\s*/gm, "").trim();

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('कविता और गायन निर्देशन आपके क्लिपबोर्ड पर कॉपी कर दिए गए हैं!');
        }).catch(err => {
            console.error('कॉपी करने में विफल: ', err);
            try {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('कविता और गायन निर्देशन आपके क्लिपबोर्ड पर कॉपी कर दिए गए हैं!');
            } catch (fallbackErr) {
                 console.error('Fallback कॉपी करने में विफल: ', fallbackErr);
                 alert('क्षमा करें, कॉपी करने में त्रुटि हुई। आप स्वयं टेक्स्ट चुनकर कॉपी कर सकते हैं।');
            }
        });
    }
}

window.addEventListener('beforeunload', () => { if (am_synth && am_synth.speaking) { am_synth.cancel(); } });
