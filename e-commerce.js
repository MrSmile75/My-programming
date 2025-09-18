  // Firebase Configuration
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "smile-xplorer.firebaseapp.com",
            projectId: "smile-xplorer",
            storageBucket: "smile-xplorer.appspot.com",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();
        const storage = firebase.storage();
        const realtimeDb = firebase.database();

        // Enable Firestore persistence
        db.enablePersistence()
            .catch((err) => {
                console.error("Server persistence failed: ", err);
            });

        // Global Variables
        let currentUser = {
            id: null,
            name: 'Guest User',
            email: null,
            businessName: '',
            location: 'Global',
            isOnline: true,
            isPremium: false,
            reports: 0,
            bannedUntil: null
        };

        let allProducts = [];
        let displayedProducts = [];
        let cart = [];
        let currentPage = 1;
        let productsPerPage = 12;
        let isLoading = false;
        let hasMoreProducts = true;
        let currentFilters = {
            category: 'all',
            minPrice: null,
            maxPrice: null,
            location: '',
            condition: '',
            sortBy: 'newest',
            searchQuery: ''
        };

        // Sample product categories and data
        const categories = [
            'electronics', 'fashion', 'home', 'sports', 'books', 
            'automotive', 'beauty', 'toys', 'music', 'food'
        ];

        const locations = [
       [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'CD', name: 'Congo (Democratic Republic)', flag: '🇨🇩' },
  { code: 'CG', name: 'Congo (Republic)', flag: '🇨🇬' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'CI', name: 'Côte d’Ivoire', flag: '🇨🇮' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
{ code: 'FI', name: 'Finland', flag: '🇫🇮' },
{ code: 'FR', name: 'France', flag: '🇫🇷' },
{ code: 'GA', name: 'Gabon', flag: '🇬🇦' },
{ code: 'GM', name: 'Gambia', flag: '🇬🇲' },
{ code: 'GE', name: 'Georgia', flag: '🇬🇪' },
{ code: 'DE', name: 'Germany', flag: '🇩🇪' },
{ code: 'GH', name: 'Ghana', flag: '🇬🇭' },
{ code: 'GR', name: 'Greece', flag: '🇬🇷' },
{ code: 'GD', name: 'Grenada', flag: '🇬🇩' },
{ code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
{ code: 'GN', name: 'Guinea', flag: '🇬🇳' },
{ code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
{ code: 'GY', name: 'Guyana', flag: '🇬🇾' },
{ code: 'HT', name: 'Haiti', flag: '🇭🇹' },
{ code: 'HN', name: 'Honduras', flag: '🇭🇳' },
{ code: 'HU', name: 'Hungary', flag: '🇭🇺' },
{ code: 'IS', name: 'Iceland', flag: '🇮🇸' },
{ code: 'IN', name: 'India', flag: '🇮🇳' },
{ code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
{ code: 'IR', name: 'Iran', flag: '🇮🇷' },
{ code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
{ code: 'IE', name: 'Ireland', flag: '🇮🇪' },
{ code: 'IL', name: 'Israel', flag: '🇮🇱' },
{ code: 'IT', name: 'Italy', flag: '🇮🇹' },
{ code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
{ code: 'JP', name: 'Japan', flag: '🇯🇵' },
{ code: 'JO', name: 'Jordan', flag: '🇯🇴' },
{ code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
{ code: 'KE', name: 'Kenya', flag: '🇰🇪' },
{ code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
{ code: 'KP', name: 'Korea (North)', flag: '🇰🇵' },
{ code: 'KR', name: 'Korea (South)', flag: '🇰🇷' },
{ code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
{ code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
{ code: 'LA', name: 'Laos', flag: '🇱🇦' },
{ code: 'LV', name: 'Latvia', flag: '🇱🇻' },
{ code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
{ code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
{ code: 'LR', name: 'Liberia', flag: '🇱🇷' },
{ code: 'LY', name: 'Libya', flag: '🇱🇾' },
{ code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
{ code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
{ code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
{ code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
{ code: 'MW', name: 'Malawi', flag: '🇲🇼' },
{ code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
{ code: 'MV', name: 'Maldives', flag: '🇲🇻' },
{ code: 'ML', name: 'Mali', flag: '🇲🇱' },
{ code: 'MT', name: 'Malta', flag: '🇲🇹' },
{ code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
{ code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
{ code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
{ code: 'MX', name: 'Mexico', flag: '🇲🇽' },
{ code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
{ code: 'MD', name: 'Moldova', flag: '🇲🇩' },
{ code: 'MC', name: 'Monaco', flag: '🇲🇨' },
{ code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
{ code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
{ code: 'MA', name: 'Morocco', flag: '🇲🇦' },
{ code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
{ code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
{ code: 'NA', name: 'Namibia', flag: '🇳🇦' },
{ code: 'NR', name: 'Nauru', flag: '🇳🇷' },
{ code: 'NP', name: 'Nepal', flag: '🇳🇵' },
{ code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
{ code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
{ code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
{ code: 'NE', name: 'Niger', flag: '🇳🇪' },
{ code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
{ code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
{ code: 'NO', name: 'Norway', flag: '🇳🇴' },
{ code: 'OM', name: 'Oman', flag: '🇴🇲' },
{ code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
{ code: 'PW', name: 'Palau', flag: '🇵🇼' },
{ code: 'PA', name: 'Panama', flag: '🇵🇦' },
{ code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
{ code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
{ code: 'PE', name: 'Peru', flag: '🇵🇪' },
{ code: 'PH', name: 'Philippines', flag: '🇵🇭' },
{ code: 'PL', name: 'Poland', flag: '🇵🇱' },
{ code: 'PT', name: 'Portugal', flag: '🇵🇹' },
{ code: 'QA', name: 'Qatar', flag: '🇶🇦' },
{ code: 'RO', name: 'Romania', flag: '🇷🇴' },
{ code: 'RU', name: 'Russia', flag: '🇷🇺' },
{ code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
{ code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
{ code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
{ code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
{ code: 'WS', name: 'Samoa', flag: '🇼🇸' },
{ code: 'SM', name: 'San Marino', flag: '🇸🇲' },
{ code: 'ST', name: 'Sao Tome and Principe', flag: '🇸🇹' },
{ code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
{ code: 'SN', name: 'Senegal', flag: '🇸🇳' },
{ code: 'RS', name: 'Serbia', flag: '🇷🇸' },
{ code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
{ code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
{ code: 'SG', name: 'Singapore', flag: '🇸🇬' },
{ code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
{ code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
{ code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
{ code: 'SO', name: 'Somalia', flag: '🇸🇴' },
{ code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
{ code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
{ code: 'ES', name: 'Spain', flag: '🇪🇸' },
{ code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
{ code: 'SD', name: 'Sudan', flag: '🇸🇩' },
{ code: 'SR', name: 'Suriname', flag: '🇸🇷' },
{ code: 'SE', name: 'Sweden', flag: '🇸🇪' },
{ code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
{ code: 'SY', name: 'Syria', flag: '🇸🇾' },
{ code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
{ code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
{ code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
{ code: 'TH', name: 'Thailand', flag: '🇹🇭' },
{ code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
{ code: 'TG', name: 'Togo', flag: '🇹🇬' },
{ code: 'TO', name: 'Tonga', flag: '🇹🇴' },
{ code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
{ code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
{ code: 'TR', name: 'Turkey', flag: '🇹🇷' },
{ code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
{ code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
{ code: 'UG', name: 'Uganda', flag: '🇺🇬' },
{ code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
{ code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
{ code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
{ code: 'US', name: 'United States', flag: '🇺🇸' },
{ code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
{ code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
{ code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
{ code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
{ code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
{ code: 'YE', name: 'Yemen', flag: '🇾🇪' },
{ code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
{ code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' }

]

        ];

        // Initialize App
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        function initializeApp() {
            console.log('🚀 Initializing Smile Xplorer ');
            
            // Check if user has accepted rules
            if (!localStorage.getItem('rulesAccepted')) {
                document.getElementById('rulesBanner').style.display = 'flex';
            } else {
                document.getElementById('rulesBanner').style.display = 'none';
            }
            
            // Check authentication state
            auth.onAuthStateChanged((user) => {
                if (user) {
                    // User is signed in
                    currentUser.id = user.uid;
                    currentUser.email = user.email;
                    currentUser.name = user.displayName || 'User';
                    
                    // Load user data from Firestore
                    loadUserData();
                    
                    // Set up real-time listeners
                    setupRealTimeListeners();
                } else {
                    // User is signed out
                    showNotification('Please sign in to access all features', 'info');
                }
                
                // Hide page loader
                setTimeout(() => {
                    document.getElementById('pageLoader').classList.add('hidden');
                }, 1000);
            });
            
            // Setup event listeners
            setupEventListeners();
            
            // Load products
            loadProducts();
            
            // Update cart UI
            updateCartUI();
            
            // Update stats
            updateStats();
            
            console.log('✅ Smile Xplorer initialized successfully!');
        }

        function loadUserData() {
            // Load user data from Firestore
            db.collection('users').doc(currentUser.id).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        currentUser.businessName = userData.businessName || '';
                        currentUser.location = userData.location || 'Global';
                        currentUser.isPremium = userData.isPremium || false;
                        currentUser.reports = userData.reports || 0;
                        currentUser.bannedUntil = userData.bannedUntil || null;
                        
                        // Update UI based on user data
                        if (currentUser.businessName) {
                            document.getElementById('businessName').value = currentUser.businessName;
                        }
                    } else {
                        // Create new user document
                        db.collection('users').doc(currentUser.id).set({
                            email: currentUser.email,
                            name: currentUser.name,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            isPremium: false,
                            reports: 0
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error loading user data:", error);
                });
        }

        function setupRealTimeListeners() {
            // Listen for products changes
            db.collection('products').where('status', '==', 'active')
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            console.log('New product: ', change.doc.data());
                        }
                        if (change.type === 'modified') {
                            console.log('Modified product: ', change.doc.data());
                        }
                        if (change.type === 'removed') {
                            console.log('Removed product: ', change.doc.data());
                        }
                    });
                    
                    // Reload products
                    loadProducts();
                });
                
            // Listen for user data changes
            if (currentUser.id) {
                db.collection('users').doc(currentUser.id)
                    .onSnapshot((doc) => {
                        if (doc.exists) {
                            const userData = doc.data();
                            currentUser.isPremium = userData.isPremium || false;
                            currentUser.reports = userData.reports || 0;
                            currentUser.bannedUntil = userData.bannedUntil || null;
                            
                            // Update UI if user is banned
                            if (currentUser.bannedUntil && new Date() < new Date(currentUser.bannedUntil)) {
                                showNotification('Your account has been banned. You cannot list new products.', 'error');
                            }
                        }
                    });
            }
        }

        function setupEventListeners() {
            // Global search
            const searchInput = document.getElementById('globalSearch');
            searchInput.addEventListener('input', handleGlobalSearch);
            searchInput.addEventListener('focus', showSearchSuggestions);
            searchInput.addEventListener('blur', hideSearchSuggestions);

            // Sell form
            document.getElementById('sellForm').addEventListener('submit', handleSellForm);
            
            // Image upload
            document.getElementById('productImages').addEventListener('change', handleImageUpload);
            
            // Drag and drop for image upload
            const uploadContainer = document.querySelector('.image-upload-container');
            uploadContainer.addEventListener('dragover', handleDragOver);
            uploadContainer.addEventListener('dragleave', handleDragLeave);
            uploadContainer.addEventListener('drop', handleDrop);
            
            // Advanced filters
            document.getElementById('minPrice').addEventListener('input', debounce(applyAdvancedFilters, 500));
            document.getElementById('maxPrice').addEventListener('input', debounce(applyAdvancedFilters, 500));
            document.getElementById('locationFilter').addEventListener('change', applyAdvancedFilters);
            document.getElementById('conditionFilter').addEventListener('change', applyAdvancedFilters);
            document.getElementById('sortBy').addEventListener('change', applyAdvancedFilters);

            // Keyboard shortcuts
            document.addEventListener('keydown', handleKeyboardShortcuts);
            
            // Window events
            window.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', handleResize);
            window.addEventListener('online', () => showNotification('Connection restored! 🌐', 'success'));
            window.addEventListener('offline', () => showNotification('Working offline... 📱', 'warning'));
        }

        function acceptRules() {
            localStorage.setItem('rulesAccepted', 'true');
            document.getElementById('rulesBanner').style.display = 'none';
            showNotification('Thank you for accepting our rules!', 'success');
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add('dragover');
        }

        function handleDragLeave(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('dragover');
        }

        function handleDrop(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                const input = document.getElementById('productImages');
                const dt = new DataTransfer();
                imageFiles.forEach(file => dt.items.add(file));
                input.files = dt.files;
                handleImageUpload({ target: input });
            }
        }

        function handleGlobalSearch(e) {
            const query = e.target.value.toLowerCase();
            currentFilters.searchQuery = query;
            
            if (query.length > 0) {
                showSearchSuggestions();
                generateSearchSuggestions(query);
            } else {
                hideSearchSuggestions();
            }
            
            debounce(loadProducts, 300)();
        }

        function generateSearchSuggestions(query) {
            const suggestions = document.getElementById('searchSuggestions');
            const matchingProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                product.businessName.toLowerCase().includes(query)
            ).slice(0, 5);

            const categoryMatches = categories.filter(cat => 
                cat.toLowerCase().includes(query)
            ).slice(0, 3);

            suggestions.innerHTML = '';

            // Add product suggestions
            matchingProducts.forEach(product => {
                const suggestion = document.createElement('div');
                suggestion.className = 'search-suggestion';
                suggestion.innerHTML = `
                    <i class="bi bi-box"></i>
                    <div>
                        <div style="font-weight: 600;">${product.name}</div>
                        <div style="font-size: 0.8rem; color: #9ca3af;">${product.businessName} • $${product.price}</div>
                    </div>
                `;
                suggestion.onclick = () => selectSearchSuggestion(product.name);
                suggestions.appendChild(suggestion);
            });

            // Add category suggestions
            categoryMatches.forEach(category => {
                const suggestion = document.createElement('div');
                suggestion.className = 'search-suggestion';
                suggestion.innerHTML = `
                    <i class="bi bi-grid"></i>
                    <div>
                        <div style="font-weight: 600;">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                        <div style="font-size: 0.8rem; color: #9ca3af;">Category</div>
                    </div>
                `;
                suggestion.onclick = () => {
                    filterProducts(category);
                    hideSearchSuggestions();
                };
                suggestions.appendChild(suggestion);
            });

            if (matchingProducts.length === 0 && categoryMatches.length === 0) {
                suggestions.innerHTML = `
                    <div class="search-suggestion">
                        <i class="bi bi-search"></i>
                        <div>No suggestions found for "${query}"</div>
                    </div>
                `;
            }
        }

        function selectSearchSuggestion(productName) {
            document.getElementById('globalSearch').value = productName;
            currentFilters.searchQuery = productName.toLowerCase();
            hideSearchSuggestions();
            loadProducts();
        }

        function showSearchSuggestions() {
            document.getElementById('searchSuggestions').style.display = 'block';
        }

        function hideSearchSuggestions() {
            setTimeout(() => {
                document.getElementById('searchSuggestions').style.display = 'none';
            }, 200);
        }

        function handleKeyboardShortcuts(e) {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('globalSearch').focus();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                closeAllModals();
            }
        }

        function handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Show/hide floating action button
            const fab = document.querySelector('.floating-action-btn');
            if (scrollTop > 300) {
                fab.style.opacity = '1';
                fab.style.pointerEvents = 'auto';
            } else {
                fab.style.opacity = '0.7';
            }
        }

        function handleResize() {
            // Adjust grid columns based on screen size
            const grid = document.getElementById('productsGrid');
            const width = window.innerWidth;
            
            if (width < 768) {
                grid.style.gridTemplateColumns = '1fr';
            } else if (width < 1024) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else if (width < 1400) {
                grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            } else {
                grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            }
        }

        function loadProducts() {
            if (isLoading) return;
            
            isLoading = true;
            showLoading(true);
            
            // Load products from Firestore
            let query = db.collection('products').where('status', '==', 'active');
            
            // Apply filters
            if (currentFilters.category !== 'all') {
                query = query.where('category', '==', currentFilters.category);
            }
            
            if (currentFilters.location) {
                query = query.where('location', '==', currentFilters.location);
            }
            
            if (currentFilters.condition) {
                query = query.where('condition', '==', currentFilters.condition);
            }
            
            query.get()
                .then((querySnapshot) => {
                    allProducts = [];
                    querySnapshot.forEach((doc) => {
                        const product = doc.data();
                        product.id = doc.id;
                        
                        // Check if product is expired (90 days)
                        const addedDate = product.dateAdded ? product.dateAdded.toDate() : new Date();
                        const expiryDate = new Date(addedDate);
                        expiryDate.setDate(expiryDate.getDate() + 90);
                        
                        if (new Date() > expiryDate) {
                            // Mark as expired
                            db.collection('products').doc(doc.id).update({
                                status: 'expired'
                            });
                        } else {
                            allProducts.push(product);
                        }
                    });
                    
                    // Apply search filter
                    if (currentFilters.searchQuery) {
                        const query = currentFilters.searchQuery.toLowerCase();
                        allProducts = allProducts.filter(p => 
                            p.name.toLowerCase().includes(query) ||
                            p.description.toLowerCase().includes(query) ||
                            p.category.toLowerCase().includes(query) ||
                            p.businessName.toLowerCase().includes(query) ||
                            p.locationName.toLowerCase().includes(query)
                        );
                    }
                    
                    // Apply price filters
                    if (currentFilters.minPrice !== null) {
                        allProducts = allProducts.filter(p => p.price >= currentFilters.minPrice);
                    }
                    
                    if (currentFilters.maxPrice !== null) {
                        allProducts = allProducts.filter(p => p.price <= currentFilters.maxPrice);
                    }
                    
                    // Sort products
                    allProducts.sort((a, b) => {
                        switch (currentFilters.sortBy) {
                            case 'price-low':
                                return a.price - b.price;
                            case 'price-high':
                                return b.price - a.price;
                            case 'popular':
                                return (b.views || 0) - (a.views || 0);
                            case 'rating':
                                return (b.rating || 0) - (a.rating || 0);
                            default:
                                return b.dateAdded - a.dateAdded;
                        }
                    });
                    
                    // Reset pagination
                    currentPage = 1;
                    displayedProducts = allProducts.slice(0, productsPerPage);
                    hasMoreProducts = allProducts.length > productsPerPage;
                    
                    renderProducts();
                    updateLoadMoreButton();
                    
                    isLoading = false;
                    showLoading(false);
                })
                .catch((error) => {
                    console.error("Error loading products: ", error);
                    isLoading = false;
                    showLoading(false);
                });
        }

        function loadMoreProducts() {
            if (isLoading || !hasMoreProducts) return;
            
            isLoading = true;
            showLoading(true);
            
            // Simulate loading delay
            setTimeout(() => {
                currentPage++;
                const startIndex = (currentPage - 1) * productsPerPage;
                const endIndex = startIndex + productsPerPage;
                const newProducts = allProducts.slice(startIndex, endIndex);
                
                displayedProducts = [...displayedProducts, ...newProducts];
                hasMoreProducts = endIndex < allProducts.length;
                
                renderProducts();
                updateLoadMoreButton();
                
                isLoading = false;
                showLoading(false);
                
                showNotification(`Loaded ${newProducts.length} more products`, 'success');
            }, 1000);
        }

        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = '';
            
            if (displayedProducts.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                        <i class="bi bi-search" style="font-size: 4rem; color: #6b7280; margin-bottom: 1rem;"></i>
                        <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">No products found</h3>
                        <p style="color: #9ca3af; margin-bottom: 2rem;">Try adjusting your search or filters</p>
                        <button class="btn btn-primary" onclick="clearAllFilters()">
                            <i class="bi bi-arrow-clockwise"></i> Clear Filters
                        </button>
                    </div>
                `;
                return;
            }
            
            displayedProducts.forEach(product => {
                const productCard = createProductCard(product);
                grid.appendChild(productCard);
            });
        }

        function createProductCard(product) {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const location = locations.find(l => l.code === product.location);
            const locationFlag = location ? location.flag : '🌍';
            const locationName = location ? location.name : product.location;
            
            // Check if seller is banned
            const isBanned = product.sellerBannedUntil && new Date() < new Date(product.sellerBannedUntil);
            
            // Use the actual uploaded image or a placeholder
            const productImage = product.image || '/placeholder.svg?height=200&width=300';
            
            card.innerHTML = `
                ${product.isOnline ? `
                    <div class="online-badge">
                        <div class="status-dot"></div>
                        Online
                    </div>
                ` : ''}
                
                ${product.sellerIsPremium ? `<div class="premium-badge"><i class="bi bi-star-fill"></i> Premium</div>` : ''}
                
                ${product.sellerBusy ? `
                    <div class="busy-badge">
                        <i class="bi bi-clock"></i> Seller Busy
                    </div>
                ` : ''}
                
                ${isBanned ? `
                    <div class="banned-badge">
                        <i class="bi bi-exclamation-triangle"></i>
                        <div>Seller Banned</div>
                        <div style="font-size: 0.8rem; margin-top: 0.5rem;">This seller has been reported multiple times</div>
                    </div>
                ` : ''}
                
                <div class="business-badge">${product.businessName}</div>
                
                <div class="product-menu">
                    <button class="menu-btn" onclick="toggleProductMenu(event, '${product.id}')">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <div id="menu-${product.id}" class="menu-dropdown">
                        <a href="tel:${product.phone}" class="menu-item">
                            <i class="bi bi-telephone"></i> Call Seller
                        </a>
                        <a href="#" class="menu-item" onclick="viewSellerNumber('${product.id}')">
                            <i class="bi bi-eye"></i> View Number
                        </a>
                        ${!product.sellerIsPremium ? `
                            <a href="#" class="menu-item report" onclick="reportSeller('${product.id}')">
                                <i class="bi bi-flag"></i> Report Seller
                            </a>
                        ` : ''}
                    </div>
                </div>
                
                <img src="${productImage}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='/placeholder.svg?height=200&width=300'">
                
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-meta">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        <span class="product-category category-${product.category}">${product.category}</span>
                    </div>
                    
                    <div class="product-seller">
                        <div class="seller-avatar">${product.businessName.charAt(0)}</div>
                        <div>
                            <div style="font-weight: 600;">${product.businessName}</div>
                            <div style="font-size: 0.8rem;">${locationFlag} ${locationName}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.875rem; color: #9ca3af;">
                        <span>${product.condition}</span>
                        <span><i class="bi bi-eye"></i> ${product.views || 0}</span>
                        <span><i class="bi bi-star-fill"></i> ${product.rating || '5.0'}</span>
                        <span>Qty: ${product.quantity}</span>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="addToCart('${product.id}')" ${product.quantity < 1 || isBanned ? 'disabled' : ''}>
                            <i class="bi bi-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="contactSeller('${product.id}')" ${isBanned ? 'disabled' : ''}>
                            <i class="bi bi-chat-dots"></i> Contact
                        </button>
                    </div>
                </div>
            `;
            
            // Add premium border if seller is premium
            if (product.sellerIsPremium) {
                card.classList.add('premium-border');
            }
            
            // Add click tracking
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button') && !e.target.closest('.product-menu')) {
                    trackProductView(product.id);
                }
            });
            
            return card;
        }

        function toggleProductMenu(event, productId) {
            event.stopPropagation();
            const menu = document.getElementById(`menu-${productId}`);
            const allMenus = document.querySelectorAll('.menu-dropdown');
            
            // Close all other menus
            allMenus.forEach(m => {
                if (m.id !== `menu-${productId}` && m.classList.contains('show')) {
                    m.classList.remove('show');
                }
            });
            
            // Toggle current menu
            menu.classList.toggle('show');
            
            // Close menu when clicking outside
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target.className !== 'menu-btn') {
                    menu.classList.remove('show');
                    document.removeEventListener('click', closeMenu);
                }
            });
        }

        function viewSellerNumber(productId) {
            const product = allProducts.find(p => p.id === productId);
            if (!product) {
                showNotification('Product not found', 'error');
                return;
            }
            
            showNotification(`Seller Phone: ${product.phone}`, 'info');
        }

        function reportSeller(productId) {
            const product = allProducts.find(p => p.id === productId);
            if (!product) {
                showNotification('Product not found', 'error');
                return;
            }
            
            // Check if user has already reported this seller
            const reports = JSON.parse(localStorage.getItem('reports') || '{}');
            if (reports[product.sellerId]) {
                showNotification('You have already reported this seller', 'warning');
                return;
            }
            
            // Report seller
            db.collection('users').doc(product.sellerId).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        const newReportCount = (userData.reports || 0) + 1;
                        
                        // Update report count
                        db.collection('users').doc(product.sellerId).update({
                            reports: newReportCount
                        });
                        
                        // Check if seller should be banned (500 reports)
                        if (newReportCount >= 500) {
                            const bannedUntil = new Date();
                            bannedUntil.setDate(bannedUntil.getDate() + 60); // 60 days ban
                            
                            db.collection('users').doc(product.sellerId).update({
                                bannedUntil: bannedUntil
                            });
                            
                            // Update all seller's products
                            db.collection('products').where('sellerId', '==', product.sellerId)
                                .get()
                                .then((querySnapshot) => {
                                    querySnapshot.forEach((doc) => {
                                        db.collection('products').doc(doc.id).update({
                                            sellerBannedUntil: bannedUntil
                                        });
                                    });
                                });
                                
                            showNotification('Seller has been banned due to multiple reports', 'info');
                        }
                        
                        // Record that user has reported this seller
                        reports[product.sellerId] = true;
                        localStorage.setItem('reports', JSON.stringify(reports));
                        
                        showNotification('Seller reported successfully', 'success');
                    }
                })
                .catch((error) => {
                    console.error("Error reporting seller: ", error);
                    showNotification('Error reporting seller', 'error');
                });
        }

        function updateLoadMoreButton() {
            const btn = document.getElementById('loadMoreBtn');
            const indicator = document.getElementById('infiniteScrollIndicator');
            
            if (hasMoreProducts) {
                btn.style.display = 'block';
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-arrow-down-circle"></i> Load More Products';
                indicator.querySelector('.loading').classList.add('hidden');
            } else {
                btn.style.display = 'none';
                if (allProducts.length > 0) {
                    indicator.innerHTML = '<div style="text-align: center; color: #9ca3af;">🎉 You\'ve seen all products! Check back later for new items.</div>';
                } else {
                    indicator.innerHTML = '';
                }
            }
        }

        function filterProducts(category) {
            currentFilters.category = category;
            
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            loadProducts();
            showNotification(`Filtered by: ${category === 'all' ? 'All Categories' : category}`, 'info');
        }

        function toggleAdvancedSearch() {
            const advancedSearch = document.getElementById('advancedSearch');
            advancedSearch.classList.toggle('show');
        }

        function applyAdvancedFilters() {
            currentFilters.minPrice = parseFloat(document.getElementById('minPrice').value) || null;
            currentFilters.maxPrice = parseFloat(document.getElementById('maxPrice').value) || null;
            currentFilters.location = document.getElementById('locationFilter').value;
            currentFilters.condition = document.getElementById('conditionFilter').value;
            currentFilters.sortBy = document.getElementById('sortBy').value;
            
            loadProducts();
            showNotification('Advanced filters applied', 'success');
        }

        function clearAllFilters() {
            currentFilters = {
                category: 'all',
                minPrice: null,
                maxPrice: null,
                location: '',
                condition: '',
                sortBy: 'newest',
                searchQuery: ''
            };
            
            // Reset UI
            document.getElementById('globalSearch').value = '';
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.getElementById('locationFilter').value = '';
            document.getElementById('conditionFilter').value = '';
            document.getElementById('sortBy').value = 'newest';
            
            // Reset filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector('.filter-btn').classList.add('active');
            
            loadProducts();
            showNotification('All filters cleared', 'info');
        }

        function addToCart(productId) {
            const product = allProducts.find(p => p.id === productId);
            if (!product) {
                showNotification('Product not found', 'error');
                return;
            }
            
            if (product.quantity < 1) {
                showNotification('Product is out of stock', 'error');
                return;
            }
            
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                if (existingItem.cartQuantity >= product.quantity) {
                    showNotification('Cannot add more items than available', 'warning');
                    return;
                }
                existingItem.cartQuantity += 1;
            } else {
                cart.push({
                    ...product,
                    cartQuantity: 1,
                    addedAt: Date.now()
                });
            }
            
            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
            
            // Animate cart button
            const cartBtn = document.querySelector('.cart-btn');
            cartBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartBtn.style.transform = 'scale(1)';
            }, 200);
            
            showNotification(`${product.name} added to cart!`, 'success');
        }

        function contactSeller(productId) {
            const product = allProducts.find(p => p.id === productId);
            if (!product) {
                showNotification('Product not found', 'error');
                return;
            }
            
            showNotification(`Contacting ${product.businessName}...`, 'info');
            
            // Simulate contact
            setTimeout(() => {
                showNotification(`Message sent to ${product.businessName}! They will respond shortly.`, 'success');
            }, 1500);
        }

        function viewProduct(productId) {
            const product = allProducts.find(p => p.id === productId);
            if (!product) {
                showNotification('Product not found', 'error');
                return;
            }
            
            trackProductView(productId);
            showNotification(`Viewing ${product.name}`, 'info');
        }

        function likeProduct(productId) {
            const product = allProducts.find(p => p.id === productId);
            if (!product) return;
            
            product.likes = (product.likes || 0) + 1;
            
            // Save to Firestore
            db.collection('products').doc(productId).update({
                likes: firebase.firestore.FieldValue.increment(1)
            });
            
            // Update display
            loadProducts();
            
            showNotification('Product liked! ❤️', 'success');
        }

        function trackProductView(productId) {
            // Update view count in Firestore
            db.collection('products').doc(productId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
        }

        function updateCartUI() {
            const cartCount = document.getElementById('cartCount');
            const cartItemCount = document.getElementById('cartItemCount');
            
            const totalItems = cart.reduce((sum, item) => sum + (item.cartQuantity || 1), 0);
            
            cartCount.textContent = totalItems;
            if (cartItemCount) {
                cartItemCount.textContent = totalItems;
            }
            
            // Update cart modal if open
            if (!document.getElementById('cartModal').classList.contains('hidden')) {
                updateCartModal();
            }
        }

        function updateCartModal() {
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            
            cartItems.innerHTML = '';
            
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <i class="bi bi-cart-x" style="font-size: 4rem; color: #6b7280; margin-bottom: 1rem;"></i>
                        <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Your cart is empty</h3>
                        <p style="color: #9ca3af; margin-bottom: 2rem;">Add some products to get started</p>
                        <button class="btn btn-primary" onclick="closeCart(); showSection('marketplace')">
                            <i class="bi bi-shop"></i> Browse Products
                        </button>
                    </div>
                `;
                cartTotal.textContent = '$0.00';
                return;
            }
            
            let total = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * (item.cartQuantity || 1);
                total += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'flex justify-between items-center p-4';
                cartItem.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                
                cartItem.innerHTML = `
                    <div class="flex items-center gap-4">
                        <img src="${item.image || '/placeholder.svg?height=60&width=60'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 0.5rem;">
                        <div style="flex: 1;">
                            <h4 style="font-weight: 600; margin-bottom: 0.25rem;">${item.name}</h4>
                            <p style="font-size: 0.875rem; color: #9ca3af;">${item.businessName}</p>
                            <p style="font-size: 0.875rem; color: var(--gold);">$${item.price.toFixed(2)} each</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2">
                            <button class="btn btn-outline btn-sm" onclick="updateCartQuantity('${item.id}', ${(item.cartQuantity || 1) - 1})" ${(item.cartQuantity || 1) <= 1 ? 'disabled' : ''}>
                                <i class="bi bi-dash"></i>
                            </button>
                            <span style="width: 2rem; text-align: center; font-weight: bold;">${item.cartQuantity || 1}</span>
                            <button class="btn btn-outline btn-sm" onclick="updateCartQuantity('${item.id}', ${(item.cartQuantity || 1) + 1})">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: var(--gold);">$${itemTotal.toFixed(2)}</div>
                            <button style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 0.875rem;" onclick="removeFromCart('${item.id}')">
                                <i class="bi bi-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                    <div style="margin-left: 1rem;">
                        <a href="tel:${item.phone}" class="cart-call-btn" title="Call Seller">
                            <i class="bi bi-telephone"></i> Call
                        </a>
                    </div>
                `;
                
                cartItems.appendChild(cartItem);
            });
            
            cartTotal.textContent = `$${total.toFixed(2)}`;
        }

        function updateCartQuantity(productId, quantity) {
            if (quantity < 1) {
                removeFromCart(productId);
                return;
            }
            
            const item = cart.find(c => c.id === productId);
            const originalProduct = allProducts.find(p => p.id === productId);
            
            if (item && originalProduct) {
                if (quantity > originalProduct.quantity) {
                    showNotification(`Only ${originalProduct.quantity} items available`, 'warning');
                    return;
                }
                
                item.cartQuantity = quantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartUI();
            }
        }

        function removeFromCart(productId) {
            cart = cart.filter(c => c.id !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
            showNotification('Item removed from cart', 'info');
        }

        function openCart() {
            document.getElementById('cartModal').classList.add('active');
            updateCartModal();
        }

        function closeCart() {
            document.getElementById('cartModal').classList.remove('active');
        }

        function checkout() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }
            
            showLoading(true);
            
            // Simulate checkout process
            setTimeout(() => {
                const total = cart.reduce((sum, item) => sum + (item.price * (item.cartQuantity || 1)), 0);
                const orderId = 'ORDER_' + Date.now();
                
                // Clear cart
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartUI();
                
                showLoading(false);
                closeCart();
                
                showNotification(`Order confirmed! Total: $${total.toFixed(2)} | Order ID: ${orderId}`, 'success');
                
            }, 2000);
        }

        async function handleSellForm(e) {
            e.preventDefault();
            
            // Check if user is banned
            if (currentUser.bannedUntil && new Date() < new Date(currentUser.bannedUntil)) {
                showNotification('Your account has been banned. You cannot list new products.', 'error');
                return;
            }
            
            const formData = new FormData(e.target);
            const businessName = document.getElementById('businessName').value.trim();
            const images = document.getElementById('productImages').files;
            
            if (!businessName) {
                showNotification('Please enter your business name', 'error');
                return;
            }
            
            if (images.length === 0) {
                showNotification('Please upload at least one product image', 'error');
                return;
            }
            
            // Check if business name is already taken
            const businessNameQuery = await db.collection('users')
                .where('businessName', '==', businessName)
                .get();
                
            if (!businessNameQuery.empty && businessNameQuery.docs[0].id !== currentUser.id) {
                showNotification('Business name is already taken. Please choose a different name.', 'error');
                return;
            }
            
            showLoading(true);
            
            try {
                // Upload images to Firebase Storage
                const imageUrls = [];
                for (let i = 0; i < images.length; i++) {
                    const file = images[i];
                    const storageRef = storage.ref(`products/${Date.now()}_${file.name}`);
                    await storageRef.put(file);
                    const downloadURL = await storageRef.getDownloadURL();
                    imageUrls.push(downloadURL);
                }
                
                // Get location name
                const locationCode = formData.get('location');
                const location = locations.find(l => l.code === locationCode);
                const locationName = location ? location.name : locationCode;
                
                // Create new product
                const productData = {
                    name: formData.get('productName'),
                    description: formData.get('description'),
                    price: parseFloat(formData.get('price')),
                    category: formData.get('category'),
                    condition: formData.get('condition'),
                    quantity: parseInt(formData.get('quantity')),
                    businessName: businessName,
                    location: locationCode,
                    locationName: locationName,
                    sellerId: currentUser.id,
                    sellerEmail: currentUser.email,
                    sellerIsPremium: currentUser.isPremium,
                    sellerBusy: false,
                    sellerBannedUntil: currentUser.bannedUntil,
                    phone: formData.get('phone'),
                    dateAdded: new Date(),
                    views: 0,
                    likes: 0,
                    isOnline: true,
                    rating: '5.0',
                    image: imageUrls[0],
                    images: imageUrls,
                    status: 'active'
                };
                
                // Add product to Firestore
                const docRef = await db.collection('products').add(productData);
                
                // Update user business name if changed
                if (businessName !== currentUser.businessName) {
                    await db.collection('users').doc(currentUser.id).update({
                        businessName: businessName,
                        phone: formData.get('phone'),
                        location: locationCode
                    });
                    
                    currentUser.businessName = businessName;
                }
                
                showLoading(false);
                showNotification('Product listed successfully! 🎉 It\'s now live on the marketplace!', 'success');
                
                // Reset form
                document.getElementById('sellForm').reset();
                document.getElementById('imagePreview').innerHTML = '';
                document.getElementById('imagePreview').classList.add('hidden');
                
                // Update stats
                updateStats();
                
                // Show update indicator
                showUpdateIndicator();
                
                // Switch to marketplace to show the new product
                setTimeout(() => {
                    showSection('marketplace');
                    loadProducts(); // Refresh the marketplace
                }, 1000);
                
            } catch (error) {
                console.error('Error listing product:', error);
                showLoading(false);
                showNotification('Error listing product. Please try again.', 'error');
            }
        }

        function handleImageUpload(e) {
            const files = Array.from(e.target.files);
            const preview = document.getElementById('imagePreview');
            
            if (files.length === 0) {
                preview.classList.add('hidden');
                return;
            }
            
            // Validate file types and sizes
            const validFiles = files.filter(file => {
                if (!file.type.startsWith('image/')) {
                    showNotification(`${file.name} is not a valid image file`, 'error');
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    showNotification(`${file.name} is too large. Maximum size is 5MB`, 'error');
                    return false;
                }
                return true;
            });
            
            if (validFiles.length === 0) {
                preview.classList.add('hidden');
                return;
            }
            
            preview.innerHTML = '';
            preview.classList.remove('hidden');
            
            validFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageItem = document.createElement('div');
                    imageItem.className = 'image-preview-item';
                    imageItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <button type="button" class="image-preview-remove" onclick="removeImagePreview(${index})">
                            <i class="bi bi-x"></i>
                        </button>
                    `;
                    preview.appendChild(imageItem);
                };
                reader.readAsDataURL(file);
            });
        }

        function removeImagePreview(index) {
            const input = document.getElementById('productImages');
            const dt = new DataTransfer();
            const files = Array.from(input.files);
            
            files.forEach((file, i) => {
                if (i !== index) {
                    dt.items.add(file);
                }
            });
            
            input.files = dt.files;
            handleImageUpload({ target: input });
        }

        function previewProduct() {
            const formData = new FormData(document.getElementById('sellForm'));
            
            if (!formData.get('productName') || !formData.get('price') || !formData.get('description')) {
                showNotification('Please fill in required fields first', 'error');
                return;
            }
            
            const preview = {
                name: formData.get('productName'),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                category: formData.get('category'),
                condition: formData.get('condition'),
                quantity: parseInt(formData.get('quantity'))
            };
            
            showNotification(`Preview: ${preview.name} - $${preview.price} (${preview.category})`, 'info');
        }

        function saveDraft() {
            const formData = new FormData(document.getElementById('sellForm'));
            const draft = {};
            
            for (let [key, value] of formData.entries()) {
                draft[key] = value;
            }
            
            draft.businessName = document.getElementById('businessName').value;
            localStorage.setItem('sellFormDraft', JSON.stringify(draft));
            showNotification('Draft saved', 'success');
        }

        function loadDraft() {
            const draft = localStorage.getItem('sellFormDraft');
            if (!draft) {
                showNotification('No draft found', 'warning');
                return;
            }
            
            const data = JSON.parse(draft);
            
            Object.keys(data).forEach(key => {
                const element = document.querySelector(`[name="${key}"]`) || document.getElementById(key);
                if (element) {
                    element.value = data[key];
                }
            });
            
            showNotification('Draft loaded', 'success');
        }

        function showSection(sectionName) {
            // Show page loader
            document.getElementById('pageLoader').classList.remove('hidden');
            
            setTimeout(() => {
                // Hide all sections
                document.querySelectorAll('[id$="Section"]').forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Show target section
                document.getElementById(sectionName + 'Section').classList.remove('hidden');
                
                // Update navigation
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                // Load section-specific content
                switch (sectionName) {
                    case 'marketplace':
                        loadProducts();
                        break;
                    case 'analytics':
                        loadUserAnalytics();
                        break;
                }
                
                // Hide page loader
                document.getElementById('pageLoader').classList.add('hidden');
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 500);
        }

        function loadUserAnalytics() {
            if (!currentUser.id) {
                showNotification('Please sign in to view analytics', 'error');
                return;
            }
            
            // Load user's products from Firestore
            db.collection('products')
                .where('sellerId', '==', currentUser.id)
                .get()
                .then((querySnapshot) => {
                    const userProducts = [];
                    querySnapshot.forEach((doc) => {
                        const product = doc.data();
                        product.id = doc.id;
                        userProducts.push(product);
                    });
                    
                    const totalViews = userProducts.reduce((sum, p) => sum + (p.views || 0), 0);
                    const totalSales = userProducts.reduce((sum, p) => sum + (p.sales || 0), 0);
                    const totalRevenue = userProducts.reduce((sum, p) => sum + ((p.sales || 0) * p.price), 0);
                    
                    document.getElementById('totalListings').textContent = userProducts.length;
                    document.getElementById('totalViews').textContent = totalViews.toLocaleString();
                    document.getElementById('totalSales').textContent = totalSales.toLocaleString();
                    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toLocaleString()}`;
                    
                    // Load user products
                    const userProductsGrid = document.getElementById('userProducts');
                    userProductsGrid.innerHTML = '';
                    
                    if (userProducts.length === 0) {
                        userProductsGrid.innerHTML = `
                            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                                <i class="bi bi-box" style="font-size: 4rem; color: #6b7280; margin-bottom: 1rem;"></i>
                                <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">No products listed yet</h3>
                                <p style="color: #9ca3af; margin-bottom: 2rem;">Start selling by adding your first product</p>
                                <button class="btn btn-primary" onclick="showSection('sell')">
                                    <i class="bi bi-plus"></i> List Your First Product
                                </button>
                            </div>
                        `;
                        return;
                    }
                    
                    userProducts.forEach(product => {
                        const productCard = createProductCard(product);
                        
                        // Add edit/delete buttons for user's own products
                        const editActions = document.createElement('div');
                        editActions.style.cssText = 'display: flex; gap: 0.5rem; margin-top: 0.5rem;';
                        
                        if (currentUser.isPremium) {
                            editActions.innerHTML = `
                                <button class="btn btn-outline btn-sm" onclick="editProduct('${product.id}')" style="flex: 1;">
                                    <i class="bi bi-pencil"></i> Edit
                                </button>
                            `;
                        }
                        
                        editActions.innerHTML += `
                            <button class="btn btn-outline btn-sm" onclick="deleteProduct('${product.id}')" style="color: #ef4444; border-color: #ef4444;">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        `;
                        
                        productCard.querySelector('.product-content').appendChild(editActions);
                        userProductsGrid.appendChild(productCard);
                    });
                })
                .catch((error) => {
                    console.error("Error loading user analytics: ", error);
                });
        }

        function editProduct(productId) {
            if (!currentUser.isPremium) {
                showNotification('Premium feature: Upgrade to edit your products', 'warning');
                openPremiumModal();
                return;
            }
            
            // Load product data and populate form
            db.collection('products').doc(productId).get()
                .then((doc) => {
                    if (doc.exists) {
                        const product = doc.data();
                        
                        // Switch to sell section and populate form
                        showSection('sell');
                        
                        setTimeout(() => {
                            document.getElementById('businessName').value = product.businessName;
                            document.querySelector('[name="productName"]').value = product.name;
                            document.querySelector('[name="description"]').value = product.description;
                            document.querySelector('[name="price"]').value = product.price;
                            document.querySelector('[name="category"]').value = product.category;
                            document.querySelector('[name="condition"]').value = product.condition;
                            document.querySelector('[name="quantity"]').value = product.quantity;
                            document.querySelector('[name="location"]').value = product.location;
                            document.querySelector('[name="phone"]').value = product.phone;
                            
                            // TODO: Handle image preview for existing images
                            
                            showNotification(`Editing: ${product.name}`, 'info');
                        }, 100);
                    }
                })
                .catch((error) => {
                    console.error("Error loading product: ", error);
                    showNotification('Error loading product', 'error');
                });
        }

        function deleteProduct(productId) {
            if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                return;
            }
            
            // Delete from Firestore
            db.collection('products').doc(productId).delete()
                .then(() => {
                    // Remove from cart if present
                    cart = cart.filter(item => item.id !== productId);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartUI();
                    
                    // Update stats
                    updateStats();
                    
                    loadUserAnalytics();
                    showNotification('Product deleted successfully', 'success');
                })
                .catch((error) => {
                    console.error("Error deleting product: ", error);
                    showNotification('Error deleting product', 'error');
                });
        }

        function exportAnalytics() {
            if (!currentUser.id) {
                showNotification('Please sign in to export analytics', 'error');
                return;
            }
            
            // Load user's products from Firestore
            db.collection('products')
                .where('sellerId', '==', currentUser.id)
                .get()
                .then((querySnapshot) => {
                    const userProducts = [];
                    querySnapshot.forEach((doc) => {
                        const product = doc.data();
                        product.id = doc.id;
                        userProducts.push(product);
                    });
                    
                    const exportData = {
                        user: currentUser,
                        products: userProducts,
                        exportDate: new Date().toISOString(),
                        summary: {
                            totalProducts: userProducts.length,
                            totalViews: userProducts.reduce((sum, p) => sum + (p.views || 0), 0),
                            totalSales: userProducts.reduce((sum, p) => sum + (p.sales || 0), 0),
                            totalRevenue: userProducts.reduce((sum, p) => sum + ((p.sales || 0) * p.price), 0)
                        }
                    };
                    
                    const dataStr = JSON.stringify(exportData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(dataBlob);
                    link.download = `smile-xplorer-analytics-${Date.now()}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showNotification('Analytics data exported successfully!', 'success');
                })
                .catch((error) => {
                    console.error("Error exporting analytics: ", error);
                    showNotification('Error exporting analytics', 'error');
                });
        }

        function refreshAnalytics() {
            loadUserAnalytics();
            showNotification('Analytics refreshed', 'success');
        }

        function toggleQuickActions() {
            const quickActions = document.getElementById('quickActions');
            const fabIcon = document.getElementById('fabIcon');
            
            quickActions.classList.toggle('show');
            
            if (quickActions.classList.contains('show')) {
                fabIcon.className = 'bi bi-x';
            } else {
                fabIcon.className = 'bi bi-plus';
            }
        }

        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toggleQuickActions();
        }

        function toggleTheme() {
            showNotification('Theme switching coming soon!', 'info');
            toggleQuickActions();
        }

        function openPremiumModal() {
            document.getElementById('premiumModal').classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        function subscribePremium() {
            if (!currentUser.id) {
                showNotification('Please sign in to subscribe', 'error');
                return;
            }
            
            showLoading(true);
            
            // Simulate subscription process
            setTimeout(() => {
                // Update user premium status in Firestore
                db.collection('users').doc(currentUser.id).update({
                    isPremium: true,
                    premiumSince: new Date()
                })
                .then(() => {
                    currentUser.isPremium = true;
                    
                    showLoading(false);
                    closeModal('premiumModal');
                    showNotification('🎉 Premium subscription activated! Enjoy your exclusive features.', 'success');
                })
                .catch((error) => {
                    console.error("Error updating premium status: ", error);
                    showLoading(false);
                    showNotification('Error activating premium subscription', 'error');
                });
            }, 2000);
        }

        function startLiveDemo() {
            showNotification('🎬 Starting live demo...', 'info');
            
            setTimeout(() => {
                showNotification('📱 Demo: Real-time product updates enabled', 'success');
            }, 1000);
            
            setTimeout(() => {
                showNotification('🌍 Demo: Global search activated', 'success');
            }, 2000);
            
            setTimeout(() => {
                showNotification('♾️ Demo: Infinite scroll ready', 'success');
            }, 3000);
            
            setTimeout(() => {
                showNotification('🚀 Demo complete! Start by listing your first product!', 'success');
                showSection('sell');
            }, 4000);
        }

        function updateStats() {
            // Load stats from Firestore
            db.collection('products').where('status', '==', 'active')
                .get()
                .then((querySnapshot) => {
                    const totalProducts = querySnapshot.size;
                    
                    // Get unique sellers
                    const sellerIds = new Set();
                    querySnapshot.forEach((doc) => {
                        const product = doc.data();
                        sellerIds.add(product.sellerId);
                    });
                    
                    const activeSellers = sellerIds.size;
                    
                    document.getElementById('totalProducts').textContent = totalProducts.toLocaleString();
                    document.getElementById('activeSellers').textContent = activeSellers.toLocaleString();
                })
                .catch((error) => {
                    console.error("Error loading stats: ", error);
                });
        }

        function showUpdateIndicator() {
            const indicator = document.getElementById('updateIndicator');
            indicator.classList.add('show');
            
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 3000);
        }

        function showLoading(show) {
            const overlay = document.getElementById('loadingOverlay');
            if (show) {
                overlay.style.display = 'flex';
            } else {
                overlay.style.display = 'none';
            }
        }

        function showNotification(message, type = 'info') {
            const container = document.getElementById('notificationContainer');
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            const icons = {
                success: 'bi-check-circle-fill',
                error: 'bi-x-circle-fill',
                warning: 'bi-exclamation-triangle-fill',
                info: 'bi-info-circle-fill'
            };
            
            notification.innerHTML = `
                <i class="bi ${icons[type] || icons.info}"></i>
                <span>${message}</span>
            `;
            
            container.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }, 5000);
        }

        function closeAllModals() {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }