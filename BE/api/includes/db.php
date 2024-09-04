<?php
header('Access-Control-Allow-Origin: *');
$db_conn = mysqli_connect($db_host, $db_user, $db_secret, $db_name);
if (mysqli_connect_errno())
  {
	echo "Failed to connect to DB Service: " . mysqli_connect_error();
	echo "Please try again.";
  }
?>