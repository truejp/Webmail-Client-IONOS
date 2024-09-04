/* Low Level Contact Controller - Includes all operations regarding contacts */

function draw_contact_list() {
    console.log("Building...");
    var html_el = '';
    var contacts = JSON.parse(localStorage.getItem('contacts'));
    for (let i = 0; i < contacts.length; i++) {
        html_el = html_el + generate_contact(contacts[i]);
    }
    // insert to body
    try {
        document.getElementById('full_contact_list').innerHTML = html_el;
    }
    catch (e) {
        console.warn('Cannot build Contact List');
    }
}

draw_contact_list();

function generate_contact(element) {
    var name = element['name'];
    var mail = element['mail'];
    var phone = "0176123455";
    var position = "Developer";
    var age = "23";
    var birthday = "10.10.1980";
    var html = '<tr><td><p><label class="m-l-15"><input type="checkbox" /><span></span></label></p></td><td><a href="contact-detail.html?mail=' + mail;
    html = html + '"><img src="assets/images/users/2.jpg" alt="user" class="circle" width="30px"/>' + name;
    html = html + '</a></td><td class="hide-on-small-only">' + mail;
    html = html + '</td><td class="hide-on-small-only">' + phone;
    html = html + '</td><td class="hide-on-small-only"><span class="label label-info">' + position;
    html = html + '</span></td><td class="hide-on-small-only">' + age;
    html = html + '</td><td class="hide-on-small-only">' + birthday;
    html = html + '</td><td><button type="button" class="btn btn-sm btn-icon btn-pure btn-outline delete-row-btn" onclick="delete_contact(\'' + mail + '\')" data-toggle="tooltip" data-original-title="Delete"><i class="ti-close" aria-hidden="true"></i></button></td></tr>';
    return html;
}

function rebuild_contacts() {
    // rebuild from mail storage
    var all_mails = JSON.parse(localStorage.getItem('inbox'));
    var contact_list = {};
    // localStorage.setItem('inbox', JSON.stringify(inbox_data));
    for (let i = 0; i < all_mails.length; i++) {
        // parse all mail data
        var from = all_mails[i]['from'];
        var name = all_mails[i]['name'];
        if(contact_list.hasOwnProperty(from)) {
            console.log("Already existing: " + name);
        } else {
           contact_list[from] = name;
        }
    }
    console.log(contact_list);
    // add to JSON Array for Local Storage
    var arr = '[';
    for(var index in contact_list) {
        arr = arr + '{"name":"' + contact_list[index] + '","mail":"' + index + '"},';
    }
    arr = arr.substring(0, arr.length - 1) + ']';
    localStorage.setItem("contacts", arr);
    draw_contact_list();
}

function add_contact() {
    var contacts = JSON.parse(localStorage.getItem('contacts'));
    contacts.push({ name: document.getElementById('new_name').value, mail: document.getElementById('icon_telephone').value });
    localStorage.setItem("contacts", JSON.stringify(contacts));
    draw_contact_list();
}

function delete_contact(mail) {
    var contacts = JSON.parse(localStorage.getItem('contacts'));
    var new_contacts = [];
    var j = 0;
    for (i = 0; i < contacts.length; i++) {
        if (contacts[i]['mail'] != mail) {
            new_contacts[j] = contacts[i];
            j++;
        }
    }
    localStorage.setItem("contacts", JSON.stringify(new_contacts));
    draw_contact_list();
}