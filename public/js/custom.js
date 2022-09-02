document
  .getElementById('createAccountForm')
  .addEventListener('submit', validatePasswordMatch);

function validatePasswordMatch(event) {
  event.preventDefault();
  let password = document.getElementById('password').value;
  let confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    document.getElementById('confirmPassword').classList.add('is-invalid');
    document.getElementById('passwordMismatch').removeAttribute('hidden');
    return false;
  }
  document.getElementById('createAccountForm').submit();
}
