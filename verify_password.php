<?php
$hashed_password = $_GET['hashed_password'];
$password = $_GET['password'];
try{
	if(password_verify($password, $hashed_password)) {
		echo "true";
	} else{
		echo "false";
	}
}catch(Exception $e)
{
	echo $e;
}
?>