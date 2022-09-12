<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
//   restaurant: {
//     name: "Yamato",
//     address: "75004 Paris, France",
//     telephone: "00 21 65 35 16 32"
//   },
//   products: [
//     {
//       id: 3,
//       name: "Capricciosa ",
//       price: 13.5,
//       quantity: "1",
//       totalPrice: 13.5
//     },
//     {
//       id: 2,
//       name: "Regina ",
//       price: 12,
//       quantity: "1",
//       totalPrice: 12
//     }
//   ],
//   impression: "2022-01-19 15:56",
//   ouverture: "2022-01-19  14:29",
//   fermeture: "2022-01-19 15:56",
//   commandes: 1,
//   clients: 1,
//   ticket_moyen: "25.50€",
//   pay_method: [ { qt: 1, name: "Especes", prix: "25.50" } ],
//   tva: { "5": 0.6, "10": 1.35 },
//   ht: "25.50",
//   ttc: "27.45",
//   fond_initial: "100.00",
//   fond_final: "127.45",
//   ip_printer: "192.168.1.192"
// }


ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
require __DIR__ . "/vendor/autoload.php";

use Mike42\Escpos\Printer;
use Mike42\Escpos\EscposImage;
use Mike42\Escpos\PrintConnectors\RawbtPrintConnector;
use Mike42\Escpos\CapabilityProfile;
use Mike42\Escpos\PrintConnectors\FilePrintConnector;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;







try {
	$logoPath = "resources/logo.png";
	$logoWidth = 300;
	$body 			= json_decode(file_get_contents("php://input"), true);


	$restaurant = $body["restaurant"];
	$tvas = $body["tva"];

	echo "------>" . $body["impression"] . "<br>";

	$profile = CapabilityProfile::load("POS-5890");
	$connector = new NetworkPrintConnector($body["ip_printer"], 9100);
	// $date = date("l jS \of F Y h:i:s A");
	$printer = new Printer($connector);
	/* Initialize */
	$printer->initialize();



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
	$printer1->setTextSize(3, 3);
	$printer1->text("Ticket Z" . "\n");
	$printer1->feed(1);
	$printer1->selectPrintMode();
	$printer1->setTextSize(2, 1);
	$printer1->text($restaurant["name"] . "\n");
	$printer1->selectPrintMode();
	$printer1->text("Adresse : " . $restaurant["address"] . "\n");
	$printer1->text("Tel : " . $restaurant["telephone"] . "\n");
	$printer1->feed();

	/* Title of receipt */
	/* Items */
	$printer1->setJustification(Printer::JUSTIFY_LEFT);
	$printer1->setEmphasis(true);
	// $printer1->text(new item("", "$"));
	$printer1->setEmphasis(false);
	$printer1->selectPrintMode(Printer::MODE_EMPHASIZED);
	$printer1->selectPrintMode();


	$printer1->setEmphasis(true);
	$printer1->text("Impression : " . $body["impression"] . "\n");
	$printer1->text("Ouverture : " . $body["ouverture"] . "\n");
	$printer1->text("Fermeture : " . $body["fermeture"] . "\n");
	$printer1->text("__________________________________________" . "\n");
	$printer1->feed();

	$printer1->setEmphasis(true);
	foreach ($body["pay_method"] as $key => $method) {

		$printer1->text($method["qt"] . "  X  " . $method["name"] . "             " . $method["prix"] . "€" . "\n");
	}

	$printer1->text("__________________________________________" . "\n");
	$printer1->feed();

	$printer1->setEmphasis(true);
	$printer1->text("Commandes : " . $body["commandes"] . "\n");
	$printer1->text("Clients : " . $body["clients"] . "\n");
	$printer1->text("Ticket moyen : " . $body["ticket_moyen"] . "€\n");
	$printer1->text("__________________________________________" . "\n");
	$printer1->feed();

	$printer1->text("Articles vendus :" . "\n");
	foreach ($body["products"] as $key => $prod) {
		$printer1->text($prod["quantity"] . "  X  " . $prod["name"] . "             " . $prod["totalPrice"] . "€\n");
	}

	$printer1->text("__________________________________________" . "\n");
	$printer1->feed();

	// echo gettype($tvas);
	$tvanew = 0;
	foreach ($tvas as $key => $elem) {
		// // var_dump($elem) ;
		// $d=array_sum($tvas[(float)$key]);
		$printer1->text("TVA(" . $key . "%)    :     " . $elem . "€\n");
		$tvanew = $tvanew + $d;
	}
	$printer1->text("__________________________________________" . "\n");
	$printer1->setTextSize(2, 1);
	$printer1->text("TOTAL HT " . $body["ht"] . "€\n");
	$printer1->text("TOTAL TTC :" . $body["ttc"] . "€\n");
	$printer1->feed();
	$printer1->text("__________________________________________" . "\n");
	$printer1->text("Fond initial:" . $body["fond_initial"] . "€\n");
	$printer1->text("Fond final  :" . $body["fond_final"] . "€\n");
	$printer1->feed(1);
	$printer1->selectPrintMode();

	$printer1->selectPrintMode();
	$printer1->setEmphasis(false);
	$printer1->feed();

	$printer1->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
	$printer1->selectPrintMode();
	/* Footer */
	$printer1->setJustification(Printer::JUSTIFY_CENTER);
	$printer1->text("Date & Heure :" . date("m/d/Y h:i:s a", time()) . "\n");
	$printer1->feed(2);



	/* Barcode Default look */
	$printer1->feed();
	$printer12 = new Printer($connector); // dirty printer profile hack !!

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
// 	$subtotal = new item("Subtotal", "12.95");
// 	$tax = new item("A local tax", "1.30");
// 	$date = date("l jS \of F Y h:i:s A");
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
//    // $printer2->text(new item("", "$"));
//     $printer2->setEmphasis(false);

//     $printer2->selectPrintMode(Printer::MODE_EMPHASIZED);

//     $printer2->selectPrintMode();



//     $printer2->text("__________________________________________\n");
//     $printer2->setEmphasis(true);
//     $printer2->text("Nom du client : ".$extraData["name"]."\n");
//     $printer2->text("Numero Telephone : ".$extraData["tel"]."\n");
//     $printer2->text("Mode de commande : ".translate($extraData["lv"])."\n");
//     $printer2->text("Paiement : ".$extraData["pay"]." €"."\n");

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

// 	$items = array_map( "map_json_to_item_class", $items );
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
//     $printer2->text(date("m/d/Y h:i:s a", time()). "\n");
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


function constructLine($left, $right, $width)
{
	// limit left length
	$leftLength = mb_strlen($left);
	$rightLength 	= mb_strlen($right);

	if ($leftLength > $rightLength) {
		$trim = $width - ($leftLength + $rightLength);
		if ($trim <= 0) {
			$left = substr($left, 0, $width - $rightLength - 4) . "...";
		}
	}

	$leftLength 	= mb_strlen($left);

	return $left . str_repeat(" ", $width - mb_strlen($left) - mb_strlen($right)) . $right;
}

class item
{
	private $name;
	private $price;
	private $dollarSign;
	private $extras;
	private $slots;
	private $count;
	public function __construct($name = "", $count = "", string $price = "", $extras = [], $slots = [], $dollarSign = false)
	{
		$this->name = $name;
		$this->price = $price;
		$this->dollarSign = $dollarSign;
		$this->extras = $extras;
		$this->slots = $slots;
		$this->count = $count;
	}
	public function getAsString($width = 48)
	{
		if ($this->dollarSign || true) {
			$leftCols = $leftCols / 2 - $rightCols / 2;
		}
		$lines = [];
		$mapExtra = function ($extra) {
			return constructLine("       " . $extra["title"], $extra["price"] . "€", 42);
		};
		if ($this->slots) {
			$mapSlots = function ($slot) {
				$mapProducts = function ($product) {
					return constructLine("       " . $product["name"], "", 42);
				};
				return implode("\n", array_map($mapProducts, $slot["products"]));
			};
			$lines  =  array_map($mapSlots, array_values($this->slots));
		} else if ($this->extras && count($this->extras)) {
			$lines = array_map($mapExtra, $this->extras);
		}
		$lines 	= implode("\n", $lines);
		$left 	= (isset($this->count) ? $this->count . " X "  : "")  . $this->name;
		$right 	= $this->price . "€";
		return  constructLine($left, $right, 42) . "\n" . (strlen($lines) ? "$lines\n" : "");
	}
	public function __toString()
	{
		return $this->getAsString();
	}
}

$printer->close();
