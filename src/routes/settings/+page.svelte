<script>
  import { client } from "$lib/appwrite";
  import { Databases } from "appwrite";
  import { onMount } from "svelte";

  let businessName = '';
  let businessAddress = '';
  let businessEmail = '';
  let businessPhone = '';
  let terms = '';
  let invoiceFooterText = '';
  let invoiceHeaderText = '';

  const databases = new Databases(client);

  onMount(async () => {
    try {
      const settings = [
        'businessName',
        'businessAddress',
        'businessEmail',
        'businessPhone',
        'terms',
        'invoiceFooterText',
        'invoiceHeaderText'
      ];

      for (const settingName of settings) {
        try {
          const document = await databases.getDocument(
            'PriceCalc', // Your database ID
            '6764017a0022b1452098', // Your collection ID
            settingName // Document ID
          );

          // Assign the fetched value to the corresponding variable
          if (document) {
            switch (settingName) {
              case 'businessName':
                businessName = document.value;
                break;
              case 'businessAddress':
                businessAddress = document.value;
                break;
              case 'businessEmail':
                businessEmail = document.value;
                break;
              case 'businessPhone':
                businessPhone = document.value;
                break;
              case 'terms':
                terms = document.value;
                break;
              case 'invoiceFooterText':
                invoiceFooterText = document.value;
                break;
              case 'invoiceHeaderText':
                invoiceHeaderText = document.value;
                break;
            }
          }
        } catch (error) {
          if (error.code !== 404) {
            console.error(`Error fetching ${settingName}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  });

  async function saveSettings() {
    try {
      const settings = [
        { name: 'businessName', value: businessName },
        { name: 'businessAddress', value: businessAddress },
        { name: 'businessEmail', value: businessEmail },
        { name: 'businessPhone', value: businessPhone },
        { name: 'terms', value: terms },
        { name: 'invoiceFooterText', value: invoiceFooterText },
        { name: 'invoiceHeaderText', value: invoiceHeaderText }
      ];
        console.log(settings);
      for (const setting of settings) {
        try {
          // Check if the document already exists
          const existingDocument = await databases.getDocument(
            'PriceCalc', // Your database ID
            '6764017a0022b1452098', // Your collection ID
            setting.name // Document ID
          );

          // If it exists, update the document
          await databases.updateDocument(
            'PriceCalc',
            '6764017a0022b1452098',
            setting.name,
            setting
          );
        } catch (error) {
          // If the document does not exist, create a new one
          if (error.code === 404) {
            await databases.createDocument(
              'PriceCalc',
              '6764017a0022b1452098',
              setting.name,
              setting
            );
          } else {
            throw error; // Re-throw if it's a different error
          }
        }
      }
      console.log('All settings saved successfully.');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Call saveSettings when settings are updated
//   $: saveSettings();
</script>

<main>
  <h1 class="text-2xl font-bold mb-4">Instellingen</h1>
  
  <section>
    <h2>Business Information</h2>
    <label>
      Bedrijfsnaam:
      <input type="text" bind:value={businessName} />
    </label>
    <label>
      Adres:
      <input type="text" bind:value={businessAddress} />
    </label>
    <label>
      Email:
      <input type="email" bind:value={businessEmail} />
    </label>
    <label>
      Telefoon:
      <input type="tel" bind:value={businessPhone} />
    </label>
  </section>

  <section>
    <h2>Algemene voorwaarden</h2>
    <textarea bind:value={terms} rows="5"></textarea>
  </section>

  <section>
    <h2>Factuur tekst</h2>
    <label>
      Text boven factuur:
      <textarea bind:value={invoiceHeaderText} rows="3"></textarea>
    </label>
    <label>
      Text onder factuur:
      <textarea bind:value={invoiceFooterText} rows="3"></textarea>
    </label>
  </section>
</main>

<button on:click={saveSettings}>Opslaan</button>
<style>
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }
  section {
    margin-bottom: 2rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  input, textarea {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 2px solid black;
    background-color: #f8f9fa;
    font-size: 1rem;
  }
</style>
