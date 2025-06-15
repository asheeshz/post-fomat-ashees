// <![CDATA[
window.addEventListener('load', function() {
    console.log("Window loaded. Initializing scripts.");

    //======================================================================
    // 1. पोस्ट साझा करें (Share) बटन के लिए कोड
    //======================================================================
    const qu_sharePostButton = document.getElementById('sharePostButton');
    if (qu_sharePostButton) {
        qu_sharePostButton.addEventListener('click', (e) => {
            e.preventDefault();
            const pageUrl = window.location.href;
            let pageTitle = document.title || "विंध्य की प्राचीन धरोहर: रीवा";

            const pageTitleElement = document.querySelector('.qu-page-main-header .qu-main-title');
            if (pageTitleElement) {
                let tempTitle = "";
                pageTitleElement.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        tempTitle += node.textContent.trim();
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SPAN' && !node.classList.contains('fa')) {
                         tempTitle += node.textContent.trim();
                    }
                });
                 if (tempTitle) pageTitle = tempTitle.replace(/\s+/g, ' ').trim();
            }

            let authorName = "आचार्य आशीष मिश्र";
            const authorElement = document.getElementById('authorNameForJS');
            if(authorElement && authorElement.textContent) {
                authorName = authorElement.textContent.trim();
            }

            const shareText = `📜 "${pageTitle}" 📜 ${authorName} द्वारा शोधित - विंध्य की प्राचीन धरोहर! अवश्य पढ़ें और साझा करें!`;
            const fullShareTextForCopy = `${shareText}\nलिंक: ${pageUrl}`;

            if (navigator.share) {
                navigator.share({ title: pageTitle, text: shareText, url: pageUrl })
                    .then(() => console.log('Successful share via Web Share API'))
                    .catch((error) => {
                        console.log('Web Share API failed or share cancelled, attempting to copy to clipboard:', error);
                        qu_copyToClipboardFallback(fullShareTextForCopy);
                    });
            } else {
                console.log('Web Share API not available, attempting to copy to clipboard.');
                qu_copyToClipboardFallback(fullShareTextForCopy);
            }
        });
    }

    function qu_copyToClipboardFallback(textToCopy) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                console.log('Content copied to clipboard successfully.');
                // Pop-up alert is removed as per instruction.
                // You can add a subtle temporary message on the button itself if needed.
                const originalText = qu_sharePostButton.innerHTML;
                qu_sharePostButton.innerHTML = '<i class="fa fa-check"></i> कॉपीड!';
                setTimeout(() => { qu_sharePostButton.innerHTML = originalText; }, 2000);
            }).catch(err => {
                console.error("Clipboard copy failed:", err);
            });
        } else {
            console.warn("Clipboard API not supported. Manual copy might be needed.");
        }
    }

    //======================================================================
    // 2. Modal (Popup) Functionality
    //======================================================================
    const qu_modalOverlay = document.getElementById('qu-detailsModal');
    const qu_modalTitle = document.getElementById('qu-modalTitle');
    const qu_modalBody = document.getElementById('qu-modalBody');
    let qu_originalScrollPosition = 0;

    window.showModal = function(title, content) {
        qu_originalScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        qu_modalTitle.innerHTML = title;
        qu_modalBody.innerHTML = content;
        qu_modalOverlay.style.display = 'flex';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${qu_originalScrollPosition}px`;
        document.body.style.width = '100%';
        document.body.style.overflowY = 'hidden';
    }

    window.closeModal = function(event) {
        if (event.target.classList.contains('qu-modal-overlay') || event.target.classList.contains('qu-modal-content-wrapper')) {
            qu_hideModalInternal();
        }
    }
    window.closeModalManual = function() {
        qu_hideModalInternal();
    }

    function qu_hideModalInternal() {
        qu_modalOverlay.style.display = 'none';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, qu_originalScrollPosition);
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && qu_modalOverlay.style.display === 'flex') {
            qu_hideModalInternal();
        }
    });

    //======================================================================
    // 3. Footer Copyright Year
    //======================================================================
    const yearSpan = document.getElementById('copyrightYear');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    console.log("All scripts in window.load have been processed.");
});
// ]]>
