<script>
    export let totalPrice = 0;
    export let paymentSchedule = {
        initial: 50,
        during: 30,
        threequarters: 15,
        final: 5
    };
    export let isAdmin = false;

    let btw21 = 0.21;

    // Add function to automatically set payment schedule based on price
    $: {
        if (totalPrice <= 4000) {
            paymentSchedule = {
                initial: 0,
                during: 0,
                threequarters: 0,
                final: 100
            };
        } else if (totalPrice <= 15000) {
            paymentSchedule = {
                initial: 50,
                during: 0,
                threequarters: 0,
                final: 50
            };
        } else if (totalPrice <= 40000) {
            paymentSchedule = {
                initial: 50,
                during: 45,
                threequarters: 0,
                final: 5
            };
        } else if (totalPrice <= 1000000) {
            paymentSchedule = {
                initial: 40,
                during: 30,
                threequarters: 25,
                final: 5
            };
        }
    }

    function adjustPercentages(changed, value) {
        paymentSchedule[changed] = value;
        
        // Ensure total is 100%
        const total = Object.values(paymentSchedule).reduce((sum, val) => sum + val, 0);
        if (total !== 100) {
            // Adjust other values proportionally
            const others = Object.keys(paymentSchedule).filter(key => key !== changed);
            const remaining = 100 - value;
            const currentOthersTotal = others.reduce((sum, key) => sum + paymentSchedule[key], 0);
            
            others.forEach(key => {
                if (currentOthersTotal > 0) {
                    paymentSchedule[key] = Math.round((paymentSchedule[key] / currentOthersTotal) * remaining);
                } else {
                    paymentSchedule[key] = Math.round(remaining / others.length);
                }
            });
        }
        // Trigger reactivity
        paymentSchedule = paymentSchedule;
    }
</script>

<div class="payment-schedule">
    {#if isAdmin}
    <div class="sliders">
        <label>
            Bij opdracht: {paymentSchedule.initial}%
            <input 
                type="range" 
                min="0" 
                max="100" 
                bind:value={paymentSchedule.initial}
                on:input={() => adjustPercentages('initial', paymentSchedule.initial)}
            />
        </label>
        <label>
            Tijdens werkzaamheden: {paymentSchedule.during}%
            <input 
                type="range" 
                min="0" 
                max="100" 
                bind:value={paymentSchedule.during}
                on:input={() => adjustPercentages('during', paymentSchedule.during)}
            />
        </label>
        <label>
            Bij driekwart gereed: {paymentSchedule.threequarters}%
            <input 
                type="range" 
                min="0" 
                max="100" 
                bind:value={paymentSchedule.threequarters}
                on:input={() => adjustPercentages('threequarters', paymentSchedule.threequarters)}
            />
        </label>
        <label>
            Bij oplevering: {paymentSchedule.final}%
            <input 
                type="range" 
                min="0" 
                max="100" 
                bind:value={paymentSchedule.final}
                on:input={() => adjustPercentages('final', paymentSchedule.final)}
            />
        </label>
    </div>
    {/if}
    <div class="table-wrapper">
        <table>
            <thead class="desktop-only">
                <tr>
                    <th>Betalingscondities *</th>
                    <th>Excl. BTW</th>
                    <th>21% BTW</th>
                    <th>Incl. BTW</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td data-label="Betalingscondities">Bij opdracht ({paymentSchedule.initial}%)</td>
                    <td data-label="Excl. BTW">€ {(totalPrice * paymentSchedule.initial / 100).toFixed(2)}</td>
                    <td data-label="21% BTW">€ {(totalPrice * paymentSchedule.initial / 100 * btw21).toFixed(2)}</td>
                    <td data-label="Incl. BTW">€ {(totalPrice * paymentSchedule.initial / 100 * (1 + btw21)).toFixed(2)}</td>
                </tr>
                <tr>
                    <td data-label="Betalingscondities">Tijdens werkzaamheden ({paymentSchedule.during}%)</td>
                    <td data-label="Excl. BTW">€ {(totalPrice * paymentSchedule.during / 100).toFixed(2)}</td>
                    <td data-label="21% BTW">€ {(totalPrice * paymentSchedule.during / 100 * btw21).toFixed(2)}</td>
                    <td data-label="Incl. BTW">€ {(totalPrice * paymentSchedule.during / 100 * (1 + btw21)).toFixed(2)}</td>
                </tr>
                <tr>
                    <td data-label="Betalingscondities">Bij driekwart gereed ({paymentSchedule.threequarters}%)</td>
                    <td data-label="Excl. BTW">€ {(totalPrice * paymentSchedule.threequarters / 100).toFixed(2)}</td>
                    <td data-label="21% BTW">€ {(totalPrice * paymentSchedule.threequarters / 100 * btw21).toFixed(2)}</td>
                    <td data-label="Incl. BTW">€ {(totalPrice * paymentSchedule.threequarters / 100 * (1 + btw21)).toFixed(2)}</td>
                </tr>
                <tr>
                    <td data-label="Betalingscondities">Bij oplevering ({paymentSchedule.final}%)</td>
                    <td data-label="Excl. BTW">€ {(totalPrice * paymentSchedule.final / 100).toFixed(2)}</td>
                    <td data-label="21% BTW">€ {(totalPrice * paymentSchedule.final / 100 * btw21).toFixed(2)}</td>
                    <td data-label="Incl. BTW">€ {(totalPrice * paymentSchedule.final / 100 * (1 + btw21)).toFixed(2)}</td>
                </tr>
                <tr class="total">
                    <td data-label="Betalingscondities">Totaal:</td>
                    <td data-label="Excl. BTW">€ {totalPrice.toFixed(2)}</td>
                    <td data-label="21% BTW">€ {(totalPrice * btw21).toFixed(2)}</td>
                    <td data-label="Incl. BTW">€ {(totalPrice * (1 + btw21)).toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    </div>

 
</div>

<style>
    .payment-schedule {
        margin: 2rem 0;
    }
    
    .table-wrapper {
        width: 100%;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
    }
    
    th, td {
        padding: 0.75rem;
        text-align: right;
        border: 1px solid #ddd;
    }
    
    th:first-child, td:first-child {
        text-align: left;
    }
    
    th {
        background-color: #f5f5f5;
        font-weight: bold;
    }
    
    .total {
        font-weight: bold;
        background-color: #f9f9f9;
    }
    
    .sliders {
        margin-top: 2rem;
    }
    
    .sliders label {
        display: block;
        margin-bottom: 1rem;
    }
    
    input[type="range"] {
        width: 100%;
        max-width: 300px;
        margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
        .desktop-only {
            display: none;
        }

        table, tbody, tr, td {
            display: block;
            width: 100%;
        }

        tr {
            margin-bottom: 1rem;
            border: 1px solid #ddd;
        }

        td {
            text-align: right;
            padding-left: 50%;
            position: relative;
            border: none;
            border-bottom: 1px solid #ddd;
        }

        td:last-child {
            border-bottom: none;
        }

        td::before {
            content: attr(data-label);
            position: absolute;
            left: 0.75rem;
            width: 45%;
            text-align: left;
            font-weight: bold;
        }

        .total td {
            background-color: #f9f9f9;
        }
    }
</style>
