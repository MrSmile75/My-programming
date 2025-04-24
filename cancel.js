document.addEventListener('DOMContentLoaded', () => {
    const toggleOptions = document.querySelectorAll('.toggle-option');
    const pricingCards = document.querySelectorAll('.pricing-card .plan-price');

        /* © SMILEX - This code is licensed and protected. */

    toggleOptions.forEach(option => {
        option.addEventListener('click', function() {
            toggleOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

                /* © SMILEX - This code is licensed and protected. */

            const billingType = this.getAttribute('data-billing');

                /* © SMILEX - This code is licensed and protected. */

            pricingCards.forEach(priceElement => {
                const monthlyPrice = priceElement.getAttribute('data-monthly');
                const yearlyPrice = priceElement.getAttribute('data-yearly');
                
                priceElement.textContent = billingType === 'monthly' 
                    ? monthlyPrice 
                    : yearlyPrice;
            });
        });
    });
});

    /* © SMILEX - This code is licensed and protected. */