# Requirements Document

## Introduction

This document defines requirements for adding four new capabilities to the SuperConnect platform:

1. **Phone Repair Services** — customers can find and book technicians who repair smartphones and mobile devices.
2. **Computer Repair Services** — customers can find and book technicians who repair laptops, desktops, and peripherals.
3. **Phone Buy & Sell Marketplace** — users can list phones for sale and browse/purchase phones from other users.
4. **Computer Buy & Sell Marketplace** — users can list computers/laptops for sale and browse/purchase them from other users.

The repair services extend the existing service-booking system (Provider → Booking → Paystack flow). The buy/sell marketplaces introduce a new peer-to-peer listing model with its own data entities, search, and payment flow, all integrated into the existing SuperConnect frontend and backend.

---

## Glossary

- **SuperConnect**: The existing service marketplace platform (frontend: React/TypeScript, backend: Node.js/Express/TypeScript, database: MongoDB).
- **Customer**: An authenticated user with role `customer` who books repair services or buys devices.
- **Provider**: An authenticated user with role `provider` who offers repair services.
- **Seller**: An authenticated user (customer or provider) who lists a device for sale in the marketplace.
- **Buyer**: An authenticated user who purchases a device listing in the marketplace.
- **Repair_Booking**: An instance of the existing `Booking` model used for a phone or computer repair job.
- **Device_Listing**: A marketplace record representing a phone or computer offered for sale.
- **Repair_Category**: One of the two repair service categories: `Phone Repair` or `Computer Repair`.
- **Device_Type**: The classification of a marketplace listing: `phone` or `computer`.
- **Listing_Status**: The state of a Device_Listing: `active`, `sold`, or `removed`.
- **Payment_Gateway**: The existing Paystack integration used for processing payments.
- **Admin**: An authenticated user with role `admin` who manages the platform.
- **Search_Service**: The existing search and filter system used to discover providers and listings.
- **Chat_Service**: The existing Socket.io-based messaging system tied to bookings.

---

## Requirements

### Requirement 1: Phone Repair Service Category

**User Story:** As a customer, I want to search for and book phone repair technicians, so that I can get my smartphone fixed by a verified local professional.

#### Acceptance Criteria

1. THE SuperConnect SHALL include `Phone Repair` as a selectable service category in the `SERVICE_CATEGORIES` list alongside existing categories.
2. WHEN a Customer selects the `Phone Repair` category on the Home page, THE Search_Service SHALL display only Provider profiles whose category is `Phone Repair`.
3. WHEN a Customer views a `Phone Repair` Provider profile, THE SuperConnect SHALL display the provider's listed repair skills (e.g., screen replacement, battery replacement, water damage), hourly rate, location, rating, and availability.
4. WHEN a Customer submits a repair booking for a `Phone Repair` Provider, THE SuperConnect SHALL require the Customer to specify the device brand, device model, and a description of the fault.
5. WHEN a `Phone Repair` Repair_Booking is created, THE Payment_Gateway SHALL process the payment using the existing Paystack split-payment flow before confirming the booking.
6. IF a `Phone Repair` Provider is unavailable (`isAvailable: false`), THEN THE SuperConnect SHALL display the provider as unavailable and SHALL prevent new Repair_Booking creation for that provider.
7. WHEN a `Phone Repair` Repair_Booking reaches `completed` status, THE SuperConnect SHALL allow the Customer to submit a rating between 1 and 5 and a written review for the Provider.

---

### Requirement 2: Computer Repair Service Category

**User Story:** As a customer, I want to search for and book computer repair technicians, so that I can get my laptop or desktop repaired by a verified local professional.

#### Acceptance Criteria

1. THE SuperConnect SHALL include `Computer Repair` as a selectable service category in the `SERVICE_CATEGORIES` list alongside existing categories.
2. WHEN a Customer selects the `Computer Repair` category on the Home page, THE Search_Service SHALL display only Provider profiles whose category is `Computer Repair`.
3. WHEN a Customer views a `Computer Repair` Provider profile, THE SuperConnect SHALL display the provider's listed repair skills (e.g., OS reinstall, hardware upgrade, virus removal), hourly rate, location, rating, and availability.
4. WHEN a Customer submits a repair booking for a `Computer Repair` Provider, THE SuperConnect SHALL require the Customer to specify the device type (laptop or desktop), device brand, device model, and a description of the fault.
5. WHEN a `Computer Repair` Repair_Booking is created, THE Payment_Gateway SHALL process the payment using the existing Paystack split-payment flow before confirming the booking.
6. IF a `Computer Repair` Provider is unavailable (`isAvailable: false`), THEN THE SuperConnect SHALL display the provider as unavailable and SHALL prevent new Repair_Booking creation for that provider.
7. WHEN a `Computer Repair` Repair_Booking reaches `completed` status, THE SuperConnect SHALL allow the Customer to submit a rating between 1 and 5 and a written review for the Provider.

---

### Requirement 3: Repair Provider Profile Setup

**User Story:** As a provider, I want to set up a repair-specific profile, so that customers can find me and understand my repair specialisations.

#### Acceptance Criteria

1. WHEN a Provider selects `Phone Repair` or `Computer Repair` as their service category, THE SuperConnect SHALL allow the Provider to enter repair-specific skills as a comma-separated list.
2. THE SuperConnect SHALL allow a Provider to set their `isAvailable` status to `true` or `false` from the Provider Dashboard at any time.
3. WHEN a Provider saves a profile with category `Phone Repair` or `Computer Repair`, THE SuperConnect SHALL store the profile using the existing `Provider` model with the selected Repair_Category value.
4. WHEN a Provider has not yet set up a bank account via Paystack, THE SuperConnect SHALL display a warning on the Provider Dashboard and SHALL prevent customers from completing payment for that provider's bookings.

---

### Requirement 4: Phone Marketplace — Listing Creation

**User Story:** As a seller, I want to list a phone for sale, so that other users on the platform can discover and purchase it.

#### Acceptance Criteria

1. WHEN an authenticated user submits a new phone listing, THE SuperConnect SHALL create a Device_Listing record with `device_type: phone`, title, description, price (in NGN), condition (`new`, `fairly-used`, or `refurbished`), brand, model, storage capacity, colour, at least one image URL, seller reference, state, and city.
2. THE SuperConnect SHALL assign a default Listing_Status of `active` to every newly created Device_Listing.
3. IF a required field (title, price, condition, brand, model, state, city, or at least one image) is missing when creating a phone listing, THEN THE SuperConnect SHALL return a descriptive validation error and SHALL NOT create the Device_Listing.
4. WHEN a Seller submits a price less than ₦1 for a phone listing, THE SuperConnect SHALL return a validation error stating that the price must be at least ₦1.
5. THE SuperConnect SHALL allow a Seller to upload between 1 and 6 images per Device_Listing.

---

### Requirement 5: Computer Marketplace — Listing Creation

**User Story:** As a seller, I want to list a computer or laptop for sale, so that other users on the platform can discover and purchase it.

#### Acceptance Criteria

1. WHEN an authenticated user submits a new computer listing, THE SuperConnect SHALL create a Device_Listing record with `device_type: computer`, title, description, price (in NGN), condition (`new`, `fairly-used`, or `refurbished`), brand, model, RAM size, storage size, processor, colour, at least one image URL, seller reference, state, and city.
2. THE SuperConnect SHALL assign a default Listing_Status of `active` to every newly created Device_Listing.
3. IF a required field (title, price, condition, brand, model, state, city, or at least one image) is missing when creating a computer listing, THEN THE SuperConnect SHALL return a descriptive validation error and SHALL NOT create the Device_Listing.
4. WHEN a Seller submits a price less than ₦1 for a computer listing, THE SuperConnect SHALL return a validation error stating that the price must be at least ₦1.
5. THE SuperConnect SHALL allow a Seller to upload between 1 and 6 images per Device_Listing.

---

### Requirement 6: Marketplace Search and Browse

**User Story:** As a buyer, I want to search and filter device listings, so that I can quickly find phones or computers that match my needs and budget.

#### Acceptance Criteria

1. THE SuperConnect SHALL provide a dedicated Marketplace page accessible from the main navigation that displays all Device_Listings with Listing_Status `active`.
2. WHEN a Buyer applies a Device_Type filter (`phone` or `computer`), THE Search_Service SHALL return only Device_Listings matching the selected Device_Type.
3. WHEN a Buyer applies a state filter, THE Search_Service SHALL return only Device_Listings whose `state` field matches the selected state.
4. WHEN a Buyer applies a price range filter (minimum and maximum), THE Search_Service SHALL return only Device_Listings whose price falls within the specified range (inclusive).
5. WHEN a Buyer applies a condition filter (`new`, `fairly-used`, or `refurbished`), THE Search_Service SHALL return only Device_Listings matching the selected condition.
6. WHEN a Buyer enters a keyword in the marketplace search field, THE Search_Service SHALL return Device_Listings whose title, brand, or model contains the keyword (case-insensitive).
7. WHEN multiple filters are applied simultaneously, THE Search_Service SHALL return only Device_Listings that satisfy all active filters.
8. WHEN no Device_Listings match the applied filters, THE SuperConnect SHALL display a message indicating no results were found.

---

### Requirement 7: Marketplace Listing Detail

**User Story:** As a buyer, I want to view the full details of a device listing, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. WHEN a Buyer navigates to a Device_Listing detail page, THE SuperConnect SHALL display the listing title, all images, price, condition, brand, model, description, seller name, seller location (state and city), and listing date.
2. WHEN a Device_Listing has `device_type: phone`, THE SuperConnect SHALL additionally display storage capacity and colour on the detail page.
3. WHEN a Device_Listing has `device_type: computer`, THE SuperConnect SHALL additionally display RAM size, storage size, processor, and colour on the detail page.
4. WHEN a Buyer views a Device_Listing detail page, THE SuperConnect SHALL display a "Buy Now" button if the Listing_Status is `active`.
5. WHEN a Device_Listing has Listing_Status `sold` or `removed`, THE SuperConnect SHALL display the listing as unavailable and SHALL NOT display the "Buy Now" button.

---

### Requirement 8: Marketplace Purchase Flow

**User Story:** As a buyer, I want to purchase a device listing securely, so that I can pay and receive confirmation of my order.

#### Acceptance Criteria

1. WHEN a Buyer clicks "Buy Now" on an `active` Device_Listing, THE Payment_Gateway SHALL initiate a Paystack payment for the full listing price.
2. WHEN the Payment_Gateway confirms a successful payment, THE SuperConnect SHALL update the Device_Listing Listing_Status to `sold` and SHALL record the Buyer reference and payment reference on the Device_Listing.
3. WHEN the Payment_Gateway confirms a successful payment, THE SuperConnect SHALL send an in-app notification to the Seller indicating that their listing has been sold.
4. IF the Payment_Gateway returns a failed or cancelled payment, THEN THE SuperConnect SHALL retain the Device_Listing Listing_Status as `active` and SHALL display an error message to the Buyer.
5. WHEN a Device_Listing Listing_Status is updated to `sold`, THE SuperConnect SHALL prevent any subsequent purchase attempts on that listing.

---

### Requirement 9: Seller Listing Management

**User Story:** As a seller, I want to manage my device listings, so that I can edit, mark as sold, or remove listings I no longer want to offer.

#### Acceptance Criteria

1. WHEN a Seller navigates to their dashboard, THE SuperConnect SHALL display all Device_Listings created by that Seller, grouped by Listing_Status.
2. WHEN a Seller edits an `active` Device_Listing, THE SuperConnect SHALL update the stored Device_Listing with the new values and SHALL retain the original creation date.
3. WHEN a Seller removes a Device_Listing, THE SuperConnect SHALL update the Listing_Status to `removed` and SHALL no longer display the listing in marketplace search results.
4. WHILE a Device_Listing has Listing_Status `sold`, THE SuperConnect SHALL prevent the Seller from editing the listing price or condition.
5. THE SuperConnect SHALL display the total count of active, sold, and removed listings on the Seller's dashboard.

---

### Requirement 10: Admin Moderation

**User Story:** As an admin, I want to moderate device listings and repair providers, so that I can maintain platform quality and remove inappropriate content.

#### Acceptance Criteria

1. WHEN an Admin navigates to the Admin Dashboard, THE SuperConnect SHALL display a list of all Device_Listings with their Listing_Status, Seller name, Device_Type, price, and creation date.
2. WHEN an Admin removes a Device_Listing, THE SuperConnect SHALL update the Listing_Status to `removed` and SHALL no longer display the listing in marketplace search results.
3. WHEN an Admin navigates to the Admin Dashboard, THE SuperConnect SHALL display all Provider profiles with category `Phone Repair` or `Computer Repair`, including their name, rating, total bookings, and availability status.
4. WHEN an Admin deactivates a Provider profile, THE SuperConnect SHALL set the Provider's `isAvailable` to `false` and SHALL prevent new Repair_Booking creation for that provider.
5. THE SuperConnect SHALL display the total count of active marketplace listings, total repair bookings, and total marketplace transactions on the Admin Dashboard summary.

---

### Requirement 11: Notifications and Messaging

**User Story:** As a user, I want to receive relevant notifications and be able to message the other party, so that I can stay informed and coordinate effectively.

#### Acceptance Criteria

1. WHEN a Repair_Booking status changes (accepted, in-progress, completed, or cancelled), THE SuperConnect SHALL display an updated status indicator to both the Customer and the Provider on their respective dashboards.
2. WHEN a Repair_Booking is created, THE Chat_Service SHALL create a chat room associated with that Repair_Booking, allowing the Customer and Provider to exchange messages.
3. WHEN a Device_Listing is purchased, THE SuperConnect SHALL display the Seller's contact information (name and phone number) to the Buyer on the order confirmation screen.
4. WHEN a Device_Listing is purchased, THE SuperConnect SHALL display the Buyer's contact information (name and phone number) to the Seller via an in-app notification.

