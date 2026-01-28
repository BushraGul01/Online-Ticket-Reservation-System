// Application State
const appState = {
    currentPage: 'home',
    bookings: JSON.parse(localStorage.getItem('triptixBookings')) || [],
    availableTickets: [],
    selectedTicket: null,
    selectedSeats: [],
    currentBooking: null
};

// Initialize the application
function initApp() {
    initializeNavigation();
    initializeForms();
    initializeModals();
    loadBookings();
    setMinDate();
}

document.addEventListener('DOMContentLoaded', initApp);

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('travel-date').setAttribute('min', today);
    document.getElementById('search-date').setAttribute('min', today);
}

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .footer-links a[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Login/Register buttons
    document.getElementById('loginBtn').addEventListener('click', () => {
        openLoginModal();
    });

    document.getElementById('registerBtn').addEventListener('click', () => {
        openRegistrationModal();
    });
}

function navigateToPage(page) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    // Show/hide pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`${page}-page`).classList.add('active');
    appState.currentPage = page;

    // Load bookings if on bookings page
    if (page === 'bookings') {
        loadBookings();
    }
}

// Form Initialization
function initializeForms() {
    // Home booking form
    const bookingForm = document.getElementById('booking-form');
    bookingForm.addEventListener('submit', handleBookingFormSubmit);

    // Swap button
    document.getElementById('swapBtn').addEventListener('click', swapCities);

    // Search form
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', handleSearchSubmit);

    // Availability Message Logic
    ['from-city', 'to-city', 'travel-date'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateAvailability);
        document.getElementById(id).addEventListener('input', updateAvailability);
    });
}

function updateAvailability() {
    const from = document.getElementById('from-city').value;
    const to = document.getElementById('to-city').value;
    const messageEl = document.getElementById('availability-message');

    if (from && to) {
        // Simple simulation of availability
        const count = Math.floor(Math.random() * (50 - 10 + 1)) + 10;
        messageEl.innerHTML = `⚡ <strong>${count} buses</strong> available for this route`;
        messageEl.style.opacity = '1';
    } else {
        messageEl.innerHTML = '';
        messageEl.style.opacity = '0';
    }
}

function swapCities() {
    const fromCity = document.getElementById('from-city').value;
    const toCity = document.getElementById('to-city').value;
    document.getElementById('from-city').value = toCity;
    document.getElementById('to-city').value = fromCity;
}

function handleBookingFormSubmit(e) {
    e.preventDefault();
    const fromCity = document.getElementById('from-city').value;
    const toCity = document.getElementById('to-city').value;
    const travelDate = document.getElementById('travel-date').value;
    const passengers = document.getElementById('passengers').value;
    const mode = document.getElementById('travel-mode').value;

    if (fromCity === toCity) {
        alert('Origin and Destination cities cannot be the same.');
        return;
    }

    // Navigate to search page and populate search form
    navigateToPage('search');

    // Populate search form
    document.getElementById('search-from').value = fromCity;
    document.getElementById('search-to').value = toCity;
    document.getElementById('search-date').value = travelDate;
    document.getElementById('search-passengers').value = passengers;
    document.getElementById('search-mode').value = mode;

    // Trigger search
    setTimeout(() => {
        performSearch(fromCity, toCity, travelDate, passengers, mode);
    }, 100);
}

function handleSearchSubmit(e) {
    e.preventDefault();
    const fromCity = document.getElementById('search-from').value;
    const toCity = document.getElementById('search-to').value;
    const travelDate = document.getElementById('search-date').value;
    const passengers = document.getElementById('search-passengers').value;
    const mode = document.getElementById('search-mode').value;

    if (fromCity === toCity) {
        alert('Origin and Destination cities cannot be the same.');
        return;
    }

    if (!fromCity || !toCity || !travelDate || !mode) {
        alert('Please fill in all search fields and select a travel mode');
        return;
    }

    if (mode === 'air') {
        const shortDistancePairs = [
            ['Islamabad', 'Rawalpindi'],
            ['Lahore', 'Gujranwala'],
            ['Karachi', 'Hyderabad'],
            ['Peshawar', 'Mardan'],
            ['Islamabad', 'Murree'],
            ['Rawalpindi', 'Murree'],
            ['Abbottabad', 'Murree']
        ];

        const isShortDistance = shortDistancePairs.some(pair =>
            (pair.includes(fromCity) && pair.includes(toCity))
        );

        if (isShortDistance) {
            alert(`Air travel is not available between ${fromCity} and ${toCity} due to short distance.`);
            return;
        }
    }

    performSearch(fromCity, toCity, travelDate, passengers, mode);
}

function performSearch(fromCity, toCity, travelDate, passengers, mode) {
    // Generate mock tickets
    const mockTickets = generateMockTickets(fromCity, toCity, travelDate, passengers, mode);
    appState.availableTickets = mockTickets;
    displaySearchResults(mockTickets);
}



// Helper to generate mock tickets
function generateMockTickets(from, to, date, passengers, mode) {
    const tickets = [];
    const count = Math.floor(Math.random() * 5) + 3; // 3 to 7 tickets

    const types = ['Standard', 'Luxury', 'Business'];
    const times = ['08:00', '10:30', '13:15', '16:45', '20:00', '22:30'];

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const depTime = times[Math.floor(Math.random() * times.length)];

        // Calculate arrival time (random duration 2-6 hours)
        const durationHours = Math.floor(Math.random() * 4) + 2;
        const [depHour, depMin] = depTime.split(':').map(Number);
        const arrHour = (depHour + durationHours) % 24;
        const arrTime = `${arrHour.toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`;

        // Base price calculation
        let basePrice = 1200;
        if (mode === 'air') basePrice = 15000;
        if (mode === 'rail') basePrice = 2500;

        const price = basePrice + (type === 'Luxury' ? 500 : type === 'Business' ? 1000 : 0) + Math.floor(Math.random() * 200);

        tickets.push({
            id: `TK-${Date.now()}-${i}`,
            from: from,
            to: to,
            date: date,
            type: type,
            mode: mode,
            departure: depTime,
            arrival: arrTime,
            duration: `${durationHours}h 00m`,
            price: price,
            totalSeats: 40,
            availableSeats: Math.floor(Math.random() * 20) + 10
        });
    }

    return tickets.sort((a, b) => a.price - b.price);
}

function displaySearchResults(tickets) {
    const resultsContainer = document.getElementById('search-results');

    if (tickets.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No tickets found for your search criteria.</p>
                <p>Please try different dates or routes.</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = tickets.map(ticket => `
        <div class="ticket-card">
            <div class="ticket-header">
                <div class="ticket-route">
                    <h3>${ticket.from} → ${ticket.to}</h3>
                    <p>${ticket.type} • ${ticket.mode === 'air' ? 'Airline' : ticket.mode === 'rail' ? 'Railway' : 'Bus'}</p>
                </div>
                <div class="ticket-price">
                    <div class="price">PKR ${ticket.price.toLocaleString ? ticket.price.toLocaleString('en-PK') : ticket.price}</div>
                    <div class="per-person">per person</div>
                </div>
            </div>
            <div class="ticket-details">
                <div class="detail-item">
                    <label>Departure</label>
                    <span>${ticket.departure}</span>
                </div>
                <div class="detail-item">
                    <label>Arrival</label>
                    <span>${ticket.arrival}</span>
                </div>
                <div class="detail-item">
                    <label>Duration</label>
                    <span>${ticket.duration}</span>
                </div>
                <div class="detail-item">
                    <label>Available Seats</label>
                    <span>${ticket.availableSeats} / ${ticket.totalSeats}</span>
                </div>
            </div>
            <div class="ticket-actions">
                <button class="btn-primary select-ticket-btn" data-ticket-id="${ticket.id}">Select Seats</button>
            </div>
        </div>
    `).join('');
}

// Global Event Delegation for Ticket Selection
document.addEventListener('click', function (e) {
    const btn = e.target.closest('.select-ticket-btn');
    if (btn) {
        console.log('Select Seat button clicked');
        const ticketId = btn.getAttribute('data-ticket-id');
        console.log('Ticket ID from data attribute:', ticketId);
        selectTicket(ticketId);
    }
});

// Ticket Selection
function selectTicket(ticketId) {
    console.log('Selecting ticket via delegation:', ticketId); // Debug log
    try {
        if (!appState.availableTickets || appState.availableTickets.length === 0) {
            console.error('No available tickets in state');
            alert('Error: No tickets found. Please search again.');
            return;
        }

        const ticket = appState.availableTickets.find(t => t.id === ticketId);

        if (!ticket) {
            console.error('Ticket not found for ID:', ticketId);
            // Fallback: try to find by index if ID fails or something weird happened
            // This is a safety net
            const ticketByIndex = appState.availableTickets[0]; // Logic could be improved but just debugging
            alert('Error: Ticket not found. Please try again.');
            return;
        }

        console.log('Ticket found:', ticket);
        appState.selectedTicket = ticket;
        appState.selectedSeats = [];
        openSeatModal();
    } catch (err) {
        console.error('Error in selectTicket:', err);
        alert('An unexpected error occurred. Please try again.');
    }
}

// Modal Management
function initializeModals() {
    // Seat modal
    const seatModal = document.getElementById('seat-modal');
    const closeSeatModal = seatModal.querySelector('.close');
    const cancelSeatBtn = document.getElementById('cancel-seat');
    const proceedPaymentBtn = document.getElementById('proceed-payment');

    closeSeatModal.addEventListener('click', closeSeatModalFunc);
    cancelSeatBtn.addEventListener('click', closeSeatModalFunc);
    proceedPaymentBtn.addEventListener('click', () => {
        if (appState.selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }
        closeSeatModalFunc();
        openPaymentModal();
    });

    // Payment modal
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModal = paymentModal.querySelector('.close');
    const cancelPaymentBtn = document.getElementById('cancel-payment');
    const paymentForm = document.getElementById('payment-form');

    closePaymentModal.addEventListener('click', closePaymentModalFunc);
    cancelPaymentBtn.addEventListener('click', closePaymentModalFunc);
    paymentForm.addEventListener('submit', handlePaymentSubmit);

    // Format card inputs
    document.getElementById('card-number').addEventListener('input', formatCardNumber);
    document.getElementById('expiry-date').addEventListener('input', formatExpiryDate);
    document.getElementById('cvv').addEventListener('input', formatCVV);

    // Success modal
    const successModal = document.getElementById('success-modal');
    document.getElementById('close-success').addEventListener('click', () => {
        successModal.classList.remove('active');
        navigateToPage('bookings');
    });

    // Registration modal
    const registrationModal = document.getElementById('registration-modal');
    const closeRegistrationModal = registrationModal.querySelector('.close');
    const cancelRegistrationBtn = document.getElementById('cancel-registration');
    const registrationForm = document.getElementById('registration-form');

    closeRegistrationModal.addEventListener('click', closeRegistrationModalFunc);
    cancelRegistrationBtn.addEventListener('click', closeRegistrationModalFunc);
    registrationForm.addEventListener('submit', handleRegistrationSubmit);

    // Login modal
    const loginModal = document.getElementById('login-modal');
    const closeLoginModal = loginModal.querySelector('.close');
    const cancelLoginBtn = document.getElementById('cancel-login');
    const loginForm = document.getElementById('login-form');

    closeLoginModal.addEventListener('click', closeLoginModalFunc);
    cancelLoginBtn.addEventListener('click', closeLoginModalFunc);
    loginForm.addEventListener('submit', handleLoginSubmit);
}

function openSeatModal() {
    const modal = document.getElementById('seat-modal');
    generateSeatMap();
    updateSeatInfo();
    modal.classList.add('active');
}

function closeSeatModalFunc() {
    document.getElementById('seat-modal').classList.remove('active');
}

function generateSeatMap() {
    const container = document.getElementById('seats-container');
    const ticket = appState.selectedTicket;
    const totalSeats = ticket.totalSeats;
    const occupiedSeats = totalSeats - ticket.availableSeats;

    // Generate random occupied seats
    const occupied = [];
    while (occupied.length < occupiedSeats) {
        const seatNum = Math.floor(Math.random() * totalSeats) + 1;
        if (!occupied.includes(seatNum)) {
            occupied.push(seatNum);
        }
    }

    container.innerHTML = '';
    for (let i = 1; i <= totalSeats; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.textContent = i;

        if (occupied.includes(i)) {
            seat.classList.add('occupied');
            seat.addEventListener('click', () => {
                alert('This seat is already booked.');
            });
        } else {
            seat.classList.add('available');
            seat.addEventListener('click', () => toggleSeat(i, seat));
        }

        container.appendChild(seat);
    }
}

function toggleSeat(seatNumber, seatElement) {
    const index = appState.selectedSeats.indexOf(seatNumber);
    const passengers = parseInt(document.getElementById('search-passengers').value) || 1;

    if (index > -1) {
        // Deselect seat
        appState.selectedSeats.splice(index, 1);
        seatElement.classList.remove('selected');
        seatElement.classList.add('available');
    } else {
        // Check if we can select more seats
        if (!canSelectMoreSeats(appState.selectedSeats.length, passengers)) {
            alert(`You can only select ${passengers} seat(s) for ${passengers} passenger(s)`);
            return;
        }
        // Select seat
        appState.selectedSeats.push(seatNumber);
        seatElement.classList.remove('available');
        seatElement.classList.add('selected');
    }

    appState.selectedSeats.sort((a, b) => a - b);
    updateSeatInfo();
}

function updateSeatInfo() {
    const ticket = appState.selectedTicket;
    const selectedCount = appState.selectedSeats.length;
    const totalPrice = calculateTotalPrice(selectedCount, ticket.price);

    document.getElementById('selected-seats-count').textContent =
        selectedCount > 0 ? appState.selectedSeats.join(', ') : '0';
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
}

function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const ticket = appState.selectedTicket;
    const passengers = parseInt(document.getElementById('search-passengers').value) || 1;
    const totalPrice = calculateTotalPrice(appState.selectedSeats.length, ticket.price);

    document.getElementById('payment-route').textContent = `${ticket.from} → ${ticket.to}`;
    document.getElementById('payment-date').textContent = formatDate(ticket.date);
    document.getElementById('payment-seats').textContent = appState.selectedSeats.join(', ');
    document.getElementById('payment-passengers').textContent = passengers;
    document.getElementById('payment-total').textContent = 'PKR ' + totalPrice.toFixed(2);

    modal.classList.add('active');
}

function closePaymentModalFunc() {
    document.getElementById('payment-modal').classList.remove('active');
}

function handlePaymentSubmit(e) {
    e.preventDefault();

    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholder-name').value;

    // Basic validation
    // console.log('Payment Validation:', { cardNumber, expiryDate, cvv });
    if (!isValidCard(cardNumber, expiryDate, cvv)) {
        alert('Invalid card details. Please check Card Number (16 digits), Expiry (MM/YY) and CVV (3 digits).');
        return;
    }

    // Process payment (simulated)
    processBooking();
}

function processBooking() {
    const ticket = appState.selectedTicket;
    const passengers = parseInt(document.getElementById('search-passengers').value) || 1;
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const booking = {
        id: bookingId,
        ticketId: ticket.id,
        from: ticket.from,
        to: ticket.to,
        date: ticket.date,
        type: ticket.type,
        departure: ticket.departure,
        arrival: ticket.arrival,
        duration: ticket.duration,
        seats: [...appState.selectedSeats],
        passengers: passengers,
        pricePerSeat: ticket.price,
        totalPrice: calculateTotalPrice(appState.selectedSeats.length, ticket.price),
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
    };

    appState.bookings.push(booking);
    localStorage.setItem('triptixBookings', JSON.stringify(appState.bookings));

    // Show success modal
    document.getElementById('payment-modal').classList.remove('active');
    document.getElementById('booking-id').textContent = bookingId;
    document.getElementById('success-modal').classList.add('active');

    // Reset form
    document.getElementById('payment-form').reset();
    appState.selectedTicket = null;
    appState.selectedSeats = [];
}

// Booking Management
function loadBookings() {
    const bookingsContainer = document.getElementById('bookings-list');

    if (appState.bookings.length === 0) {
        bookingsContainer.innerHTML = `
            <div class="no-bookings">
                <p>You don't have any bookings yet.</p>
                <p>Start by searching for tickets!</p>
            </div>
        `;
        return;
    }

    bookingsContainer.innerHTML = appState.bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <div>
                    <div class="booking-id">Booking ID: ${booking.id}</div>
                    <h3>${booking.from} → ${booking.to}</h3>
                </div>
                <div class="booking-status confirmed">${booking.status.toUpperCase()}</div>
            </div>
            <div class="booking-details">
                <div class="detail-item">
                    <label>Travel Date</label>
                    <span>${formatDate(booking.date)}</span>
                </div>
                <div class="detail-item">
                    <label>Departure</label>
                    <span>${booking.departure}</span>
                </div>
                <div class="detail-item">
                    <label>Arrival</label>
                    <span>${booking.arrival}</span>
                </div>
                <div class="detail-item">
                    <label>Duration</label>
                    <span>${booking.duration}</span>
                </div>
                <div class="detail-item">
                    <label>Seats</label>
                    <span>${booking.seats.join(', ')}</span>
                </div>
                <div class="detail-item">
                    <label>Passengers</label>
                    <span>${booking.passengers}</span>
                </div>
                <div class="detail-item">
                    <label>Service Type</label>
                    <span>${booking.type}</span>
                </div>
                <div class="detail-item">
                    <label>Total Amount</label>
                    <span style="font-weight: bold; color: var(--primary-color);">PKR ${booking.totalPrice.toFixed(2)}</span>
                </div>
            </div>
            <div class="ticket-actions">
                <button class="btn-secondary" onclick="cancelBooking('${booking.id}')">Cancel Booking</button>
            </div>
        </div>
    `).join('');
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        appState.bookings = appState.bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('triptixBookings', JSON.stringify(appState.bookings));
        loadBookings();
        alert('Booking cancelled successfully');
    }
}

// Utility Functions

function calculateTotalPrice(seatsCount, pricePerSeat) {
    return seatsCount * pricePerSeat;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function canSelectMoreSeats(currentSeatsCount, maxPassengers) {
    return currentSeatsCount < maxPassengers;
}

function isValidCard(number, expiry, cvv) {
    // Basic validation logic
    if (number.length < 16) return false;
    if (expiry.length !== 5) return false;
    if (cvv.length !== 3) return false;

    // Expiry Date Validation
    const [monthStr, yearStr] = expiry.split('/');
    if (!monthStr || !yearStr) return false;

    const month = parseInt(monthStr, 10);
    const year = parseInt('20' + yearStr, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-indexed

    if (month < 1 || month > 12) return false;

    // Check if expired
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }

    return true;
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue.substring(0, 19);
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

function formatCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
}

// Registration Modal Functions
function openRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    modal.classList.add('active');
    document.getElementById('registration-form').reset();
}

function closeRegistrationModalFunc() {
    document.getElementById('registration-modal').classList.remove('active');
}

function handleRegistrationSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const termsAccepted = document.getElementById('reg-terms').checked;

    // Validation
    if (name.length < 2) {
        alert('Please enter a valid full name');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    if (phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (!termsAccepted) {
        alert('Please accept the Terms & Conditions to continue');
        return;
    }

    // Check if a user with this email is already registered
    const existingRaw = localStorage.getItem('triptixUser');
    if (existingRaw) {
        try {
            const existingUser = JSON.parse(existingRaw);
            if (existingUser.email && existingUser.email.toLowerCase() === email.toLowerCase()) {
                alert('This email is already registered. Please login instead.');
                return;
            }
        } catch (err) {
            console.warn('Could not parse existing user from localStorage:', err);
        }
    }

    // Store registration data (in a real app, this would be sent to a server)
    // NOTE: For demo only, password is stored in plain text in localStorage.
    const userData = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        registeredAt: new Date().toISOString()
    };

    // Save to localStorage (for demo purposes)
    localStorage.setItem('triptixUser', JSON.stringify(userData));

    // Show success message
    alert('Registration successful! Welcome to TripTix, ' + name + '!');

    // Close modal
    closeRegistrationModalFunc();

    // Update UI (in a real app, you might show the user's name instead of Register button)
    console.log('User registered:', userData);
}

// Login Modal Functions
function openLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.classList.add('active');
    document.getElementById('login-form').reset();
}

function closeLoginModalFunc() {
    document.getElementById('login-modal').classList.remove('active');
}

function handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const LOCK_DURATION_MINUTES = 2; // temporary lock duration (minutes)

    // Read existing attempts from localStorage
    const attemptsRaw = localStorage.getItem('triptixLoginAttempts');
    const attempts = attemptsRaw ? JSON.parse(attemptsRaw) : {};
    const now = Date.now();
    const record = attempts[email];

    // If user is currently locked
    if (record && record.lockedUntil && now < record.lockedUntil) {
        const remainingMs = record.lockedUntil - now;
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        alert(`Your account is temporarily locked due to multiple wrong attempts.\nPlease try again in about ${remainingMinutes} minute(s).`);
        return;
    }

    if (!email || password.length < 6) {
        alert('Please enter a valid email and password (at least 6 characters).');
        return;
    }

    const storedUser = localStorage.getItem('triptixUser');
    if (!storedUser) {
        alert('No account found. Please register first.');
        return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.email !== email || userData.password !== password) {
        // Wrong credentials: update attempts
        const newCount = record && record.count ? record.count + 1 : 1;
        const newRecord = { count: newCount, lastAttempt: now };

        if (newCount >= 3) {
            newRecord.lockedUntil = now + LOCK_DURATION_MINUTES * 60 * 1000;
            alert(`Too many wrong attempts. Your account is locked for ${LOCK_DURATION_MINUTES} minutes.`);
        } else {
            const remaining = 3 - newCount;
            alert(`Incorrect email or password. You have ${remaining} attempt(s) left before temporary lock.`);
        }

        attempts[email] = newRecord;
        localStorage.setItem('triptixLoginAttempts', JSON.stringify(attempts));
        return;
    }

    // Correct credentials: clear attempts and log in
    if (attempts[email]) {
        delete attempts[email];
        localStorage.setItem('triptixLoginAttempts', JSON.stringify(attempts));
    }

    localStorage.setItem('triptixLoggedInUser', JSON.stringify({
        email: email,
        loggedInAt: new Date().toISOString()
    }));

    alert('Login successful! Welcome back to TripTix.');
    closeLoginModalFunc();
}

// Popular Route Selection
function selectPopularRoute(from, to) {
    document.getElementById('from-city').value = from;
    document.getElementById('to-city').value = to;

    // Scroll to booking form smoothly
    document.querySelector('.booking-form-card').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Make functions available globally for onclick handlers
window.selectTicket = selectTicket;
window.cancelBooking = cancelBooking;
window.selectPopularRoute = selectPopularRoute;
window.toggleSeat = toggleSeat;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        appState,
        initApp
    };

}
