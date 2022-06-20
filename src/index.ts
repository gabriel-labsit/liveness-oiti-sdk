import SdkSettings from "./Interfaces/Settings/SdkSettings";
import { startCapture } from "./Componentes/Sdk";
// import jQuery from "../node_modules/jquery/dist/jquery.min.js";
import jQuery from "jquery";

const sdkSettings: SdkSettings = {
  cpf: "33199707807",
  nome: "Luis Pimenta",
  nascimento: "29/08/1989",
  user: "provadevida",
  pass: "20a872f79875d1633e87fcd8b16e891c",
  fcvarUrlbase: "https://comercial.certiface.com.br:443",
};

// Gera credencial de acesso. Deve ser feita no backend
function gerarCredencial() {
  var data = jQuery.param({
    user: sdkSettings.user,
    pass: sdkSettings.pass,
  });

  console.log("gerei a credencial.");

  jQuery.support.cors = true;
  jQuery.ajax({
    type: "POST",
    url: sdkSettings.fcvarUrlbase + "/facecaptcha/service/captcha/credencial",
    data: data,
    crossDomain: true,
    async: true,
    headers: {
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
    success: function (data, textStatus, xhr) {
      // ex: {"token":"V-zI5XK4bnlNVPSByxMeR9cHFpvAcdBypEFLU649aEQ","expires":"24/01/2019 22:51:20"}
      gerarAppkey(data);
    },
    error: function (xhr, textStatus) {
      console.log(textStatus);
      console.log(xhr);
    },
  });
}

// Gera appkey de acesso. Deve ser feita no backend.
function gerarAppkey(chavePrivada) {
  var data = jQuery.param({
    user: sdkSettings.user,
    token: JSON.stringify(chavePrivada),
    cpf: sdkSettings.cpf,
    nome: sdkSettings.nome,
    nascimento: sdkSettings.nascimento,
  });

  console.log("gerei a appkey.");

  jQuery.support.cors = true;
  jQuery.ajax({
    type: "POST",
    url: sdkSettings.fcvarUrlbase + "/facecaptcha/service/captcha/appkey",
    data: data,
    crossDomain: true,
    async: true,
    headers: {
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
    success: function (data, textStatus, xhr) {
      // ex: {"appkey":"HS256.payload.secret"}
      let appkey = data.appkey;
      // inicializa captura dos desafios.
      startCapture(appkey);
    },
    error: function (xhr, textStatus) {
      console.log(textStatus);
      console.log(xhr);
    },
  });
}

// gerarCredencial();
