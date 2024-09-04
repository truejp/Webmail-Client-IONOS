console.log('Sync running!');
/* Low Level Sync Controller - Includes all syncing background services */
syncHandler();
setOnline();
// handle offline calls
var offlineState = false;
function setOnline() {
    offlineState = false;
    if (session_validated) {
        // online and session validated
        $(".email-app").animate({marginTop: '0px'}, 500);
    }
    else {
        // auth error displayed - standard spacing
        if ($(window).width() < 600) {
            $(".email-app").animate({marginTop: '22.5px'}, 500);
        }
        else {
            $(".email-app").animate({marginTop: '22.5px'}, 500);
        }
        $(".auth-banner").fadeIn(500);
        setAuthError();
    }
    $(".offline-banner").fadeOut(500);
}

function setOffline() {
    offlineState = true;
    if (session_validated) {
        // offline but session validated
        if ($(window).width() < 600) {
            $(".email-app").animate({marginTop: '42px'}, 500);
        }
        else {
            $(".email-app").animate({marginTop: '22.5px'}, 500);
        }
    }
    else {
        // offline and auth error displayed
        if ($(window).width() < 600) {
            $(".email-app").animate({marginTop: '64px'}, 500);
            $(".auth-banner").animate({marginTop: '42px'}, 500);
            $(".auth-banner").fadeIn(500);
        }
        else {
            $(".email-app").animate({marginTop: '36px'}, 500);
            $(".auth-banner").animate({marginTop: '22.5px'}, 500);
            $(".auth-banner").fadeIn(500);
        }
        $(".auth-banner").fadeIn(500);
    }
    $(".offline-banner").fadeIn(500);
}

function setAuthError() {
    if (auth_state == true) {
        if (offlineState) {
            // move a bit more down
            if ($(window).width() < 600) {
                $(".auth-banner").animate({marginTop: '42px'}, 500);
                $(".email-app").animate({marginTop: '64px'}, 500);
            }
            else {
                $(".auth-banner").animate({marginTop: '22.5px'}, 500);
                $(".email-app").animate({marginTop: '45px'}, 500);
            }
        }
        else {
            if ($(window).width() < 600) {
                $(".auth-banner").animate({marginTop: '0px'}, 500);
                $(".email-app").animate({marginTop: '22.5px'}, 500);
            }
            else {
                $(".auth-banner").animate({marginTop: '0px'}, 500);
                $(".email-app").animate({marginTop: '22.5px'}, 500);
            }
        }
        $(".auth-banner").fadeIn(500);
        auth_state = false;
    }
}

function removeAuthError() {
    if (auth_state == false) {
        if (offlineState) {
            // move a bit more down
            if ($(window).width() < 600) {
                $(".email-app").animate({marginTop: '42px'}, 500);
            }
            else {
                $(".email-app").animate({marginTop: '22.5px'}, 500);
            }
        }
        else {
            if ($(window).width() < 600) {
                $(".email-app").animate({marginTop: '0px'}, 500);
            }
            else {
                $(".email-app").animate({marginTop: '0px'}, 500);
            }
        }
        $(".auth-banner").fadeOut(500);
        auth_state = true;
    }
}

function checkAuth() {
    validateSession();
    if (session_validated) {
        removeAuthError();
    }
    else {
        setAuthError();
    }
    setTimeout(checkAuth, check_auth_cycle);
}

function syncHandler() {
    if (typeof getAuthCreds === "function") {
        if (getAuthCreds !== 'unauthorized') {
            sync_outbox_to_backend();
            sync_inbound_mails();
            sync_delete();
            checkAuth();
        }
        else {
            setTimeout(syncHandler,retry_after_connection_lost);
        }
    }
    else {
        console.log('Awaiting auth controller');
        setTimeout(syncHandler, 100);
    }
}

function sync_inbound_mails() {
    // var sync_url = api_root + 'fetch-mails.php?x=x&val=' + Date.now() + '&' + getAuthCreds(); // changing token
    var sync_url = api_root + 'fetch-mails.php?x=' + Date.now() + getAuthCreds();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setOnline();
            if (this.response.includes('success')) {
                // auth succeeded, save data
                var inbox_data = JSON.parse(this.response)['mail-data'];
                localStorage.setItem('inbox', JSON.stringify(inbox_data));
            }
            else {
                // failed
                console.log('Auth error occured.');
                console.log(this.response);
            }
        }
    }
    xhttp.onerror = function () {
        setOffline();
        console.log("Inbox Sync Error - No internet.");
        setTimeout(sync_inbound_mails, retry_after_connection_lost);
        return false;
    };
    xhttp.open("GET", sync_url, true);
    xhttp.send();

    var sync_url2 = api_root + 'fetch-folders.php?x=' + Date.now() + getAuthCreds();
    var xhttp2 = new XMLHttpRequest();
    xhttp2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setOnline();
            if (this.response.includes('success')) {
                // auth succeeded, save data
                var folder_data = JSON.parse(this.response)['folder-list'];
                localStorage.setItem('folders', JSON.stringify(folder_data));
                setTimeout(sync_inbound_mails, inbox_sync_cycle);
            }
            else {
                // failed
                console.log('Folder: Auth error occured.');
                console.log(this.response);
                setTimeout(sync_inbound_mails, inbox_sync_cycle);
            }
        }
    }
    xhttp2.onerror = function () {
        setOffline();
        console.log("Folder Sync Error - No internet.");
        setTimeout(sync_inbound_mails, retry_after_connection_lost);
        return false;
    };
    xhttp2.open("GET", sync_url2, true);
    xhttp2.send();
}

function sync_delete() {
    var delete_id = "";
    if (localStorage.getItem('delete-queue') !== null) {
        delete_id = JSON.parse(localStorage.getItem('delete-queue'))[0];
    }
    else {
        setTimeout(sync_delete, inbox_sync_cycle);
        return false;
    }
    var sync_url = api_root + 'delete-mail.php?x=' + Date.now() + '&uniq=' + delete_id +  getAuthCreds();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setOnline();
            if (this.response.includes('success')) {
                // auth succeeded, remove id from container
                var queue = JSON.parse(localStorage.getItem('delete-queue'));
                var new_queue = Array();
                var j = 0;
                for (i = 0; i < queue.length; i++) {
                    if (queue[i] != delete_id) {
                        new_queue[j] = queue[i];
                        j++;
                    }
                }
                if (new_queue.length == 0) {
                    localStorage.removeItem('delete-queue');
                }
                else {
                    localStorage.setItem('delete-queue', JSON.stringify(new_queue));
                }
                console.log("Sync Call Successful");
                sync_delete();
                return false;
            }
            else {
                // failed, retry
                setTimeout(sync_delete, retry_after_connection_lost);
            }
        }
    }
    xhttp.onerror = function () {
        setOffline();
        console.log("Delete Sync Error - No internet.");
        setTimeout(sync_delete, retry_after_connection_lost);
        return false;
    };
    xhttp.open("GET", sync_url, true);
    xhttp.send();
}

function sync_outbox_to_backend() {
    // implement serializer for attachments using indexedDB
    const request = indexedDB.open('CRM', 1);
    request.onupgradeneeded = (event) => {
        let db = event.target.result;
        let store = db.createObjectStore('Outbox_Soft_Buffer', {
            autoIncrement: true
        });
    };

    request.onerror = (event) => {
        console.error(`Database error: ${event.target.errorCode}`);
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction('Outbox_Soft_Buffer', 'readwrite');
        object_store = transaction.objectStore("Outbox_Soft_Buffer");
        request2 = object_store.openCursor();

        request2.onerror = function(event) {
            console.err("error fetching data");
        };
        request2.onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                let key = cursor.primaryKey;
                let value = cursor.value;
                // change to HTTP Post with Blob Data, if file[x] key found
                var send_url = api_root + 'send-mail.php';
                const formData = new FormData();
                var authD = JSON.parse(localStorage.getItem('io-mail-auth'));
                formData.append('subject', value['subject']);
                formData.append('recipients', value['recipients']);
                formData.append('body', value['mail_body']);
                formData.append('user', authD['username']);
                formData.append('token', authD['token']);
                // append images to form
                var i = 0;
                while(true) {
                    if (value['file' + i] != null) {
                        // attachment found
                        console.log("Found attachment!");
                        formData.append('file' + i, new Blob([value['file' + i]]), value['file' + i + '_name']);
                        i++;
                    }
                    else {
                        break;
                    }
                }
                fetch(send_url, {
                    method : "POST",
                    body: formData,
                }).then(
                    response => response.text()
                ).then(
                    html => {
                        if (html.includes('success')) {
                            // realtime auth succeeded
                            console.log(html);
                            swal("Mail sent!", "Your mail is way on its way.", "success");
                            const request3 = db.transaction('Outbox_Soft_Buffer', 'readwrite').objectStore('Outbox_Soft_Buffer').delete(key);
                            request3.onsuccess = ()=> {
                                console.log(`Outbox element purged, email: ${request.result}`);
                                setTimeout(sync_outbox_to_backend, outbox_sync_cycle);
                                return false;
                            }
        
                            request3.onerror = (err)=> {
                                console.error(`Error to delete outbox element: ${err}`);
                                setTimeout(sync_outbox_to_backend, outbox_sync_cycle);
                                return false;
                            }
                        }
                        else {
                            setTimeout(sync_outbox_to_backend, outbox_sync_cycle);
                            console.log(html);
                        }
                    }
                ).catch(err => {
                    console.log(err);
                    setTimeout(sync_outbox_to_backend, outbox_sync_cycle);
                });
            }
            else {
                setTimeout(sync_outbox_to_backend, outbox_sync_cycle);
            }
        };
    }
}