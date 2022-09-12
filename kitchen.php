<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require __DIR__ . '/vendor/autoload.php';

use Mike42\Escpos\Printer;
use Mike42\Escpos\EscposImage;
use Mike42\Escpos\PrintConnectors\RawbtPrintConnector;
use Mike42\Escpos\CapabilityProfile;
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;



function getExceptionTraceAsString($exception) {
    $rtn = "";
    $count = 0;
    foreach ($exception->getTrace() as $frame) {
        $args = "";
        if (isset($frame['args'])) {
            $args = array();
            foreach ($frame['args'] as $arg) {
                if (is_string($arg)) {
                    $args[] = "'" . $arg . "'";
                } elseif (is_array($arg)) {
                    $args[] = "Array";
                } elseif (is_null($arg)) {
                    $args[] = 'NULL';
                } elseif (is_bool($arg)) {
                    $args[] = ($arg) ? "true" : "false";
                } elseif (is_object($arg)) {
                    $args[] = get_class($arg);
                } elseif (is_resource($arg)) {
                    $args[] = get_resource_type($arg);
                } else {
                    $args[] = $arg;
                }   
            }   
            $args = join(", ", $args);
        }
        $rtn .= sprintf(
            "#%s %s(%s): %s%s%s(%s)\n",
            $count,
            $frame['file'],
            $frame['line'],
            isset($frame['class']) ? $frame['class'] : '',
            isset($frame['type']) ? $frame['type'] : '', // "->" or "::"
            $frame['function'],
            $args
        );
        $count++;
    }
    return $rtn;
}





try {
	$logoPath = "resources/logo.png";
	$logoWidth = 300;
	$body 			= json_decode(file_get_contents('php://input'), true);


	$order = new stdClass();
	$order_id= $body["order"]["id"];
	$restaurant= $body["restaurant"];
	$ip_type=$body["ip_type"];
	echo($restaurant["ip_printer"]);
	$extraData = array(
	'table_number' => $body["order"]["table_number"],
	'nbrCouvert' => $body["order"]["nbrCouvert"],
	'lv' => $body["order"]["orderType"],
	'name' => $body["userName"],
	);
	
	$total = $body["order"]["totalPrice"];

	$remarque = $body["order"]["remarque"];
    $modifier = $body["new"];

	
	$items = $body["order"]["orderItems"];
	
	
	$profile = CapabilityProfile::load("POS-5890");
	$ip='';
	if($ip_type=="kitchen"){
		$ip = $restaurant['ip_printer'];
	}elseif($ip_type=="bar"){
		$ip = $restaurant['ip_bar'];
	}
	$connector = new NetworkPrintConnector($ip, 9100);


	// $date = date('l jS \of F Y h:i:s A');
    $printer = new Printer($connector);
    /* Initialize */
    $printer -> initialize();
    
  
    

	// file_put_contents($logoPath, fopen($body["initData"]["logoSrc"], 'r'));
	// $image 		= imagecreatefrompng($logoPath);
	// $width  	= imagesx($image);
	// $height 	= imagesy($image);
	
	// $scale = $logoWidth / $width;
	// $newWidth 	= $width* $scale;
	// $newHeight 	= $height*$scale;
	// $newImg = imagecreatetruecolor($newWidth, $newHeight);
	// imagealphablending($newImg, false);
	// imagesavealpha($newImg, true);
	// $transparent = imagecolorallocatealpha($newImg, 255, 255, 255, 127);
	// imagefilledrectangle($newImg, 0, 0, $newWidth, $newHeight, $transparent);
	// imagecopyresampled($newImg, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
	// imagepng($newImg, $logoPath); 
	
     echo($ip_type);
	// $logo = EscposImage::load($logoPath, false);
	$printer1 = new Printer($connector, $profile);
	
	
	$printer1->setJustification(Printer::JUSTIFY_CENTER);


    /* Print top logo */
    // if ($profile->getSupportsGraphics()){
    //     $printer1->graphics($logo);
    // }
    // if ($profile->getSupportsBitImageRaster() && !$profile->getSupportsGraphics()) {
    //     $printer1->bitImage($logo);
    // }
	
    /* Name of shop */
    $printer1->setJustification(Printer::JUSTIFY_CENTER);
    $printer1->selectPrintMode(Printer::MODE_EMPHASIZED);
	$tit ='';
	if($ip_type=="kitchen"){
		$tit="Ticket Cuisine";
	}
	if($ip_type=="bar"){
		$tit="Ticket Comptoire";
	}

    $printer1->text($tit."\n");
	
    $printer1->feed();
   
    $printer1->setTextSize(5,5);
    $printer1->text("N°".$order_id."\n");
    $printer1->selectPrintMode();
	$printer1->setTextSize(2,2);
	if($modifier){
		$printer1->text("Commande modifiée\n");
		$printer1->text("N°".$order_id."\n");
	}
    $printer1->selectPrintMode();


    $printer1->feed();



    /* Items */
    $printer1->setJustification(Printer::JUSTIFY_LEFT);
    $printer1->setEmphasis(true);
   // $printer1->text(new item('', '$'));
    $printer1->setEmphasis(false);
    $printer1->selectPrintMode(Printer::MODE_EMPHASIZED);
    $printer1->selectPrintMode();


    $printer1->text("__________________________________________\n");
    $printer1->setEmphasis(true);
	$printer1->text("Nom du client : ".$extraData['name']."\n");
	if(strlen($extraData['table_number'])>0){
		$printer1->text("Mode de commande : ".($extraData['lv'])."\n");

		
		$printer1->text("Numero de Table :".($extraData['table_number'])."\n");
		$printer1->text("Nombre de Couverts :".($extraData['nbrCouvert'])."\n");
	}else{
		$printer1->text("Mode de commande :".($extraData['lv'])."\n");

	}
			// }else{
			// 	$printer1->text("Adresse du client".$extraData['customer_adress']."\n");	
			// 	$printer1->text("Numero Telephone : ".$extraData['tel']."\n");
			// }
    // $printer1->text("Nom du client : ".$extraData['name']."\n");
	 
	
    // $printer1->text("Paiement : ".$extraData['pay']." €"."\n");

    // if($restaurant["delivery_minimum"]>$total){
    //         $Livraison=$restaurant["frais"];
    //         $total_new=$total+$Livraison;
    // }else{
    //         $Livraison=0;
    //        $total_new=$total+$Livraison;
    // }
    //     $ht= $total_new/ (1 + 10);

        $printer1->text("__________________________________________"."\n");
	$items = $body["order"]["orderItems"];
	function map_json_to_item_class($item)
	{
	   return new item($item["name"],$item["count"],$item["new"],array_key_exists('extras' , $item) ? $item["extras"] : [],array_key_exists('slots' , $item) ? $item["slots"] : [],array_key_exists('stepItems' , $item) ? $item["stepItems"] : [],true);
	}
	
	if($ip_type=="kitchen"){
		$items = array_filter($items, function($element) {
			return $element['is_hot'] === true;
		 });
	}
	if($ip_type=="bar"){
		$items = array_filter($items, function($element) {
			return $element['is_cold'] === true;
		 });
	}
	
	$items = array_map( 'map_json_to_item_class', $items );
	foreach ($items as $item)
	{	
		$printer1->text($item->getAsString(32));

	}
		
		// $printer1->text("__________________________________________\n");
		// $printer1->text("Remarques : ".$extraData['message']."\n");
		// $printer1->setEmphasis(false);
		// $printer1->feed();
		
		// $printer1->text("__________________________________________"."\n");
		// $printer1->selectPrintMode(Printer::MODE_EMPHASIZED);
		
		// $HTOut 	= number_format((float)$total, 2, '.', '');
		// $TVAOut = number_format((float)($total*.10), 2, '.', '');
		// $TTCOut = number_format((float)($total*1.10), 2, '.', '');
		
		// $HTOut 	= 	str_pad($HTOut 	,8," ");
		// $TVAOut = 	str_pad($TVAOut ,8," ");
		// $TTCOut = 	str_pad($TTCOut ,8," ");
		
		// $printer1->text("HT     :     ".$HTOut."€\n");
		// $printer1->text("TVA    :     ".$TVAOut."€\n");
		// $printer1->text("TTC    :     ".$TTCOut."€\n");
		
		$printer1->selectPrintMode();
		$printer1->text("__________________________________________"."\n");
		$printer1->text("Remarque : ".$remarque."\n");


		$printer1->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
		$printer1->selectPrintMode();
		/* Footer */
		$printer1->feed(2);
		$printer1->setJustification(Printer::JUSTIFY_CENTER);
		// $printer1->text("www.bornedecommande.fr\n");
		$printer1->feed(2);
		$printer1->text(date('m/d/Y h:i:s a', time()). "\n");
		/* Barcode Default look */
		$printer1->feed();
		$printer12 = new Printer($connector); // dirty printer profile hack !!
		$printer12->setJustification(Printer::JUSTIFY_CENTER);
        $printer -> setBarcodeHeight(80);
$printer->setBarcodeTextPosition(Printer::BARCODE_TEXT_BELOW);
$printer -> barcode($order_id);
$printer -> feed();


		$printer12->setJustification();
		$printer12->feed();
		$printer1->cut();
		$printer1->pulse();
		
	} catch (Exception $e) {
		echo getExceptionTraceAsString($e);
		echo $e->getMessage();
	} finally {
		$printer1->close();
	}
exit(0);
// try {
//     $profile = CapabilityProfile::load("POS-5890");
//     /* Fill in your own connector here */
// 	$connector = new NetworkPrintConnector("192.168.1.192", 9100);
// 	$subtotal = new item('Subtotal', '12.95');
// 	$tax = new item('A local tax', '1.30');
// 	$date = date('l jS \of F Y h:i:s A');
//     /* Start the printer */
	
	
// 	$logo = EscposImage::load($logoPath, false);

//     $printer2 = new Printer($connector, $profile);
//     $printer2->setJustification(Printer::JUSTIFY_CENTER);
//     /* Print top logo */
    
	
	
	
	
	
	
// 	 if ($profile->getSupportsGraphics()){
//         $printer2->graphics($logo);
//     }
//     if ($profile->getSupportsBitImageRaster() && !$profile->getSupportsGraphics()) {
//         $printer2->bitImage($logo);
//     }
	
//     /* Name of shop */
//     $printer2->setJustification(Printer::JUSTIFY_CENTER);
//     $printer2->selectPrintMode(Printer::MODE_EMPHASIZED);
	
//     $printer2->text($restaurant["name"]."\n");
//     $printer2->text("Adresse : ". $restaurant["address"]."\n");
//     $printer2->text("Tel : " .$restaurant["telephone"]."\n");
//     $printer2->setTextSize(5,5);
//     $printer2->text("N°".$order->id."\n");
//     $printer2->selectPrintMode();
//     $printer2->feed();


//     /* Title of receipt */
//     $printer2->setEmphasis(true);
//     $printer2->text("Commande via bornedecommande.fr\n");
//     $printer2->setEmphasis(false);
//     /* Items */
//     $printer2->setJustification(Printer::JUSTIFY_LEFT);
//     $printer2->setEmphasis(true);
//    // $printer2->text(new item('', '$'));
//     $printer2->setEmphasis(false);
   
//     $printer2->selectPrintMode(Printer::MODE_EMPHASIZED);
  
//     $printer2->selectPrintMode();

 

//     $printer2->text("__________________________________________\n");
//     $printer2->setEmphasis(true);
//     $printer2->text("Nom du client : ".$extraData['name']."\n");
//     $printer2->text("Numero Telephone : ".$extraData['tel']."\n");
//     $printer2->text("Mode de commande : ".translate($extraData['lv'])."\n");
//     $printer2->text("Paiement : ".$extraData['pay']." €"."\n");
	
//         // if($restaurant["delivery_minimum"]>$total){
//         //     $Livraison=$restaurant["frais"];
//         //     $total_new=$total+$Livraison;
//         // }else{
//         //     $Livraison=0;
//         //    $total_new=$total+$Livraison;
//         // }
//         $ht= $total_new/ (1 + 10);

//         $printer2->text("__________________________________________"."\n");

// 	$items = $body["order"]["orderItems"];
	
// 	$items = array_map( 'map_json_to_item_class', $items );
// 	foreach ($items as $item)
// 	{
// 		$printer2->text($item->getAsString(32));
// 	}
	
    
//     $printer2->text("__________________________________________"."\n");
   

// 	$printer2->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
//     //$printer1->text($total->getAsString(32));
//     $printer2->selectPrintMode();
//     /* Footer */
//     $printer2->feed(2);
//     $printer2->setJustification(Printer::JUSTIFY_CENTER);
//     //$printer2->text("at ExampleMart\n");
//     $printer2->text("www.bornedecommande.fr\n");
//     $printer2->feed(2);
//     $printer2->text(date('m/d/Y h:i:s a', time()). "\n");
//     /* Barcode Default look */
//     $printer2->feed();
	
//     /* Cut the receipt and open the cash drawer */
//     $printer2->cut();
//     $printer2->pulse();

// } catch (Exception $e) {
// 	echo getExceptionTraceAsString($e);
//     echo $e->getMessage();
// } finally {
//     $printer2->close();
// }


function constructLine($left, $right , $width)
{
    // limit left length
	$leftLength = mb_strlen ($left);
	$rightLength 	= mb_strlen ($right);
	
    if ($leftLength > $rightLength)
    {
		$trim = $width - ( $leftLength + $rightLength );
        if ($trim <= 0)
		{
			$left = substr($left, 0, $width - $rightLength - 4) . '...';
		}
    }

	$leftLength 	= mb_strlen ($left);
	
	return $left . str_repeat(" " ,$width - mb_strlen ($left) -mb_strlen ($right) ) . $right ;
}

class item
{
    private $name;
    private $price;
    private $dollarSign;
    private $extras;
    private $stepItems;
	private $slots;
	private $count;
	private $text;
    public function __construct($name = '',$count = '', $price ,$extras = [] ,$slots = [],$stepItems=[], $dollarSign = false)
    {
        $this->name = $name;
        $this->price = $price;
        $this->dollarSign = $dollarSign;
		$this->extras = $extras;
		$this->stepItems = $stepItems;
		$this->slots = $slots;
		$this->count = $count;
		$this->text="";
    }
    public function getAsString($width = 48)
    {
        if ($this->dollarSign || true) {
            $leftCols = $leftCols / 2 - $rightCols / 2;
        }
		$lines = [];
		$mapExtra = function ($extra)
		{
			if($extra["default_quantity"]>0){
			return constructLine("       ".$extra["title"]." ",  "" , 42 );
		}
		};
		$mapStepItems = function ($step)
		{
			
			return constructLine("       ".$step["name"],"". '' , 42 );
		
		};
		if ($this->slots)
		{
			$mapSlots = function ($slot)
			{
				$mapProducts = function ($product)
				{
					return constructLine("       ".$product["name"] ,"", 42);
				};
				return implode("\n",array_map($mapProducts ,$slot["products"]));
			};
			$lines  =  array_map($mapSlots, array_values($this->slots));
		}else if ($this->extras && count( $this->extras) )
		{
			$lines = array_map($mapExtra,$this->extras);
		}else if ($this->stepItems && count( $this->stepItems) ){
			$lines = array_map($mapStepItems,$this->stepItems);
		}
		$lines 	= implode("\n",$lines);
		if($this->price=="true")
		{
			$this->text ="( Nouveaux )";

		}else{
			$this->text ="";

		}
        $left 	= (isset($this->count) ? $this->count . " X "  : "")  . $this->name." ".$this->text;
	
        
        return  constructLine($left,$right,42) . "\n". ( strlen($lines) ? "$lines\n" : "") ;
    }
    public function __toString()
    {
        return $this->getAsString();
    }
}

$printer->close();
?>