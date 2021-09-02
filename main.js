var gForm = document.getElementById("g-form");
var linkZap = document.getElementById("link-zap");

getLocation(0);
function getLocation(tentativas) {
  setTimeout(() => {
    if (tentativas < 5) {
      console.log("getLocation");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showFormPosition);
      } else {
        getLocation(tentativas++);
      }
    }
  }, 1000);
}

async function showFormPosition(position) {
  const searchPosition = await fetch(
    `https://geocode.xyz/?json=1&locate=${
      position.coords.latitude + "," + position.coords.longitude
    }`
  );

  const objPosition = await searchPosition.json();

  linkZap.href = `https://wa.me/5551935051715?text=Olá, sou de ${
    objPosition.country + " " + objPosition.region
  } vim pelo link do site`;

  gForm.innerHTML = `
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSfAzA4xChqMBbrP8_qBgrJt5uDEallOn5M3qj7DfVC5ub2tKw/viewform?usp=pp_url&entry.1973420573=${
      position.coords.latitude + ", " + position.coords.longitude
    }"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    id="g-form"
    class="img-fluid w-100 h-100"
    >Carregando…</iframe>
  `;
}
