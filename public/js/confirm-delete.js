// delete confirmation

document.addEventListener("submit", (e) => {
  const form = e.target.closest(".delete-form");
  if (!form) return;
  if (!confirm(form.dataset.confirm)) e.preventDefault();
});
