 class PremiumPage {
            constructor() {
                this.selectedPlan = null;
                this.selectedPaymentMethod = 'visa';
                this.paymentFee = 0;
                this.planPrices = {
                    monthly: 19.99,
                    annual: 46.99,
                    lifetime: 99.99
                };
                this.cryptoAddresses = {
                    bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                    ethereum: '0x742d35Cc6634C0532925a3b8D4C9db96590c4C5d',
                    usdt: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5BNZP3v'
                };
                this.init();
            }

            init() {
                this.setupFormValidation();
                this.setupCardFormatting();
                this.generatePaymentReference();
            }

            selectPlan(planType) {
                this.selectedPlan = planType;
                
                const planDetails = {
                    monthly: { name: 'Beginner', price: '$19.99/month' },
                    annual: { name: 'Pro', price: '$46.99/year (Save 17%)' },
                    lifetime: { name: 'Legend', price: '$99.99 one-time' }
                };

                const plan = planDetails[planType];
                document.getElementById('selected-plan').textContent = `${plan.name} - ${plan.price}`;
                document.getElementById('summary-plan').textContent = plan.name;
                
                this.updateOrderSummary();
                
                // Show payment section
                document.getElementById('payment-section').style.display = 'block';
                
                // Scroll to payment section
                document.getElementById('payment-section').scrollIntoView({ 
                    behavior: 'smooth' 
                });

                this.showNotification(`${plan.name} selected!`, 'success');
            }

            selectPaymentMethod(method, element) {
                this.selectedPaymentMethod = method;
                
                // Update active payment method
                document.querySelectorAll('.payment-method').forEach(el => {
                    el.classList.remove('active');
                });
                element.classList.add('active');

                // Get fee from data attribute
                this.paymentFee = parseFloat(element.getAttribute('data-fee')) || 0;
                
                // Show appropriate form section
                this.showPaymentForm(method);
                this.updateOrderSummary();
            }

            showPaymentForm(method) {
                // Hide all payment forms
                document.querySelectorAll('.payment-form-section').forEach(section => {
                    section.style.display = 'none';
                });

                // Show appropriate form based on payment method
                if (['visa', 'mastercard', 'amex'].includes(method)) {
                    document.getElementById('card-details').style.display = 'block';
                } else if (['zeepay', 'mpesa', 'mtn', 'airtel'].includes(method)) {
                    document.getElementById('mobile-money-details').style.display = 'block';
                } else if (['bitcoin', 'ethereum', 'usdt'].includes(method)) {
                    document.getElementById('crypto-details').style.display = 'block';
                    this.setupCryptoPayment(method);
                } else if (['banktransfer', 'wise'].includes(method)) {
                    document.getElementById('bank-details').style.display = 'block';
                }
            }

            setupCryptoPayment(cryptoType) {
                const address = this.cryptoAddresses[cryptoType];
                const amount = this.calculateCryptoAmount(cryptoType);
                
                document.getElementById('crypto-address').value = address;
                document.getElementById('crypto-amount').textContent = `${amount} ${cryptoType.toUpperCase()}`;
                
                // Generate QR code (simplified representation)
                document.getElementById('qr-code').innerHTML = `
                    <div style="font-size: 12px;">
                        QR Code for<br>
                        ${cryptoType.toUpperCase()}<br>
                        Payment
                    </div>
                `;
            }

            calculateCryptoAmount(cryptoType) {
                const baseAmount = this.planPrices[this.selectedPlan];
                // Simplified crypto conversion (in real app, use live rates)
                const rates = {
                    bitcoin: 0.000023, // Example rate
                    ethereum: 0.00041,
                    usdt: 1.0
                };
                return (baseAmount * rates[cryptoType]).toFixed(6);
            }

            copyAddress() {
                const addressInput = document.getElementById('crypto-address');
                addressInput.select();
                document.execCommand('copy');
                this.showNotification('Address copied to clipboard!', 'success');
            }

            updateOrderSummary() {
                if (!this.selectedPlan) return;

                const basePrice = this.planPrices[this.selectedPlan];
                const fee = (basePrice * this.paymentFee / 100);
                const total = basePrice + fee;

                document.getElementById('summary-fee').textContent = `$${fee.toFixed(2)}`;
                document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
            }

            generatePaymentReference() {
                const reference = 'CV-' + Date.now().toString().slice(-8);
                const refElement = document.getElementById('payment-reference');
                if (refElement) {
                    refElement.textContent = reference;
                }
            }

            setupFormValidation() {
                const form = document.getElementById('payment-form');
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.processPayment();
                });
            }

            setupCardFormatting() {
                // Format card number input
                const cardNumberInput = document.getElementById('card-number');
                if (cardNumberInput) {
                    cardNumberInput.addEventListener('input', (e) => {
                        let value = e.target.value.replace(/\s/g, '');
                        let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
                        e.target.value = formattedValue;
                    });
                }

                // Format expiry date input
                const expiryInput = document.getElementById('expiry-date');
                if (expiryInput) {
                    expiryInput.addEventListener('input', (e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                        e.target.value = value;
                    });
                }

                // Format mobile number
                const mobileInput = document.getElementById('mobile-number');
                if (mobileInput) {
                    mobileInput.addEventListener('input', (e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.startsWith('233')) {
                            value = '+' + value;
                        } else if (!value.startsWith('+')) {
                            value = '+233' + value;
                        }
                        e.target.value = value;
                    });
                }
            }

            processPayment() {
                // Show loading state
                const submitBtn = document.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
                submitBtn.disabled = true;

                // Collect payment data
                const paymentData = this.collectPaymentData();
                
                // Simulate payment processing with different methods
                this.simulatePaymentProcessing(paymentData)
                    .then((result) => {
                        if (result.success) {
                            // Set premium status
                            localStorage.setItem('isPremium', 'true');
                            localStorage.setItem('premiumPlan', this.selectedPlan);
                            localStorage.setItem('premiumActivated', new Date().toISOString());
                            localStorage.setItem('paymentMethod', this.selectedPaymentMethod);

                            // Show success modal
                            document.getElementById('success-modal').classList.add('show');
                            this.showNotification('Payment successful!', 'success');
                        } else {
                            this.showNotification('Payment failed. Please try again.', 'error');
                        }
                    })
                    .catch((error) => {
                        console.error('Payment error:', error);
                        this.showNotification('Payment processing error. Please try again.', 'error');
                    })
                    .finally(() => {
                        // Reset button
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    });
            }

            collectPaymentData() {
                const data = {
                    plan: this.selectedPlan,
                    paymentMethod: this.selectedPaymentMethod,
                    amount: this.planPrices[this.selectedPlan],
                    fee: (this.planPrices[this.selectedPlan] * this.paymentFee / 100),
                    email: document.getElementById('email')?.value,
                    firstName: document.getElementById('first-name')?.value,
                    lastName: document.getElementById('last-name')?.value,
                    country: document.getElementById('country')?.value
                };

                // Add method-specific data
                if (['visa', 'mastercard', 'amex'].includes(this.selectedPaymentMethod)) {
                    data.cardData = {
                        number: document.getElementById('card-number')?.value,
                        name: document.getElementById('cardholder-name')?.value,
                        expiry: document.getElementById('expiry-date')?.value,
                        cvv: document.getElementById('cvv')?.value
                    };
                } else if (['zeepay', 'mpesa', 'mtn', 'airtel'].includes(this.selectedPaymentMethod)) {
                    data.mobileData = {
                        number: document.getElementById('mobile-number')?.value,
                        provider: document.getElementById('network-provider')?.value
                    };
                } else if (['bitcoin', 'ethereum', 'usdt'].includes(this.selectedPaymentMethod)) {
                    data.cryptoData = {
                        txHash: document.getElementById('tx-hash')?.value,
                        address: document.getElementById('crypto-address')?.value
                    };
                }

                return data;
            }

            async simulatePaymentProcessing(paymentData) {
                // Simulate different processing times and success rates for different methods
                const processingTime = {
                    visa: 2000,
                    mastercard: 2000,
                    amex: 3000,
                    paypal: 1500,
                    zeepay: 4000,
                    mpesa: 3500,
                    mtn: 4000,
                    airtel: 4000,
                    bitcoin: 8000,
                    ethereum: 6000,
                    usdt: 5000,
                    banktransfer: 1000
                };

                const time = processingTime[paymentData.paymentMethod] || 3000;

                return new Promise((resolve) => {
                    setTimeout(() => {
                        // Simulate 95% success rate
                        const success = Math.random() > 0.05;
                        resolve({ 
                            success, 
                            transactionId: 'TXN_' + Date.now(),
                            paymentData 
                        });
                    }, time);
                });
            }

            goToMovie() {
                // Redirect back to the movie player
                window.location.href = 'watch.html';
            }

            showNotification(message, type = 'success') {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: ${type === 'success' ? '#46d369' : '#e50914'};
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    max-width: 300px;
                `;
                notification.textContent = message;
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                }, 4000);
            }
        }

        // Initialize the premium page
        const premiumPage = new PremiumPage();

        // Check if user is already premium
        if (localStorage.getItem('isPremium') === 'true') {
            document.querySelector('.hero-description').textContent = 
                'You are already a premium member! Enjoy unlimited 4K downloads and ad-free streaming.';
            
            // Hide pricing cards and show different content
            document.querySelector('.pricing-section').innerHTML = `
                <h2 class="section-title">You're Already Premium!</h2>
                <div style="text-align: center; padding: 50px;">
                    <div style="font-size: 60px; color: var(--premium-color); margin-bottom: 20px;">
                        <i class="fas fa-crown"></i>
                    </div>
                    <h3 style="font-size: 24px; margin-bottom: 15px;">Premium Member</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 30px;">
                        You have access to all premium features. Go back and enjoy your movie!
                    </p>
                    <button class="pricing-button primary" onclick="window.location.href='watch.html'">
                        <i class="fas fa-play"></i> Back to Movie
                    </button>
                </div>
            `;
        };

            // Prevent right-click (optional)
        document.addEventListener('contextmenu', e => e.preventDefault());