// --- Helper function to get text from HTML elements ---
function getTextFromElement(elementId, defaultValue) {
    const element = document.getElementById(elementId);
    if (element && element.textContent.trim()) {
        return element.textContent.trim();
    }
    return defaultValue;
}
function getHtmlFromElement(elementId, defaultValue) {
    const element = document.getElementById(elementId);
    if (element && element.innerHTML.trim()) {
        return element.innerHTML.trim();
    }
    return defaultValue;
}


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
    const pdfOpeningText = getTextFromElement('pdfDownloadingText', "डाउनलोड हो रहा है..."); // HTML से या डिफ़ॉल्ट

    downloadPdfAnchor.addEventListener('click', function() {
        this.innerHTML = `<i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> ${pdfOpeningText}`;
        setTimeout(() => {
            this.innerHTML = originalPdfButtonHtml;
        }, 3000);
    });
}

// --- Share Functionality ---
const atithi_sharePostButton = document.getElementById('sharePostButton');

function getShareDetailsFromHTML() {
    let pageTitle = document.title; // Fallback to document.title

    // Attempt to get title from meta tags first for better SEO/sharing context
    const pageTitleMetaOG = document.querySelector('meta[property="og:title"]');
    const pageTitleMetaTwitter = document.querySelector('meta[name="twitter:title"]');

    if (pageTitleMetaOG && pageTitleMetaOG.content) {
        pageTitle = pageTitleMetaOG.content;
    } else if (pageTitleMetaTwitter && pageTitleMetaTwitter.content) {
        pageTitle = pageTitleMetaTwitter.content;
    } else {
        // Fallback to h1 if meta tags are not specific enough or missing
        const mainTitleElement = document.querySelector('.atithi-page-header .atithi-main-title');
        if (mainTitleElement) {
            let tempTitle = "";
            // Iterate through child nodes to avoid including deco spans
            mainTitleElement.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    tempTitle += node.textContent.trim();
                } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SPAN') { // Exclude known deco spans
                     tempTitle += node.textContent.trim();
                }
            });
            if (tempTitle) pageTitle = tempTitle.replace(/\s+/g, ' ').trim(); // Clean up extra spaces
        }
    }
     // Final fallback if all else fails or results in an empty string
    if (!pageTitle || pageTitle.toLowerCase() === "undefined" || pageTitle.trim() === "") {
        pageTitle = getTextFromElement('defaultPageTitle', "विंध्य की प्राचीन धरोहर");
    }


    let authorName = getTextFromElement('defaultAuthorName', "आचार्य आशीष मिश्र"); // Default author
    const authorMeta = document.querySelector('meta[name="author"]');
    if (authorMeta && authorMeta.content) {
        authorName = authorMeta.content;
    } else {
        const authorElement = document.getElementById('metaAuthorName'); // Specific ID for author in HTML
        if (authorElement) {
            const rawAuthorText = authorElement.getAttribute('data-author-name') || authorElement.textContent;
            authorName = rawAuthorText.replace(/शोध एवं संपादन:/i, '').replace(/<i[^>]*><\/i>/g, '').trim() || authorName;
        }
    }

    const shareSuffixText = getTextFromElement('shareSuffixText', "इस अद्वितीय ऐतिहासिक अन्वेषण को अवश्य पढ़ें और साझा करें! #विंध्यधरोहर #रीवाइतिहास");

    return { pageTitle, authorName, shareSuffixText };
}


if (atithi_sharePostButton) {
    atithi_sharePostButton.addEventListener('click', (e) => {
        e.preventDefault();
        const pageUrl = window.location.href;
        const { pageTitle, authorName, shareSuffixText } = getShareDetailsFromHTML();

        const shareTextForUrl = `📜 "${pageTitle}" 📜\n${authorName}\n${shareSuffixText}`;

        if (navigator.share) {
            navigator.share({ title: pageTitle, text: shareTextForUrl, url: pageUrl })
                .then(() => console.log('Successful share via Web Share API'))
                .catch((error) => {
                    console.log('Error sharing via Web Share API or share cancelled:', error);
                    atithi_fallbackShareWithMessage(shareTextForUrl, pageUrl, pageTitle);
                });
        } else {
            atithi_fallbackShareWithMessage(shareTextForUrl, pageUrl, pageTitle);
        }
    });
}

function atithi_fallbackShareWithMessage(shareText, pageUrl, pageTitleForEmail) {
    const copySuccessMessage = getTextFromElement('copySuccessAlertText', "लिंक क्लिपबोर्ड पर कॉपी किया गया।");
    // Fallback prompt text is no longer used as prompt is removed
    // const copyFallbackPrompt = getTextFromElement('copyFallbackPromptText', "साझा करने के लिए यह टेक्स्ट कॉपी करें:");

    const fullShareText = `${shareText}\nलिंक: ${pageUrl}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullShareText).then(() => {
            alert(copySuccessMessage);
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
            // alert("क्लिपबोर्ड पर कॉपी करने में विफल। आप मैन्युअल रूप से कॉपी कर सकते हैं।");
        });
    } else {
        console.warn("Clipboard API not supported.");
        // alert("आपका ब्राउज़र क्लिपबोर्ड पर सीधी कॉपी का समर्थन नहीं करता है।");
    }
    // The prompt() call has been removed to avoid blocking UI.
    // Consider a custom non-blocking notification for copy success/failure if desired.
}


function atithi_copyPoemGuidance() {
    const textToCopyEl = document.getElementById('poemGuidanceText');
    const successMessage = getTextFromElement('refCopySuccessAlertText', 'संदर्भ कॉपी हुए!');
    const errorMessage = getTextFromElement('refCopyErrorAlertText', 'कॉपी में त्रुटि!');
    const fallbackSuccess = getTextFromElement('refCopyFallbackSuccessText', 'संदर्भ कॉपी हुए (fallback)!');
    const fallbackError = getTextFromElement('refCopyFallbackErrorText', 'कॉपी में त्रुटि (fallback)!');


    if (textToCopyEl) {
        let textToCopy = textToCopyEl.innerText || textToCopyEl.textContent;
        textToCopy = textToCopy.replace(/\/\*[\s\S]*?\*\/|^\s*[\r\n]/gm, "").trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert(successMessage);
            }).catch(err => {
                console.error('Async copy failed: ', err);
                atithi_fallbackCopyTextToClipboard(textToCopy, fallbackSuccess, fallbackError);
            });
        } else {
            atithi_fallbackCopyTextToClipboard(textToCopy, fallbackSuccess, fallbackError);
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
        alert(errorMessage + ' (exception)');
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

const defaultPlayButtonHTML = getHtmlFromElement('ttsDefaultPlayButtonHTML', '<i class="fa fa-volume-up"></i> पूरा पोस्ट सुनें');
const originalPlayTTSButtonHTML = atithi_ttsPlayButton ? atithi_ttsPlayButton.innerHTML : defaultPlayButtonHTML;


if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;

function atithi_populateVoiceListDelayed() {
    if(typeof speechSynthesis === 'undefined') {
        if(atithi_ttsPlayButton) {
            atithi_ttsPlayButton.disabled = true;
            // Get default message from HTML or use fallback
            atithi_ttsPlayButton.innerHTML = getTextFromElement('ttsNotSupportedButtonText', 'TTS असमर्थित');
        }
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
            speechSynthesis.onvoiceschanged = null; // Important to avoid multiple calls
         };
    } else if (atithi_voices.length === 0) { // Fallback polling if onvoiceschanged is not reliable
         let attempts = 0; const maxAttempts = 10;
         function pollVoices() {
            try { atithi_voices = speechSynthesis.getVoices(); }
            catch (e) { console.error("Error getting voices during polling:", e); return; }
            attempts++;
            if (atithi_voices.length === 0 && attempts < maxAttempts) { setTimeout(pollVoices, 200); }
            else if (atithi_voices.length > 0) { console.log(`TTS Voices loaded (polling attempt ${attempts}):`, atithi_voices.filter(v => v.lang.startsWith('hi'))); }
            else {
                console.warn("TTS voices still not available after polling.");
                if(atithi_ttsPlayButton) atithi_ttsPlayButton.innerHTML = getHtmlFromElement('ttsVoiceNotAvailableButtonText', '<i class="fa fa-exclamation-triangle"></i> आवाज़ अनुपलब्ध');
            }
         }
         setTimeout(pollVoices, 200);
    } else {
        console.log("TTS Voices loaded (initial attempt):", atithi_voices.filter(v => v.lang.startsWith('hi')));
    }
}
// Call directly as defer will ensure DOM is ready
atithi_populateVoiceListDelayed();

function atithi_speakNextUtterance() {
    if (!atithi_isPlayingTTS || atithi_currentUtteranceIndex >= atithi_utteranceQueue.length) {
        atithi_isPlayingTTS = false; atithi_isPausedTTS = false;
        if(atithi_ttsPlayButton) { atithi_ttsPlayButton.disabled = false; atithi_ttsPlayButton.innerHTML = originalPlayTTSButtonHTML; }
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
        return;
    }
    const utterance = atithi_utteranceQueue[atithi_currentUtteranceIndex];
    utterance.onstart = () => { if(atithi_ttsPlayButton && atithi_isPlayingTTS && !atithi_isPausedTTS) atithi_ttsPlayButton.innerHTML = getHtmlFromElement('ttsSpeakingButtonText','<i class="fa fa-microphone"></i> बोल रहा है...'); };
    utterance.onend = () => { atithi_currentUtteranceIndex++; atithi_speakNextUtterance(); };
    utterance.onerror = (event) => { console.error('SpeechSynthesisUtterance.onerror', event); atithi_currentUtteranceIndex++; atithi_speakNextUtterance(); };
    if(atithi_synth) { atithi_synth.speak(utterance); }
}

if (atithi_ttsPlayButton) {
    atithi_ttsPlayButton.addEventListener('click', () => {
        if (!atithi_synth) {
            alert(getTextFromElement('ttsNotSupportedAlertText', "भाषण संश्लेषण आपके ब्राउज़र में समर्थित नहीं है।"));
            if(atithi_ttsPlayButton) atithi_ttsPlayButton.disabled = true;
            if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
            return;
        }
        if (atithi_synth.speaking && atithi_isPlayingTTS && !atithi_isPausedTTS) { atithi_synth.pause(); atithi_isPausedTTS = true; atithi_ttsPlayButton.innerHTML = getHtmlFromElement('ttsResumeButtonText', '<i class="fa fa-play"></i> जारी रखें'); return; }
        if (atithi_synth.paused && atithi_isPausedTTS) { atithi_synth.resume(); atithi_isPausedTTS = false; if(atithi_ttsPlayButton) atithi_ttsPlayButton.innerHTML = getHtmlFromElement('ttsSpeakingButtonText','<i class="fa fa-microphone"></i> बोल रहा है...'); return; }

        // If voices are still loading (e.g., on a slow connection or first load)
        if (atithi_voices.length === 0) {
            if(atithi_ttsPlayButton) atithi_ttsPlayButton.innerHTML = getHtmlFromElement('ttsVoiceLoadingButtonText', '<i class="fa fa-spinner fa-spin"></i> आवाज़ लोड हो रही है...');
            // Attempt to populate voices again, then try to play
            atithi_populateVoiceListDelayed();
             setTimeout(() => { // Give a small delay for voices to potentially load
                if (atithi_voices.length === 0) {
                    alert(getTextFromElement('ttsVoiceNotAvailableAlertText', "आवाज़ लोड नहीं हो सकी, कृपया कुछ क्षण बाद पुनः प्रयास करें या पृष्ठ को रीफ़्रेश करें।"));
                    if(atithi_ttsPlayButton) { atithi_ttsPlayButton.disabled = false; atithi_ttsPlayButton.innerHTML = originalPlayTTSButtonHTML; }
                    return;
                }
                startTTSPlayback();
            }, 1000); // Increased delay
            return;
        }
        // If voices are loaded, proceed to play
        startTTSPlayback();
    });
} else if(atithi_ttsPlayButton) { atithi_ttsPlayButton.disabled = true; } // Should not happen if defer is used

function startTTSPlayback() {
    if (!atithi_ttsPlayButton) return;

    atithi_ttsPlayButton.disabled = true;
    atithi_ttsPlayButton.innerHTML = getHtmlFromElement('ttsTextLoadingButtonText', '<i class="fa fa-spinner fa-spin"></i> टेक्स्ट लोड हो रहा है...');

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
            text = tempTitle.replace(/\s+/g, ' ').trim();
        } else { text = (element.innerText || element.textContent || "").replace(/\s+/g, ' ').trim(); }

        // Additional cleaning for specific elements if needed
        if (element.tagName === 'BLOCKQUOTE' && text) { text = "एक उद्धरण: " + text; }

        // Ensure text is meaningful and not just button text from within content
        if (text && text.toLowerCase() !== 'संदर्भ कॉपी' && text.length > 2 && !element.classList.contains('atithi-copy-button')) {
            const utterance = new SpeechSynthesisUtterance(text);
            // Prioritize Google Hindi voice, then any Hindi, then default if it's Hindi
            const hindiVoice = atithi_voices.find(voice => voice.lang.startsWith('hi-IN') && (voice.name.includes('Google') || voice.name.toLowerCase().includes('hindi')));
            utterance.voice = hindiVoice || atithi_voices.find(voice => voice.lang.startsWith('hi')) || atithi_voices.find(voice => voice.default && voice.lang.startsWith('hi')) || null;

            utterance.lang = utterance.voice ? utterance.voice.lang : 'hi-IN'; // Set lang based on chosen voice or default to hi-IN
            utterance.rate = 0.92;
            utterance.pitch = 1.0;
            atithi_utteranceQueue.push(utterance);
        }
    });

    if (atithi_utteranceQueue.length > 0) {
        atithi_isPlayingTTS = true; atithi_isPausedTTS = false;
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = false;
        atithi_speakNextUtterance();
    } else {
        atithi_ttsPlayButton.disabled = false; atithi_ttsPlayButton.innerHTML = originalPlayTTSButtonHTML;
        alert(getTextFromElement('ttsNoTextAlertText',"पढ़ने के लिए कोई टेक्स्ट नहीं मिला।"));
    }
}

if (atithi_ttsStopButton) {
    atithi_ttsStopButton.addEventListener('click', () => {
        if (!atithi_synth) return;
        atithi_synth.cancel(); // Stops all current and queued utterances
        atithi_isPlayingTTS = false; atithi_isPausedTTS = false;
        atithi_currentUtteranceIndex = 0; // Reset queue index
        atithi_utteranceQueue = []; // Clear the queue
        if(atithi_ttsPlayButton) { atithi_ttsPlayButton.disabled = false; atithi_ttsPlayButton.innerHTML = originalPlayTTSButtonHTML; }
        if(atithi_ttsStopButton) atithi_ttsStopButton.disabled = true;
        console.log("TTS Stopped and queue cleared.");
    });
} else if (atithi_ttsStopButton) { atithi_ttsStopButton.disabled = true; }

// Clean up TTS on page unload
window.addEventListener('beforeunload', () => { if (atithi_synth && atithi_synth.speaking) { atithi_synth.cancel(); } });

console.log("JavaScript initialized (defer expected).");
