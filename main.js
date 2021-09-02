var gForm = document.getElementById("g-form");
var linkZap = document.getElementById("link-zap");
var tableSeachEmpresas = document.getElementById("seach-table-empresas");
var empresa;
var localisacao;
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

    fetch("https://brasilapi.com.br/api/cnpj/v1/" + cnpj)
      .then(async (response) => {
        const searchCnpj = await response.json();
        empresa = searchCnpj;
        console.log("searchCnpj", searchCnpj);

        let mensagem = `CNPJ: ${empresa.cnpj}, Razão Social: ${empresa.razao_social}, Setor: ${empresa.setor}, CEP: ${empresa.setor}, Estado: ${empresa.uf}, Cidade: ${empresa.cidade}`;

        if (localisacao) {
          if (localisacao.objPosition) {
            mensagem = `${localisacao.objPosition.country} ${localisacao.objPosition.region}`;
          }
          if (localisacao.geolocation) {
            mensagem =
              mensagem +
              `${localisacao.geolocation.coords.latitude}, ${localisacao.geolocation.coords.longitude}`;
          }
        }

        linkZap.href = "https://wa.me/5551935051715?text=Olá, " + mensagem;

        gForm.innerHTML = `
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSfAzA4xChqMBbrP8_qBgrJt5uDEallOn5M3qj7DfVC5ub2tKw/viewform?usp=pp_url&entry.1973420573=${mensagem}"
                frameborder="0"
                marginheight="0"
                marginwidth="0"
                id="g-form"
                class="img-fluid w-100 h-100"
                >Carregando…</iframe>
              `;
      })
      .catch((error) => console.log("error", error));
  } else {
    const name = window.prompt("Digite nome da empresa");

    fetch(
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
      .then(async (response) => {
        const searchName = await response.json();
        console.log("searchName", searchName);
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
      })
      .catch((error) => console.log("error", error));
  }
}

function modalTableSeachEmpresas(element) {
  const row = Array.from(element.cells);
  empresa = {
    cnpj: row[0].innerHTML,
    razao_social: row[1].innerHTML,
    setor: row[2].innerHTML,
    cep: row[3].innerHTML,
    uf: row[4].innerHTML,
    cidade: row[5].innerHTML,
  };
  modalEmpresas.toggle();
  console.log(empresa);
  console.log(localisacao);
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

function showFormPosition(position) {
  localisacao = { ...localisacao, geolocation: position };

  linkZap.href = `https://wa.me/5551935051715?text=Olá, sou de ${
    localisacao.geolocation.coords.latitude +
    ", " +
    localisacao.geolocation.coords.longitude
  } vim pelo link do site`;

  gForm.innerHTML = `
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSfAzA4xChqMBbrP8_qBgrJt5uDEallOn5M3qj7DfVC5ub2tKw/viewform?usp=pp_url&entry.1973420573=${
            localisacao.geolocation.coords.latitude +
            ", " +
            localisacao.geolocation.coords.longitude
          }"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
          id="g-form"
          class="img-fluid w-100 h-100"
          >Carregando…</iframe>
        `;

  fetch(
    `https://geocode.xyz/?json=1&locate=${
      localisacao.geolocation.coords.latitude +
      "," +
      localisacao.geolocation.coords.longitude
    }`
  )
    .then(async (response) => {
      const objPosition = await response.json();
      console.log("objPosition", objPosition);

      localisacao = { ...localisacao, objPosition };

      const mensagem = `${localisacao.objPosition.country} ${localisacao.objPosition.region} ${localisacao.geolocation.coords.latitude}, ${localisacao.geolocation.coords.longitude}`;

      linkZap.href = "https://wa.me/5551935051715?text=Olá, " + mensagem;

      gForm.innerHTML = `
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSfAzA4xChqMBbrP8_qBgrJt5uDEallOn5M3qj7DfVC5ub2tKw/viewform?usp=pp_url&entry.1973420573=${mensagem}"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
          id="g-form"
          class="img-fluid w-100 h-100"
          >Carregando…</iframe>
        `;
    })
    .catch((error) => console.log("error", error));
}
