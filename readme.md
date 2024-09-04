# POC IONOS Webmailer v2

### Structure
BE - Backend Service, written in plain PHP <br>
FE - Frontend Service, written in HTML / Vanilla Javascript <br>
Doc - Contains Postman Collection and MySQL Create Statements <br>

### BE
Contains API Endpoints for the Webmailer. REST-API uses SMTP/IMAP for E-Mail Operations. The Backend can connect to any IONOS Mailbox, but it will delete any files found. Cronjob for reading mails has to be put to run any minute onto /libs/phpfetcher/mail_schedule.php.

### FE
FE Contains entire frontend demo. The Demo uses several JavaScript APIs for offline functionality. Implemented features:

- Online/Offline Login
- Fetch Mails from Backend
- Open Mails
- Send Mails
- Reply/Forward Mails
- Delete Mails
- Sync with Contact App
- Full Cache Management
- Simple Session Validation with Backend
- Various Standard UI Feature Prototypes (e.g. Dark Mode, Color Theming, ...)

The Core Libs are located at /assets/ionos-mail-libs. Files are loaded on demand using the autoloader.js file. The Source Code is commented with hints to help understanding the logics implemented.

### Demo
Demo is accessible under: https://webmailpoc.de.
Attention: the demo is currently no longer maintained!!

### Notes
The Deployment Server is currently only reachable for Ports 80 & 443 over Internet. Other access is only available over the VPN Service of BL Consulting. If you want to change the behaviour, update the firewall rules in the IONOS Customer Portal.
