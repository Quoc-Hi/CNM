// Main JavaScript for product management system
document.addEventListener('DOMContentLoaded', function () {
  // Initialize tooltips if any
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Confirm before deleting
  document.querySelectorAll('a[onclick*="confirm"]').forEach((link) => {
    link.addEventListener('click', function (e) {
      if (!confirm(this.getAttribute('onclick').match(/'([^']*)'/)[1])) {
        e.preventDefault();
      }
    });
  });
});
