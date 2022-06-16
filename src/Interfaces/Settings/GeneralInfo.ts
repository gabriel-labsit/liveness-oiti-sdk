// Intefaces
interface GeneralInformation {
  infoTitle: string;
  gettingStarted: string;
  wait: string;
  finishedTitle: string;
  finishedMsg: string;
}

interface NoCamera {
  title_noCamera: string;
  subTitle_noCamera: string;
  desc_NoCameraSuporte: string;
}

// Default Objects
const GeneralInformation: GeneralInformation = {
  infoTitle: "Informação",
  gettingStarted: "Iniciando...",
  wait: "Aguarde...",
  finishedTitle: "Finalizado",
  finishedMsg: "A validação biométrica foi finalizada.",
};

const NoCamera: NoCamera = {
  title_noCamera: "SEM PERMISSÕES DE ACESSO",
  subTitle_noCamera:
    "Ocorreu um problema ao tentar abrir a câmera, verifique as permissões de acesso do seu browser ou dispositivo",
  desc_NoCameraSuporte: "Este navegador não tem suporte de acesso a câmera.",
};

export { GeneralInformation, NoCamera };
