// Utility functions for the blog frontend

/**
 * Formats a date string into a more readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date.
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Scrolls to the top of the page smoothly.
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Toggles the visibility of an element.
 * @param {HTMLElement} element - The element to toggle.
 */
function toggleVisibility(element) {
    if (element.style.display === 'none' || element.style.display === '') {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

// Exporting utility functions for use in other modules
export { formatDate, scrollToTop, toggleVisibility };