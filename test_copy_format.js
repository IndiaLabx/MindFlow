const q = {
  question: "What is <b>DNA</b>?",
  question_hi: "<b>DNA</b> क्या है?",
  options: ["Option 1", "Option 2"],
  options_hi: ["विकल्प 1", "विकल्प 2"]
}

const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};

// using simple regex since domparser is browser only
const stripHtmlRegex = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '');
};

const formatCopyText = (question) => {
    let text = `${stripHtmlRegex(question.question)}\n`;
    if (question.question_hi) {
        text += `${stripHtmlRegex(question.question_hi)}\n`;
    }

    text += "\n";

    question.options.forEach((opt, idx) => {
        text += `${idx + 1}. ${stripHtmlRegex(opt)}\n`;
        if (question.options_hi && question.options_hi[idx]) {
            text += `   ${stripHtmlRegex(question.options_hi[idx])}\n`;
        }
    });

    return text.trim();
}

console.log(formatCopyText(q));
