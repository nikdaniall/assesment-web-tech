// Execute logic when DOM layout finishes loading safely
document.addEventListener("DOMContentLoaded", () => {
    
    const container = document.getElementById("animal-container");
    const modal = document.getElementById("animal-modal");
    const modalBody = document.getElementById("modal-body");
    const closeModal = document.querySelector(".close-modal");
    const filterButtons = document.querySelectorAll(".filter-btn");

    // Top Search Panel Elements
    const topSearchPanel = document.getElementById("top-search-bar-panel");
    const searchInput = document.getElementById("species-search-input");
    const closeSearchBtn = document.getElementById("close-top-search");
    const navSearchTrigger = document.getElementById("nav-search-trigger");
    const footerSearchTrigger = document.getElementById("footer-search-trigger");

    // Global reference placeholder for data array pulled from your JSON
    let speciesData = [];

    // ==========================================
    // 1. FETCH DATA FROM ANIMALS.JSON
    // ==========================================
    fetch("animals.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load animals data stream");
            }
            return response.json();
        })
        .then(data => {
            speciesData = data;
            displayAnimals(speciesData);
        })
        .catch(error => {
            console.error("Error fetching local database structure:", error);
            if (container) {
                container.innerHTML = `<div class="api-loading">Error loading endangered species dataset. Please refresh.</div>`;
            }
        });

    // ==========================================
    // 2. DYNAMIC ANIMAL CARD INJECTION
    // ==========================================
    function displayAnimals(data) {
        if (!container) return;
        container.innerHTML = ""; 

        data.forEach((animal, index) => {
            const card = document.createElement("div");
            const animalType = (animal.type || animal.category || "all").toLowerCase();
            
            card.className = `animal-card ${animalType}`;
            card.setAttribute("data-id", index);
            card.setAttribute("data-species", animalType);
            card.setAttribute("data-name", animal.name.toLowerCase());
            card.setAttribute("data-habitat", animal.habitat.toLowerCase());

            // TOOLTIPS ADDED HERE VIA THE 'title' ATTRIBUTE
            card.innerHTML = `
                <img src="${animal.img}" alt="${animal.name}">
                <div class="card-content">
                    <h3 style="font-family: 'Playfair Display', serif; color: white; margin-bottom: 5px;">${animal.name}</h3>
                    <p title="Faces an extremely high risk of extinction in the wild" style="color: var(--accent-orange); font-size: 0.85rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">${animal.status}</p>
                    <p title="Core geographic distribution" style="font-size: 0.9rem; opacity: 0.7;">Habitat: ${animal.habitat}</p>
                </div>
            `;

            card.addEventListener("click", () => openAnimalModal(animal));
            container.appendChild(card);
        });
    }

    // ==========================================
    // 3. CARD FILTERING EXECUTION ENGINE
    // ==========================================
    function filterSpecies(targetFilter) {
        const currentFilter = targetFilter.toLowerCase();
        
        filterButtons.forEach(btn => {
            const btnFilter = btn.getAttribute("data-filter").toLowerCase();
            if (btnFilter === currentFilter) {
                btn.style.background = "var(--accent-orange)";
                btn.style.color = "white";
                btn.style.border = "none";
                btn.classList.add("active");
            } else {
                btn.style.background = "#242424";
                btn.style.color = "#ccc";
                btn.style.border = "1px solid #444";
                btn.classList.remove("active");
            }
        });

        const animalCards = document.querySelectorAll(".animal-card");

        animalCards.forEach(card => {
            const cardSpeciesType = card.getAttribute("data-species");

            if (currentFilter === "all" || cardSpeciesType === currentFilter) {
                card.style.display = "block";
                setTimeout(() => {
                    card.style.opacity = "1";
                    card.style.transform = "scale(1)";
                }, 10);
            } else {
                card.style.display = "none";
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", function() {
            // Clear search bar text when user selects standard visual category filter tabs
            if (searchInput) searchInput.value = "";
            const selection = this.getAttribute("data-filter");
            filterSpecies(selection);
        });
    });

    const dropdownLinks = document.querySelectorAll(".dropdown-content a");
    dropdownLinks.forEach(link => {
        link.addEventListener("click", function() {
            if (searchInput) searchInput.value = "";
            const chosenFilter = this.getAttribute("data-nav-filter");
            filterSpecies(chosenFilter);
        });
    });

    // ==========================================
    // 4. TOP BAR SEARCH SLIDE INTERACTION LAYER
    // ==========================================
    function openTopSearchPanel() {
        if (!topSearchPanel) return;
        topSearchPanel.classList.add("active");
        if (searchInput) {
            searchInput.value = "";
            setTimeout(() => searchInput.focus(), 200);
        }
    }

    function closeTopSearchPanel() {
        if (!topSearchPanel) return;
        topSearchPanel.classList.remove("active");
        if (searchInput) searchInput.value = "";
        // Restore grid view cards status back to clear active defaults
        filterSpecies("all");
    }

    if (navSearchTrigger) {
        navSearchTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            openTopSearchPanel();
        });
    }

    if (footerSearchTrigger) {
        footerSearchTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            openTopSearchPanel();
            // Smoothly auto scroll back up towards the search bar focus frame area
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (closeSearchBtn) {
        closeSearchBtn.addEventListener("click", () => {
            closeTopSearchPanel();
        });
    }

    // Monitor instant live search keyboard typing input fields
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            const query = this.value.trim().toLowerCase();
            const animalCards = document.querySelectorAll(".animal-card");
            
            // Auto scroll down to view cards filtering live if user types
            const featuredSection = document.getElementById("featured-animals");
            if (featuredSection && query.length === 1) {
                featuredSection.scrollIntoView({ behavior: "smooth" });
            }

            // Sync visual button state tabs off while custom search typing runs
            filterButtons.forEach(btn => {
                btn.style.background = "#242424";
                btn.style.color = "#ccc";
                btn.style.border = "1px solid #444";
                btn.classList.remove("active");
            });

            let matchesCount = 0;

            animalCards.forEach(card => {
                const cardName = card.getAttribute("data-name") || "";
                const cardHabitat = card.getAttribute("data-habitat") || "";
                const cardSpecies = card.getAttribute("data-species") || "";

                if (
                    cardName.includes(query) || 
                    cardHabitat.includes(query) || 
                    cardSpecies.includes(query)
                ) {
                    card.style.display = "block";
                    card.style.opacity = "1";
                    card.style.transform = "scale(1)";
                    matchesCount++;
                } else {
                    card.style.display = "none";
                }
            });

            // Handle clean feedback if search query yields empty result sets
            const oldMsg = document.getElementById("search-empty-notice");
            if (oldMsg) oldMsg.remove();

            if (matchesCount === 0 && query.length > 0) {
                const emptyNotice = document.createElement("div");
                emptyNotice.id = "search-empty-notice";
                emptyNotice.className = "loader";
                emptyNotice.style.gridColumn = "1 / -1";
                emptyNotice.style.textAlign = "center";
                emptyNotice.style.color = "#888";
                emptyNotice.style.fontStyle = "italic";
                emptyNotice.textContent = `No species found matching "${this.value}"`;
                container.appendChild(emptyNotice);
            }
        });
    }

    // ==========================================
    // 5. DETAIL MODAL MANAGEMENT LAYER
    // ==========================================
    function openAnimalModal(animal) {
        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <div class="modal-header">
                <h2>${animal.name.toUpperCase()}</h2>
                <p style="color: var(--accent-orange); font-weight: bold; letter-spacing: 1px;">${animal.status.toUpperCase()}</p>
            </div>
            <div style="margin-top: 20px; line-height: 1.7;">
                <p style="font-size: 0.95rem; opacity: 0.85; margin-bottom: 15px;">${animal.threats || animal.desc}</p>
                
                <div class="stat-grid">
                    <div class="stat-item">
                        <b>Current Wild Population</b>
                        <p>${animal.pop}</p>
                    </div>
                    <div class="stat-item">
                        <b>Primary Habitat Range</b>
                        <p>${animal.habitat}</p>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; 
    }

    if (closeModal) {
        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeTopSearchPanel();
            if (modal) {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        }
    });

    // ==========================================
    // 6. ANIMATED MILESTONE COUNTER INTERPOLATOR
    // ==========================================
    const threatCounter = document.getElementById("threat-count");
    if (threatCounter) {
        const targetedNumber = 41415;
        const speedInterval = 40; 
        const adjustmentSteps = targetedNumber / (1500 / speedInterval); 
        let startingPoint = 0;

        const updateCounter = setInterval(() => {
            startingPoint += adjustmentSteps;
            if (startingPoint >= targetedNumber) {
                clearInterval(updateCounter);
                threatCounter.textContent = targetedNumber.toLocaleString();
            } else {
                threatCounter.textContent = Math.floor(startingPoint).toLocaleString();
            }
        }, speedInterval);
    }
});