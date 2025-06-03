// --- DOMContentLoaded Wrapper ---
document.addEventListener('DOMContentLoaded', function() {

    // --- AOS Initialization ---
    try {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: false, // Animation will trigger every time element scrolls into view
                offset: 120, // Default offset for elements unless overridden by data-aos-offset
                easing: 'ease-out-quad'
            });
            console.log("AOS initialized successfully.");
        } else {
            console.warn("AOS library is not defined. Skipping initialization.");
        }
    } catch (e) {
        console.error("AOS initialization failed:", e);
    }

    // --- Year Update ---
    try {
        const footerYearEl = document.getElementById('currentYearFooter');
        if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();
        const copyrightYearEl = document.getElementById('copyrightYear');
        if (copyrightYearEl) {
            copyrightYearEl.textContent = new Date().getFullYear() + " आचार्य आशीष मिश्र";
        }
    } catch (e) {
        console.error("Year update failed:", e);
    }

    // --- TTS Functionality ---
    const atithi_synth = window.speechSynthesis;
    let atithi_voices = [];
    let atithi_utteranceQueue = [];
    let atithi_isPlayingTTS = false;
    let atithi_currentUtteranceIndex = 0;
    const atithi_ttsPlayButton = document.getElementById('playTTSButton');
    const atithi_ttsStopButton = document.getElementById('stopTTSButton');

    function atithi_populateVoiceList() {
        if (!atithi_synth) {
            return;
        }
        try {
            atithi_voices = atithi_synth.getVoices().filter(voice => voice.lang.startsWith('hi'));
            if (atithi_voices.length === 0) {
                // Fallback to any available voice if no Hindi voice is found specifically
                atithi_voices = atithi_synth.getVoices();
            }
             console.log("Voices populated. Hindi voices found:", atithi_voices.filter(v => v.lang.startsWith('hi')).length, "Total voices:", atithi_voices.length);
        } catch (e) {
            console.error("Error populating voice list:", e);
            if(atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true;
            if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
        }
    }

    if (atithi_synth) {
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = atithi_populateVoiceList;
        }
        if (atithi_synth.getVoices().length > 0) {
             atithi_populateVoiceList();
        } else {
            setTimeout(atithi_populateVoiceList, 300); 
        }

    } else {
        if (atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true;
        if (atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
        console.warn("Speech Synthesis not supported by this browser.");
    }

    function atithi_speakNextUtterance() {
        if (!atithi_isPlayingTTS || atithi_currentUtteranceIndex >= atithi_utteranceQueue.length) {
            atithi_isPlayingTTS = false;
            atithi_currentUtteranceIndex = 0;
            atithi_utteranceQueue = [];
            if (atithi_ttsPlayButton) {
                atithi_ttsPlayButton.innerHTML = '<i class="fa fa-volume-up" aria-hidden="true"></i> पूरा पोस्ट सुनें';
                atithi_ttsPlayButton.disabled = false;
            }
            if (atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
            return;
        }
        const textToSpeak = atithi_utteranceQueue[atithi_currentUtteranceIndex];
        if (!textToSpeak || textToSpeak.trim() === "") {
            atithi_currentUtteranceIndex++;
            atithi_speakNextUtterance();
            return;
        }
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onstart = () => {
            if (atithi_ttsPlayButton) atithi_ttsPlayButton.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> बोल रहा...';
            if (atithi_ttsStopButton) atithi_ttsStopButton.disabled = false;
        };
        utterance.onend = () => {
            atithi_currentUtteranceIndex++;
            atithi_speakNextUtterance();
        };
        utterance.onerror = (event) => {
            console.error('TTS Error:', event);
            atithi_currentUtteranceIndex++;
            atithi_speakNextUtterance(); 
        };

        if (atithi_voices.length > 0) {
            let hindiVoice = atithi_voices.find(voice => voice.lang === 'hi-IN' && (voice.name.includes('Google') || voice.name.toLowerCase().includes('hindi')));
            utterance.voice = hindiVoice || atithi_voices.find(voice => voice.lang.startsWith('hi')) || atithi_voices[0]; 
             if (utterance.voice) {
                console.log("Using voice:", utterance.voice.name, utterance.voice.lang);
            } else {
                console.warn("No suitable voice found for TTS, using default.");
            }
        } else {
             console.warn("Voice list is empty. TTS might use a default system voice.");
        }
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;
        try {
            atithi_synth.speak(utterance);
        } catch (e) {
            console.error("Error speaking utterance:", e);
            atithi_currentUtteranceIndex++;
            atithi_speakNextUtterance();
        }
    }

    if (atithi_ttsPlayButton && atithi_synth) {
        atithi_ttsPlayButton.addEventListener('click', () => {
            if (atithi_synth.speaking) {
                if (atithi_synth.paused) {
                    atithi_synth.resume();
                    atithi_ttsPlayButton.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> बोल रहा...';
                } else {
                    atithi_synth.pause();
                    atithi_ttsPlayButton.innerHTML = '<i class="fa fa-pause-circle" aria-hidden="true"></i> रुका है';
                }
                return;
            }

            if (atithi_voices.length === 0) {
                atithi_populateVoiceList(); 
                if (atithi_voices.length === 0) {
                    console.warn("TTS voices not available yet. Please try again in a moment.");
                    alert("आवाज़ लोड हो रही है, कृपया कुछ क्षण बाद पुनः प्रयास करें।");
                    return;
                }
            }

            atithi_utteranceQueue = [];
            const selectorsForTTS = [
                '#introContent p',
                '#articleContent h2, #articleContent h3, #articleContent h4, #articleContent h5, #articleContent h6, #articleContent p, #articleContent li, #articleContent .atithi-article-quote',
                '#poemContent .atithi-poem-line', // This will pick up the modified font size text
                '#mediaContent h3, #mediaContent .atithi-media-placeholder p',
                '#guidanceContent h2, #guidanceContent h3, #guidanceContent p, #guidanceContent li',
                '#conclusionContent h3, #conclusionContent p',
                '#rightsContent h3, #rightsContent p'
            ];

            document.querySelectorAll(selectorsForTTS.join(', ')).forEach(el => {
                const textContent = el.textContent ? el.textContent.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() : "";
                if (textContent && textContent.toLowerCase() !== 'कोड कॉपी') { 
                    atithi_utteranceQueue.push(textContent);
                }
            });

            if (atithi_utteranceQueue.length > 0) {
                atithi_isPlayingTTS = true;
                atithi_currentUtteranceIndex = 0;
                if (atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true; 
                atithi_speakNextUtterance();
            } else {
                alert("पढ़ने के लिए कोई सामग्री नहीं मिली।");
            }
        });
    }

    if (atithi_ttsStopButton && atithi_synth) {
        atithi_ttsStopButton.addEventListener('click', () => {
            atithi_synth.cancel(); 
            atithi_isPlayingTTS = false;
            atithi_currentUtteranceIndex = 0;
            atithi_utteranceQueue = [];
            if (atithi_ttsPlayButton) {
                atithi_ttsPlayButton.innerHTML = '<i class="fa fa-volume-up" aria-hidden="true"></i> पूरा पोस्ट सुनें';
                atithi_ttsPlayButton.disabled = false;
            }
            if (atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
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
                const currentScrollY = window.scrollY;
                window.scrollTo(0, 0);

                setTimeout(() => { 
                    html2canvas(elementToCapture, {
                        scale: 1.2, 
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        scrollX: -window.scrollX, 
                        scrollY: -window.scrollY,
                        windowWidth: elementToCapture.scrollWidth,
                        windowHeight: elementToCapture.scrollHeight,
                        logging: false, 
                        onclone: (clonedDoc) => {
                            clonedDoc.body.classList.add('pdf-mode'); 
                            clonedDoc.querySelectorAll('.atithi-action-buttons, .atithi-copy-button, .atithi-media-content .atithi-video-player, .atithi-external-links .atithi-button:not([href*="portal"]), .atithi-email-display, .atithi-related-link-box').forEach(el => el.style.display = 'none');
                            clonedDoc.querySelectorAll('[data-aos]').forEach(el => {
                                el.classList.remove('aos-init', 'aos-animate');
                            });
                        }
                    })
                    .then(canvas => {
                        window.scrollTo(0, currentScrollY); 
                        document.body.classList.remove('pdf-mode');

                        const imgData = canvas.toDataURL('image/png', 0.9); 
                        const pdf = new jsPDF({
                            orientation: 'p',
                            unit: 'mm',
                            format: 'a4'
                        });
                        const imgProps = pdf.getImageProperties(imgData);
                        const pdfMargin = 8; 
                        const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * pdfMargin;
                        const pdfHeightCalculated = (imgProps.height * pdfWidth) / imgProps.width; 
                        const pageHeightA4 = pdf.internal.pageSize.getHeight() - 2 * pdfMargin; 

                        let currentYCanvas = 0; 
                        const numPages = Math.ceil(pdfHeightCalculated / pageHeightA4);

                        for (let i = 0; i < numPages; i++) {
                            if (i > 0) pdf.addPage();
                            let sourceHeightCanvas = (pageHeightA4 / pdfHeightCalculated) * canvas.height;
                            sourceHeightCanvas = Math.min(sourceHeightCanvas, canvas.height - currentYCanvas);
                            if (sourceHeightCanvas <= 0) break; 
                            let pageCanvas = document.createElement('canvas');
                            pageCanvas.width = canvas.width;
                            pageCanvas.height = sourceHeightCanvas;
                            let pageCtx = pageCanvas.getContext('2d');
                            pageCtx.drawImage(canvas, 0, currentYCanvas, canvas.width, sourceHeightCanvas, 0, 0, canvas.width, sourceHeightCanvas);
                            let destHeightPdf = (sourceHeightCanvas * pdfWidth) / canvas.width;
                            pdf.addImage(pageCanvas.toDataURL('image/png', 0.9), 'PNG', pdfMargin, pdfMargin, pdfWidth, destHeightPdf);
                            currentYCanvas += sourceHeightCanvas;
                        }

                        pdf.save('रीवा-की-प्राचीन-धरोहर.pdf');
                        atithi_downloadPdfButton.innerHTML = originalButtonHtml;
                        atithi_downloadPdfButton.disabled = false;
                    }).catch(err => {
                        window.scrollTo(0, currentScrollY); 
                        document.body.classList.remove('pdf-mode');
                        console.error("PDF Generation Error:", err);
                        atithi_downloadPdfButton.innerHTML = originalButtonHtml;
                        atithi_downloadPdfButton.disabled = false;
                        alert("PDF बनाने में त्रुटि हुई: " + err.message);
                    });
                }, 400); 
            } else {
                alert("PDF बनाने में त्रुटि! आवश्यक लाइब्रेरी (html2canvas, jsPDF) लोड नहीं हुई हैं या कंटेंट रैपर नहीं मिला।");
                atithi_downloadPdfButton.innerHTML = originalButtonHtml;
                atithi_downloadPdfButton.disabled = false;
                if (typeof html2canvas === 'undefined') console.error('html2canvas is not loaded');
                if (typeof jspdf === 'undefined') console.error('jspdf is not loaded');
                if (!elementToCapture) console.error('.atithi-page-container not found');
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
            let pageTitle = "विंध्य की प्राचीन धरोहर: रीवा"; 
            if (pageTitleElement) {
                let tempTitle = "";
                pageTitleElement.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        tempTitle += node.textContent.trim();
                    }
                });
                if (tempTitle) pageTitle = tempTitle;
            }
            const authorName = "आचार्य आशीष मिश्र";
            const shareText = `📜 "${pageTitle}" 📜 ${authorName} द्वारा शोधित - विंध्य की प्राचीन धरोहर! अवश्य पढ़ें और साझा करें!`;

            if (navigator.share) {
                navigator.share({
                        title: pageTitle,
                        text: shareText,
                        url: pageUrl
                    })
                    .then(() => console.log('Successful share'))
                    .catch((error) => console.log('Error sharing:', error));
            } else {
                const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
                const whatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + pageUrl)}`;
                let fallbackMessage = `इस ऐतिहासिक लेख को साझा करें!\n\nTwitter:\n${twitter}\n\nWhatsApp:\n${whatsapp}\n\nया लिंक कॉपी करें:\n${pageUrl}`;
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

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('संदर्भ ग्रंथ आपके क्लिपबोर्ड पर कॉपी कर दिए गए हैं!');
                }).catch(err => {
                    console.error('Async: कुड नॉट कॉपी टेक्स्ट: ', err);
                    atithi_fallbackCopyTextToClipboard(textToCopy); 
                });
            } else {
                atithi_fallbackCopyTextToClipboard(textToCopy); 
            }
        }
    }
    const copyPoemButton = document.querySelector('.atithi-copy-button'); 
    if (copyPoemButton && document.getElementById('poemGuidanceText')) { 
        copyPoemButton.addEventListener('click', atithi_copyPoemGuidance);
    }


    function atithi_fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                alert('संदर्भ ग्रंथ आपके क्लिपबोर्ड पर कॉपी कर दिए गए हैं! (fallback)');
            } else {
                alert('क्षमा करें, कॉपी करने में त्रुटि हुई। (fallback execCommand failed)');
            }
        } catch (err) {
            console.error('Fallback: ऊप्स, अनेबल टू कॉपी', err);
            alert('क्षमा करें, कॉपी करने में त्रुटि हुई। (fallback exception)');
        }
        document.body.removeChild(textArea);
    }


    // --- Cleanup TTS on page unload ---
    window.addEventListener('beforeunload', () => {
        if (atithi_synth && atithi_synth.speaking) {
            atithi_synth.cancel();
        }
    });

}); // End of DOMContentLoaded
</script>
