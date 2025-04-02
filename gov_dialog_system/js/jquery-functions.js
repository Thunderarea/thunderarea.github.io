let currentQuestion = 0;
let totalQuestions = 0;
let userAnswers = {};
let all_questions = {};
let questionIds = [];
let questionsOrder = [];
let all_evidences;
let faq;
let navigationHistory = [];

//hide the form buttons when its necessary
function hideFormBtns() {
  $("#nextQuestion").hide();
  $("#backButton").hide();
}

//Once the form begins, the questions' data and length are fetched.
function getQuestions() {
  return fetch(`question-utils/all-questions-${currentLanguage}.json`)
    .then((response) => response.json())
    .then((data) => {
      all_questions = {};
      questionIds = [];
      data.forEach((question) => {
        all_questions[question.id] = question;
        questionIds.push(question.id);
      });
      totalQuestions = questionIds.length;
    })
    .catch((error) => {
      showFileFetchError(`all-questions-${currentLanguage}.json`, error);
    });
}

//Once the form begins, the evidences' data and length are fetched.
function getEvidences() {
  return fetch(`question-utils/cpsv-${currentLanguage}.json`)
    .then((response) => response.json())
    .then((data) => {
      all_evidences = data;
      totalEvidences = data.length;
    })
    .catch((error) => {
      showFileFetchError(`cpsv-${currentLanguage}.json`, error);
    });
}

function getFaq() {
  return fetch(`question-utils/faq-${currentLanguage}.json`)
    .then((response) => response.json())
    .then((data) => {
      faq = data;
      totalFaq = data.length;
    })
    .catch((error) => {
      showFileFetchError(`faq-${currentLanguage}.json`, error, false);
    });
}

async function getResultMessages() {
  try {
    const response = await fetch(`question-utils/result-messages-${currentLanguage}.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    showFileFetchError(`result-messages-${currentLanguage}.json`, error);
  }
}

function showFileFetchError(fileName, error, hideBtns = true) {
  console.error(`Failed to fetch ${fileName}:`, error);
  // Show error message to the user
  const errorMessage = document.createElement("div");
  errorMessage.textContent = `Error: Failed to fetch ${fileName}.`;
  $(".question-container").html(errorMessage);
  hideBtns && hideFormBtns();
}

//text added in the final result
function setResult(text) {
  const resultWrapper = document.getElementById("resultWrapper");
  const result = document.createElement("h5");
  result.textContent = text;
  resultWrapper.appendChild(result);
}

function loadFaqs() {
  var faqElement = document.createElement("div");

  faqElement.innerHTML = `
        <div class="govgr-heading-m language-component" data-component="faq" tabIndex="15">
          ${languageContent[currentLanguage].faqTitle}
        </div>
    `;

  var ft = 16;
  faq.forEach((faqItem) => {
    var faqSection = document.createElement("details");
    faqSection.className = "govgr-accordion__section";
    faqSection.tabIndex = ft;

    faqSection.innerHTML = `
        <summary class="govgr-accordion__section-summary">
          <h2 class="govgr-accordion__section-heading">
            <span class="govgr-accordion__section-button">
              ${faqItem.question}
            </span>
          </h2>
        </summary>
        <div class="govgr-accordion__section-content">
          <p class="govgr-body">
          ${convertURLsToLinks(faqItem.answer)}
          </p>
        </div>
      `;

    faqElement.appendChild(faqSection);
    ft++;
  });

  $(".faqContainer").html(faqElement);
}

// get the url from faqs and link it
function convertURLsToLinks(text) {
  const urlRegex = /(\bhttps?:\/\/[^\s<>"]+[^\s.,!?<>")\]])/gi;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

//Εachtime back/next buttons are pressed the form loads a question
function loadQuestion(noError) {
  $("#nextQuestion").show();
  if (currentQuestion > 0) {
    $("#backButton").show();
  }

  question = all_questions[questionIds[currentQuestion]];

  var questionElement = document.createElement("div");

  const optionsHTML = `
      ${question.options
        .map(
          (option, index) => `
            <div class='govgr-radios__item'>
                <label class='govgr-label govgr-radios__label'>
                    ${option.text}
                    <input class='govgr-radios__input' type='radio' name='question-option' value='${option.text}' />
                </label>
            </div>
          `
        )
        .join("")}
    `;

  //If the user has answered the question (checked a value), no error occurs. Otherwise you get an error (meaning that user needs to answer before he continues to the next question)!
  if (noError) {
    questionElement.innerHTML = `
                <div class='govgr-field'>
                    <fieldset class='govgr-fieldset' aria-describedby='radio-country'>
                        <legend role='heading' aria-level='1' class='govgr-fieldset__legend govgr-heading-l'>
                            ${question.question}
                        </legend>
                        <div class='govgr-radios' id='radios-${currentQuestion}'>
                            <ul>
                                ${optionsHTML}
                            </ul>
                        </div>
                    </fieldset>
                </div>
            `;
  } else {
    questionElement.innerHTML = `
            <div class='govgr-field govgr-field__error' id='$id-error'>
            <legend role='heading' aria-level='1' class='govgr-fieldset__legend govgr-heading-l'>
                        ${question.question}
                    </legend>
                <fieldset class='govgr-fieldset' aria-describedby='radio-error'>
                    <legend  class='govgr-fieldset__legend govgr-heading-m language-component' data-component='chooseAnswer'>
                        Επιλέξτε την απάντησή σας
                    </legend>
                    <p class='govgr-hint language-component' data-component='oneAnswer'>Μπορείτε να επιλέξετε μόνο μία επιλογή.</p>
                    <div class='govgr-radios id='radios-${currentQuestion}'>
                        <p class='govgr-error-message'>
                            <span class='govgr-visually-hidden language-component' data-component='errorAn'>Λάθος:</span>
                            <span class='language-component' data-component='choose'>Πρέπει να επιλέξετε μια απάντηση</span>
                        </p>
                            ${optionsHTML}
                    </div>
                </fieldset>
            </div>
        `;

    //The reason for manually updating the components of the <<error>> questionElement is because the
    //querySelectorAll method works on elements that are already in the DOM (Document Object Model)
    if (currentLanguage === "en") {
      // Manually update the english format of the last 4 text elements in change-language.js
      //chooseAnswer: "Choose your answer",
      //oneAnswer: "You can choose only one option.",
      //errorAn: "Error:",
      //choose: "You must choose one option"
      var components = Array.from(questionElement.querySelectorAll(".language-component"));
      components.slice(-4).forEach(function (component) {
        var componentName = component.dataset.component;
        component.textContent = languageContent[currentLanguage][componentName];
      });
    }
  }

  $(".question-container").html(questionElement);
}

function skipToEnd(message) {
  currentQuestion = -1;
  const errorEnd = document.createElement("h5");
  errorEnd.className = "govgr-error-summary";
  errorEnd.textContent = languageContent[currentLanguage].rejectionMessage + " " + message;
  $(".question-container").html(errorEnd);
  hideFormBtns();
}

function addEvidence(selectedEvidence) {
  const evidenceListElement = document.getElementById("evidences");
  selectedEvidence.evs.forEach((evsItem) => {
    const listItem = document.createElement("li");
    listItem.textContent = evsItem.name;
    evidenceListElement.appendChild(listItem);
  });
}

function conditionsAreMet(item, allAnswers) {
  return item.conditions.some((group) =>
    group.every((condition) => {
      const userAnswer = allAnswers[condition.question];
      if (userAnswer === undefined) return false; // Skip if the answer is not found
      const matches = condition.answer.includes(userAnswer);
      return condition.should ? matches : !matches;
    })
  );
}

function collectResults() {
  let allAnswers = {};

  Object.entries(userAnswers).forEach(([questionIndex, optionIndex]) => {
    allAnswers[questionIds[questionIndex]] = parseInt(optionIndex);
  });
  
  collectEvidences(allAnswers);
  collectResultMessages(allAnswers);
}

function collectEvidences(allAnswers) {
  all_evidences.forEach((evidence) => {
    if ("conditions" in evidence) {
      conditionsAreMet(evidence, allAnswers) && addEvidence(evidence);
    } else addEvidence(evidence);
  });
}

async function collectResultMessages(allAnswers) {
  const messages = await getResultMessages();
  messages.forEach((message) => {
    if ("conditions" in message) {
      conditionsAreMet(message, allAnswers) && setResult(message.text);
    } else setResult(message.text);
  });
}

function submitForm() {
  const resultWrapper = document.createElement("div");
  resultWrapper.innerHTML = `<h1 class='answer'>${languageContent[currentLanguage].eligibleMessage}</h1>`;
  resultWrapper.setAttribute("id", "resultWrapper");
  $(".question-container").html(resultWrapper);

  const evidenceListElement = document.createElement("ol");
  evidenceListElement.setAttribute("id", "evidences");
  $(".question-container").append(
    `<br /><br /><h5 class='answer'>${languageContent[currentLanguage].evidencesTitle}</h5><br />`
  );
  $(".question-container").append(evidenceListElement);
  $("#faqContainer").load("faq.html");
  collectResults();
  hideFormBtns();
}

function changeCurrentQuestion(newQuestionIndex, isFromBackButton = false) {
  currentQuestion = newQuestionIndex;

  if (currentQuestion + 1 == totalQuestions) {
    $("#nextQuestion").text(languageContent[currentLanguage].submit);
  } else if (isFromBackButton) {
    $("#nextQuestion").text(languageContent[currentLanguage].nextQuestion);
  }

  loadQuestion(true);

  if (isFromBackButton) {
    // Restore previously selected answer
    let answer = userAnswers[currentQuestion];
    if (answer > -1) {
      $('input[name="question-option"]').eq(answer).prop("checked", true);
    }
  }
}

function start() {
  // Get all questions
  getQuestions().then(() => {
    // Get all evidences
    getEvidences().then(() => {
      // Get all faqs
      getFaq().then(() => {
        // Code inside this block executes only after all data is fetched
        // load  faqs and the first question on page load
        loadFaqs();
        $("#faqContainer").show();
        loadQuestion(true);
      });
    });
  });
}

$("document").ready(function () {
  $("#startBtn").click(function () {
    $("#intro").html("");
    $("#languageBtn").hide();
    $("#questions-btns").show();
  });

  $("#nextQuestion").click(function () {
    if ($(".govgr-radios__input").is(":checked")) {
      let selectedOptionIndex = $('input[name="question-option"]').index($('input[name="question-option"]:checked'));
      let selectedOption = all_questions[questionIds[currentQuestion]].options[selectedOptionIndex];

      if ("skipToEnd" in selectedOption) {
        skipToEnd(selectedOption.skipToEnd);
      } else {
        //save selectedOptionIndex to the storage
        userAnswers[currentQuestion] = selectedOptionIndex;
        navigationHistory.push(currentQuestion);

        // Handle jumpTo
        if ("jumpTo" in selectedOption) {
          let targetIndex = questionIds.indexOf(selectedOption.jumpTo);
          if (targetIndex !== -1) {
            changeCurrentQuestion(targetIndex);
            return;
          } else {
            console.warn(`question in jumpTo was not found`);
          }
        }

        //if the questions are finished then...
        if (currentQuestion + 1 == totalQuestions) {
          submitForm();
        } else {
          changeCurrentQuestion(currentQuestion + 1);
        }
      }
    } else {
      loadQuestion(false);
    }
  });

  $("#backButton").click(function () {
    if (navigationHistory.length > 0) {
      changeCurrentQuestion(navigationHistory.pop(), true);
    }
  });

  $("#languageBtn").click(function () {
    toggleLanguage();
    loadFaqs();
    // if is false only when the user is skipedToEnd and trying change the language
    if (currentQuestion >= 0 && currentQuestion < totalQuestions - 1) loadQuestion(true);
  });

  $("#questions-btns").hide();

  start();
});
