<?php
// standard imports and security measures - do not change
require('includes/config.php');
require('includes/db.php');
// require('includes/auth-validator.php');

// REPLACEMENT VALIDATOR


$usermail = mysqli_real_escape_string($db_conn, $_POST['user']);
$token = mysqli_real_escape_string($db_conn, $_POST['token']);
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

$recipients = $_POST['recipients'];
$subject = $_POST['subject'];
$body = $_POST['body'];

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
	$mail->Password = $fetched_pw;
	$mail->SetFrom($usermail, $usermail);
	$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $rec_arr = explode(';', $recipients);
    if (count($rec_arr) < 2) {
        $mail->AddAddress($rec_arr[0], $rec_arr[0]);
    }
    else {
        for ($i = 0; $i < count($rec_arr); $i++) {
            $mail->AddAddress($rec_arr[$i], $rec_arr[$i]);
        }
    }
	$mail->Subject = $subject;
	$mail->isHTML(true);
	$mail->CharSet = 'UTF-8';
	$mail->Encoding = 'base64';
	$mail->Body = $body;
	$i = 0;
	if (isset($_FILES['file0']) && $_FILES['file0']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file0']['tmp_name'], $_FILES['file0']['name']);
	}
	if (isset($_FILES['file1']) && $_FILES['file1']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file1']['tmp_name'], $_FILES['file1']['name']);
	}
	if (isset($_FILES['file2']) && $_FILES['file2']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file2']['tmp_name'], $_FILES['file2']['name']);
	}
	if (isset($_FILES['file3']) && $_FILES['file3']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file3']['tmp_name'], $_FILES['file3']['name']);
	}
	if (isset($_FILES['file4']) && $_FILES['file4']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file4']['tmp_name'], $_FILES['file4']['name']);
	}
	if (isset($_FILES['file5']) && $_FILES['file5']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file5']['tmp_name'], $_FILES['file5']['name']);
	}
	if (isset($_FILES['file6']) && $_FILES['file6']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file6']['tmp_name'], $_FILES['file6']['name']);
	}
	if (isset($_FILES['file7']) && $_FILES['file7']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file7']['tmp_name'], $_FILES['file7']['name']);
	}
	if (isset($_FILES['file8']) && $_FILES['file8']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file8']['tmp_name'], $_FILES['file8']['name']);
	}
	if (isset($_FILES['file9']) && $_FILES['file9']['error'] == UPLOAD_ERR_OK) {
		$mail->addAttachment($_FILES['file9']['tmp_name'], $_FILES['file9']['name']);
	}
	$mail->Send();
}

catch (phpmailerException $e) {
    $data = [ 'sending' => 'failed', 'status-code' => 501];
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
	echo $e;
    exit;
} 
catch (Exception $e) {
	$data = [ 'sending' => 'failed', 'status-code' => 500];
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
	echo $e;
    exit;
}

$data = [ 'sending' => 'success', 'status-code' => 200];
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);
exit;

?>