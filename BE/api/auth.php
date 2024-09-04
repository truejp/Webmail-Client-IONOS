<?php
require('includes/config.php');
require('includes/db.php');

// get mail and user from API request
$queries = array();
parse_str($_SERVER['QUERY_STRING'], $queries);
$usermail = mysqli_real_escape_string($db_conn, $queries['mail']);
$password = mysqli_real_escape_string($db_conn, $queries['password']);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'libs/phpmailer/Exception.php';
require 'libs/phpmailer/PHPMailer.php';
require 'libs/phpmailer/SMTP.php';

// try auth using smtp --> send test mail
$mail = new PHPMailer(true);
$mail->IsSMTP();
try {
	$mail->Host = "smtp.ionos.de";
	$mail->Port = 465;
	$mail->SMTPAuth = true;
	$mail->Username = $usermail;
	$mail->Password = $password;
	$mail->SetFrom($usermail, $usermail);
	$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
	$mail->AddAddress('lehnet@bl-itsolutions.de', 'Philipp Lehnet');
	$mail->Subject = 'New Auth - Webmailer POC';
	$mail->isHTML(true);
	$mail->CharSet = 'UTF-8';
	$mail->Encoding = 'base64';
	$mail->Body = 'Someone tried to login on the frontend.';
	$mail->Send();
}
catch (phpmailerException $e) {
	$error = true;
    $data = [ 'authentication' => 'failed', 'status-code' => 401];
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
} 
catch (Exception $e) {
	$error = true;
	$data = [ 'authentication' => 'failed', 'status-code' => 500];
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

// check if sync point exists in backend
$sql = "SELECT * FROM `sync_credentials` WHERE mail='$usermail'";
$result = mysqli_query($db_conn, $sql);

while ($row = mysqli_fetch_assoc($result)) {
	if ($password != $row['password']) {
        // update PW
        $sql_update = "update sync_credentials set password = '$password' WHERE mail='$usermail'";
        $result_update = mysqli_query($db_conn, $sql_update);
    }
	// generate auth token
    $exp_stamp = time() + $token_expires_after;
    $token = md5(rand(0,10000) . $usermail . $exp_stamp);
    $sql_token = "update sync_credentials set token = '$token', token_expiration = '$exp_stamp' WHERE mail='$usermail'";
    $token_update = mysqli_query($db_conn, $sql_token);
    $data = [ 'authentication' => 'success', 'status-code' => 200, 'auth-token' => $token, 'expires' => $exp_stamp];
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

// create sync point and return
$exp_stamp = time() + $token_expires_after;
$token = md5(rand(0,10000) . $usermail . $exp_stamp);
$sql_insert = "INSERT into `sync_credentials` (mail, password, token, token_expiration) VALUES ('$usermail', '$password', '$token', '$exp_stamp')";
$result_update = mysqli_query($db_conn, $sql_insert);
if(!$result_update){
    $data = [ 'authentication' => 'failed', 'status-code' => 500, 'description' => 'DB Insert failed.'];
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}
$data = [ 'authentication' => 'success', 'status-code' => 201, 'auth-token' => $token, 'expires' => $exp_stamp];
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);

?>