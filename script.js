const e = (i) => {
  return document.getElementById(i);
};

class Problem {
  constructor(problem, answers, correctAnswer) {
    this.problem = problem;
    this.answers = answers;
    this.correctAnswer = correctAnswer;
  }
}

class ProblemConstructor {
  constructor(difficulty) {
    this.difficulty = difficulty;
  }

  getOperations() {
    const operations = ['+', '-'];

    if (this.difficulty == 'medium') {
      operations.push('*');
    }

    if (this.difficulty == 'hard') {
      operations.push('*');
      operations.push('/');
    }

    return operations;
  }

  getMultiplier() {
    if (this.difficulty == 'easy') {
      return 10;
    } else if (this.difficulty == 'medium') {
      return 50;
    } else if (this.difficulty == 'hard') {
      return 100;
    }
  }

  getConstraints() {
    if (this.difficulty == 'easy') {
      return (num) => {
        return num >= 0 && num <= 50;
      };
    } else if (this.difficulty == 'medium') {
      return (num) => {
        return num >= -25 && num <= 75;
      };
    } else if (this.difficulty == 'hard') {
      return (num) => {
        return num >= -50 && num <= 100;
      };
    }
  }

  createProblem() {
    const operations = this.getOperations();

    const first = Math.round(Math.random() * this.getMultiplier());
    const second = Math.round(Math.random() * this.getMultiplier());
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const problem = `${first} ${operation} ${second}`;
    const answer = eval(problem);
    const options = this.genOptions(answer);
    const correctAnswer = options.indexOf(answer);

    if (answer % 1 != 0) {
      return this.createProblem();
    }

    const constraintsFunc = this.getConstraints();

    if (!constraintsFunc(answer)) {
      return this.createProblem();
    }

    return new Problem(problem + ' =', options, correctAnswer);
  }

  genOption(num, num2) {
    let a = 0;

    if (Math.random() > 0.5) {
      a = num + Math.round(Math.random() * 10);
    } else {
      a = num - Math.round(Math.random() * 10);
    }

    if (a == num) {
      return this.genOption(num, num2);
    }

    if (a == num2) {
      return this.genOption(num, num2);
    }

    return a;
  }

  genOptions(answer) {
    const f = this.genOption(answer, -4959834);

    let options = [f, this.genOption(answer, f), answer];

    options = options.sort(() => Math.random() - 0.5);

    return options;
  }
}

const TIME_PENALTY = 5;

class GameResults {
  constructor(questions, correct) {
    this.questions = questions;
    this.correct = correct;
    this.incorrect = questions - correct;
  }

  answerQuestion(bl) {
    this.questions++;
    if (bl) {
      this.correct++;
    } else {
      this.incorrect++;
    }
  }

  calculatePercentage() {
    return Math.round((this.correct / this.questions) * 100);
  }

  calculatePenalty() {
    return this.incorrect * TIME_PENALTY;
  }
}

const difficulty = () => {
  return e('difficultyS').value;
};
const timer = () => {
  return e('time').value;
};

let results = null;

let currentProblem = null;

let bestScore = 0;
let oldScore = 0;

let currentScore = 0;
let currentTime = 0;
let interval = 0;

const question = () => {
  return e('question');
};
const summary = () => {
  return e('summary');
};
const start = () => {
  return e('start');
};

function showStart() {
  question().style.display = 'none';
  summary().style.display = 'none';
  start().style.display = 'block';
}

function showQuestion() {
  question().style.display = 'block';
  summary().style.display = 'none';
  start().style.display = 'none';
}

function showSummary() {
  question().style.display = 'none';
  summary().style.display = 'block';
  start().style.display = 'none';
}

function refreshQuestion() {
  e('currentProblem').innerText = currentProblem.problem;

  const buttons = [];

  currentProblem.answers.forEach((a, i) => {
    buttons.push(
      `<button onclick="checkAnswer(${i})" class="option-button">${a}</button>`
    );
  });

  e('answers').innerHTML = buttons.join('');
}

function startGame() {
  showQuestion();

  currentProblem = new ProblemConstructor(difficulty()).createProblem();

  startTimer();

  results = new GameResults(0, 0);

  refreshQuestion();
}

function endGame() {
  stopTimer();

  bestScore = Math.max(bestScore, currentScore);
  oldScore = currentScore;

  currentScore = 0;

  showSummary();
}

function checkAnswer(i) {
  if (
    currentProblem.answers[i] ==
    currentProblem.answers[currentProblem.correctAnswer]
  ) {
    currentScore++;
    results.answerQuestion(true);
  } else {
    currentTime -= TIME_PENALTY;
    results.answerQuestion(false);
  }

  currentProblem = new ProblemConstructor(difficulty).createProblem();

  checkTimer();
}

function formatTime(given_seconds) {
  const dateObj = new Date(given_seconds * 1000);
  const minutes = dateObj.getUTCMinutes();
  const seconds = dateObj.getSeconds();

  const timeString =
    minutes.toString().padStart(2, '0') +
    ':' +
    seconds.toString().padStart(2, '0');

  return timeString;
}

function startTimer() {
  currentTime = parseInt(timer());
  checkTimer();
  interval = setInterval(() => {
    currentTime -= 1;

    checkTimer();
  }, 1000);
}

function checkTimer() {
  e('rt').innerText = formatTime(currentTime);
  if (currentTime <= 0) {
    endGame();
  }
}

function stopTimer() {
  clearInterval(interval);
}
