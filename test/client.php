<?php
require 'vendor/autoload.php';

$loop = new React\EventLoop\StreamSelectLoop();


// Connect to DNode server running in port 7070 and call Zing with argument 33
$dnode = new DNode\DNode($loop);
$dnode->connect(8021, function($remote, $connection) {

	$data = array();
	$data[] = array('Address','City','State','Zip');

    $remote->test($data, function($n) use ($connection) {
        echo "n = {$n}\n";
        $connection->end();
    });

    $remote->spreadsheetConvert('test/data/sample.xlsx', 'test/sample.csv', function($n) use ($connection) {
        echo "n = {$n}\n";
        $connection->end();
    });
});

$loop->run();

?>