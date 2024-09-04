/* Low Level Mail Controller - Includes all customer facing mail services */

function submit_mail() {
    try {
        var recipients = document.getElementById(recipients_field_id).value;
        var mail_body = document.getElementById(mail_body_field_id).value;
        var subject = document.getElementById(subject_field_id).value;
        // callback as fix to tinyMCE bug
        setTimeout(function() {
            mail_body = document.getElementById(mail_body_field_id).value;
            if (validateMail(subject, recipients, mail_body) !== 'ok') {
                console.log('Error occured: ' + validateMail(subject, recipients, mail_body));
                return false;
            }
            document.getElementById("compose_mail_title").textContent = "New Message";
            document.getElementById("cancel_compose").click();
            document.getElementById(recipients_field_id).value = "";
            document.getElementById(mail_body_field_id).value = "";
            document.getElementById(subject_field_id).value = "";
            
            /*********************************************************************************************
             * 
             *  This is the DB Logics Part
             * 
             * ******************************************************************************************/

            // check for IndexedDB support
            if (!window.indexedDB) {
                console.log(`Your browser doesn't support IndexedDB`);
                return;
            }
            // open the CRM database with the version 1
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

            // store mail to DB
            request.onsuccess = (event) => {
                let data = {
                    recipients: recipients,
                    mail_body: mail_body,
                    subject: subject,
                };
                // fetch files to blob and append to array
                var file = document.getElementById('attachment_input');
                if(file.files.length) {
                    var index = 0;
                    // one or more files present
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        data = Object.assign(data, {["file" + index]: e.target.result});
                        index++;
                        if (index < file.files.length) {
                            data = Object.assign(data, {["file" + index + "_name"]: file.files[index].name});
                            reader.readAsBinaryString(file.files[index]);
                        }
                        else {
                            const db = event.target.result;
                            const txn = db.transaction('Outbox_Soft_Buffer', 'readwrite');
                            const store = txn.objectStore('Outbox_Soft_Buffer');
                            let query = store.put(data);
                            query.onsuccess = function (event) {
                                console.log('Mail stored: ' + event);
                            };
                            query.onerror = function (event) {
                                console.log(event.target.errorCode);
                            }
                            txn.oncomplete = function () {
                                db.close();
                            };
                        }
                    };
                    reader.readAsBinaryString(file.files[0]);
                    data = Object.assign(data, {["file0_name"]: file.files[0].name});
                }
                else {
                    const db = event.target.result;
                    const txn = db.transaction('Outbox_Soft_Buffer', 'readwrite');
                    const store = txn.objectStore('Outbox_Soft_Buffer');
                    let query = store.put(data);

                    query.onsuccess = function (event) {
                        console.log('Mail stored: ' + event);
                    };
                    query.onerror = function (event) {
                        console.log(event.target.errorCode);
                    }
                    txn.oncomplete = function () {
                        db.close();
                    };
                }
            }
            
        },300);
    }
    catch (e) {
        console.log('Authentication Service failed to execute.');
        console.log(e);
    }
    return false;
}

function validateMail(subject, recipient, body) {
    // implement all validation rules to ensure properly formatted values
    if (subject == "") {
        return 'No Subject given.';
    }
    else if (recipient == "") {
        return 'No Recipient(s) given.';
    }
    else if (body == "") {
        return 'No Mail Body given.';
    }
    else {
        return 'ok';
    }
}

function serialize_mail(form){ 
    var data = {}; 
    form = $(form).serializeArray(); 
    for(var i = form.length; i--; ) {
        data[form[i].name] = form[i].value;
    }
    return data; 
}