<?php
$queries = array();
parse_str($_SERVER['QUERY_STRING'], $queries);
$usermail = mysqli_real_escape_string($db_conn, $queries['user']);
$token = mysqli_real_escape_string($db_conn, $queries['token']);
$fetched_pw = "";
$mail_client_id = 0;
// check against DB
$sql = "SELECT * FROM `sync_credentials` WHERE mail='$usermail' AND token='$token' AND token_expiration > '" . time() . "'";
$result = mysqli_query($db_conn, $sql);
while ($row = mysqli_fetch_assoc($result)) {
	$secure_endpoints = false;
    $fetched_pw = $row['password'];
    $mail_client_id = $row['id'];
}

if ($secure_endpoints) {
    // return failed
    $data = [ 'authentication' => 'failed', 'status-code' => 401 ];
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}
// passed authentication
?>