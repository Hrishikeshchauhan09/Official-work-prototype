// ===================================
// Property Data Management
// ===================================

class PropertyManager {
    constructor() {
        this.properties = [];
        this.init();
    }

    init() {
        // Load properties from localStorage
        const stored = localStorage.getItem('sra_properties');
        if (stored) {
            this.properties = JSON.parse(stored);
        } else {
            // Initialize with sample data
            this.properties = this.getSampleProperties();
            this.save();
        }
    }

    // Get sample properties for initial setup
    getSampleProperties() {
        return [
            {
                id: 1,
                title: 'Luxury Villa in Pune',
                type: 'residential',
                location: 'Koregaon Park, Pune',
                price: 12500000,
                area: '3500 sq ft',
                bedrooms: 4,
                bathrooms: 3,
                description: 'Beautiful bank-sealed luxury villa with modern amenities, spacious rooms, and prime location.',
                image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
                status: 'available',
                visible: true,
                featured: true,
                dateAdded: new Date('2026-01-15').toISOString(),
                auctionDate: '2026-03-20'
            },
            {
                id: 2,
                title: 'Commercial Space in Mumbai',
                type: 'commercial',
                location: 'Andheri East, Mumbai',
                price: 25000000,
                area: '5000 sq ft',
                bedrooms: null,
                bathrooms: 4,
                description: 'Prime commercial property ideal for offices, retail, or showroom. Excellent connectivity and parking.',
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
                status: 'available',
                visible: true,
                featured: true,
                dateAdded: new Date('2026-01-20').toISOString(),
                auctionDate: '2026-03-25'
            },
            {
                id: 3,
                title: 'Residential Apartment',
                type: 'residential',
                location: 'Viman Nagar, Pune',
                price: 6500000,
                area: '1800 sq ft',
                bedrooms: 3,
                bathrooms: 2,
                description: 'Well-maintained 3BHK apartment in a gated community with all modern amenities.',
                image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
                status: 'available',
                visible: true,
                featured: false,
                dateAdded: new Date('2026-02-01').toISOString(),
                auctionDate: '2026-04-10'
            },
            {
                id: 4,
                title: 'Agricultural Land',
                type: 'land',
                location: 'Nashik Highway',
                price: 3500000,
                area: '2 acres',
                bedrooms: null,
                bathrooms: null,
                description: 'Fertile agricultural land with water supply, perfect for farming or future development.',
                image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
                status: 'available',
                visible: true,
                featured: false,
                dateAdded: new Date('2026-02-05').toISOString(),
                auctionDate: '2026-04-15'
            },
            {
                id: 5,
                title: 'Industrial Warehouse',
                type: 'commercial',
                location: 'Chakan, Pune',
                price: 18000000,
                area: '10000 sq ft',
                bedrooms: null,
                bathrooms: 2,
                description: 'Large warehouse facility with loading docks, office space, and excellent logistics connectivity.',
                image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
                status: 'available',
                visible: true,
                featured: false,
                dateAdded: new Date('2026-02-10').toISOString(),
                auctionDate: '2026-04-20'
            },
            {
                id: 6,
                title: 'Penthouse Apartment',
                type: 'residential',
                location: 'Bandra West, Mumbai',
                price: 35000000,
                area: '4500 sq ft',
                bedrooms: 5,
                bathrooms: 4,
                description: 'Luxurious penthouse with panoramic city views, private terrace, and premium finishes.',
                image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
                status: 'available',
                visible: true,
                featured: true,
                dateAdded: new Date('2026-02-12').toISOString(),
                auctionDate: '2026-04-25'
            }
        ];
    }

    // Save properties to localStorage
    save() {
        localStorage.setItem('sra_properties', JSON.stringify(this.properties));
    }

    // Get all properties
    getAll() {
        return this.properties;
    }

    // Get visible properties only
    getVisible() {
        return this.properties.filter(p => p.visible);
    }

    // Get featured properties
    getFeatured() {
        return this.properties.filter(p => p.visible && p.featured);
    }

    // Get property by ID
    getById(id) {
        return this.properties.find(p => p.id === parseInt(id));
    }

    // Filter properties
    filter(filters = {}) {
        let filtered = this.properties.filter(p => p.visible);

        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(p => p.type === filters.type);
        }

        if (filters.minPrice) {
            filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice));
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice));
        }

        if (filters.location) {
            const searchTerm = filters.location.toLowerCase();
            filtered = filtered.filter(p =>
                p.location.toLowerCase().includes(searchTerm) ||
                p.title.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    // Add new property
    add(propertyData) {
        const newProperty = {
            id: this.properties.length > 0 ? Math.max(...this.properties.map(p => p.id)) + 1 : 1,
            ...propertyData,
            dateAdded: new Date().toISOString(),
            status: propertyData.status || 'available',
            visible: propertyData.visible !== undefined ? propertyData.visible : true,
            featured: propertyData.featured || false
        };

        this.properties.push(newProperty);
        this.save();
        return { success: true, property: newProperty };
    }

    // Update property
    update(id, updates) {
        const index = this.properties.findIndex(p => p.id === parseInt(id));
        if (index === -1) {
            return { success: false, message: 'Property not found' };
        }

        this.properties[index] = { ...this.properties[index], ...updates };
        this.save();
        return { success: true, property: this.properties[index] };
    }

    // Delete property
    delete(id) {
        const index = this.properties.findIndex(p => p.id === parseInt(id));
        if (index === -1) {
            return { success: false, message: 'Property not found' };
        }

        this.properties.splice(index, 1);
        this.save();
        return { success: true, message: 'Property deleted' };
    }

    // Toggle visibility
    toggleVisibility(id) {
        const property = this.getById(id);
        if (!property) {
            return { success: false, message: 'Property not found' };
        }

        return this.update(id, { visible: !property.visible });
    }

    // Toggle featured status
    toggleFeatured(id) {
        const property = this.getById(id);
        if (!property) {
            return { success: false, message: 'Property not found' };
        }

        return this.update(id, { featured: !property.featured });
    }

    // Format price in Indian currency
    static formatPrice(price) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    }

    // Format date
    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Create global property manager instance
const propertyManager = new PropertyManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyManager;
}
