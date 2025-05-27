// --- AOS Initialization ---
try {
    AOS.init({ 
        duration: 1000, 
        once: false, 
        offset: 100,    
        easing: 'ease-out-quad'
    });
} catch(e) { console.error("AOS initialization failed:", e); }

// --- Year Update ---
try {
    const footerYearEl = document.getElementById('currentYearFooter'); 
    if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();
    const copyrightYearEl = document.getElementById('copyrightYear'); 
    if (copyrightYearEl) { copyrightYearEl.textContent = new Date().getFullYear() + " आचार्य आशीष मिश्र"; }
} catch(e) { console.error("Year update failed:", e); }

// --- TTS Functionality ---
const atithi_synth = window.speechSynthesis; 
let atithi_voices = [];  
let atithi_utteranceQueue = []; 
let atithi_isPlayingTTS = false; 
let atithi_currentUtteranceIndex = 0; 
const atithi_ttsPlayButton = document.getElementById('playTTSButton'); 
const atithi_ttsStopButton = document.getElementById('stopTTSButton'); 

function atithi_populateVoiceList() { 
    if (!atithi_synth) { return; }
    atithi_voices = atithi_synth.getVoices().filter(voice => voice.lang.startsWith('hi'));
    if (atithi_voices.length === 0) { atithi_voices = atithi_synth.getVoices(); }
}

if (atithi_synth) {
    if (atithi_synth.getVoices().length) { atithi_populateVoiceList(); }
    else if (speechSynthesis.onvoiceschanged !== undefined) { speechSynthesis.onvoiceschanged = atithi_populateVoiceList; }
    else { setTimeout(atithi_populateVoiceList, 250); } 
} else {
    if(atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true;
    if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
    console.warn("Speech Synthesis not supported.");
}

function atithi_speakNextUtterance() { 
    if (!atithi_isPlayingTTS || atithi_currentUtteranceIndex >= atithi_utteranceQueue.length) {
        atithi_isPlayingTTS = false; atithi_currentUtteranceIndex = 0; atithi_utteranceQueue = [];
        if(atithi_ttsPlayButton) { atithi_ttsPlayButton.innerHTML = '<i class="fa fa-volume-up" aria-hidden="true"></i> पूरा पोस्ट सुनें'; atithi_ttsPlayButton.disabled = false; }
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
        return;
    }
    const textToSpeak = atithi_utteranceQueue[atithi_currentUtteranceIndex];
    if (!textToSpeak || textToSpeak.trim() === "") { 
        atithi_currentUtteranceIndex++; atithi_speakNextUtterance(); return;
    }
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onstart = () => {
        if(atithi_ttsPlayButton) atithi_ttsPlayButton.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> बोल रहा...';
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = false;
    };
    utterance.onend = () => { atithi_currentUtteranceIndex++; atithi_speakNextUtterance(); };
    utterance.onerror = (event) => { 
        console.error('TTS Error:', event);
        atithi_currentUtteranceIndex++; atithi_speakNextUtterance(); 
    };
    if (atithi_voices.length > 0) {
        let hindiVoice = atithi_voices.find(voice => voice.lang === 'hi-IN' && (voice.name.includes('Google') || voice.name.toLowerCase().includes('hindi')));
        utterance.voice = hindiVoice || atithi_voices.find(voice => voice.lang.startsWith('hi')) || atithi_voices[0];
    }
    utterance.rate = 0.85; utterance.pitch = 1; utterance.volume = 1; 
    try { atithi_synth.speak(utterance); } catch (e) { console.error("Error speaking:", e); atithi_currentUtteranceIndex++; atithi_speakNextUtterance(); }
}

if (atithi_ttsPlayButton && atithi_synth) {
    atithi_ttsPlayButton.addEventListener('click', () => {
        if (atithi_synth.speaking) {
            if (atithi_synth.paused) { atithi_synth.resume(); atithi_ttsPlayButton.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> बोल रहा...'; }
            else { atithi_synth.pause(); atithi_ttsPlayButton.innerHTML = '<i class="fa fa-pause-circle" aria-hidden="true"></i> रुका है'; }
            return;
        }
        atithi_populateVoiceList(); 
        atithi_utteranceQueue = [];
        const selectorsForTTS = [
            '#introContent p',
            '#articleContent h2, #articleContent h3, #articleContent h4, #articleContent h5, #articleContent h6, #articleContent p, #articleContent li, #articleContent .atithi-article-quote',
            '#poemContent .atithi-poem-line',
            '#mediaContent h3, #mediaContent .atithi-media-placeholder p', 
            '#guidanceContent h2, #guidanceContent h3, #guidanceContent p, #guidanceContent li',
            '#conclusionContent h3, #conclusionContent p',
            '#rightsContent h3, #rightsContent p'
        ];
        
        document.querySelectorAll(selectorsForTTS.join(', ')).forEach(el => {
            const textContent = el.textContent ? el.textContent.replace( /[\u200B-\u200D\uFEFF]/g, '' ).trim() : "";
            if (textContent && textContent.toLowerCase() !== 'कोड कॉपी') { 
                 atithi_utteranceQueue.push(textContent);
            }
        });

        if (atithi_utteranceQueue.length > 0) {
            atithi_isPlayingTTS = true; atithi_currentUtteranceIndex = 0;
            if(atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true;
            atithi_speakNextUtterance();
        } else { alert("पढ़ने के लिए कोई सामग्री नहीं मिली।"); }
    });
}
if (atithi_ttsStopButton && atithi_synth) {
    atithi_ttsStopButton.addEventListener('click', () => {
        atithi_synth.cancel(); atithi_isPlayingTTS = false; atithi_currentUtteranceIndex = 0; atithi_utteranceQueue = [];
        if(atithi_ttsPlayButton) { atithi_ttsPlayButton.innerHTML = '<i class="fa fa-volume-up" aria-hidden="true"></i> पूरा पोस्ट सुनें'; atithi_ttsPlayButton.disabled = false; }
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
    });
}

// --- PDF Download ---
const atithi_downloadPdfButton = document.getElementById('downloadPdfButton'); 
if (atithi_downloadPdfButton) {
    atithi_downloadPdfButton.addEventListener('click', () => {
        const originalButtonHtml = atithi_downloadPdfButton.innerHTML;
        atithi_downloadPdfButton.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> बन रहा है...';
        atithi_downloadPdfButton.disabled = true;
        const elementToCapture = document.querySelector('.atithi-page-container'); 
        if (elementToCapture && typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
            const { jsPDF } = jspdf; 
            document.body.classList.add('pdf-mode');
            const currentScrollY = window.scrollY; window.scrollTo(0,0); 
            setTimeout(() => { 
                html2canvas(elementToCapture, { 
                    scale: 1.2, useCORS: true, backgroundColor: '#ffffff', 
                    scrollX: 0, scrollY: 0, 
                    windowWidth: elementToCapture.scrollWidth, 
                    windowHeight: elementToCapture.scrollHeight, logging: false,
                    onclone: (clonedDoc) => { 
                        clonedDoc.body.classList.add('pdf-mode');
                        clonedDoc.querySelectorAll('.atithi-action-buttons, .atithi-copy-button, .atithi-media-content .atithi-video-player, .atithi-external-links .atithi-button:not([href*="portal"])').forEach(el => el.style.display = 'none');
                        clonedDoc.querySelectorAll('[data-aos]').forEach(el => {
                            el.classList.remove('aos-init', 'aos-animate');
                        });
                    }
                })
                .then(canvas => {
                    window.scrollTo(0, currentScrollY); document.body.classList.remove('pdf-mode');
                    const imgData = canvas.toDataURL('image/png', 0.9);
                    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfMargin = 8; 
                    const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * pdfMargin;
                    const pdfHeightCalculated = (imgProps.height * pdfWidth) / imgProps.width;
                    const pageHeightA4 = pdf.internal.pageSize.getHeight() - 2 * pdfMargin;
                    let currentYCanvas = 0; let numPages = Math.ceil(pdfHeightCalculated / pageHeightA4);
                    for (let i = 0; i < numPages; i++) {
                        if (i > 0) pdf.addPage();
                        let sourceHeightCanvas = (pageHeightA4 / pdfHeightCalculated) * canvas.height;
                        sourceHeightCanvas = Math.min(sourceHeightCanvas, canvas.height - currentYCanvas);
                        if (sourceHeightCanvas <=0) break;
                        let pageCanvas = document.createElement('canvas');
                        pageCanvas.width = canvas.width; pageCanvas.height = sourceHeightCanvas;
                        let pageCtx = pageCanvas.getContext('2d');
                        pageCtx.drawImage(canvas, 0, currentYCanvas, canvas.width, sourceHeightCanvas, 0, 0, canvas.width, sourceHeightCanvas);
                        let destHeightPdf = (sourceHeightCanvas * pdfWidth) / canvas.width;
                        pdf.addImage(pageCanvas.toDataURL('image/png', 0.9), 'PNG', pdfMargin, pdfMargin, pdfWidth, destHeightPdf);
                        currentYCanvas += sourceHeightCanvas;
                    }
                    pdf.save('अतिथि-शिक्षकों-का-संघर्ष-और-आह्वान.pdf');
                    atithi_downloadPdfButton.innerHTML = originalButtonHtml; atithi_downloadPdfButton.disabled = false;
                }).catch(err => {
                    window.scrollTo(0, currentScrollY); console.error("PDF Error:", err);
                    document.body.classList.remove('pdf-mode');
                    atithi_downloadPdfButton.innerHTML = originalButtonHtml; atithi_downloadPdfButton.disabled = false;
                    alert("PDF बनाने में त्रुटि हुई: " + err.message);
                });
            }, 400); 
        } else {
            alert("PDF बनाने में त्रुटि! लाइब्रेरी लोड नहीं हुई हैं या कंटेंट रैपर नहीं मिला।");
            atithi_downloadPdfButton.innerHTML = originalButtonHtml; atithi_downloadPdfButton.disabled = false;
        }
    });
}

// --- Share Functionality ---
const atithi_sharePostButton = document.getElementById('sharePostButton'); 
if (atithi_sharePostButton) {
    atithi_sharePostButton.addEventListener('click', (e) => {
        e.preventDefault();
        const pageUrl = window.location.href;
        const pageTitleElement = document.querySelector('.atithi-page-header .atithi-main-title');
        const pageTitle = pageTitleElement ? pageTitleElement.textContent.trim() : "अतिथि शिक्षकों का संघर्ष और आह्वान";
        const authorName = "आचार्य आशीष मिश्र";
        const shareText = `🔥 "${pageTitle}" 🔥 ${authorName} द्वारा संकलित - अतिथि शिक्षकों का महा-संग्राम! जरूर पढ़ें और शेयर करें!`;
        if (navigator.share) {
            navigator.share({ title: pageTitle, text: shareText, url: pageUrl })
            .catch((error) => console.log('Share Error:', error));
        } else {
            const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
            const whatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + pageUrl)}`;
            let fallbackMessage = `इस क्रांति को साझा करें!\n\nTwitter:\n${twitter}\n\nWhatsApp:\n${whatsapp}\n\nया लिंक कॉपी करें:\n${pageUrl}`;
            alert(fallbackMessage); 
        }
    });
}

// --- Copy Poem Guidance Text ---
function atithi_copyPoemGuidance() { 
    const textToCopyEl = document.getElementById('poemGuidanceText'); 
    if (textToCopyEl) { 
        let textToCopy = textToCopyEl.innerText || textToCopyEl.textContent;
        textToCopy = textToCopy.replace(/IGNORE_WHEN_COPYING_START[\s\S]*?IGNORE_WHEN_COPYING_END\s*/gm, "").trim();
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('कविता और गायन निर्देशन आपके क्लिपबोर्ड पर कॉपी कर दिए गए हैं!');
        }).catch(err => {
            console.error('कॉपी करने में विफल: ', err);
            try {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed"; textArea.style.top = "-9999px"; textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus(); textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                if(success) { alert('कविता और गायन निर्देशन आपके क्लिपबोर्ड पर कॉपी कर दिए गए हैं!'); }
                else { throw new Error('Fallback copy failed'); }
            } catch (fallbackErr) {
                 console.error('Fallback कॉपी करने में विफल: ', fallbackErr);
                 alert('क्षमा करें, कॉपी करने में त्रुटि हुई।');
            }
        });
     }
}

window.addEventListener('beforeunload', () => { if (atithi_synth && atithi_synth.speaking) { atithi_synth.cancel(); } });
</script>
