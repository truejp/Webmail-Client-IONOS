<?php
// standard imports and security measures - do not change
require('includes/config.php');
require('includes/db.php');
require('includes/auth-validator.php');

// fetch all from Database
$all_folders = Array();
$i = 0;
$sql = "SELECT * FROM `folders` WHERE account_id = '$mail_client_id'";
$result = mysqli_query($db_conn, $sql);
while ($row = mysqli_fetch_assoc($result)) {
	// fetch attachments
    $all_folders[] = $row['folder_name'];
}
$data = [ 'authentication' => 'success', 'status-code' => 200, 'folder-list' => $all_folders];
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);
?>