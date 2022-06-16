interface ErrorChallenge {
  errorStartChallengeTitle: string;
  errorStartChallengeMsg: string;
  errorStopChallengeTitle: string;
  errorStopChallengeMsg: string;
}

const ErrorChallenge: ErrorChallenge = {
  errorStartChallengeTitle: "Oops!",
  errorStartChallengeMsg:
    "Tivemos um problema ao tentar iniciar os desafios, mas podemos tentar novamente.",
  errorStopChallengeTitle: "Oops!",
  errorStopChallengeMsg: "Ocorreu um problema ao tentar validar os desafios.",
};

export default ErrorChallenge;
