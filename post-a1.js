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
//=========================================================================//
// --- ATITHI MEDIA PLAYER SCRIPT (VIDEO & IMAGE ALBUM) ---               //
// This script should be added to your existing JavaScript file.          //
// It assumes FontAwesome is loaded for icons.                            //
// HTML structure for modals and triggers is expected as per definition.  //
//=========================================================================//

document.addEventListener('DOMContentLoaded', function() {

    // --- Player Global Variables (Prefixed to avoid conflict) ---
    let atithiMedia_AlbumImages = [];
    let atithiMedia_YoutubeVideoIds = [];
    let atithiMedia_CurrentImageIndex = 0;
    let atithiMedia_Player; // YouTube Player instance
    let atithiMedia_CurrentVideoIndex = 0;

    // --- Player DOM Elements (Prefixed) ---
    const atithiMedia_videoThumbnailActivator = document.getElementById('atithiVideoThumbnailActivator');
    const atithiMedia_videoThumbnailImage = document.getElementById('atithiVideoThumbnailImage');
    const atithiMedia_youtubeVideoCountEl = document.getElementById('atithiYoutubeVideoCount');
    const atithiMedia_imageCountEl = document.getElementById('atithiImageCount');
    const atithiMedia_openImageAlbumBtn = document.getElementById('atithiOpenImageAlbumBtn');

    const atithiMedia_imageAlbumModalEl = document.getElementById('atithiImageAlbumModal');
    const atithiMedia_albumImageEl = document.getElementById('atithiAlbumImage');
    const atithiMedia_imageCounterDisplayEl = document.getElementById('atithiImageCounterDisplayModal');
    const atithiMedia_prevImageBtnEl = document.getElementById('atithiPrevImageBtn');
    const atithiMedia_nextImageBtnEl = document.getElementById('atithiNextImageBtn');

    const atithiMedia_youtubePlayerModalEl = document.getElementById('atithiYouTubePlayerModal');
    const atithiMedia_youtubePlayerContainerEl = document.getElementById('atithiYouTubePlayerContainer');
    const atithiMedia_prevVideoBtnEl = document.getElementById('atithiPrevVideoBtn');
    const atithiMedia_nextVideoBtnEl = document.getElementById('atithiNextVideoBtn');

    // --- Function to load media data from HTML ---
    function atithiMedia_loadDataFromHTML() {
        const dataContainer = document.getElementById('atithiMediaData');
        if (dataContainer) {
            const imageSpans = dataContainer.querySelectorAll('.atithi-album-image-url');
            imageSpans.forEach(span => {
                if (span.textContent && span.textContent.trim()) {
                    atithiMedia_AlbumImages.push(span.textContent.trim());
                }
            });

            const youtubeIdSpans = dataContainer.querySelectorAll('.atithi-youtube-id');
            const uniqueYoutubeIds = new Set();
            youtubeIdSpans.forEach(span => {
                 if (span.textContent && span.textContent.trim()) {
                    uniqueYoutubeIds.add(span.textContent.trim());
                }
            });
            atithiMedia_YoutubeVideoIds = Array.from(uniqueYoutubeIds);
        }

        if(atithiMedia_youtubeVideoCountEl) atithiMedia_youtubeVideoCountEl.textContent = atithiMedia_YoutubeVideoIds.length;
        if(atithiMedia_imageCountEl) atithiMedia_imageCountEl.textContent = atithiMedia_AlbumImages.length;
    }

    // --- Function to set the video thumbnail on the page ---
    function atithiMedia_setVideoThumbnail() {
        if (atithiMedia_YoutubeVideoIds.length > 0 && atithiMedia_videoThumbnailActivator && atithiMedia_videoThumbnailImage) {
            const firstVideoId = atithiMedia_YoutubeVideoIds[0];
            atithiMedia_videoThumbnailImage.src = `https://img.youtube.com/vi/${firstVideoId}/mqdefault.jpg`;
            atithiMedia_videoThumbnailActivator.onclick = function() { 
                atithiMedia_CurrentVideoIndex = 0; 
                atithiMedia_openModal('atithiYouTubePlayerModal'); 
            };
        } else if (atithiMedia_videoThumbnailActivator) {
            if(atithiMedia_videoThumbnailImage) atithiMedia_videoThumbnailImage.alt = "वीडियो उपलब्ध नहीं"; // Changed message
            atithiMedia_videoThumbnailActivator.onclick = function() { 
                // Check if your existing script has a function for alerts or use standard alert
                if(typeof atithi_showAlert === 'function') atithi_showAlert("कोई यूट्यूब वीडियो लिस्ट में नहीं है!");
                else alert("कोई यूट्यूब वीडियो लिस्ट में नहीं है!"); 
            };
        }
    }

    // --- Modal Open/Close Functions (Prefixed) ---
    function atithiMedia_openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) { console.error("Atithi Player: Modal not found:", modalId); return; }
        modal.classList.add('active'); 
        document.body.style.overflow = 'hidden'; 

        if (modalId === 'atithiImageAlbumModal' && atithiMedia_AlbumImages.length > 0) { 
            atithiMedia_CurrentImageIndex = 0; 
            atithiMedia_displayCurrentImage(); 
        }
        if (modalId === 'atithiYouTubePlayerModal' && atithiMedia_YoutubeVideoIds.length > 0) {
            if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
                var tag = document.createElement('script'); 
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0]; 
                if (firstScriptTag) {
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                } else { 
                    document.head.appendChild(tag);
                }
            } else { 
                atithiMedia_loadYouTubePlayer(atithiMedia_YoutubeVideoIds[atithiMedia_CurrentVideoIndex]); 
            }
        }
    }
    
    // Making closeModal globally accessible for HTML onclick attributes
    // Ensure this doesn't conflict if 'closeModal' is already global from your script
    if (typeof window.closeModal !== 'function' || window.closeModal.name !== "atithiMedia_closeModal") {
        window.closeModal = function(modalId) { // Renaming to avoid conflict if needed
            const modal = document.getElementById(modalId);
            if (!modal) return;
            modal.classList.remove('active'); 
            document.body.style.overflow = 'auto'; 
        };
    }


    // --- Image Album Functions (Prefixed) ---
    function atithiMedia_displayCurrentImage() {
        if (atithiMedia_AlbumImages.length > 0 && atithiMedia_albumImageEl && atithiMedia_imageCounterDisplayEl && atithiMedia_prevImageBtnEl && atithiMedia_nextImageBtnEl) {
            atithiMedia_albumImageEl.src = atithiMedia_AlbumImages[atithiMedia_CurrentImageIndex];
            atithiMedia_imageCounterDisplayEl.textContent = `${atithiMedia_CurrentImageIndex + 1} / ${atithiMedia_AlbumImages.length}`;
            atithiMedia_prevImageBtnEl.disabled = atithiMedia_CurrentImageIndex === 0;
            atithiMedia_nextImageBtnEl.disabled = atithiMedia_CurrentImageIndex === atithiMedia_AlbumImages.length - 1;
        }
    }

    function atithiMedia_changeImage(step) { 
        const newIndex = atithiMedia_CurrentImageIndex + step;
        if (newIndex >= 0 && newIndex < atithiMedia_AlbumImages.length) {
            atithiMedia_CurrentImageIndex = newIndex; 
            atithiMedia_displayCurrentImage();
        }
    }

    // --- YouTube Player Functions (Prefixed) ---
    const originalOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
        if (typeof originalOnYouTubeIframeAPIReady === 'function') {
            originalOnYouTubeIframeAPIReady(); // Call existing function if it exists
        }
        if (atithiMedia_youtubePlayerModalEl && atithiMedia_youtubePlayerModalEl.classList.contains('active') && !atithiMedia_Player) { 
           atithiMedia_loadYouTubePlayer(atithiMedia_YoutubeVideoIds[atithiMedia_CurrentVideoIndex]);
        }
    };
    

    function atithiMedia_loadYouTubePlayer(videoId) {
        if (atithiMedia_Player) { atithiMedia_Player.destroy(); atithiMedia_Player = null; }
        if (!atithiMedia_youtubePlayerContainerEl) { console.error("Atithi Player: YouTube player container not found."); return; }
        
        atithiMedia_youtubePlayerContainerEl.innerHTML = ''; 
        const newPlayerDiv = document.createElement('div'); 
        newPlayerDiv.id = 'atithi-player-iframe-actual'; 
        atithiMedia_youtubePlayerContainerEl.appendChild(newPlayerDiv);
        
        try {
            atithiMedia_Player = new YT.Player('atithi-player-iframe-actual', { 
                height: '100%', width: '100%', videoId: videoId, 
                playerVars: { 
                    'playsinline': 1, 'autoplay': 1, 'controls': 1, 
                    'rel': 0, 'modestbranding': 1, 'iv_load_policy': 3, 
                    'color': 'white', 'disablekb': 1 
                },
                events: { 'onReady': atithiMedia_onPlayerReadyInternal, 'onStateChange': atithiMedia_onPlayerStateChangeInternal }
            });
        } catch (e) {
            console.error("Atithi Player: Error creating YouTube player:", e);
        }
        atithiMedia_updateVideoPlayerButtons();
    }

    function atithiMedia_onPlayerReadyInternal(event) { /* Autoplay handled by playerVars */ }

    function atithiMedia_onPlayerStateChangeInternal(event) {
        if (event.data == YT.PlayerState.ENDED) {
            if (atithiMedia_CurrentVideoIndex < atithiMedia_YoutubeVideoIds.length - 1) {
                atithiMedia_playNextVideo(); 
            } else {
                // console.log("Atithi Player: All YouTube videos finished.");
            }
        }
    }
    
    function atithiMedia_playNextVideo() { 
        if (atithiMedia_CurrentVideoIndex < atithiMedia_YoutubeVideoIds.length - 1) { 
            atithiMedia_CurrentVideoIndex++; 
            if(atithiMedia_Player) atithiMedia_Player.loadVideoById(atithiMedia_YoutubeVideoIds[atithiMedia_CurrentVideoIndex]); 
        }
        atithiMedia_updateVideoPlayerButtons();
    }

    function atithiMedia_playPrevVideo() { 
        if (atithiMedia_CurrentVideoIndex > 0) { 
            atithiMedia_CurrentVideoIndex--; 
            if(atithiMedia_Player) atithiMedia_Player.loadVideoById(atithiMedia_YoutubeVideoIds[atithiMedia_CurrentVideoIndex]); 
        }
        atithiMedia_updateVideoPlayerButtons();
    }

    function atithiMedia_updateVideoPlayerButtons() {
        if(atithiMedia_prevVideoBtnEl && atithiMedia_nextVideoBtnEl){
            atithiMedia_prevVideoBtnEl.disabled = atithiMedia_CurrentVideoIndex === 0;
            atithiMedia_nextVideoBtnEl.disabled = atithiMedia_CurrentVideoIndex === atithiMedia_YoutubeVideoIds.length - 1;
        }
        if (atithiMedia_imageAlbumModalEl && atithiMedia_imageAlbumModalEl.classList.contains('active') && atithiMedia_prevImageBtnEl && atithiMedia_nextImageBtnEl) {
            atithiMedia_prevImageBtnEl.disabled = atithiMedia_CurrentImageIndex === 0;
            atithiMedia_nextImageBtnEl.disabled = atithiMedia_CurrentImageIndex === atithiMedia_AlbumImages.length - 1;
        }
    }
    
    // Global stop function, prefixed
    window.stopYouTubeVideo = function() { // Ensure it's globally accessible if called from HTML
        if (atithiMedia_Player && typeof atithiMedia_Player.stopVideo === 'function') atithiMedia_Player.stopVideo();
        if (atithiMedia_Player && typeof atithiMedia_Player.destroy === 'function') { atithiMedia_Player.destroy(); atithiMedia_Player = null; }
        if(atithiMedia_youtubePlayerContainerEl) atithiMedia_youtubePlayerContainerEl.innerHTML = ''; 
    };


    // --- Event Listeners ---
    if(atithiMedia_openImageAlbumBtn) {
        atithiMedia_openImageAlbumBtn.onclick = function() {
            if (atithiMedia_AlbumImages.length > 0) atithiMedia_openModal('atithiImageAlbumModal'); 
            else {
                if(typeof atithi_showAlert === 'function') atithi_showAlert("कोई इमेज एल्बम में नहीं है!");
                else alert("कोई इमेज एल्बम में नहीं है!");
            }
        };
    }

    if(atithiMedia_prevVideoBtnEl) atithiMedia_prevVideoBtnEl.onclick = atithiMedia_playPrevVideo;
    if(atithiMedia_nextVideoBtnEl) atithiMedia_nextVideoBtnEl.onclick = atithiMedia_playNextVideo;
    if(atithiMedia_prevImageBtnEl) atithiMedia_prevImageBtnEl.onclick = function() { atithiMedia_changeImage(-1); }; // Corrected: For image album
    if(atithiMedia_nextImageBtnEl) atithiMedia_nextImageBtnEl.onclick = function() { atithiMedia_changeImage(1); }; // Corrected: For image album


    document.querySelectorAll('.atithi-custom-modal').forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) { 
                window.closeModal(modal.id); // Use global closeModal
                if (modal.id === 'atithiYouTubePlayerModal') window.stopYouTubeVideo(); // Use global stopYouTubeVideo
            }
        });
    });

    document.addEventListener('keydown', function(event) {
        const imageModalActive = atithiMedia_imageAlbumModalEl && atithiMedia_imageAlbumModalEl.classList.contains('active');
        const youtubeModalActive = atithiMedia_youtubePlayerModalEl && atithiMedia_youtubePlayerModalEl.classList.contains('active');

        if (event.key === 'Escape') {
            if (imageModalActive) window.closeModal('atithiImageAlbumModal');
            if (youtubeModalActive) { window.closeModal('atithiYouTubePlayerModal'); window.stopYouTubeVideo(); }
        }
        if (imageModalActive && atithiMedia_prevImageBtnEl && atithiMedia_nextImageBtnEl) { 
            if ((event.key === 'ArrowUp' || event.key === 'ArrowLeft') && !atithiMedia_prevImageBtnEl.disabled) atithiMedia_changeImage(-1);
            if ((event.key === 'ArrowDown' || event.key === 'ArrowRight') && !atithiMedia_nextImageBtnEl.disabled) atithiMedia_changeImage(1);
        }
        if (youtubeModalActive && atithiMedia_prevVideoBtnEl && atithiMedia_nextVideoBtnEl) { 
            if ((event.key === 'ArrowUp' || event.key === 'ArrowLeft') && !atithiMedia_prevVideoBtnEl.disabled) atithiMedia_playPrevVideo();
            if ((event.key === 'ArrowDown' || event.key === 'ArrowRight')&& !atithiMedia_nextVideoBtnEl.disabled) atithiMedia_playNextVideo();
        }
    });

    // --- Initialize Player ---
    atithiMedia_loadDataFromHTML();
    atithiMedia_setVideoThumbnail();

    // console.log("Atithi Media Player Initialized and integrated.");
});
