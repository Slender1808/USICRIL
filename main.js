var gForm = document.getElementById("g-form");
var linkZap = document.getElementById("link-zap");
var tableSeachEmpresas = document.getElementById("seach-table-empresas");
var empresa;
var localisacao;
var modalBody = document.getElementById("modal-body");
var modalEmpresas;
var linkEmpresa = document.getElementById("get-empresa");

window.onload = function () {
  getLocation(0);
  modalEmpresas = new bootstrap.Modal(
    document.getElementById("modalEmpresas"),
    {
      keyboard: false,
    }
  );
};

async function getEmpresa() {
  linkEmpresa.innerHTML = `
  <div class="spinner-border text-primary position-fixed bottom-0 end-0 m-5" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
  `;

  if (!modalEmpresas) {
    modalEmpresas = new bootstrap.Modal(
      document.getElementById("modalEmpresas"),
      {
        keyboard: false,
      }
    );
  }

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
      .catch((error) => console.log("error", error))
      .finally(drawlinkEmpresa);
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
      .catch((error) => console.log("error", error))
      .finally(drawlinkEmpresa());
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

function getLocation(tentativas) {
  console.log("getLocation", new Date().getTime());
  setTimeout(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getPosition);
    } else if (tentativas < 5) {
      getLocation(tentativas++);
    }
  }, 2100);
}

function getPosition(position) {
  localisacao = { ...localisacao, geolocation: position };
  console.log("localisacao", localisacao);

  drawZap();
  drawGFrom();

  gpsToEndreco(0);
}

async function gpsToEndreco(tentativas) {
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
      } else if (response.status == 403) {
        // Tentar Novamente
        if (tentativas < 5) {
          setTimeout(gpsToEndreco(tentativas++), 5000);
        }
      }
    })
    .catch((error) => console.log("error", error));
}

function drawZap() {
  let endreco = "";
  let mensagem = "";

  if (localisacao) {
    if (localisacao.objPosition) {
      if (localisacao.objPosition.country) {
        endreco = endreco + `Cidade: ${localisacao.objPosition.country}, `;
      }
      if (localisacao.objPosition.region) {
        endreco = endreco + `UF: ${localisacao.objPosition.region}, `;
      }
    }
    if (localisacao.geolocation) {
      if (localisacao.geolocation.coords) {
        endreco =
          endreco +
          `GPS: ${localisacao.geolocation.coords.latitude} | ${localisacao.geolocation.coords.longitude}, `;
      }
    }
  }

  if (empresa) {
    if (empresa.razao_social) {
      mensagem = mensagem + `Nome: ${empresa.razao_social}, `;
    }
    if (empresa.tel) {
      mensagem = mensagem + `Telefone: ${empresa.tel}, `;
    }
    if (empresa.setor) {
      mensagem = mensagem + `Setor: ${empresa.setor}, `;
    }

    if (endreco == "") {
      if (empresa.cep) {
        endreco = endreco + `CEP: ${empresa.cep}, `;
      }
      if (empresa.uf) {
        endreco = endreco + `UF: ${empresa.uf}, `;
      }
      if (empresa.cidade) {
        endreco = endreco + `Cidade: ${empresa.cidade}, `;
      }
    }
  }

  if (mensagem != "") {
    if (endreco != "") {
      mensagem = mensagem + endreco;
    }

    console.log("drawZap", mensagem);
    linkZap.href = "https://wa.me/5551935051715?text=Olá, " + mensagem;
  }
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

function drawlinkEmpresa() {
  linkEmpresa.innerHTML = `
  <button
    type="button"
    class="btn btn-primary position-fixed bottom-0 end-0 m-5 shadow"
    onclick="getEmpresa()"
  >
    Qual sua empresa ?
    <span
      class="
        position-absolute
        top-0
        start-100
        translate-middle
        badge
        border border-light
        rounded-circle
        bg-danger
        p-2
      "
      ><span class="visually-hidden">unread messages</span></span
    >
  </button>
  `;
}
