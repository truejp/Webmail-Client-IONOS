/* High Level UI Controller - Sync and updates UI on the fly */
var current_page = 1;
var max_el = 0;
var pagination_schedule;
update_folders();
show_mail_overview();
set_profile_values();
createPages();

function set_profile_values() {
    var authD = JSON.parse(localStorage.getItem('io-mail-auth'));
    var mail = authD['username'];
    if (mail.length > 24) {
        $('#profile_my_mail').text(mail.substr(0,24) + '...');
    }
    else {
        $('#profile_my_mail').text(mail);
    }
}

function close_composer() {
    document.getElementById("compose_mail_title").textContent = "New Message";
    document.getElementById("cancel_compose").click();
    return false;
}

function delete_mail(id) {
    console.log('Deleting: ' + id);
    if (localStorage.getItem('delete-queue') !== null) {
        var queue = JSON.parse(localStorage.getItem('delete-queue'));
        for (i = 0; i < queue.length; i++) {
            if (queue[i] == id) {
                console.log('Sync Point already exists');
                return false;
            }
        }
        queue.push(id);
        localStorage.setItem('delete-queue', JSON.stringify(queue));
    }
    else {
        var queue = Array();
        queue[0] = id;
        localStorage.setItem('delete-queue', JSON.stringify(queue));
        console.log("Set Sync Point.");
    }
    // close view
    document.getElementById("back_to_inbox").click();
}

function createPages() {
    var unfiltered = JSON.parse(localStorage.getItem('inbox'));
    var all_mails = [];
    var j = 0;
    for (let i = 0; i < unfiltered.length; i++) {
        if (unfiltered[i]['folder'] == curr_folder) {
            all_mails[j] = unfiltered[i];
            j++;
        }
    }
    var final_el = '<li class="waves-effect"><a href="#!" onclick="decrease_page();"><i class="material-icons">chevron_left</i></a></li><li class="pageindex active"><a href="#!" onclick="pagination_switcher(1);">1</a></li>';
    if ((all_mails.length / el_per_page) > 1) {
        // at least 2 pages
        for (let i = 1; i < (all_mails.length / el_per_page); i++) {
            // add pages to bottom of page
            final_el = final_el + '<li class="pageindex waves-effect"><a href="#!" onclick="pagination_switcher(' + (i+1) + ');">' + (i+1) + '</a></li>';
        }
    }
    final_el = final_el + '<li class="waves-effect"><a href="#!" onclick="increase_page();"><i class="material-icons">chevron_right</i></a></li>';
    try {
        document.getElementById("pagination_hook").innerHTML = final_el;
    }
    catch(e) {
        console.log("Unable to create pagination: " + e);
    }
}

function create_reply(uniqid) {
    // fetch mail contents
    var all_mails = JSON.parse(localStorage.getItem('inbox'));
    for (let i = 0; i < all_mails.length; i++) {
        if (all_mails[i]['uniqid'] == uniqid) {
            var from = all_mails[i]['from'];
            var body = all_mails[i]['body'];
            var HTMLbody = all_mails[i]['body_html'];
            var subject = all_mails[i]['subject'];
            var attachments = all_mails[i]['attachments'];
            var uniqid = all_mails[i]['uniqid'];
            // generate mail header with time
            var time = new Date(all_mails[i]['time']*1000).toLocaleString("de-DE");
            var pre_header = "<p></p><p></p><hr><p><strong>From:</strong>&nbsp;" + from + "<br><strong>Sent:</strong>&nbsp;" + time + "<br><strong>To:</strong>&nbsp;" + JSON.parse(localStorage.getItem('io-mail-auth'))['username'] + "<br><strong>Subject:</strong>&nbsp;" + subject + "</p>";
            // set contents
            $('#subject').val("RE: " + subject);
            $('#recipients').val(from);
            document.getElementById("compose_mail_title").textContent = "New Reply";
            tinymce.get("mymce").setContent(pre_header + HTMLbody);
            document.getElementById("compose_mail").click();
            return false;
        }
    }
}

function update_folders() {
    var all_folders = JSON.parse(localStorage.getItem('folders'));
    var html_el = '<li><small class="p-15 grey-text text-lighten-1 db">Folders</small></li>';
    // loop through
    try {
        all_folders.forEach(element => {
            var active = "";
            if (curr_folder == element) {
                active = 'class="active"';
            }
            if (!(element == "Spam" || element == "Papierkorb" || element == "Gesendete Objekte")) {
                html_el = html_el + '<li class="list-group-item hide-menu-item"><a onclick="switch_folder(\'' + element + '\')" href="javascript:void(0)"' +  active + '><i class="material-icons">folder</i>' + element +  '</a></li>';
            }
        });
    }
    catch(e) {
        console.log('Folders not yet available');
        setTimeout(update_folders,500);
    }
    var active = '';
    if (curr_folder == 'Gesendete Objekte') {
        active = 'class="active"';
    }
    html_el = html_el + '<li class="list-group-item hide-menu-item"><a onclick="switch_folder(\'Gesendete Objekte\')" href="javascript:void(0)"' +  active + '><i class="material-icons">send</i>Gesendete Objekte</a></li><li><div class="divider m-t-10  m-b-10"></div></li>';
    active = '';
    if (curr_folder == 'Spam') {
        active = 'class="active"';
    }
    html_el = html_el + '<li class="list-group-item hide-menu-item"><a onclick="switch_folder(\'Spam\')" href="javascript:void(0)"' +  active + '><i class="material-icons">block</i>Spam</a></li>';
    active = '';
    if (curr_folder == 'Papierkorb') {
        active = 'class="active"';
    }
    html_el = html_el + '<li class="list-group-item hide-menu-item"><a onclick="switch_folder(\'Papierkorb\')" href="javascript:void(0)"' +  active + '><i class="material-icons">delete</i>Papierkorb</a></li>';

    try {
        document.getElementById('folder_list').innerHTML = html_el;
        document.getElementById('inbox_label').innerHTML = curr_folder + '<i class="ti-menu ti-close right show-left-panel hide-on-med-and-up"></i>';
    }
    catch(e) {
        console.warn("Connot update folder list: " + e);
    }
    // prevent overloading JS FrameWork and show new folder instantly
    clearTimeout(pagination_schedule);
    show_mail_overview();
}

function switch_folder(folder_name) {
    curr_folder = folder_name;
    update_folders();
}

function create_forward(uniqid) {
    // fetch mail contents
    var all_mails = JSON.parse(localStorage.getItem('inbox'));
    for (let i = 0; i < all_mails.length; i++) {
        if (all_mails[i]['uniqid'] == uniqid) {
            var from = all_mails[i]['from'];
            var HTMLbody = all_mails[i]['body_html'];
            var subject = all_mails[i]['subject'];
            var uniqid = all_mails[i]['uniqid'];
            // generate mail header with time
            var time = new Date(all_mails[i]['time']*1000).toLocaleString("de-DE");
            var pre_header = "<p></p><p></p><hr><p><strong>From:</strong>&nbsp;" + from + "<br><strong>Sent:</strong>&nbsp;" + time + "<br><strong>To:</strong>&nbsp;" + JSON.parse(localStorage.getItem('io-mail-auth'))['username'] + "<br><strong>Subject:</strong>&nbsp;" + subject + "</p>";
            // set contents
            $('#subject').val("Forwarded: " + subject);
            $('#recipients').val("");
            tinymce.get("mymce").setContent(pre_header + HTMLbody);
            document.getElementById("compose_mail_title").textContent = "Forward Message";
            document.getElementById("compose_mail").click();
            return false;
        }
    }
}

function reset_search() {
    // recreate last used view from cache
    createPages();
    show_mail_overview();
    document.getElementById("search_field").value = "";
}

function search_mail(query) {
    try {
        // freeze UI Sync
        clearTimeout(pagination_schedule);
        var all_mails = JSON.parse(localStorage.getItem('inbox'));
        var final_el = '';
        // mark active page
        document.getElementById("pagination_hook").innerHTML = "";
        // build page between limits
        for (let i = 0; i < all_mails.length; i++) {
            if (all_mails[i]['body'].replaceAll('<br />',' ').replaceAll('\n','').replaceAll('\r','').includes(query) || all_mails[i]['subject'].includes(query) || all_mails[i]['from'].includes(query)) {
                var from = all_mails[i]['from'];
                var body = all_mails[i]['body'].replaceAll('<br />',' ').replaceAll('\n','').replaceAll('\r','');
                var subject = all_mails[i]['subject'];
                var attachments = all_mails[i]['attachments'];
                var uniqid = all_mails[i]['uniqid'];
                var unread = true;
                var time = timeSince(new Date(all_mails[i]['time']*1000));
                final_el = final_el + generateHTML_overview(from, subject, body, time, attachments, unread, uniqid);       
            }
        }
        try {
            if (final_el == '') {
                final_el = '<p style="margin-left: 20px;">No matches found for "' + query + '".</p>';
            }
            document.getElementById(mail_overview_dashboard).innerHTML = final_el;
            setUIListener();
        }
        catch(e) {
            // document node not found
        }
        for (let i = 0; i < all_mails.length; i++) {
            setMailPopupListener(all_mails[i]['uniqid']);
        }
    }
    catch (e) {
        console.log(e);
    }
    return false;
}

function pagination_switcher(page) {
    try {
        clearTimeout(pagination_schedule);
        current_page = page;
        show_mail_overview();
    }
    catch (e) {
        console.log("Pagination Error: " + e);
    }
}

function increase_page() {
    if ((max_el / el_per_page) > current_page) {
        pagination_switcher(current_page + 1);
    }
}

function decrease_page() {
    if (current_page > 1) {
        pagination_switcher(current_page - 1);
    }
}

function show_mail_overview() {
    if (jQuery('.email-table input[type=checkbox]:checked').length > 0) {
        // skip update when table item is selected, since UI update will override selections
        pagination_schedule = setTimeout(show_mail_overview, 5000);
        return false;
    }
    try {
        createPages();
        // limit viewport to chosen folder
        var unfiltered = JSON.parse(localStorage.getItem('inbox'));
        var all_mails = [];
        var j = 0;
        for (let i = 0; i < unfiltered.length; i++) {
            if (unfiltered[i]['folder'] == curr_folder) {
                let found = false;
                if (localStorage.getItem('delete-queue') !== null) {
                    var queue = JSON.parse(localStorage.getItem('delete-queue'));
                    for (x = 0; x < queue.length; x++) {
                        if (unfiltered[i]['uniqid'] == queue[x]) {
                            found = true;
                        }
                    }
                }
                if (!found) {
                    all_mails[j] = unfiltered[i];
                    j++;
                }
            }
        }
        // for increase / decrease page
        max_el = j;

        var final_el = '';
        // calculate page index limits
        var lower_limit = (current_page - 1) * el_per_page;
        var upper_limit = (current_page * el_per_page) - 1;
        if (upper_limit > all_mails.length) {
            upper_limit = all_mails.length;
        }
        // mark active page
        $(".pageindex").removeClass("active");
        $(".pageindex").eq(current_page-1).addClass("active");

        // build page between limits
        if (all_mails.length == 0) {
            document.getElementById(mail_overview_dashboard).innerHTML = "<p style='margin-left: 15px; margin-top: 10px;'>No mails available</p>";
            setUIListener();
            return false;
        }
        for (let i = lower_limit; i < upper_limit; i++) {
            var from = all_mails[i]['from'];
            var body = all_mails[i]['body'].replaceAll('<br />',' ').replaceAll('\n','').replaceAll('\r','');
            var subject = all_mails[i]['subject'];
            var attachments = all_mails[i]['attachments'];
            var uniqid = all_mails[i]['uniqid'];
            var unread = true;
            var time = timeSince(new Date(all_mails[i]['time']*1000));
            final_el = final_el + generateHTML_overview(from, subject, body, time, attachments, unread, uniqid);
        }
        try {
            document.getElementById(mail_overview_dashboard).innerHTML = final_el;
            setUIListener();
        }
        catch(e) {
            // document node not found
        }
        for (let i = 0; i < all_mails.length; i++) {
            setMailPopupListener(all_mails[i]['uniqid']);
        }
        pagination_schedule = setTimeout(show_mail_overview, 5000);
    }
    catch (e) {
        console.log(e);
        pagination_schedule = setTimeout(show_mail_overview, 500);
    }
}

function generateHTML_overview(from, subject, body, time, attachments, unread, uniqid) {
    let html_el = '';
    if (unread) {
        html_el = '<tr class="unread hide-menu-item"><td class="chb"><label><input type="checkbox" /><span></span></label></td><td class="starred"><i class="fa fa-star-o"></i></td><td class="user-image"><img src="assets/images/users/2.jpg" alt="user" class="circle" width="30"></td><td class="user-name"><h6 class="m-b-0">';
    }
    else {
        html_el = '<tr class="hide-menu-item"><td class="chb"><label><input type="checkbox" /><span></span></label></td><td class="starred"><i class="fa fa-star-o"></i></td><td class="user-image"><img src="assets/images/users/2.jpg" alt="user" class="circle" width="30"></td><td class="user-name"><h6 class="m-b-0">';
    }
    html_el = html_el + from;
    html_el = html_el + '</h6></td><td class="max-texts" id="' + uniqid + '"> <a href="javascript: void(0)">';
    if (unread) {
        html_el = html_el + '<strong>' + subject + ' - </strong>' + body;
    }
    else {
        html_el = html_el + subject + ' - ' + body;
    }
    if (attachments.length > 0) {
        html_el = html_el + '</a></td><td class="clip"><i class="fa fa-paperclip"></i></td><td class="time">';
    }
    else {
        html_el = html_el + '</a></td><td class="clip"></td><td class="time">';
    }
    html_el = html_el + time + '</td></tr>';
    return html_el;
}

function htmlToElem(html) {
    let temp = document.createElement('template');
    html = html.trim();
    temp.innerHTML = html;
    return temp.content.firstChild;
}

var menu = false;
function setUIListener() {
    $(function() {
        "use strict";
        var mail = $('.email-table .max-texts a');
        
        // clean old listeners
        $(".show-left-panel").prop("onclick", null).off("click");

        $(".hide-menu-item").on('click', function() {
            if (menu) {
                menu = false;
                $('.left-part').toggleClass('show-panel');
                $('.show-left-panel').addClass('ti-menu');
            }
        });

        $(".show-left-panel").on('click', function() {
            menu = !menu;
            $('.left-part').toggleClass('show-panel');
            $('.show-left-panel').toggleClass('ti-menu');
        });

        // Highlight row when checkbox is checked
        $('.email-table').find('tr > td:first-child').find('input[type=checkbox]').on('change', function() {
            if ($(this).is(':checked')) {
                $(this).parents('tr').addClass('selected');
            } else {
                $(this).parents('tr').removeClass('selected');
            }
        });

        $(".sl-all").on('click', function() {
            $('.email-table input:checkbox').not(this).prop('checked', this.checked);
            if ($('.email-table input:checkbox').is(':checked')) {
                $('.email-table input:checkbox').parents('tr').addClass('selected');
            } else {
                $('.email-table input:checkbox').parents('tr').removeClass('selected');
            }
        });

        $("#compose_mail").on("click", function() {
            $('.right-part.mail-list').fadeOut("fast");
            $('.right-part.mail-details').fadeOut("fast");
            $('.right-part.mail-compose').fadeIn("fast");
        });
    
        $("#cancel_compose").on("click", function() {
            $('.right-part.mail-compose').fadeOut("fast");
            $('.right-part.mail-list').fadeIn("fast");
        });
    
        $(mail).on("click", function() {
            $('.right-part.mail-list').fadeOut("fast");
            $('.right-part.mail-details').fadeIn("fast");
        });
    
        $("#back_to_inbox").on("click", function() {
            $('.right-part.mail-details').fadeOut("fast");
            $('.right-part.mail-list').fadeIn("fast");
            // set new UI sync point
            clearTimeout(pagination_schedule);
            show_mail_overview();
        });
    
    });
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + "h";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + "min";
    }
    return Math.floor(seconds) + "s";
  }

  function setMailPopupListener(uniqid) {
    $('#' + uniqid).on("click", function() {
        var uniqid = $(this).attr('id');
        var obj = document.getElementById('mail_body_iframe');
        obj.style.height = '0px';
        console.log('loading ' + uniqid + '...');
        // Build Mail Content and keep context
        var all_mails = JSON.parse(localStorage.getItem('inbox'));
        for (let i = 0; i < all_mails.length; i++) {
            if (all_mails[i]['uniqid'] == uniqid) {
                var from = all_mails[i]['from'];
                var body = all_mails[i]['body'];
                var HTMLbody = all_mails[i]['body_html'];
                var subject = all_mails[i]['subject'];
                var attachments = all_mails[i]['attachments'];
                var uniqid = all_mails[i]['uniqid'];
                var time = timeSince(new Date(all_mails[i]['time']*1000));
                $('#mail_open_title').text(subject);
                $('#mail_open_recipient').text('to ' + JSON.parse(localStorage.getItem('io-mail-auth'))['username'] + ' (me)');
                $('#mail_open_sender').text(from);
                $('#mail_popup_reply_top').on("click", function() {
                    create_reply(uniqid);
                });
                $('#reply_option').on("click", function() {
                    create_reply(uniqid);
                });
                $('#mail_popup_forward_top').on("click", function() {
                    create_forward(uniqid);
                });
                $('#forward_option').on("click", function() {
                    create_forward(uniqid);
                });
                $("#mail_body_iframe").contents().find('body').html(HTMLbody);
                obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
                $('#mail_open_attachment_label').text('Attachments: (' + attachments.length + ')');
                var html_att_el = '';
                for (let j = 0; j < attachments.length; j++) {
                    // for images
                    if (attachments[j].includes(".jpg") || attachments[j].includes(".png") || attachments[j].includes(".jpeg") || attachments[j].includes(".jfif")) {
                        html_att_el =  html_att_el + '<div class="col s12 l3"><img src="https://api.webmailpoc.de/libs/phpfetcher/attachments/' + attachments[j] + '" class="responsive-img" alt="att-file"> <a target="_blank" href="https://api.webmailpoc.de/libs/phpfetcher/attachments/' + attachments[j] + '" class="m-r-10">View...</a></div>';
                    }
                    else {
                        html_att_el =  html_att_el + '<div class="col s12 l3"><img height="60" src="/assets/images/file.png" class="responsive-img" alt="att-file"><br><a target="_blank" href="https://api.webmailpoc.de/libs/phpfetcher/attachments/' + attachments[j] + '" class="m-r-10">View...</a></div>';
                    }
                }
                $('#mail_open_attachment_node').html(html_att_el);
                $('#delete_icon').on("click", function() {
                    delete_mail(uniqid);
                });
                return false;
            }
        }
        console.log('Invalid Dataset for this Mail!');
    });
}

function show_loader() {
    $(function() {
        "use strict";
        $(function() {
            $(".preloader").fadeIn();
        });
    });
    setTimeout(function() {
        $(function() {
            "use strict";
            $(function() {
                $(".preloader").fadeOut();
            });
        });
    },500);
}

function show_suggestions(value) {
    var contacts = JSON.parse(localStorage.getItem('contacts'));
    var tags = [];
    for (let i = 0; i < contacts.length; i++) {
        tags[i] = contacts[i]['mail'];
    }
    var n = tags.length;
    document.getElementById('address_suggestion').innerHTML = '';
    l=value.length;
    for (var i = 0; i<n; i++) {
            if(((tags[i].toLowerCase()).indexOf(value.toLowerCase()))>-1) {
            var node = document.createElement("option");
            var val = document.createTextNode(tags[i]);
            node.appendChild(val);
            document.getElementById("address_suggestion").appendChild(node);
        }
    }
}