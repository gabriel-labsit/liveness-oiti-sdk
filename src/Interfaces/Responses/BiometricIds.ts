interface BiometricIds {
  biometricCodID: string;
  100.1: string;
  100.2: string;
  100.3: string;
  100.4: string;
  100.5: string;
  100.6: string;
  200.1: string;
  300.1: string;
}

const BiometricIds: BiometricIds = {
  biometricCodID:
    "Não foram detectados movimentos corretos. Vamos repetir o processo.",
  100.1: "Face não encontrada.",
  100.2: "Posicionamento não frontal.",
  100.3: "Você está muito próximo a câmera.",
  100.4: "Você está muito longe da câmera.",
  100.5: "Existe mais de uma face nas imagens.",
  100.6: "Iluminação inadequada.",
  200.1:
    "Face enviada não é a face cadastrada, ou tem similar com cpf diferente.",
  300.1: "Você não executou os desafios de forma adequada.",
};

export default BiometricIds;
