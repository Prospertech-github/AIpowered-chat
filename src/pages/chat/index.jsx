import React, { useEffect, useState } from "react";
import styles from "./chat.module.css";
import { Logo } from "../../assets";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useSummarizer from "../../hooks/useSummarizer";
import useDetector from "../../hooks/useDetector";
import useTranslate from "../../hooks/useTranslate";

const languages = [
  {
    name: "English",
    value: "en",
  },
  {
    name: "Portuguese",
    value: "pt",
  },
  {
    name: "Turkish",
    value: "tr",
  },
  {
    name: "French",
    value: "fr",
  },
  {
    name: "Spanish",
    value: "es",
  },
  {
    name: "Russian",
    value: "ru",
  },
];

const Chat = () => {
  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [translatedLanguage, setTranslatedLanguage] = useState("en");

  // Custome Hooks
  const { summarizeText, summarizedText, loading } = useSummarizer();
  const {aidetectedLanguage, detectMessageLanguage, languageTagToHumanReadable} = useDetector();
  const {translatedText, translateText, resetTranslation} = useTranslate()

  useEffect(()=>{
    detectMessageLanguage(submittedMessage)
    resetTranslation()
  },[submittedMessage])

  function displayMessage(e) {
    e.preventDefault();

    if (!message) toast.error("Empty message field. Kindly input a message");

    setSubmittedMessage(message);
    setMessage("");
  }

  return (
    <div>
      <header className={styles.header}>
        <img src={Logo} alt="Cognichat Logo" />
        <Link to="/"> Back to Home</Link>
      </header>

      <main>
        <div className={styles.inputArea}>
          <div className={styles.formArea}>
            <form onSubmit={displayMessage}>
              <textarea
                name="message"
                id="message"
                placeholder="Enter your message here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <button type="submit"> Send </button>
            </form>
          </div>

          {submittedMessage && (
            <div className={styles.displayArea}>
              <p className={styles.submittedMessage}> {submittedMessage} </p>
              {aidetectedLanguage && (
                <p className={styles.languageDetect}>
                  This is {aidetectedLanguage.confidence}% of{" "}
                  {aidetectedLanguage.languageValue}
                </p>
              )}

              {translatedText && (
                <TranslatedText
                  text={translatedText}
                  from={aidetectedLanguage.languageValue}
                  to={languageTagToHumanReadable(translatedLanguage, "en")}
                />
              )}

              {summarizedText && <SummarizedText text={summarizedText} />}

              <div className={styles.translateArea}>
                <p>Translate to: </p>
                <select
                  name="translatedLanguage"
                  value={translatedLanguage}
                  onChange={(e) => setTranslatedLanguage(e.target.value)}
                >
                  {languages.map((language) => (
                    <option value={language.value} key={language.value}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.btnArea}>
                <button
                  onClick={() => summarizeText(submittedMessage)}
                  disabled={loading}
                >
                  {loading ? "Summarizing" : "Summarize"}
                </button>
                <button onClick={()=> translateText(submittedMessage,  aidetectedLanguage.detectedLanguage, translatedLanguage)}>Translate</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export { Chat };

const TranslatedText = ({ text, from, to }) => (
  <div className={styles.translateTextArea}>
    <p className={styles.translatedText}>{text}</p>
    <p>
      (Translated from {from} to {to})
    </p>
  </div>
);

const SummarizedText = ({ text }) => (
  <div className={styles.translateTextArea}>
    <p className={styles.translatedText}>{text}</p>
    <p>
      Summarized version of your message
    </p>
  </div>
);
