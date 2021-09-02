var gForm = document.getElementById("g-form");
var linkZap = document.getElementById("link-zap");
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
        <tr>
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

    /*
    bairro: "REBOUCAS"
    cd_ativ_econ_primaria: "M-7120-1/00"
    cd_cnpj: "00.948.771/0001-05"
    cep: "16.400-697"
    cidade: "LINS"
    complemento: null
    ds_dominio: {totalSites: 0, ds_dominio: ''}
    ds_telefone: {totalPhones: 0, ds_telefone: ''}
    dt_abertura: "1995-12-01T00:00:00.000Z"
    grupo_economico: {qtd_exibicao_funcionarios_ate: 11, vlr_exibicao_faturamento_de: 81001, vlr_exibicao_faturamento_ate: 360001, qtd_exibicao_funcionarios_de: ''}
    logradouro: "RUA GUARARAPES"
    nm_ativ_econ_primaria: "Testes e análises técnicas"
    nm_fantasia: null
    numero: "376"
    razao_social: "BILL - TESTES E ANALISES TECNICAS LTDA"
    tp_situacao: "ATIVA"
    tp_unidade: "MATRIZ"
    uf: "SP"
    vlr_capital_social: 5000
    */
    /*
    <tr>
                  <td>
                    <p>0115454</p>
                    <h5>titulo</h5>
                    <h6>subtitulo</h6>
                  </td>
                  <td>av. teste</td>
                  <td>51 123456789</td>
                </tr>
    */
  }
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
