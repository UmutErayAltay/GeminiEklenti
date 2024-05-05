document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('myButton');
    const screenshotContainer = document.getElementById('screenshotContainer');
    const screenshotImg = document.getElementById('screenshot');
    
    button.addEventListener('click', function () {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const tab = tabs[0];
            
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: () => {
                    const element = document.querySelector("#app > div > span:nth-child(4) > div > div > div:nth-child(2) > div > div._alhp")
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        return {
                            x: rect.left,
                            y: rect.top,
                            width: rect.width,
                            height: rect.height
                        };
                    } else {
                        throw new Error('Belirtilen element bulunamadı');
                    }
                }
            }).then((results) => {
                const rect = results[0].result;
                
                chrome.tabs.captureVisibleTab({ format: 'png' }, function(screenshotUrl) {
                    const img = new Image();
                    
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        canvas.width = rect.width;
                        canvas.height = rect.height;
                        ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
                        
                        const croppedScreenshotUrl = canvas.toDataURL();
                        
                        // Ekran görüntüsünü Python sunucusuna gönder
                        sendScreenshot(croppedScreenshotUrl);
                    };
                    
                    img.src = screenshotUrl;
                });
            }).catch((error) => {
                console.error('Hata:', error.message);
            });
        });
    });

    function sendScreenshot(dataUrl) {
        var formData = new FormData();
        formData.append("screenshot", dataUrl);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5000/receive_screenshot", true); // Python sunucusunun URL'sini buraya ekleyin
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log("Ekran görüntüsü başarıyla gönderildi!");
                    
                    // Eklentinin yanıt olarak aldığı ses dosyasını oynat
                    playReceivedAudio(xhr.responseText);
                } else {
                    console.error("Sunucu hatası:", xhr.statusText);
                }
            }
        };
        xhr.onerror = function () {
            console.error('İstek sırasında bir hata oluştu.');
        };
        xhr.send(formData);
    }

    function playReceivedAudio(audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
    }
});
