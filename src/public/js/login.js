document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/sessions/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await response.json();

    if (response.ok) {
      alert("¡Login exitoso! Redirigiendo...");
      window.location.href = result.redirectTo;
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error en el fetch:", error);
    alert("No se pudo conectar con el servidor.");
  }
});
