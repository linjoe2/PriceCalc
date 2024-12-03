<script>
import { Databases, ID } from "appwrite";
import { client } from "$lib/appwrite";

const databases = new Databases(client);
const databaseId = 'PriceCalc'; // Your database ID
const collectionId = '6735eb1000013509eaf3'; // Your collection ID


let services = {
    "Dakbedekking & Isolatie": [
      {
        "subcategory": "Dakbedekking vernieuwen",
        "type": "Zonder isolatie",
        "price": "110",
        "unit": "m²"
      },
      {
        "subcategory": "Dakbedekking vernieuwen",
        "type": "8cm Pir",
        "price": "130",
        "unit": "m²"
      },
      {
        "subcategory": "Dakbedekking vernieuwen",
        "type": "10cm Pir",
        "price": "140",
        "unit": "m²"
      },
      {
        "subcategory": "Dakbedekking vernieuwen",
        "type": "14cm Pir",
        "price": "150",
        "unit": "m²"
      },
      {
        "subcategory": "Dakbedekking overlagen",
        "type": "Standaard",
        "price": "90",
        "min": "1100",
        "unit": "m²"
      }
    ],
    "Dakdoorvoeren & Lichttoetreding": [
      {
        "subcategory": "Koepels",
        "type": "custom",
        "price": "custom",
        "unit": "custom"
      },
      {
        "subcategory": "Lichtstraat",
        "type": "custom",
        "price": "custom",
        "unit": "custom"
      },
      {
        "subcategory": "Kantelraam",
        "type": "custom",
        "price": "custom",
        "unit": "custom"
      }
    ],
    "Dakrand & Afwerking": [
      {
        "subcategory": "Boeidelen hout",
        "type": "Standaard",
        "price": "200",
        "unit": "m¹"
      },
      {
        "subcategory": "Boeidelen kunststof",
        "type": "Standaard",
        "price": "200",
        "unit": "m¹"
      },
      {
        "subcategory": "Verhogen dakrand",
        "type": "Standaard",
        "price": "100",
        "unit": "m¹"
      },
      {
        "subcategory": "Vervangen trim",
        "type": "Standaard",
        "price": "100",
        "unit": "m¹"
      },
         {
        "subcategory": "Zink deklijst",
        "type": "Standaard",
        "price": "50",
        "unit": "m¹"
      }
    ],
    "Dakrenovatie & Shingles": [
      {
        "subcategory": "Shinglewerk",
        "type": "Standaard",
        "price": "120",
        "unit": "m²"
      }
    ],
    "Hemelwaterafvoer & Goten": [
      {
        "subcategory": "Hemelwaterafvoer ZINK",
        "type": "Standaard",
        "price": "150",
        "unit": "m¹"
      },
      {
        "subcategory": "Hemelwaterafvoer PVC",
        "type": "Standaard",
        "price": "100",
        "unit": "m¹"
      },
      {
        "subcategory": "Zinken dakgoten",
        "type": "Uitslag <1m",
        "price": "200",
        "unit": "m¹"
      },
      {
        "subcategory": "Zinken dakgoten",
        "type": "Uitslag >1m",
        "price": "300",
        "unit": "m¹"
      },
      {
        "subcategory": "Zinken borstwering",
        "type": "Standaard",
        "price": "250",
        "unit": "m¹"
      },
      {
        "subcategory": "Zinkwerk dakkapel",
        "type": "custom",
        "price": "custom",
        "unit": "custom"
      }
    ],
    "Groendak & Sedum": [
      {
        "subcategory": "Sedum beplanting",
        "type": "Standaard",
        "price": "200",
        "unit": "m²"
      }
    ],
    "Nokvorsten & Loodwerk": [
      {
        "subcategory": "Nokvorsten",
        "type": "Volledig vervangen",
        "price": "450",
        "unit": "m¹"
      },
      {
        "subcategory": "Nokvorsten",
        "type": "Schoonmaken & herstellen",
        "price": "150",
        "unit": "m¹"
      },
      {
        "subcategory": "Nokvorsten",
        "type": "Verwijderen & terugplaatsen",
        "price": "100",
        "unit": "m¹"
      },
      {
        "subcategory": "Voeglood vervangen",
        "type": "Standaard",
        "price": "100",
        "unit": "m¹"
      }
    ],
    "Schoorstenen & Metselwerk": [
      {
        "subcategory": "Schoorstenen renovatie",
        "type": "Klein",
        "price": "1450",
        "unit": "custom"
      },
      {
        "subcategory": "Schoorstenen renovatie",
        "type": "Middel",
        "price": "1850",
        "unit": "custom"
      },
      {
        "subcategory": "Schoorstenen renovatie",
        "type": "Groot",
        "price": "2250",
        "unit": "custom"
      },
      {
        "subcategory": "Schoorsteen vernieuwen",
        "type": "custom",
        "price": "custom",
        "unit": "custom"
      },
      {
        "subcategory": "Schoorsteen verwijderen",
        "type": "Standaard",
        "price": "2500",
        "unit": "custom"
      }
    ],
    "Dakterrassen & Vlonders": [
      {
        "subcategory": "Houten dakterras",
        "type": "Standaard",
        "price": "270",
        "unit": "m²"
      },
      {
        "subcategory": "Composiet dakterras",
        "type": "Standaard",
        "price": "270",
        "unit": "m²"
      }
    ]
  }

async function uploadServices() {
    try {
        for (const [category, serviceList] of Object.entries(services)) {
            for (const service of serviceList) {
                const response = await databases.createDocument(databaseId, collectionId, 'unique()', {
                    subcategory: service.subcategory,
                    type: service.type,
                    price: parseInt(service.price),
                    unit: service.unit,
                    category: category // Optionally include the category
                });
                console.log('Service uploaded successfully:', response);
            }
        }
        console.log('All services uploaded successfully.');
    } catch (error) {
        console.error('Error uploading services:', error);
    }
}

</script>

// Add a button to trigger the upload
<button on:click={uploadServices}>Upload All Services</button>
