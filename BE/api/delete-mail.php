<?php
// standard imports and security measures - do not change
require('includes/config.php');
require('includes/db.php');
require('includes/auth-validator.php');

$uniq = mysqli_real_escape_string($db_conn, $queries['uniq']);
// fetch all from Database
$sql_delete = "update emails set folder = 'Papierkorb' WHERE uniqid='$uniq'";
mysqli_query($db_conn, $sql_delete);

$data = [ 'authentication' => 'success', 'status-code' => 200];
header('Content-Type: application/json; charset=utf-8');
echo json_encode($data);
?>