<script>
    export let totalPrice = 0;
    export let paymentSchedule = {
        initial: 50,
        during: 45,
        final: 5
    };

    let btw21 = 0.21;

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
    <table>
        <thead>
            <tr>
                <th>Betalingscondities *</th>
                <th>Excl. BTW</th>
                <th>9% BTW</th>
                <th>21% BTW</th>
                <th>Incl. BTW</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Bij opdracht ({paymentSchedule.initial}%)</td>
                <td>€ {(totalPrice * paymentSchedule.initial / 100).toFixed(2)}</td>
                <td>€ 0,00</td>
                <td>€ {(totalPrice * paymentSchedule.initial / 100 * btw21).toFixed(2)}</td>
                <td>€ {(totalPrice * paymentSchedule.initial / 100 * (1 + btw21)).toFixed(2)}</td>
            </tr>
            <tr>
                <td>Tijdens werkzaamheden ({paymentSchedule.during}%)</td>
                <td>€ {(totalPrice * paymentSchedule.during / 100).toFixed(2)}</td>
                <td>€ 0,00</td>
                <td>€ {(totalPrice * paymentSchedule.during / 100 * btw21).toFixed(2)}</td>
                <td>€ {(totalPrice * paymentSchedule.during / 100 * (1 + btw21)).toFixed(2)}</td>
            </tr>
            <tr>
                <td>Bij oplevering ({paymentSchedule.final}%)</td>
                <td>€ {(totalPrice * paymentSchedule.final / 100).toFixed(2)}</td>
                <td>€ 0,00</td>
                <td>€ {(totalPrice * paymentSchedule.final / 100 * btw21).toFixed(2)}</td>
                <td>€ {(totalPrice * paymentSchedule.final / 100 * (1 + btw21)).toFixed(2)}</td>
            </tr>
            <tr class="total">
                <td>Totaal:</td>
                <td>€ {totalPrice.toFixed(2)}</td>
                <td>€ 0,00</td>
                <td>€ {(totalPrice * btw21).toFixed(2)}</td>
                <td>€ {(totalPrice * (1 + btw21)).toFixed(2)}</td>
            </tr>
        </tbody>
    </table>

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
</div>

<style>
    .payment-schedule {
        margin: 2rem 0;
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
</style>
