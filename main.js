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
        if (searchCnpj.descricao_situacao_cadastral) {
          empresa = {
            cnpj: searchCnpj.cnpj,
            razao_social: searchCnpj.razao_social,
            setor: searchCnpj.cnae_fiscal_descricao,
            cep: searchCnpj.cep,
            uf: searchCnpj.uf,
            cidade: searchCnpj.municipio,
            tel: searchCnpj.ddd_telefone_1,
          };

          console.log("empresa", empresa);

          drawZap();
          drawGFrom();
        } else {
          getEmpresa();
        }
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
  console.log("empresa", empresa);

  drawZap();
  drawGFrom();
}

window.onload = function () {
  getLocation(0);
};

function getLocation(tentativas) {
  console.log("getLocation", new Date().getTime());
  setTimeout(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showFormPosition);
    } else if (tentativas < 5) {
      getLocation(tentativas++);
    }
  }, 2000);
}

function showFormPosition(position) {
  localisacao = { ...localisacao, geolocation: position };
  console.log("localisacao", localisacao);

  let endereco = `${localisacao.geolocation.coords.latitude}, ${localisacao.geolocation.coords.longitude}`;

  drawZap(endereco);
  drawGFrom();
  fetch(
    `https://geocode.xyz/?json=1&locate=${
      localisacao.geolocation.coords.latitude +
      "," +
      localisacao.geolocation.coords.longitude
    }`
  )
    .then(async (response) => {
      if (response.status == 200) {
        const objPosition = await response.json();

        localisacao = { ...localisacao, objPosition };

        console.log("localisacao", localisacao);

        drawGFrom();
      }
    })
    .catch((error) => console.log("error", error));
}

function drawZap(mensagem) {
  linkZap.href = "https://wa.me/5551935051715?text=Olá, " + mensagem;
}

function drawGFrom() {
  let gFrom = {
    nome: "",
    tel: "",
    msg: "",
    endereco: "",
  };

  if (localisacao) {
    if (localisacao.objPosition) {
      if (localisacao.objPosition.country) {
        gFrom.endereco =
          gFrom.endereco + `Cidade: ${localisacao.objPosition.country}, `;
      }
      if (localisacao.objPosition.region) {
        gFrom.endereco =
          gFrom.endereco + `UF: ${localisacao.objPosition.region}, `;
      }
    }
    if (localisacao.geolocation) {
      if (localisacao.geolocation.coords) {
        gFrom.endereco =
          gFrom.endereco +
          `GPS: ${localisacao.geolocation.coords.latitude}, ${localisacao.geolocation.coords.longitude}`;
      }
    }
  }

  if (empresa) {
    if (empresa.razao_social) {
      gFrom.nome = empresa.razao_social;
    }
    if (empresa.tel) {
      gFrom.tel = empresa.tel;
    }
    if (empresa.setor) {
      gFrom.msg = empresa.setor;
    }
    if (gFrom.endereco == "") {
      if (empresa.cep) {
        gFrom.endereco = gFrom.endereco + `CEP: ${empresa.cep}, `;
      }
      if (empresa.uf) {
        gFrom.endereco = gFrom.endereco + `UF: ${empresa.uf}, `;
      }
      if (empresa.cidade) {
        gFrom.endereco = gFrom.endereco + `Cidade: ${empresa.cidade}, `;
      }
    }
  }

  console.log("drawGFrom", gFrom);
  gForm.innerHTML = `
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSfAzA4xChqMBbrP8_qBgrJt5uDEallOn5M3qj7DfVC5ub2tKw/viewform?usp=pp_url&entry.1000020=${gFrom.nome}&entry.1000022=${gFrom.tel}&entry.1973420573=${gFrom.endereco}&entry.1594866438=${gFrom.msg}"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
          id="g-form"
          class="img-fluid w-100 h-100"
          >Carregando…</iframe>
        `;
}
