<script>
import { onMount } from 'svelte';

let selectedCategory = '';

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

// New variables for the editor
let newService = {
    subcategory: '',
    type: '',
    price: '',
    unit: ''
};

function addService(category) {
    if (newService.subcategory && newService.type && newService.price && newService.unit) {
        services[category].push({ ...newService });
        resetNewService();
    }
}

function resetNewService() {
    newService = {
        subcategory: '',
        type: '',
        price: '',
        unit: ''
    };
}

// Function to update an existing service
function updateService(category, index, updatedService) {
    services[category][index] = updatedService;
}

// Function to delete a service
function deleteService(category, index) {
    services[category].splice(index, 1);
}
</script>

<!-- New HTML for the editor -->
<div>
    <h2>Add New Service</h2>
    <select bind:value={selectedCategory}>
        {#each Object.keys(services) as category}
            <option value={category}>{category}</option>
        {/each}
    </select>
    <input type="text" placeholder="Subcategory" bind:value={newService.subcategory} />
    <input type="text" placeholder="Type" bind:value={newService.type} />
    <input type="number" placeholder="Price" bind:value={newService.price} />
    <select bind:value={newService.unit}>
        <option value="m¹">m¹</option>
        <option value="m²">m²</option>
        <option value="custom">stuk</option>
    </select>
    <button on:click={() => addService(selectedCategory)}>Add Service</button>
</div>

<!-- Display existing services in a table with an edit button -->
{#each Object.entries(services) as [category, serviceList]}
    <h3>{category}</h3>
    <table>
        <thead>
            <tr>
                <th>Subcategory</th>
                <th>Type</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Edit</th>
            </tr>
        </thead>
        <tbody>
            {#each serviceList as service, index}
                <tr>
                    <td>{service.subcategory}</td>
                    <td>{service.type}</td>
                    <td>{service.price}</td>
                    <td>{service.unit}</td>
                    <td><button on:click={() => editService(category, index, service)}>Edit</button></td>
                </tr>
            {/each}
        </tbody>
    </table>
{/each}