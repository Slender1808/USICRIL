var gForm = document.getElementById("g-form");
var linkZap = document.getElementById("link-zap");
var tableSeachEmpresas = document.getElementById("seach-table-empresas")
var empresa;
var modalBody = document.getElementById("modal-body");
var modalEmpresas;

async function getEmpresa() {
  modalEmpresas = new bootstrap.Modal(
    document.getElementById("modalEmpresas"),
    {
      keyboard: false,
    }
  );

  if (window.confirm("Sabe o CNPJ ?")) {
    const cnpj = window.prompt("Digite CNPJ");
    console.log("https://brasilapi.com.br/api/cnpj/v1/${cnpj}");
  } else {
    const name = window.prompt("Digite nome da empresa");
    console.log(name);

    const searchName = await fetch(
      "https://www.econodata.com.br/consulta-empresa/api/ecdt-busca/searchCompaniesSite",
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json;charset=UTF-8",
        }),
        body: JSON.stringify({ input: name }),
        redirect: "follow",
      }
    )
      .then((response) => response.json())
      .catch((error) => console.log("error", error));

    console.log(searchName);

    let result = "";
    searchName.companies.forEach((e) => {
      if (e.tp_situacao == "ATIVA") {
        result =
          result +
          `
        <tr onclick="modalTableSeachEmpresas(this)">
          <th>${e.cd_cnpj}</th>
          <td>${e.razao_social}</td>
          <td>${e.nm_ativ_econ_primaria}</td>
          <td>${e.cep}</td>
          <td>${e.uf}</td>
          <td>${e.cidade}</td>
        </tr>
      `;
      }
    });

    modalBody.innerHTML = result;

    modalEmpresas.show();
  }
}

function modalTableSeachEmpresas(element){
  const row = Array.from(element.cells)
  empresa = row.map(cell => cell.innerText)
  modalEmpresas.toggle()
}

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
