// <script type="text/javascript">
// <!--
document.addEventListener('DOMContentLoaded', function() {

// --- AOS Initialization ---
try {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: false,
            offset: 100,
            easing: 'ease-out-cubic',
            // disable: 'mobile' // Consider enabling if performance is an issue on mobile
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
    if (!atithi_synth) { return; }
    try {
        let allVoices = atithi_synth.getVoices();
        atithi_voices = allVoices.filter(voice => voice.lang.startsWith('hi'));
        if (atithi_voices.length === 0 && allVoices.length > 0) {
            atithi_voices = allVoices;
        }
        console.log("Voices populated. Hindi voices:", atithi_voices.filter(v => v.lang.startsWith('hi')).length, "Total:", atithi_voices.length);
        if (atithi_ttsPlayButton) {
            atithi_ttsPlayButton.disabled = (atithi_voices.length === 0);
        }
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
        setTimeout(() => {
            if (atithi_synth.getVoices().length > 0) {
                atithi_populateVoiceList();
            } else if (atithi_ttsPlayButton) {
                atithi_ttsPlayButton.disabled = true;
                console.warn("TTS voices still not available after timeout.");
            }
        }, 1000); // Increased timeout for voice loading
    }
    if (atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
} else {
    if (atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true;
    if (atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
    console.warn("Speech Synthesis not supported.");
}

function atithi_speakNextUtterance() {
    if (!atithi_isPlayingTTS || atithi_currentUtteranceIndex >= atithi_utteranceQueue.length) {
        atithi_isPlayingTTS = false;
        atithi_currentUtteranceIndex = 0;
        atithi_utteranceQueue = [];
        if (atithi_ttsPlayButton) {
            atithi_ttsPlayButton.innerHTML = '<i class="fa fa-volume-up" aria-hidden="true"></i> पूरा पोस्ट सुनें';
            atithi_ttsPlayButton.disabled = (atithi_voices.length === 0);
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
        console.error('TTS Error:', event.error, "for text:", textToSpeak);
        atithi_currentUtteranceIndex++;
        atithi_speakNextUtterance();
    };

    if (atithi_voices.length > 0) {
        let hindiVoice = atithi_voices.find(voice => voice.lang === 'hi-IN' && (voice.name.includes('Google') || voice.name.toLowerCase().includes('hindi')));
        utterance.voice = hindiVoice || atithi_voices.find(voice => voice.lang.startsWith('hi')) || atithi_voices[0];
        if (utterance.voice) console.log("Using voice:", utterance.voice.name, utterance.voice.lang);
        else console.warn("No suitable voice found, using browser default.");
    } else {
         console.warn("Voice list empty. TTS will use default system voice.");
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
        if (atithi_synth.speaking && atithi_synth.paused) {
            atithi_synth.resume();
            atithi_ttsPlayButton.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> बोल रहा...';
            return;
        }
        if (atithi_synth.speaking && !atithi_synth.paused) {
            atithi_synth.pause();
            atithi_ttsPlayButton.innerHTML = '<i class="fa fa-pause-circle" aria-hidden="true"></i> रुका है';
            return;
        }

        if (atithi_voices.length === 0) {
            atithi_populateVoiceList();
            if (atithi_voices.length === 0) {
                alert("आवाज़ लोड हो रही है, कृपया कुछ क्षण बाद पुनः प्रयास करें।");
                return;
            }
        }

        atithi_utteranceQueue = [];
        const selectorsForTTS = [
            '.atithi-page-header .atithi-main-title', '.atithi-page-header .atithi-subtitle', // Header text
            '#introContent p',
            '#articleContent h2, #articleContent h3, #articleContent h4, #articleContent h5, #articleContent h6, #articleContent p, #articleContent li, #articleContent .atithi-article-quote',
            '#poemContent .atithi-poem-title', '#poemContent .atithi-poem-line',
            '#mediaContent h3, #mediaContent .atithi-media-placeholder p',
            '#guidanceContent h2, #guidanceContent h3, #guidanceContent p, #guidanceContent ul li', // Target li directly for lists
            '#conclusionContent h3, #conclusionContent p',
            '#rightsContent h3, #rightsContent p'
        ];

        document.querySelectorAll(selectorsForTTS.join(', ')).forEach(el => {
            let textContent = "";
            if (el.matches('.atithi-main-title')) { // Special handling for main title to exclude deco spans
                 el.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        textContent += node.textContent.trim() + " ";
                    }
                });
                textContent = textContent.trim();
            } else {
               textContent = el.textContent ? el.textContent.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() : "";
            }

            if (textContent && textContent.toLowerCase() !== 'कोड कॉपी' && !el.closest('.atithi-code-block')) { // Exclude code block content
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
            if (atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = (atithi_voices.length === 0);
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
            atithi_ttsPlayButton.disabled = (atithi_voices.length === 0);
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

        if (!elementToCapture) {
            alert("PDF त्रुटि: मुख्य कंटेंट क्षेत्र (.atithi-page-container) नहीं मिला।");
            atithi_downloadPdfButton.innerHTML = originalButtonHtml; atithi_downloadPdfButton.disabled = false; return;
        }
        if (typeof html2canvas === 'undefined') {
            alert("PDF त्रुटि: html2canvas लाइब्रेरी लोड नहीं हुई।");
            atithi_downloadPdfButton.innerHTML = originalButtonHtml; atithi_downloadPdfButton.disabled = false; return;
        }
        if (typeof jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            alert("PDF त्रुटि: jsPDF लाइब्रेरी लोड नहीं हुई।");
            atithi_downloadPdfButton.innerHTML = originalButtonHtml; atithi_downloadPdfButton.disabled = false; return;
        }

        const { jsPDF } = window.jspdf;
        const currentScrollY = window.scrollY;
        
        // Temporarily apply PDF mode styles and scroll to top
        document.body.classList.add('pdf-mode');
        window.scrollTo(0, 0);

        // Allow a brief moment for styles to apply and page to re-render if necessary
        setTimeout(() => {
            try {
                html2canvas(elementToCapture, {
                    scale: 1.5, // Increased for better quality, can be 1.2 or 1
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: elementToCapture.scrollWidth, // Use scrollWidth of the element
                    windowHeight: elementToCapture.scrollHeight, // Use scrollHeight for full content
                    logging: true, // Enable for debugging
                    removeContainer: true, // Helps with memory cleanup
                    onclone: (clonedDoc) => {
                        try {
                            clonedDoc.body.classList.add('pdf-mode');
                            const selectorsToHideInPDF = [
                                '.atithi-action-buttons', '.atithi-copy-button',
                                '.atithi-media-content .atithi-video-player',
                                '.atithi-external-links .atithi-button:not([href*="portal"])',
                                '.atithi-email-display', '.atithi-related-link-box',
                                '.atithi-cta-scroll-block', '.atithi-external-links', /* Hide entire external links section */
                                'script', 'iframe:not([src*="youtube.com/embed/Qc7oU4P4c0A"])' // Example: keep specific iframe
                            ];
                            clonedDoc.querySelectorAll(selectorsToHideInPDF.join(',')).forEach(el => {
                                if(el && el.style) el.style.display = 'none';
                            });
                            clonedDoc.querySelectorAll('[data-aos]').forEach(el => {
                                if (el) {
                                    el.removeAttribute('data-aos'); // Remove AOS attribute to prevent interference
                                    el.style.opacity = '1';
                                    el.style.transform = 'none';
                                    el.style.transition = 'none';
                                }
                            });
                            // Ensure all elements are visible for capture
                            clonedDoc.querySelectorAll('*').forEach(el => {
                                if (el.style) {
                                     // Override any styles that might make elements invisible due to JS
                                    if (el.style.opacity === '0') el.style.opacity = '1';
                                    if (el.style.visibility === 'hidden') el.style.visibility = 'visible';
                                    // Remove transforms that might misplace elements
                                    if (el.style.transform && el.style.transform !== 'none') el.style.transform = 'none';
                                }
                            });
                        } catch (cloneErr) {
                            console.error("Error during onclone:", cloneErr);
                        }
                    }
                })
                .then(canvas => {
                    const imgData = canvas.toDataURL('image/png', 0.9); // Quality vs size
                    const pdf = new jsPDF({
                        orientation: 'p',
                        unit: 'mm',
                        format: 'a4',
                        // putOnlyUsedFonts: true, // Experimental, may reduce size
                        // compress: true // May reduce size but increase processing
                    });
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfMargin = 7;
                    const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * pdfMargin;
                    const pdfHeightFromImage = (imgProps.height * pdfWidth) / imgProps.width;
                    const a4PageHeight = pdf.internal.pageSize.getHeight() - 2 * pdfMargin;

                    let canvasYOffset = 0;
                    const totalPdfPages = Math.ceil(pdfHeightFromImage / a4PageHeight);

                    for (let i = 0; i < totalPdfPages; i++) {
                        if (i > 0) pdf.addPage();
                        
                        let sliceHeightOnCanvas = (a4PageHeight / pdfHeightFromImage) * canvas.height;
                        sliceHeightOnCanvas = Math.min(sliceHeightOnCanvas, canvas.height - canvasYOffset);

                        if (sliceHeightOnCanvas <= 0) break;

                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = canvas.width;
                        tempCanvas.height = sliceHeightOnCanvas;
                        const tempCtx = tempCanvas.getContext('2d');
                        tempCtx.drawImage(canvas, 0, canvasYOffset, canvas.width, sliceHeightOnCanvas, 0, 0, canvas.width, sliceHeightOnCanvas);
                        
                        const slicePdfHeight = (sliceHeightOnCanvas * pdfWidth) / canvas.width;
                        pdf.addImage(tempCanvas.toDataURL('image/png', 0.9), 'PNG', pdfMargin, pdfMargin, pdfWidth, slicePdfHeight);
                        canvasYOffset += sliceHeightOnCanvas;
                    }
                    pdf.save('रीवा-की-प्राचीन-धरोहर.pdf');
                })
                .catch(err => {
                    console.error("PDF Generation Error (html2canvas promise):", err);
                    alert("PDF बनाने में त्रुटि हुई: " + err.message + "\nअधिक जानकारी के लिए कंसोल देखें।");
                })
                .finally(() => {
                    window.scrollTo(0, currentScrollY);
                    document.body.classList.remove('pdf-mode');
                    atithi_downloadPdfButton.innerHTML = originalButtonHtml;
                    atithi_downloadPdfButton.disabled = false;
                });
            } catch (outerErr) {
                 console.error("Outer error in PDF generation setup:", outerErr);
                 alert("PDF बनाने में सेटअप त्रुटि: " + outerErr.message);
                 window.scrollTo(0, currentScrollY);
                 document.body.classList.remove('pdf-mode');
                 atithi_downloadPdfButton.innerHTML = originalButtonHtml;
                 atithi_downloadPdfButton.disabled = false;
            }
        }, 700); // Increased timeout for complex pages
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
            if (tempTitle) pageTitle = tempTitle.replace(/\s+/g, ' ').trim(); // Consolidate multiple spaces
        }
        const authorName = "आचार्य आशीष मिश्र";
        const shareText = `📜 "${pageTitle}" 📜 ${authorName} द्वारा शोधित - विंध्य की प्राचीन धरोहर! अवश्य पढ़ें और साझा करें!`;

        if (navigator.share) {
            navigator.share({ title: pageTitle, text: shareText, url: pageUrl })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing:', error));
        } else {
            const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
            const whatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + pageUrl)}`;
            prompt("साझा करें:", `${shareText}\n\nLink: ${pageUrl}\nTwitter: ${twitter}\nWhatsApp: ${whatsapp}`);
        }
    });
}

// --- Copy Poem Guidance Text ---
function atithi_copyPoemGuidance() {
    const textToCopyEl = document.getElementById('poemGuidanceText');
    if (textToCopyEl) {
        let textToCopy = textToCopyEl.innerText || textToCopyEl.textContent;
        textToCopy = textToCopy.replace(/\/\*[\s\S]*?\*\/|IGNORE_WHEN_COPYING_START[\s\S]*?IGNORE_WHEN_COPYING_END/gm, "");
        textToCopy = textToCopy.split('\n').filter(line => line.trim() !== '').join('\n').trim();

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert('संदर्भ ग्रंथ आपके क्लिपबोर्ड पर कॉपी कर दिए गए हैं!');
            }).catch(err => {
                console.error('Async copy failed: ', err);
                atithi_fallbackCopyTextToClipboard(textToCopy);
            });
        } else {
            atithi_fallbackCopyTextToClipboard(textToCopy);
        }
    } else {
        console.error("Element 'poemGuidanceText' not found for copying.");
    }
}
const copyPoemButton = document.querySelector('.atithi-code-block .atithi-copy-button');
if (copyPoemButton) {
    if (document.getElementById('poemGuidanceText')) {
        copyPoemButton.addEventListener('click', atithi_copyPoemGuidance);
    } else {
        copyPoemButton.style.display = 'none'; // Hide button if target is missing
    }
}

function atithi_fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.top = "-9999px"; textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try {
        const successful = document.execCommand('copy');
        alert(successful ? 'संदर्भ ग्रंथ क्लिपबोर्ड पर कॉपी (fallback)!' : 'कॉपी करने में त्रुटि (fallback)!');
    } catch (err) {
        console.error('Fallback copy error', err);
        alert('कॉपी करने में त्रुटि (fallback exception)!');
    }
    document.body.removeChild(textArea);
}

// --- Cleanup TTS on page unload ---
window.addEventListener('beforeunload', () => {
    if (atithi_synth && atithi_synth.speaking) {
        atithi_synth.cancel();
    }
});

// --- Scrollable Links Container (Optional JS for enhancements) ---
const scrollableLinksContainer = document.getElementById('scrollableLinksContainer');
if (scrollableLinksContainer) {
    // Example: Add a class when scrolled to indicate more content
    scrollableLinksContainer.addEventListener('scroll', function() {
        if (this.scrollTop > 10) {
            this.classList.add('scrolled');
        } else {
            this.classList.remove('scrolled');
        }
    });
}

}); // End of DOMContentLoaded
// -->
// </script>
