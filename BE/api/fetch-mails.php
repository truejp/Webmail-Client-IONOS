<?php
// standard imports and security measures - do not change
require('includes/config.php');
require('includes/db.php');
require('includes/auth-validator.php');

// fetch all from Database
$all_mails = Array();
$i = 0;
$sql = "SELECT * FROM `emails` WHERE account_id = '$mail_client_id' order by time desc";
$result = mysqli_query($db_conn, $sql);
while ($row = mysqli_fetch_assoc($result)) {
	// fetch attachments
    $uniq = $row['uniqid'];
    $sql_att = "SELECT * FROM `files` WHERE email_id = '$uniq'";
    $result_att = mysqli_query($db_conn, $sql_att);
    $all_attachments = Array();
    while ($row_att = mysqli_fetch_assoc($result_att)) {
        $all_attachments[] = $row_att['filename'];
    }
    $this_mail = Array('uniqid' => $row['uniqid'], 'time' => $row['time'], 'body_html' =>$row['body_html'], 'body' =>$row['body_text'], 'subject' => $row['subject'], 'name' => $row['name'], 'from' => $row['email'], 'attachments' => $all_attachments, 'folder' => $row['folder']);
    $all_mails[] = $this_mail;
}
$data = [ 'authentication' => 'success', 'status-code' => 200, 'mail-data' => $all_mails];
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);
?>