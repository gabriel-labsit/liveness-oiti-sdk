"use strict";

import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import BiometricsIds from "../Interfaces/Responses/BiometricIds";
import {
  GeneralInformation,
  NoCamera,
} from "../Interfaces/Settings/GeneralInfo";

import jQuery from "jquery";
import $ from "jquery";

import Errors from "../Interfaces/Settings/Errors";

let fcvarUrlbase = "https://comercial.certiface.com.br:443";
let appkey = "";

let fcvarChkey;
let fcvarChallenge = "";
let fcvarTime;
let fcvarSnapFrequenceInMillis: number = 0;

let fcvarInChallenge = false;
let fcvarIntervalSnap;
let fcvarIntervalChallege;
let fcvarIntervalTimer;

// foto
let fcvarCurCha: any;
let fcvarSnaps = "";
let fcvarFirstSnap = "";

// crop
let canvasW = 320;
let canvasH = 480;

let canContinue = true;

(function startCamera() {
  // get video element
  let video = document.getElementById("player")! as HTMLMediaElement;
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");

  // ajusta as configurações de video
  let constraints = {
    audio: false,
    video: {
      width: { exact: 640 },
      height: { exact: 480 },
      facingMode: "",
    },
  };

  // se mobile, ajusta configurações de video para mobile
  if (isMobile()) {
    constraints = {
      audio: false,
      video: {
        width: { exact: 1280 },
        height: { exact: 720 },
        facingMode: "user", // câmera frontal
      },
    };
  }

  // tenta abrir a câmera de video
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function success(stream) {
      video.srcObject = stream;

      // exibe botão INICIAR
      $("#divButton").fadeIn();
      $("#divMsg").fadeIn(700, function () {
        window.setTimeout(function () {
          $("#divMsg").fadeOut(700, function () {});
        }, 1000);
      });

      stopCameraInternal(stream);
    })
    .catch(function (err) {
      canContinue = false;
      addMessage("No camera! " + err);
      Swal.fire({
        title: NoCamera.title_noCamera,
        text: NoCamera.subTitle_noCamera,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
      }).then(() => location.reload());
    });
})();

const stopCameraInternal = (stream: any) =>
  stream.getVideoTracks().forEach((track: { stop: () => any }) => track.stop());

// inicia captura dos desafios.
function startCapture(appKeyParameter: string) {
  appkey = appKeyParameter;
  if (!canContinue) {
    Swal.fire({
      title: NoCamera.title_noCamera,
      text: NoCamera.subTitle_noCamera,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then(() => location.reload());
  }

  // esconde o botão e exibe loader
  $("#divButton").fadeOut();
  $("#divLoader").fadeIn();

  $("#spanMsg").text(GeneralInformation.gettingStarted);
  $("#divMsg").fadeIn(1000, function () {
    startChallenge("");
  });
}

// Busca novos desafios
function startChallenge(p) {
  let data = "?nc=" + new Date().getTime() + "&appkey=" + appkey + "&p=" + p;

  $.support.cors = true;
  $.ajax({
    type: "POST",
    url: fcvarUrlbase + "/facecaptcha/service/captcha/challenge",
    data: data,
    crossDomain: true,
    async: true,
    headers: {
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
    success: function (response) {
      try {
        // resposta da requisição dos desafios
        response = JSON.parse(decChData(response));

        fcvarChkey = response.chkey; // chave da requisição
        fcvarChallenge = response.challenges; // desafios da requisição   [2]
        fcvarTime = response.totalTime; // tempo total de todos os desafios (seg)   [8]
        fcvarSnapFrequenceInMillis = response.snapFrequenceInMillis; // tempo para cada snap (mseg)  [1990]

        $("#divLoader").fadeOut(700);
        $("#divMsg").fadeOut(700, function () {
          // prepara os desafios
          prepareChallenge();
        });
      } catch (e) {
        console.log(e);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("ERROR");
      fcvarInChallenge = true;

      Swal.fire({
        title: "errorStartChallengeTitle",
        text: "errorStartChallengeMsg",
        confirmButtonText: "btnTryAgain",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
      }).then(() => location.reload());
    },
  });
}

// Preparar desafios
function prepareChallenge() {
  // Intervalo de captura de image do video
  fcvarIntervalSnap = setInterval(function () {
    snapTick();
  }, fcvarSnapFrequenceInMillis);

  // aguarda fcvarTime em segundos para finalizar os desafios
  fcvarIntervalTimer = setInterval(function () {
    clearInterval(fcvarIntervalSnap);
    clearInterval(fcvarIntervalChallege);
    clearInterval(fcvarIntervalTimer);

    $("#divMsg").fadeOut(700, function () {
      stopChallenge();
    });
  }, fcvarTime * 1000);

  // exibe os desafios na tela
  showChallengeTick(fcvarChallenge, 0);
}

// Exibir desafios
function showChallengeTick(challenges, i) {
  fcvarCurCha = challenges[i];

  $("#imgMsg").attr("src", "");
  $("#spanMsg").text("");
  $("#divMsg").hide();
  $("#divSorriso").hide();

  // atribui imagem Desafio (msg)
  $("#imgMsg").attr("src", "data:image/png;base64," + challenges[i].mensagem);
  $("#divMsg").fadeIn();
  $("#divMsg").fadeOut(challenges[i].tempoEmSegundos * 1000); //exibe a mensagem do desafio pelo periodo de challenges[i].tempoEmSegundos

  // atribui imagem Desafio (emojji)
  $("#imgChallenge").attr(
    "src",
    "data:image/png;base64," + challenges[i].tipoFace.imagem
  );
  $("#divSorriso").fadeIn();
  $("#divSorriso").fadeOut(challenges[i].tempoEmSegundos * 1000); //exibe o emojji do desafio pelo periodo de challenges[i].tempoEmSegundos

  fcvarIntervalChallege = setTimeout(function () {
    // Proximo desafio. Recursive
    showChallengeTick(challenges, ++i);
  }, challenges[i].tempoEmSegundos * 1000);
}

// prepara captura de imagem
function snapTick() {
  let snapb64 = snap();
  let snaps: Array<string> = [];

  if (fcvarFirstSnap === "") {
    fcvarFirstSnap = snapb64;
  }

  // necessario adicionar o codigo do tipoFace entre o 'data:image/jpeg' e o snapb64
  snaps = snapb64.split("data:image/jpeg;base64,");
  snapb64 =
    "data:image/jpeg;base64," +
    snaps[0] +
    "type:" +
    fcvarCurCha.tipoFace.codigo +
    "," +
    snaps[1];

  fcvarSnaps += snapb64;
}

// captura imagem da câmera
function snap() {
  let video = document.querySelector("video")!;
  let canvas = document.getElementById("fc_canvas")! as HTMLCanvasElement;
  let ctx = canvas.getContext("2d")!;

  ctx.canvas.width = 320;
  ctx.canvas.height = 480;

  let ratio = video.videoWidth / video.videoHeight;
  let widthReal = 0,
    heightReal = 0;

  let startX = 0,
    startY = 0;

  if (ratio >= 1) {
    // paisagem
    widthReal = video.videoHeight / 1.5;
    heightReal = video.videoHeight;

    startX = (video.videoWidth - widthReal) / 2;
    startY = 0;
  } else {
    // retrato
    ratio = video.videoHeight / video.videoWidth;

    // verifica proporção
    if (ratio > 1.5) {
      widthReal = video.videoWidth;
      heightReal = video.videoWidth * 1.5;

      startX = 0;
      startY = (video.videoHeight - heightReal) / 2;
    } else {
      widthReal = video.videoHeight / 1.5;
      heightReal = video.videoHeight;

      startX = (video.videoWidth - widthReal) / 2;
      startY = 0;
    }
  }

  // crop image video
  ctx.drawImage(
    video,
    startX,
    startY,
    widthReal,
    heightReal,
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height
  );

  let img = new Image();
  img.src = canvas.toDataURL("image/jpeg");

  return img.src;
}

// finaliza desafios
function stopChallenge() {
  $("#imgMsg").attr("src", "");
  $("#divLoader").fadeIn();
  $("#spanMsg").text(GeneralInformation.wait);
  $("#divMsg").fadeIn();

  // encripta as imagens
  let data = $.param({
    appkey: appkey,
    chkey: fcvarChkey,
    images: encChData(fcvarSnaps),
  });
  jQuery.support.cors = true;
  jQuery.ajax({
    type: "POST",
    url:
      fcvarUrlbase +
      "/facecaptcha/service/captcha" +
      "?nc=" +
      new Date().getTime(),
    crossDomain: true,
    async: true,
    headers: {
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    data: data,
    success: function (response) {
      $("#divLoader").fadeOut();
      $("#divMsg").fadeOut();

      response.snap = fcvarFirstSnap;
      if (response.valid) {
        // passou no prova de vida e biometria
        checkAnimStart();
      } else {
        // reprovou no prova de vida ou na biometria
        crossAnimStart(response);
      }

      // informa resltados
      onFinishFaceCaptcha(response);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#divLoader").fadeOut();
      Swal.fire({
        title: Errors.errorStopChallengeTitle,
        text: Errors.errorStopChallengeMsg,
        confirmButtonText: "btnTryAgain",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
      }).then(() => location.reload());
    },
    beforeSend: function (xhr) {},
  });
}
// exibe mensagem de sucesso
function checkAnimStart() {
  Swal.fire({
    title: GeneralInformation.finishedTitle,
    text: GeneralInformation.finishedMsg,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
  }).then(() => location.reload());
}

// exibe informação de insucesso
function crossAnimStart(responseCaptcha) {
  let codID = responseCaptcha.codID;
  let msg = BiometricsIds[codID] || BiometricsIds.biometricCodID;

  Swal.fire({
    title: GeneralInformation.infoTitle,
    text: msg,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
  }).then(() => location.reload());
}

// use este metodo para informar o backend
function onFinishFaceCaptcha(response) {
  console.log("onFinishFaceCaptcha");
  console.log(response);

  /*
    Ex:
    $.ajax({
        type: 'POST',
        url: '/result',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(response),
        dataType: 'json',
        success: function(res){
            // sucesso
        },
        error: function(res){
            // ops!
        }        
    });
    */
}

function addMessage(msg) {
  console.log(msg);
}

// verifica se o navegador é um dispositivo mobile
function isMobile() {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    return true;
  }
  return false;
}

/* SECURITY */
function padMsg(source) {
  let paddingChar = " ";
  let size = 16;
  let x = source.length % size;
  let padLength = size - x;
  for (let i = 0; i < padLength; i++) source += paddingChar;
  return source;
}

function padKey(source) {
  if (source.length > 16) {
    return source.substring(0, 16);
  }
  return padMsg(source);
}

function decChData(data) {
  let key = CryptoJS.enc.Latin1.parse(padKey(appkey));
  let iv = CryptoJS.enc.Latin1.parse(
    padKey(appkey.split("").reverse().join(""))
  );
  let decripted2 = CryptoJS.enc.Utf8.stringify(
    CryptoJS.AES.decrypt(data, key, {
      iv: iv,
      padding: CryptoJS.pad.NoPadding,
      mode: CryptoJS.mode.CBC,
    })
  );
  decripted2 = decripted2.substring(0, decripted2.lastIndexOf("}") + 1);
  decripted2 = decripted2.trim();
  return decripted2;
}

function encChData(data) {
  //var appkey = appkey;
  let key = CryptoJS.enc.Latin1.parse(padKey(appkey));
  let iv = CryptoJS.enc.Latin1.parse(
    padKey(appkey.split("").reverse().join(""))
  );
  let result = CryptoJS.AES.encrypt(padMsg(data), key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  }).toString();
  return encodeURIComponent(result);
}

export { startCapture };
