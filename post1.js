// --- Year Update ---
try {
    const footerYearEl = document.getElementById('currentYearFooter');
    const copyrightYearSpanEl = document.getElementById('copyrightYear');
    const currentYear = new Date().getFullYear();

    if (footerYearEl) footerYearEl.textContent = currentYear;

    if (copyrightYearSpanEl) {
        copyrightYearSpanEl.textContent = currentYear;
    } else {
        const copyrightTextEl = document.querySelector('.atithi-copyright-text');
        if (copyrightTextEl) {
             copyrightTextEl.innerHTML = copyrightTextEl.innerHTML.replace(/\d{4}/, currentYear.toString());
        }
    }
} catch (e) {
    console.error("Year update failed:", e);
}

// --- PDF Download Button ---
const downloadPdfAnchor = document.getElementById('downloadPdfButton');
if (downloadPdfAnchor && downloadPdfAnchor.tagName === 'A') {
    const originalPdfButtonHtml = downloadPdfAnchor.innerHTML;
    const pdfOpeningText = "डाउनलोड हो रहा है...";

    downloadPdfAnchor.addEventListener('click', function() {
        this.innerHTML = `<i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> ${pdfOpeningText}`;
        setTimeout(() => {
            this.innerHTML = originalPdfButtonHtml;
        }, 3000);
    });
}

// --- Share Functionality ---
const atithi_sharePostButton = document.getElementById('sharePostButton');
if (atithi_sharePostButton) {
    atithi_sharePostButton.addEventListener('click', (e) => {
        e.preventDefault();
        const pageUrl = window.location.href;

        // HTML से डायनामिक मान प्राप्त करें
        const metaPageTitleEl = document.getElementById('metaPageTitle');
        const metaAuthorNameEl = document.getElementById('metaAuthorName');
        const metaShareSuffixEl = document.getElementById('metaShareSuffix');

        let pageTitle, authorName, shareSuffixText;

        // पेज शीर्षक प्राप्त करें
        if (metaPageTitleEl && metaPageTitleEl.textContent.trim() !== "") {
            pageTitle = metaPageTitleEl.textContent.trim();
        } else {
            const pageTitleFromHeaderEl = document.querySelector('.atithi-page-header .atithi-main-title');
            if (pageTitleFromHeaderEl) {
                let tempTitle = "";
                pageTitleFromHeaderEl.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        tempTitle += node.textContent.trim();
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SPAN') {
                         tempTitle += node.textContent.trim();
                    }
                });
                if (tempTitle) pageTitle = tempTitle.replace(/\s+/g, ' ').trim();
            }
        }
        pageTitle = pageTitle || document.title || "विंध्य की प्राचीन धरोहर: रीवा"; // अंतिम फॉलबैक

        // लेखक का नाम प्राप्त करें
        if (metaAuthorNameEl && metaAuthorNameEl.textContent.trim() !== "") {
            authorName = metaAuthorNameEl.textContent.trim();
        } else {
            const authorFromHeaderEl = document.querySelector('.atithi-page-header .atithi-author-name');
            if (authorFromHeaderEl && authorFromHeaderEl.textContent) {
                authorName = authorFromHeaderEl.textContent.replace(/शोध एवं संपादन:/i, '').replace(/<i[^>]*><\/i>/g, '').trim();
            }
        }
        authorName = authorName || "आचार्य आशीष मिश्र"; // अंतिम फॉलबैक

        // शेयर सफिक्स प्राप्त करें
        if (metaShareSuffixEl && metaShareSuffixEl.textContent.trim() !== "") {
            shareSuffixText = metaShareSuffixEl.textContent.trim();
        } else {
            // यदि metaShareSuffix नहीं है, तो पुराने dynamicShareSuffix को देखें
            const dynamicSuffixElement = document.getElementById('dynamicShareSuffix');
            if (dynamicSuffixElement && dynamicSuffixElement.textContent.trim() !== "") {
                shareSuffixText = dynamicSuffixElement.textContent.trim();
            }
        }
        shareSuffixText = shareSuffixText || "द्वारा शोधित - विंध्य की प्राचीन धरोहर! अवश्य पढ़ें और साझा करें! #विंध्यधरोहर #रीवाइतिहास"; // अंतिम फॉलबैक


        const shareTextForUrl = `📜 "${pageTitle}" 📜 ${authorName} ${shareSuffixText}`;

        if (navigator.share) {
            navigator.share({ title: pageTitle, text: shareTextForUrl, url: pageUrl })
                .then(() => console.log('Successful share via Web Share API'))
                .catch((error) => {
                    console.log('Error sharing via Web Share API or share cancelled:', error);
                    atithi_fallbackShare(shareTextForUrl, pageUrl, pageTitle);
                });
        } else {
            atithi_fallbackShare(shareTextForUrl, pageUrl, pageTitle);
        }
    });
}

function atithi_fallbackShare(shareText, pageUrl, pageTitleForEmail) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}&hashtags=विंध्यधरोहर,रीवाइतिहास`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n\nलिंक: ' + pageUrl)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}"e=${encodeURIComponent(shareText)}`;
    const emailSubject = encodeURIComponent("अवश्य पढ़ें: " + pageTitleForEmail);
    const emailBody = encodeURIComponent(`${shareText}\n\nलेख का लिंक: ${pageUrl}\n\nअधिक जानकारी के लिए देखें: https://acharyaasheeshmishra.blogspot.com`);
    const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    const copyText = `${shareText}\nलिंक: ${pageUrl}`;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(copyText).then(() => {
                alert("लेख का शीर्षक और लिंक क्लिपबोर्ड पर कॉपी कर दिया गया है।\n\nआप इसे मैन्युअल रूप से साझा कर सकते हैं। कुछ विकल्प:\n\nTwitter: " + twitterUrl + "\n\nWhatsApp: " + whatsappUrl + "\n\nFacebook: " + facebookUrl + "\n\nEmail: " + emailUrl);
            }).catch(err => {
                console.error("Fallback clipboard copy failed:", err);
                prompt("साझा करने के लिए लिंक कॉपी करें (Ctrl+C, Enter):\nTwitter: " + twitterUrl + "\nWhatsApp: " + whatsappUrl + "\nFacebook: " + facebookUrl + "\nEmail: " + emailUrl + "\n\nAlternatively, copy this text:", copyText);
            });
        } else {
             prompt("साझा करने के लिए लिंक कॉपी करें (Ctrl+C, Enter):\nTwitter: " + twitterUrl + "\nWhatsApp: " + whatsappUrl + "\nFacebook: " + facebookUrl + "\nEmail: " + emailUrl + "\n\nAlternatively, copy this text:", copyText);
        }
    } catch(e) {
         prompt("साझा करने के लिए लिंक कॉपी करें (Ctrl+C, Enter):\nTwitter: " + twitterUrl + "\nWhatsApp: " + whatsappUrl + "\nFacebook: " + facebookUrl + "\nEmail: " + emailUrl + "\n\nAlternatively, copy this text:", copyText);
         console.error("Error in fallbackShare clipboard attempt", e);
    }
}

function atithi_copyPoemGuidance() {
    const textToCopyEl = document.getElementById('poemGuidanceText');
    if (textToCopyEl) {
        let textToCopy = textToCopyEl.innerText || textToCopyEl.textContent;
        textToCopy = textToCopy.replace(/\/\*[\s\S]*?\*\/|^\s*[\r\n]/gm, "").trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert('संदर्भ ग्रंथ आपके क्लिपबोर्ड पर कॉपी कर दिए गए हैं!');
            }).catch(err => {
                console.error('Async copy failed: ', err);
                atithi_fallbackCopyTextToClipboard(textToCopy, 'संदर्भ ग्रंथ क्लिपबोर्ड पर कॉपी (fallback)!', 'कॉपी करने में त्रुटि (fallback)!');
            });
        } else {
            atithi_fallbackCopyTextToClipboard(textToCopy, 'संदर्भ ग्रंथ क्लिपबोर्ड पर कॉपी (fallback)!', 'कॉपी करने में त्रुटि (fallback)!');
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
        copyPoemButton.style.display = 'none';
    }
}

function atithi_fallbackCopyTextToClipboard(text, successMessage, errorMessage) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.top = "-9999px"; textArea.style.left = "-9999px";
    (document.body || document.documentElement).appendChild(textArea);
    textArea.focus(); textArea.select();
    try {
        const successful = document.execCommand('copy');
        alert(successful ? successMessage : errorMessage);
    } catch (err) {
        console.error('Fallback copy error', err);
        alert('कॉपी करने में त्रुटि (fallback exception)!');
    }
    (document.body || document.documentElement).removeChild(textArea);
}

const atithi_synth = window.speechSynthesis;
const atithi_ttsPlayButton = document.getElementById('playTTSButton');
const atithi_ttsStopButton = document.getElementById('stopTTSButton');
let atithi_utteranceQueue = [];
let atithi_currentUtteranceIndex = 0;
let atithi_isPlayingTTS = false;
let atithi_isPausedTTS = false;
let atithi_voices = [];

const originalPlayTTSButtonHTML = atithi_ttsPlayButton ? atithi_ttsPlayButton.innerHTML : '<i class="fa fa-volume-up"></i> पूरा पोस्ट सुनें';

if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;

function atithi_populateVoiceListDelayed() {
    if(typeof speechSynthesis === 'undefined') {
        if(atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true;
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
        console.warn("Speech Synthesis not supported.");
        return;
    }
    try { atithi_voices = speechSynthesis.getVoices(); }
    catch (e) { console.error("Error getting voices initially:", e); if(atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true; if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true; return; }

    if(atithi_voices.length === 0 && speechSynthesis.onvoiceschanged !== undefined) {
         speechSynthesis.onvoiceschanged = function() {
            try { atithi_voices = speechSynthesis.getVoices(); }
            catch (e) { console.error("Error getting voices onvoiceschanged:", e); return; }
            console.log("TTS Voices loaded (onvoiceschanged):", atithi_voices.filter(v => v.lang.startsWith('hi')));
            speechSynthesis.onvoiceschanged = null;
         };
    } else if (atithi_voices.length === 0) {
         let attempts = 0; const maxAttempts = 10;
         function pollVoices() {
            try { atithi_voices = speechSynthesis.getVoices(); }
            catch (e) { console.error("Error getting voices during polling:", e); return; }
            attempts++;
            if (atithi_voices.length === 0 && attempts < maxAttempts) { setTimeout(pollVoices, 200); }
            else if (atithi_voices.length > 0) { console.log(`TTS Voices loaded (polling attempt ${attempts}):`, atithi_voices.filter(v => v.lang.startsWith('hi'))); }
            else { console.warn("TTS voices still not available after polling."); if(atithi_ttsPlayButton) atithi_ttsPlayButton.innerHTML = '<i class="fa fa-exclamation-triangle"></i> आवाज़ अनुपलब्ध'; }
         }
         setTimeout(pollVoices, 200);
    } else {
        console.log("TTS Voices loaded (initial attempt):", atithi_voices.filter(v => v.lang.startsWith('hi')));
    }
}
atithi_populateVoiceListDelayed();

function atithi_speakNextUtterance() {
    if (!atithi_isPlayingTTS || atithi_currentUtteranceIndex >= atithi_utteranceQueue.length) {
        atithi_isPlayingTTS = false; atithi_isPausedTTS = false;
        if(atithi_ttsPlayButton) { atithi_ttsPlayButton.disabled = false; atithi_ttsPlayButton.innerHTML = originalPlayTTSButtonHTML; }
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
        return;
    }
    const utterance = atithi_utteranceQueue[atithi_currentUtteranceIndex];
    utterance.onstart = () => { if(atithi_ttsPlayButton && atithi_isPlayingTTS && !atithi_isPausedTTS) atithi_ttsPlayButton.innerHTML = '<i class="fa fa-microphone"></i> बोल रहा है...'; };
    utterance.onend = () => { atithi_currentUtteranceIndex++; atithi_speakNextUtterance(); };
    utterance.onerror = (event) => { console.error('SpeechSynthesisUtterance.onerror', event); atithi_currentUtteranceIndex++; atithi_speakNextUtterance(); };
    if(atithi_synth) { atithi_synth.speak(utterance); }
}

if (atithi_ttsPlayButton) {
    atithi_ttsPlayButton.addEventListener('click', () => {
        if (!atithi_synth) {
            alert("भाषण संश्लेषण आपके ब्राउज़र में समर्थित नहीं है।");
            if(atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true;
            if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
            return;
        }
        if (atithi_synth.speaking && atithi_isPlayingTTS && !atithi_isPausedTTS) { atithi_synth.pause(); atithi_isPausedTTS = true; atithi_ttsPlayButton.innerHTML = '<i class="fa fa-play"></i> जारी रखें'; return; }
        if (atithi_synth.paused && atithi_isPausedTTS) { atithi_synth.resume(); atithi_isPausedTTS = false; if(atithi_ttsPlayButton) atithi_ttsPlayButton.innerHTML = '<i class="fa fa-microphone"></i> बोल रहा है...'; return; }
        if (atithi_voices.length === 0) {
            if(atithi_ttsPlayButton) atithi_ttsPlayButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> आवाज़ लोड हो रही है...';
            atithi_populateVoiceListDelayed();
             setTimeout(() => {
                if (atithi_voices.length === 0) {
                    alert("आवाज़ लोड नहीं हो सकी, कृपया कुछ क्षण बाद पुनः प्रयास करें या पृष्ठ को रीफ़्रेश करें।");
                    if(atithi_ttsPlayButton) { atithi_ttsPlayButton.disabled = false; atithi_ttsPlayButton.innerHTML = originalPlayTTSButtonHTML; }
                    return;
                }
                startTTSPlayback();
            }, 1000);
            return;
        }
        startTTSPlayback();
    });
} else if(atithi_ttsPlayButton) { atithi_ttsPlayButton.disabled = true; }

function startTTSPlayback() {
    if (!atithi_ttsPlayButton) return;
    atithi_ttsPlayButton.disabled = true;
    atithi_ttsPlayButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> टेक्स्ट लोड हो रहा है...';
    const elementsToRead = document.querySelectorAll(
        '.atithi-page-header .atithi-main-title, .atithi-page-header .atithi-subtitle, #introContent p, #articleContent h2, #articleContent h3, #articleContent h4, #articleContent p, #articleContent blockquote, #articleContent li, #poemContent .atithi-poem-title, #poemContent .atithi-poem-line, #conclusionContent h3, #conclusionContent p'
    );
    atithi_utteranceQueue = []; atithi_currentUtteranceIndex = 0;
    elementsToRead.forEach(element => {
        let text = "";
        if (element.classList.contains('atithi-main-title')) {
            let tempTitle = "";
            element.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) { tempTitle += node.textContent.trim(); }
                else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SPAN') { tempTitle += node.textContent.trim(); }
            });
            text = tempTitle;
        } else { text = element.innerText || element.textContent; }
        text = text.replace(/\s+/g, ' ').trim();
        if (element.tagName === 'BLOCKQUOTE' && text) { text = "एक उद्धरण: " + text; }
        if (text && text.toLowerCase() !== 'संदर्भ कॉपी' && text.length > 2) { // "संदर्भ कॉपी" टेक्स्ट को न पढ़ें
            const utterance = new SpeechSynthesisUtterance(text);
            const hindiVoice = atithi_voices.find(voice => voice.lang.startsWith('hi-IN') && (voice.name.includes('Google') || voice.name.toLowerCase().includes('hindi') || voice.default));
            utterance.voice = hindiVoice || atithi_voices.find(voice => voice.lang.startsWith('hi')) || atithi_voices.find(voice => voice.default && voice.lang.startsWith('hi')) || null;
            utterance.lang = utterance.voice ? utterance.voice.lang : 'hi-IN';
            utterance.rate = 0.92; utterance.pitch = 1.0;
            atithi_utteranceQueue.push(utterance);
        }
    });
    if (atithi_utteranceQueue.length > 0) {
        atithi_isPlayingTTS = true; atithi_isPausedTTS = false;
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = false;
        atithi_speakNextUtterance();
    } else {
        atithi_ttsPlayButton.disabled = false; atithi_ttsPlayButton.innerHTML = originalPlayTTSButtonHTML;
        alert("पढ़ने के लिए कोई टेक्स्ट नहीं मिला।");
    }
}

if (atithi_ttsStopButton) {
    atithi_ttsStopButton.addEventListener('click', () => {
        if (!atithi_synth) return;
        atithi_synth.cancel(); atithi_isPlayingTTS = false; atithi_isPausedTTS = false;
        atithi_currentUtteranceIndex = 0; atithi_utteranceQueue = [];
        if(atithi_ttsPlayButton) { atithi_ttsPlayButton.disabled = false; atithi_ttsPlayButton.innerHTML = originalPlayTTSButtonHTML; }
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
        console.log("TTS Stopped.");
    });
} else if (atithi_ttsStopButton) { atithi_ttsStopButton.disabled = true; }

window.addEventListener('beforeunload', () => { if (atithi_synth && atithi_synth.speaking) { atithi_synth.cancel(); } });
console.log("All scripts initialized (defer expected).");
