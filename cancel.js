document.addEventListener('DOMContentLoaded', () => {
    const toggleOptions = document.querySelectorAll('.toggle-option');
    const pricingCards = document.querySelectorAll('.pricing-card .plan-price');

    toggleOptions.forEach(option => {
        option.addEventListener('click', function() {
            toggleOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            const billingType = this.getAttribute('data-billing');

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