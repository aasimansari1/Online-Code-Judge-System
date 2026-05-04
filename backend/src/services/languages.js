// Maps our internal language codes to Judge0 language IDs.
// Reference: https://github.com/judge0/judge0/blob/master/CHANGELOG.md
const LANGUAGES = {
  cpp: { judge0Id: 54, label: 'C++ (GCC 9.2)', mode: 'cpp' },
  java: { judge0Id: 62, label: 'Java (OpenJDK 13)', mode: 'java' },
  python: { judge0Id: 71, label: 'Python (3.8)', mode: 'python' },
  javascript: { judge0Id: 63, label: 'JavaScript (Node 12)', mode: 'javascript' },
};

function isSupported(lang) {
  return Object.prototype.hasOwnProperty.call(LANGUAGES, lang);
}

function getJudge0Id(lang) {
  return LANGUAGES[lang]?.judge0Id;
}

module.exports = { LANGUAGES, isSupported, getJudge0Id };
