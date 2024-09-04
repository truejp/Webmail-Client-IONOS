/*
    Autoloader for IONOS Webmailer POC
    This script will load all dependencies of lib-ionos-mail and make the functions accessible for the frontend. It has to be loaded into the global scope of the webpage
    and execution must be inline (default). Else, you may provide absolute script src for dynamically loading the scripts. Do not rename this file.
*/

console.log('Autoloader running');

// Global Vars
const api_root = 'https://api.webmailpoc.de/';
var script = document.currentScript;
const current_root = script.src.split('autoloader')[0];
const redirect_not_signed_in = 'auth.html';
const dashboard_url = 'inbox.html';
const session_validator_enabled = true;
var session_validated = true;

// UI Config
const mail_overview_dashboard = 'overview_hook';
const el_per_page = 10;
var curr_folder = "Posteingang";

// Sync Config - values in ms
const retry_after_connection_lost = 8000;
const outbox_sync_cycle = 1000;
const inbox_sync_cycle = 5000;
const check_online = 500;
const check_auth_cycle = 5000;
var auth_state = true;

// Auth Config
const mail_field_id = 'email';
const password_field_id = 'password';
const offline_sign_in_limit = 604800; // offline login possible for 7 days

// Mail Config
const recipients_field_id = 'recipients';
const subject_field_id = 'subject';
const mail_body_field_id = 'mymce';

// Import all scripts
loadScript('auth_controller.js');
loadScript('mail_controller.js');
loadScript('sync_controller.js');
loadScript('ui_controller.js');
loadScript('contact_controller.js');

// Loading Helpers
function loadScript(file) {
    const script = document.createElement('script');
    script.src = current_root + file;
    document.head.append(script);
    console.log('Async load: ' + file);
}

const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/offline.js", {
          scope: "/",
        });
        if (registration.installing) {
          console.log("Service worker installing");
        } else if (registration.waiting) {
          console.log("Service worker installed");
        } else if (registration.active) {
          console.log("Service worker active");
        }
      } catch (error) {
        console.error(`Registration failed with ${error}`);
      }
    }
  };
  registerServiceWorker();