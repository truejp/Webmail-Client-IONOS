<?php
/* 
######### IMAP / POP3 Import Utility by Philipp Lehnet ##########

This Utility is made for collecting mails from all registered customers.

*/
echo "Import started.<br>";
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// setup
require('../../includes/config.php');
require('../../includes/db.php');
require('class.imap.php');

$sql_fetch = "SELECT * FROM `sync_credentials`";
$result_fetch = mysqli_query($db_conn, $sql_fetch);
while ($row = mysqli_fetch_assoc($result_fetch)) {
    $password = $row['password'];
    $user = $row['mail'];
    $acc_id = $row['id'];
    // get folder structure
    $srv = '{imap.ionos.de:993/imap/ssl/novalidate-cert}';
    $conn = imap_open($srv, $user, $password);
    $boxes = imap_list($conn, $srv, '*');
    // return an array with all folder URLs
    imap_close($conn);
    // Tranlate folder names to german human format
    
    // Update Folder List in Backend
    $sql_delete = "DELETE from folders where account_id = '$acc_id'";
    $result = mysqli_query($db_conn, $sql_delete);
    
    foreach($boxes as $box) {
        $imap = new Imap();
        $folder = str_replace('INBOX', 'Posteingang', str_replace('&APw-', 'ü', explode('}', $box)[1]));
        echo "<br>Running Folder  " . $folder . ".<br>";
        $sql_insert = "INSERT into `folders` (account_id, folder_name) VALUES ('$acc_id', '$folder')";
        $result = mysqli_query($db_conn, $sql_insert);
        try {
            $connection_result = $imap->connect($box, $user, $password);
            if ($connection_result !== true) {
                echo $connection_result; //Error message!
                echo "Running next...";
            }
            $messages = $imap->setLimit(20)->getMessages('text', 'desc'); // Return array of messages. Second parameter is for type of sort desc|asc
            // save
            foreach($messages as $message) {
                $uniqid = mysqli_real_escape_string($db_conn, uniqid()) ;
                $time = mysqli_real_escape_string($db_conn, $message['date']);
                $name = mysqli_real_escape_string($db_conn, $message['from'][0]['name']);
                $email = mysqli_real_escape_string($db_conn, $message['from'][0]['address']);
                $subject = mysqli_real_escape_string($db_conn, $message['subject']);
                try {
                    $body_text = mysqli_real_escape_string($db_conn, $message['message']);
                }  
                catch(Exception $e) {
                    // nothing
                }
                $body_html = mysqli_real_escape_string($db_conn, $message['HTMLmessage']);
                $delete_id = $message['uid'];

                // write to DB
                $sql_insert = "INSERT into `emails` (uniqid, time, name, email, folder, subject, body_text, body_html, account_id) VALUES ('$uniqid', '$time', '$name', '$email', '$folder', '$subject', '$body_text','$body_html', $acc_id)";
                $result = mysqli_query($db_conn, $sql_insert);
                for ($i = 0; $i < count($message['attachments']); $i++) {
                    $val = $message['attachments'][$i];
                    $sql_insert = "INSERT into `files` (email_id, filename) VALUES ('$uniqid', '$val')";
                    $result = mysqli_query($db_conn, $sql_insert);
                }

                // delete mail
                $srv = '{imap.ionos.de:993/imap/ssl/novalidate-cert}';
                $conn = imap_open($srv, $user, $password);
                echo imap_delete($conn, $delete_id, FT_UID);
                imap_expunge($conn);
                imap_close($conn);
            }
        }
        catch(Exception $e) {
            echo $e;
        }
    }
}
?>